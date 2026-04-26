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
	BaseScore      int     `json:"baseScore" gorm:"type:int;not null;default:1;comment:底分"`
	Multiplier     int     `json:"multiplier" gorm:"type:int;not null;default:1;comment:初始倍数"`
	MinGold        int64   `json:"minGold" gorm:"type:bigint;not null;default:0;comment:最低入场金币"`
	MaxGold        int64   `json:"maxGold" gorm:"type:bigint;not null;default:0;comment:最高入场金币(0表示无限制)"`
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

// DDZRoomConfigs 菜单房间配置（对应 ddz_room_configs 表）
// 用于后台管理系统的房间配置管理
type DDZRoomConfigs struct {
	global.GVA_MODEL
	Name        string `json:"name" gorm:"type:varchar(191);comment:房间名称"`
	RoomType    int    `json:"roomType" gorm:"type:int;comment:房间类型 1普通 2VIP"`
	RoomLevel   int    `json:"roomLevel" gorm:"type:int;comment:房间等级"`
	BaseScore   int    `json:"baseScore" gorm:"type:int;comment:底分"`
	MinCoins    int64  `json:"minCoins" gorm:"type:bigint;comment:最低金币准入"`
	MaxCoins    int64  `json:"maxCoins" gorm:"type:bigint;comment:最高金币上限(0为无上限)"`
	BgImageNum  int    `json:"bgImageNum" gorm:"type:tinyint;not null;default:2;comment:背景图编号(对应btn_happy_{编号}.png)"`
	ServiceFee  int    `json:"serviceFee" gorm:"type:int;default:0;comment:服务费比例(百分比)"`
	MaxMultiple int    `json:"maxMultiple" gorm:"type:int;default:20;comment:最大倍数"`
	Timeout     int    `json:"timeout" gorm:"type:int;default:30;comment:出牌超时时间(秒)"`
	AllowSpring int    `json:"allowSpring" gorm:"type:int;default:1;comment:是否允许春天 0否 1是"`
	AllowBomb   int    `json:"allowBomb" gorm:"type:int;default:1;comment:是否允许炸弹 0否 1是"`
	AllowRocket int    `json:"allowRocket" gorm:"type:int;default:1;comment:是否允许王炸 0否 1是"`
	Status      int    `json:"status" gorm:"type:int;default:1;comment:状态 1启用 2禁用"`
	Sort        int    `json:"sort" gorm:"type:int;default:0;comment:排序"`
	Description string `json:"description" gorm:"type:text;comment:房间描述"`
}

func (DDZRoomConfigs) TableName() string {
	return "ddz_room_configs"
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

// 背景图编号常量
const (
	BgImageNumMin = 2 // 最小背景图编号
	BgImageNumMax = 5 // 最大背景图编号
)

// GetBgImageFileName 根据背景图编号获取文件名
func GetBgImageFileName(bgImageNum int) string {
	return "btn_happy_" + string(rune('0'+bgImageNum)) + ".png"
}

// GetBgImagePath 根据背景图编号获取客户端资源路径
func GetBgImagePath(bgImageNum int) string {
	return "UI/btn_happy_" + string(rune('0'+bgImageNum))
}
