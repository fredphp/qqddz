package response

// DDZDailyStatsResponse 每日统计响应
type DDZDailyStatsResponse struct {
	Date            string  `json:"date"`
	TotalPlayers    int     `json:"totalPlayers"`
	NewPlayers      int     `json:"newPlayers"`
	ActivePlayers   int     `json:"activePlayers"`
	TotalGames      int     `json:"totalGames"`
	AvgGameDuration float64 `json:"avgGameDuration"`
	MaxOnline       int     `json:"maxOnline"`
	TotalOnlineTime int64   `json:"totalOnlineTime"`
	PeakTime        string  `json:"peakTime"`
}

// DDZDailyStatsListResponse 每日统计列表响应
type DDZDailyStatsListResponse struct {
	List  []DDZDailyStatsResponse `json:"list"`
	Total int64                   `json:"total"`
}

// DDZLeaderboardResponse 排行榜响应
type DDZLeaderboardResponse struct {
	Rank      int     `json:"rank"`
	PlayerID  string  `json:"playerId"`
	Nickname  string  `json:"nickname"`
	Avatar    string  `json:"avatar"`
	Score     int64   `json:"score"`
	WinRate   float64 `json:"winRate"`
	Level     int     `json:"level"`
	VipLevel  int     `json:"vipLevel"`
}

// DDZLeaderboardListResponse 排行榜列表响应
type DDZLeaderboardListResponse struct {
	List     []DDZLeaderboardResponse `json:"list"`
	RankType string                   `json:"rankType"`
}

// DDZOverviewStatsResponse 概览统计响应
type DDZOverviewStatsResponse struct {
	TotalPlayers     int64   `json:"totalPlayers"`
	ActivePlayers    int64   `json:"activePlayers"`
	OnlinePlayers    int64   `json:"onlinePlayers"`
	TotalGames       int64   `json:"totalGames"`
	TodayGames       int64   `json:"todayGames"`
	TodayNewPlayers  int64   `json:"todayNewPlayers"`
	AvgOnlineTime    float64 `json:"avgOnlineTime"`
	AvgGameDuration  float64 `json:"avgGameDuration"`
	TotalCoins       int64   `json:"totalCoins"`
}

// DDZPlayerStatsResponse 玩家统计响应
type DDZPlayerStatsResponse struct {
	PlayerID      string  `json:"playerId"`
	Date          string  `json:"date"`
	GamesPlayed   int     `json:"gamesPlayed"`
	Wins          int     `json:"wins"`
	Losses        int     `json:"losses"`
	Draws         int     `json:"draws"`
	WinRate       float64 `json:"winRate"`
	LandlordWins  int     `json:"landlordWins"`
	LandlordGames int     `json:"landlordGames"`
	FarmerWins    int     `json:"farmerWins"`
	FarmerGames   int     `json:"farmerGames"`
	TotalScore    int64   `json:"totalScore"`
	MaxWinScore   int64   `json:"maxWinScore"`
	MaxLoseScore  int64   `json:"maxLoseScore"`
	OnlineTime    int64   `json:"onlineTime"`
	SpringCount   int     `json:"springCount"`
	BombCount     int     `json:"bombCount"`
}

// DDZPlayerStatsListResponse 玩家统计列表响应
type DDZPlayerStatsListResponse struct {
	List  []DDZPlayerStatsResponse `json:"list"`
	Total int64                    `json:"total"`
	Page  int                      `json:"page"`
	PageSize int                   `json:"pageSize"`
}

// DDZChartDataPoint 图表数据点
type DDZChartDataPoint struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
}

// DDZChartResponse 图表数据响应
type DDZChartResponse struct {
	Labels []string  `json:"labels"`
	Data   []float64 `json:"data"`
	Title  string    `json:"title"`
}
