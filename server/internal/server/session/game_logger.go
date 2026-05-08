package session

import (
        "log"
        "strings"
        "time"

        "github.com/google/uuid"
        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
)

// DealLogRecord 发牌日志记录（内存中的临时结构）
type DealLogRecord struct {
        PlayerID      string
        PlayerRole    uint8
        HandCards     []card.Card
        LandlordCards []card.Card // 仅地主有
}

// BidLogRecord 叫地主日志记录（内存中的临时结构）
type BidLogRecord struct {
        PlayerID   string
        BidOrder   int
        BidType    uint8 // 0-不叫, 1-叫地主, 2-抢地主
        BidScore   int
        IsSuccess  uint8
}

// PlayLogRecord 出牌日志记录（内存中的临时结构）
type PlayLogRecord struct {
        PlayerID    string
        PlayerRole  uint8
        RoundNum    int
        PlayOrder   int
        PlayType    uint8 // 1-出牌, 2-不出/过, 3-超时自动出牌
        Cards       []card.Card
        CardPattern string
        IsBomb      uint8
        IsRocket    uint8
}

// GameLogger 游戏日志记录器
type GameLogger struct {
        gameID       string
        roomID       string
        roomType     uint8
        roomCategory uint8 // 房间分类: 1-普通场, 2-竞技场
        startedAt    time.Time
        bombCount    int
        rocketCount  int // 🔧【新增】王炸次数
        roundNum     int
        playOrder    int // 当前回合内的出牌顺序

        dealLogs []DealLogRecord
        bidLogs  []BidLogRecord
        playLogs []PlayLogRecord
}

// NewGameLogger 创建游戏日志记录器
func NewGameLogger(roomID string, roomType uint8, roomCategory uint8) *GameLogger {
        return &GameLogger{
                gameID:       generateGameID(),
                roomID:       roomID,
                roomType:     roomType,
                roomCategory: roomCategory,
                startedAt:    time.Now(),
                roundNum:     0,
                playOrder:    0,
        }
}

// generateGameID 生成游戏唯一ID
func generateGameID() string {
        return uuid.New().String()
}

// GetGameID 获取游戏ID
func (l *GameLogger) GetGameID() string {
        return l.gameID
}

// GetStartedAt 获取游戏开始时间
func (l *GameLogger) GetStartedAt() time.Time {
        return l.startedAt
}

// GetBombCount 获取炸弹数量
func (l *GameLogger) GetBombCount() int {
        return l.bombCount
}

// GetRocketCount 获取王炸数量
func (l *GameLogger) GetRocketCount() int {
        return l.rocketCount
}

// IncrementBombCount 增加炸弹数量
func (l *GameLogger) IncrementBombCount() {
        l.bombCount++
}

// IncrementRocketCount 增加王炸数量
func (l *GameLogger) IncrementRocketCount() {
        l.rocketCount++
}

// Reset 重置游戏日志记录器（用于新一轮游戏）
// 🔧【新增】重置炸弹和王炸计数，避免倍数累积
func (l *GameLogger) Reset() {
        l.bombCount = 0
        l.rocketCount = 0
        l.roundNum = 0
        l.playOrder = 0
        l.dealLogs = make([]DealLogRecord, 0)
        l.bidLogs = make([]BidLogRecord, 0)
        l.playLogs = make([]PlayLogRecord, 0)
        l.startedAt = time.Now() // 重置开始时间
        l.gameID = generateGameID() // 生成新的游戏ID
}

// StartNewRound 开始新回合
func (l *GameLogger) StartNewRound() {
        l.roundNum++
        l.playOrder = 0
}

// GetRoundNum 获取当前回合数
func (l *GameLogger) GetRoundNum() int {
        return l.roundNum
}

// RecordDealLog 记录发牌日志
func (l *GameLogger) RecordDealLog(playerID string, playerRole uint8, handCards []card.Card, landlordCards []card.Card) {
        l.dealLogs = append(l.dealLogs, DealLogRecord{
                PlayerID:      playerID,
                PlayerRole:    playerRole,
                HandCards:     handCards,
                LandlordCards: landlordCards,
        })
}

// RecordBidLog 记录叫地主日志
func (l *GameLogger) RecordBidLog(playerID string, bidOrder int, bidType uint8, bidScore int, isSuccess uint8) {
        l.bidLogs = append(l.bidLogs, BidLogRecord{
                PlayerID:  playerID,
                BidOrder:  bidOrder,
                BidType:   bidType,
                BidScore:  bidScore,
                IsSuccess: isSuccess,
        })
}

// RecordPlayLog 记录出牌日志
func (l *GameLogger) RecordPlayLog(playerID string, playerRole uint8, playType uint8, cards []card.Card, handType rule.HandType) {
        l.playOrder++

        isBomb := uint8(0)
        isRocket := uint8(0)
        cardPattern := ""

        if len(cards) > 0 {
                cardPattern = handType.String()
                if handType == rule.Bomb {
                        isBomb = 1
                        l.bombCount++
                } else if handType == rule.Rocket {
                        isRocket = 1
                        l.bombCount++
                        l.rocketCount++ // 🔧【新增】单独统计王炸
                }
        }

        l.playLogs = append(l.playLogs, PlayLogRecord{
                PlayerID:    playerID,
                PlayerRole:  playerRole,
                RoundNum:    l.roundNum,
                PlayOrder:   l.playOrder,
                PlayType:    playType,
                Cards:       cards,
                CardPattern: cardPattern,
                IsBomb:      isBomb,
                IsRocket:    isRocket,
        })
}

// SaveGameResult 保存游戏结果到数据库
// 🔧【修复】新增 playerIDMap 参数，用于将 WebSocket PlayerID 映射到数据库 DBID
func (l *GameLogger) SaveGameResult(
        landlordID, farmer1ID, farmer2ID uint64,
        baseScore, multiplier int,
        spring uint8,
        result uint8,
        landlordWinGold, farmer1WinGold, farmer2WinGold int64,
        landlordWinArenaCoin, farmer1WinArenaCoin, farmer2WinArenaCoin int64,
        playerIDMap map[string]uint64, // 🔧【新增】WebSocket PlayerID -> 数据库 DBID 映射
) error {
        // 检查数据库是否可用
        if !database.GetInstance().IsConnected() {
                log.Printf("数据库未连接，跳过游戏结果保存")
                return nil
        }

        endedAt := time.Now()
        durationSeconds := int(endedAt.Sub(l.startedAt).Seconds())

        // 创建游戏记录
        record := &database.GameRecord{
                GameID:               l.gameID,
                RoomID:               l.roomID,
                RoomType:             l.roomType,
                RoomCategory:         l.roomCategory,
                LandlordID:           landlordID,
                Farmer1ID:            farmer1ID,
                Farmer2ID:            farmer2ID,
                BaseScore:            baseScore,
                Multiplier:           multiplier,
                BombCount:            l.bombCount,
                Spring:               spring,
                Result:               result,
                LandlordWinGold:      landlordWinGold,
                Farmer1WinGold:       farmer1WinGold,
                Farmer2WinGold:       farmer2WinGold,
                LandlordWinArenaCoin: landlordWinArenaCoin,
                Farmer1WinArenaCoin:  farmer1WinArenaCoin,
                Farmer2WinArenaCoin:  farmer2WinArenaCoin,
                StartedAt:            l.startedAt,
                EndedAt:              &endedAt,
                DurationSeconds:      durationSeconds,
        }

        // 转换日志记录 - 🔧【修复】传入 playerIDMap
        dealLogs := l.convertDealLogs(playerIDMap)
        bidLogs := l.convertBidLogs(playerIDMap)
        playLogs := l.convertPlayLogs(playerIDMap)

        // 使用事务保存所有数据
        if err := database.SaveGameResult(record, dealLogs, bidLogs, playLogs); err != nil {
                log.Printf("保存游戏结果失败: %v", err)
                return err
        }

        log.Printf("游戏结果已保存到数据库，游戏ID: %s", l.gameID)
        return nil
}

// convertDealLogs 转换发牌日志为数据库模型
// 🔧【修复】新增 playerIDMap 参数，用于将 WebSocket PlayerID 映射到数据库 DBID
func (l *GameLogger) convertDealLogs(playerIDMap map[string]uint64) []database.DealLog {
        logs := make([]database.DealLog, 0, len(l.dealLogs))
        for _, dl := range l.dealLogs {
                // 🔧【修复】使用 playerIDMap 获取正确的数据库 DBID
                dbID := playerIDMap[dl.PlayerID]
                if dbID == 0 {
                        // 如果映射中没有，尝试解析（兼容旧逻辑）
                        dbID = parsePlayerID(dl.PlayerID)
                }
                logs = append(logs, database.DealLog{
                        GameID:        l.gameID,
                        PlayerID:      dbID,
                        PlayerRole:    dl.PlayerRole,
                        HandCards:     cardsToString(dl.HandCards),
                        CardsCount:    len(dl.HandCards),
                        LandlordCards: cardsToString(dl.LandlordCards),
                })
        }
        return logs
}

// convertBidLogs 转换叫地主日志为数据库模型
// 🔧【修复】新增 playerIDMap 参数
func (l *GameLogger) convertBidLogs(playerIDMap map[string]uint64) []database.BidLog {
        logs := make([]database.BidLog, 0, len(l.bidLogs))
        for _, bl := range l.bidLogs {
                // 🔧【修复】使用 playerIDMap 获取正确的数据库 DBID
                dbID := playerIDMap[bl.PlayerID]
                if dbID == 0 {
                        dbID = parsePlayerID(bl.PlayerID)
                }
                logs = append(logs, database.BidLog{
                        GameID:     l.gameID,
                        PlayerID:   dbID,
                        BidOrder:   bl.BidOrder,
                        BidType:    bl.BidType,
                        BidScore:   bl.BidScore,
                        IsSuccess:  bl.IsSuccess,
                })
        }
        return logs
}

// convertPlayLogs 转换出牌日志为数据库模型
// 🔧【修复】新增 playerIDMap 参数
func (l *GameLogger) convertPlayLogs(playerIDMap map[string]uint64) []database.PlayLog {
        logs := make([]database.PlayLog, 0, len(l.playLogs))
        for _, pl := range l.playLogs {
                // 🔧【修复】使用 playerIDMap 获取正确的数据库 DBID
                dbID := playerIDMap[pl.PlayerID]
                if dbID == 0 {
                        dbID = parsePlayerID(pl.PlayerID)
                }
                logs = append(logs, database.PlayLog{
                        GameID:      l.gameID,
                        PlayerID:    dbID,
                        PlayerRole:  pl.PlayerRole,
                        RoundNum:    pl.RoundNum,
                        PlayOrder:   pl.PlayOrder,
                        PlayType:    pl.PlayType,
                        Cards:       cardsToString(pl.Cards),
                        CardsCount:  len(pl.Cards),
                        CardPattern: pl.CardPattern,
                        IsBomb:      pl.IsBomb,
                        IsRocket:    pl.IsRocket,
                })
        }
        return logs
}

// parsePlayerID 解析玩家ID（将字符串转换为uint64）
func parsePlayerID(id string) uint64 {
        // 如果ID是数字字符串，直接转换
        var playerID uint64
        for _, c := range id {
                if c >= '0' && c <= '9' {
                        playerID = playerID*10 + uint64(c-'0')
                } else {
                        // 如果不是纯数字，使用哈希生成ID（简化处理）
                        playerID = uint64(len(id))
                        break
                }
        }
        return playerID
}

// cardsToString 将牌列表转换为逗号分隔的字符串
func cardsToString(cards []card.Card) string {
        if len(cards) == 0 {
                return ""
        }

        parts := make([]string, len(cards))
        for i, c := range cards {
                parts[i] = c.String()
        }
        return strings.Join(parts, ",")
}
