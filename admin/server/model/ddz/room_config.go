package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZRoomConfig 游戏房间配置（对应 ddz_room_config 表）
// 用于游戏大厅的房间配置：新手场、普通场、高级场、富豪场、至尊场
type DDZRoomConfig struct {
        global.GVA_MODEL
        RoomName       string  `json:"roomName" gorm:"type:varchar(64);not null;comment:房间名称"`
        RoomType       int     `json:"roomType" gorm:"type:tinyint;uniqueIndex;not null;default:1;comment:房间类型:1-新手场,2-普通场,3-高级场,4-富豪场,5-至尊场"`
        RoomCategory   int     `json:"roomCategory" gorm:"type:tinyint;not null;default:1;index;comment:房间分类:1-普通场,2-竞技场"`
        BaseScore      int     `json:"baseScore" gorm:"type:int;not null;default:1;comment:底分"`
        Multiplier     int     `json:"multiplier" gorm:"type:int;not null;default:1;comment:初始倍数"`
        MinGold        int64   `json:"minGold" gorm:"type:bigint;not null;default:0;comment:最低入场金币"`
        MaxGold        int64   `json:"maxGold" gorm:"type:bigint;not null;default:0;comment:最高入场金币(0表示无限制)"`
        MinArenaCoin   int64   `json:"minArenaCoin" gorm:"type:bigint;not null;default:0;comment:最低入场竞技币(竞技场房间使用)"`
        MaxArenaCoin   int64   `json:"maxArenaCoin" gorm:"type:bigint;not null;default:0;comment:最高入场竞技币(竞技场房间使用,0表示无限制)"`
        BgImageNum     int     `json:"bgImageNum" gorm:"type:tinyint;not null;default:2;comment:背景图编号(对应btn_happy_{编号}.png,如:2->btn_happy_2.png)"`
        BotEnabled     int     `json:"botEnabled" gorm:"type:tinyint;not null;default:1;comment:是否允许机器人:0-否,1-是"`
        BotCount       int     `json:"botCount" gorm:"type:int;not null;default:0;comment:房间机器人数量"`
        FeeRate        float64 `json:"feeRate" gorm:"type:decimal(5,4);not null;default:0;comment:手续费率"`
        MaxRound       int     `json:"maxRound" gorm:"type:int;not null;default:20;comment:最大回合数"`
        TimeoutSeconds int     `json:"timeoutSeconds" gorm:"type:int;not null;default:30;comment:操作超时时间(秒)"`
        Status         int     `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:状态:0-关闭,1-开启"`
        SortOrder      int     `json:"sortOrder" gorm:"type:int;not null;default:0;comment:排序权重"`
        Description    string  `json:"description" gorm:"type:varchar(256);default:'';comment:房间描述"`
}

func (DDZRoomConfig) TableName() string {
        return "ddz_room_config"
}

// DDZRoom 游戏房间实例（对应 ddz_rooms 表）
// 存储实际创建的游戏房间
type DDZRoom struct {
        global.GVA_MODEL
        RoomID         string `json:"roomId" gorm:"uniqueIndex;type:varchar(64);not null;comment:房间唯一标识"`
        RoomConfigID   uint   `json:"roomConfigId" gorm:"index;comment:房间配置ID"`
        RoomName       string `json:"roomName" gorm:"type:varchar(64);not null;comment:房间名称"`
        RoomType       int    `json:"roomType" gorm:"type:tinyint;not null;default:1;comment:房间类型:1-新手场,2-普通场,3-高级场,4-富豪场,5-至尊场"`
        RoomCategory   int    `json:"roomCategory" gorm:"type:tinyint;not null;default:1;index;comment:房间分类:1-普通场,2-竞技场"`
        Status         int    `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:房间状态:1-等待中,2-游戏中,3-已结束"`
        PlayerCount    int    `json:"playerCount" gorm:"type:tinyint;not null;default:0;comment:当前玩家数"`
        MaxPlayers     int    `json:"maxPlayers" gorm:"type:tinyint;not null;default:3;comment:最大玩家数"`
        CreatorID      string `json:"creatorId" gorm:"type:varchar(64);comment:创建者玩家ID"`
        Players        string `json:"players" gorm:"type:text;comment:玩家列表(JSON)"`
        BaseScore      int    `json:"baseScore" gorm:"type:int;not null;default:1;comment:底分"`
        Multiplier     int    `json:"multiplier" gorm:"type:int;not null;default:1;comment:初始倍数"`
        CurrentGameID  string `json:"currentGameId" gorm:"type:varchar(64);comment:当前游戏ID"`
        StartedAt      string `json:"startedAt" gorm:"type:datetime;comment:游戏开始时间"`
        EndedAt        string `json:"endedAt" gorm:"type:datetime;comment:游戏结束时间"`
}

func (DDZRoom) TableName() string {
        return "ddz_rooms"
}

// DDZGameConfig 游戏配置
type DDZGameConfig struct {
        global.GVA_MODEL
        ConfigKey   string `json:"configKey" gorm:"uniqueIndex;comment:配置键"`
        ConfigValue string `json:"configValue" gorm:"type:text;comment:配置值"`
        ConfigType  string `json:"configType" gorm:"comment:配置类型 string/int/json"`
        Description string `json:"description" gorm:"comment:配置描述"`
        Status      int    `json:"status" gorm:"default:1;comment:状态 1启用 2禁用"`
}

func (DDZGameConfig) TableName() string {
        return "ddz_game_configs"
}

// 房间状态常量
const (
        RoomStatusWaiting = 1 // 等待中
        RoomStatusPlaying = 2 // 游戏中
        RoomStatusEnded   = 3 // 已结束
)

// 背景图编号常量
const (
        BgImageNumMin = 2 // 最小背景图编号
        BgImageNumMax = 6 // 最大背景图编号（支持至尊场）
)

// GetBgImageFileName 根据背景图编号获取文件名
func GetBgImageFileName(bgImageNum int) string {
        return "btn_happy_" + string(rune('0'+bgImageNum)) + ".png"
}

// GetBgImagePath 根据背景图编号获取客户端资源路径
func GetBgImagePath(bgImageNum int) string {
        return "UI/btn_happy_" + string(rune('0'+bgImageNum))
}
