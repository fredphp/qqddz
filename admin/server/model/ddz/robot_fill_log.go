package ddz

import "time"

// DDZRobotFillLog 机器人填充日志表模型
type DDZRobotFillLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	SessionID    uint64    `gorm:"type:bigint unsigned;not null;index;comment:会话ID" json:"session_id"`
	RoundNum     int       `gorm:"type:int;not null;index;comment:轮次" json:"round_num"`
	TableID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:桌号ID" json:"table_id"`
	RobotID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:机器人ID" json:"robot_id"`
	PlayerID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:机器人玩家ID" json:"player_id"`
	Position     int       `gorm:"type:int;not null;comment:座位位置(1-3)" json:"position"`
	FilledAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:填充时间" json:"filled_at"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// TableName 指定机器人填充日志表名
func (DDZRobotFillLog) TableName() string {
	return "ddz_robot_fill_logs"
}
