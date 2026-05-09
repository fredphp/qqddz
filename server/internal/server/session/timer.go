package session

import (
        "log"
        "math/rand/v2"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/robot"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// --- 超时控制 ---

// startBidTimer 启动叫地主超时计时器（已废弃，使用 startCallTimer）
func (gs *GameSession) startBidTimer() {
        gs.startCallTimer()
}

// startRobTimer 启动抢地主超时计时器（已废弃，使用 startCallTimer）
func (gs *GameSession) startRobTimer() {
        gs.startCallTimer()
}

func (gs *GameSession) startPlayTimer() {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        // 🔧【关键修复】停止旧的计时器，防止重复触发
        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }

        turnTimeout := gs.gameConfig.TurnTimeoutDuration()
        gs.timerExpiresAt = time.Now().Add(turnTimeout)
        gs.turnTimer = time.AfterFunc(turnTimeout, func() {
                gs.handlePlayTimeout()
        })
}

// handlePlayTimeout 处理出牌超时
// 机器人托管时自动出牌，普通玩家超时也自动出牌并开启托管
func (gs *GameSession) handlePlayTimeout() {
        // 🔧【关键修复】检查是否真正超时
        gs.timerMu.Lock()
        if !gs.timerExpiresAt.IsZero() && time.Now().Before(gs.timerExpiresAt.Add(-100*time.Millisecond)) {
                log.Printf("⚠️ [handlePlayTimeout] 计时器过早触发！当前: %v, 到期: %v, 剩余: %v, 忽略",
                        time.Now(), gs.timerExpiresAt, time.Until(gs.timerExpiresAt))
                gs.timerMu.Unlock()
                return
        }
        // 清除计时器状态
        gs.turnTimer = nil
        gs.timerExpiresAt = time.Time{}
        gs.timerMu.Unlock()

        gs.doHandlePlayTimeout()
}

// doHandlePlayTimeout 实际执行出牌超时处理（不带时间检查）
// 🔧【修复】重写此函数，使用统一轮转管理器避免锁管理问题
func (gs *GameSession) doHandlePlayTimeout() {
        log.Printf("[TRUSTEE] doHandlePlayTimeout 开始执行")

        // 🔧【修复】如果轮转管理器可用，使用新的内部方法
        if gs.turnManager != nil {
                gs.turnManager.doAutoPlayInternal(gs.currentPlayer)
                return
        }

        // 兜底：旧逻辑（保持兼容性）
        gs.mu.Lock()

        if gs.state != GameStatePlaying {
                log.Printf("[TRUSTEE] 游戏状态不是 Playing，退出: state=%d", gs.state)
                gs.mu.Unlock()
                return
        }

        currentPlayer := gs.players[gs.currentPlayer]
        playerID := currentPlayer.ID

        log.Printf("[TRUSTEE] 当前玩家: %s (ID: %s), IsRobot: %v, IsTrustee: %v",
                currentPlayer.Name, playerID, currentPlayer.IsRobot(), currentPlayer.IsTrustee)

        // 🔧【托管】检查玩家状态
        if currentPlayer.IsRobot() {
                log.Printf("[TRUSTEE] 机器人自动出牌: %s", currentPlayer.Name)
        } else if !currentPlayer.IsTrustee {
                // 🔧【托管】首次超时，开启托管状态
                log.Printf("[TRUSTEE] 玩家 %s 超时 -> 托管已开启", currentPlayer.Name)
                currentPlayer.EnableTrustee()
                // 广播托管状态变化
                gs.broadcastTrusteeState(currentPlayer.ID, currentPlayer.Name, true, "timeout")
        }

        // 🔧【调试】打印上家出牌信息
        if !gs.lastPlayedHand.IsEmpty() {
                log.Printf("[TRUSTEE] lastPlayedHand: Type=%s, KeyRank=%d, Cards=%d",
                        gs.lastPlayedHand.Type.String(), gs.lastPlayedHand.KeyRank, len(gs.lastPlayedHand.Cards))
        } else {
                log.Printf("[TRUSTEE] lastPlayedHand is empty (新一轮)")
        }

        // 🔧【修复】使用智能决策系统
        log.Printf("[TRUSTEE] 开始调用 makeRobotDecision")
        decision := gs.makeRobotDecision(currentPlayer)
        if decision != nil {
                cardsLen := 0
                if decision.Cards != nil {
                        cardsLen = len(decision.Cards)
                }
                log.Printf("[TRUSTEE] makeRobotDecision 返回: ShouldPlay=%v, Cards=%d, Reason=%s",
                        decision.ShouldPlay, cardsLen, decision.Reason)
        } else {
                log.Printf("[TRUSTEE] makeRobotDecision 返回: nil")
        }

        if decision == nil || !decision.ShouldPlay {
                // 决定过牌
                gs.mu.Unlock()
                reason := "决策为空或不应出牌"
                if decision != nil {
                        reason = decision.Reason
                }
                log.Printf("[TRUSTEE] 玩家 %s 选择过牌: %s", currentPlayer.Name, reason)
                _ = gs.HandlePass(playerID)
                return
        }

        if decision.Cards != nil && len(decision.Cards) > 0 {
                // 有牌可以出，转换为 card.Card 格式
                cardsToPlay := convertCardInfosToCards(decision.Cards)
                cardInfos := convert.CardsToInfos(cardsToPlay)
                gs.mu.Unlock()
                log.Printf("[TRUSTEE] 玩家 %s 自动出牌: %v, 原因: %s", currentPlayer.Name, cardInfos, decision.Reason)
                err := gs.HandlePlayCards(playerID, cardInfos)
                if err != nil {
                        // 🔧【关键修复】出牌失败，必须过牌，防止死循环
                        log.Printf("[TRUSTEE] ⚠️ 出牌失败: %v，改为过牌", err)
                        _ = gs.HandlePass(playerID)
                }
                return
        }

        // 没有能打的牌，自动 PASS
        gs.mu.Unlock()
        log.Printf("[TRUSTEE] 玩家 %s 自动 PASS: %s", currentPlayer.Name, decision.Reason)
        _ = gs.HandlePass(playerID)
}

// makeRobotDecision 机器人智能决策
func (gs *GameSession) makeRobotDecision(currentPlayer *GamePlayer) *robot.PlayDecision {
        // 创建AI决策器
        aiConfig := database.RobotAIConfigDefault()
        robotAI := robot.NewRobotAI(nil, aiConfig)
        
        // 构建游戏状态
        gameState := &robot.GameState{
                GameID:      gs.room.Code,
                MyRole:      database.PlayerRoleFarmer,
                MyHandCards: convertCardsToCardInfos(currentPlayer.Hand),
        }
        
        if currentPlayer.IsLandlord {
                gameState.MyRole = database.PlayerRoleLandlord
        }
        
        // 设置上家出牌信息
        if !gs.lastPlayedHand.IsEmpty() {
                gameState.CurrentPlay = &robot.PlayRecord{
                        PlayerID: 0,
                        Role:     database.PlayerRoleFarmer,
                        Cards:    convertCardsToCardInfos(gs.lastPlayedHand.Cards),
                        Pattern:  gs.lastPlayedHand.Type.String(),
                        IsBomb:   gs.lastPlayedHand.Type == rule.Bomb,
                        IsRocket: gs.lastPlayedHand.Type == rule.Rocket,
                }
                
                // 设置上家角色
                if gs.lastPlayerIdx >= 0 && gs.lastPlayerIdx < len(gs.players) {
                        lastPlayer := gs.players[gs.lastPlayerIdx]
                        if lastPlayer.IsLandlord {
                                gameState.CurrentPlay.Role = database.PlayerRoleLandlord
                        }
                        gameState.CurrentPlay.PlayerID = lastPlayer.DBID
                }
        }
        
        // 设置玩家信息
        for i, p := range gs.players {
                switch i {
                case 0:
                        gameState.Player1ID = p.DBID
                        gameState.Player1Role = database.PlayerRoleFarmer
                        gameState.Player1Cards = len(p.Hand)
                        if p.IsLandlord {
                                gameState.Player1Role = database.PlayerRoleLandlord
                        }
                case 1:
                        gameState.Player2ID = p.DBID
                        gameState.Player2Role = database.PlayerRoleFarmer
                        gameState.Player2Cards = len(p.Hand)
                        if p.IsLandlord {
                                gameState.Player2Role = database.PlayerRoleLandlord
                        }
                case 2:
                        gameState.Player3ID = p.DBID
                        gameState.Player3Role = database.PlayerRoleFarmer
                        gameState.Player3Cards = len(p.Hand)
                        if p.IsLandlord {
                                gameState.Player3Role = database.PlayerRoleLandlord
                        }
                }
        }
        
        // 调用AI决策
        decision := robotAI.DecidePlay(gameState)
        
        // 🔧【关键修复】检查炸弹/王炸使用限制
        if decision != nil && decision.ShouldPlay && len(decision.Cards) > 0 {
                // 检查是否是炸弹或王炸
                isBomb := len(decision.Cards) == 4 && decision.Cards[0].Rank == decision.Cards[1].Rank
                isRocket := len(decision.Cards) == 2 && 
                        ((decision.Cards[0].Rank == 16 && decision.Cards[1].Rank == 17) || 
                         (decision.Cards[0].Rank == 17 && decision.Cards[1].Rank == 16))
                
                if isBomb || isRocket {
                        // 获取对手最少牌数
                        opponentMinCards := getOpponentMinCards(gs, currentPlayer)
                        
                        // 检查是否应该使用炸弹/王炸
                        shouldUse := shouldUseBombOrRocket(gs, currentPlayer, opponentMinCards, isRocket)
                        if !shouldUse {
                                log.Printf("[RobotAI] 🚫 限制使用%v，选择过牌", map[bool]string{true: "王炸", false: "炸弹"}[isRocket])
                                return &robot.PlayDecision{
                                        ShouldPlay: false,
                                        Cards:      nil,
                                        Reason:     "限制使用炸弹/王炸",
                                }
                        }
                }
        }
        
        return decision
}

// convertCardsToCardInfos 转换牌格式
func convertCardsToCardInfos(cards []card.Card) []robot.CardInfo {
        result := make([]robot.CardInfo, len(cards))
        for i, c := range cards {
                result[i] = robot.CardInfo{
                        Rank: int(c.Rank),
                        Suit: int(c.Suit),
                        Code: c.String(),
                }
        }
        return result
}

// convertCardInfosToCards 将 CardInfo 转换为 card.Card
func convertCardInfosToCards(infos []robot.CardInfo) []card.Card {
        result := make([]card.Card, len(infos))
        for i, info := range infos {
                result[i] = card.Card{
                        Suit: card.Suit(info.Suit),
                        Rank: card.Rank(info.Rank),
                }
        }
        return result
}

// getOpponentMinCards 获取对手最少剩余牌数
func getOpponentMinCards(gs *GameSession, currentPlayer *GamePlayer) int {
        minCards := 20
        for _, p := range gs.players {
                if p.ID == currentPlayer.ID {
                        continue
                }
                // 判断是否是对手
                isOpponent := currentPlayer.IsLandlord || p.IsLandlord
                if isOpponent && len(p.Hand) < minCards {
                        minCards = len(p.Hand)
                }
        }
        return minCards
}

// shouldUseBombOrRocket 判断是否应该使用炸弹/王炸
func shouldUseBombOrRocket(gs *GameSession, currentPlayer *GamePlayer, opponentMinCards int, isRocket bool) bool {
        // 1. 对手只剩1-2张牌，必须炸
        if opponentMinCards <= 2 {
                log.Printf("[RobotAI] 对手只剩%d张牌，必须使用炸弹", opponentMinCards)
                return true
        }
        
        // 2. 检查自己能否一次出完
        handCount := len(currentPlayer.Hand)
        bombCardCount := 4
        if isRocket {
                bombCardCount = 2
        }
        remaining := handCount - bombCardCount
        if remaining <= 2 {
                log.Printf("[RobotAI] 使用炸弹后只剩%d张，可以一次出完", remaining)
                return true
        }
        
        // 3. 其他情况限制使用
        log.Printf("[RobotAI] 不满足炸弹使用条件（对手剩余%d张，自己剩余%d张）", opponentMinCards, handCount)
        return false
}

// handleRobotPlay 机器人托管出牌（不走时间检查）
// 注意：不在这里停止倒计时，让 HandlePlayCards/HandlePass 成功时停止
// 这样如果机器人操作失败，后备倒计时仍然可以触发
func (gs *GameSession) handleRobotPlay() {
        // 直接执行出牌逻辑（HandlePlayCards/HandlePass 内部会停止倒计时）
        gs.doHandlePlayTimeout()
}

func (gs *GameSession) stopTimer() {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }
        if gs.offlineWaitTimer != nil {
                gs.offlineWaitTimer.Stop()
                gs.offlineWaitTimer = nil
        }
        // 🔧【托管】停止机器人计时器
        if gs.robotTimer != nil {
                gs.robotTimer.Stop()
                gs.robotTimer = nil
        }
}

// StopAllTimers stops all timers (for cleanup when all players disconnect)
func (gs *GameSession) StopAllTimers() {
        gs.stopTimer()
}

// 🔧【托管】scheduleRobotAction 调度机器人操作（800-1500ms随机延迟）
// 托管状态下的玩家操作不再等待完整倒计时，而是快速响应
func (gs *GameSession) scheduleRobotAction(action func()) {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        // 停止之前的机器人计时器
        if gs.robotTimer != nil {
                gs.robotTimer.Stop()
                gs.robotTimer = nil
        }

        // 随机延迟 800-1500ms
        delay := time.Duration(800+rand.IntN(700)) * time.Millisecond
        log.Printf("[TRUSTEE] 机器人操作将在 %v 后执行", delay)

        gs.robotTimer = time.AfterFunc(delay, func() {
                gs.timerMu.Lock()
                gs.robotTimer = nil
                gs.timerMu.Unlock()
                action()
        })
}

// 🔧【托管】stopRobotTimer 停止机器人计时器
func (gs *GameSession) stopRobotTimer() {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        if gs.robotTimer != nil {
                gs.robotTimer.Stop()
                gs.robotTimer = nil
                log.Printf("[TRUSTEE] 机器人计时器已停止")
        }
}

// --- 离线处理 ---

// PlayerOffline 玩家离线 - 设置机器人托管
func (gs *GameSession) PlayerOffline(playerID string) {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 找到玩家
        playerIdx := -1
        for i, p := range gs.players {
                if p.ID == playerID {
                        // 设置为机器人托管
                        p.SetRobot()
                        p.EnableTrustee() // 🔧【托管】开启托管状态
                        playerIdx = i
                        break
                }
        }

        if playerIdx == -1 {
                return
        }

        player := gs.players[playerIdx]
        log.Printf("[TRUSTEE] 玩家 %s 断开连接 -> 托管已开启", player.Name)

        // 🔧【托管】广播托管状态变化
        gs.broadcastTrusteeState(player.ID, player.Name, true, "disconnect")

        // 检查是否是当前回合玩家
        isCalling := gs.state == GameStateCallLandlord && gs.callIndex == playerIdx
        isPlaying := gs.state == GameStatePlaying && gs.currentPlayer == playerIdx

        if !isCalling && !isPlaying {
                return // 不是当前回合，无需立即处理
        }

        // 机器人立即接管操作
        if isCalling {
                log.Printf("[TRUSTEE] 玩家 %s 抢地主阶段断线，机器人接管", player.Name)
                // 取消当前计时器
                gs.stopTimerInternal()
                gs.mu.Unlock()
                // 🔧【托管】使用快速操作
                gs.scheduleRobotAction(func() {
                        _ = gs.HandleCallLandlordImmediate(playerID, "pass")
                })
                return
        }

        if isPlaying {
                log.Printf("[TRUSTEE] 玩家 %s 出牌阶段断线，机器人接管", player.Name)
                gs.stopTimerInternal()
                gs.mu.Unlock()
                // 🔧【托管】使用快速操作
                gs.scheduleRobotAction(func() {
                        gs.handleRobotPlay()
                })
        }
}

// PlayerOnline 玩家上线 - 恢复玩家控制
func (gs *GameSession) PlayerOnline(playerID string) {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 找到玩家
        playerIdx := -1
        for i, p := range gs.players {
                if p.ID == playerID {
                        p.SetOnline()
                        wasTrustee := p.IsTrustee
                        p.DisableTrustee() // 🔧【托管】取消托管状态
                        playerIdx = i
                        // 🔧【托管】广播托管状态变化（仅在之前是托管状态时）
                        if wasTrustee {
                                gs.broadcastTrusteeState(p.ID, p.Name, false, "reconnect")
                        }
                        break
                }
        }

        if playerIdx == -1 {
                return
        }

        player := gs.players[playerIdx]
        log.Printf("[TRUSTEE] 玩家 %s 重连 -> 托管已取消", player.Name)

        // 🔧【托管】停止所有机器人计时器
        gs.stopRobotTimer()

        // 检查是否是当前回合玩家
        isCalling := gs.state == GameStateCallLandlord && gs.callIndex == playerIdx
        isPlaying := gs.state == GameStatePlaying && gs.currentPlayer == playerIdx

        if !isCalling && !isPlaying {
                return
        }

        // 取消离线等待计时器
        gs.timerMu.Lock()
        if gs.offlineWaitTimer != nil {
                gs.offlineWaitTimer.Stop()
                gs.offlineWaitTimer = nil
        }
        // 🔧【关键修复】停止旧的计时器，防止重复触发
        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }
        gs.timerMu.Unlock()

        // 恢复计时器（基于到期时间计算剩余时间）
        if !gs.timerExpiresAt.IsZero() {
                remaining := time.Until(gs.timerExpiresAt)
                if remaining > 0 {
                        gs.timerMu.Lock()
                        if isCalling {
                                gs.turnTimer = time.AfterFunc(remaining, func() {
                                        gs.processCallTimeout()
                                })
                        } else {
                                gs.turnTimer = time.AfterFunc(remaining, func() {
                                        gs.handlePlayTimeout()
                                })
                        }
                        gs.timerMu.Unlock()
                        log.Printf("[TRUSTEE] 玩家 %s 重连，恢复手动操作（剩余时间 %v）", player.Name, remaining)
                }
        }
}

// handleOfflineTimeout 离线超时处理 - 已被机器人托管替代
// 保留此函数用于兼容性，但不再主要使用
func (gs *GameSession) handleOfflineTimeout(playerID string) {
        // 已经在PlayerOffline中处理了机器人托管
        // 此函数不再需要，但保留以防万一
        log.Printf("⏰ 离线超时检查: %s (已被机器人托管)", playerID)
}

// notifyPlayTurnWithRobotCheck 通知出牌回合（带机器人检查）
func (gs *GameSession) notifyPlayTurnWithRobotCheck() {
        player := gs.players[gs.currentPlayer]
        
        // 计算是否必须出牌和是否能打过
        mustPlay := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        canBeat := mustPlay
        if !mustPlay {
                beatingCards := rule.FindSmallestBeatingCards(player.Hand, gs.lastPlayedHand)
                canBeat = beatingCards != nil
        }
        
        // 广播出牌回合消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayTurn, &protocol.PlayTurnPayload{
                PlayerID: player.ID,
                Timeout:  gs.gameConfig.TurnTimeout,
                MustPlay: mustPlay,
                CanBeat:  canBeat,
        }))
        
        // 🔧【托管】检查玩家是否处于托管状态
        if player.IsRobot() || player.IsTrustee {
                log.Printf("[TRUSTEE] 玩家 %s 托管状态，准备自动出牌", player.Name)
                // 🔧【修复】同时启动后备倒计时和机器人快速操作
                // 1. 启动后备倒计时（30秒）- 如果机器人操作失败，倒计时到期后自动出牌
                gs.startPlayTimer()
                // 2. 启动机器人快速操作（800-1500ms）
                gs.scheduleRobotAction(func() {
                        gs.handleRobotPlay()
                })
                return
        }

        // 普通玩家，启动倒计时
        gs.startPlayTimer()
}

// 🔧【托管】broadcastTrusteeState 广播托管状态变化
func (gs *GameSession) broadcastTrusteeState(playerID, playerName string, isTrustee bool, reason string) {
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgTrusteeState, &protocol.TrusteeStatePayload{
                PlayerID:   playerID,
                PlayerName: playerName,
                IsTrustee:  isTrustee,
                Reason:     reason,
        }))
}
