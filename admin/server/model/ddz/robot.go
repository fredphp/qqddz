package ddz

import "time"

// DDZRobot 机器人表模型
type DDZRobot struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:机器人ID" json:"id"`
	PlayerID     uint64    `gorm:"type:bigint unsigned;not null;uniqueIndex;comment:关联玩家ID" json:"player_id"`
	Nickname     string    `gorm:"type:varchar(64);not null;comment:昵称" json:"nickname"`
	Avatar       string    `gorm:"type:varchar(255);comment:头像URL" json:"avatar"`
	ConfigID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:关联配置ID" json:"config_id"`
	Status       uint8     `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态:0-禁用,1-启用" json:"status"`
	LastActiveAt *time.Time `gorm:"type:datetime;comment:最后活跃时间" json:"last_active_at"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
	UpdatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
}

// TableName 指定机器人表名
func (DDZRobot) TableName() string {
	return "ddz_robots"
}
