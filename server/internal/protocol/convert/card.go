package convert

import (
        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
)

// CardToInfo 将 card.Card 转换为 protocol.CardInfo
// 对于大小王，会设置 king 字段供客户端渲染
// 🔧【修复】添加 Value 字段的计算
func CardToInfo(c card.Card) protocol.CardInfo {
        info := protocol.CardInfo{
                Suit:  int(c.Suit),
                Rank:  int(c.Rank),
                Value: calculateCardValue(c.Rank), // 🔧【新增】计算牌力值
                Color: int(c.Color),
        }

        // 为大小王设置 king 字段（客户端期望: "14"=小王, "15"=大王）
        if c.Rank == card.RankBlackJoker {
                info.King = "14"
        }
        if c.Rank == card.RankRedJoker {
                info.King = "15"
        }

        return info
}

// calculateCardValue 计算牌力值（用于排序）
// 斗地主标准排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
// 映射：大王=16, 小王=15, 2=13, A=12, K=11, Q=10, J=9, 10=8, ..., 3=1
func calculateCardValue(rank card.Rank) int {
        switch rank {
        case card.RankRedJoker: // 大王 (rank=17)
                return 16
        case card.RankBlackJoker: // 小王 (rank=16)
                return 15
        case card.Rank2: // 2 (rank=15)
                return 13
        case card.RankA: // A (rank=14)
                return 12
        case card.RankK: // K (rank=13)
                return 11
        case card.RankQ: // Q (rank=12)
                return 10
        case card.RankJ: // J (rank=11)
                return 9
        case card.Rank10: // 10 (rank=10)
                return 8
        case card.Rank9: // 9 (rank=9)
                return 7
        case card.Rank8: // 8 (rank=8)
                return 6
        case card.Rank7: // 7 (rank=7)
                return 5
        case card.Rank6: // 6 (rank=6)
                return 4
        case card.Rank5: // 5 (rank=5)
                return 3
        case card.Rank4: // 4 (rank=4)
                return 2
        case card.Rank3: // 3 (rank=3)
                return 1
        default:
                return 0
        }
}

// CardsToInfos 将 []card.Card 转换为 []protocol.CardInfo
func CardsToInfos(cards []card.Card) []protocol.CardInfo {
        infos := make([]protocol.CardInfo, len(cards))
        for i, c := range cards {
                infos[i] = CardToInfo(c)
        }
        return infos
}

// InfoToCard 将 protocol.CardInfo 转换为 card.Card
func InfoToCard(info protocol.CardInfo) card.Card {
        return card.Card{
                Suit:  card.Suit(info.Suit),
                Rank:  card.Rank(info.Rank),
                Color: card.CardColor(info.Color),
        }
}

// InfosToCards 将 []protocol.CardInfo 转换为 []card.Card
func InfosToCards(infos []protocol.CardInfo) []card.Card {
        cards := make([]card.Card, len(infos))
        for i, info := range infos {
                cards[i] = InfoToCard(info)
        }
        return cards
}
