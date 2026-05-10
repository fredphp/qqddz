package room

import (
        "context"
        "log"
        "math/rand/v2"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

// SetAllPlayersReady 设置所有玩家准备状态
func (r *Room) SetAllPlayersReady() {
        r.mu.Lock()
        defer r.mu.Unlock()
        for _, player := range r.Players {
                player.Ready = true
        }
}

// NotifyPlayerOffline 处理玩家掉线
// 核心逻辑：
// 1. 等待状态：从房间移除玩家，如果房间为空则销毁
// 2. 游戏状态：开启机器人托管，游戏继续进行
func (rm *RoomManager) NotifyPlayerOffline(client types.ClientInterface) {
        roomCode := client.GetRoom()
        if roomCode == "" {
                return
        }

        rm.mu.RLock()
        room, exists := rm.rooms[roomCode]
        rm.mu.RUnlock()
        if !exists {
                return
        }

        room.mu.Lock()
        defer room.mu.Unlock()

        // 检查玩家是否在房间中
        player, exists := room.Players[client.GetID()]
        if !exists {
                return
        }

        log.Printf("📴 玩家掉线: %s (房间: %s, 状态: %s)", client.GetName(), roomCode, room.State.String())

        switch room.State {
        case RoomStateWaiting, RoomStateReady:
                // 等待状态：直接移除玩家
                rm.handleOfflineInWaitingRoom(room, player, client)

        case RoomStateBidding, RoomStatePlaying:
                // 游戏进行中：开启机器人托管
                rm.handleOfflineInGame(room, player, client)

        case RoomStateFinished:
                // 游戏已结束：检查是否需要销毁房间
                rm.checkRoomDestroyAfterGame(room)

        case RoomStateEnded:
                // 房间已销毁，无需处理
        }
}

// handleOfflineInWaitingRoom 处理等待房间中的玩家掉线
func (rm *RoomManager) handleOfflineInWaitingRoom(room *Room, player *RoomPlayer, client types.ClientInterface) {
        roomCode := room.Code

        // 检查是否为房主
        isCreator := len(room.PlayerOrder) > 0 && room.PlayerOrder[0] == client.GetID()

        // 通知其他在线玩家
        for id, p := range room.Players {
                if id != client.GetID() && p.Client != nil {
                        p.Client.SendMessage(codec.MustNewMessage(protocol.MsgPlayerOffline, &protocol.PlayerOfflinePayload{
                                PlayerID:   client.GetID(),
                                PlayerName: client.GetName(),
                                Timeout:    0, // 等待状态下不需要等待重连
                        }))
                }
        }

        // 如果是房主断开，解散整个房间
        if isCreator {
                log.Printf("🏠 房主 %s 断开连接，解散房间 %s", client.GetName(), roomCode)
                rm.destroyRoom(room, "房主已离开，房间已解散")
                return
        }

        // 非房主断开：从房间移除玩家
        delete(room.Players, client.GetID())
        for i, id := range room.PlayerOrder {
                if id == client.GetID() {
                        room.PlayerOrder = append(room.PlayerOrder[:i], room.PlayerOrder[i+1:]...)
                        break
                }
        }
        client.SetRoom("")

        // 检查房间是否为空
        if len(room.Players) == 0 {
                log.Printf("🧹 房间 %s 所有玩家已离开，销毁房间", roomCode)
                rm.destroyRoom(room, "所有玩家已离开")
                return
        }

        // 更新数据库和Redis
        playerCount := len(room.Players)
        roomCreatedAt := room.CreatedAt

        // 更新数据库房间玩家数
        if playerID := client.GetPlayerID(); playerID > 0 {
                if err := database.RemovePlayerFromPartitionRoom(roomCode, playerID, roomCreatedAt); err != nil {
                        log.Printf("⚠️ 更新房间分表失败: %v", err)
                }
                // 🔧【新增】更新房间玩家分表（设置离开时间）
                if err := database.RemovePartitionRoomPlayer(roomCode, playerID, roomCreatedAt); err != nil {
                        log.Printf("⚠️ 更新房间玩家分表失败: %v", err)
                }
        }

        // 更新 Redis
        if rm.store != nil && rm.store.IsReady() {
                ctx := context.Background()
                go func() {
                        _ = rm.store.SaveRoom(ctx, roomCode, room.ToRoomData())
                        _ = rm.store.UpdateAvailableRoom(ctx, &storage.RoomListItemData{
                                RoomCode:    roomCode,
                                PlayerCount: playerCount,
                                MaxPlayers:  3,
                                CreatedAt:   roomCreatedAt.Unix(),
                        })
                }()
        }

        // 广播房间列表更新
        if rm.onRoomListUpdate != nil {
                rm.onRoomListUpdate("update", &RoomListItem{
                        RoomCode:    roomCode,
                        PlayerCount: playerCount,
                        MaxPlayers:  3,
                })
        }

        log.Printf("📤 房间 %s 剩余玩家: %d", roomCode, playerCount)
}

// handleOfflineInGame 处理游戏进行中的玩家掉线
// 核心逻辑：开启机器人托管，游戏继续进行
func (rm *RoomManager) handleOfflineInGame(room *Room, player *RoomPlayer, client types.ClientInterface) {
        roomCode := room.Code

        // 标记玩家为机器人托管状态
        player.SetRobot()
        player.Client = nil // 清空客户端引用

        log.Printf("🤖 机器人接管: %s (房间: %s, 状态: %s)", client.GetName(), roomCode, room.State.String())

        // 🔧【新增】更新房间玩家分表离线状态
        if playerID := client.GetPlayerID(); playerID > 0 {
                if err := database.UpdatePartitionRoomPlayerOffline(roomCode, playerID, true, room.CreatedAt); err != nil {
                        log.Printf("⚠️ 更新房间玩家离线状态失败: %v", err)
                }
        }

        // 通知其他玩家
        for id, p := range room.Players {
                if id != client.GetID() && p.Client != nil {
                        p.Client.SendMessage(codec.MustNewMessage(protocol.MsgPlayerOffline, &protocol.PlayerOfflinePayload{
                                PlayerID:   client.GetID(),
                                PlayerName: client.GetName(),
                                Timeout:    rm.gameConfig.OfflineWaitTimeout,
                        }))
                }
        }

        // 检查是否所有玩家都是机器人托管
        allRobot := true
        for _, p := range room.Players {
                if p.State == PlayerStateOnline {
                        allRobot = false
                        break
                }
        }

        if allRobot {
                log.Printf("🤖 房间 %s 所有玩家已机器人托管，游戏继续进行", roomCode)
                // 不销毁房间，让机器人继续打完
        }

        // 触发机器人托管回调（如果设置了）
        // 由 GameSession 处理机器人的自动操作
}

// handleGameFinished 处理游戏结束后的房间状态
func (rm *RoomManager) handleGameFinished(room *Room) {
        room.mu.Lock()
        defer room.mu.Unlock()

        room.State = RoomStateFinished
        log.Printf("🏁 房间 %s 游戏结束", room.Code)

        rm.checkRoomDestroyAfterGame(room)
}

// checkRoomDestroyAfterGame 检查游戏结束后是否需要销毁房间
func (rm *RoomManager) checkRoomDestroyAfterGame(room *Room) {
        // 检查是否有在线玩家
        hasOnlinePlayer := false
        for _, p := range room.Players {
                if p.State == PlayerStateOnline {
                        hasOnlinePlayer = true
                        break
                }
        }

        if !hasOnlinePlayer {
                // 没有在线玩家，销毁房间
                log.Printf("🧹 房间 %s 游戏结束且无在线玩家，销毁房间", room.Code)
                rm.destroyRoom(room, "游戏结束，无在线玩家")
        } else {
                // 还有在线玩家，重置房间状态为等待
                room.State = RoomStateWaiting
                // 重置玩家状态
                for _, p := range room.Players {
                        p.Ready = false
                        p.IsLandlord = false
                        if p.State == PlayerStateRobot {
                                p.State = PlayerStateOffline // 机器人变回离线状态
                        }
                }
                log.Printf("🔄 房间 %s 重置为等待状态", room.Code)
        }
}

// destroyRoom 销毁房间
func (rm *RoomManager) destroyRoom(room *Room, reason string) {
        roomCode := room.Code
        roomCreatedAt := room.CreatedAt

        // 通知所有玩家房间已关闭
        room.Broadcast(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, reason))

        // 清理玩家状态
        for _, p := range room.Players {
                if p.Client != nil {
                        p.Client.SetRoom("")
                }
        }

        // 更新数据库房间状态
        if err := database.UpdatePartitionRoomStatus(roomCode, database.RoomStatusClosed, roomCreatedAt); err != nil {
                log.Printf("⚠️ 更新房间状态失败: %v", err)
        }

        // 从 Redis 删除
        if rm.store != nil && rm.store.IsReady() {
                ctx := context.Background()
                go func() {
                        _ = rm.store.DeleteRoom(ctx, roomCode)
                        _ = rm.store.RemoveFromAvailableRooms(ctx, roomCode)
                }()
        }

        // 广播房间列表更新
        if rm.onRoomListUpdate != nil {
                rm.onRoomListUpdate("remove", &RoomListItem{RoomCode: roomCode})
        }

        // 标记房间为已结束状态
        room.State = RoomStateEnded

        // 从管理器中删除
        rm.mu.Lock()
        delete(rm.rooms, roomCode)
        rm.mu.Unlock()

        log.Printf("🗑️ 房间销毁: %s (原因: %s)", roomCode, reason)
}

// ReconnectPlayer 玩家重连到房间
func (rm *RoomManager) ReconnectPlayer(oldClient, newClient types.ClientInterface) error {
        roomCode := oldClient.GetRoom()
        if roomCode == "" {
                return nil // 不在房间中，无需重连
        }

        rm.mu.RLock()
        room, exists := rm.rooms[roomCode]
        rm.mu.RUnlock()
        if !exists {
                return apperrors.ErrRoomNotFound
        }

        room.mu.Lock()
        defer room.mu.Unlock()

        player, exists := room.Players[oldClient.GetID()]
        if !exists {
                return apperrors.ErrNotInRoom
        }

        // 恢复玩家在线状态
        player.SetOnline(newClient)
        newClient.SetRoom(roomCode)

        log.Printf("📶 玩家重连: %s (房间: %s, 状态: %s)", newClient.GetName(), roomCode, room.State.String())

        // 如果玩家之前是机器人托管，停止机器人
        if player.IsRobot() {
                log.Printf("🛑 停止机器人托管: %s", newClient.GetName())
        }

        // 通知其他玩家该玩家已上线
        for id, p := range room.Players {
                if id != newClient.GetID() && p.Client != nil {
                        p.Client.SendMessage(codec.MustNewMessage(protocol.MsgPlayerOnline, &protocol.PlayerOnlinePayload{
                                PlayerID:   newClient.GetID(),
                                PlayerName: newClient.GetName(),
                        }))
                }
        }

        return nil
}

// generateRoomCode 生成房间号
func (rm *RoomManager) generateRoomCode() string {
        for {
                code := make([]byte, roomCodeLength)
                for i := range code {
                        code[i] = roomCodeChars[rand.IntN(len(roomCodeChars))]
                }
                codeStr := string(code)
                if _, exists := rm.rooms[codeStr]; !exists {
                        return codeStr
                }
        }
}

// cleanupLoop 定期清理超时房间
func (rm *RoomManager) cleanupLoop() {
        ticker := time.NewTicker(1 * time.Minute)
        defer ticker.Stop()

        for range ticker.C {
                rm.cleanup()
        }
}

// cleanup 清理超时房间和需要清理的房间
func (rm *RoomManager) cleanup() {
        rm.mu.Lock()
        defer rm.mu.Unlock()

        now := time.Now()

        for code, room := range rm.rooms {
                room.mu.RLock()

                // 检查所有玩家是否都已断开连接或机器人托管
                allDisconnected := true
                for _, p := range room.Players {
                        if p.State == PlayerStateOnline {
                                allDisconnected = false
                                break
                        }
                }

                shouldCleanup := false
                reason := ""

                // 清理条件1：等待状态且超时
                if room.State == RoomStateWaiting && now.Sub(room.CreatedAt) > rm.roomTimeout {
                        shouldCleanup = true
                        reason = "房间超时"
                }

                // 清理条件2：游戏结束且所有玩家断开
                if room.State == RoomStateFinished && allDisconnected {
                        shouldCleanup = true
                        reason = "游戏结束，所有玩家已断开"
                }

                // 清理条件3：等待/准备状态且所有玩家断开
                if (room.State == RoomStateWaiting || room.State == RoomStateReady) && allDisconnected {
                        shouldCleanup = true
                        reason = "所有玩家已断开连接"
                }

                room.mu.RUnlock()

                if shouldCleanup {
                        roomCreatedAt := room.CreatedAt

                        // 通知所有在线玩家房间已关闭
                        room.Broadcast(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, "房间已关闭: "+reason))

                        // 清理玩家状态
                        for _, p := range room.Players {
                                if p.Client != nil {
                                        p.Client.SetRoom("")
                                }
                        }

                        // 更新数据库房间状态
                        if err := database.UpdatePartitionRoomStatus(code, database.RoomStatusClosed, roomCreatedAt); err != nil {
                                log.Printf("⚠️ 更新房间状态失败: %v", err)
                        }

                        // 从 Redis 删除
                        if rm.store != nil && rm.store.IsReady() {
                                ctx := context.Background()
                                go func() {
                                        _ = rm.store.DeleteRoom(ctx, code)
                                        _ = rm.store.RemoveFromAvailableRooms(ctx, code)
                                }()
                        }

                        // 广播房间列表更新
                        if rm.onRoomListUpdate != nil {
                                rm.onRoomListUpdate("remove", &RoomListItem{RoomCode: code})
                        }

                        delete(rm.rooms, code)
                        log.Printf("🗑️ 房间清理: %s (原因: %s)", code, reason)
                }
        }
}

// OnGameEnd 游戏结束回调（供外部调用）
func (rm *RoomManager) OnGameEnd(room *Room) {
        rm.handleGameFinished(room)
}

// SerializeForRedis 为Redis序列化准备数据（提供只读访问）
func (r *Room) SerializeForRedis(serialize func()) {
        r.mu.RLock()
        defer r.mu.RUnlock()
        serialize()
}
