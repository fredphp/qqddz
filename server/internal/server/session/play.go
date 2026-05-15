package session

import (
        "log"
        "sort"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// HandlePlayCards 处理出牌
func (gs *GameSession) HandlePlayCards(playerID string, cardInfos []protocol.CardInfo) error {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        if gs.state != GameStatePlaying {
                return apperrors.ErrGameNotStart
        }

        currentPlayer := gs.players[gs.currentPlayer]
        if currentPlayer.ID != playerID {
                return apperrors.ErrNotYourTurn
        }

        // 🔧【托管】玩家主动出牌，取消托管状态
        if currentPlayer.IsTrustee {
                log.Printf("[TRUSTEE] 玩家 %s 主动出牌，取消托管状态", currentPlayer.Name)
                currentPlayer.DisableTrustee()
                // 停止机器人计时器
                gs.StopRobotTimer()
                // 广播取消托管状态
                gs.BroadcastTrusteeState(playerID, currentPlayer.Name, false, "player_action")
        }

        // 🔧【调试日志】打印原始请求数据
        log.Printf("🃏 [HandlePlayCards] ========== 开始处理出牌 ==========")
        log.Printf("🃏 [HandlePlayCards] 玩家: %s (ID: %s)", currentPlayer.Name, playerID)
        log.Printf("🃏 [HandlePlayCards] 原始请求数据: %+v", cardInfos)
        
        // 转换牌
        cards := convert.InfosToCards(cardInfos)
        
        // 🔧【调试日志】打印转换后的牌
        log.Printf("🃏 [HandlePlayCards] 转换后的牌: 数量=%d", len(cards))
        for i, c := range cards {
                cardName := c.String()
                log.Printf("🃏 [HandlePlayCards] 牌[%d]: %s (suit=%d, rank=%d, color=%d)", 
                        i, cardName, c.Suit, c.Rank, c.Color)
        }

        // 验证牌是否在手中
        if !gs.validateCardsInHand(currentPlayer, cards) {
                log.Printf("🃏 [HandlePlayCards] 验证失败：牌不在手中！")
                return apperrors.ErrInvalidCards
        }

        // 解析牌型
        handToPlay, err := rule.ParseHand(cards)
        if err != nil {
                log.Printf("🃏 [HandlePlayCards] 解析牌型失败: %v", err)
                return apperrors.ErrInvalidCards
        }
        log.Printf("🃏 [HandlePlayCards] 解析牌型成功: type=%s, keyRank=%d", handToPlay.Type.String(), handToPlay.KeyRank)

        // 检查是否能打过上家
        isNewRound := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        log.Printf("🃏 [HandlePlayCards] 比较检查: isNewRound=%v", isNewRound)
        
        if !isNewRound {
                // 🔧【调试日志】打印上家出的牌
                log.Printf("🃏 [HandlePlayCards] 上家出的牌: type=%s, keyRank=%d", 
                        gs.lastPlayedHand.Type.String(), gs.lastPlayedHand.KeyRank)
                if len(gs.lastPlayedHand.Cards) > 0 {
                        for i, c := range gs.lastPlayedHand.Cards {
                                log.Printf("🃏 [HandlePlayCards] 上家牌[%d]: %s (rank=%d)", i, c.String(), c.Rank)
                        }
                }
                
                // 🔧【调试日志】打印当前玩家出的牌
                log.Printf("🃏 [HandlePlayCards] 当前玩家出的牌: type=%s, keyRank=%d", 
                        handToPlay.Type.String(), handToPlay.KeyRank)
                for i, c := range handToPlay.Cards {
                        log.Printf("🃏 [HandlePlayCards] 当前玩家牌[%d]: %s (rank=%d)", i, c.String(), c.Rank)
                }
                
                canBeat, reason := rule.CanBeat(handToPlay, gs.lastPlayedHand)
                log.Printf("🃏 [HandlePlayCards] CanBeat结果: %v (比较: %d > %d = %v)",
                        canBeat, handToPlay.KeyRank, gs.lastPlayedHand.KeyRank, handToPlay.KeyRank > gs.lastPlayedHand.KeyRank)
                if !canBeat {
                        log.Printf("🃏 [HandlePlayCards] ❌ 出牌失败：打不过上家，原因: %s", reason)
                        // 🔧【新增】返回包含详细原因的错误
                        return apperrors.NewGameError(protocol.ErrCodeCannotBeat, reason)
                }
        }

        // 所有验证通过后才取消计时器
        gs.stopTimer()

        // 出牌成功，更新状态
        gs.lastPlayedHand = handToPlay
        gs.lastPlayerIdx = gs.currentPlayer
        gs.consecutivePasses = 0

        // 从手牌中移除
        currentPlayer.Hand = card.RemoveCards(currentPlayer.Hand, cards)

        // 对出的牌进行排序（从大到小），确保显示顺序正确
        sortedCards := make([]card.Card, len(cards))
        copy(sortedCards, cards)
        sort.Slice(sortedCards, func(i, j int) bool {
                return sortedCards[i].Rank > sortedCards[j].Rank
        })

        // 记录出牌日志
        playerRole := database.PlayerRoleFarmer
        if currentPlayer.IsLandlord {
                playerRole = database.PlayerRoleLandlord
        }
        gs.gameLogger.RecordPlayLog(playerID, playerRole, database.PlayTypePlay, sortedCards, handToPlay.Type)

        // 🔊【新增】获取玩家性别
        playerGender := "male"
        if currentPlayer.Gender == "female" {
                playerGender = "female"
        }

        // 🔧【新增】获取主牌点数（用于音效播放）
        mainRank := 0
        if len(sortedCards) > 0 {
                // 单张/对子/三张：直接使用牌的点数
                // 其他牌型：使用 KeyRank（决定大小的关键牌）
                mainRank = int(handToPlay.KeyRank)
                if mainRank == 0 {
                        mainRank = int(sortedCards[0].Rank)
                }
        }

        // 🔧【新增】计算 is_new_round 和 can_beat
        // isNewRound: 是否是新回合（首出）
        // canBeat: 是否压过上家（非新回合时，出牌压过上家）
        canBeat := !isNewRound

        // 广播出牌信息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgCardPlayed, &protocol.CardPlayedPayload{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
                Cards:      convert.CardsToInfos(sortedCards), // 使用排序后的牌
                CardsLeft:  len(currentPlayer.Hand),
                HandType:   handToPlay.Type.String(),
                Rank:       mainRank, // 🔧【新增】主牌点数
                Gender:     playerGender,
                IsNewRound: isNewRound, // 🔧【新增】是否是新回合
                CanBeat:    canBeat,    // 🔧【新增】是否压过上家
        }))

        // 检查是否获胜
        if len(currentPlayer.Hand) == 0 {
                gs.endGame(currentPlayer)
                return nil
        }

        // 🔧【修复】使用统一轮转入口推进到下一个玩家
        // 这是解决机器人轮转卡死问题的关键修复
        log.Printf("[TURN] HandlePlayCards 完成，调用统一轮转入口")
        gs.turnManager.advanceToNextTurnInternal(gs.currentPlayer, false)

        return nil
}

// HandlePass 处理不出
func (gs *GameSession) HandlePass(playerID string) error {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        if gs.state != GameStatePlaying {
                return apperrors.ErrGameNotStart
        }

        currentPlayer := gs.players[gs.currentPlayer]
        if currentPlayer.ID != playerID {
                return apperrors.ErrNotYourTurn
        }

        // 🔧【托管】玩家主动过牌，取消托管状态
        if currentPlayer.IsTrustee {
                log.Printf("[TRUSTEE] 玩家 %s 主动过牌，取消托管状态", currentPlayer.Name)
                currentPlayer.DisableTrustee()
                // 停止机器人计时器
                gs.StopRobotTimer()
                // 广播取消托管状态
                gs.BroadcastTrusteeState(playerID, currentPlayer.Name, false, "player_action")
        }

        // 检查是否必须出牌
        mustPlay := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()
        if mustPlay {
                return apperrors.ErrMustPlay
        }

        // 取消超时计时器
        gs.stopTimer()

        gs.consecutivePasses++

        // 记录不出日志
        playerRole := database.PlayerRoleFarmer
        if currentPlayer.IsLandlord {
                playerRole = database.PlayerRoleLandlord
        }
        gs.gameLogger.RecordPlayLog(playerID, playerRole, database.PlayTypePass, nil, rule.HandType(0))

        // 🔊【新增】获取玩家性别
        playerGender := "male"
        if currentPlayer.Gender == "female" {
                playerGender = "female"
        }

        // 广播不出
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayerPass, &protocol.PlayerPassPayload{
                PlayerID:   playerID,
                PlayerName: currentPlayer.Name,
                Gender:     playerGender,
        }))

        // 如果连续两人不出，新一轮开始
        if gs.consecutivePasses >= 2 {
                gs.lastPlayedHand = rule.ParsedHand{}
                gs.lastPlayerIdx = (gs.currentPlayer + 1) % 3
                gs.consecutivePasses = 0
                // 开始新回合
                gs.gameLogger.StartNewRound()
        }

        // 🔧【修复】使用统一轮转入口推进到下一个玩家
        // 这是解决机器人轮转卡死问题的关键修复
        log.Printf("[TURN] HandlePass 完成，调用统一轮转入口")
        gs.turnManager.advanceToNextTurnInternal(gs.currentPlayer, true)

        return nil
}

// HandleHint 处理提示请求
func (gs *GameSession) HandleHint(playerID string) ([]card.Card, error) {
        gs.mu.RLock()
        defer gs.mu.RUnlock()

        if gs.state != GameStatePlaying {
                return nil, apperrors.ErrGameNotStart
        }

        currentPlayer := gs.players[gs.currentPlayer]
        if currentPlayer.ID != playerID {
                return nil, apperrors.ErrNotYourTurn
        }

        // 使用现有的 FindSmallestBeatingCards 函数
        hintCards := rule.FindSmallestBeatingCards(currentPlayer.Hand, gs.lastPlayedHand)
        return hintCards, nil
}

// validateCardsInHand 验证牌是否在手中
func (gs *GameSession) validateCardsInHand(player *GamePlayer, cards []card.Card) bool {
        handCopy := make([]card.Card, len(player.Hand))
        copy(handCopy, player.Hand)

        // 🔧【调试日志】打印玩家手牌和要出的牌
        log.Printf("🃏 [validateCardsInHand] 玩家手牌数量: %d", len(player.Hand))
        for i, h := range player.Hand {
                log.Printf("🃏 [validateCardsInHand] 手牌[%d]: suit=%d, rank=%d", i, h.Suit, h.Rank)
        }
        log.Printf("🃏 [validateCardsInHand] 要出的牌数量: %d", len(cards))
        for i, c := range cards {
                log.Printf("🃏 [validateCardsInHand] 出牌[%d]: suit=%d, rank=%d", i, c.Suit, c.Rank)
        }

        for _, c := range cards {
                found := false
                for i, h := range handCopy {
                        if h.Suit == c.Suit && h.Rank == c.Rank {
                                handCopy = append(handCopy[:i], handCopy[i+1:]...)
                                found = true
                                break
                        }
                }
                if !found {
                        log.Printf("🃏 [validateCardsInHand] ❌ 牌不在手中: suit=%d, rank=%d", c.Suit, c.Rank)
                        return false
                }
        }
        return true
}

// GetPlayerCardsCount 获取玩家手牌数量
func (gs *GameSession) GetPlayerCardsCount(playerID string) int {
        gs.mu.RLock()
        defer gs.mu.RUnlock()

        for _, p := range gs.players {
                if p.ID == playerID {
                        return len(p.Hand)
                }
        }
        return 0
}

// notifyPlayTurn 通知当前玩家出牌
// 🔧【修复】重写此函数，使用统一轮转管理器
// 注意：此函数现在仅用于游戏开始时的第一个回合
// 后续回合通过 AdvanceToNextTurn 推进
func (gs *GameSession) notifyPlayTurn() {
        player := gs.players[gs.currentPlayer]
        mustPlay := gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty()

        // 计算是否能打过上家
        canBeat := mustPlay // 如果必须出牌，则肯定能出（新一轮）
        if !mustPlay {
                // 检查是否有能打过上家的牌
                beatingCards := rule.FindSmallestBeatingCards(player.Hand, gs.lastPlayedHand)
                canBeat = beatingCards != nil
        }

        log.Printf("[TURN] notifyPlayTurn: player=%s, mustPlay=%v, canBeat=%v, IsRobot=%v, IsTrustee=%v",
                player.Name, mustPlay, canBeat, player.IsRobot(), player.IsTrustee)

        // 广播出牌回合消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayTurn, &protocol.PlayTurnPayload{
                PlayerID: player.ID,
                Timeout:  gs.gameConfig.TurnTimeout,
                MustPlay: mustPlay,
                CanBeat:  canBeat,
        }))

        // 🔧【修复】使用统一轮转管理器启动回合
        // 初始化轮转管理器的状态
        if gs.turnManager != nil {
                // 启动倒计时
                turnID := time.Now().UnixNano()
                gs.turnManager.turnMu.Lock()
                gs.turnManager.currentTurnID = turnID
                gs.turnManager.turnMu.Unlock()

                gs.turnManager.startTurnTimerInternal(gs, turnID)

                // 如果是机器人/托管，调度自动出牌
                if player.IsRobot() || player.IsTrustee {
                        log.Printf("[AUTO] notifyPlayTurn: 玩家 %s 是机器人/托管，调度自动出牌", player.Name)
                        gs.turnManager.scheduleAutoPlayInternal(gs, gs.currentPlayer, turnID)
                }

                // 启动看门狗
                gs.turnManager.startWatchdogInternal(gs, turnID)
                return
        }

        // 兜底：如果轮转管理器不可用，使用旧逻辑
        log.Printf("[TURN] ⚠️ 轮转管理器不可用，使用旧逻辑")
        if player.IsRobot() || player.IsTrustee {
                log.Printf("[TRUSTEE] 玩家 %s 托管状态，准备自动出牌", player.Name)
                gs.startPlayTimer()
                gs.scheduleRobotAction(func() {
                        gs.handleRobotPlay()
                })
                return
        }

        // 普通玩家，启动倒计时
        gs.startPlayTimer()
}
