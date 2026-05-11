package ddz

import "time"

// DDZArenaPeriod 竞技场期次表模型
type DDZArenaPeriod struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement;comment:期次ID" json:"id"`
	PeriodNo        string     `gorm:"type:varchar(20);uniqueIndex;not null;comment:期号(格式J202605060001)" json:"period_no"`
	SessionID       uint64     `gorm:"type:bigint unsigned;not null;index;comment:关联会话ID" json:"session_id"`
	Status          uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态:0-待开始,1-进行中,2-已结束" json:"status"`
	TotalPlayers    int        `gorm:"type:int;not null;default:0;comment:参赛人数" json:"total_players"`
	ActivePlayers   int        `gorm:"type:int;not null;default:0;comment:剩余人数" json:"active_players"`
	TotalRounds     int        `gorm:"type:int;not null;default:3;comment:总轮次" json:"total_rounds"`
	CurrentRound    int        `gorm:"type:int;not null;default:0;comment:当前轮次" json:"current_round"`
	ChampionID      *uint64    `gorm:"type:bigint unsigned;comment:冠军玩家ID" json:"champion_id"`
	RunnerUpID      *uint64    `gorm:"type:bigint unsigned;comment:亚军玩家ID" json:"runner_up_id"`
	ThirdID         *uint64    `gorm:"type:bigint unsigned;comment:季军玩家ID" json:"third_id"`
	ScheduledStart  *time.Time `gorm:"type:datetime;comment:计划开始时间" json:"scheduled_start"`
	ActualStart     *time.Time `gorm:"type:datetime;comment:实际开始时间" json:"actual_start"`
	EndTime         *time.Time `gorm:"type:datetime;comment:结束时间" json:"end_time"`
	CreatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
}

// TableName 指定竞技场期次表名
func (DDZArenaPeriod) TableName() string {
	return "ddz_arena_periods"
}
