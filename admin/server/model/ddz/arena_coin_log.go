package ddz

import "time"

// DDZArenaCoinLog 竞技币流水日志模型
type DDZArenaCoinLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PlayerID     uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	ChangeAmount int64     `gorm:"not null;comment:变化金额(正数为获得,负数为消耗)" json:"changeAmount"`
	BalanceAfter int64     `gorm:"not null;comment:变化后余额" json:"balanceAfter"`
	ChangeType   uint8     `gorm:"not null;index;comment:变化类型:1-游戏结算,2-系统赠送,3-兑换,4-后台调整,5-其他" json:"changeType"`
	RelatedID    string    `gorm:"type:varchar(64);default:'';comment:关联ID(游戏ID等)" json:"relatedId"`
	Remark       string    `gorm:"type:varchar(256);default:'';comment:备注" json:"remark"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZArenaCoinLog) TableName() string {
	return "ddz_arena_coin_logs"
}

// 竞技币变化类型常量
const (
	ArenaCoinChangeTypeGame      = 1 // 游戏结算
	ArenaCoinChangeTypeSystem    = 2 // 系统赠送
	ArenaCoinChangeTypeExchange  = 3 // 兑换
	ArenaCoinChangeTypeAdmin     = 4 // 后台调整
	ArenaCoinChangeTypeOther     = 5 // 其他
)
