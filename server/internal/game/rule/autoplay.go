package rule

import (
        "log"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
)

// FindSmallestBeatingCards 找到能打过 opponentHand 的最小牌组
// 如果找不到，返回 nil
func FindSmallestBeatingCards(playerHand []card.Card, opponentHand ParsedHand) []card.Card {
        // 如果是新一轮，检查是否可以一次打完
        if opponentHand.IsEmpty() {
                if len(playerHand) > 0 {
                        // 🔧【优化】如果玩家只剩一手牌且可以一次打完，直接返回所有牌
                        // 这样用户点击提示时会选中所有牌，而不是只提示一张
                        allCardsHand, err := ParseHand(playerHand)
                        if err == nil {
                                // 是合法牌型，可以一次打完
                                log.Printf("🎯 [FindSmallestBeatingCards] 玩家手牌可以一次打完，返回所有牌: %d张, 牌型=%s", len(playerHand), allCardsHand.Type.String())
                                return playerHand
                        }
                        // 不是合法牌型，返回最小的单牌
                        log.Printf("🎯 [FindSmallestBeatingCards] 玩家手牌不能一次打完，返回最小单牌")
                        return []card.Card{playerHand[len(playerHand)-1]}
                }
                return nil
        }

        analysis := analyzeCards(playerHand)

        // 优先尝试找同类型的最小牌
        var result []card.Card

        switch opponentHand.Type {
        case Single:
                result = findSmallestBeatingSingle(playerHand, analysis, opponentHand)
        case Pair:
                result = findSmallestBeatingPair(playerHand, analysis, opponentHand)
        case Trio:
                result = findSmallestBeatingTrio(playerHand, analysis, opponentHand, 0)
        case TrioWithSingle:
                result = findSmallestBeatingTrio(playerHand, analysis, opponentHand, 1)
        case TrioWithPair:
                result = findSmallestBeatingTrio(playerHand, analysis, opponentHand, 2)
        case Straight:
                // 🔧【新增】顺子提示
                result = findSmallestBeatingStraight(playerHand, analysis, opponentHand)
        case PairStraight:
                // 🔧【新增】连对提示
                result = findSmallestBeatingPairStraight(playerHand, analysis, opponentHand)
        case Plane, PlaneWithSingles, PlaneWithPairs:
                // 🔧【新增】飞机提示
                result = findSmallestBeatingPlane(playerHand, analysis, opponentHand)
        case FourWithTwo, FourWithTwoPairs:
                // 🔧【新增】四带二提示
                result = findSmallestBeatingFourWithKickers(playerHand, analysis, opponentHand)
        }

        // 如果找到了同类型的牌，返回
        if result != nil {
                return result
        }

        // 否则尝试用最小的炸弹
        result = findSmallestBomb(playerHand, analysis, opponentHand)
        if result != nil {
                return result
        }

        // 最后尝试王炸（一般不会用）
        if hasRocket(analysis) && opponentHand.Type != Rocket {
                return findRocket(playerHand)
        }

        return nil
}

// findFirstBeating 从多个点数列表中找第一个能打过的牌
func findFirstBeating(playerHand []card.Card, rankLists [][]card.Rank, keyRank card.Rank, count int) []card.Card {
        for _, ranks := range rankLists {
                for _, r := range ranks {
                        if r > keyRank {
                                return findCardsWithRank(playerHand, r, count)
                        }
                }
        }
        return nil
}

// findSmallestBeatingSingle 找到能打过的最小单牌
func findSmallestBeatingSingle(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        return findFirstBeating(playerHand,
                [][]card.Rank{analysis.ones, analysis.pairs, analysis.trios, analysis.fours},
                opponentHand.KeyRank, 1)
}

// findSmallestBeatingPair 找到能打过的最小对子
func findSmallestBeatingPair(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        return findFirstBeating(playerHand,
                [][]card.Rank{analysis.pairs, analysis.trios, analysis.fours},
                opponentHand.KeyRank, 2)
}

// findSmallestBeatingTrio 找到能打过的最小三张（带或不带）
func findSmallestBeatingTrio(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand, kickerType int) []card.Card {
        for _, ranks := range [][]card.Rank{analysis.trios, analysis.fours} {
                for _, r := range ranks {
                        if r > opponentHand.KeyRank {
                                result := findCardsWithRank(playerHand, r, 3)
                                if kickerType == 0 {
                                        return result
                                }
                                if kickers := findSmallestKickers(playerHand, analysis, r, kickerType); kickers != nil {
                                        return append(result, kickers...)
                                }
                        }
                }
        }
        return nil
}

// findSmallestBomb 找到最小的炸弹
func findSmallestBomb(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        for _, r := range analysis.fours {
                if opponentHand.Type != Bomb || r > opponentHand.KeyRank {
                        return findCardsWithRank(playerHand, r, 4)
                }
        }
        return nil
}

// findSmallestKickers 找到最小的带牌
// kickerType: 1=带单张, 2=带对子
func findSmallestKickers(playerHand []card.Card, analysis HandAnalysis, excludeRank card.Rank, kickerType int) []card.Card {
        var kickers []card.Card
        neededCards := kickerType // 1张单牌或2张(1对)

        // collectFromRanks 从给定的点数列表中收集 kicker 牌
        collectFromRanks := func(ranks []card.Rank, countPerRank int) bool {
                for _, r := range ranks {
                        if r != excludeRank {
                                kickers = append(kickers, findCardsWithRank(playerHand, r, countPerRank)...)
                                if len(kickers) >= neededCards {
                                        kickers = kickers[:neededCards]
                                        return true
                                }
                        }
                }
                return false
        }

        if kickerType == 1 {
                // 带单张：优先从单牌、对子中取
                if collectFromRanks(analysis.ones, 1) || collectFromRanks(analysis.pairs, 1) {
                        return kickers
                }
        } else {
                // 带对子：从对子、三张、四张中取
                if collectFromRanks(analysis.pairs, 2) ||
                        collectFromRanks(analysis.trios, 2) ||
                        collectFromRanks(analysis.fours, 2) {
                        return kickers
                }
        }
        return nil
}

// findCardsWithRank 从手牌中找到指定点数的牌
func findCardsWithRank(playerHand []card.Card, rank card.Rank, count int) []card.Card {
        var result []card.Card
        for _, c := range playerHand {
                if c.Rank == rank {
                        result = append(result, c)
                        if len(result) >= count {
                                return result
                        }
                }
        }
        return result
}

// hasRocket 检查是否有王炸
func hasRocket(analysis HandAnalysis) bool {
        return analysis.counts[card.RankBlackJoker] > 0 && analysis.counts[card.RankRedJoker] > 0
}

// findRocket 找到王炸
func findRocket(playerHand []card.Card) []card.Card {
        var result []card.Card
        for _, c := range playerHand {
                if c.Rank == card.RankBlackJoker || c.Rank == card.RankRedJoker {
                        result = append(result, c)
                }
        }
        return result
}

// 🔧【新增】findSmallestBeatingStraight 找到能打过的最小顺子
// 🔧【重要修复】顺子比较时，KeyRank 是最小牌（起始牌），不是最大牌
func findSmallestBeatingStraight(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        length := opponentHand.Length
        keyRank := opponentHand.KeyRank // 这是最小牌（起始牌）

        log.Printf("🔍 [findSmallestBeatingStraight] 对手顺子: length=%d, keyRank=%d (最小牌)", length, keyRank)

        // 找到所有可以作为顺子起点的牌（必须大于 keyRank）
        // 从小到大遍历所有可能的起点
        for startRank := keyRank + 1; startRank <= card.RankA; startRank++ {
                // 检查是否能组成从 startRank 开始的 length 张连续牌
                // 例如：要找7张顺子，从 startRank 开始，最大牌是 startRank + 6
                // 这个最大牌不能超过 A（rank 14）
                if startRank+card.Rank(length-1) > card.RankA {
                        break // 超出A的范围，不能组成顺子
                }

                // 检查是否有足够的连续牌
                valid := true
                for r := startRank; r < startRank+card.Rank(length); r++ {
                        if analysis.counts[r] < 1 {
                                valid = false
                                break
                        }
                }

                if valid {
                        // 收集这些牌
                        var result []card.Card
                        for r := startRank; r < startRank+card.Rank(length); r++ {
                                result = append(result, findCardsWithRank(playerHand, r, 1)...)
                        }
                        log.Printf("🔍 [findSmallestBeatingStraight] 找到顺子: startRank=%d, length=%d, cards=%d", startRank, length, len(result))
                        return result
                }
        }

        log.Printf("🔍 [findSmallestBeatingStraight] 没有找到能打过的顺子")
        return nil
}

// 🔧【新增】findSmallestBeatingPairStraight 找到能打过的最小连对
func findSmallestBeatingPairStraight(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        // 🔧【修复】opponentHand.Length 已经是对数，不需要除以2
        length := opponentHand.Length // 连对的对数
        keyRank := opponentHand.KeyRank

        log.Printf("🔍 [findSmallestBeatingPairStraight] 对手连对: length=%d, keyRank=%d", length, keyRank)

        // 找到所有可以作为连对起点的牌
        for startRank := keyRank + 1; startRank <= card.RankA; startRank++ {
                // 检查是否能组成从 startRank 开始的 length 对连续牌
                if startRank+card.Rank(length-1) > card.RankA {
                        break // 超出A的范围，不能组成连对
                }

                valid := true
                for r := startRank; r < startRank+card.Rank(length); r++ {
                        if analysis.counts[r] < 2 {
                                valid = false
                                break
                        }
                }

                if valid {
                        var result []card.Card
                        for r := startRank; r < startRank+card.Rank(length); r++ {
                                result = append(result, findCardsWithRank(playerHand, r, 2)...)
                        }
                        log.Printf("🔍 [findSmallestBeatingPairStraight] 找到连对: startRank=%d, length=%d, cards=%d", startRank, length, len(result))
                        return result
                }
        }

        log.Printf("🔍 [findSmallestBeatingPairStraight] 没有找到能打过的连对")
        return nil
}

// 🔧【新增】findSmallestBeatingPlane 找到能打过的最小飞机
func findSmallestBeatingPlane(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        // 飞机不带翅膀的长度
        triosNeeded := opponentHand.Length
        if opponentHand.Type == PlaneWithSingles {
                triosNeeded = (opponentHand.Length - opponentHand.Length/4) / 3
        } else if opponentHand.Type == PlaneWithPairs {
                triosNeeded = (opponentHand.Length - opponentHand.Length/5*2) / 3
        }

        // 简化处理：只处理不带翅膀的飞机
        if opponentHand.Type != Plane {
                return nil // 带翅膀的飞机提示暂时不实现
        }

        keyRank := opponentHand.KeyRank

        // 找到连续的三张
        for startRank := keyRank + 1; startRank <= card.RankA; startRank++ {
                if startRank+card.Rank(triosNeeded-1) > card.RankA {
                        break
                }

                valid := true
                for r := startRank; r < startRank+card.Rank(triosNeeded); r++ {
                        if analysis.counts[r] < 3 {
                                valid = false
                                break
                        }
                }

                if valid {
                        var result []card.Card
                        for r := startRank; r < startRank+card.Rank(triosNeeded); r++ {
                                result = append(result, findCardsWithRank(playerHand, r, 3)...)
                        }
                        return result
                }
        }
        return nil
}

// 🔧【新增】findSmallestBeatingFourWithKickers 找到能打过的最小四带二
func findSmallestBeatingFourWithKickers(playerHand []card.Card, analysis HandAnalysis, opponentHand ParsedHand) []card.Card {
        keyRank := opponentHand.KeyRank

        // 找到大于 keyRank 的四张
        for _, r := range analysis.fours {
                if r > keyRank {
                        result := findCardsWithRank(playerHand, r, 4)

                        // 找带牌
                        var kickers []card.Card
                        if opponentHand.Type == FourWithTwo {
                                // 带两张单牌
                                for _, oneRank := range analysis.ones {
                                        if oneRank != r {
                                                kickers = append(kickers, findCardsWithRank(playerHand, oneRank, 1)...)
                                                if len(kickers) >= 2 {
                                                        kickers = kickers[:2]
                                                        break
                                                }
                                        }
                                }
                                if len(kickers) < 2 {
                                        // 从对子中取单张
                                        for _, pairRank := range analysis.pairs {
                                                if pairRank != r {
                                                        kickers = append(kickers, findCardsWithRank(playerHand, pairRank, 1)...)
                                                        if len(kickers) >= 2 {
                                                                kickers = kickers[:2]
                                                                break
                                                        }
                                                }
                                        }
                                }
                        } else {
                                // 带两对
                                for _, pairRank := range analysis.pairs {
                                        if pairRank != r {
                                                kickers = append(kickers, findCardsWithRank(playerHand, pairRank, 2)...)
                                                if len(kickers) >= 4 {
                                                        break
                                                }
                                        }
                                }
                        }

                        if (opponentHand.Type == FourWithTwo && len(kickers) >= 2) ||
                                (opponentHand.Type == FourWithTwoPairs && len(kickers) >= 4) {
                                return append(result, kickers...)
                        }
                }
        }
        return nil
}
