// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
        "log"
        "math/rand"
        "sort"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// RobotStrategy 机器人策略模块
// =============================================

// RobotStrategy 机器人策略模块
// 封装各种游戏策略，包括地主策略、农民策略、让牌策略等
type RobotStrategy struct {
        config *database.RobotAIConfig
        memory *CardMemory
        ai     *RobotAI
}

// NewRobotStrategy 创建策略模块
func NewRobotStrategy(config *database.RobotAIConfig, memory *CardMemory, ai *RobotAI) *RobotStrategy {
        return &RobotStrategy{
                config: config,
                memory: memory,
                ai:     ai,
        }
}

// =============================================
// 地主策略
// =============================================

// LandlordStrategyResult 地主策略结果
type LandlordStrategyResult struct {
        PlayStyle      string       `json:"play_style"`       // 打法风格
        PriorityCards  []CardInfo   `json:"priority_cards"`   // 优先出的牌
        DangerLevel    int          `json:"danger_level"`     // 危险等级 0-10
        ShouldAttack   bool         `json:"should_attack"`    // 是否应该进攻
        ShouldDefend   bool         `json:"should_defend"`    // 是否应该防守
        Reason         string       `json:"reason"`           // 策略原因
}

// LandlordStrategy 地主策略
// 地主的核心策略是：快速出完手牌，合理使用炸弹，压制农民
func (s *RobotStrategy) LandlordStrategy(gameState *GameState) *LandlordStrategyResult {
        log.Printf("[Strategy] 执行地主策略")

        result := &LandlordStrategyResult{
                PlayStyle: "balanced",
        }

        // 分析当前局势
        myCards := gameState.MyHandCards
        cardsCount := len(myCards)

        // 获取对手剩余牌数
        farmer1Cards := s.getFarmerCards(gameState, 1)
        farmer2Cards := s.getFarmerCards(gameState, 2)
        minFarmerCards := min(farmer1Cards, farmer2Cards)

        // 计算危险等级
        result.DangerLevel = s.calculateDangerLevel(cardsCount, minFarmerCards)

        // 根据局势决定打法
        if minFarmerCards <= 3 {
                // 对手快出完了，紧急进攻
                result.PlayStyle = "urgent_attack"
                result.ShouldAttack = true
                result.ShouldDefend = false
                result.Reason = "对手即将出完，紧急进攻"
        } else if cardsCount <= 5 {
                // 我快出完了，全力进攻
                result.PlayStyle = "final_sprint"
                result.ShouldAttack = true
                result.ShouldDefend = false
                result.Reason = "即将获胜，全力冲刺"
        } else if result.DangerLevel >= 7 {
                // 局势危险，保守防守
                result.PlayStyle = "defensive"
                result.ShouldAttack = false
                result.ShouldDefend = true
                result.Reason = "局势危险，保守防守"
        } else {
                // 正常打法
                result.PlayStyle = "balanced"
                result.ShouldAttack = true
                result.ShouldDefend = false
                result.Reason = "正常出牌"
        }

        // 确定优先出的牌
        result.PriorityCards = s.determinePriorityCards(myCards, result.PlayStyle)

        log.Printf("[Strategy] 地主策略: 风格=%s, 危险等级=%d, 进攻=%v, 防守=%v",
                result.PlayStyle, result.DangerLevel, result.ShouldAttack, result.ShouldDefend)

        return result
}

// calculateDangerLevel 计算危险等级
func (s *RobotStrategy) calculateDangerLevel(myCards, opponentMinCards int) int {
        // 危险等级基于：
        // 1. 我的手牌数量
        // 2. 对手最少剩余牌数
        // 3. 炸弹使用情况

        danger := 0

        // 对手剩余牌越少越危险
        if opponentMinCards <= 2 {
                danger += 5
        } else if opponentMinCards <= 5 {
                danger += 3
        } else if opponentMinCards <= 10 {
                danger += 1
        }

        // 我的手牌越多越危险
        if myCards > 15 {
                danger += 2
        } else if myCards > 10 {
                danger += 1
        }

        // 限制最大值
        if danger > 10 {
                danger = 10
        }

        return danger
}

// getFarmerCards 获取农民剩余牌数
func (s *RobotStrategy) getFarmerCards(gameState *GameState, farmerIndex int) int {
        switch farmerIndex {
        case 1:
                if gameState.Player1Role == database.PlayerRoleFarmer {
                        return gameState.Player1Cards
                }
                if gameState.Player2Role == database.PlayerRoleFarmer {
                        return gameState.Player2Cards
                }
                if gameState.Player3Role == database.PlayerRoleFarmer {
                        return gameState.Player3Cards
                }
        case 2:
                var firstFound bool
                if gameState.Player1Role == database.PlayerRoleFarmer {
                        if !firstFound {
                                firstFound = true
                        } else {
                                return gameState.Player1Cards
                        }
                }
                if gameState.Player2Role == database.PlayerRoleFarmer {
                        if !firstFound {
                                firstFound = true
                        } else {
                                return gameState.Player2Cards
                        }
                }
                if gameState.Player3Role == database.PlayerRoleFarmer {
                        if !firstFound {
                                firstFound = true
                        } else {
                                return gameState.Player3Cards
                        }
                }
        }
        return 17
}

// determinePriorityCards 确定优先出的牌
func (s *RobotStrategy) determinePriorityCards(cards []CardInfo, playStyle string) []CardInfo {
        // 根据打法风格确定优先级
        switch playStyle {
        case "urgent_attack":
                // 紧急进攻：优先出小牌
                return s.getSmallestCards(cards, 1)
        case "final_sprint":
                // 最后冲刺：出能一次清的牌
                return s.getSmallestCards(cards, 1)
        case "defensive":
                // 防守：出中等大小的牌
                return s.getMediumCards(cards, 1)
        default:
                // 平衡：出小牌
                return s.getSmallestCards(cards, 1)
        }
}

// =============================================
// 农民策略
// =============================================

// FarmerStrategyResult 农民策略结果
type FarmerStrategyResult struct {
        PlayStyle       string     `json:"play_style"`       // 打法风格
        PriorityCards   []CardInfo `json:"priority_cards"`   // 优先出的牌
        ShouldHelpTeam  bool       `json:"should_help_team"` // 是否应该帮队友
        ShouldBlock     bool       `json:"should_block"`     // 是否应该阻挡地主
        TargetPlayer    uint64     `json:"target_player"`    // 目标玩家ID
        Reason          string     `json:"reason"`           // 策略原因
}

// FarmerStrategy 农民策略
// 农民的核心策略是：配合队友，合理出牌，阻止地主获胜
func (s *RobotStrategy) FarmerStrategy(gameState *GameState) *FarmerStrategyResult {
        log.Printf("[Strategy] 执行农民策略")

        result := &FarmerStrategyResult{
                PlayStyle: "cooperative",
        }

        // 分析当前局势
        myCards := gameState.MyHandCards
        cardsCount := len(myCards)

        // 获取地主剩余牌数
        landlordCards := s.getLandlordCards(gameState)

        // 获取队友剩余牌数
        teammateCards := s.getTeammateCards(gameState)

        // 根据局势决定打法
        if landlordCards <= 3 {
                // 地主快出完了，紧急阻挡
                result.PlayStyle = "block_urgent"
                result.ShouldBlock = true
                result.ShouldHelpTeam = false
                result.Reason = "地主即将出完，紧急阻挡"
        } else if teammateCards <= 3 && teammateCards < cardsCount {
                // 队友快出完了，帮队友
                result.PlayStyle = "help_teammate"
                result.ShouldHelpTeam = true
                result.ShouldBlock = false
                result.Reason = "队友即将获胜，帮助队友"
        } else if cardsCount <= 5 {
                // 我快出完了，全力冲刺
                result.PlayStyle = "final_sprint"
                result.ShouldHelpTeam = false
                result.ShouldBlock = true
                result.Reason = "我即将获胜，全力冲刺"
        } else {
                // 正常配合打法
                result.PlayStyle = "cooperative"
                result.ShouldHelpTeam = true
                result.ShouldBlock = true
                result.Reason = "正常配合出牌"
        }

        // 确定优先出的牌
        result.PriorityCards = s.determinePriorityCards(myCards, result.PlayStyle)

        log.Printf("[Strategy] 农民策略: 风格=%s, 帮队友=%v, 阻挡=%v",
                result.PlayStyle, result.ShouldHelpTeam, result.ShouldBlock)

        return result
}

// getLandlordCards 获取地主剩余牌数
func (s *RobotStrategy) getLandlordCards(gameState *GameState) int {
        if gameState.Player1Role == database.PlayerRoleLandlord {
                return gameState.Player1Cards
        }
        if gameState.Player2Role == database.PlayerRoleLandlord {
                return gameState.Player2Cards
        }
        if gameState.Player3Role == database.PlayerRoleLandlord {
                return gameState.Player3Cards
        }
        return 20
}

// getTeammateCards 获取队友剩余牌数
func (s *RobotStrategy) getTeammateCards(gameState *GameState) int {
        if gameState.MyRole != database.PlayerRoleFarmer {
                return 17
        }

        // 找另一个农民
        if gameState.Player1Role == database.PlayerRoleFarmer {
                return gameState.Player1Cards
        }
        if gameState.Player2Role == database.PlayerRoleFarmer {
                return gameState.Player2Cards
        }
        if gameState.Player3Role == database.PlayerRoleFarmer {
                return gameState.Player3Cards
        }
        return 17
}

// =============================================
// 让牌策略
// =============================================

// LetWinStrategyResult 让牌策略结果
type LetWinStrategyResult struct {
        ShouldLetWin    bool       `json:"should_let_win"`    // 是否应该让牌
        TargetPlayer    uint64     `json:"target_player"`     // 让牌目标
        LetWinCards     []CardInfo `json:"let_win_cards"`     // 让牌时出的牌
        LetWinReason    string     `json:"let_win_reason"`    // 让牌原因
        Probability     float64    `json:"probability"`       // 让牌概率
}

// LetWinStrategy 让牌策略
// 在特定条件下故意让对手获胜
func (s *RobotStrategy) LetWinStrategy(gameState *GameState, targetPlayerID uint64) *LetWinStrategyResult {
        log.Printf("[Strategy] 执行让牌策略: 目标玩家=%d", targetPlayerID)

        result := &LetWinStrategyResult{
                TargetPlayer: targetPlayerID,
        }

        // 检查是否允许让牌
        if !s.config.IsLetWinAllowed() {
                result.ShouldLetWin = false
                result.LetWinReason = "AI配置不允许让牌"
                return result
        }

        // 获取目标玩家剩余牌数
        targetCards := s.getPlayerCards(gameState, targetPlayerID)

        // 检查让牌条件
        // 1. 目标玩家剩余牌数较少
        if targetCards > s.config.LetWinCardCount {
                result.ShouldLetWin = false
                result.LetWinReason = "目标玩家剩余牌数较多"
                return result
        }

        // 2. 根据概率决定是否让牌
        result.Probability = s.config.LetWinThreshold
        if rand.Float64() > result.Probability {
                result.ShouldLetWin = false
                result.LetWinReason = "未达到让牌概率阈值"
                return result
        }

        // 满足让牌条件
        result.ShouldLetWin = true
        result.LetWinReason = "满足让牌条件"

        // 确定让牌时出的牌（最小牌）
        result.LetWinCards = s.getSmallestCards(gameState.MyHandCards, 1)

        log.Printf("[Strategy] 让牌策略: shouldLetWin=%v, 概率=%.2f",
                result.ShouldLetWin, result.Probability)

        return result
}

// getPlayerCards 获取玩家剩余牌数
func (s *RobotStrategy) getPlayerCards(gameState *GameState, playerID uint64) int {
        if gameState.Player1ID == playerID {
                return gameState.Player1Cards
        }
        if gameState.Player2ID == playerID {
                return gameState.Player2Cards
        }
        if gameState.Player3ID == playerID {
                return gameState.Player3Cards
        }
        return 17
}

// =============================================
// 决赛策略
// =============================================

// FinalRoundStrategyResult 决赛策略结果
type FinalRoundStrategyResult struct {
        PlayStyle       string     `json:"play_style"`       // 打法风格
        ShouldUseBomb   bool       `json:"should_use_bomb"`  // 是否使用炸弹
        ShouldUseRocket bool       `json:"should_use_rocket"`// 是否使用王炸
        PriorityCards   []CardInfo `json:"priority_cards"`   // 优先出的牌
        WinProbability  float64    `json:"win_probability"`  // 获胜概率
        Reason          string     `json:"reason"`           // 策略原因
}

// FinalRoundStrategy 决赛策略
// 在最后几轮使用，最大化获胜概率
func (s *RobotStrategy) FinalRoundStrategy(gameState *GameState) *FinalRoundStrategyResult {
        log.Printf("[Strategy] 执行决赛策略")

        result := &FinalRoundStrategyResult{
                PlayStyle: "aggressive",
        }

        // 计算获胜概率
        result.WinProbability = s.calculateWinProbability(gameState)

        // 分析局势
        isLandlord := gameState.MyRole == database.PlayerRoleLandlord

        if isLandlord {
                // 地主决赛策略
                result = s.landlordFinalStrategy(gameState, result)
        } else {
                // 农民决赛策略
                result = s.farmerFinalStrategy(gameState, result)
        }

        log.Printf("[Strategy] 决赛策略: 风格=%s, 使用炸弹=%v, 获胜概率=%.2f",
                result.PlayStyle, result.ShouldUseBomb, result.WinProbability)

        return result
}

// landlordFinalStrategy 地主决赛策略
func (s *RobotStrategy) landlordFinalStrategy(gameState *GameState, result *FinalRoundStrategyResult) *FinalRoundStrategyResult {
        myCards := gameState.MyHandCards
        minFarmerCards := min(s.getFarmerCards(gameState, 1), s.getFarmerCards(gameState, 2))

        // 如果农民快出完了，必须用炸弹
        if minFarmerCards <= 2 {
                result.ShouldUseBomb = true
                result.ShouldUseRocket = true
                result.PlayStyle = "desperate"
                result.Reason = "农民即将获胜，必须全力阻止"
        } else if len(myCards) <= 3 {
                // 我快出完了，正常出牌
                result.ShouldUseBomb = false
                result.ShouldUseRocket = false
                result.PlayStyle = "controlled"
                result.Reason = "即将获胜，控制出牌"
        } else {
                // 根据概率决定是否激进
                if result.WinProbability > 0.7 {
                        result.PlayStyle = "confident"
                        result.Reason = "胜率较高，正常出牌"
                } else {
                        result.PlayStyle = "aggressive"
                        result.Reason = "需要激进打法"
                }
        }

        return result
}

// farmerFinalStrategy 农民决赛策略
func (s *RobotStrategy) farmerFinalStrategy(gameState *GameState, result *FinalRoundStrategyResult) *FinalRoundStrategyResult {
        landlordCards := s.getLandlordCards(gameState)
        teammateCards := s.getTeammateCards(gameState)

        // 如果地主快出完了，必须用炸弹
        if landlordCards <= 2 {
                result.ShouldUseBomb = true
                result.ShouldUseRocket = true
                result.PlayStyle = "desperate"
                result.Reason = "地主即将获胜，必须全力阻止"
        } else if teammateCards <= 2 {
                // 队友快赢了，帮队友
                result.ShouldUseBomb = false
                result.PlayStyle = "supportive"
                result.Reason = "队友即将获胜，配合出牌"
        } else if len(gameState.MyHandCards) <= 3 {
                // 我快赢了，全力冲刺
                result.ShouldUseBomb = false
                result.PlayStyle = "sprint"
                result.Reason = "即将获胜，全力冲刺"
        } else {
                // 正常配合
                result.PlayStyle = "cooperative"
                result.Reason = "正常配合出牌"
        }

        return result
}

// calculateWinProbability 计算获胜概率
func (s *RobotStrategy) calculateWinProbability(gameState *GameState) float64 {
        myCards := gameState.MyHandCards

        // 使用记牌器分析
        if s.memory != nil {
                return s.memory.GetWinProbability(myCards, gameState.MyRole == database.PlayerRoleLandlord)
        }

        // 简单估算
        myCardCount := len(myCards)
        if myCardCount <= 3 {
                return 0.8
        } else if myCardCount <= 7 {
                return 0.6
        } else if myCardCount <= 12 {
                return 0.5
        } else {
                return 0.4
        }
}

// =============================================
// 辅助方法
// =============================================

// getSmallestCards 获取最小的N张牌
func (s *RobotStrategy) getSmallestCards(cards []CardInfo, count int) []CardInfo {
        if len(cards) == 0 || count <= 0 {
                return nil
        }

        // 排序
        sorted := make([]CardInfo, len(cards))
        copy(sorted, cards)
        sort.Slice(sorted, func(i, j int) bool {
                return sorted[i].Rank < sorted[j].Rank
        })

        // 返回最小的N张
        if count > len(sorted) {
                count = len(sorted)
        }
        return sorted[:count]
}

// getMediumCards 获取中等大小的牌
func (s *RobotStrategy) getMediumCards(cards []CardInfo, count int) []CardInfo {
        if len(cards) == 0 || count <= 0 {
                return nil
        }

        // 排序
        sorted := make([]CardInfo, len(cards))
        copy(sorted, cards)
        sort.Slice(sorted, func(i, j int) bool {
                return sorted[i].Rank < sorted[j].Rank
        })

        // 返回中间的牌
        mid := len(sorted) / 2
        start := mid - count/2
        if start < 0 {
                start = 0
        }
        end := start + count
        if end > len(sorted) {
                end = len(sorted)
        }

        return sorted[start:end]
}

// getLargestCards 获取最大的N张牌
func (s *RobotStrategy) getLargestCards(cards []CardInfo, count int) []CardInfo {
        if len(cards) == 0 || count <= 0 {
                return nil
        }

        // 排序（降序）
        sorted := make([]CardInfo, len(cards))
        copy(sorted, cards)
        sort.Slice(sorted, func(i, j int) bool {
                return sorted[i].Rank > sorted[j].Rank
        })

        // 返回最大的N张
        if count > len(sorted) {
                count = len(sorted)
        }
        return sorted[:count]
}

// min 返回较小的值
func min(a, b int) int {
        if a < b {
                return a
        }
        return b
}

// max 返回较大的值
func max(a, b int) int {
        if a > b {
                return a
        }
        return b
}

// =============================================
// 策略工厂方法
// =============================================

// GetStrategyByMode 根据策略模式获取策略
func (s *RobotStrategy) GetStrategyByMode(mode uint8) string {
        switch mode {
        case database.StrategyModeAttack:
                return "attack"
        case database.StrategyModeDefense:
                return "defense"
        case database.StrategyModeBalanced:
                fallthrough
        default:
                return "balanced"
        }
}

// ShouldPlayAggressively 是否应该激进出牌
func (s *RobotStrategy) ShouldPlayAggressively(gameState *GameState) bool {
        // 根据配置和局势判断
        if s.config.StrategyMode == database.StrategyModeAttack {
                return true
        }
        if s.config.StrategyMode == database.StrategyModeDefense {
                return false
        }

        // 平衡模式：根据局势判断
        myCards := len(gameState.MyHandCards)
        return myCards <= 8
}

// ShouldUseBombNow 是否应该现在使用炸弹
func (s *RobotStrategy) ShouldUseBombNow(gameState *GameState, currentPlay *PlayRecord) bool {
        if currentPlay == nil {
                return false
        }

        // 检查对手剩余牌数
        opponentMinCards := s.getOpponentMinCards(gameState)

        // 对手快出完了，必须炸
        if opponentMinCards <= 2 {
                return true
        }

        // 根据阈值决定
        if rand.Float64() < s.config.BombThreshold {
                return true
        }

        return false
}

// ShouldUseRocketNow 是否应该现在使用王炸
func (s *RobotStrategy) ShouldUseRocketNow(gameState *GameState, currentPlay *PlayRecord) bool {
        if currentPlay == nil {
                return false
        }

        // 王炸是最后的手段，只在紧急情况使用
        opponentMinCards := s.getOpponentMinCards(gameState)

        // 对手快出完了，必须用王炸
        if opponentMinCards <= 1 {
                return true
        }

        // 根据阈值决定（王炸阈值更低）
        if rand.Float64() < s.config.RocketThreshold {
                return true
        }

        return false
}

// getOpponentMinCards 获取对手最少剩余牌数
func (s *RobotStrategy) getOpponentMinCards(gameState *GameState) int {
        if gameState.MyRole == database.PlayerRoleLandlord {
                return min(s.getFarmerCards(gameState, 1), s.getFarmerCards(gameState, 2))
        }
        return s.getLandlordCards(gameState)
}
