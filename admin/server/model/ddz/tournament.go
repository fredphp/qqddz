package ddz

import "time"

// DDZTournamentRound 锦标赛轮次表
type DDZTournamentRound struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement;comment:轮次ID" json:"id"`
	SessionID    uint64     `gorm:"not null;index;comment:会话ID" json:"sessionId"`
	RoundNumber  int        `gorm:"not null;comment:轮次号" json:"roundNumber"`
	PlayerCount  int        `gorm:"not null;default:0;comment:玩家数量" json:"playerCount"`
	TableCount   int        `gorm:"not null;default:0;comment:桌数" json:"tableCount"`
	Status       uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:状态:0-待开始,1-进行中,2-已结束" json:"status"`
	StartedAt    *time.Time `gorm:"type:datetime;comment:开始时间" json:"startedAt"`
	EndedAt      *time.Time `gorm:"type:datetime;comment:结束时间" json:"endedAt"`
	CreatedAt    time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZTournamentRound) TableName() string {
	return "ddz_tournament_rounds"
}

// DDZTournamentElimination 锦标赛淘汰记录表
type DDZTournamentElimination struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	SessionID     uint64    `gorm:"not null;index;comment:会话ID" json:"sessionId"`
	RoundID       uint64    `gorm:"not null;index;comment:轮次ID" json:"roundId"`
	PlayerID      uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	TableID       uint64    `gorm:"not null;index;comment:桌号ID" json:"tableId"`
	Rank          int       `gorm:"not null;default:0;comment:排名" json:"rank"`
	EliminatedAt  time.Time `gorm:"type:datetime;comment:淘汰时间" json:"eliminatedAt"`
	CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZTournamentElimination) TableName() string {
	return "ddz_tournament_eliminations"
}
