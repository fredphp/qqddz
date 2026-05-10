// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"math/rand"
	"sort"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// 智能出牌AI策略
// =============================================

// DDZAIStrategy 斗地主智能AI策略
// 实现更智能的出牌决策，包括：
// 1. 身份感知（地主/农民）
// 2. 队友意识（农民协作）
// 3. 记牌能力（推测剩余牌）
// 4. 炸弹策略（限制使用）
// 5. 地主压制策略
// 6. 农民配合策略
type DDZAIStrategy struct {
	config  *database.RobotAIConfig
	memory  *CardMemory
	runtime *ArenaRobotRuntime

	// 游戏状态引用
	gameState *GameState

	// 队友信息
	teammateID    uint64
	opponentIDs   []uint64
}

// NewDDZAIStrategy 创建智能AI策略
func NewDDZAIStrategy(runtime *ArenaRobotRuntime, config *database.RobotAIConfig) *DDZAIStrategy {
	strategy := &DDZAIStrategy{
		config:    config,
		runtime:   runtime,
		memory:    NewCardMemory(),
		opponentIDs: make([]uint64, 0),
	}

	return strategy
}

// =============================================
// 身份感知
// =============================================

// IsLandlord 判断是否是地主
func (s *DDZAIStrategy) IsLandlord() bool {
	return s.gameState != nil && s.gameState.MyRole == database.PlayerRoleLandlord
}

// IsFarmer 判断是否是农民
func (s *DDZAIStrategy) IsFarmer() bool {
	return s.gameState != nil && s.gameState.MyRole == database.PlayerRoleFarmer
}

// GetRoleString 获取角色字符串
func (s *DDZAIStrategy) GetRoleString() string {
	if s.IsLandlord() {
		return "地主"
	}
	return "农民"
}

// =============================================
// 队友判断
// =============================================

// IsTeammate 判断是否是队友
// 地主没有队友，农民的队友是另一个农民
func (s *DDZAIStrategy) IsTeammate(playerID uint64) bool {
	if s.gameState == nil {
		return false
	}

	// 地主没有队友
	if s.IsLandlord() {
		return false
	}

	// 农民判断：另一个农民是队友
	if s.gameState.Player1ID == playerID {
		return s.gameState.Player1Role == database.PlayerRoleFarmer
	}
	if s.gameState.Player2ID == playerID {
		return s.gameState.Player2Role == database.PlayerRoleFarmer
	}
	if s.gameState.Player3ID == playerID {
		return s.gameState.Player3Role == database.PlayerRoleFarmer
	}

	return false
}

// GetTeammateID 获取队友ID
func (s *DDZAIStrategy) GetTeammateID() uint64 {
	if s.IsLandlord() {
		return 0 // 地主没有队友
	}

	// 找到另一个农民
	if s.gameState != nil {
		if s.gameState.Player1Role == database.PlayerRoleFarmer && s.gameState.Player1ID != s.getMyID() {
			return s.gameState.Player1ID
		}
		if s.gameState.Player2Role == database.PlayerRoleFarmer && s.gameState.Player2ID != s.getMyID() {
			return s.gameState.Player2ID
		}
		if s.gameState.Player3Role == database.PlayerRoleFarmer && s.gameState.Player3ID != s.getMyID() {
			return s.gameState.Player3ID
		}
	}

	return 0
}

// getMyID 获取自己的ID
func (s *DDZAIStrategy) getMyID() uint64 {
	if s.runtime != nil {
		return s.runtime.RobotID
	}
	return 0
}

// =============================================
// 对手分析
// =============================================

// GetOpponentMinCards 获取对手最少剩余牌数
func (s *DDZAIStrategy) GetOpponentMinCards() int {
	if s.gameState == nil {
		return 17
	}

	minCards := 20 // 最大可能值

	if s.IsLandlord() {
		// 地主视角：两个农民都是对手
		if s.gameState.Player1Role == database.PlayerRoleFarmer && s.gameState.Player1Cards < minCards {
			minCards = s.gameState.Player1Cards
		}
		if s.gameState.Player2Role == database.PlayerRoleFarmer && s.gameState.Player2Cards < minCards {
			minCards = s.gameState.Player2Cards
		}
		if s.gameState.Player3Role == database.PlayerRoleFarmer && s.gameState.Player3Cards < minCards {
			minCards = s.gameState.Player3Cards
		}
	} else {
		// 农民视角：地主是对手
		if s.gameState.Player1Role == database.PlayerRoleLandlord {
			minCards = s.gameState.Player1Cards
		}
		if s.gameState.Player2Role == database.PlayerRoleLandlord {
			minCards = s.gameState.Player2Cards
		}
		if s.gameState.Player3Role == database.PlayerRoleLandlord {
			minCards = s.gameState.Player3Cards
		}
	}

	return minCards
}

// GetLandlordCards 获取地主剩余牌数
func (s *DDZAIStrategy) GetLandlordCards() int {
	if s.gameState == nil {
		return 20
	}

	if s.gameState.Player1Role == database.PlayerRoleLandlord {
		return s.gameState.Player1Cards
	}
	if s.gameState.Player2Role == database.PlayerRoleLandlord {
		return s.gameState.Player2Cards
	}
	if s.gameState.Player3Role == database.PlayerRoleLandlord {
		return s.gameState.Player3Cards
	}

	return 20
}

// GetTeammateCards 获取队友剩余牌数
func (s *DDZAIStrategy) GetTeammateCards() int {
	if s.IsLandlord() {
		return 0 // 地主没有队友
	}

	teammateID := s.GetTeammateID()
	if teammateID == 0 {
		return 17
	}

	if s.gameState != nil {
		if s.gameState.Player1ID == teammateID {
			return s.gameState.Player1Cards
		}
		if s.gameState.Player2ID == teammateID {
			return s.gameState.Player2Cards
		}
		if s.gameState.Player3ID == teammateID {
			return s.gameState.Player3Cards
		}
	}

	return 17
}

// =============================================
// 炸弹策略
// =============================================

// ShouldUseBomb 判断是否应该使用炸弹
// 炸弹使用条件：
// 1. 对手（地主或农民）只剩1-2张牌
// 2. 自己使用炸弹后能一次出完
// 3. 队友即将获胜（农民协作）
func (s *DDZAIStrategy) ShouldUseBomb(opponentHand *PlayRecord) bool {
	if s.gameState == nil {
		return false
	}

	// 获取对手最少牌数
	opponentMinCards := s.GetOpponentMinCards()

	// 条件1：对手只剩1-2张牌，必须炸
	if opponentMinCards <= 2 {
		log.Printf("[AIStrategy] 🔥 对手只剩 %d 张牌，必须使用炸弹", opponentMinCards)
		return true
	}

	// 条件2：自己使用炸弹后能一次出完
	myCards := len(s.gameState.MyHandCards)
	bombCardCount := 4 // 普通炸弹
	remaining := myCards - bombCardCount
	if remaining <= 2 && remaining > 0 {
		// 检查剩余牌是否能一次出完
		// 简化判断：剩余2张以内，可能能出完
		log.Printf("[AIStrategy] 🔥 使用炸弹后只剩 %d 张，可能一次出完", remaining)
		return true
	}

	// 条件3：队友即将获胜（农民协作）
	if s.IsFarmer() {
		teammateCards := s.GetTeammateCards()
		if teammateCards <= 2 {
			// 队友快赢了，不需要炸
			log.Printf("[AIStrategy] ⏭️ 队友只剩 %d 张，不需要炸", teammateCards)
			return false
		}
	}

	// 条件4：概率决定
	if rand.Float64() < s.config.BombThreshold {
		log.Printf("[AIStrategy] 🎲 概率触发使用炸弹: %.2f", s.config.BombThreshold)
		return true
	}

	return false
}

// ShouldUseRocket 判断是否应该使用王炸
// 王炸使用条件更严格：
// 1. 对手只剩1张牌
// 2. 使用后能直接获胜
func (s *DDZAIStrategy) ShouldUseRocket(opponentHand *PlayRecord) bool {
	if s.gameState == nil {
		return false
	}

	// 获取对手最少牌数
	opponentMinCards := s.GetOpponentMinCards()

	// 条件1：对手只剩1张牌
	if opponentMinCards <= 1 {
		log.Printf("[AIStrategy] 💥 对手只剩 %d 张牌，必须使用王炸", opponentMinCards)
		return true
	}

	// 条件2：自己使用王炸后能一次出完
	myCards := len(s.gameState.MyHandCards)
	remaining := myCards - 2
	if remaining <= 1 {
		log.Printf("[AIStrategy] 💥 使用王炸后只剩 %d 张，可以一次出完", remaining)
		return true
	}

	// 条件3：概率决定（更低概率）
	if rand.Float64() < s.config.RocketThreshold {
		log.Printf("[AIStrategy] 🎲 概率触发使用王炸: %.2f", s.config.RocketThreshold)
		return true
	}

	return false
}

// =============================================
// 出牌决策
// =============================================

// DecidePlay 决定出牌
func (s *DDZAIStrategy) DecidePlay(gameState *GameState) *PlayDecision {
	s.gameState = gameState

	log.Printf("[AIStrategy] ===== 开始智能出牌决策 =====")
	log.Printf("[AIStrategy] 角色: %s, 手牌数: %d", s.GetRoleString(), len(gameState.MyHandCards))

	// 检查是否需要让牌（分数控制）
	if s.runtime != nil && s.runtime.ScoreControl != nil && s.runtime.ScoreControl.LetWinEnabled {
		if s.shouldLetWin() {
			return s.letWinDecision()
		}
	}

	// 判断是否是新回合
	isNewRound := gameState.CurrentPlay == nil || gameState.CurrentPlay.IsPass

	if isNewRound {
		return s.firstPlayDecision()
	}

	// 需要接牌
	return s.followPlayDecision()
}

// firstPlayDecision 新回合出牌决策
func (s *DDZAIStrategy) firstPlayDecision() *PlayDecision {
	log.Printf("[AIStrategy] 新回合出牌")

	// 根据角色选择策略
	if s.IsLandlord() {
		return s.landlordFirstPlay()
	}
	return s.farmerFirstPlay()
}

// followPlayDecision 接牌决策
func (s *DDZAIStrategy) followPlayDecision() *PlayDecision {
	log.Printf("[AIStrategy] 接牌决策")

	currentPlay := s.gameState.CurrentPlay

	// 检查是否是队友出的牌
	if s.IsTeammate(currentPlay.PlayerID) {
		log.Printf("[AIStrategy] 👥 队友 %d 出的牌，选择放行", currentPlay.PlayerID)
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     "队友出的牌，选择放行",
		}
	}

	// 检查是否应该压牌
	shouldBeat := s.shouldBeatCurrentPlay()
	if !shouldBeat {
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     "选择保存实力",
		}
	}

	// 找能打过的最小牌
	cards := s.findSmallestBeatingCards()
	if cards == nil {
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     "没有能打过的牌",
		}
	}

	return &PlayDecision{
		ShouldPlay: true,
		Cards:      cards,
		Pattern:    currentPlay.Pattern,
		Reason:     "找到能打过的牌",
	}
}

// shouldBeatCurrentPlay 判断是否应该压过当前出牌
func (s *DDZAIStrategy) shouldBeatCurrentPlay() bool {
	// 获取对手最少牌数
	opponentMinCards := s.GetOpponentMinCards()

	// 对手只剩很少的牌，必须压
	if opponentMinCards <= 2 {
		log.Printf("[AIStrategy] 对手只剩 %d 张，必须压", opponentMinCards)
		return true
	}

	// 地主出的牌，农民倾向于压
	if s.gameState.CurrentPlay.Role == database.PlayerRoleLandlord && s.IsFarmer() {
		return true
	}

	// 根据激进程度决定
	return rand.Float64() < s.config.PlayAggressiveness
}

// findSmallestBeatingCards 找能打过的最小牌
func (s *DDZAIStrategy) findSmallestBeatingCards() []CardInfo {
	hand := s.gameState.MyHandCards
	currentPlay := s.gameState.CurrentPlay

	// 简化实现：根据牌型查找
	switch currentPlay.Pattern {
	case "单牌":
		return s.findSmallestSingle(hand, currentPlay.Cards[0].Rank)
	case "对子":
		return s.findSmallestPair(hand, currentPlay.Cards[0].Rank)
	case "三条":
		return s.findSmallestTrio(hand, currentPlay.Cards[0].Rank)
	case "三带一":
		return s.findSmallestTrioWithOne(hand, currentPlay.Cards[0].Rank)
	case "三带二":
		return s.findSmallestTrioWithPair(hand, currentPlay.Cards[0].Rank)
	case "顺子":
		return s.findSmallestStraight(hand, currentPlay.Cards[0].Rank, len(currentPlay.Cards))
	case "连对":
		return s.findSmallestPairStraight(hand, currentPlay.Cards[0].Rank, len(currentPlay.Cards)/2)
	case "炸弹":
		// 对方出炸弹，需要更大的炸弹或王炸
		if s.ShouldUseBomb(currentPlay) {
			return s.findSmallestBomb(hand, currentPlay.Cards[0].Rank)
		}
		return nil
	default:
		// 尝试用炸弹
		if s.ShouldUseBomb(currentPlay) {
			return s.findSmallestBomb(hand, 0)
		}
		return nil
	}
}

// =============================================
// 地主策略
// =============================================

// landlordFirstPlay 地主首发策略
func (s *DDZAIStrategy) landlordFirstPlay() *PlayDecision {
	log.Printf("[AIStrategy] 地主首发策略")

	hand := s.gameState.MyHandCards
	opponentMinCards := s.GetOpponentMinCards()

	// 对手快出完了，紧急压制
	if opponentMinCards <= 3 {
		log.Printf("[AIStrategy] 对手快出完，紧急压制")
		// 出最大的牌
		return s.playLargestCards(hand)
	}

	// 正常出牌：优先出小牌
	return s.playSmallestCards(hand)
}

// =============================================
// 农民策略
// =============================================

// farmerFirstPlay 农民首发策略
func (s *DDZAIStrategy) farmerFirstPlay() *PlayDecision {
	log.Printf("[AIStrategy] 农民首发策略")

	hand := s.gameState.MyHandCards
	landlordCards := s.GetLandlordCards()
	teammateCards := s.GetTeammateCards()

	// 地主快出完了，需要压制
	if landlordCards <= 3 {
		log.Printf("[AIStrategy] 地主只剩 %d 张，需要压制", landlordCards)
		return s.playMediumCards(hand)
	}

	// 队友快出完了，帮队友
	if teammateCards <= 3 && teammateCards < len(hand) {
		log.Printf("[AIStrategy] 队友只剩 %d 张，出小牌帮队友", teammateCards)
		return s.playSmallestCards(hand)
	}

	// 正常出牌
	return s.playSmallestCards(hand)
}

// =============================================
// 牌型查找方法
// =============================================

// findSmallestSingle 找最小能打过的单牌
func (s *DDZAIStrategy) findSmallestSingle(cards []CardInfo, targetRank int) []CardInfo {
	// 排序
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	// 找第一张大于目标的牌
	for _, card := range sorted {
		if card.Rank > targetRank {
			return []CardInfo{card}
		}
	}

	// 尝试用炸弹
	if s.ShouldUseBomb(nil) {
		return s.findSmallestBomb(cards, 0)
	}

	return nil
}

// findSmallestPair 找最小能打过的对子
func (s *DDZAIStrategy) findSmallestPair(cards []CardInfo, targetRank int) []CardInfo {
	// 统计各点数的数量
	rankCount := make(map[int][]CardInfo)
	for _, card := range cards {
		rankCount[card.Rank] = append(rankCount[card.Rank], card)
	}

	// 找最小的能打过的对子
	for rank := targetRank + 1; rank <= 17; rank++ {
		if len(rankCount[rank]) >= 2 {
			return rankCount[rank][:2]
		}
	}

	// 尝试用炸弹
	if s.ShouldUseBomb(nil) {
		return s.findSmallestBomb(cards, 0)
	}

	return nil
}

// findSmallestTrio 找最小能打过的三张
func (s *DDZAIStrategy) findSmallestTrio(cards []CardInfo, targetRank int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, card := range cards {
		rankCount[card.Rank] = append(rankCount[card.Rank], card)
	}

	for rank := targetRank + 1; rank <= 15; rank++ {
		if len(rankCount[rank]) >= 3 {
			return rankCount[rank][:3]
		}
	}

	return nil
}

// findSmallestTrioWithOne 找最小三带一
func (s *DDZAIStrategy) findSmallestTrioWithOne(cards []CardInfo, targetRank int) []CardInfo {
	trio := s.findSmallestTrio(cards, targetRank)
	if trio == nil {
		return nil
	}

	// 找一张单牌
	for _, card := range cards {
		if card.Rank != trio[0].Rank {
			return append(trio, card)
		}
	}

	return nil
}

// findSmallestTrioWithPair 找最小三带二
func (s *DDZAIStrategy) findSmallestTrioWithPair(cards []CardInfo, targetRank int) []CardInfo {
	trio := s.findSmallestTrio(cards, targetRank)
	if trio == nil {
		return nil
	}

	// 找一个对子
	pair := s.findSmallestPair(cards, 0)
	if pair != nil && pair[0].Rank != trio[0].Rank {
		return append(trio, pair...)
	}

	return nil
}

// findSmallestStraight 找最小顺子
func (s *DDZAIStrategy) findSmallestStraight(cards []CardInfo, targetRank int, length int) []CardInfo {
	rankSet := make(map[int]bool)
	cardMap := make(map[int]CardInfo)
	for _, card := range cards {
		if card.Rank >= 3 && card.Rank <= 14 { // 顺子只能3到A
			rankSet[card.Rank] = true
			cardMap[card.Rank] = card
		}
	}

	// 从目标点数+1开始找连续的牌
	for start := targetRank + 1; start <= 14-length+1; start++ {
		valid := true
		for i := 0; i < length; i++ {
			if !rankSet[start+i] {
				valid = false
				break
			}
		}
		if valid {
			result := make([]CardInfo, length)
			for i := 0; i < length; i++ {
				result[i] = cardMap[start+i]
			}
			return result
		}
	}

	return nil
}

// findSmallestPairStraight 找最小连对
func (s *DDZAIStrategy) findSmallestPairStraight(cards []CardInfo, targetRank int, pairCount int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, card := range cards {
		if card.Rank >= 3 && card.Rank <= 14 {
			rankCount[card.Rank] = append(rankCount[card.Rank], card)
		}
	}

	for start := targetRank + 1; start <= 14-pairCount+1; start++ {
		valid := true
		for i := 0; i < pairCount; i++ {
			if len(rankCount[start+i]) < 2 {
				valid = false
				break
			}
		}
		if valid {
			result := make([]CardInfo, 0, pairCount*2)
			for i := 0; i < pairCount; i++ {
				result = append(result, rankCount[start+i][:2]...)
			}
			return result
		}
	}

	return nil
}

// findSmallestBomb 找最小炸弹
func (s *DDZAIStrategy) findSmallestBomb(cards []CardInfo, targetRank int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, card := range cards {
		rankCount[card.Rank] = append(rankCount[card.Rank], card)
	}

	// 先找普通炸弹
	for rank := targetRank + 1; rank <= 15; rank++ {
		if len(rankCount[rank]) == 4 {
			return rankCount[rank]
		}
	}

	// 再找王炸
	if len(rankCount[16]) > 0 && len(rankCount[17]) > 0 {
		return []CardInfo{rankCount[16][0], rankCount[17][0]}
	}

	return nil
}

// =============================================
// 辅助出牌方法
// =============================================

// playSmallestCards 出最小牌
func (s *DDZAIStrategy) playSmallestCards(cards []CardInfo) *PlayDecision {
	if len(cards) == 0 {
		return &PlayDecision{ShouldPlay: false, Reason: "没有牌可出"}
	}

	// 排序
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	// 出最小的单牌
	return &PlayDecision{
		ShouldPlay: true,
		Cards:      []CardInfo{sorted[0]},
		Pattern:    "单牌",
		Reason:     "出最小单牌",
	}
}

// playMediumCards 出中等大小的牌
func (s *DDZAIStrategy) playMediumCards(cards []CardInfo) *PlayDecision {
	if len(cards) == 0 {
		return &PlayDecision{ShouldPlay: false, Reason: "没有牌可出"}
	}

	// 排序
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	// 出中间的牌
	mid := len(sorted) / 2
	return &PlayDecision{
		ShouldPlay: true,
		Cards:      []CardInfo{sorted[mid]},
		Pattern:    "单牌",
		Reason:     "出中等大小的牌",
	}
}

// playLargestCards 出最大的牌
func (s *DDZAIStrategy) playLargestCards(cards []CardInfo) *PlayDecision {
	if len(cards) == 0 {
		return &PlayDecision{ShouldPlay: false, Reason: "没有牌可出"}
	}

	// 排序（降序）
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank > sorted[j].Rank
	})

	// 出最大的单牌
	return &PlayDecision{
		ShouldPlay: true,
		Cards:      []CardInfo{sorted[0]},
		Pattern:    "单牌",
		Reason:     "出最大的牌压制",
	}
}

// =============================================
// 让牌策略
// =============================================

// shouldLetWin 判断是否应该让牌
func (s *DDZAIStrategy) shouldLetWin() bool {
	if s.runtime == nil || s.runtime.ScoreControl == nil {
		return false
	}

	// 根据目标排名判断
	targetRank := s.runtime.ScoreControl.TargetRankRange[0]
	currentRank := s.runtime.Rank

	// 如果当前排名比目标好，需要让牌
	if currentRank > 0 && currentRank < targetRank {
		log.Printf("[AIStrategy] 当前排名 %d 比目标 %d 好，触发让牌", currentRank, targetRank)
		return true
	}

	// 根据失误率随机让牌
	if rand.Float64() < s.runtime.ScoreControl.MistakeRate {
		log.Printf("[AIStrategy] 失误触发让牌")
		return true
	}

	return false
}

// letWinDecision 让牌决策
func (s *DDZAIStrategy) letWinDecision() *PlayDecision {
	log.Printf("[AIStrategy] 执行让牌策略")

	// 选择过牌
	return &PlayDecision{
		ShouldPlay: false,
		Cards:      nil,
		Reason:     "让牌策略：选择过牌",
		IsLetWin:   true,
	}
}

// =============================================
// 记牌器更新
// =============================================

// UpdateMemory 更新记牌器
func (s *DDZAIStrategy) UpdateMemory(playedCards []CardInfo) {
	if s.config.MemoryEnabled && s.memory != nil {
		s.memory.Update(playedCards)
	}
}

// GetMemory 获取记牌器
func (s *DDZAIStrategy) GetMemory() *CardMemory {
	return s.memory
}

// SetGameState 设置游戏状态
func (s *DDZAIStrategy) SetGameState(state *GameState) {
	s.gameState = state
}
