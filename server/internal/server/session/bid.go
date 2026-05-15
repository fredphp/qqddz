package session

import (
        "log"
        "math/rand/v2"
        "sort"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// ============================================================
// 【核心】抢地主规则实现
// 规则说明：
// 1. 第一轮：A→B→C 三人依次操作
// 2. 如果所有人都不抢 → 重新发牌
// 3. 如果有人抢，进入第二轮
// 4. 第二轮：只有"曾经抢过的人"才有资格继续抢
// 5. "不抢"的人永久失去资格
// 6. 地主 = 最后一个"抢"的人
// ============================================================

// HandleCallLandlord 处理抢地主操作（统一入口）
// action: "call" = 抢, "pass" = 不抢
func (gs *GameSession) HandleCallLandlord(playerID string, action string) error {
        return gs.handleCallLandlordInternal(playerID, action, false)
}

// HandleCallLandlordImmediate 立即处理抢地主操作（用于机器人接管等特殊情况）
func (gs *GameSession) HandleCallLandlordImmediate(playerID string, action string) error {
        return gs.handleCallLandlordInternal(playerID, action, true)
}

// handleCallLandlordInternal 内部处理抢地主操作
func (gs *GameSession) handleCallLandlordInternal(playerID string, action string, immediate bool) error {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 🔧【关键日志】记录当前状态
        log.Printf("🎯 [HandleCallLandlord] 玩家 %s 操作: %s, 当前阶段: %s, callRound: %d, callIndex: %d, lastCallerIdx: %d",
                playerID, action, gs.state, gs.callRound, gs.callIndex, gs.lastCallerIdx)

        // 验证阶段
        if gs.state != GameStateCallLandlord {
                log.Printf("⚠️ [HandleCallLandlord] 当前阶段不是抢地主: %s", gs.state)
                return apperrors.ErrGameNotStart
        }

        // 验证是否轮到该玩家
        if gs.currentCallerID != playerID {
                log.Printf("⚠️ [HandleCallLandlord] 不是该玩家的回合, currentCallerID: %s, playerID: %s", gs.currentCallerID, playerID)
                return apperrors.ErrNotYourTurn
        }

        // 检查该玩家是否已经在当前轮次操作过
        for _, h := range gs.callHistory {
                if h.PlayerID == playerID && h.Round == gs.callRound && h.TurnIndex == gs.callTurnIndex {
                        log.Printf("⚠️ [HandleCallLandlord] 玩家 %s 已经在当前轮次操作过了，忽略重复操作", playerID)
                        return nil
                }
        }

        // 获取当前玩家索引
        currentPlayer := gs.players[gs.callIndex]

        // 🔧【托管】玩家主动操作，取消托管状态
        if currentPlayer.IsTrustee && !immediate {
                log.Printf("[TRUSTEE] 玩家 %s 主动抢地主操作，取消托管状态", currentPlayer.Name)
                currentPlayer.DisableTrustee()
                // 停止机器人计时器
                gs.stopRobotTimer()
                // 广播取消托管状态
                gs.broadcastTrusteeState(playerID, currentPlayer.Name, false, "player_action")
        }

        // 停止当前计时器
        gs.stopTimerInternal()

        // 记录操作
        record := CallRecord{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
                Action:     action,
                Round:      gs.callRound,
                TurnIndex:  gs.callTurnIndex,
        }
        gs.callHistory = append(gs.callHistory, record)

        // 更新抢地主状态
        if action == "call" {
                // 🔧【新增】统计抢地主次数
                gs.qiangCount++
                // 记录第一个抢的人
                if gs.firstCallerIdx == -1 {
                        gs.firstCallerIdx = gs.callIndex
                }
                // 更新最后一个抢的人
                gs.lastCallerIdx = gs.callIndex
                log.Printf("🎯 [HandleCallLandlord] 玩家 %s 抢地主, firstCallerIdx: %d, lastCallerIdx: %d, qiangCount: %d",
                        currentPlayer.Name, gs.firstCallerIdx, gs.lastCallerIdx, gs.qiangCount)
        } else {
                // 🔧【关键修复】标记该玩家为"出局"（失去抢地主资格）
                gs.playerOutStatus[gs.callIndex] = true
                log.Printf("🎯 [HandleCallLandlord] 玩家 %s 不抢，标记为出局", currentPlayer.Name)
        }

        // 广播抢地主结果
        gs.broadcastCallResult(playerID, currentPlayer.Name, action)

        // 执行轮转
        return gs.nextCallLandlordInternal()
}

// nextCallLandlordInternal 抢地主流程控制内部实现（不获取锁）
// ============================================================
// 【核心规则】正确抢地主逻辑
// 1. 第一轮：A→B→C 依次操作
// 2. "不抢"的玩家永久失去资格
// 3. 如果所有人都不抢 → 重新发牌
// 4. 如果只有一人抢 → 直接成为地主
// 5. 如果多人抢 → 进入第二轮
// 6. 第二轮：只有"第一个抢的人"有优先权再抢一次
// 7. 如果第一个抢的人在第二轮抢了 → 他就是地主
// 8. 如果第一个抢的人在第二轮不抢 → 第一轮最后抢的人是地主
// ============================================================
func (gs *GameSession) nextCallLandlordInternal() error {
        log.Printf("🎯 [nextCallLandlord] callRound: %d, callTurnIndex: %d, history: %d, playerOutStatus: %v",
                gs.callRound, gs.callTurnIndex, len(gs.callHistory), gs.playerOutStatus)

        // ==================== 计算活跃玩家 ====================
        // 活跃玩家 = 没有出局的玩家（即曾经抢过的玩家）
        activeCount := 0
        lastActiveIdx := -1
        for i := 0; i < 3; i++ {
                if !gs.playerOutStatus[i] {
                        activeCount++
                        lastActiveIdx = i
                }
        }

        log.Printf("🎯 [nextCallLandlord] 活跃玩家数: %d, 最后活跃: %d, lastCallerIdx: %d, firstCallerIdx: %d",
                activeCount, lastActiveIdx, gs.lastCallerIdx, gs.firstCallerIdx)

        // ==================== 第一轮结束检查 ====================
        if gs.callRound == 1 {
                // 检查第一轮是否结束（所有人都操作过）
                firstRoundOps := 0
                for _, h := range gs.callHistory {
                        if h.Round == 1 {
                                firstRoundOps++
                        }
                }

                if firstRoundOps >= 3 {
                        // 第一轮结束
                        if gs.lastCallerIdx == -1 {
                                // 所有人都不抢
                                if gs.reDealCount >= 2 {
                                        landlordIdx := rand.IntN(3)
                                        log.Printf("🏆 [nextCallLandlord] 第3次全不抢，随机指定玩家 %d 成为地主", landlordIdx)
                                        return gs.finishCallLandlord(landlordIdx)
                                }
                                gs.reDealCount++
                                log.Printf("🔄 [nextCallLandlord] 所有人都不抢，重新发牌（第%d次）", gs.reDealCount)
                                return gs.restartGame()
                        }

                        // 🔧【关键修复】检查是否只有一人抢
                        // 第一轮结束时，如果只剩一个活跃玩家，说明只有一人抢
                        if activeCount == 1 {
                                log.Printf("🏆 [nextCallLandlord] 第一轮只有一人抢，直接成为地主: %d", gs.lastCallerIdx)
                                return gs.finishCallLandlord(gs.lastCallerIdx)
                        }

                        // 多人抢，进入第二轮
                        log.Printf("🎯 [nextCallLandlord] 第一轮多人抢，进入第二轮")
                        gs.callRound = 2
                        gs.callTurnIndex++
                        gs.callOrderInRound = 0 // 🔧【新增】重置轮次内操作顺序

                        // 🔧【关键】第二轮只给第一个抢的人一次机会
                        gs.callIndex = gs.firstCallerIdx
                        gs.notifyCallTurnInternal()
                        return nil
                }
        }

        // ==================== 第二轮逻辑 ====================
        // 🔧【核心规则】第二轮只有第一个抢的人可以操作
        // 如果他抢了，他就是地主
        // 如果他不抢，第一轮最后抢的人是地主
        if gs.callRound == 2 {
                // 检查第二轮是否已经操作过
                round2Ops := 0
                for _, h := range gs.callHistory {
                        if h.Round == 2 {
                                round2Ops++
                        }
                }

                if round2Ops >= 1 {
                        // 第二轮已经操作过了，确定地主
                        // 如果第一个抢的人在第二轮抢了，lastCallerIdx会更新为他
                        // 如果不抢，lastCallerIdx保持为第一轮最后抢的人
                        log.Printf("🏆 [nextCallLandlord] 第二轮操作完成，最后抢的人成为地主: %d", gs.lastCallerIdx)
                        return gs.finishCallLandlord(gs.lastCallerIdx)
                }

                // 不应该到达这里，但作为兜底
                log.Printf("⚠️ [nextCallLandlord] 第二轮异常，直接结束")
                return gs.finishCallLandlord(gs.lastCallerIdx)
        }

        // ==================== 第一轮继续轮转 ====================
        // 找下一个有资格的玩家
        nextIdx := gs.callIndex
        for i := 0; i < 3; i++ {
                nextIdx = (nextIdx + 1) % 3
                if !gs.playerOutStatus[nextIdx] {
                        // 找到有资格的玩家
                        gs.callIndex = nextIdx
                        gs.callTurnIndex++
                        gs.notifyCallTurnInternal()
                        return nil
                }
        }

        // ==================== 兜底结束条件 ====================
        // 如果没找到有资格的玩家，结束抢地主
        if gs.lastCallerIdx != -1 {
                log.Printf("🏆 [nextCallLandlord] 兜底：最后抢的人成为地主: %d", gs.lastCallerIdx)
                return gs.finishCallLandlord(gs.lastCallerIdx)
        }

        // 没人抢过，重新发牌
        if gs.reDealCount >= 2 {
                landlordIdx := rand.IntN(3)
                log.Printf("🏆 [nextCallLandlord] 没人抢，随机指定地主: %d", landlordIdx)
                return gs.finishCallLandlord(landlordIdx)
        }
        gs.reDealCount++
        log.Printf("🔄 [nextCallLandlord] 没人抢，重新发牌（第%d次）", gs.reDealCount)
        return gs.restartGame()
}

// notifyCallTurnInternal 通知轮到玩家抢地主（内部实现，不获取锁）
func (gs *GameSession) notifyCallTurnInternal() {
        player := gs.players[gs.callIndex]
        gs.currentCallerID = player.ID

        // 清除待处理操作状态
        gs.pendingCallAction = ""

        // 计算过期时间（毫秒时间戳）
        timeout := gs.gameConfig.BidTimeout
        expiresAt := time.Now().Add(time.Duration(timeout) * time.Second).UnixMilli()

        log.Printf("📢 [notifyCallTurn] 轮到玩家 %s 抢地主 (round=%d, turnIndex=%d, timeout=%d秒, 托管=%v)",
                player.Name, gs.callRound, gs.callTurnIndex, timeout, player.IsTrustee)

        // 广播抢地主轮次通知
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCallLandlordTurn, &protocol.CallLandlordTurnPayload{
                PlayerID:   player.ID,
                PlayerName: player.Name,
                Timeout:    timeout,
                Round:      gs.callRound,
                TurnIndex:  gs.callTurnIndex,
                ExpiresAt:  expiresAt,
        }))

        // 同时发送旧版消息（兼容）
        if gs.callRound == 1 {
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgBidTurn, &protocol.BidTurnPayload{
                        PlayerID: player.ID,
                        Timeout:  timeout,
                }))
        } else {
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgRobTurn, &protocol.RobTurnPayload{
                        PlayerID: player.ID,
                        Timeout:  timeout,
                }))
        }

        // 🔧【托管】检查玩家是否处于托管状态
        if player.IsRobot() || player.IsTrustee {
                // 🔧【关键修复】机器人需要根据重发次数决定是否抢地主
                // 避免无限循环发牌
                var action string
                if gs.reDealCount >= 1 {
                        // 重新发牌后，50% 概率抢地主
                        if rand.IntN(100) < 50 {
                                action = "call"
                                log.Printf("[TRUSTEE] 玩家 %s 重新发牌后决定抢地主 (reDealCount=%d)", player.Name, gs.reDealCount)
                        } else {
                                action = "pass"
                                log.Printf("[TRUSTEE] 玩家 %s 重新发牌后决定不抢 (reDealCount=%d)", player.Name, gs.reDealCount)
                        }
                } else {
                        // 首次发牌，30% 概率抢地主
                        if rand.IntN(100) < 30 {
                                action = "call"
                                log.Printf("[TRUSTEE] 玩家 %s 托管状态决定抢地主", player.Name)
                        } else {
                                action = "pass"
                                log.Printf("[TRUSTEE] 玩家 %s 托管状态决定不抢", player.Name)
                        }
                }
                // 使用快速操作（800-1500ms）
                gs.scheduleRobotAction(func() {
                        _ = gs.HandleCallLandlordImmediate(player.ID, action)
                })
                return
        }

        // 启动超时计时器
        gs.startCallTimer()
}

// startCallTimer 启动抢地主超时计时器
func (gs *GameSession) startCallTimer() {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        // 停止旧的计时器
        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }

        timeout := gs.gameConfig.BidTimeoutDuration()
        gs.timerExpiresAt = time.Now().Add(timeout)

        log.Printf("⏰ [startCallTimer] 启动计时器，超时: %v", timeout)

        gs.turnTimer = time.AfterFunc(timeout, func() {
                log.Printf("⏰ [startCallTimer] 计时器回调触发！")
                gs.processCallTimeout()
        })
}

// processCallTimeout 处理抢地主超时
func (gs *GameSession) processCallTimeout() {
        gs.timerMu.Lock()
        if !gs.timerExpiresAt.IsZero() && time.Now().Before(gs.timerExpiresAt.Add(-100*time.Millisecond)) {
                log.Printf("⚠️ [processCallTimeout] 计时器过早触发，忽略")
                gs.timerMu.Unlock()
                return
        }
        gs.turnTimer = nil
        gs.timerExpiresAt = time.Time{}
        gs.timerMu.Unlock()

        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 检查当前玩家是否已经操作过
        currentPlayer := gs.players[gs.callIndex]
        playerID := currentPlayer.ID

        for _, h := range gs.callHistory {
                if h.PlayerID == playerID && h.Round == gs.callRound && h.TurnIndex == gs.callTurnIndex {
                        log.Printf("⚠️ [processCallTimeout] 玩家 %s 已操作过，忽略超时", currentPlayer.Name)
                        return
                }
        }

        log.Printf("[TRUSTEE] 玩家 %s 超时 -> 托管已开启", currentPlayer.Name)

        // 🔧【托管】超时后开启托管状态
        currentPlayer.EnableTrustee()
        // 广播托管状态变化
        gs.broadcastTrusteeState(playerID, currentPlayer.Name, true, "timeout")

        // 记录操作
        record := CallRecord{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
                Action:     "pass",
                Round:      gs.callRound,
                TurnIndex:  gs.callTurnIndex,
        }
        gs.callHistory = append(gs.callHistory, record)

        // 标记为出局
        gs.playerOutStatus[gs.callIndex] = true

        // 广播抢地主结果
        gs.broadcastCallResult(playerID, currentPlayer.Name, "pass")

        // 执行轮转
        gs.nextCallLandlordInternal()
}

// stopTimerInternal 内部停止计时器
func (gs *GameSession) stopTimerInternal() {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }
        gs.timerExpiresAt = time.Time{}
}

// broadcastCallResult 广播抢地主结果
func (gs *GameSession) broadcastCallResult(playerID, playerName, action string) {
        // 🔧【新增】获取玩家性别
        var gender string = "male" // 默认男
        for _, p := range gs.players {
                if p.ID == playerID {
                        if p.Gender == "female" {
                                gender = "female"
                        }
                        break
                }
        }

        // 🔧【新增】增加轮次内操作顺序
        gs.callOrderInRound++
        order := gs.callOrderInRound

        log.Printf("📢 [broadcastCallResult] 玩家 %s 操作: %s, 轮次: %d, 顺序: %d, 性别: %s",
                playerName, action, gs.callRound, order, gender)

        // 🔧【新增】记录叫地主日志到 gameLogger
        // bidType: 0-不叫, 1-叫地主, 2-抢地主
        var bidType uint8
        if action == "call" {
                if gs.callRound == 1 {
                        bidType = 1 // 叫地主
                } else {
                        bidType = 2 // 抢地主
                }
        } else {
                bidType = 0 // 不叫
        }

        // 判断是否成功成为地主（暂时无法确定，在 finishCallLandlord 中更新）
        var isSuccess uint8 = 0
        if action == "call" && gs.lastCallerIdx >= 0 {
                // 检查当前玩家是否是最后一个抢的人（可能是地主）
                for i, p := range gs.players {
                        if p.ID == playerID && i == gs.lastCallerIdx {
                                isSuccess = 1
                                break
                        }
                }
        }

        gs.gameLogger.RecordBidLog(playerID, order, bidType, 0, isSuccess)
        log.Printf("📝 [broadcastCallResult] 记录叫地主日志: playerID=%s, order=%d, bidType=%d, isSuccess=%d",
                playerID, order, bidType, isSuccess)

        // 新版消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCallLandlordResult, &protocol.CallLandlordResultPayload{
                PlayerID:   playerID,
                PlayerName: playerName,
                Action:     action,
                Round:      gs.callRound,
                TurnIndex:  gs.callTurnIndex,
                Gender:     gender,
                Order:      order,
        }))

        // 兼容旧版消息
        if gs.callRound == 1 {
                bid := action == "call"
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgBidResult, &protocol.BidResultPayload{
                        PlayerID:   playerID,
                        PlayerName: playerName,
                        Bid:        bid,
                }))
        } else {
                rob := action == "call"
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgRobResult, &protocol.RobResultPayload{
                        PlayerID:   playerID,
                        PlayerName: playerName,
                        Rob:        rob,
                }))
        }
}

// finishCallLandlord 结束抢地主阶段，确定地主
func (gs *GameSession) finishCallLandlord(landlordIdx int) error {
        // 🔧【关键日志】记录地主确定过程
        log.Printf("🏆 [finishCallLandlord] ========== 开始确定地主 ==========")
        log.Printf("🏆 [finishCallLandlord] 传入的 landlordIdx: %d", landlordIdx)
        log.Printf("🏆 [finishCallLandlord] 当前 lastCallerIdx: %d, firstCallerIdx: %d", gs.lastCallerIdx, gs.firstCallerIdx)
        log.Printf("🏆 [finishCallLandlord] callHistory 数量: %d", len(gs.callHistory))
        for i, h := range gs.callHistory {
                log.Printf("🏆 [finishCallLandlord] callHistory[%d]: PlayerID=%s, Action=%s, Round=%d, TurnIndex=%d",
                        i, h.PlayerID, h.Action, h.Round, h.TurnIndex)
        }

        landlord := gs.players[landlordIdx]
        landlord.IsLandlord = true

        log.Printf("🏆 [finishCallLandlord] ✅ 设置玩家 %s (ID: %s) 为地主 (索引: %d)", landlord.Name, landlord.ID, landlordIdx)

        // 🔧【新增】更新房间中的上一局地主索引，用于下一局起叫人计算
        gs.room.LastLandlordIdx = landlordIdx
        log.Printf("🏆 [finishCallLandlord] 更新房间 LastLandlordIdx: %d", landlordIdx)

        // 🔧【关键修复】立即广播地主确定消息，无延迟
        // 底牌给地主
        log.Printf("🏆 [finishCallLandlord] 底牌数量: %d, 地主手牌数量(加底牌前): %d", len(gs.bottomCards), len(landlord.Hand))
        landlord.Hand = append(landlord.Hand, gs.bottomCards...)
        sort.Slice(landlord.Hand, func(i, j int) bool {
                return landlord.Hand[i].Rank > landlord.Hand[j].Rank
        })
        log.Printf("🏆 [finishCallLandlord] 地主手牌数量(加底牌后): %d", len(landlord.Hand))

        // 更新房间玩家状态
        rp, ok := gs.room.Players[landlord.ID]
        if ok && rp != nil {
                rp.IsLandlord = true
        }

        // 🔧【关键修复】立即广播地主确定消息（无延迟）
        // 消息1: call_landlord_end - 新版统一消息
        log.Printf("🏆 [finishCallLandlord] 广播 call_landlord_end, 地主: %s (ID: %s), 底牌: %d张",
                landlord.Name, landlord.ID, len(gs.bottomCards))
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCallLandlordEnd, &protocol.CallLandlordEndPayload{
                LandlordID:   landlord.ID,
                LandlordName: landlord.Name,
                BottomCards:  convert.CardsToInfos(gs.bottomCards),
        }))

        // 消息2: landlord - 兼容旧版
        log.Printf("🏆 [finishCallLandlord] 广播 landlord (兼容旧版)")
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgLandlord, &protocol.LandlordPayload{
                PlayerID:    landlord.ID,
                PlayerName:  landlord.Name,
                BottomCards: convert.CardsToInfos(gs.bottomCards),
        }))

        // 消息3: landlord_cards - 给地主发送新手牌（专用消息）
        if rp != nil && rp.Client != nil {
                log.Printf("🃏 [finishCallLandlord] 给地主 %s 发送 landlord_cards (共 %d 张手牌)", landlord.Name, len(landlord.Hand))
                rp.Client.SendMessage(codec.MustNewMessage(protocol.MsgLandlordCards, &protocol.LandlordCardsPayload{
                        LandlordID:   landlord.ID,
                        LandlordName: landlord.Name,
                        Cards:        convert.CardsToInfos(landlord.Hand),
                        BottomCards:  convert.CardsToInfos(gs.bottomCards),
                }))
        } else {
                log.Printf("⚠️ [finishCallLandlord] 地主 %s 的客户端连接为空，无法发送手牌", landlord.Name)
        }

        log.Printf("🏆 [finishCallLandlord] ========== 地主确定完成 ==========")

        // 开始出牌阶段
        return gs.startPlayPhase(landlordIdx)
}

// startPlayPhase 开始出牌阶段
func (gs *GameSession) startPlayPhase(landlordIdx int) error {
        // 广播出牌阶段开始
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayStart, &protocol.PlayStartPayload{
                LandlordID: gs.players[landlordIdx].ID,
        }))

        // 更新状态
        gs.state = GameStatePlaying
        gs.room.State = RoomStatePlaying
        gs.currentPlayer = landlordIdx
        gs.lastPlayerIdx = landlordIdx

        // 开始第一回合
        gs.gameLogger.StartNewRound()

        // 通知地主出牌
        gs.notifyPlayTurn()
        return nil
}

// ============================================================
// 兼容旧版接口
// ============================================================

// HandleBid 处理叫地主（兼容旧版客户端）
func (gs *GameSession) HandleBid(playerID string, bid bool) error {
        action := "pass"
        if bid {
                action = "call"
        }
        return gs.HandleCallLandlord(playerID, action)
}

// HandleRob 处理抢地主（兼容旧版客户端）
func (gs *GameSession) HandleRob(playerID string, rob bool) error {
        action := "pass"
        if rob {
                action = "call"
        }
        return gs.HandleCallLandlord(playerID, action)
}

// ============================================================
// 已废弃的方法（保留用于兼容）
// ============================================================

// notifyBidTurn 通知当前玩家叫地主（已废弃）
func (gs *GameSession) notifyBidTurn() {
        player := gs.players[gs.callIndex]
        log.Printf("📢 [notifyBidTurn-废弃] 通知玩家 %s 叫地主", player.Name)

        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgBidTurn, &protocol.BidTurnPayload{
                PlayerID: player.ID,
                Timeout:  gs.gameConfig.BidTimeout,
        }))
        gs.startCallTimer()
}

// notifyRobTurn 通知当前玩家抢地主（已废弃）
func (gs *GameSession) notifyRobTurn() {
        player := gs.players[gs.callIndex]
        log.Printf("📢 [notifyRobTurn-废弃] 通知玩家 %s 抢地主", player.Name)

        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgRobTurn, &protocol.RobTurnPayload{
                PlayerID: player.ID,
                Timeout:  gs.gameConfig.BidTimeout,
        }))
        gs.startCallTimer()
}

// setLandlord 设置地主（已废弃）
func (gs *GameSession) setLandlord(idx int) {
        _ = gs.finishCallLandlord(idx)
}

// StartCallLandlord 开始抢地主阶段
// 🔧【新增】起叫人逻辑：
// 1. 首局（房间刚创建/三人首次进入）：随机首叫
// 2. 从第二局开始：(上一局地主 + 1) % 3
func (gs *GameSession) StartCallLandlord() {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 初始化抢地主状态
        gs.state = GameStateCallLandlord
        gs.callRound = 1
        gs.callTurnIndex = 1
        gs.callOrderInRound = 0 // 🔧【新增】初始化轮次内操作顺序
        gs.callHistory = make([]CallRecord, 0)
        gs.firstCallerIdx = -1
        gs.lastCallerIdx = -1
        gs.reDealCount = 0

        // 🔧【关键修复】初始化玩家出局状态
        gs.playerOutStatus = make(map[int]bool)

        // 🔧【核心修改】确定起叫人
        // 首局随机，从第二局开始按 (lastLandlord + 1) % 3 循环
        var starterIdx int
        if gs.room.GameCount <= 1 || gs.room.LastLandlordIdx < 0 {
                // 首局或无上一局地主记录，随机选择
                starterIdx = rand.IntN(3)
                log.Printf("🎯 [StartCallLandlord] 首局随机起叫人: %d", starterIdx)
        } else {
                // 非首局，按循环机制确定起叫人：(lastLandlord + 1) % 3
                starterIdx = (gs.room.LastLandlordIdx + 1) % 3
                log.Printf("🎯 [StartCallLandlord] 第%d局，上一局地主: %d，本轮起叫人: %d",
                        gs.room.GameCount, gs.room.LastLandlordIdx, starterIdx)
        }
        gs.callIndex = starterIdx

        firstPlayer := gs.players[gs.callIndex]
        log.Printf("🎯 [StartCallLandlord] 抢地主阶段开始，第一个玩家: %s (索引: %d)", firstPlayer.Name, gs.callIndex)

        // 广播抢地主阶段开始
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCallLandlordStart, &protocol.CallLandlordStartPayload{
                FirstCallerID:   firstPlayer.ID,
                FirstCallerName: firstPlayer.Name,
                TotalRounds:     4,
        }))

        // 通知第一个玩家抢地主
        gs.notifyCallTurnInternal()
}

// restartGame 重新发牌（所有人都不叫地主时调用）
func (gs *GameSession) restartGame() error {
        log.Printf("🔄 [restartGame] 所有人都不叫地主，重新发牌（第%d次）", gs.reDealCount+1)

        // 重置所有玩家的地主状态和手牌
        for _, p := range gs.players {
                p.IsLandlord = false
                p.Hand = nil
        }

        // 重置房间玩家状态
        for _, rp := range gs.room.Players {
                if rp != nil {
                        rp.IsLandlord = false
                }
        }

        // 广播重新发牌通知
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgRestartGame, &protocol.RestartGamePayload{
                Reason:      "所有人都不叫地主，重新发牌",
                ReDealCount: gs.reDealCount,
        }))

        // 异步重新发牌
        go func() {
                gs.Start()
        }()

        return nil
}
