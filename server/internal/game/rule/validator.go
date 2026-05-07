package rule

import (
        "fmt"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
)

// isRocket 王炸
func isRocket(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        if len(cards) == 2 && analysis.counts[card.RankBlackJoker] == 1 && analysis.counts[card.RankRedJoker] == 1 {
                return ParsedHand{Type: Rocket, KeyRank: card.RankRedJoker, Cards: cards}, true
        }
        return ParsedHand{}, false
}

// isBomb 炸弹
func isBomb(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        if len(analysis.fours) == 1 && len(cards) == 4 {
                return ParsedHand{Type: Bomb, KeyRank: analysis.fours[0], Cards: cards}, true
        }
        return ParsedHand{}, false
}

// isFourWithKickers 四带二
func isFourWithKickers(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        cardLen := len(cards)
        if len(analysis.fours) == 1 {
                hand := ParsedHand{KeyRank: analysis.fours[0], Cards: cards}
                if cardLen == 6 && (len(analysis.ones) == 2 || len(analysis.pairs) == 1) { // AAAABB、AAAABC
                        // 四带二，可以带两张单牌，也可以带一个对子(不算四带两对)
                        hand.Type = FourWithTwo
                        return hand, true
                }
                if cardLen == 8 && len(analysis.pairs) == 2 { // AAAABBCC、AAAABBBB
                        hand.Type = FourWithTwoPairs
                        return hand, true
                }
        }
        return ParsedHand{}, false
}

// isTrioWithKickers 三带X
// 🔧【重要】三带二比较规则：只比较三张主体，不比较对子
// 例如：55533 vs AAAJJ → 只比较 555 vs AAA (5 < 14)，所以 AAAJJ 能打过
func isTrioWithKickers(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        cardLen := len(cards)
        
        // 🔧【调试日志】
        fmt.Printf("🃏 [isTrioWithKickers] 检查三带X: cardLen=%d, trios=%v, pairs=%v, ones=%v, fours=%v\n",
                cardLen, analysis.trios, analysis.pairs, analysis.ones, analysis.fours)

        // 情况1：标准情况 - 有正好3张的牌（trios）
        // 这是正常情况：玩家选了3张相同牌 + 带牌
        if len(analysis.trios) == 1 {
                hand := ParsedHand{KeyRank: analysis.trios[0], Cards: cards}
                if cardLen == 4 && len(analysis.ones) == 1 { // AAAB - 三带一
                        hand.Type = TrioWithSingle
                        fmt.Printf("🃏 [isTrioWithKickers] 匹配三带一: KeyRank=%d\n", hand.KeyRank)
                        return hand, true
                }
                if cardLen == 5 && len(analysis.pairs) == 1 { // AAABB - 三带二
                        hand.Type = TrioWithPair
                        fmt.Printf("🃏 [isTrioWithKickers] 匹配三带二: KeyRank=%d\n", hand.KeyRank)
                        return hand, true
                }
        }

        // 情况2：玩家有4张相同的牌，选了4张 + 其他牌
        // 此时4张牌被统计到fours中
        // 我们需要从4张中选3张作为主体
        if len(analysis.fours) == 1 {
                keyRank := analysis.fours[0]  // 三张主体的rank
                hand := ParsedHand{KeyRank: keyRank, Cards: cards}

                // 三带一：4张相同 + 1张其他牌 = 5张
                // 例如：AAAA + J → 作为三带一出（AAA + J，多1张A忽略）
                if cardLen == 5 && len(analysis.ones) == 1 {
                        hand.Type = TrioWithSingle
                        fmt.Printf("🃏 [isTrioWithKickers] 匹配三带一(四张+单): KeyRank=%d\n", hand.KeyRank)
                        return hand, true
                }

                // 🔧【关键修复】三带二：4张相同 + 1张其他牌 = 5张
                // 这种情况是客户端选牌错误：想出三带二，但选了4张主体牌
                // 我们仍然识别为三带二，KeyRank取主体rank
                // 例如：AAAA + J → 作为三带二出？不对，这应该是三带一
                // 
                // 正确的三带二：4张相同 + 1对 = 6张
                // 例如：AAAA + JJ → 作为三带二出（AAA + JJ，多1张A忽略）
                if cardLen == 6 && len(analysis.pairs) == 1 {
                        hand.Type = TrioWithPair
                        fmt.Printf("🃏 [isTrioWithKickers] 匹配三带二(四张+对): KeyRank=%d\n", hand.KeyRank)
                        return hand, true
                }
                
                // 🔧【新增】三带二：4张相同 + 2张单牌 = 6张
                // 例如：AAAA + JK → 作为三带二？不对，三带二必须带对子
                // 这应该是四带二，不是三带二
        }
        
        // 情况3：其他特殊情况
        // 例如：2个三张 + 其他牌（可能是飞机）
        // 这里不处理，交给 isPlane 处理

        fmt.Printf("🃏 [isTrioWithKickers] 不匹配任何三带X牌型\n")
        return ParsedHand{}, false
}

// isPlane 飞机
func isPlane(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        cardLen, planeLen := len(cards), len(analysis.trios)
        if isContinuous(analysis.trios) && planeLen >= 2 {
                // 🔧【关键修复】KeyRank 使用最小的三张（起始三张，列表中第一个，因为列表是升序排序的）
                // 斗地主规则：飞机比较时，比较的是最小三张（起始三张），不是最大三张
                // 例如：333444 的 KeyRank 是 3，555666 的 KeyRank 是 5
                // 555666 能打过 333444，因为 5 > 3
                keyRank := analysis.trios[0]
                hand := ParsedHand{KeyRank: keyRank, Length: planeLen, Cards: cards}
                // 飞机不带翅膀
                if planeLen*3 == cardLen { // AAABBB+
                        hand.Type = Plane
                        return hand, true
                }
                // 飞机带单
                if planeLen*4 == cardLen && len(analysis.ones) == planeLen { // AAABBBCD+、AAABBAC+、AAABBBCC+
                        hand.Type = PlaneWithSingles
                        return hand, true
                }
                // 飞机带对
                if planeLen*5 == cardLen && len(analysis.pairs) == planeLen { // AAABBBCCDD+
                        hand.Type = PlaneWithPairs
                        return hand, true
                }
        }
        return ParsedHand{}, false
}

// isStraight 顺子
func isStraight(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        cardLen := len(cards)
        if isContinuous(analysis.ones) && len(analysis.ones) == cardLen && cardLen >= 5 { // ABCDE+
                // 🔧【关键修复】KeyRank 使用最小的牌（起始牌，列表中第一个，因为列表是升序排序的）
                // 斗地主规则：顺子比较时，比较的是最小牌（起始牌），不是最大牌
                // 例如：3-4-5-6-7 的 KeyRank 是 3，5-6-7-8-9 的 KeyRank 是 5
                // 5-6-7-8-9 能打过 3-4-5-6-7，因为 5 > 3
                keyRank := analysis.ones[0]
                return ParsedHand{Type: Straight, KeyRank: keyRank, Length: cardLen, Cards: cards}, true
        }
        return ParsedHand{}, false
}

// isPairStraight 连对
func isPairStraight(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        pairLen := len(analysis.pairs)
        if isContinuous(analysis.pairs) && pairLen*2 == len(cards) && pairLen >= 3 { // AABBCC+
                // 🔧【关键修复】KeyRank 使用最小的对子（起始对子，列表中第一个，因为列表是升序排序的）
                // 斗地主规则：连对比较时，比较的是最小对子（起始对子），不是最大对子
                // 例如：334455 的 KeyRank 是 3，556677 的 KeyRank 是 5
                // 556677 能打过 334455，因为 5 > 3
                keyRank := analysis.pairs[0]
                return ParsedHand{Type: PairStraight, KeyRank: keyRank, Length: pairLen, Cards: cards}, true
        }
        return ParsedHand{}, false
}

// isSimpleType 简单牌型：单、对、三
func isSimpleType(analysis HandAnalysis, cards []card.Card) (ParsedHand, bool) {
        if len(analysis.counts) == 1 {
                switch len(cards) {
                case 1:
                        return ParsedHand{Type: Single, KeyRank: analysis.ones[0], Cards: cards}, true
                case 2:
                        return ParsedHand{Type: Pair, KeyRank: analysis.pairs[0], Cards: cards}, true
                case 3:
                        return ParsedHand{Type: Trio, KeyRank: analysis.trios[0], Cards: cards}, true
                }
        }
        return ParsedHand{}, false
}
