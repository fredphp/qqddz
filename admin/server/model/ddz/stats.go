package ddz

import "time"

// DDZDailyStats 每日统计表
type DDZDailyStats struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement;comment:统计ID" json:"id"`
	StatDate        string    `gorm:"type:varchar(10);not null;uniqueIndex;comment:统计日期" json:"statDate"`
	NewPlayers      int       `gorm:"not null;default:0;comment:新增玩家数" json:"newPlayers"`
	ActivePlayers   int       `gorm:"not null;default:0;comment:活跃玩家数" json:"activePlayers"`
	TotalGames      int       `gorm:"not null;default:0;comment:总对局数" json:"totalGames"`
	TotalGoldChange int64     `gorm:"not null;default:0;comment:总金币变化" json:"totalGoldChange"`
	CreatedAt       time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZDailyStats) TableName() string {
	return "ddz_daily_stats"
}

// DDZLeaderboard 排行榜表
type DDZLeaderboard struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement;comment:排行榜ID" json:"id"`
	PlayerID       uint64    `gorm:"not null;uniqueIndex;comment:玩家ID" json:"playerId"`
	PlayerName     string    `gorm:"type:varchar(64);not null;comment:玩家昵称" json:"playerName"`
	Avatar         string    `gorm:"type:varchar(256);default:'';comment:头像URL" json:"avatar"`
	WinCount       int       `gorm:"not null;default:0;comment:胜场数" json:"winCount"`
	LoseCount      int       `gorm:"not null;default:0;comment:负场数" json:"loseCount"`
	WinRate        float64   `gorm:"type:decimal(5,2);not null;default:0;comment:胜率" json:"winRate"`
	Gold           int64     `gorm:"not null;default:0;comment:金币" json:"gold"`
	ArenaCoin      int64     `gorm:"not null;default:0;comment:竞技币" json:"arenaCoin"`
	RankScore      int       `gorm:"not null;default:0;index;comment:积分" json:"rankScore"`
	LastUpdateTime time.Time `gorm:"type:datetime;comment:最后更新时间" json:"lastUpdateTime"`
	CreatedAt      time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
	UpdatedAt      time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
}

func (DDZLeaderboard) TableName() string {
	return "ddz_leaderboard"
}

// DDZPlayerOnline 在线玩家记录表
type DDZPlayerOnline struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	PlayerID   uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	LoginIP    string    `gorm:"type:varchar(64);default:'';comment:登录IP" json:"loginIp"`
	DeviceID   string    `gorm:"type:varchar(128);default:'';comment:设备ID" json:"deviceId"`
	ServerID   string    `gorm:"type:varchar(64);default:'';comment:服务器ID" json:"serverId"`
	LoginTime  time.Time `gorm:"type:datetime;comment:登录时间" json:"loginTime"`
	LogoutTime *time.Time `gorm:"type:datetime;comment:登出时间" json:"logoutTime"`
	OnlineTime int64     `gorm:"not null;default:0;comment:在线时长(秒)" json:"onlineTime"`
	CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZPlayerOnline) TableName() string {
	return "ddz_player_online"
}
