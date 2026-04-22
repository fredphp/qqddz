package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZStatsSearch 统计搜索请求
type DDZStatsSearch struct {
	request.PageInfo
	PlayerID string `json:"playerId" form:"playerId"`
	StartDate string `json:"startDate" form:"startDate"`
	EndDate   string `json:"endDate" form:"endDate"`
}

// DDZLeaderboardSearch 排行榜搜索请求
type DDZLeaderboardSearch struct {
	RankType string `json:"rankType" form:"rankType" binding:"required"` // winrate/coins/level/wins
	Limit    int    `json:"limit" form:"limit"`
}

// DDZDailyStatsSearch 每日统计搜索请求
type DDZDailyStatsSearch struct {
	StartDate string `json:"startDate" form:"startDate" binding:"required"`
	EndDate   string `json:"endDate" form:"endDate" binding:"required"`
}
