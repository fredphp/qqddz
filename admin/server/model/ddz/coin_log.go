package ddz

import "time"

// DDZGoldLog 金币流水日志模型
type DDZGoldLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PlayerID     uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	ChangeAmount int64     `gorm:"not null;comment:变化金额(正数为获得,负数为消耗)" json:"changeAmount"`
	BalanceAfter int64     `gorm:"not null;comment:变化后余额" json:"balanceAfter"`
	ChangeType   uint8     `gorm:"not null;index;comment:变化类型:1-游戏结算,2-系统赠送,3-兑换,4-后台调整,5-其他" json:"changeType"`
	RelatedID    string    `gorm:"type:varchar(64);default:'';comment:关联ID(游戏ID等)" json:"relatedId"`
	Remark       string    `gorm:"type:varchar(256);default:'';comment:备注" json:"remark"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZGoldLog) TableName() string {
	return "ddz_gold_logs"
}

// DDZDiamondLog 钻石流水日志模型
type DDZDiamondLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PlayerID     uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	ChangeAmount int64     `gorm:"not null;comment:变化金额(正数为获得,负数为消耗)" json:"changeAmount"`
	BalanceAfter int64     `gorm:"not null;comment:变化后余额" json:"balanceAfter"`
	ChangeType   uint8     `gorm:"not null;index;comment:变化类型:1-游戏结算,2-系统赠送,3-兑换,4-后台调整,5-其他" json:"changeType"`
	RelatedID    string    `gorm:"type:varchar(64);default:'';comment:关联ID(游戏ID等)" json:"relatedId"`
	Remark       string    `gorm:"type:varchar(256);default:'';comment:备注" json:"remark"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZDiamondLog) TableName() string {
	return "ddz_diamond_logs"
}

// 流水变化类型常量
const (
	CoinChangeTypeGame      = 1 // 游戏结算
	CoinChangeTypeSystem    = 2 // 系统赠送
	CoinChangeTypeExchange  = 3 // 兑换
	CoinChangeTypeAdmin     = 4 // 后台调整
	CoinChangeTypeOther     = 5 // 其他
)

// 变化类型文本映射
var CoinChangeTypeText = map[uint8]string{
	1: "游戏结算",
	2: "系统赠送",
	3: "兑换",
	4: "后台调整",
	5: "其他",
}
