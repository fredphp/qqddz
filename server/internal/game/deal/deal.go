// Package deal 实现斗地主发牌逻辑
// 核心原则：
// 1. 服务端权威：所有牌由服务端生成和分发
// 2. 数据一致性：所有客户端收到完全一致的牌数据
// 3. 防篡改：客户端无法控制发牌结果
package deal

import (
        "log"
        "math/rand/v2"
        "sort"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
)

// ============================================================
// 数据结构定义
// ============================================================

// DealResult 发牌结果
type DealResult struct {
        RoomCode    string              // 房间号
        Players     map[string][]card.Card // 玩家ID -> 手牌
        PlayerOrder []string            // 玩家顺序（按座位）
        BottomCards []card.Card         // 底牌
        DealTime    time.Time           // 发牌时间
}

// DealManager 发牌管理器
type DealManager struct {
        mu           sync.RWMutex
        dealingRooms map[string]bool // 正在发牌的房间
}

// NewDealManager 创建发牌管理器
func NewDealManager() *DealManager {
        return &DealManager{
                dealingRooms: make(map[string]bool),
        }
}

// ============================================================
// 核心发牌逻辑
// ============================================================

// CreateDeck 创建一副完整的牌（54张）
// 包含：黑桃、红心、梅花、方块各13张 + 大小王
func CreateDeck() card.Deck {
        return card.NewDeck()
}

// ShuffleDeck 洗牌（Fisher-Yates 算法）
// 确保洗牌结果随机且不可预测
func ShuffleDeck(deck card.Deck) {
        // Fisher-Yates 洗牌算法
        // 从最后一个元素开始，随机选择一个位置交换
        rand.Shuffle(len(deck), func(i, j int) {
                deck[i], deck[j] = deck[j], deck[i]
        })
}

// DealCards 发牌
// 参数：
//   - deck: 已洗好的牌组
//   - playerIDs: 玩家ID列表（按座位顺序）
//
// 返回：
//   - players: 每个玩家的手牌（每人17张）
//   - bottom: 底牌（3张）
func DealCards(deck card.Deck, playerIDs []string) (map[string][]card.Card, []card.Card) {
        log.Printf("🃏 [DealCards] 开始发牌, 牌组数量: %d, 玩家数: %d", len(deck), len(playerIDs))

        if len(deck) != 54 {
                log.Printf("⚠️ [DealCards] 牌组数量不正确: %d (应为54)", len(deck))
        }

        if len(playerIDs) != 3 {
                log.Printf("⚠️ [DealCards] 玩家数量不正确: %d (应为3)", len(playerIDs))
        }

        // 初始化玩家手牌
        players := make(map[string][]card.Card)
        for _, id := range playerIDs {
                players[id] = make([]card.Card, 0, 17)
        }

        // 发牌：前51张轮流发给3个玩家
        // 发牌顺序：玩家0 -> 玩家1 -> 玩家2 -> 玩家0 -> ...
        cardIndex := 0
        for i := 0; i < 51; i++ {
                playerIdx := i % 3
                playerID := playerIDs[playerIdx]
                players[playerID] = append(players[playerID], deck[cardIndex])
                cardIndex++

                log.Printf("🃏 [DealCards] 第 %d 张牌发给玩家 %s (座位 %d)", i+1, playerID, playerIdx)
        }

        // 剩余3张为底牌
        bottom := deck[51:54]

        // 验证发牌结果
        for _, id := range playerIDs {
                log.Printf("🃏 [DealCards] 玩家 %s 收到 %d 张牌", id, len(players[id]))
        }
        log.Printf("🃏 [DealCards] 底牌数量: %d", len(bottom))

        // 对每个玩家的手牌排序（使用 value 字段，从大到小）
        for _, id := range playerIDs {
                sort.Slice(players[id], func(i, j int) bool {
                        valueI := calculateCardValue(players[id][i].Rank)
                        valueJ := calculateCardValue(players[id][j].Rank)
                        // 先按 value 从大到小排序，value 相同时按花色排序（黑桃 > 红心 > 梅花 > 方块）
                        if valueI != valueJ {
                                return valueI > valueJ
                        }
                        return players[id][i].Suit < players[id][j].Suit
                })
        }

        return players, bottom
}

// ============================================================
// 发牌管理器方法
// ============================================================

// StartDeal 开始发牌（带防重复检查）
// 返回 nil 表示已经开始发牌或发牌完成
func (dm *DealManager) StartDeal(roomCode string, playerIDs []string) *DealResult {
        dm.mu.Lock()
        defer dm.mu.Unlock()

        // 检查是否正在发牌
        if dm.dealingRooms[roomCode] {
                log.Printf("⚠️ [StartDeal] 房间 %s 正在发牌，跳过重复调用", roomCode)
                return nil
        }

        // 标记为正在发牌
        dm.dealingRooms[roomCode] = true

        log.Printf("🃏 [StartDeal] ========== 开始发牌 ==========")
        log.Printf("🃏 [StartDeal] 房间号: %s", roomCode)
        log.Printf("🃏 [StartDeal] 玩家顺序: %v", playerIDs)

        // 创建并洗牌
        deck := CreateDeck()
        log.Printf("🃏 [StartDeal] 创建牌组完成，共 %d 张", len(deck))

        // 验证牌组完整性（包含大小王）
        blackJokerCount := 0
        redJokerCount := 0
        for _, c := range deck {
                if c.Rank == card.RankBlackJoker {
                        blackJokerCount++
                }
                if c.Rank == card.RankRedJoker {
                        redJokerCount++
                }
        }
        log.Printf("🃏 [StartDeal] 牌组验证: 小王=%d张, 大王=%d张 (应各为1张)", blackJokerCount, redJokerCount)
        if blackJokerCount != 1 || redJokerCount != 1 {
                log.Printf("⚠️ [StartDeal] 警告: 牌组缺少大小王!")
        }

        // 洗牌
        ShuffleDeck(deck)
        log.Printf("🃏 [StartDeal] 洗牌完成")

        // 发牌
        players, bottom := DealCards(deck, playerIDs)

        // 创建发牌结果
        result := &DealResult{
                RoomCode:    roomCode,
                Players:     players,
                PlayerOrder: playerIDs,
                BottomCards: bottom,
                DealTime:    time.Now(),
        }

        // 打印发牌结果（调试用）
        dm.logDealResult(result)

        return result
}

// FinishDeal 完成发牌（清理标记）
func (dm *DealManager) FinishDeal(roomCode string) {
        dm.mu.Lock()
        defer dm.mu.Unlock()
        delete(dm.dealingRooms, roomCode)
        log.Printf("🃏 [FinishDeal] 房间 %s 发牌完成，清理标记", roomCode)
}

// IsDealing 检查房间是否正在发牌
func (dm *DealManager) IsDealing(roomCode string) bool {
        dm.mu.RLock()
        defer dm.mu.RUnlock()
        return dm.dealingRooms[roomCode]
}

// logDealResult 打印发牌结果（调试用）
func (dm *DealManager) logDealResult(result *DealResult) {
        log.Printf("🃏 ========== 发牌结果 ==========")
        log.Printf("🃏 房间号: %s", result.RoomCode)
        log.Printf("🃏 发牌时间: %s", result.DealTime.Format("2006-01-02 15:04:05"))

        // 统计大小王分布
        jokerCount := 0
        for _, playerID := range result.PlayerOrder {
                cards := result.Players[playerID]
                log.Printf("🃏 玩家 %s: %d 张牌", playerID, len(cards))

                // 检查是否有大小王
                for _, c := range cards {
                        if c.Rank == card.RankBlackJoker {
                                log.Printf("🃏   ★ 玩家 %s 持有小王 (Black Joker, rank=16)", playerID)
                                jokerCount++
                        }
                        if c.Rank == card.RankRedJoker {
                                log.Printf("🃏   ★ 玩家 %s 持有大王 (Red Joker, rank=17)", playerID)
                                jokerCount++
                        }
                }
        }

        // 检查底牌是否有大小王
        for _, c := range result.BottomCards {
                if c.Rank == card.RankBlackJoker {
                        log.Printf("🃏   ★ 底牌中有小王 (Black Joker, rank=16)")
                        jokerCount++
                }
                if c.Rank == card.RankRedJoker {
                        log.Printf("🃏   ★ 底牌中有大王 (Red Joker, rank=17)")
                        jokerCount++
                }
        }

        log.Printf("🃏 大小王总数: %d/2 (应为2)", jokerCount)
        log.Printf("🃏 底牌: %d 张", len(result.BottomCards))
        log.Printf("🃏 ==============================")
}

// ============================================================
// 工具方法
// ============================================================

// CardsToCardInfo 将牌转换为协议格式
func CardsToCardInfo(cards []card.Card) []CardInfoData {
        result := make([]CardInfoData, len(cards))
        for i, c := range cards {
                result[i] = CardInfoData{
                        Suit:  int(c.Suit),
                        Rank:  int(c.Rank),
                        Value: calculateCardValue(c.Rank),
                        Color: int(c.Color),
                }
        }
        return result
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

// CardInfoData 牌信息数据（用于JSON序列化）
type CardInfoData struct {
        Suit  int `json:"suit"`  // 花色: 0=黑桃, 1=红心, 2=梅花, 3=方块, 4=王
        Rank  int `json:"rank"`  // 点数: 3-17 (3-2, 小王=16, 大王=17)
        Value int `json:"value"` // 【核心】牌力值（用于排序）: 大王=16, 小王=15, 2=13, A=12, K=11, ..., 3=1
        Color int `json:"color"` // 颜色: 0=黑, 1=红
}
