package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZRoomSublevel 房间子分区配置（对应 ddz_room_sublevel 表）
// 用于练级区的子分区配置：10分场、50分场、200分场、500分场、1000分场
type DDZRoomSublevel struct {
	global.GVA_MODEL
	RoomConfigID    uint   `json:"roomConfigId" gorm:"type:bigint unsigned;not null;index;comment:关联的房间配置ID"`
	SublevelName    string `json:"sublevelName" gorm:"type:varchar(64);not null;comment:子分区名称"`          // 如：10分场、50分场
	BaseScore       int    `json:"baseScore" gorm:"type:int;not null;default:10;comment:底分"`              // 底分（10、50、200、500、1000）
	MinGold         int64  `json:"minGold" gorm:"type:bigint;not null;default:0;comment:最低入场金币"`         // 最低入场金币
	MaxGold         int64  `json:"maxGold" gorm:"type:bigint;not null;default:0;comment:最高入场金币(0表示无限制)"` // 最高入场金币
	UpgradeScore    int64  `json:"upgradeScore" gorm:"type:bigint;not null;default:0;comment:升级所需分数"`    // 达到多少分可升级到下一场次（50倍基础分）
	NextSublevelID  uint   `json:"nextSublevelId" gorm:"type:bigint unsigned;default:0;comment:下一子分区ID"`  // 升级后进入的子分区ID，0表示最高级
	PrevSublevelID  uint   `json:"prevSublevelId" gorm:"type:bigint unsigned;default:0;comment:上一子分区ID"`  // 降级后进入的子分区ID，0表示最低级
	BgImageNum      int    `json:"bgImageNum" gorm:"type:tinyint;not null;default:2;comment:背景图编号"`
	BotEnabled      int    `json:"botEnabled" gorm:"type:tinyint;not null;default:1;comment:是否允许机器人:0-否,1-是"`
	BotCount        int    `json:"botCount" gorm:"type:int;not null;default:2;comment:房间机器人数量"`
	TimeoutSeconds  int    `json:"timeoutSeconds" gorm:"type:int;not null;default:30;comment:操作超时时间(秒)"`
	Status          int    `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:状态:0-关闭,1-开启"`
	SortOrder       int    `json:"sortOrder" gorm:"type:int;not null;default:0;comment:排序权重"`
	Description     string `json:"description" gorm:"type:varchar(256);default:'';comment:描述"`
}

func (DDZRoomSublevel) TableName() string {
	return "ddz_room_sublevel"
}

// 子分区常量
const (
	// 升级倍率
	UpgradeMultiplier = 50 // 达到50倍基础分升级

	// 子分区状态
	SublevelStatusDisabled = 0 // 关闭
	SublevelStatusEnabled  = 1 // 开启
)

// GetUpgradeScore 计算升级所需分数（50倍基础分）
func (s *DDZRoomSublevel) GetUpgradeScore() int64 {
	return int64(s.BaseScore) * UpgradeMultiplier
}

// DDZRoomSublevelRequest 子分区请求参数
type DDZRoomSublevelRequest struct {
	RoomConfigID   uint   `json:"roomConfigId" form:"roomConfigId"`
	SublevelName   string `json:"sublevelName" form:"sublevelName"`
	BaseScore      int    `json:"baseScore" form:"baseScore"`
	MinGold        int64  `json:"minGold" form:"minGold"`
	MaxGold        int64  `json:"maxGold" form:"maxGold"`
	UpgradeScore   int64  `json:"upgradeScore" form:"upgradeScore"`
	NextSublevelID uint   `json:"nextSublevelId" form:"nextSublevelId"`
	PrevSublevelID uint   `json:"prevSublevelId" form:"prevSublevelId"`
	BgImageNum     int    `json:"bgImageNum" form:"bgImageNum"`
	BotEnabled     int    `json:"botEnabled" form:"botEnabled"`
	BotCount       int    `json:"botCount" form:"botCount"`
	TimeoutSeconds int    `json:"timeoutSeconds" form:"timeoutSeconds"`
	Status         int    `json:"status" form:"status"`
	SortOrder      int    `json:"sortOrder" form:"sortOrder"`
	Description    string `json:"description" form:"description"`
}
