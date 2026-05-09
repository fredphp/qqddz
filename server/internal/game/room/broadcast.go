package room

import (
        "errors"
        "log"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
)

// --- Room 方法 ---

// Broadcast 广播消息给房间内所有玩家
func (r *Room) Broadcast(msg *protocol.Message) {
        for _, player := range r.Players {
                if player.Client != nil {
                        player.Client.SendMessage(msg)
                }
        }
}

// broadcastExcept 广播消息给除指定玩家外的所有玩家
func (r *Room) BroadcastExcept(excludeID string, msg *protocol.Message) {
        log.Printf("📢 [BroadcastExcept] 开始广播，排除玩家: %s, 房间总人数: %d", excludeID, len(r.Players))

        sentCount := 0
        for id, player := range r.Players {
                if id != excludeID {
                        if player.Client != nil {
                                log.Printf("📢 [BroadcastExcept] 发送消息给玩家: %s (ID: %s)", player.Client.GetName(), id)
                                player.Client.SendMessage(msg)
                                sentCount++
                        } else {
                                log.Printf("📢 [BroadcastExcept] 跳过已断开的玩家: ID: %s", id)
                        }
                }
        }

        log.Printf("📢 [BroadcastExcept] 广播完成，实际发送: %d 人", sentCount)
}

// checkAllReady 检查是否所有玩家都准备好
func (r *Room) checkAllReady() bool {
        if len(r.Players) < 3 {
                log.Printf("⚠️ [checkAllReady] 玩家数量不足: %d < 3", len(r.Players))
                return false
        }
        for id, player := range r.Players {
                if !player.Ready {
                        log.Printf("⚠️ [checkAllReady] 玩家 %s 未准备", id)
                        return false
                }
        }
        log.Printf("✅ [checkAllReady] 所有玩家已准备，共 %d 人", len(r.Players))
        return true
}

// GetPlayerInfo 获取玩家信息
func (r *Room) GetPlayerInfo(playerID string) protocol.PlayerInfo {
        player := r.Players[playerID]
        cardsCount := 0

        // 检查 player 和 Client 是否为空
        if player == nil {
                log.Printf("⚠️ [GetPlayerInfo] 玩家 %s 不存在", playerID)
                return protocol.PlayerInfo{
                        ID:         playerID,
                        Name:       "未知玩家",
                        Avatar:     "",
                        Seat:       0,
                        Ready:      false,
                        IsLandlord: false,
                        CardsCount: cardsCount,
                        GoldCount:  0,
                        MatchCoin:  0,
                }
        }

        if player.Client == nil {
                log.Printf("⚠️ [GetPlayerInfo] 玩家 %s 的 Client 为空（已断开）", playerID)
                return protocol.PlayerInfo{
                        ID:         playerID,
                        Name:       "已断开玩家",
                        Avatar:     "",
                        Seat:       player.Seat,
                        Ready:      player.Ready,
                        IsLandlord: player.IsLandlord,
                        CardsCount: cardsCount,
                        GoldCount:  0,
                        MatchCoin:  0,
                }
        }

        // 获取玩家基本信息
        goldCount := player.Client.GetGold()
        playerName := player.Client.GetName()
        playerDBID := player.Client.GetPlayerID()
        var avatar string
        var matchCoin int64 = 0 // 🔧【新增】竞技币
        
        log.Printf("🔍 [GetPlayerInfo] 玩家UUID=%s, 昵称=%s, PlayerID=%d, 当前缓存金币=%d", playerID, playerName, playerDBID, goldCount)
        
        // 🔧【修复】从数据库获取最新玩家信息（金币、头像等）
        db := database.DB()
        if db != nil {
                // 优先通过 PlayerID 查询
                if playerDBID > 0 {
                        var dbPlayer database.Player
                        if err := db.First(&dbPlayer, playerDBID).Error; err != nil {
                                log.Printf("⚠️ [GetPlayerInfo] 通过PlayerID查询失败: %v, PlayerID: %d", err, playerDBID)
                        } else {
                                goldCount = dbPlayer.Gold
                                avatar = dbPlayer.Avatar
                                player.Client.SetGold(goldCount)
                                log.Printf("✅ [GetPlayerInfo] 通过PlayerID=%d 获取玩家信息: 金币=%d, 头像=%s", playerDBID, goldCount, avatar)
                        }
                } else if playerName != "" {
                        // PlayerID 为 0 时，通过昵称查询
                        var dbPlayer database.Player
                        if err := db.Where("nickname = ?", playerName).First(&dbPlayer).Error; err != nil {
                                log.Printf("⚠️ [GetPlayerInfo] 通过昵称查询失败: %v, 昵称: %s", err, playerName)
                        } else {
                                goldCount = dbPlayer.Gold
                                avatar = dbPlayer.Avatar
                                player.Client.SetPlayerID(dbPlayer.ID)
                                player.Client.SetGold(goldCount)
                                log.Printf("✅ [GetPlayerInfo] 通过昵称=%s 获取玩家信息: 金币=%d, 头像=%s, PlayerID: %d", playerName, goldCount, avatar, dbPlayer.ID)
                        }
                }
                
                // 🔧【新增】竞技场模式下获取玩家竞技币
                // 🔧【重构】现在从 ddz_arena_participations.match_coin 获取赛事金币
                log.Printf("🔍 [GetPlayerInfo] 检查竞技场模式: RoomCategory=%d, PeriodNo=%s, playerDBID=%d", r.RoomCategory, r.PeriodNo, playerDBID)
                if r.RoomCategory == 2 && r.PeriodNo != "" && playerDBID > 0 {
                        // 从参赛表获取 match_coin
                        if arenaGold, err := database.GetArenaGold(r.PeriodNo, playerDBID); err != nil {
                                log.Printf("⚠️ [GetPlayerInfo] 获取赛事金币失败: period_no=%s, player_id=%d, err=%v", r.PeriodNo, playerDBID, err)
                        } else {
                                matchCoin = arenaGold
                                log.Printf("✅ [GetPlayerInfo] 竞技场模式: 玩家 %d 的赛事金币=%d (period_no=%s)", playerDBID, matchCoin, r.PeriodNo)
                        }
                } else if r.RoomCategory == 2 && r.ArenaSessionID > 0 && playerDBID > 0 {
                        // 兼容：如果没有 PeriodNo，尝试从 ArenaParticipation 获取
                        var participation database.ArenaParticipation
                        if err := db.Where("session_id = ? AND player_id = ?", r.ArenaSessionID, playerDBID).First(&participation).Error; err != nil {
                                log.Printf("⚠️ [GetPlayerInfo] 获取竞技币失败: session_id=%d, player_id=%d, err=%v", r.ArenaSessionID, playerDBID, err)
                        } else {
                                matchCoin = participation.MatchCoin
                                log.Printf("✅ [GetPlayerInfo] 竞技场模式(兼容): 玩家 %d 的竞技币=%d", playerDBID, matchCoin)
                        }
                }
        } else {
                log.Printf("⚠️ [GetPlayerInfo] 数据库连接为空，使用缓存金币: %d", goldCount)
        }

        log.Printf("📤 [GetPlayerInfo] 返回玩家信息: UUID=%s, 昵称=%s, 头像=%s, 金币=%d, 竞技币=%d", playerID, playerName, avatar, goldCount, matchCoin)

        // 游戏会话由外部调用方管理，此处暂不传入
        return protocol.PlayerInfo{
                ID:         player.Client.GetID(),
                Name:       playerName,
                Avatar:     avatar,
                Seat:       player.Seat,
                Ready:      player.Ready,
                IsLandlord: player.IsLandlord,
                CardsCount: cardsCount,
                GoldCount:  goldCount,
                MatchCoin:  matchCoin,   // 🔧【新增】竞技币
                ArenaGold:  matchCoin,   // 🔧【新增】当期赛事金币（与 match_coin 相同，用于客户端显示）
                PeriodNo:   r.PeriodNo,  // 🔧【新增】期号
        }
}

// GetAllPlayersInfo 获取所有玩家信息
func (r *Room) GetAllPlayersInfo() []protocol.PlayerInfo {
        infos := make([]protocol.PlayerInfo, 0, len(r.Players))
        for _, id := range r.PlayerOrder {
                infos = append(infos, r.GetPlayerInfo(id))
        }
        return infos
}

// StartGame 准备开始游戏（不创建GameSession，由外部管理）
// 注意：调用者负责保存到 Redis
func (r *Room) StartGame() error {
        r.mu.Lock()
        defer r.mu.Unlock()
        return r.startGameLocked()
}

// startGameLocked 开始游戏（调用者已持有锁时使用）
func (r *Room) startGameLocked() error {
        log.Printf("🎮 [startGameLocked] 尝试开始游戏, 房间状态: %v, 玩家数: %d", r.State, len(r.Players))

        if r.State != RoomStateWaiting || len(r.Players) < 3 {
                log.Printf("❌ [startGameLocked] 条件不满足: State=%v (需要 Waiting), Players=%d (需要 >=3)", r.State, len(r.Players))
                return errors.New("cannot start game: room not ready or not enough players")
        }

        r.State = RoomStateReady
        log.Printf("🎮 [startGameLocked] 房间状态已更新为 RoomStateReady")

        // ============================================================
        // 【核心】阶段控制消息（服务端权威驱动）
        // ============================================================

        // 1. 广播准备阶段开始
        r.Broadcast(codec.MustNewMessage(protocol.MsgReadyStart, &protocol.PhaseStartPayload{
                Phase: "ready",
        }))
        log.Printf("🎮 [startGameLocked] 已发送 ready_start")

        // 2. 广播游戏开始
        players := r.GetAllPlayersInfo()
        log.Printf("🎮 [startGameLocked] 广播游戏开始给 %d 个玩家, RoomCategory=%d, PeriodNo=%s", len(players), r.RoomCategory, r.PeriodNo)
        r.Broadcast(codec.MustNewMessage(protocol.MsgGameStart, &protocol.GameStartPayload{
                Players:      players,
                RoomCategory: r.RoomCategory, // 🔧【新增】房间分类
                PeriodNo:     r.PeriodNo,     // 🔧【新增】期号
        }))

        return nil
}
