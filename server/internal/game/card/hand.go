package card

import (
        "fmt"
        "slices"
        "strings"
)

// parseInputRanks 解析输入字符串为 Rank 计数
func parseInputRanks(input string) (map[Rank]int, error) {
        inputRanks := map[Rank]int{}
        cleanInput := strings.ReplaceAll(input, "10", "T")

        for _, char := range cleanInput {
                rank, err := RankFromChar(char)
                if err != nil {
                        return nil, err
                }
                inputRanks[rank]++
        }
        return inputRanks, nil
}

// countHandRanks 统计手牌中各 Rank 的数量
func countHandRanks(hand []Card) map[Rank]int {
        counts := map[Rank]int{}
        for _, c := range hand {
                counts[c.Rank]++
        }
        return counts
}

// extractCards 从手牌中提取指定数量的指定 Rank 的牌
func extractCards(handCopy []Card, inputRanks map[Rank]int) []Card {
        var result []Card
        for rank, count := range inputRanks {
                found := 0
                for i := len(handCopy) - 1; i >= 0 && found < count; i-- {
                        if handCopy[i].Rank == rank {
                                result = append(result, handCopy[i])
                                handCopy = slices.Delete(handCopy, i, i+1)
                                found++
                        }
                }
        }
        return result
}

// FindCardsInHand 从手牌中根据输入字符串找出对应的牌
func FindCardsInHand(hand []Card, input string) ([]Card, error) {
        // 解析输入
        inputRanks, err := parseInputRanks(input)
        if err != nil {
                return nil, err
        }

        // 检查手牌是否足够
        handCounts := countHandRanks(hand)
        for r, count := range inputRanks {
                if handCounts[r] < count {
                        return nil, fmt.Errorf("你的 %s 不够", r.String())
                }
        }

        // 提取牌
        handCopy := make([]Card, len(hand))
        copy(handCopy, hand)
        return extractCards(handCopy, inputRanks), nil
}

// RemoveCards 从手牌中移除指定的牌
// 🔧【修复】只根据 Suit 和 Rank 匹配，忽略 Color 字段
// 因为 AI 决策返回的牌可能没有正确设置 Color，导致 slices.Contains 匹配失败
func RemoveCards(hand, toRemove []Card) []Card {
        // 构建 toRemove 的 (Suit, Rank) 计数映射
        toRemoveMap := make(map[Suit]map[Rank]int)
        for _, c := range toRemove {
                if toRemoveMap[c.Suit] == nil {
                        toRemoveMap[c.Suit] = make(map[Rank]int)
                }
                toRemoveMap[c.Suit][c.Rank]++
        }
        
        var result []Card
        for _, hCard := range hand {
                // 检查这张牌是否需要移除
                if rankMap, ok := toRemoveMap[hCard.Suit]; ok {
                        if count, exists := rankMap[hCard.Rank]; exists && count > 0 {
                                // 移除这张牌，减少计数
                                rankMap[hCard.Rank]--
                                continue
                        }
                }
                result = append(result, hCard)
        }
        return result
}
