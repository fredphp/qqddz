// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
        "log"
        "math/rand"
        "sort"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// RobotAI 高级AI核心
// =============================================

// RobotAI 机器人AI核心
// 负责机器人的游戏决策，包括叫地主、出牌、让牌等
type RobotAI struct {
        config  *database.RobotAIConfig
        memory  *CardMemory
        robot   *database.RobotRuntime

        // 当前游戏状态
        gameState *GameState

        // 让牌状态
        letWinEnabled bool
        letWinTarget  uint64
}

// GameState 游戏状态
type GameState struct {
        GameID        string       `json:"game_id"`
        MyRole        uint8        `json:"my_role"`         // 1-地主, 2-农民
        MyHandCards   []CardInfo   `json:"my_hand_cards"`   // 我的手牌
        MyCardsCount  int          `json:"my_cards_count"`  // 我的手牌数量
        LandlordCards []CardInfo   `json:"landlord_cards"`  // 底牌
        Multiplier    int          `json:"multiplier"`      // 当前倍数
        BombCount     int          `json:"bomb_count"`      // 已出炸弹数
        CurrentRound  int          `json:"current_round"`   // 当前回合

        // 玩家信息
        Player1ID     uint64       `json:"player1_id"`
        Player1Role   uint8        `json:"player1_role"`
        Player1Cards  int          `json:"player1_cards"`   // 玩家1剩余牌数

        Player2ID     uint64       `json:"player2_id"`
        Player2Role   uint8        `json:"player2_role"`
        Player2Cards  int          `json:"player2_cards"`   // 玩家2剩余牌数

        Player3ID     uint64       `json:"player3_id"`
        Player3Role   uint8        `json:"player3_role"`
        Player3Cards  int          `json:"player3_cards"`   // 玩家3剩余牌数

        // 出牌历史
        PlayHistory   []PlayRecord `json:"play_history"`

        // 当前回合出牌
        CurrentPlay   *PlayRecord  `json:"current_play"`    // 当前回合最后一个有效出牌
        IsMyTurn      bool         `json:"is_my_turn"`      // 是否轮到我
}

// CardInfo 卡牌信息
type CardInfo struct {
        Rank  int    `json:"rank"`   // 点数 3-15, 小王=16, 大王=17
        Suit  int    `json:"suit"`   // 花色 0-3
        Code  string `json:"code"`   // 卡牌编码
}

// PlayRecord 出牌记录
type PlayRecord struct {
        PlayerID   uint64     `json:"player_id"`
        Role       uint8      `json:"role"`
        Cards      []CardInfo `json:"cards"`
        Pattern    string     `json:"pattern"`    // 牌型
        IsBomb     bool       `json:"is_bomb"`
        IsRocket   bool       `json:"is_rocket"`
        IsPass     bool       `json:"is_pass"`
        RoundNum   int        `json:"round_num"`
}

// NewRobotAI 创建机器人AI
func NewRobotAI(robot *database.RobotRuntime, config *database.RobotAIConfig) *RobotAI {
        ai := &RobotAI{
                config:        config,
                robot:         robot,
                memory:        NewCardMemory(),
                gameState:     &GameState{},
                letWinEnabled: false,
        }

        // 如果启用让牌，初始化让牌状态
        if robot != nil && robot.IsLetWinEnabled() && config.IsLetWinAllowed() {
                ai.letWinEnabled = true
        }

        return ai
}

// =============================================
// 叫地主决策
// =============================================

// BidDecision 叫地主决策结果
type BidDecision struct {
        ShouldBid   bool   `json:"should_bid"`   // 是否叫地主
        BidType     uint8  `json:"bid_type"`     // 0-不叫, 1-叫地主, 2-抢地主
        BidScore    int    `json:"bid_score"`    // 叫分 1-3
        ThinkTime   int    `json:"think_time"`   // 思考时间(毫秒)
        Reason      string `json:"reason"`       // 决策原因
}

// DecideBid 抢地主决策
// 根据手牌质量和AI配置决定是否叫地主/抢地主
func (ai *RobotAI) DecideBid(handCards []CardInfo, bidOrder int, currentBidScore int) *BidDecision {
        log.Printf("[RobotAI] 叫地主决策: 手牌数=%d, 顺序=%d, 当前叫分=%d", len(handCards), bidOrder, currentBidScore)

        // 计算手牌质量评分
        score := ai.evaluateHandCards(handCards)
        log.Printf("[RobotAI] 手牌质量评分: %.2f", score)

        // 计算思考时间（叫地主不是炸弹场景）
        thinkTime := ai.calculateThinkTime(false)

        decision := &BidDecision{
                ThinkTime: thinkTime,
        }

        // 根据评分和AI配置决定是否叫地主
        threshold := ai.config.BidThreshold
        if currentBidScore > 0 {
                // 已有人叫分，使用抢地主阈值
                threshold = ai.config.GrabThreshold
        }

        // 根据激进程度调整阈值
        adjustedThreshold := threshold * (1 - ai.config.BidAggressiveness*0.2)

        if score >= adjustedThreshold {
                decision.ShouldBid = true

                // 决定叫分
                if currentBidScore == 0 {
                        decision.BidType = database.BidTypeCall
                        // 根据评分决定叫几分
                        if score >= 0.85 {
                                decision.BidScore = 3
                        } else if score >= 0.75 {
                                decision.BidScore = 2
                        } else {
                                decision.BidScore = 1
                        }
                        decision.Reason = "手牌质量较好，选择叫地主"
                } else {
                        decision.BidType = database.BidTypeGrab
                        decision.BidScore = currentBidScore + 1
                        if decision.BidScore > 3 {
                                decision.BidScore = 3
                        }
                        decision.Reason = "手牌质量优秀，选择抢地主"
                }
        } else {
                decision.ShouldBid = false
                decision.BidType = database.BidTypePass
                decision.BidScore = 0
                decision.Reason = "手牌质量一般，选择不叫"
        }

        // 如果是最后一个叫地主且没人叫，有概率强制叫
        if bidOrder == 3 && currentBidScore == 0 {
                if rand.Float64() < ai.config.BidAggressiveness {
                        decision.ShouldBid = true
                        decision.BidType = database.BidTypeCall
                        decision.BidScore = 1
                        decision.Reason = "最后叫地主顺序，强制叫地主"
                }
        }

        log.Printf("[RobotAI] 叫地主决策结果: shouldBid=%v, bidType=%d, bidScore=%d",
                decision.ShouldBid, decision.BidType, decision.BidScore)

        return decision
}

// evaluateHandCards 评估手牌质量
// 返回 0-1 的评分，越高表示手牌越好
func (ai *RobotAI) evaluateHandCards(cards []CardInfo) float64 {
        if len(cards) == 0 {
                return 0
        }

        // 统计牌型
        analysis := ai.analyzeHandCards(cards)

        score := 0.0

        // 1. 大牌加分
        // 王牌
        if analysis.HasBlackJoker {
                score += 0.08
        }
        if analysis.HasRedJoker {
                score += 0.10
        }

        // 2和A
        score += float64(analysis.TwoCount) * 0.05
        score += float64(analysis.AceCount) * 0.03

        // 2. 炸弹加分
        score += float64(analysis.BombCount) * 0.15

        // 3. 三张加分
        score += float64(analysis.TrioCount) * 0.04

        // 4. 对子加分
        score += float64(analysis.PairCount) * 0.02

        // 5. 顺子加分
        score += float64(analysis.StraightCount) * 0.03

        // 6. 单牌扣分（单牌太多不好）
        singlePenalty := float64(analysis.SingleCount) * 0.015
        score -= singlePenalty

        // 7. 控制力加分（能够接牌的能力）
        score += float64(analysis.ControlPower) * 0.01

        // 限制在 0-1 范围
        if score < 0 {
                score = 0
        }
        if score > 1 {
                score = 1
        }

        return score
}

// HandAnalysis 手牌分析结果
type HandAnalysis struct {
        TotalCount    int   `json:"total_count"`
        SingleCount   int   `json:"single_count"`
        PairCount     int   `json:"pair_count"`
        TrioCount     int   `json:"trio_count"`
        BombCount     int   `json:"bomb_count"`
        StraightCount int   `json:"straight_count"`
        TwoCount      int   `json:"two_count"`      // 2的数量
        AceCount      int   `json:"ace_count"`      // A的数量
        HasBlackJoker bool  `json:"has_black_joker"`
        HasRedJoker   bool  `json:"has_red_joker"`
        ControlPower  int   `json:"control_power"`  // 控制力评分
}

// analyzeHandCards 分析手牌结构
func (ai *RobotAI) analyzeHandCards(cards []CardInfo) *HandAnalysis {
        analysis := &HandAnalysis{
                TotalCount: len(cards),
        }

        // 统计各点数的数量
        rankCount := make(map[int]int)
        for _, card := range cards {
                rankCount[card.Rank]++

                // 统计王
                if card.Rank == 16 {
                        analysis.HasBlackJoker = true
                }
                if card.Rank == 17 {
                        analysis.HasRedJoker = true
                }
                // 统计2和A
                if card.Rank == 15 {
                        analysis.TwoCount++
                }
                if card.Rank == 14 {
                        analysis.AceCount++
                }
        }

        // 统计牌型
        for _, count := range rankCount {
                switch count {
                case 1:
                        analysis.SingleCount++
                case 2:
                        analysis.PairCount++
                case 3:
                        analysis.TrioCount++
                case 4:
                        analysis.BombCount++
                }
        }

        // 检测顺子
        analysis.StraightCount = ai.detectStraights(rankCount)

        // 计算控制力
        analysis.ControlPower = ai.calculateControlPower(rankCount)

        return analysis
}

// detectStraights 检测顺子
func (ai *RobotAI) detectStraights(rankCount map[int]int) int {
        straightCount := 0
        consecutive := 0

        for rank := 3; rank <= 14; rank++ { // 3到A
                if rankCount[rank] > 0 {
                        consecutive++
                        if consecutive >= 5 {
                                straightCount++
                        }
                } else {
                        consecutive = 0
                }
        }

        return straightCount
}

// calculateControlPower 计算控制力
func (ai *RobotAI) calculateControlPower(rankCount map[int]int) int {
        power := 0

        // 大牌提供控制力
        power += rankCount[15] * 2 // 2
        power += rankCount[14] * 1 // A
        power += rankCount[13] * 1 // K

        // 炸弹提供控制力
        for _, count := range rankCount {
                if count == 4 {
                        power += 3
                }
        }

        // 王提供控制力
        if rankCount[16] > 0 {
                power += 1
        }
        if rankCount[17] > 0 {
                power += 2
        }

        return power
}

// =============================================
// 出牌决策
// =============================================

// PlayDecision 出牌决策结果
type PlayDecision struct {
        ShouldPlay   bool       `json:"should_play"`   // 是否出牌（false表示过牌）
        Cards        []CardInfo `json:"cards"`         // 要出的牌
        Pattern      string     `json:"pattern"`       // 牌型
        ThinkTime    int        `json:"think_time"`    // 思考时间(毫秒)
        IsLetWin     bool       `json:"is_let_win"`    // 是否在让牌
        Reason       string     `json:"reason"`        // 决策原因
}

// DecidePlay 出牌决策
// 根据当前游戏状态和手牌决定出什么牌
func (ai *RobotAI) DecidePlay(gameState *GameState) *PlayDecision {
        ai.gameState = gameState

        log.Printf("[RobotAI] 出牌决策: 角色=%d, 手牌数=%d", gameState.MyRole, len(gameState.MyHandCards))

        // 先做初步决策
        var decision *PlayDecision
        
        // 检查是否需要让牌
        if ai.letWinEnabled && ai.shouldLetWin(gameState) {
                decision = ai.letWinPlay(gameState, 0)
        } else if gameState.CurrentPlay == nil || gameState.CurrentPlay.IsPass {
                // 如果是新一轮出牌（没有上家出牌）
                decision = ai.firstPlayDecision(gameState, 0)
        } else {
                // 需要接牌
                decision = ai.followPlayDecision(gameState, 0)
        }
        
        // 判断是否是炸弹场景（出的牌是炸弹/王炸）
        isBomb := decision != nil && len(decision.Cards) >= 4 && ai.isBombCards(decision.Cards)
        
        // 计算思考时间（炸弹需要更长思考时间）
        decision.ThinkTime = ai.calculateThinkTime(isBomb)
        
        return decision
}

// isBombCards 判断是否是炸弹牌型
func (ai *RobotAI) isBombCards(cards []CardInfo) bool {
        if len(cards) == 4 {
                // 四张相同点数是炸弹
                return cards[0].Rank == cards[1].Rank && cards[1].Rank == cards[2].Rank && cards[2].Rank == cards[3].Rank
        }
        if len(cards) == 2 {
                // 王炸
                return (cards[0].Rank == 16 && cards[1].Rank == 17) || (cards[0].Rank == 17 && cards[1].Rank == 16)
        }
        return false
}

// firstPlayDecision 新一轮出牌决策
func (ai *RobotAI) firstPlayDecision(gameState *GameState, thinkTime int) *PlayDecision {
        log.Printf("[RobotAI] 新一轮出牌决策")

        // 根据角色选择策略
        if gameState.MyRole == database.PlayerRoleLandlord {
                // 地主策略：主动出击
                return ai.landlordFirstPlay(gameState, thinkTime)
        } else {
                // 农民策略：配合出牌
                return ai.farmerFirstPlay(gameState, thinkTime)
        }
}

// followPlayDecision 接牌决策
func (ai *RobotAI) followPlayDecision(gameState *GameState, thinkTime int) *PlayDecision {
        log.Printf("[RobotAI] 接牌决策: 上家牌型=%s", gameState.CurrentPlay.Pattern)

        // 检查是否需要压牌
        shouldBeat := ai.shouldBeatCurrentPlay(gameState)

        if !shouldBeat {
                // 选择过牌
                return &PlayDecision{
                        ShouldPlay: false,
                        Cards:      nil,
                        ThinkTime:  thinkTime,
                        Reason:     "选择过牌，保存实力",
                }
        }

        // 找出可以打过的最小牌组
        cards := ai.findSmallestBeatingCards(gameState)

        if cards == nil {
                // 没有能打过的牌，过牌
                return &PlayDecision{
                        ShouldPlay: false,
                        Cards:      nil,
                        ThinkTime:  thinkTime,
                        Reason:     "无法压过上家，选择过牌",
                }
        }

        return &PlayDecision{
                ShouldPlay: true,
                Cards:      cards,
                Pattern:    gameState.CurrentPlay.Pattern,
                ThinkTime:  thinkTime,
                Reason:     "成功找到能打过的牌",
        }
}

// shouldBeatCurrentPlay 判断是否需要压过当前出牌
func (ai *RobotAI) shouldBeatCurrentPlay(gameState *GameState) bool {
        // 如果是队友出的牌，不压
        if ai.isTeammate(gameState.CurrentPlay.PlayerID) {
                return false
        }

        // 如果对手只剩很少的牌，必须压
        opponentCards := ai.getOpponentMinCards(gameState)
        if opponentCards <= 2 {
                return true
        }

        // 根据出牌者的角色决定
        if gameState.CurrentPlay.Role == database.PlayerRoleLandlord {
                // 地主出的牌，农民倾向于压
                if gameState.MyRole == database.PlayerRoleFarmer {
                        return true
                }
        }

        // 根据激进程度决定
        return rand.Float64() < ai.config.PlayAggressiveness
}

// isTeammate 判断是否是队友
func (ai *RobotAI) isTeammate(playerID uint64) bool {
        // 如果我是地主，没有队友
        if ai.gameState.MyRole == database.PlayerRoleLandlord {
                return false
        }

        // 如果我是农民，其他农民是队友
        if ai.gameState.Player1ID == playerID {
                return ai.gameState.Player1Role == database.PlayerRoleFarmer
        }
        if ai.gameState.Player2ID == playerID {
                return ai.gameState.Player2Role == database.PlayerRoleFarmer
        }
        if ai.gameState.Player3ID == playerID {
                return ai.gameState.Player3Role == database.PlayerRoleFarmer
        }

        return false
}

// getOpponentMinCards 获取对手最少剩余牌数
func (ai *RobotAI) getOpponentMinCards(gameState *GameState) int {
        minCards := 17 // 最大初始手牌数

        if gameState.MyRole == database.PlayerRoleLandlord {
                // 我是地主，检查两个农民的牌数
                if gameState.Player1Role == database.PlayerRoleFarmer && gameState.Player1Cards < minCards {
                        minCards = gameState.Player1Cards
                }
                if gameState.Player2Role == database.PlayerRoleFarmer && gameState.Player2Cards < minCards {
                        minCards = gameState.Player2Cards
                }
                if gameState.Player3Role == database.PlayerRoleFarmer && gameState.Player3Cards < minCards {
                        minCards = gameState.Player3Cards
                }
        } else {
                // 我是农民，检查地主的牌数
                if gameState.Player1Role == database.PlayerRoleLandlord {
                        minCards = gameState.Player1Cards
                }
                if gameState.Player2Role == database.PlayerRoleLandlord {
                        minCards = gameState.Player2Cards
                }
                if gameState.Player3Role == database.PlayerRoleLandlord {
                        minCards = gameState.Player3Cards
                }
        }

        return minCards
}

// findSmallestBeatingCards 找出能打过的最小牌组
func (ai *RobotAI) findSmallestBeatingCards(gameState *GameState) []CardInfo {
        handCards := gameState.MyHandCards
        opponentCards := gameState.CurrentPlay.Cards

        // 根据牌型找对应的牌
        switch gameState.CurrentPlay.Pattern {
        case "单牌":
                return ai.findSmallestSingle(handCards, opponentCards[0].Rank)
        case "对子":
                return ai.findSmallestPair(handCards, opponentCards[0].Rank)
        case "三条":
                return ai.findSmallestTrio(handCards, opponentCards[0].Rank)
        case "三带一":
                return ai.findSmallestTrioWithOne(handCards, opponentCards[0].Rank)
        case "三带二":
                return ai.findSmallestTrioWithPair(handCards, opponentCards[0].Rank)
        case "顺子":
                return ai.findSmallestStraight(handCards, opponentCards[0].Rank, len(opponentCards))
        case "连对":
                return ai.findSmallestPairStraight(handCards, opponentCards[0].Rank, len(opponentCards)/2)
        case "飞机":
                return ai.findSmallestPlane(handCards, opponentCards[0].Rank, len(opponentCards))
        case "炸弹":
                return ai.findSmallestBomb(handCards, opponentCards[0].Rank)
        default:
                // 尝试用炸弹
                return ai.findSmallestBomb(handCards, 0)
        }
}

// =============================================
// 牌型查找方法
// =============================================

// findSmallestSingle 找最小能打过的单牌
func (ai *RobotAI) findSmallestSingle(cards []CardInfo, targetRank int) []CardInfo {
        // 按点数排序
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

        // 没有能打过的单牌，尝试用炸弹
        return ai.findSmallestBomb(cards, 0)
}

// findSmallestPair 找最小能打过的对子
func (ai *RobotAI) findSmallestPair(cards []CardInfo, targetRank int) []CardInfo {
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
        return ai.findSmallestBomb(cards, 0)
}

// findSmallestTrio 找最小能打过的三张
func (ai *RobotAI) findSmallestTrio(cards []CardInfo, targetRank int) []CardInfo {
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
func (ai *RobotAI) findSmallestTrioWithOne(cards []CardInfo, targetRank int) []CardInfo {
        trio := ai.findSmallestTrio(cards, targetRank)
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
func (ai *RobotAI) findSmallestTrioWithPair(cards []CardInfo, targetRank int) []CardInfo {
        trio := ai.findSmallestTrio(cards, targetRank)
        if trio == nil {
                return nil
        }

        // 找一个对子
        pair := ai.findSmallestPair(cards, 0)
        if pair != nil && pair[0].Rank != trio[0].Rank {
                return append(trio, pair...)
        }

        return nil
}

// findSmallestStraight 找最小顺子
func (ai *RobotAI) findSmallestStraight(cards []CardInfo, targetRank int, length int) []CardInfo {
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
func (ai *RobotAI) findSmallestPairStraight(cards []CardInfo, targetRank int, pairCount int) []CardInfo {
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

// findSmallestPlane 找最小飞机
func (ai *RobotAI) findSmallestPlane(cards []CardInfo, targetRank int, length int) []CardInfo {
        // 简化实现，找连续的三张
        trioCount := length / 3
        if trioCount < 2 {
                return nil
        }

        rankCount := make(map[int][]CardInfo)
        for _, card := range cards {
                rankCount[card.Rank] = append(rankCount[card.Rank], card)
        }

        for start := targetRank + 1; start <= 14-trioCount+1; start++ {
                valid := true
                for i := 0; i < trioCount; i++ {
                        if len(rankCount[start+i]) < 3 {
                                valid = false
                                break
                        }
                }
                if valid {
                        result := make([]CardInfo, 0, trioCount*3)
                        for i := 0; i < trioCount; i++ {
                                result = append(result, rankCount[start+i][:3]...)
                        }
                        return result
                }
        }

        return nil
}

// findSmallestBomb 找最小炸弹
func (ai *RobotAI) findSmallestBomb(cards []CardInfo, targetRank int) []CardInfo {
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
// 让牌策略
// =============================================

// EnableLetWin 启用让牌策略
func (ai *RobotAI) EnableLetWin(targetPlayerID uint64) {
        ai.letWinEnabled = true
        ai.letWinTarget = targetPlayerID
        log.Printf("[RobotAI] 启用让牌策略: 目标玩家=%d", targetPlayerID)
}

// DisableLetWin 禁用让牌策略
func (ai *RobotAI) DisableLetWin() {
        ai.letWinEnabled = false
        ai.letWinTarget = 0
        log.Printf("[RobotAI] 禁用让牌策略")
}

// shouldLetWin 判断是否应该让牌
func (ai *RobotAI) shouldLetWin(gameState *GameState) bool {
        if !ai.letWinEnabled {
                return false
        }

        // 检查让牌条件
        // 1. 目标玩家剩余牌数较少
        targetCards := ai.getTargetPlayerCards(gameState, ai.letWinTarget)
        if targetCards > ai.config.LetWinCardCount {
                return false
        }

        // 2. 随机概率
        if rand.Float64() > ai.config.LetWinThreshold {
                return false
        }

        return true
}

// letWinPlay 让牌出牌决策
func (ai *RobotAI) letWinPlay(gameState *GameState, thinkTime int) *PlayDecision {
        log.Printf("[RobotAI] 执行让牌策略")

        // 选择过牌或者出最小的牌
        if gameState.CurrentPlay == nil {
                // 新一轮，出最小的单牌
                cards := gameState.MyHandCards
                sort.Slice(cards, func(i, j int) bool {
                        return cards[i].Rank < cards[j].Rank
                })
                return &PlayDecision{
                        ShouldPlay: true,
                        Cards:      []CardInfo{cards[0]},
                        Pattern:    "单牌",
                        ThinkTime:  thinkTime,
                        IsLetWin:   true,
                        Reason:     "让牌策略：出最小牌",
                }
        }

        // 选择过牌
        return &PlayDecision{
                ShouldPlay: false,
                Cards:      nil,
                ThinkTime:  thinkTime,
                IsLetWin:   true,
                Reason:     "让牌策略：选择过牌",
        }
}

// getTargetPlayerCards 获取目标玩家剩余牌数
func (ai *RobotAI) getTargetPlayerCards(gameState *GameState, playerID uint64) int {
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
// 策略方法
// =============================================

// landlordFirstPlay 地主首发策略
func (ai *RobotAI) landlordFirstPlay(gameState *GameState, thinkTime int) *PlayDecision {
        cards := gameState.MyHandCards

        // 分析手牌结构
        analysis := ai.analyzeHandCards(cards)

        // 优先出牌顺序：
        // 1. 如果有单牌，先出单牌
        if analysis.SingleCount > 0 {
                return ai.playSmallestSingle(cards, thinkTime)
        }

        // 2. 出对子
        if analysis.PairCount > 0 {
                return ai.playSmallestPair(cards, thinkTime)
        }

        // 3. 出三张
        if analysis.TrioCount > 0 {
                return ai.playSmallestTrio(cards, thinkTime)
        }

        // 4. 出顺子
        if analysis.StraightCount > 0 {
                return ai.playSmallestStraightHand(cards, thinkTime)
        }

        // 默认出最小的牌
        return ai.playSmallestSingle(cards, thinkTime)
}

// farmerFirstPlay 农民首发策略
func (ai *RobotAI) farmerFirstPlay(gameState *GameState, thinkTime int) *PlayDecision {
        // 农民首发策略与地主类似，但可能需要更保守
        return ai.landlordFirstPlay(gameState, thinkTime)
}

// playSmallestSingle 出最小单牌
func (ai *RobotAI) playSmallestSingle(cards []CardInfo, thinkTime int) *PlayDecision {
        sorted := make([]CardInfo, len(cards))
        copy(sorted, cards)
        sort.Slice(sorted, func(i, j int) bool {
                return sorted[i].Rank < sorted[j].Rank
        })

        return &PlayDecision{
                ShouldPlay: true,
                Cards:      []CardInfo{sorted[0]},
                Pattern:    "单牌",
                ThinkTime:  thinkTime,
                Reason:     "出最小单牌",
        }
}

// playSmallestPair 出最小对子
func (ai *RobotAI) playSmallestPair(cards []CardInfo, thinkTime int) *PlayDecision {
        pair := ai.findSmallestPair(cards, 0)
        if pair != nil {
                return &PlayDecision{
                        ShouldPlay: true,
                        Cards:      pair,
                        Pattern:    "对子",
                        ThinkTime:  thinkTime,
                        Reason:     "出最小对子",
                }
        }
        return ai.playSmallestSingle(cards, thinkTime)
}

// playSmallestTrio 出最小三张
func (ai *RobotAI) playSmallestTrio(cards []CardInfo, thinkTime int) *PlayDecision {
        trio := ai.findSmallestTrio(cards, 0)
        if trio != nil {
                // 尝试带牌
                withOne := ai.findSmallestTrioWithOne(cards, 0)
                if withOne != nil {
                        return &PlayDecision{
                                ShouldPlay: true,
                                Cards:      withOne,
                                Pattern:    "三带一",
                                ThinkTime:  thinkTime,
                                Reason:     "出三带一",
                        }
                }

                return &PlayDecision{
                        ShouldPlay: true,
                        Cards:      trio,
                        Pattern:    "三条",
                        ThinkTime:  thinkTime,
                        Reason:     "出三张",
                }
        }
        return ai.playSmallestSingle(cards, thinkTime)
}

// playSmallestStraightHand 出最小顺子
func (ai *RobotAI) playSmallestStraightHand(cards []CardInfo, thinkTime int) *PlayDecision {
        // 尝试找5张的顺子
        straight := ai.findSmallestStraight(cards, 2, 5) // 从3开始
        if straight != nil {
                return &PlayDecision{
                        ShouldPlay: true,
                        Cards:      straight,
                        Pattern:    "顺子",
                        ThinkTime:  thinkTime,
                        Reason:     "出顺子",
                }
        }
        return ai.playSmallestSingle(cards, thinkTime)
}

// =============================================
// 工具方法
// =============================================

// calculateThinkTime 计算思考时间
// 返回毫秒为单位的思考时间，模拟真人思考
// isBomb: 是否是炸弹/王炸场景
func (ai *RobotAI) calculateThinkTime(isBomb bool) int {
        var minMs, maxMs int
        
        if isBomb {
                // 炸弹使用专门的思考时间范围（3-5秒）
                minMs = 3000
                maxMs = 5000
                if ai.config != nil && ai.config.BombThinkTime > minMs {
                        maxMs = ai.config.BombThinkTime
                }
        } else if ai.config != nil {
                minMs = ai.config.MinThinkTime
                maxMs = ai.config.MaxThinkTime
        } else {
                minMs = 1500
                maxMs = 3000
        }
        
        // 确保范围有效
        if minMs <= 0 {
                minMs = 1500
        }
        if maxMs <= minMs {
                maxMs = minMs + 1500
        }
        
        // 返回随机思考时间
        return minMs + rand.Intn(maxMs-minMs)
}

// UpdateMemory 更新记牌器
func (ai *RobotAI) UpdateMemory(playedCards []CardInfo) {
        if ai.config.IsMemoryEnabled() {
                ai.memory.Update(playedCards)
        }
}

// GetMemory 获取记牌器
func (ai *RobotAI) GetMemory() *CardMemory {
        return ai.memory
}

// SetGameState 设置游戏状态
func (ai *RobotAI) SetGameState(state *GameState) {
        ai.gameState = state
}

// GetGameState 获取游戏状态
func (ai *RobotAI) GetGameState() *GameState {
        return ai.gameState
}

// init 初始化随机种子
func init() {
        rand.Seed(time.Now().UnixNano())
}
