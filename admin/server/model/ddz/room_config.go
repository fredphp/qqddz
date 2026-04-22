package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZRoomConfig 房间配置
type DDZRoomConfig struct {
	global.GVA_MODEL
	Name         string `json:"name" gorm:"comment:房间名称"`
	RoomType     int    `json:"roomType" gorm:"comment:房间类型 1普通 2VIP"`
	RoomLevel    int    `json:"roomLevel" gorm:"comment:房间等级"`
	BaseScore    int    `json:"baseScore" gorm:"comment:底分"`
	MinCoins     int64  `json:"minCoins" gorm:"comment:最低金币准入"`
	MaxCoins     int64  `json:"maxCoins" gorm:"comment:最高金币上限(0为无上限)"`
	ServiceFee   int    `json:"serviceFee" gorm:"default:0;comment:服务费比例(百分比)"`
	MaxMultiple  int    `json:"maxMultiple" gorm:"default:20;comment:最大倍数"`
	Timeout      int    `json:"timeout" gorm:"default:30;comment:出牌超时时间(秒)"`
	AllowSpring  int    `json:"allowSpring" gorm:"default:1;comment:是否允许春天 0否 1是"`
	AllowBomb    int    `json:"allowBomb" gorm:"default:1;comment:是否允许炸弹 0否 1是"`
	AllowRocket  int    `json:"allowRocket" gorm:"default:1;comment:是否允许王炸 0否 1是"`
	Status       int    `json:"status" gorm:"default:1;comment:状态 1启用 2禁用"`
	Sort         int    `json:"sort" gorm:"default:0;comment:排序"`
	Description  string `json:"description" gorm:"type:text;comment:房间描述"`
}

func (DDZRoomConfig) TableName() string {
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
