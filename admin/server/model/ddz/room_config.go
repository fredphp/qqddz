package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZRoomConfig 房间配置（与游戏服务端ddz_room_config表一致）
type DDZRoomConfig struct {
	global.GVA_MODEL
	RoomName       string `json:"roomName" gorm:"type:varchar(64);not null;comment:房间名称"`
	RoomType       int    `json:"roomType" gorm:"type:tinyint;uniqueIndex;not null;default:1;comment:房间类型:1-初级,2-中级,3-高级,4-大师"`
	BaseScore      int    `json:"baseScore" gorm:"type:int;not null;default:1;comment:底分"`
	Multiplier     int    `json:"multiplier" gorm:"type:int;not null;default:1;comment:初始倍数"`
	MinGold        int64  `json:"minGold" gorm:"type:bigint;not null;default:0;comment:最低入场金币"`
	MaxGold        int64  `json:"maxGold" gorm:"type:bigint;not null;default:0;comment:最高入场金币(0表示无限制)"`
	BotEnabled     int    `json:"botEnabled" gorm:"type:tinyint;not null;default:1;comment:是否允许机器人:0-否,1-是"`
	BotCount       int    `json:"botCount" gorm:"type:int;not null;default:0;comment:房间机器人数量"`
	FeeRate        float64 `json:"feeRate" gorm:"type:decimal(5,4);not null;default:0;comment:手续费率"`
	MaxRound       int    `json:"maxRound" gorm:"type:int;not null;default:20;comment:最大回合数"`
	TimeoutSeconds int    `json:"timeoutSeconds" gorm:"type:int;not null;default:30;comment:操作超时时间(秒)"`
	Status         int    `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:状态:0-关闭,1-开启"`
	SortOrder      int    `json:"sortOrder" gorm:"type:int;not null;default:0;comment:排序权重"`
	Description    string `json:"description" gorm:"type:varchar(256);default:'';comment:房间描述"`
}

func (DDZRoomConfig) TableName() string {
	return "ddz_room_config"
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
