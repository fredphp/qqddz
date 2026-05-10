// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"sort"
)

// =============================================
// AIEvaluator - AI牌型评估器
// =============================================

// PatternValue 牌型价值常量
const (
	PatternValueSingle   = 1  // 单牌
	PatternValuePair     = 3  // 对子
	PatternValueTrio     = 5  // 三张
	PatternValueStraight = 8  // 顺子
	PatternValuePlane    = 12 // 飞机
	PatternValueBomb     = 20 // 炸弹
	PatternValueRocket   = 25 // 王炸
)

// AIEvaluator AI牌型评估器
// 负责评估牌型价值、计算拆牌损失
type AIEvaluator struct {
	gameState *GameState
}

// NewAIEvaluator 创建AI评估器
func NewAIEvaluator(gameState *GameState) *AIEvaluator {
	return &AIEvaluator{
		gameState: gameState,
	}
}

// SetGameState 设置游戏状态
func (e *AIEvaluator) SetGameState(state *GameState) {
	e.gameState = state
}

// =============================================
// 牌型价值评估
// =============================================

// EvaluatePatternValue 评估牌型价值
func (e *AIEvaluator) EvaluatePatternValue(pattern string, cards []CardInfo) int {
	baseValue := e.getPatternBaseValue(pattern)

	// 考虑牌的大小
	if len(cards) > 0 {
		maxRank := e.getMaxRank(cards)
		// 大牌额外加分
		if maxRank >= 15 { // 2
			baseValue += 2
		} else if maxRank >= 14 { // A
			baseValue += 1
		}
		// 王牌额外加分
		if maxRank >= 16 { // 小王
			baseValue += 3
		}
		if maxRank >= 17 { // 大王
			baseValue += 5
		}
	}

	return baseValue
}

// getPatternBaseValue 获取牌型基础价值
func (e *AIEvaluator) getPatternBaseValue(pattern string) int {
	switch pattern {
	case "单牌":
		return PatternValueSingle
	case "对子":
		return PatternValuePair
	case "三条":
		return PatternValueTrio
	case "三带一":
		return PatternValueTrio + PatternValueSingle
	case "三带二":
		return PatternValueTrio + PatternValuePair
	case "顺子":
		return PatternValueStraight
	case "连对":
		return PatternValueStraight + 2
	case "飞机":
		return PatternValuePlane
	case "炸弹":
		return PatternValueBomb
	case "王炸":
		return PatternValueRocket
	default:
		return PatternValueSingle
	}
}

// getMaxRank 获取最大点数
func (e *AIEvaluator) getMaxRank(cards []CardInfo) int {
	if len(cards) == 0 {
		return 0
	}
	maxRank := cards[0].Rank
	for _, c := range cards {
		if c.Rank > maxRank {
			maxRank = c.Rank
		}
	}
	return maxRank
}

// =============================================
// 手牌分析
// =============================================

// HandStructure 手牌结构分析
type HandStructure struct {
	Singles   []int // 单牌点数列表
	Pairs     []int // 对子点数列表
	Trios     []int // 三张点数列表
	Bombs     []int // 炸弹点数列表
	Straights [][]int // 顺子列表

	SingleCount   int // 单牌数量
	PairCount     int // 对子数量
	TrioCount     int // 三张数量
	BombCount     int // 炸弹数量
	RocketCount   int // 王炸数量

	TotalCards    int // 总牌数
	HandCount     int // 手数（需要出多少次）
}

// AnalyzeHand 分析手牌结构
func (e *AIEvaluator) AnalyzeHand(cards []CardInfo) *HandStructure {
	structure := &HandStructure{
		TotalCards: len(cards),
	}

	// 统计各点数数量
	rankCount := make(map[int]int)
	for _, c := range cards {
		rankCount[c.Rank]++
	}

	// 分类统计
	for rank, count := range rankCount {
		switch count {
		case 1:
			structure.Singles = append(structure.Singles, rank)
			structure.SingleCount++
		case 2:
			structure.Pairs = append(structure.Pairs, rank)
			structure.PairCount++
		case 3:
			structure.Trios = append(structure.Trios, rank)
			structure.TrioCount++
		case 4:
			structure.Bombs = append(structure.Bombs, rank)
			structure.BombCount++
		}
	}

	// 检测王炸
	if rankCount[16] > 0 && rankCount[17] > 0 {
		structure.RocketCount = 1
	}

	// 排序
	sort.Ints(structure.Singles)
	sort.Ints(structure.Pairs)
	sort.Ints(structure.Trios)
	sort.Ints(structure.Bombs)

	// 计算手数
	structure.HandCount = e.calculateHandCount(structure, rankCount)

	return structure
}

// calculateHandCount 计算手数
func (e *AIEvaluator) calculateHandCount(structure *HandStructure, rankCount map[int]int) int {
	hands := 0

	// 单牌手数
	hands += structure.SingleCount

	// 对子手数
	hands += structure.PairCount

	// 三张手数（可以带牌减少手数）
	hands += structure.TrioCount

	// 炸弹单独一手
	hands += structure.BombCount

	// 王炸单独一手
	hands += structure.RocketCount

	return hands
}

// =============================================
// 拆牌损失计算
// =============================================

// SplitCost 拆牌损失
type SplitCost struct {
	OriginalPattern string // 原始牌型
	OriginalValue   int    // 原始价值
	NewPattern      string // 拆后牌型
	NewValue        int    // 拆后价值
	Loss            int    // 损失值
}

// CalculateSplitCost 计算拆牌损失
// 例如：拆对子出单牌，损失 = 3 - 1 = 2
func (e *AIEvaluator) CalculateSplitCost(originalPattern string, newPattern string, cardRank int) *SplitCost {
	originalValue := e.getPatternBaseValue(originalPattern)
	newValue := e.getPatternBaseValue(newPattern)

	// 根据牌的大小调整损失
	// 拆大牌损失更大
	if cardRank >= 15 { // 2
		originalValue += 2
		newValue += 2
	} else if cardRank >= 14 { // A
		originalValue += 1
		newValue += 1
	}

	loss := originalValue - newValue

	return &SplitCost{
		OriginalPattern: originalPattern,
		OriginalValue:   originalValue,
		NewPattern:      newPattern,
		NewValue:        newValue,
		Loss:            loss,
	}
}

// CanSplitPair 判断是否可以拆对子
// 返回是否可以拆，以及拆哪对
func (e *AIEvaluator) CanSplitPair(cards []CardInfo, targetRank int, isEndGame bool) (bool, int) {
	structure := e.AnalyzeHand(cards)

	// 残局模式可以拆任意对子
	if isEndGame {
		if len(structure.Pairs) > 0 {
			// 拆最小的对子
			return true, structure.Pairs[0]
		}
		return false, 0
	}

	// 非残局模式，禁止拆大对子
	for _, pairRank := range structure.Pairs {
		// 只拆比目标牌大的最小对子
		if pairRank > targetRank {
			// 不拆2和对A（除非残局）
			if pairRank >= 15 { // 2
				continue
			}
			return true, pairRank
		}
	}

	return false, 0
}

// CanSplitTrio 判断是否可以拆三张
func (e *AIEvaluator) CanSplitTrio(cards []CardInfo, targetRank int, isEndGame bool) (bool, int) {
	structure := e.AnalyzeHand(cards)

	// 非残局模式，一般不拆三张
	if !isEndGame {
		return false, 0
	}

	// 残局模式可以拆
	if len(structure.Trios) > 0 {
		for _, trioRank := range structure.Trios {
			if trioRank > targetRank {
				return true, trioRank
			}
		}
	}

	return false, 0
}

// IsEndGame 判断是否进入残局模式
// 残局条件：手牌数 <= 5
func (e *AIEvaluator) IsEndGame(cards []CardInfo) bool {
	return len(cards) <= 5
}

// =============================================
// 控制力评估
// =============================================

// ControlPower 控制力评估
type ControlPower struct {
	TotalPower    int   // 总控制力
	BigCardPower int   // 大牌控制力
	BombPower    int   // 炸弹控制力
	BigCards     []int // 大牌点数列表
}

// EvaluateControlPower 评估控制力
func (e *AIEvaluator) EvaluateControlPower(cards []CardInfo) *ControlPower {
	cp := &ControlPower{
		BigCards: make([]int, 0),
	}

	// 统计各点数数量
	rankCount := make(map[int]int)
	for _, c := range cards {
		rankCount[c.Rank]++
	}

	// 大牌控制力 (A, 2, 王)
	if rankCount[14] > 0 { // A
		cp.BigCardPower += rankCount[14] * 1
		cp.BigCards = append(cp.BigCards, 14)
	}
	if rankCount[15] > 0 { // 2
		cp.BigCardPower += rankCount[15] * 2
		cp.BigCards = append(cp.BigCards, 15)
	}
	if rankCount[16] > 0 { // 小王
		cp.BigCardPower += 3
		cp.BigCards = append(cp.BigCards, 16)
	}
	if rankCount[17] > 0 { // 大王
		cp.BigCardPower += 5
		cp.BigCards = append(cp.BigCards, 17)
	}

	// 炸弹控制力
	for rank, count := range rankCount {
		if count == 4 {
			cp.BombPower += 10
			cp.BigCards = append(cp.BigCards, rank)
		}
	}

	cp.TotalPower = cp.BigCardPower + cp.BombPower

	return cp
}

// =============================================
// 获胜概率评估
// =============================================

// EstimateWinProbability 估计获胜概率
func (e *AIEvaluator) EstimateWinProbability(myCards []CardInfo, opponentMinCards int) float64 {
	structure := e.AnalyzeHand(myCards)
	controlPower := e.EvaluateControlPower(myCards)

	// 基础概率
	prob := 0.5

	// 手数越少越好
	if structure.HandCount <= 2 {
		prob += 0.3
	} else if structure.HandCount <= 3 {
		prob += 0.2
	} else if structure.HandCount <= 4 {
		prob += 0.1
	}

	// 控制力越高越好
	prob += float64(controlPower.TotalPower) * 0.02

	// 对手牌数影响
	if opponentMinCards <= 2 {
		prob -= 0.2
	} else if opponentMinCards <= 3 {
		prob -= 0.1
	}

	// 炸弹加分
	if structure.BombCount > 0 || structure.RocketCount > 0 {
		prob += 0.1
	}

	// 限制在 0-1 范围
	if prob < 0 {
		prob = 0
	}
	if prob > 1 {
		prob = 1
	}

	log.Printf("[AI] 评估获胜概率: 手数=%d, 控制力=%d, 对手最少牌=%d, 概率=%.2f",
		structure.HandCount, controlPower.TotalPower, opponentMinCards, prob)

	return prob
}

// =============================================
// 最优出牌评估
// =============================================

// FindBestCardToPlay 找最优出牌
// 用于主动出牌时选择最优策略
func (e *AIEvaluator) FindBestCardToPlay(cards []CardInfo, isLandlord bool) []CardInfo {
	structure := e.AnalyzeHand(cards)

	log.Printf("[AI] 分析手牌: 单牌=%d, 对子=%d, 三张=%d, 炸弹=%d, 手数=%d",
		structure.SingleCount, structure.PairCount, structure.TrioCount, structure.BombCount, structure.HandCount)

	// 地主策略：优先出顺子、连对、三带
	if isLandlord {
		// 优先出三带
		if structure.TrioCount > 0 {
			return e.findBestTrioPlay(cards, structure)
		}

		// 出对子
		if structure.PairCount > 0 {
			return e.findBestPairPlay(cards, structure)
		}

		// 出单牌
		if structure.SingleCount > 0 {
			return e.findBestSinglePlay(cards, structure)
		}
	} else {
		// 农民策略：保守出牌，保留控制牌
		// 先出小牌
		if structure.SingleCount > 0 {
			return e.findBestSinglePlay(cards, structure)
		}

		if structure.PairCount > 0 {
			return e.findBestPairPlay(cards, structure)
		}
	}

	// 默认出最小的牌
	return e.findSmallestCard(cards)
}

// findBestTrioPlay 找最优三带出牌
func (e *AIEvaluator) findBestTrioPlay(cards []CardInfo, structure *HandStructure) []CardInfo {
	if len(structure.Trios) == 0 {
		return nil
	}

	// 找最小的三张
	trioRank := structure.Trios[0]
	result := make([]CardInfo, 0, 5)

	// 收集三张
	count := 0
	for _, c := range cards {
		if c.Rank == trioRank && count < 3 {
			result = append(result, c)
			count++
		}
	}

	// 找带牌
	if len(structure.Singles) > 0 {
		// 带最小单牌
		for _, c := range cards {
			if c.Rank == structure.Singles[0] {
				result = append(result, c)
				break
			}
		}
	} else if len(structure.Pairs) > 0 && structure.Pairs[0] != trioRank {
		// 带最小对子
		kickerRank := structure.Pairs[0]
		for _, c := range cards {
			if c.Rank == kickerRank {
				result = append(result, c)
				if len(result) >= 5 {
					break
				}
			}
		}
	}

	return result
}

// findBestPairPlay 找最优对子出牌
func (e *AIEvaluator) findBestPairPlay(cards []CardInfo, structure *HandStructure) []CardInfo {
	if len(structure.Pairs) == 0 {
		return nil
	}

	// 出最小对子
	pairRank := structure.Pairs[0]
	result := make([]CardInfo, 0, 2)

	for _, c := range cards {
		if c.Rank == pairRank && len(result) < 2 {
			result = append(result, c)
		}
	}

	return result
}

// findBestSinglePlay 找最优单牌出牌
func (e *AIEvaluator) findBestSinglePlay(cards []CardInfo, structure *HandStructure) []CardInfo {
	if len(structure.Singles) == 0 {
		return nil
	}

	// 出最小单牌
	singleRank := structure.Singles[0]

	for _, c := range cards {
		if c.Rank == singleRank {
			return []CardInfo{c}
		}
	}

	return nil
}

// findSmallestCard 找最小的牌
func (e *AIEvaluator) findSmallestCard(cards []CardInfo) []CardInfo {
	if len(cards) == 0 {
		return nil
	}

	// 排序
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	return []CardInfo{sorted[0]}
}
