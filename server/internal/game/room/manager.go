package room

import (
        "context"
        "fmt"
        "log"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

// CreateRoom 创建房间
// roomConfigID: 房间配置ID，用于关联房间配置表
func (rm *RoomManager) CreateRoom(client types.ClientInterface, roomConfigID uint64) (*Room, error) {
        rm.mu.Lock()
        defer rm.mu.Unlock()

        // 使用当前登录用户的 PlayerID
        creatorID := client.GetPlayerID()
        if creatorID == 0 {
                log.Printf("⚠️ 玩家 %s 的 PlayerID 为空，可能未正确登录", client.GetName())
        } else {
                // 关闭玩家之前的等待中房间（解决刷新页面后重新创建房间的问题）
                if err := database.ClosePlayerOldRooms(creatorID); err != nil {
                        log.Printf("⚠️ 关闭玩家旧房间失败: %v", err)
                }
        }

        // 生成唯一房间号
        code := rm.generateRoomCode()

        room := &Room{
                Code:        code,
                State:       RoomStateWaiting,
                Players:     make(map[string]*RoomPlayer),
                PlayerOrder: make([]string, 0, 3),
                CreatedAt:   time.Now(),
        }

        // 添加创建者
        player := &RoomPlayer{
                Client: client,
                Seat:   0,
                Ready:  false,
        }
        room.Players[client.GetID()] = player
        room.PlayerOrder = append(room.PlayerOrder, client.GetID())
        client.SetRoom(code)

        rm.rooms[code] = room

        // 获取房间配置信息
        var roomConfig *database.RoomConfig
        var err error
        if roomConfigID > 0 {
                roomConfig, err = database.GetRoomConfigByID(roomConfigID)
                if err != nil {
                        log.Printf("⚠️ 获取房间配置失败: %v, 使用默认配置", err)
                }
        }

        // 保存房间到分表
        // 生成房间名称：房{房间号}
        roomName := fmt.Sprintf("房%s", code)

        dbRoom := &database.PartitionRoom{
                RoomCode:     code,
                RoomName:     roomName,
                RoomConfigID: roomConfigID,
                RoomType:     1, // 默认普通场
                RoomCategory: 1, // 默认普通场
                CreatorID:    creatorID,
                PlayerCount:  1,
                MaxPlayers:   3,
                Status:       database.RoomStatusWaiting,
                BaseScore:    1,
                Multiplier:   1,
                CreatedAt:    time.Now(),
        }

        // 如果有房间配置，使用配置中的参数
        if roomConfig != nil {
                dbRoom.RoomType = roomConfig.RoomType
                dbRoom.RoomCategory = roomConfig.RoomCategory
                dbRoom.BaseScore = roomConfig.BaseScore
                dbRoom.Multiplier = roomConfig.Multiplier
                log.Printf("📋 使用房间配置 ID: %d, 类型: %d, 底分: %d", roomConfigID, roomConfig.RoomType, roomConfig.BaseScore)
        }

        if creatorID > 0 {
                dbRoom.Player1ID = &creatorID
        }

        // 使用分表保存房间
        if err := database.CreatePartitionRoom(dbRoom); err != nil {
                log.Printf("⚠️ 创建房间到分表失败: %v", err)
        } else {
                log.Printf("💾 房间 %s (名称: %s, 配置ID: %d) 已保存到分表，创建者ID: %d, 昵称: %s", code, roomName, roomConfigID, creatorID, client.GetName())
        }

        // 保存到 Redis
        if rm.redisStore != nil && rm.redisStore.IsReady() {
                ctx := context.Background()
                // 保存房间详情
                go func() { _ = rm.redisStore.SaveRoom(ctx, room.Code, room.ToRoomData()) }()
                // 添加到可加入房间列表
                go func() {
                        _ = rm.redisStore.AddToAvailableRooms(ctx, &storage.RoomListItemData{
                                RoomCode:    code,
                                PlayerCount: 1,
                                MaxPlayers:  3,
                                CreatedAt:   room.CreatedAt.Unix(),
                        })
                }()
        }

        // 广播房间列表更新 - 新房间
        if rm.onRoomListUpdate != nil {
                rm.onRoomListUpdate("add", &RoomListItem{
                        RoomCode:    code,
                        PlayerCount: 1,
                        MaxPlayers:  3,
                })
        }

        log.Printf("🏠 房间 %s 已创建，玩家 %s", code, client.GetName())

        return room, nil
}

// JoinRoom 加入房间
func (rm *RoomManager) JoinRoom(client types.ClientInterface, code string) (*Room, error) {
        rm.mu.Lock()
        defer rm.mu.Unlock()

        room, exists := rm.rooms[code]
        if !exists {
                return nil, apperrors.ErrRoomNotFound
        }

        room.mu.Lock()
        defer room.mu.Unlock()

        if len(room.Players) >= 3 {
                return nil, apperrors.ErrRoomFull
        }

        if room.State != RoomStateWaiting {
                return nil, apperrors.ErrGameStarted
        }

        // 分配座位
        seat := len(room.Players)
        player := &RoomPlayer{
                Client: client,
                Seat:   seat,
                Ready:  false,
        }
        room.Players[client.GetID()] = player
        room.PlayerOrder = append(room.PlayerOrder, client.GetID())
        client.SetRoom(code)

        playerCount := len(room.Players)

        log.Printf("👤 玩家 %s 加入房间 %s", client.GetName(), code)

        // 通知房间内其他玩家
        room.BroadcastExcept(client.GetID(), codec.MustNewMessage(protocol.MsgPlayerJoined, protocol.PlayerJoinedPayload{
                Player: room.GetPlayerInfo(client.GetID()),
        }))

        // 使用当前登录用户的 PlayerID 更新分表
        joinerID := client.GetPlayerID()
        if joinerID > 0 {
                if err := database.AddPlayerToPartitionRoom(code, joinerID, seat, room.CreatedAt); err != nil {
                        log.Printf("⚠️ 更新房间分表失败: %v", err)
                } else {
                        log.Printf("💾 房间 %s 玩家 %s (ID: %d) 已更新到分表", code, client.GetName(), joinerID)
                }
        } else {
                log.Printf("⚠️ 玩家 %s 的 PlayerID 为空，跳过数据库更新", client.GetName())
        }
        // 如果房间满了，更新状态
        if playerCount >= 3 {
                go database.UpdatePartitionRoomStatus(code, database.RoomStatusPlaying, room.CreatedAt)
        }

        // 保存到 Redis
        if rm.redisStore != nil && rm.redisStore.IsReady() {
                ctx := context.Background()
                // 保存房间详情
                go func() { _ = rm.redisStore.SaveRoom(ctx, room.Code, room.ToRoomData()) }()
                // 更新可加入房间列表（如果满了就从列表移除）
                go func() {
                        if playerCount >= 3 {
                                _ = rm.redisStore.RemoveFromAvailableRooms(ctx, code)
                        } else {
                                _ = rm.redisStore.UpdateAvailableRoom(ctx, &storage.RoomListItemData{
                                        RoomCode:    code,
                                        PlayerCount: playerCount,
                                        MaxPlayers:  3,
                                        CreatedAt:   room.CreatedAt.Unix(),
                                })
                        }
                }()
        }

        // 广播房间列表更新
        if rm.onRoomListUpdate != nil {
                if playerCount >= 3 {
                        // 房间满人，从列表移除
                        rm.onRoomListUpdate("remove", &RoomListItem{RoomCode: code})
                } else {
                        // 更新房间人数
                        rm.onRoomListUpdate("update", &RoomListItem{
                                RoomCode:    code,
                                PlayerCount: playerCount,
                                MaxPlayers:  3,
                        })
                }
        }

        return room, nil
}

// LeaveRoom 离开房间
func (rm *RoomManager) LeaveRoom(client types.ClientInterface) {
        roomCode := client.GetRoom()
        if roomCode == "" {
                return
        }

        rm.mu.Lock()
        room, exists := rm.rooms[roomCode]
        if !exists {
                rm.mu.Unlock()
                return
        }
        rm.mu.Unlock()

        room.mu.Lock()
        defer room.mu.Unlock()

        player, exists := room.Players[client.GetID()]
        if !exists {
                return
        }

        // 通知其他玩家
        room.BroadcastExcept(client.GetID(), codec.MustNewMessage(protocol.MsgPlayerLeft, protocol.PlayerLeftPayload{
                PlayerID:   client.GetID(),
                PlayerName: client.GetName(),
        }))

        // 移除玩家
        delete(room.Players, client.GetID())
        // 从顺序列表中移除
        for i, id := range room.PlayerOrder {
                if id == client.GetID() {
                        room.PlayerOrder = append(room.PlayerOrder[:i], room.PlayerOrder[i+1:]...)
                        break
                }
        }
        client.SetRoom("")

        log.Printf("👋 玩家 %s 离开房间 %s (座位 %d)", client.GetName(), roomCode, player.Seat)

        // 如果房间空了，删除房间
        if len(room.Players) == 0 {
                rm.mu.Lock()
                delete(rm.rooms, roomCode)
                rm.mu.Unlock()
                // 从 Redis 删除
                if rm.redisStore != nil && rm.redisStore.IsReady() {
                        ctx := context.Background()
                        go func() {
                                _ = rm.redisStore.DeleteRoom(ctx, roomCode)
                                _ = rm.redisStore.RemoveFromAvailableRooms(ctx, roomCode)
                        }()
                }
                // 广播房间列表更新 - 房间解散
                if rm.onRoomListUpdate != nil {
                        rm.onRoomListUpdate("remove", &RoomListItem{RoomCode: roomCode})
                }
                log.Printf("🏠 房间 %s 已解散", roomCode)
        } else {
                playerCount := len(room.Players)
                if rm.redisStore != nil && rm.redisStore.IsReady() {
                        ctx := context.Background()
                        // 保存房间详情
                        go func() { _ = rm.redisStore.SaveRoom(ctx, room.Code, room.ToRoomData()) }()
                        // 更新可加入房间列表
                        go func() {
                                _ = rm.redisStore.UpdateAvailableRoom(ctx, &storage.RoomListItemData{
                                        RoomCode:    roomCode,
                                        PlayerCount: playerCount,
                                        MaxPlayers:  3,
                                        CreatedAt:   room.CreatedAt.Unix(),
                                })
                        }()
                }
                // 广播房间列表更新 - 更新房间人数
                if rm.onRoomListUpdate != nil {
                        rm.onRoomListUpdate("update", &RoomListItem{
                                RoomCode:    roomCode,
                                PlayerCount: playerCount,
                                MaxPlayers:  3,
                        })
                }
        }
}

// SetPlayerReady 设置玩家准备状态
func (rm *RoomManager) SetPlayerReady(client types.ClientInterface, ready bool) error {
        roomCode := client.GetRoom()
        if roomCode == "" {
                return apperrors.ErrNotInRoom
        }

        rm.mu.RLock()
        room, exists := rm.rooms[roomCode]
        rm.mu.RUnlock()
        if !exists {
                return apperrors.ErrRoomNotFound
        }

        room.mu.Lock()
        defer room.mu.Unlock()

        player, exists := room.Players[client.GetID()]
        if !exists {
                return apperrors.ErrNotInRoom
        }

        player.Ready = ready

        // 广播准备状态
        room.Broadcast(codec.MustNewMessage(protocol.MsgPlayerReady, protocol.PlayerReadyPayload{
                PlayerID: client.GetID(),
                Ready:    ready,
        }))

        // 检查是否所有人都准备好了
        if room.checkAllReady() {
                if err := room.startGameLocked(); err != nil {
                        log.Printf("开始游戏失败: %v", err)
                        return nil
                }

                // 创建游戏会话并开始
                if rm.onGameStart != nil {
                        rm.onGameStart(room)
                }

                // 保存房间状态，并从可加入列表移除
                if rm.redisStore != nil && rm.redisStore.IsReady() {
                        ctx := context.Background()
                        go func() {
                                _ = rm.redisStore.SaveRoom(ctx, room.Code, room.ToRoomData())
                                // 游戏开始，从可加入房间列表移除
                                _ = rm.redisStore.RemoveFromAvailableRooms(ctx, roomCode)
                        }()
                }

                // 广播房间列表更新 - 游戏开始，移除房间
                if rm.onRoomListUpdate != nil {
                        rm.onRoomListUpdate("remove", &RoomListItem{RoomCode: roomCode})
                }
        }

        return nil
}

func (rm *RoomManager) SetOnGameStart(callback func(*Room)) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        rm.onGameStart = callback
}

// GetRoom 获取房间
func (rm *RoomManager) GetRoom(code string) *Room {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        return rm.rooms[code]
}

// GetRoomList 获取可加入的房间列表
func (rm *RoomManager) GetRoomList() []protocol.RoomListItem {
        // 优先从 Redis 获取（如果可用）
        if rm.redisStore != nil && rm.redisStore.IsReady() {
                ctx := context.Background()
                rooms, err := rm.redisStore.GetAvailableRooms(ctx)
                if err == nil && len(rooms) > 0 {
                        result := make([]protocol.RoomListItem, 0, len(rooms))
                        for _, r := range rooms {
                                // 再次验证房间状态（防止Redis和内存不一致）
                                if room := rm.GetRoom(r.RoomCode); room != nil {
                                        room.mu.RLock()
                                        if room.State == RoomStateWaiting && len(room.Players) < 3 && len(room.Players) > 0 {
                                                result = append(result, protocol.RoomListItem{
                                                        RoomCode:    r.RoomCode,
                                                        PlayerCount: len(room.Players),
                                                        MaxPlayers:  3,
                                                })
                                        }
                                        room.mu.RUnlock()
                                }
                        }
                        return result
                }
        }

        // 从内存获取
        rm.mu.RLock()
        defer rm.mu.RUnlock()

        var rooms []protocol.RoomListItem
        for code, room := range rm.rooms {
                room.mu.RLock()
                // 只返回等待中且未满的房间，且至少有1人
                if room.State == RoomStateWaiting && len(room.Players) < 3 && len(room.Players) > 0 {
                        rooms = append(rooms, protocol.RoomListItem{
                                RoomCode:    code,
                                PlayerCount: len(room.Players),
                                MaxPlayers:  3,
                        })
                }
                room.mu.RUnlock()
        }
        return rooms
}

// GetRoomByPlayerID 通过玩家 ID 获取房间
func (rm *RoomManager) GetRoomByPlayerID(playerID string) *Room {
        rm.mu.RLock()
        defer rm.mu.RUnlock()

        for _, room := range rm.rooms {
                room.mu.RLock()
                _, exists := room.Players[playerID]
                room.mu.RUnlock()
                if exists {
                        return room
                }
        }
        return nil
}

// GetActiveGamesCount 获取进行中的游戏数量
func (rm *RoomManager) GetActiveGamesCount() int {
        rm.mu.RLock()
        defer rm.mu.RUnlock()

        count := 0
        for _, room := range rm.rooms {
                room.mu.RLock()
                // 只统计正在游戏中的房间（叫地主、出牌）
                // RoomStateEnded 不计入，因为游戏已结束只是等待清理
                switch room.State {
                case RoomStateBidding, RoomStatePlaying:
                        count++
                }
                room.mu.RUnlock()
        }
        return count
}
