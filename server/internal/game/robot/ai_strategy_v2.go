// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"sort"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// AIStrategyV2 - 智能AI策略 V2
// =============================================

// AIStrategyV2 智能AI策略V2
// 实现智能拆牌、队友配合、残局模式、炸弹策略
type AIStrategyV2 struct {
	config    *database.RobotAIConfig
	evaluator *AIEvaluator
	gameState *GameState
	runtime   *ArenaRobotRuntime

	// 角色信息
	isLandlord bool
	isFarmer   bool

	// 队友信息
	teammateID  uint64
	teammateCards int
}

// NewAIStrategyV2 创建智能AI策略V2
func NewAIStrategyV2(config *database.RobotAIConfig) *AIStrategyV2 {
	return &AIStrategyV2{
		config:    config,
		evaluator: NewAIEvaluator(nil),
	}
}

// SetGameState 设置游戏状态
func (s *AIStrategyV2) SetGameState(state *GameState) {
	s.gameState = state
	s.evaluator.SetGameState(state)

	// 更新角色信息
	s.isLandlord = state.MyRole == database.PlayerRoleLandlord
	s.isFarmer = state.MyRole == database.PlayerRoleFarmer

	// 更新队友信息
	if s.isFarmer {
		s.teammateID = s.findTeammateID()
		s.teammateCards = s.getTeammateCards()
	}
}

// SetRuntime 设置运行时
func (s *AIStrategyV2) SetRuntime(runtime *ArenaRobotRuntime) {
	s.runtime = runtime
}

// =============================================
// 主决策入口
// =============================================

// DecidePlay 出牌决策主入口
func (s *AIStrategyV2) DecidePlay(gameState *GameState) *PlayDecision {
	s.SetGameState(gameState)

	log.Printf("[AI] ===== 开始智能出牌决策 V2 =====")
	log.Printf("[AI] role=%s", s.getRoleString())
	log.Printf("[AI] hand_cards=%d", len(gameState.MyHandCards))

	// 检查是否需要让牌（分数控制）
	if s.runtime != nil && s.runtime.ScoreControl != nil && s.runtime.ScoreControl.LetWinEnabled {
		if s.shouldLetWin() {
			log.Printf("[AI] choose=pass reason=let_win_enabled")
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

// =============================================
// 首次出牌决策
// =============================================

// firstPlayDecision 新回合出牌决策
func (s *AIStrategyV2) firstPlayDecision() *PlayDecision {
	log.Printf("[AI] 新回合出牌决策")

	cards := s.gameState.MyHandCards

	// 残局模式
	if s.evaluator.IsEndGame(cards) {
		log.Printf("[AI] 进入残局模式")
		return s.endGameFirstPlay()
	}

	// 根据角色选择策略
	if s.isLandlord {
		return s.landlordFirstPlay()
	}
	return s.farmerFirstPlay()
}

// landlordFirstPlay 地主首发策略
func (s *AIStrategyV2) landlordFirstPlay() *PlayDecision {
	log.Printf("[AI] 地主首发策略")

	cards := s.gameState.MyHandCards
	structure := s.evaluator.AnalyzeHand(cards)

	// 优先级：顺子 > 连对 > 三带 > 对子 > 单牌

	// 1. 尝试出顺子
	if straight := s.findSmallestStraight(cards, 5); straight != nil {
		log.Printf("[AI] choose=straight reason=landlord_priority")
		return &PlayDecision{
			ShouldPlay: true,
			Cards:      straight,
			Pattern:    "顺子",
			Reason:     "地主首发顺子",
		}
	}

	// 2. 尝试出连对
	if pairStraight := s.findSmallestPairStraight(cards, 2); pairStraight != nil {
		log.Printf("[AI] choose=pair_straight reason=landlord_priority")
		return &PlayDecision{
			ShouldPlay: true,
			Cards:      pairStraight,
			Pattern:    "连对",
			Reason:     "地主首发连对",
		}
	}

	// 3. 尝试出三带
	if structure.TrioCount > 0 {
		if trio := s.findBestTrioWithKicker(cards, structure); trio != nil {
			log.Printf("[AI] choose=trio_with_kicker reason=landlord_priority")
			return &PlayDecision{
				ShouldPlay: true,
				Cards:      trio,
				Pattern:    "三带一",
				Reason:     "地主首发三带",
			}
		}
	}

	// 4. 出对子
	if structure.PairCount > 0 {
		pair := s.findSmallestPair(cards)
		if pair != nil {
			log.Printf("[AI] choose=pair reason=landlord_first_play")
			return &PlayDecision{
				ShouldPlay: true,
				Cards:      pair,
				Pattern:    "对子",
				Reason:     "地主首发对子",
			}
		}
	}

	// 5. 出单牌
	if structure.SingleCount > 0 {
		single := s.findSmallestSingle(cards)
		if single != nil {
			log.Printf("[AI] choose=single reason=landlord_first_play")
			return &PlayDecision{
				ShouldPlay: true,
				Cards:      single,
				Pattern:    "单牌",
				Reason:     "地主首发单牌",
			}
		}
	}

	// 默认出最小的牌
	return s.playSmallestCard(cards)
}

// farmerFirstPlay 农民首发策略
func (s *AIStrategyV2) farmerFirstPlay() *PlayDecision {
	log.Printf("[AI] 农民首发策略")

	cards := s.gameState.MyHandCards
	structure := s.evaluator.AnalyzeHand(cards)
	landlordCards := s.getLandlordCards()
	teammateCards := s.teammateCards

	log.Printf("[AI] landlord_cards=%d teammate_cards=%d", landlordCards, teammateCards)

	// 队友领先时，保守出牌
	if teammateCards > 0 && teammateCards < landlordCards && teammateCards <= 5 {
		log.Printf("[AI] teammateLead=true")
		log.Printf("[AI] choose=conservative reason=protect_teammate")
		// 保守出牌，出最小
		return s.playSmallestCard(cards)
	}

	// 地主快出完了，需要压制
	if landlordCards <= 3 {
		log.Printf("[AI] landlord_remain=%d reason=need_block", landlordCards)
		return s.playMediumCard(cards)
	}

	// 农民保守策略：优先出单牌、对子，保留控制牌
	if structure.SingleCount > 0 {
		single := s.findSmallestSingle(cards)
		if single != nil {
			log.Printf("[AI] choose=single reason=farmer_conservative")
			return &PlayDecision{
				ShouldPlay: true,
				Cards:      single,
				Pattern:    "单牌",
				Reason:     "农民保守出单牌",
			}
		}
	}

	if structure.PairCount > 0 {
		pair := s.findSmallestPair(cards)
		if pair != nil {
			log.Printf("[AI] choose=pair reason=farmer_conservative")
			return &PlayDecision{
				ShouldPlay: true,
				Cards:      pair,
				Pattern:    "对子",
				Reason:     "农民保守出对子",
			}
		}
	}

	// 默认出最小的牌
	return s.playSmallestCard(cards)
}

// =============================================
// 接牌决策
// =============================================

// followPlayDecision 接牌决策
func (s *AIStrategyV2) followPlayDecision() *PlayDecision {
	currentPlay := s.gameState.CurrentPlay

	log.Printf("[AI] 接牌决策: pattern=%s", currentPlay.Pattern)

	// 检查是否是队友出的牌
	if s.isFarmer && s.IsTeammate(currentPlay.PlayerID) {
		log.Printf("[AI] teammateLead=true")
		log.Printf("[AI] choose=pass reason=protect_teammate")
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     "队友出的牌，选择放行",
		}
	}

	// 检查是否应该压牌
	shouldBeat, reason := s.shouldBeatCurrentPlay()
	if !shouldBeat {
		log.Printf("[AI] choose=pass reason=%s", reason)
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     reason,
		}
	}

	// 找能打过的牌（支持智能拆牌）
	cards := s.findBeatingCardsWithSmartSplit()
	if cards == nil {
		log.Printf("[AI] choose=pass reason=no_valid_cards")
		return &PlayDecision{
			ShouldPlay: false,
			Cards:      nil,
			Reason:     "没有能打过的牌",
		}
	}

	log.Printf("[AI] choose=play reason=%s", reason)
	return &PlayDecision{
		ShouldPlay: true,
		Cards:      cards,
		Pattern:    currentPlay.Pattern,
		Reason:     "找到能打过的牌",
	}
}

// shouldBeatCurrentPlay 判断是否应该压过当前出牌
func (s *AIStrategyV2) shouldBeatCurrentPlay() (bool, string) {
	currentPlay := s.gameState.CurrentPlay

	// 获取对手最少牌数
	opponentMinCards := s.getOpponentMinCards()

	// 对手只剩1-2张牌，必须压
	if opponentMinCards <= 2 {
		log.Printf("[AI] opponent_remain=%d must_block=true", opponentMinCards)
		return true, "对手只剩少量牌，必须压制"
	}

	// 地主出的牌，农民倾向于压
	if s.isFarmer && currentPlay.Role == database.PlayerRoleLandlord {
		landlordCards := s.getLandlordCards()
		if landlordCards <= 5 {
			return true, "地主牌少，农民必须压制"
		}
		return true, "地主出牌，农民倾向压制"
	}

	// 根据激进程度决定
	// 但如果是队友领先，保守一些
	if s.isFarmer {
		teammateCards := s.teammateCards
		landlordCards := s.getLandlordCards()

		// 队友领先，不压
		if teammateCards > 0 && teammateCards < landlordCards {
			return false, "队友领先，保存实力"
		}
	}

	return true, "正常压牌"
}

// =============================================
// 智能拆牌逻辑
// =============================================

// findBeatingCardsWithSmartSplit 智能拆牌找能打过的牌
func (s *AIStrategyV2) findBeatingCardsWithSmartSplit() []CardInfo {
	currentPlay := s.gameState.CurrentPlay
	hand := s.gameState.MyHandCards
	targetRank := currentPlay.Cards[0].Rank
	isEndGame := s.evaluator.IsEndGame(hand)

	switch currentPlay.Pattern {
	case "单牌":
		// 先尝试找普通单牌
		if single := s.findSmallestSingleAbove(hand, targetRank); single != nil {
			return single
		}

		// 没有单牌，尝试拆最小对子
		canSplit, pairRank := s.evaluator.CanSplitPair(hand, targetRank, isEndGame)
		if canSplit {
			log.Printf("[AI] split pair %d reason=block_enemy", pairRank)
			return s.findCardsWithRank(hand, pairRank, 1)
		}

		// 尝试拆三张（残局模式）
		if isEndGame {
			canSplitTrio, trioRank := s.evaluator.CanSplitTrio(hand, targetRank, isEndGame)
			if canSplitTrio {
				log.Printf("[AI] split trio %d reason=end_game", trioRank)
				return s.findCardsWithRank(hand, trioRank, 1)
			}
		}

		// 尝试用炸弹（满足条件时）
		if s.shouldUseBomb() {
			return s.findSmallestBomb(hand, 0)
		}

	case "对子":
		// 找能打过的对子
		if pair := s.findSmallestPairAbove(hand, targetRank); pair != nil {
			return pair
		}

		// 尝试拆三张（残局模式）
		if isEndGame {
			canSplit, trioRank := s.evaluator.CanSplitTrio(hand, targetRank, isEndGame)
			if canSplit {
				log.Printf("[AI] split trio %d for pair reason=end_game", trioRank)
				return s.findCardsWithRank(hand, trioRank, 2)
			}
		}

		// 尝试用炸弹
		if s.shouldUseBomb() {
			return s.findSmallestBomb(hand, 0)
		}

	default:
		// 其他牌型，使用基础查找逻辑
		return s.findSmallestBeatingCards()
	}

	return nil
}

// =============================================
// 残局策略
// =============================================

// endGameFirstPlay 残局首次出牌
func (s *AIStrategyV2) endGameFirstPlay() *PlayDecision {
	cards := s.gameState.MyHandCards
	structure := s.evaluator.AnalyzeHand(cards)

	log.Printf("[AI] 残局分析: 手数=%d", structure.HandCount)

	// 残局目标：优先减少手数

	// 如果能一次出完，直接出
	if structure.HandCount == 1 {
		return &PlayDecision{
			ShouldPlay: true,
			Cards:      cards,
			Pattern:    "一次出完",
			Reason:     "残局一次出完",
		}
	}

	// 尝试出能减少手数的牌
	// 优先出大牌获取出牌权

	// 如果只剩2-3手，出最小牌让对手接
	if structure.HandCount <= 3 {
		return s.playSmallestCard(cards)
	}

	// 默认出最小
	return s.playSmallestCard(cards)
}

// =============================================
// 炸弹策略
// =============================================

// shouldUseBomb 判断是否应该使用炸弹
func (s *AIStrategyV2) shouldUseBomb() bool {
	// 获取对手最少牌数
	opponentMinCards := s.getOpponentMinCards()
	myCards := len(s.gameState.MyHandCards)

	// Case1: 对手只剩1张，必须炸
	if opponentMinCards <= 1 {
		log.Printf("[AI] use_bomb=true reason=opponent_1_card")
		return true
	}

	// Case2: 炸后能直接赢
	structure := s.evaluator.AnalyzeHand(s.gameState.MyHandCards)
	if structure.HandCount <= 2 && (structure.BombCount > 0 || structure.RocketCount > 0) {
		log.Printf("[AI] use_bomb=true reason=can_win_after_bomb")
		return true
	}

	// Case3: 地主被卡死（作为地主时）
	if s.isLandlord && opponentMinCards <= 2 {
		log.Printf("[AI] use_bomb=true reason=landlord_blocked")
		return true
	}

	// 农民：队友快赢时不炸
	if s.isFarmer {
		teammateCards := s.teammateCards
		if teammateCards <= 2 {
			log.Printf("[AI] use_bomb=false reason=teammate_winning")
			return false
		}
	}

	// 其他情况不炸
	log.Printf("[AI] use_bomb=false reason=save_bomb")
	return false
}

// =============================================
// 让牌策略
// =============================================

// shouldLetWin 判断是否应该让牌
func (s *AIStrategyV2) shouldLetWin() bool {
	if s.runtime == nil || s.runtime.ScoreControl == nil {
		return false
	}

	// 根据目标排名判断
	targetRank := s.runtime.ScoreControl.TargetRankRange[0]
	currentRank := s.runtime.Rank

	// 如果当前排名比目标好，需要让牌
	if currentRank > 0 && currentRank < targetRank {
		return true
	}

	return false
}

// letWinDecision 让牌决策
func (s *AIStrategyV2) letWinDecision() *PlayDecision {
	return &PlayDecision{
		ShouldPlay: false,
		Cards:      nil,
		Reason:     "让牌策略：选择过牌",
		IsLetWin:   true,
	}
}

// =============================================
// 辅助方法
// =============================================

// findSmallestSingleAbove 找大于目标的最小单牌
func (s *AIStrategyV2) findSmallestSingleAbove(cards []CardInfo, targetRank int) []CardInfo {
	// 排序
	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	// 找第一张大于目标的牌
	for _, c := range sorted {
		if c.Rank > targetRank {
			return []CardInfo{c}
		}
	}

	return nil
}

// findSmallestPairAbove 找大于目标的最小对子
func (s *AIStrategyV2) findSmallestPairAbove(cards []CardInfo, targetRank int) []CardInfo {
	// 统计各点数的数量
	rankCount := make(map[int][]CardInfo)
	for _, c := range cards {
		rankCount[c.Rank] = append(rankCount[c.Rank], c)
	}

	// 找最小的能打过的对子
	for rank := targetRank + 1; rank <= 17; rank++ {
		if len(rankCount[rank]) >= 2 {
			return rankCount[rank][:2]
		}
	}

	return nil
}

// findSmallestPair 找最小对子
func (s *AIStrategyV2) findSmallestPair(cards []CardInfo) []CardInfo {
	return s.findSmallestPairAbove(cards, 0)
}

// findSmallestSingle 找最小单牌
func (s *AIStrategyV2) findSmallestSingle(cards []CardInfo) []CardInfo {
	return s.findSmallestSingleAbove(cards, 0)
}

// findCardsWithRank 找指定点数的牌
func (s *AIStrategyV2) findCardsWithRank(cards []CardInfo, rank int, count int) []CardInfo {
	var result []CardInfo
	for _, c := range cards {
		if c.Rank == rank {
			result = append(result, c)
			if len(result) >= count {
				break
			}
		}
	}
	return result
}

// findSmallestBomb 找最小炸弹
func (s *AIStrategyV2) findSmallestBomb(cards []CardInfo, targetRank int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, c := range cards {
		rankCount[c.Rank] = append(rankCount[c.Rank], c)
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

// findSmallestStraight 找最小顺子
func (s *AIStrategyV2) findSmallestStraight(cards []CardInfo, length int) []CardInfo {
	rankSet := make(map[int]bool)
	cardMap := make(map[int]CardInfo)
	for _, c := range cards {
		if c.Rank >= 3 && c.Rank <= 14 { // 顺子只能3到A
			rankSet[c.Rank] = true
			cardMap[c.Rank] = c
		}
	}

	for start := 3; start <= 14-length+1; start++ {
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
func (s *AIStrategyV2) findSmallestPairStraight(cards []CardInfo, pairCount int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, c := range cards {
		if c.Rank >= 3 && c.Rank <= 14 {
			rankCount[c.Rank] = append(rankCount[c.Rank], c)
		}
	}

	for start := 3; start <= 14-pairCount+1; start++ {
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

// findBestTrioWithKicker 找最优三带
func (s *AIStrategyV2) findBestTrioWithKicker(cards []CardInfo, structure *HandStructure) []CardInfo {
	if len(structure.Trios) == 0 {
		return nil
	}

	// 找最小的三张
	trioRank := structure.Trios[0]
	result := s.findCardsWithRank(cards, trioRank, 3)

	// 找带牌
	if len(structure.Singles) > 0 {
		for _, c := range cards {
			if c.Rank == structure.Singles[0] {
				result = append(result, c)
				break
			}
		}
	} else if len(structure.Pairs) > 0 && structure.Pairs[0] != trioRank {
		result = append(result, s.findCardsWithRank(cards, structure.Pairs[0], 2)...)
	}

	return result
}

// findSmallestBeatingCards 基础牌型查找
func (s *AIStrategyV2) findSmallestBeatingCards() []CardInfo {
	hand := s.gameState.MyHandCards
	currentPlay := s.gameState.CurrentPlay

	switch currentPlay.Pattern {
	case "三条":
		return s.findSmallestTrioAbove(hand, currentPlay.Cards[0].Rank)
	case "三带一":
		return s.findSmallestTrioWithOne(hand, currentPlay.Cards[0].Rank)
	case "三带二":
		return s.findSmallestTrioWithPair(hand, currentPlay.Cards[0].Rank)
	case "顺子":
		return s.findSmallestStraightAbove(hand, currentPlay.Cards[0].Rank, len(currentPlay.Cards))
	case "连对":
		return s.findSmallestPairStraightAbove(hand, currentPlay.Cards[0].Rank, len(currentPlay.Cards)/2)
	case "炸弹":
		return s.findSmallestBomb(hand, currentPlay.Cards[0].Rank)
	default:
		if s.shouldUseBomb() {
			return s.findSmallestBomb(hand, 0)
		}
		return nil
	}
}

// findSmallestTrioAbove 找最小三张
func (s *AIStrategyV2) findSmallestTrioAbove(cards []CardInfo, targetRank int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, c := range cards {
		rankCount[c.Rank] = append(rankCount[c.Rank], c)
	}

	for rank := targetRank + 1; rank <= 15; rank++ {
		if len(rankCount[rank]) >= 3 {
			return rankCount[rank][:3]
		}
	}

	return nil
}

// findSmallestTrioWithOne 找最小三带一
func (s *AIStrategyV2) findSmallestTrioWithOne(cards []CardInfo, targetRank int) []CardInfo {
	trio := s.findSmallestTrioAbove(cards, targetRank)
	if trio == nil {
		return nil
	}

	for _, c := range cards {
		if c.Rank != trio[0].Rank {
			return append(trio, c)
		}
	}

	return nil
}

// findSmallestTrioWithPair 找最小三带二
func (s *AIStrategyV2) findSmallestTrioWithPair(cards []CardInfo, targetRank int) []CardInfo {
	trio := s.findSmallestTrioAbove(cards, targetRank)
	if trio == nil {
		return nil
	}

	pair := s.findSmallestPairAbove(cards, 0)
	if pair != nil && pair[0].Rank != trio[0].Rank {
		return append(trio, pair...)
	}

	return nil
}

// findSmallestStraightAbove 找最小顺子
func (s *AIStrategyV2) findSmallestStraightAbove(cards []CardInfo, targetRank int, length int) []CardInfo {
	rankSet := make(map[int]bool)
	cardMap := make(map[int]CardInfo)
	for _, c := range cards {
		if c.Rank >= 3 && c.Rank <= 14 {
			rankSet[c.Rank] = true
			cardMap[c.Rank] = c
		}
	}

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

// findSmallestPairStraightAbove 找最小连对
func (s *AIStrategyV2) findSmallestPairStraightAbove(cards []CardInfo, targetRank int, pairCount int) []CardInfo {
	rankCount := make(map[int][]CardInfo)
	for _, c := range cards {
		if c.Rank >= 3 && c.Rank <= 14 {
			rankCount[c.Rank] = append(rankCount[c.Rank], c)
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

// playSmallestCard 出最小的牌
func (s *AIStrategyV2) playSmallestCard(cards []CardInfo) *PlayDecision {
	if len(cards) == 0 {
		return &PlayDecision{ShouldPlay: false, Reason: "没有牌可出"}
	}

	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	return &PlayDecision{
		ShouldPlay: true,
		Cards:      []CardInfo{sorted[0]},
		Pattern:    "单牌",
		Reason:     "出最小单牌",
	}
}

// playMediumCard 出中等大小的牌
func (s *AIStrategyV2) playMediumCard(cards []CardInfo) *PlayDecision {
	if len(cards) == 0 {
		return &PlayDecision{ShouldPlay: false, Reason: "没有牌可出"}
	}

	sorted := make([]CardInfo, len(cards))
	copy(sorted, cards)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Rank < sorted[j].Rank
	})

	mid := len(sorted) / 2
	return &PlayDecision{
		ShouldPlay: true,
		Cards:      []CardInfo{sorted[mid]},
		Pattern:    "单牌",
		Reason:     "出中等大小的牌",
	}
}

// =============================================
// 角色与队友判断
// =============================================

// getRoleString 获取角色字符串
func (s *AIStrategyV2) getRoleString() string {
	if s.isLandlord {
		return "地主"
	}
	return "农民"
}

// IsTeammate 判断是否是队友
func (s *AIStrategyV2) IsTeammate(playerID uint64) bool {
	if s.isLandlord {
		return false // 地主没有队友
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

// findTeammateID 找队友ID
func (s *AIStrategyV2) findTeammateID() uint64 {
	if s.isLandlord {
		return 0
	}

	myID := s.getMyID()

	if s.gameState.Player1Role == database.PlayerRoleFarmer && s.gameState.Player1ID != myID {
		return s.gameState.Player1ID
	}
	if s.gameState.Player2Role == database.PlayerRoleFarmer && s.gameState.Player2ID != myID {
		return s.gameState.Player2ID
	}
	if s.gameState.Player3Role == database.PlayerRoleFarmer && s.gameState.Player3ID != myID {
		return s.gameState.Player3ID
	}

	return 0
}

// getMyID 获取自己的ID
func (s *AIStrategyV2) getMyID() uint64 {
	if s.runtime != nil {
		return s.runtime.RobotID
	}
	return 0
}

// getTeammateCards 获取队友剩余牌数
func (s *AIStrategyV2) getTeammateCards() int {
	if s.teammateID == 0 {
		return 17
	}

	if s.gameState.Player1ID == s.teammateID {
		return s.gameState.Player1Cards
	}
	if s.gameState.Player2ID == s.teammateID {
		return s.gameState.Player2Cards
	}
	if s.gameState.Player3ID == s.teammateID {
		return s.gameState.Player3Cards
	}

	return 17
}

// getLandlordCards 获取地主剩余牌数
func (s *AIStrategyV2) getLandlordCards() int {
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

// getOpponentMinCards 获取对手最少剩余牌数
func (s *AIStrategyV2) getOpponentMinCards() int {
	minCards := 20

	if s.isLandlord {
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
