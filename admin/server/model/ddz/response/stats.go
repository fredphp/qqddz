package response

// DDZDailyStatsResponse 每日统计响应
type DDZDailyStatsResponse struct {
        Date            string  `json:"date"`
        TotalPlayers    int64   `json:"totalPlayers"`
        NewPlayers      int64   `json:"newPlayers"`
        ActivePlayers   int64   `json:"activePlayers"`
        TotalGames      int64   `json:"totalGames"`
        AvgGameDuration float64 `json:"avgGameDuration"`
        MaxOnline       int64   `json:"maxOnline"`
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
        TotalPlayers       int64   `json:"totalPlayers"`
        ActivePlayers      int64   `json:"activePlayers"`      // 7天活跃玩家
        OnlinePlayers      int64   `json:"onlinePlayers"`      // 当前在线玩家
        TotalGames         int64   `json:"totalGames"`         // 总游戏场次
        TodayGames         int64   `json:"todayGames"`         // 今日游戏场次
        TodayNewPlayers    int64   `json:"todayNewPlayers"`    // 今日新增玩家
        TodayActivePlayers int64   `json:"todayActivePlayers"` // 今日活跃玩家
        AvgOnlineTime      float64 `json:"avgOnlineTime"`      // 平均在线时长
        AvgGameDuration    float64 `json:"avgGameDuration"`    // 平均游戏时长(秒)
        TotalCoins         int64   `json:"totalCoins"`         // 总金币存量
}

// DDZPlayerStatsResponse 玩家统计响应
type DDZPlayerStatsResponse struct {
        PlayerID        string  `json:"playerId"`
        PlayerName      string  `json:"playerName"`
        PlayerAvatar    string  `json:"playerAvatar"`
        VIPLevel        int     `json:"vipLevel"`
        StatDate        string  `json:"statDate"`        // 统计日期
        TotalGames      int     `json:"totalGames"`      // 总场次
        WinGames        int     `json:"winGames"`        // 胜场
        LoseGames       int     `json:"loseGames"`       // 负场
        DrawGames       int     `json:"drawGames"`       // 平局
        WinRate         float64 `json:"winRate"`         // 胜率
        LandlordGames   int     `json:"landlordGames"`   // 地主总场次
        LandlordWins    int     `json:"landlordWins"`    // 地主胜场
        LandlordWinRate float64 `json:"landlordWinRate"` // 地主胜率
        FarmerGames     int     `json:"farmerGames"`     // 农民总场次
        FarmerWins      int     `json:"farmerWins"`      // 农民胜场
        FarmerWinRate   float64 `json:"farmerWinRate"`   // 农民胜率
        TotalBombs      int     `json:"totalBombs"`      // 炸弹总数
        SpringCount     int     `json:"springCount"`     // 春天次数
        CurrentGold     int64   `json:"currentGold"`     // 当前金币余额
        TotalScore      int64   `json:"totalScore"`      // 总得分
        MaxWinScore     int64   `json:"maxWinScore"`     // 单局最大赢分
        MaxLoseScore    int64   `json:"maxLoseScore"`    // 单局最大输分
        OnlineTime      int64   `json:"onlineTime"`      // 在线时长(秒)
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
