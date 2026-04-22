package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZPlayerStats 玩家统计
type DDZPlayerStats struct {
	global.GVA_MODEL
	PlayerID      string `json:"playerId" gorm:"uniqueIndex;comment:玩家ID"`
	Date          string `json:"date" gorm:"index;comment:统计日期 YYYY-MM-DD"`
	GamesPlayed   int    `json:"gamesPlayed" gorm:"default:0;comment:游戏场次"`
	Wins          int    `json:"wins" gorm:"default:0;comment:胜利场次"`
	Losses        int    `json:"losses" gorm:"default:0;comment:失败场次"`
	Draws         int    `json:"draws" gorm:"default:0;comment:平局场次"`
	WinRate       float64 `json:"winRate" gorm:"default:0;comment:胜率"`
	LandlordWins  int    `json:"landlordWins" gorm:"default:0;comment:地主胜场"`
	LandlordGames int    `json:"landlordGames" gorm:"default:0;comment:地主总场次"`
	FarmerWins    int    `json:"farmerWins" gorm:"default:0;comment:农民胜场"`
	FarmerGames   int    `json:"farmerGames" gorm:"default:0;comment:农民总场次"`
	TotalScore    int64  `json:"totalScore" gorm:"default:0;comment:总得分"`
	MaxWinScore   int64  `json:"maxWinScore" gorm:"default:0;comment:单局最大赢分"`
	MaxLoseScore  int64  `json:"maxLoseScore" gorm:"default:0;comment:单局最大输分"`
	OnlineTime    int64  `json:"onlineTime" gorm:"default:0;comment:在线时长(秒)"`
	SpringCount   int    `json:"springCount" gorm:"default:0;comment:春天次数"`
	BombCount     int    `json:"bombCount" gorm:"default:0;comment:炸弹次数"`
}

func (DDZPlayerStats) TableName() string {
	return "ddz_player_stats"
}

// DDZDailyStats 每日统计汇总
type DDZDailyStats struct {
	global.GVA_MODEL
	Date            string  `json:"date" gorm:"uniqueIndex;comment:统计日期 YYYY-MM-DD"`
	TotalPlayers    int     `json:"totalPlayers" gorm:"default:0;comment:总玩家数"`
	NewPlayers      int     `json:"newPlayers" gorm:"default:0;comment:新增玩家数"`
	ActivePlayers   int     `json:"activePlayers" gorm:"default:0;comment:活跃玩家数"`
	TotalGames      int     `json:"totalGames" gorm:"default:0;comment:总游戏场次"`
	AvgGameDuration float64 `json:"avgGameDuration" gorm:"default:0;comment:平均游戏时长(秒)"`
	MaxOnline       int     `json:"maxOnline" gorm:"default:0;comment:最高在线人数"`
	TotalOnlineTime int64   `json:"totalOnlineTime" gorm:"default:0;comment:总在线时长(秒)"`
	PeakTime        string  `json:"peakTime" gorm:"comment:高峰时间"`
}

func (DDZDailyStats) TableName() string {
	return "ddz_daily_stats"
}

// DDZLeaderboard 排行榜
type DDZLeaderboard struct {
	global.GVA_MODEL
	RankType   string `json:"rankType" gorm:"index;comment:排行类型 winrate/coins/level/wins"`
	PlayerID   string `json:"playerId" gorm:"index;comment:玩家ID"`
	Score      int64  `json:"score" gorm:"comment:分数"`
	Rank       int    `json:"rank" gorm:"comment:排名"`
	UpdateTime string `json:"updateTime" gorm:"comment:更新时间"`
}

func (DDZLeaderboard) TableName() string {
	return "ddz_leaderboard"
}
