package ddz

import (
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZGameRecord 斗地主游戏记录
// 🔧【修复】字段类型与游戏服务端保持一致
type DDZGameRecord struct {
        global.GVA_MODEL
        GameID                string     `json:"gameId" gorm:"uniqueIndex;comment:游戏唯一标识"`
        RoomID                string     `json:"roomId" gorm:"index;comment:房间ID"`
        RoomType              int        `json:"roomType" gorm:"comment:房间类型"`
        RoomCategory          int        `json:"roomCategory" gorm:"comment:房间分类 1普通场 2竞技场"`
        LandlordID            uint64     `json:"landlordId" gorm:"index;comment:地主玩家ID"`     // 🔧【修复】string -> uint64
        Farmer1ID             uint64     `json:"farmer1Id" gorm:"index;comment:农民1玩家ID"`     // 🔧【修复】string -> uint64
        Farmer2ID             uint64     `json:"farmer2Id" gorm:"index;comment:农民2玩家ID"`     // 🔧【修复】string -> uint64
        BaseScore             int        `json:"baseScore" gorm:"comment:底分"`
        Multiplier            int        `json:"multiplier" gorm:"comment:倍数"`
        BombCount             int        `json:"bombCount" gorm:"default:0;comment:炸弹数量"`
        Spring                int        `json:"spring" gorm:"default:0;comment:春天 0否 1春天 2反春天"`
        Result                int        `json:"result" gorm:"comment:结果 1地主胜 2农民胜"`
        LandlordWinGold       int64      `json:"landlordWinGold" gorm:"default:0;comment:地主输赢金币"`
        Farmer1WinGold        int64      `json:"farmer1WinGold" gorm:"default:0;comment:农民1输赢金币"`
        Farmer2WinGold        int64      `json:"farmer2WinGold" gorm:"default:0;comment:农民2输赢金币"`
        LandlordWinArenaCoin  int64      `json:"landlordWinArenaCoin" gorm:"default:0;comment:地主输赢竞技币"`
        Farmer1WinArenaCoin   int64      `json:"farmer1WinArenaCoin" gorm:"default:0;comment:农民1输赢竞技币"`
        Farmer2WinArenaCoin   int64      `json:"farmer2WinArenaCoin" gorm:"default:0;comment:农民2输赢竞技币"`
        StartedAt             time.Time  `json:"startedAt" gorm:"index;comment:开始时间"`        // 🔧【修复】string -> time.Time
        EndedAt               *time.Time `json:"endedAt" gorm:"comment:结束时间"`                // 🔧【修复】string -> *time.Time
        DurationSeconds       int        `json:"durationSeconds" gorm:"comment:游戏时长(秒)"`
}

func (DDZGameRecord) TableName() string {
        return "ddz_game_records"
}

// DDZGamePlayerRecord 游戏玩家记录
type DDZGamePlayerRecord struct {
        global.GVA_MODEL
        GameID      string `json:"gameId" gorm:"index;comment:游戏记录ID"`
        PlayerID    string `json:"playerId" gorm:"index;comment:玩家ID"`
        PlayerIndex int    `json:"playerIndex" gorm:"comment:玩家位置 0-2"`
        IsLandlord  int    `json:"isLandlord" gorm:"comment:是否地主 0否 1是"`
        IsWinner    int    `json:"isWinner" gorm:"comment:是否赢家 0否 1是"`
        Score       int64  `json:"score" gorm:"comment:得分(负数为扣分)"`
        CoinsBefore int64  `json:"coinsBefore" gorm:"comment:变化前金币"`
        CoinsAfter  int64  `json:"coinsAfter" gorm:"comment:变化后金币"`
        Cards       string `json:"cards" gorm:"type:text;comment:手牌(序列化)"`
}

func (DDZGamePlayerRecord) TableName() string {
        return "ddz_game_player_records"
}

// DDZGamePlayRecord 游戏出牌记录
type DDZGamePlayRecord struct {
        global.GVA_MODEL
        GameID     string `json:"gameId" gorm:"index;comment:游戏记录ID"`
        PlayerID   string `json:"playerId" gorm:"index;comment:玩家ID"`
        PlayerIndex int   `json:"playerIndex" gorm:"comment:玩家位置"`
        TurnIndex  int    `json:"turnIndex" gorm:"comment:回合序号"`
        ActionType int    `json:"actionType" gorm:"comment:操作类型 1出牌 2不出 3叫地主 4不叫 5抢地主 6不抢"`
        Cards      string `json:"cards" gorm:"type:text;comment:出的牌(序列化)"`
        Timestamp  string `json:"timestamp" gorm:"comment:操作时间"`
}

func (DDZGamePlayRecord) TableName() string {
        return "ddz_game_play_records"
}
