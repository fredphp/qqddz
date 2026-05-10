package ddz

import "time"

// DDZPendingGameData 待处理游戏数据表
type DDZPendingGameData struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	DataType     string    `gorm:"type:varchar(32);not null;index;comment:数据类型" json:"dataType"`
	DataContent  string    `gorm:"type:text;comment:数据内容(JSON)" json:"dataContent"`
	Status       uint8     `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态:0-待处理,1-处理中,2-已处理,3-失败" json:"status"`
	RetryCount   int       `gorm:"not null;default:0;comment:重试次数" json:"retryCount"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZPendingGameData) TableName() string {
	return "ddz_pending_game_data"
}

// DDZWriteQueueErrorLog 写入队列错误日志表
type DDZWriteQueueErrorLog struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	QueueName     string    `gorm:"type:varchar(64);not null;index;comment:队列名称" json:"queueName"`
	DataContent   string    `gorm:"type:text;comment:数据内容(JSON)" json:"dataContent"`
	ErrorMessage  string    `gorm:"type:text;comment:错误信息" json:"errorMessage"`
	RetryCount    int       `gorm:"not null;default:0;comment:重试次数" json:"retryCount"`
	Status        uint8     `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态:0-待重试,1-已重试成功,2-已放弃" json:"status"`
	CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZWriteQueueErrorLog) TableName() string {
	return "ddz_write_queue_error_logs"
}
