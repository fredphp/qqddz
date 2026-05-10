package ddz

import (
	"time"

	"gorm.io/gorm"
)

// DDZArenaMatchConfig 竞技场比赛配置表
type DDZArenaMatchConfig struct {
	ID                uint64         `gorm:"primaryKey;autoIncrement;comment:配置ID" json:"id"`
	RoomConfigID      uint64         `gorm:"not null;index;comment:关联房间配置ID" json:"roomConfigId"`
	MatchTimeRanges   string         `gorm:"type:json;comment:开赛时间段" json:"matchTimeRanges"`
	MatchRoundDuration int           `gorm:"not null;default:5;comment:每场时长(分钟)" json:"matchRoundDuration"`
	MatchRoundCount   int           `gorm:"not null;default:3;comment:比赛轮次" json:"matchRoundCount"`
	SignupFee         int64         `gorm:"not null;default:0;comment:报名费(竞技币)" json:"signupFee"`
	MaxPlayers        int           `gorm:"not null;default:9;comment:最大参赛人数" json:"maxPlayers"`
	MinPlayers        int           `gorm:"not null;default:3;comment:最小开赛人数" json:"minPlayers"`
	ChampionRewardID  *uint64       `gorm:"comment:冠军奖励ID" json:"championRewardId"`
	RunnerUpRewardID  *uint64       `gorm:"comment:亚军奖励ID" json:"runnerUpRewardId"`
	ThirdRewardID     *uint64       `gorm:"comment:季军奖励ID" json:"thirdRewardId"`
	SignupStartTime   string        `gorm:"type:varchar(8);default:'00:00';comment:报名开始时间" json:"signupStartTime"`
	SignupEndTime     string        `gorm:"type:varchar(8);default:'23:59';comment:报名结束时间" json:"signupEndTime"`
	AutoStart         uint8         `gorm:"type:tinyint unsigned;not null;default:1;comment:是否自动开赛:0-否,1-是" json:"autoStart"`
	Status            uint8         `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态:0-关闭,1-开启" json:"status"`
	Description       string        `gorm:"type:varchar(512);default:'';comment:比赛描述" json:"description"`
	CreatedAt         time.Time     `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
	UpdatedAt         time.Time     `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
	DeletedAt         gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"-"`
}

func (DDZArenaMatchConfig) TableName() string {
	return "ddz_arena_match_config"
}

// DDZArenaRoundRecord 竞技场轮次记录表
type DDZArenaRoundRecord struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	SessionID   uint64     `gorm:"not null;index;comment:会话ID" json:"sessionId"`
	RoundNumber int        `gorm:"not null;comment:轮次号" json:"roundNumber"`
	Status      uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:状态:0-待开始,1-进行中,2-已结束" json:"status"`
	StartedAt   *time.Time `gorm:"type:datetime;comment:开始时间" json:"startedAt"`
	EndedAt     *time.Time `gorm:"type:datetime;comment:结束时间" json:"endedAt"`
	CreatedAt   time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZArenaRoundRecord) TableName() string {
	return "ddz_arena_round_records"
}

// DDZArenaSession 竞技场会话表
type DDZArenaSession struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement;comment:会话ID" json:"id"`
	PeriodNo      string     `gorm:"type:varchar(20);not null;index;comment:期号" json:"periodNo"`
	RoomConfigID  uint64     `gorm:"not null;index;comment:房间配置ID" json:"roomConfigId"`
	Status        uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态:0-待开始,1-进行中,2-已结束" json:"status"`
	TotalPlayers  int        `gorm:"not null;default:0;comment:总玩家数" json:"totalPlayers"`
	RobotCount    int        `gorm:"not null;default:0;comment:机器人数量" json:"robotCount"`
	CurrentRound  int        `gorm:"not null;default:0;comment:当前轮次" json:"currentRound"`
	TotalRounds   int        `gorm:"not null;default:0;comment:总轮次" json:"totalRounds"`
	StartedAt     *time.Time `gorm:"type:datetime;comment:开始时间" json:"startedAt"`
	EndedAt       *time.Time `gorm:"type:datetime;comment:结束时间" json:"endedAt"`
	CreatedAt     time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
	UpdatedAt     time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
}

func (DDZArenaSession) TableName() string {
	return "ddz_arena_sessions"
}

// DDZArenaSignupLog 竞技场报名日志表
type DDZArenaSignupLog struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PlayerID   uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	PeriodNo   string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"periodNo"`
	Action     uint8     `gorm:"type:tinyint unsigned;not null;comment:操作:1-报名,2-取消" json:"action"`
	SignupFee  int64     `gorm:"not null;default:0;comment:报名费" json:"signupFee"`
	Status     uint8     `gorm:"type:tinyint unsigned;not null;default:1;comment:状态:1-成功,2-失败" json:"status"`
	CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZArenaSignupLog) TableName() string {
	return "ddz_arena_signup_logs"
}

// DDZArenaTable 竞技场桌号表
type DDZArenaTable struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement;comment:桌号ID" json:"id"`
	SessionID   uint64    `gorm:"not null;index;comment:会话ID" json:"sessionId"`
	RoundID     uint64    `gorm:"not null;index;comment:轮次ID" json:"roundId"`
	TableNumber int       `gorm:"not null;comment:桌号" json:"tableNumber"`
	Status      uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:状态:0-待开始,1-进行中,2-已结束" json:"status"`
	CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZArenaTable) TableName() string {
	return "ddz_arena_tables"
}
