package session

import (
        "log"
        "math/rand/v2"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// ============================================================
// 【修复】统一轮转管理器
// 解决机器人轮转卡死问题
// ============================================================

// TurnManager 轮转管理器 - 确保轮转的原子性和可靠性
type TurnManager struct {
        gs *GameSession

        // 轮转保护
        turnMu         sync.Mutex
        isAdvancing    bool       // 是否正在进行轮转
        lastAdvanceAt  time.Time  // 上次轮转时间
        watchdogTimer  *time.Timer // 看门狗计时器
        currentTurnID  int64      // 当前轮次ID（用于检测异常）
}

// NewTurnManager 创建轮转管理器
func NewTurnManager(gs *GameSession) *TurnManager {
        return &TurnManager{
                gs:            gs,
                currentTurnID: time.Now().UnixNano(),
        }
}

// AdvanceToNextTurn 统一轮转入口（公共入口，会获取 gs.mu 锁）
// 用于外部调用，会自动获取游戏锁
func (tm *TurnManager) AdvanceToNextTurn(fromPlayerIdx int, isPass bool) {
        gs := tm.gs
        gs.mu.Lock()
        defer gs.mu.Unlock()

        tm.advanceToNextTurnInternal(fromPlayerIdx, isPass)
}

// advanceToNextTurnInternal 统一轮转内部方法
// ⚠️ 调用者必须持有 gs.mu 锁！
// 这是解决机器人轮转卡死问题的关键修复
func (tm *TurnManager) advanceToNextTurnInternal(fromPlayerIdx int, isPass bool) {
        tm.turnMu.Lock()
        defer tm.turnMu.Unlock()

        // 防止重复轮转
        if tm.isAdvancing {
                log.Printf("[TURN] ⚠️ 轮转正在进行中，跳过重复请求 (fromPlayer=%d)", fromPlayerIdx)
                return
        }

        tm.isAdvancing = true
        defer func() {
                tm.isAdvancing = false
                tm.lastAdvanceAt = time.Now()
        }()

        // 更新轮次ID
        tm.currentTurnID = time.Now().UnixNano()
        turnID := tm.currentTurnID

        gs := tm.gs

        // 验证游戏状态
        if gs.state != GameStatePlaying {
                log.Printf("[TURN] ⚠️ 游戏状态不是 Playing，跳过轮转: state=%d", gs.state)
                return
        }

        // 验证调用者是否是当前玩家（防止异常调用）
        if fromPlayerIdx != gs.currentPlayer {
                log.Printf("[TURN] ⚠️ 轮转请求者不是当前玩家: fromPlayer=%d, currentPlayer=%d",
                        fromPlayerIdx, gs.currentPlayer)
                return
        }

        // 计算下一个玩家
        nextPlayerIdx := (gs.currentPlayer + 1) % 3
        nextPlayer := gs.players[nextPlayerIdx]

        log.Printf("[TURN] ========== 开始轮转 ==========")
        log.Printf("[TURN] 当前玩家: %d (%s), 下一玩家: %d (%s)",
                gs.currentPlayer, gs.players[gs.currentPlayer].Name,
                nextPlayerIdx, nextPlayer.Name)
        log.Printf("[TURN] 操作类型: %s, 轮次ID: %d", map[bool]string{true: "不出", false: "出牌"}[isPass], turnID)

        // 步骤1: 推进 currentSeat
        gs.currentPlayer = nextPlayerIdx

        // 步骤2: 计算是否必须出牌
        mustPlay := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        canBeat := mustPlay
        if !mustPlay {
                beatingCards := rule.FindSmallestBeatingCards(nextPlayer.Hand, gs.lastPlayedHand)
                canBeat = beatingCards != nil
        }

        // 步骤3: 广播 turn change
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayTurn, &protocol.PlayTurnPayload{
                PlayerID: nextPlayer.ID,
                Timeout:  gs.gameConfig.TurnTimeout,
                MustPlay: mustPlay,
                CanBeat:  canBeat,
        }))

        log.Printf("[TURN] 已广播轮次变更: player=%s, mustPlay=%v, canBeat=%v",
                nextPlayer.Name, mustPlay, canBeat)

        // 步骤4: 启动倒计时
        tm.startTurnTimerInternal(gs, turnID)

        // 步骤5: 如果下一位是机器人或托管，调度自动出牌
        if nextPlayer.IsRobot() || nextPlayer.IsTrustee {
                log.Printf("[AUTO] 下一位玩家 %s 是机器人/托管状态，调度自动出牌", nextPlayer.Name)
                tm.scheduleAutoPlayInternal(gs, nextPlayerIdx, turnID)
        }

        // 步骤6: 启动看门狗（超时兜底）
        tm.startWatchdogInternal(gs, turnID)

        log.Printf("[TURN] ========== 轮转完成 ==========")
}

// startTurnTimerInternal 启动回合倒计时（内部方法，需持有 gs.mu）
func (tm *TurnManager) startTurnTimerInternal(gs *GameSession, turnID int64) {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        // 停止旧计时器
        if gs.turnTimer != nil {
                gs.turnTimer.Stop()
                gs.turnTimer = nil
        }

        // 设置过期时间
        turnTimeout := gs.gameConfig.TurnTimeoutDuration()
        gs.timerExpiresAt = time.Now().Add(turnTimeout)

        log.Printf("[TURN] 启动倒计时: timeout=%v, turnID=%d", turnTimeout, turnID)

        // 启动计时器
        gs.turnTimer = time.AfterFunc(turnTimeout, func() {
                log.Printf("[TURN] 倒计时触发, turnID=%d", turnID)
                tm.handleTurnTimeout(turnID)
        })
}

// scheduleAutoPlayInternal 调度自动出牌（内部方法，需持有 gs.mu）
func (tm *TurnManager) scheduleAutoPlayInternal(gs *GameSession, playerIdx int, turnID int64) {
        gs.timerMu.Lock()
        defer gs.timerMu.Unlock()

        // 停止旧的机器人计时器
        if gs.robotTimer != nil {
                gs.robotTimer.Stop()
                gs.robotTimer = nil
        }

        // 随机延迟 800-1500ms
        delay := time.Duration(800+rand.IntN(700)) * time.Millisecond
        log.Printf("[AUTO] 调度自动出牌: playerIdx=%d, delay=%v, turnID=%d", playerIdx, delay, turnID)

        gs.robotTimer = time.AfterFunc(delay, func() {
                log.Printf("[AUTO] 自动出牌回调执行, playerIdx=%d, turnID=%d", playerIdx, turnID)
                tm.executeAutoPlay(playerIdx, turnID)
        })
}

// executeAutoPlay 执行自动出牌（机器人/托管）
func (tm *TurnManager) executeAutoPlay(playerIdx int, expectedTurnID int64) {
        // 验证轮次ID（防止过期的调度执行）
        tm.turnMu.Lock()
        if tm.currentTurnID != expectedTurnID {
                log.Printf("[AUTO] ⚠️ 轮次ID不匹配，跳过过期调度: expected=%d, current=%d",
                        expectedTurnID, tm.currentTurnID)
                tm.turnMu.Unlock()
                return
        }
        tm.turnMu.Unlock()

        // 使用内部方法执行出牌（保持锁的连续性）
        tm.doAutoPlayInternal(playerIdx)
}

// doAutoPlayInternal 内部执行自动出牌（解决锁管理问题）
// 关键修复：不出牌逻辑在同一个锁周期内完成，避免竞态条件
func (tm *TurnManager) doAutoPlayInternal(playerIdx int) {
        gs := tm.gs

        gs.mu.Lock()
        defer gs.mu.Unlock()

        log.Printf("[AUTO] doAutoPlayInternal 开始: playerIdx=%d", playerIdx)

        // 验证游戏状态
        if gs.state != GameStatePlaying {
                log.Printf("[AUTO] ⚠️ 游戏状态不是 Playing: state=%d", gs.state)
                return
        }

        // 验证当前玩家
        if gs.currentPlayer != playerIdx {
                log.Printf("[AUTO] ⚠️ 玩家索引不匹配: expected=%d, current=%d", playerIdx, gs.currentPlayer)
                return
        }

        currentPlayer := gs.players[playerIdx]
        playerID := currentPlayer.ID

        log.Printf("[AUTO] 当前玩家: %s (ID: %s), IsRobot: %v, IsTrustee: %v",
                currentPlayer.Name, playerID, currentPlayer.IsRobot(), currentPlayer.IsTrustee)

        // 【关键修复】在这里停止计时器，而不是在调用 HandlePlayCards 后
        gs.stopTimerInternal()

        // 做出决策
        decision := gs.makeRobotDecision(currentPlayer)
        if decision != nil {
                cardsLen := 0
                if decision.Cards != nil {
                        cardsLen = len(decision.Cards)
                }
                log.Printf("[AUTO] 决策结果: ShouldPlay=%v, Cards=%d, Reason=%s",
                        decision.ShouldPlay, cardsLen, decision.Reason)
        } else {
                log.Printf("[AUTO] 决策结果: nil (自动过牌)")
        }

        // 根据决策执行操作
        if decision == nil || !decision.ShouldPlay {
                // 决定过牌 - 使用内部方法避免锁问题
                log.Printf("[AUTO] 玩家 %s 选择过牌", currentPlayer.Name)
                tm.doPassInternal(playerID, playerIdx)
                return
        }

        if decision.Cards != nil && len(decision.Cards) > 0 {
                // 决定出牌 - 使用内部方法避免锁问题
                cardsToPlay := convertCardInfosToCards(decision.Cards)
                cardInfos := convert.CardsToInfos(cardsToPlay)
                log.Printf("[AUTO] 玩家 %s 选择出牌: %v", currentPlayer.Name, cardInfos)
                tm.doPlayCardsInternal(playerID, playerIdx, cardInfos)
                return
        }

        // 兜底：过牌
        log.Printf("[AUTO] 兜底：玩家 %s 过牌", currentPlayer.Name)
        tm.doPassInternal(playerID, playerIdx)
}

// doPlayCardsInternal 内部出牌方法（已持有锁）
// 【关键修复】直接处理出牌逻辑，不重新获取锁
func (tm *TurnManager) doPlayCardsInternal(playerID string, playerIdx int, cardInfos []protocol.CardInfo) {
        gs := tm.gs

        log.Printf("[AUTO] doPlayCardsInternal 开始: playerID=%s", playerID)

        // 获取当前玩家
        currentPlayer := gs.players[gs.currentPlayer]
        if currentPlayer.ID != playerID {
                log.Printf("[AUTO] ⚠️ 玩家ID不匹配: expected=%s, current=%s", playerID, currentPlayer.ID)
                return
        }

        // 转换牌
        cards := convert.InfosToCards(cardInfos)

        // 验证牌是否在手中
        if !gs.validateCardsInHand(currentPlayer, cards) {
                log.Printf("[AUTO] ⚠️ 牌不在手中，改为过牌")
                tm.doPassInternal(playerID, playerIdx)
                return
        }

        // 解析牌型
        handToPlay, err := rule.ParseHand(cards)
        if err != nil {
                log.Printf("[AUTO] ⚠️ 解析牌型失败: %v，改为过牌", err)
                tm.doPassInternal(playerID, playerIdx)
                return
        }

        // 检查是否能打过上家
        isNewRound := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        if !isNewRound {
                canBeat, reason := rule.CanBeat(handToPlay, gs.lastPlayedHand)
                if !canBeat {
                        log.Printf("[AUTO] ⚠️ 打不过上家: %s，改为过牌", reason)
                        tm.doPassInternal(playerID, playerIdx)
                        return
                }
        }

        // 出牌成功，更新状态
        gs.lastPlayedHand = handToPlay
        gs.lastPlayerIdx = gs.currentPlayer
        gs.consecutivePasses = 0

        // 从手牌中移除
        currentPlayer.Hand = card.RemoveCards(currentPlayer.Hand, cards)

        // 广播出牌信息
        sortedCards := make([]card.Card, len(cards))
        copy(sortedCards, cards)
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCardPlayed, &protocol.CardPlayedPayload{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
                Cards:      convert.CardsToInfos(sortedCards),
                CardsLeft:  len(currentPlayer.Hand),
                HandType:   handToPlay.Type.String(),
        }))

        log.Printf("[AUTO] 出牌成功: player=%s, cards=%d, remaining=%d",
                currentPlayer.Name, len(cards), len(currentPlayer.Hand))

        // 检查是否获胜
        if len(currentPlayer.Hand) == 0 {
                log.Printf("[AUTO] 玩家 %s 出完所有牌，游戏结束", currentPlayer.Name)
                gs.endGame(currentPlayer)
                return
        }

        // 【关键】使用统一轮转入口推进到下一个玩家
        tm.advanceToNextTurnInternal(playerIdx, false)
}

// doPassInternal 内部过牌方法（已持有锁）
// 【关键修复】直接处理过牌逻辑，不重新获取锁
func (tm *TurnManager) doPassInternal(playerID string, playerIdx int) {
        gs := tm.gs

        log.Printf("[AUTO] doPassInternal 开始: playerID=%s", playerID)

        // 获取当前玩家
        currentPlayer := gs.players[gs.currentPlayer]
        if currentPlayer.ID != playerID {
                log.Printf("[AUTO] ⚠️ 玩家ID不匹配: expected=%s, current=%s", playerID, currentPlayer.ID)
                return
        }

        // 检查是否必须出牌
        mustPlay := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        if mustPlay {
                // 必须出牌时，尝试出最小的牌
                log.Printf("[AUTO] ⚠️ 必须出牌，尝试出最小牌")
                hintCards := rule.FindSmallestBeatingCards(currentPlayer.Hand, rule.ParsedHand{})
                if len(hintCards) > 0 {
                        cardInfos := convert.CardsToInfos(hintCards)
                        tm.doPlayCardsInternal(playerID, playerIdx, cardInfos)
                        return
                }
                // 如果实在没有牌可出，强制出第一张
                if len(currentPlayer.Hand) > 0 {
                        cardInfos := convert.CardsToInfos([]card.Card{currentPlayer.Hand[0]})
                        tm.doPlayCardsInternal(playerID, playerIdx, cardInfos)
                        return
                }
        }

        // 记录不出
        gs.consecutivePasses++

        // 广播不出
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayerPass, &protocol.PlayerPassPayload{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
        }))

        log.Printf("[AUTO] 过牌成功: player=%s, consecutivePasses=%d",
                currentPlayer.Name, gs.consecutivePasses)

        // 如果连续两人不出，新一轮开始
        if gs.consecutivePasses >= 2 {
                gs.lastPlayedHand = rule.ParsedHand{}
                gs.lastPlayerIdx = (gs.currentPlayer + 1) % 3
                gs.consecutivePasses = 0
                log.Printf("[AUTO] 连续两人不出，开始新回合")
        }

        // 【关键】使用统一轮转入口推进到下一个玩家
        tm.advanceToNextTurnInternal(playerIdx, true)
}

// handleTurnTimeout 处理回合超时
func (tm *TurnManager) handleTurnTimeout(expectedTurnID int64) {
        gs := tm.gs

        // 验证轮次ID
        tm.turnMu.Lock()
        if tm.currentTurnID != expectedTurnID {
                log.Printf("[TURN] ⚠️ 轮次ID不匹配，跳过过期超时: expected=%d, current=%d",
                        expectedTurnID, tm.currentTurnID)
                tm.turnMu.Unlock()
                return
        }
        tm.turnMu.Unlock()

        log.Printf("[AUTO] handleTurnTimeout 触发, turnID=%d", expectedTurnID)

        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 验证游戏状态
        if gs.state != GameStatePlaying {
                log.Printf("[AUTO] ⚠️ 游戏状态不是 Playing: state=%d", gs.state)
                return
        }

        currentPlayer := gs.players[gs.currentPlayer]
        log.Printf("[AUTO] 玩家 %s 超时，开启托管并自动出牌", currentPlayer.Name)

        // 开启托管状态
        if !currentPlayer.IsRobot() && !currentPlayer.IsTrustee {
                currentPlayer.EnableTrustee()
                gs.broadcastTrusteeState(currentPlayer.ID, currentPlayer.Name, true, "timeout")
        }

        // 停止计时器
        gs.stopTimerInternal()

        // 执行自动出牌
        playerIdx := gs.currentPlayer
        playerID := currentPlayer.ID

        // 做出决策
        decision := gs.makeRobotDecision(currentPlayer)

        // 根据决策执行操作
        if decision == nil || !decision.ShouldPlay {
                tm.doPassInternal(playerID, playerIdx)
                return
        }

        if decision.Cards != nil && len(decision.Cards) > 0 {
                cardsToPlay := convertCardInfosToCards(decision.Cards)
                cardInfos := convert.CardsToInfos(cardsToPlay)
                tm.doPlayCardsInternal(playerID, playerIdx, cardInfos)
                return
        }

        tm.doPassInternal(playerID, playerIdx)
}

// startWatchdogInternal 启动看门狗计时器（超时兜底）
func (tm *TurnManager) startWatchdogInternal(gs *GameSession, turnID int64) {
        // 停止旧的看门狗
        if tm.watchdogTimer != nil {
                tm.watchdogTimer.Stop()
        }

        // 看门狗时间：倒计时的 1.5 倍
        watchdogTimeout := gs.gameConfig.TurnTimeoutDuration() * 3 / 2
        if watchdogTimeout < 5*time.Second {
                watchdogTimeout = 5 * time.Second
        }

        log.Printf("[WATCHDOG] 启动看门狗: timeout=%v, turnID=%d", watchdogTimeout, turnID)

        tm.watchdogTimer = time.AfterFunc(watchdogTimeout, func() {
                tm.checkWatchdog(turnID)
        })
}

// checkWatchdog 检查看门狗状态
func (tm *TurnManager) checkWatchdog(expectedTurnID int64) {
        tm.turnMu.Lock()
        currentTurnID := tm.currentTurnID
        lastAdvanceAt := tm.lastAdvanceAt
        tm.turnMu.Unlock()

        // 如果轮次已经改变，说明正常推进了
        if currentTurnID != expectedTurnID {
                log.Printf("[WATCHDOG] 轮次已改变，看门狗无需处理: expected=%d, current=%d",
                        expectedTurnID, currentTurnID)
                return
        }

        // 检查是否真的卡住了
        gs := tm.gs
        gs.mu.RLock()
        currentPlayer := gs.currentPlayer
        gameState := gs.state
        gs.mu.RUnlock()

        if gameState != GameStatePlaying {
                log.Printf("[WATCHDOG] 游戏状态已改变，无需处理: state=%d", gameState)
                return
        }

        // 强制推进
        log.Printf("[WATCHDOG] ⚠️ 检测到卡住！强制推进游戏")
        log.Printf("[WATCHDOG] 当前玩家: %d, 上次轮转: %v", currentPlayer, lastAdvanceAt)

        // 直接触发超时处理
        tm.handleTurnTimeout(expectedTurnID)
}

// Stop 停止所有计时器
func (tm *TurnManager) Stop() {
        tm.turnMu.Lock()
        defer tm.turnMu.Unlock()

        if tm.watchdogTimer != nil {
                tm.watchdogTimer.Stop()
                tm.watchdogTimer = nil
        }
}
