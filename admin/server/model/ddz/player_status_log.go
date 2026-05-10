package ddz

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// PlayerStatusActionType 玩家状态操作类型
const (
	PlayerActionFreeze   = 1 // 冻结
	PlayerActionUnfreeze = 2 // 解冻
	PlayerActionBan      = 3 // 封号
	PlayerActionUnban    = 4 // 解封
)

// PlayerStatusActionTypeText 操作类型文本
var PlayerStatusActionTypeText = map[uint8]string{
	PlayerActionFreeze:   "冻结",
	PlayerActionUnfreeze: "解冻",
	PlayerActionBan:      "封号",
	PlayerActionUnban:    "解封",
}

// DDZPlayerStatusLog 玩家状态变更日志
type DDZPlayerStatusLog struct {
	global.GVA_MODEL
	PlayerID       uint64     `gorm:"type:bigint;not null;index;comment:玩家ID" json:"playerId"`
	ActionType     uint8      `gorm:"type:tinyint unsigned;not null;comment:操作类型:1-冻结,2-解冻,3-封号,4-解封" json:"actionType"`
	ActionTypeText string     `gorm:"->:type:string;comment:操作类型文本" json:"actionTypeText"`
	Reason         string     `gorm:"type:varchar(500);comment:操作原因" json:"reason"`
	Duration       int        `gorm:"type:int;default:0;comment:时长(小时),0为永久" json:"duration"`
	ExpireAt       *time.Time `gorm:"type:datetime;comment:到期时间" json:"expireAt"`
	OperatorID     uint       `gorm:"type:int unsigned;comment:操作人ID" json:"operatorId"`
	OperatorName   string     `gorm:"type:varchar(64);comment:操作人用户名" json:"operatorName"`
	CreatedAt      time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZPlayerStatusLog) TableName() string {
	return "ddz_player_status_logs"
}

// GetActionTypeText 获取操作类型文本
func (l *DDZPlayerStatusLog) GetActionTypeText() string {
	return PlayerStatusActionTypeText[l.ActionType]
}
