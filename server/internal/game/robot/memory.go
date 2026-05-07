// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"sort"
	"sync"
)

// =============================================
// CardMemory 记牌器
// =============================================

// CardMemory 记牌器
// 用于记录已经出过的牌，帮助AI做出更好的决策
type CardMemory struct {
	// 总牌数（初始54张）
	totalCards int

	// 已出牌记录：点数 -> 已出数量
	playedCards map[int]int

	// 剩余牌记录：点数 -> 剩余数量
	remainingCards map[int]int

	// 底牌
	landlordCards []CardInfo

	// 我的手牌
	myHandCards map[int]int

	// 炸弹记录
	bombCards map[int]bool // 记录哪些点数可能是炸弹

	// 王牌状态
	blackJokerPlayed bool // 小王是否已出
	redJokerPlayed   bool // 大王是否已出

	mu sync.RWMutex
}

// NewCardMemory 创建记牌器
func NewCardMemory() *CardMemory {
	cm := &CardMemory{
		totalCards:      54,
		playedCards:     make(map[int]int),
		remainingCards:  make(map[int]int),
		myHandCards:     make(map[int]int),
		bombCards:       make(map[int]bool),
		landlordCards:   make([]CardInfo, 0),
		blackJokerPlayed: false,
		redJokerPlayed:   false,
	}

	// 初始化剩余牌数（每种点数4张）
	for rank := 3; rank <= 15; rank++ { // 3到2
		cm.remainingCards[rank] = 4
	}
	cm.remainingCards[16] = 1 // 小王
	cm.remainingCards[17] = 1 // 大王

	return cm
}

// =============================================
// 更新方法
// =============================================

// Update 更新记牌器
// 当有牌被打出时调用
func (cm *CardMemory) Update(playedCards []CardInfo) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	for _, card := range playedCards {
		cm.recordPlayedCard(card)
	}

	log.Printf("[CardMemory] 更新记牌: 出牌数=%d", len(playedCards))
}

// UpdateFromPlayRecord 从出牌记录更新
func (cm *CardMemory) UpdateFromPlayRecord(record *PlayRecord) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	if record == nil || record.IsPass {
		return
	}

	for _, card := range record.Cards {
		cm.recordPlayedCard(card)
	}

	// 记录炸弹
	if record.IsBomb {
		cm.bombCards[record.Cards[0].Rank] = true
		log.Printf("[CardMemory] 记录炸弹: 点数=%d", record.Cards[0].Rank)
	}

	log.Printf("[CardMemory] 更新出牌记录: 玩家=%d, 牌数=%d", record.PlayerID, len(record.Cards))
}

// SetMyHandCards 设置我的手牌
func (cm *CardMemory) SetMyHandCards(cards []CardInfo) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	// 清空之前的手牌
	cm.myHandCards = make(map[int]int)

	// 记录当前手牌
	for _, card := range cards {
		cm.myHandCards[card.Rank]++
		// 从剩余牌中移除
		if cm.remainingCards[card.Rank] > 0 {
			cm.remainingCards[card.Rank]--
		}
	}

	log.Printf("[CardMemory] 设置手牌: 数量=%d", len(cards))
}

// SetLandlordCards 设置底牌
func (cm *CardMemory) SetLandlordCards(cards []CardInfo) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	cm.landlordCards = cards

	// 从剩余牌中移除底牌（地主能看到）
	for _, card := range cards {
		if cm.remainingCards[card.Rank] > 0 {
			cm.remainingCards[card.Rank]--
		}
	}

	log.Printf("[CardMemory] 设置底牌: 数量=%d", len(cards))
}

// Reset 重置记牌器
func (cm *CardMemory) Reset() {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	// 重置已出牌
	cm.playedCards = make(map[int]int)

	// 重置剩余牌
	cm.remainingCards = make(map[int]int)
	for rank := 3; rank <= 15; rank++ {
		cm.remainingCards[rank] = 4
	}
	cm.remainingCards[16] = 1
	cm.remainingCards[17] = 1

	// 重置其他状态
	cm.myHandCards = make(map[int]int)
	cm.bombCards = make(map[int]bool)
	cm.landlordCards = make([]CardInfo, 0)
	cm.blackJokerPlayed = false
	cm.redJokerPlayed = false

	log.Printf("[CardMemory] 记牌器已重置")
}

// recordPlayedCard 记录已出的牌（内部方法，不加锁）
func (cm *CardMemory) recordPlayedCard(card CardInfo) {
	rank := card.Rank

	// 更新已出牌数量
	cm.playedCards[rank]++

	// 更新剩余牌数量
	if cm.remainingCards[rank] > 0 {
		cm.remainingCards[rank]--
	}

	// 记录王牌状态
	if rank == 16 {
		cm.blackJokerPlayed = true
	}
	if rank == 17 {
		cm.redJokerPlayed = true
	}
}

// =============================================
// 查询方法
// =============================================

// GetRemainingCards 获取剩余牌
// 返回所有剩余牌的数量统计
func (cm *CardMemory) GetRemainingCards() map[int]int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	result := make(map[int]int)
	for rank, count := range cm.remainingCards {
		if count > 0 {
			result[rank] = count
		}
	}

	return result
}

// GetRemainingCount 获取指定点数的剩余数量
func (cm *CardMemory) GetRemainingCount(rank int) int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.remainingCards[rank]
}

// GetPlayedCards 获取已出的牌
func (cm *CardMemory) GetPlayedCards() map[int]int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	result := make(map[int]int)
	for rank, count := range cm.playedCards {
		result[rank] = count
	}

	return result
}

// GetPlayedCount 获取指定点数已出的数量
func (cm *CardMemory) GetPlayedCount(rank int) int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.playedCards[rank]
}

// IsBlackJokerPlayed 小王是否已出
func (cm *CardMemory) IsBlackJokerPlayed() bool {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.blackJokerPlayed
}

// IsRedJokerPlayed 大王是否已出
func (cm *CardMemory) IsRedJokerPlayed() bool {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.redJokerPlayed
}

// IsRocketPossible 是否可能存在王炸
func (cm *CardMemory) IsRocketPossible() bool {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return !cm.blackJokerPlayed && !cm.redJokerPlayed
}

// =============================================
// 预测方法
// =============================================

// PredictBombs 预测炸弹
// 分析剩余牌，预测对手可能持有的炸弹
func (cm *CardMemory) PredictBombs() []int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	var bombs []int

	// 检查每种点数
	for rank := 3; rank <= 15; rank++ {
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]

		// 如果剩余牌中有4张且不在自己手中，可能是炸弹
		if remaining == 4 && myCount == 0 {
			bombs = append(bombs, rank)
		}
		// 如果剩余牌+自己手中的牌=4张，且自己手中不足4张，对手可能有炸弹
		if remaining+myCount == 4 && myCount < 4 {
			bombs = append(bombs, rank)
		}
	}

	// 检查王炸
	if cm.IsRocketPossible() {
		bombs = append(bombs, 99) // 用99表示王炸
	}

	log.Printf("[CardMemory] 预测炸弹: %v", bombs)
	return bombs
}

// PredictStrongCards 预测强牌
// 分析对手可能持有的强牌（大单牌、对子等）
func (cm *CardMemory) PredictStrongCards() map[int][]int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	result := make(map[int][]int)

	// 预测大单牌（2、A、K）
	singles := make([]int, 0)
	for _, rank := range []int{15, 14, 13} { // 2, A, K
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]
		if remaining > 0 && myCount < remaining {
			singles = append(singles, rank)
		}
	}
	if len(singles) > 0 {
		result["singles"] = singles
	}

	// 预测大对子
	pairs := make([]int, 0)
	for _, rank := range []int{15, 14, 13} {
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]
		if remaining >= 2 && myCount < 2 {
			pairs = append(pairs, rank)
		}
	}
	if len(pairs) > 0 {
		result["pairs"] = pairs
	}

	// 预测三张
	trios := make([]int, 0)
	for rank := 3; rank <= 15; rank++ {
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]
		if remaining >= 3 && myCount < 3 {
			trios = append(trios, rank)
		}
	}
	if len(trios) > 0 {
		result["trios"] = trios
	}

	return result
}

// GetDangerousCards 获取危险牌
// 返回对手可能压过我的牌的点数列表
func (cm *CardMemory) GetDangerousCards(myHighestRank int) []int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	var dangerous []int

	// 检查比我大的牌是否还在对手手中
	for rank := myHighestRank + 1; rank <= 15; rank++ {
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]

		if remaining > myCount {
			dangerous = append(dangerous, rank)
		}
	}

	// 王牌永远是危险的
	if !cm.blackJokerPlayed {
		dangerous = append(dangerous, 16)
	}
	if !cm.redJokerPlayed {
		dangerous = append(dangerous, 17)
	}

	return dangerous
}

// =============================================
// 统计方法
// =============================================

// GetTotalRemaining 获取剩余总牌数
func (cm *CardMemory) GetTotalRemaining() int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	total := 0
	for _, count := range cm.remainingCards {
		total += count
	}
	return total
}

// GetTotalPlayed 获取已出总牌数
func (cm *CardMemory) GetTotalPlayed() int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	total := 0
	for _, count := range cm.playedCards {
		total += count
	}
	return total
}

// GetCardDistribution 获取牌的分布情况
func (cm *CardMemory) GetCardDistribution() *CardDistribution {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	dist := &CardDistribution{
		Singles:  make([]int, 0),
		Pairs:    make([]int, 0),
		Trios:    make([]int, 0),
		Bombs:    make([]int, 0),
	}

	for rank := 3; rank <= 15; rank++ {
		remaining := cm.remainingCards[rank]
		myCount := cm.myHandCards[rank]
		opponentCount := remaining - myCount

		switch opponentCount {
		case 1:
			dist.Singles = append(dist.Singles, rank)
		case 2:
			dist.Pairs = append(dist.Pairs, rank)
		case 3:
			dist.Trios = append(dist.Trios, rank)
		case 4:
			dist.Bombs = append(dist.Bombs, rank)
		}
	}

	return dist
}

// CardDistribution 牌的分布
type CardDistribution struct {
	Singles []int `json:"singles"` // 对手手中的单牌点数
	Pairs   []int `json:"pairs"`   // 对手手中的对子点数
	Trios   []int `json:"trios"`   // 对手手中的三张点数
	Bombs   []int `json:"bombs"`   // 对手手中的炸弹点数
}

// =============================================
// 辅助方法
// =============================================

// GetRemainingCardsList 获取剩余牌列表（按点数排序）
func (cm *CardMemory) GetRemainingCardsList() []int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	var list []int
	for rank, count := range cm.remainingCards {
		for i := 0; i < count; i++ {
			list = append(list, rank)
		}
	}

	sort.Ints(list)
	return list
}

// HasCard 检查是否还有某点数的牌
func (cm *CardMemory) HasCard(rank int) bool {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.remainingCards[rank] > 0
}

// CountMyCards 统计我手中某点数的数量
func (cm *CardMemory) CountMyCards(rank int) int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.myHandCards[rank]
}

// GetLandlordCards 获取底牌
func (cm *CardMemory) GetLandlordCards() []CardInfo {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return cm.landlordCards
}

// =============================================
// 分析方法
// =============================================

// AnalyzeHandStrength 分析手牌强度
// 返回手牌强度评分（0-100）
func (cm *CardMemory) AnalyzeHandStrength(myCards []CardInfo) int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	score := 0

	// 统计我的牌
	myCount := make(map[int]int)
	for _, card := range myCards {
		myCount[card.Rank]++
	}

	// 1. 大牌加分
	if myCount[15] > 0 { // 2
		score += myCount[15] * 8
	}
	if myCount[14] > 0 { // A
		score += myCount[14] * 6
	}
	if myCount[16] > 0 { // 小王
		score += 10
	}
	if myCount[17] > 0 { // 大王
		score += 15
	}

	// 2. 炸弹加分
	for _, count := range myCount {
		if count == 4 {
			score += 20
		}
	}

	// 3. 控制力加分（根据剩余牌分析）
	// 如果某种牌已经全部出完，我持有该牌就有绝对控制权
	for rank, count := range myCount {
		if cm.remainingCards[rank] == count && count > 0 {
			score += count * 2
		}
	}

	// 限制最大值
	if score > 100 {
		score = 100
	}

	return score
}

// GetWinProbability 获取获胜概率
// 基于剩余牌和手牌分析获胜概率
func (cm *CardMemory) GetWinProbability(myCards []CardInfo, isLandlord bool) float64 {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	// 基础概率
	baseProb := 0.5

	// 手牌强度
	strength := cm.AnalyzeHandStrength(myCards)

	// 调整概率
	prob := baseProb + float64(strength-50)/100.0

	// 地主有底牌优势
	if isLandlord {
		prob += 0.05
	}

	// 限制范围
	if prob < 0 {
		prob = 0
	}
	if prob > 1 {
		prob = 1
	}

	return prob
}

// String 字符串表示
func (cm *CardMemory) String() string {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	return "CardMemory{" +
		"totalPlayed=" + intToString(cm.GetTotalPlayed()) +
		", totalRemaining=" + intToString(cm.GetTotalRemaining()) +
		", blackJokerPlayed=" + boolToString(cm.blackJokerPlayed) +
		", redJokerPlayed=" + boolToString(cm.redJokerPlayed) +
		"}"
}

// 辅助函数
func intToString(i int) string {
	if i < 10 {
		return string(rune('0' + i))
	}
	return intToString(i/10) + string(rune('0'+i%10))
}

func boolToString(b bool) string {
	if b {
		return "true"
	}
	return "false"
}
