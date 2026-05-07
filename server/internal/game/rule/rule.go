package rule

import (
        "fmt"
        "slices"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
)

// HandType 定义牌型
type HandType int

const (
        Invalid        HandType = iota
        Single                  // 单张
        Pair                    // 对子
        Trio                    // 三张不带
        TrioWithSingle          // 三带一
        TrioWithPair            // 三带二

        Straight         // 顺子（5张或以上连续单张）
        PairStraight     // 连对（3对或以上）
        Plane            // 飞机不带翅膀（2个或以上连续三张）
        PlaneWithSingles // 飞机带单
        PlaneWithPairs   // 飞机带对

        Bomb             // 炸弹（四张相同）
        FourWithTwo      // 四带二（带两张相同或不同的单牌）
        FourWithTwoPairs // 四带两对（带两对）

        Rocket // 王炸（双王）
)

// String 返回牌型的中文名称
// handTypeNames 牌型名称映射表
var handTypeNames = map[HandType]string{
        Single:           "单张",
        Pair:             "对子",
        Trio:             "三张",
        TrioWithSingle:   "三带一",
        TrioWithPair:     "三带二",
        Straight:         "顺子",
        PairStraight:     "连对",
        Plane:            "飞机",
        PlaneWithSingles: "飞机带单",
        PlaneWithPairs:   "飞机带对",
        Bomb:             "炸弹",
        FourWithTwo:      "四带二",
        FourWithTwoPairs: "四带两对",
        Rocket:           "王炸",
}

// ParsedHand 解析后的手牌，用于比较
type ParsedHand struct {
        Type    HandType
        KeyRank card.Rank   // 决定大小的关键牌的点数 (例如 3334 中的 3, 或 34567 中的 3)
        Length  int         // 牌型的长度，主要用于顺子、连对、飞机
        Cards   []card.Card // 这手牌包含的卡牌
}

func (p ParsedHand) IsEmpty() bool {
        return p.Type == Invalid
}

// HandAnalysis 对手牌进行预分析，统计不同点数的牌出现了几次
type HandAnalysis struct {
        counts map[card.Rank]int // 每种点数牌的数量
        // 为了方便，提前将不同数量的牌分组
        fours []card.Rank
        trios []card.Rank
        pairs []card.Rank
        ones  []card.Rank
}

// handChecker 牌型检查函数类型
type handChecker func(HandAnalysis, ParsedHand) bool

// analyzeCards 分析手牌，返回一个包含所有统计信息的结构
func analyzeCards(cards []card.Card) HandAnalysis {
        analysis := HandAnalysis{
                counts: make(map[card.Rank]int),
        }
        for _, c := range cards {
                analysis.counts[c.Rank]++
        }

        for r, count := range analysis.counts {
                switch count {
                case 4:
                        analysis.fours = append(analysis.fours, r)
                case 3:
                        analysis.trios = append(analysis.trios, r)
                case 2:
                        analysis.pairs = append(analysis.pairs, r)
                case 1:
                        analysis.ones = append(analysis.ones, r)
                }
        }

        // 对结果进行排序，方便后续判断连续性
        // 【重要】按升序排序：小牌在前，大牌在后
        // 这样 isContinuous 函数可以正常工作
        sortRanks := func(ranks []card.Rank) {
                slices.Sort(ranks)
        }
        sortRanks(analysis.fours)
        sortRanks(analysis.trios)
        sortRanks(analysis.pairs)
        sortRanks(analysis.ones)

        return analysis
}

// isContinuous 检查给定的点数切片是否连续，并且不能包含 2 和大小王
func isContinuous(ranks []card.Rank) bool {
        if len(ranks) == 0 {
                return false
        }

        for i, r := range ranks {
                if r >= card.Rank2 { // 顺子、连对、飞机不能包含2和王
                        return false
                }
                if i > 0 && ranks[i-1]+1 != r {
                        return false
                }
        }

        return true
}

func (h HandType) String() string {
        if name, ok := handTypeNames[h]; ok {
                return name
        }
        return "无效"
}

// handCheckers 牌型检查函数映射表
var handCheckers = map[HandType]handChecker{
        Single:           func(a HandAnalysis, h ParsedHand) bool { return findWinningSingle(a, h) },
        Pair:             func(a HandAnalysis, h ParsedHand) bool { return findWinningPair(a, h) },
        Trio:             func(a HandAnalysis, h ParsedHand) bool { return findWinningTrio(a, h, 0) },
        TrioWithSingle:   func(a HandAnalysis, h ParsedHand) bool { return findWinningTrio(a, h, 1) },
        TrioWithPair:     func(a HandAnalysis, h ParsedHand) bool { return findWinningTrio(a, h, 2) },
        Straight:         func(a HandAnalysis, h ParsedHand) bool { return findWinningStraight(a, h) },
        PairStraight:     func(a HandAnalysis, h ParsedHand) bool { return findWinningPairStraight(a, h) },
        Plane:            func(a HandAnalysis, h ParsedHand) bool { return findWinningPlane(a, h, 0) },
        PlaneWithSingles: func(a HandAnalysis, h ParsedHand) bool { return findWinningPlane(a, h, 1) },
        PlaneWithPairs:   func(a HandAnalysis, h ParsedHand) bool { return findWinningPlane(a, h, 2) },
}

// ParseHand 解析牌型
func ParseHand(cards []card.Card) (ParsedHand, error) {
        if len(cards) == 0 {
                return ParsedHand{}, fmt.Errorf("不能出空牌")
        }

        analysis := analyzeCards(cards)
        
        // 🔧【调试日志】打印分析结果
        fmt.Printf("🃏 [ParseHand] 分析牌: 数量=%d\n", len(cards))
        fmt.Printf("🃏 [ParseHand] 收到的牌: ")
        for i, c := range cards {
                fmt.Printf("%s%s", c.Suit.String(), c.Rank.String())
                if i < len(cards)-1 {
                        fmt.Printf(", ")
                }
        }
        fmt.Printf("\n")
        fmt.Printf("🃏 [ParseHand] counts: %v\n", analysis.counts)
        fmt.Printf("🃏 [ParseHand] fours=%v, trios=%v, pairs=%v, ones=%v\n", 
                analysis.fours, analysis.trios, analysis.pairs, analysis.ones)

        // 按优先级检查各种牌型
        checks := []struct {
                name   string
                check  func(HandAnalysis, []card.Card) (ParsedHand, bool)
        }{
                {"isRocket", isRocket},
                {"isBomb", isBomb},
                {"isFourWithKickers", isFourWithKickers},
                {"isTrioWithKickers", isTrioWithKickers},
                {"isPlane", isPlane},
                {"isStraight", isStraight},
                {"isPairStraight", isPairStraight},
                {"isSimpleType", isSimpleType},
        }

        for _, c := range checks {
                if hand, ok := c.check(analysis, cards); ok {
                        fmt.Printf("🃏 [ParseHand] 匹配牌型: %s -> type=%s\n", c.name, hand.Type.String())
                        return hand, nil
                }
        }

        return ParsedHand{}, fmt.Errorf("不支持的牌型: %v", cards)
}

// CanBeat 判断 newHand 是否能大过 lastHand
// 返回：是否能打过，以及不能打过的原因
func CanBeat(newHand, lastHand ParsedHand) (bool, string) {
        // 🔧【调试日志】打印比较详情
        fmt.Printf("🃏 [CanBeat] 比较: newHand.Type=%s, KeyRank=%d vs lastHand.Type=%s, KeyRank=%d\n",
                newHand.Type.String(), newHand.KeyRank, lastHand.Type.String(), lastHand.KeyRank)
        
        // 王炸最大
        if newHand.Type == Rocket {
                fmt.Printf("🃏 [CanBeat] 结果: true (王炸最大)\n")
                return true, ""
        }
        if lastHand.Type == Rocket {
                fmt.Printf("🃏 [CanBeat] 结果: false (对手是王炸)\n")
                return false, "对手是王炸"
        }

        // 炸弹可以大过任何非炸弹和非王炸的牌
        if newHand.Type == Bomb && lastHand.Type != Bomb {
                fmt.Printf("🃏 [CanBeat] 结果: true (炸弹压非炸弹)\n")
                return true, ""
        }

        // 如果牌型不同 (且我不是炸弹)，不能出
        if newHand.Type != lastHand.Type {
                fmt.Printf("🃏 [CanBeat] 结果: false (牌型不同: %s != %s)\n", newHand.Type.String(), lastHand.Type.String())
                return false, fmt.Sprintf("牌型不匹配，上家出的是%s", lastHand.Type.String())
        }

        // 对于顺子、连对、飞机，长度必须一致
        if newHand.Length != lastHand.Length && (newHand.Type == Straight || newHand.Type == PairStraight || newHand.Type == Plane || newHand.Type == PlaneWithSingles || newHand.Type == PlaneWithPairs) {
                fmt.Printf("🃏 [CanBeat] 结果: false (长度不同: %d != %d)\n", newHand.Length, lastHand.Length)
                typeNames := map[HandType]string{
                        Straight: "顺子",
                        PairStraight: "连对",
                        Plane: "飞机",
                        PlaneWithSingles: "飞机带单",
                        PlaneWithPairs: "飞机带对",
                }
                typeName := typeNames[newHand.Type]
                return false, fmt.Sprintf("%s长度不匹配，上家出%d张，你选了%d张", typeName, lastHand.Length, newHand.Length)
        }

        // 如果牌型相同或者是炸弹盖炸弹
        result := newHand.KeyRank > lastHand.KeyRank
        fmt.Printf("🃏 [CanBeat] 结果: %v (KeyRank比较: %d > %d)\n", result, newHand.KeyRank, lastHand.KeyRank)
        if !result {
                return false, fmt.Sprintf("牌太小，打不过上家")
        }
        return result, ""
}

// CanBeatSimple 简单版判断，只返回布尔值（兼容旧代码）
func CanBeatSimple(newHand, lastHand ParsedHand) bool {
        canBeat, _ := CanBeat(newHand, lastHand)
        return canBeat
}

// CanBeatWithHand 检查一个玩家的整手牌中是否存在任何可以打过 opponentHand 的组合
func CanBeatWithHand(playerHand []card.Card, opponentHand ParsedHand) bool {
        // 1. 如果是新一轮，总是有牌可出
        if opponentHand.IsEmpty() {
                return true
        }

        analysis := analyzeCards(playerHand)

        // 2. 检查是否有炸弹或王炸 (它们几乎可以打任何牌)
        if hasWinningBombOrRocket(analysis, opponentHand) {
                return true
        }

        if opponentHand.Type == Bomb || opponentHand.Type == Rocket {
                return false
        }

        // 3. 检查是否有同类型的、更大的牌
        if checker, ok := handCheckers[opponentHand.Type]; ok {
                return checker(analysis, opponentHand)
        }
        return false
}
