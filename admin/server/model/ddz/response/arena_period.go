package response

// ArenaPeriodResponse 期号响应
type ArenaPeriodResponse struct {
        ID              uint64                `json:"ID"`
        PeriodNo        string                `json:"periodNo"`        // 期号
        RoomID          uint64                `json:"roomId"`          // 房间ID
        RoomConfigID    uint64                `json:"roomConfigId"`    // 房间配置ID
        RoomName        string                `json:"roomName"`        // 房间名称
        RoomType        int                   `json:"roomType"`        // 房间类型
        RoomTypeText    string                `json:"roomTypeText"`    // 房间类型文本
        PeriodIndex     int                   `json:"periodIndex"`     // 场次号
        StartTime       string                `json:"startTime"`       // 开始时间
        SignupStartTime string                `json:"signupStartTime"` // 报名开始时间
        SignupEndTime   string                `json:"signupEndTime"`   // 报名结束时间
        EndTime         string                `json:"endTime"`         // 结束时间
        TotalSignup     int                   `json:"totalSignup"`     // 报名总人数
        TotalCancel     int                   `json:"totalCancel"`     // 取消报名人数
        FinalPlayers    int                   `json:"finalPlayers"`    // 最终参赛人数
        Status          uint8                 `json:"status"`          // 状态
        StatusText      string                `json:"statusText"`      // 状态文本
        SessionID       *uint64               `json:"sessionId"`       // 关联会话ID
        SessionStatus   *uint8                `json:"sessionStatus"`   // 会话状态
        CreatedAt       string                `json:"createdAt"`       // 创建时间
        UpdatedAt       string                `json:"updatedAt"`       // 更新时间
}

// ArenaPeriodPlayerResponse 期号玩家响应
type ArenaPeriodPlayerResponse struct {
        ID          uint64 `json:"ID"`
        PeriodNo    string `json:"periodNo"`    // 期号
        PeriodID    uint64 `json:"periodId"`    // 期号ID
        PlayerID    uint64 `json:"playerId"`    // 玩家ID
        PlayerName  string `json:"playerName"`  // 玩家昵称
        SignupTime  string `json:"signupTime"`  // 报名时间
        SignupOrder int    `json:"signupOrder"` // 报名顺序
        SignupFee   int64  `json:"signupFee"`   // 报名费
        Status      uint8  `json:"status"`      // 状态
        StatusText  string `json:"statusText"`  // 状态文本
        CreatedAt   string `json:"createdAt"`   // 创建时间
}

// ArenaPeriodSignupLogResponse 期号报名日志响应
type ArenaPeriodSignupLogResponse struct {
        ID            uint64 `json:"ID"`
        PeriodNo      string `json:"periodNo"`      // 期号
        PeriodID      uint64 `json:"periodId"`      // 期号ID
        PlayerID      uint64 `json:"playerId"`      // 玩家ID
        PlayerName    string `json:"playerName"`    // 玩家昵称
        ActionType    uint8  `json:"actionType"`    // 操作类型
        ActionText    string `json:"actionText"`    // 操作类型文本
        SignupFee     int64  `json:"signupFee"`     // 报名费
        BalanceBefore int64  `json:"balanceBefore"` // 操作前余额
        BalanceAfter  int64  `json:"balanceAfter"`  // 操作后余额
        Remark        string `json:"remark"`        // 备注
        CreatedAt     string `json:"createdAt"`     // 创建时间
}

// ArenaPeriodStatsResponse 期号统计响应
type ArenaPeriodStatsResponse struct {
        TotalPeriods    int64 `json:"totalPeriods"`    // 总期号数
        TodayPeriods    int64 `json:"todayPeriods"`    // 今日期号数
        ActivePeriods   int64 `json:"activePeriods"`   // 进行中期号数
        TotalSignup     int64 `json:"totalSignup"`     // 总报名人数
        TodaySignup     int64 `json:"todaySignup"`     // 今日报名人数
        TodayPlayers    int64 `json:"todayPlayers"`    // 今日参赛人数
}

// ArenaPeriodLeaderboardResponse 期数排行榜响应
type ArenaPeriodLeaderboardResponse struct {
        Rank           int    `json:"rank"`           // 排名
        PlayerID       uint64 `json:"playerId"`       // 玩家ID
        PlayerName     string `json:"playerName"`     // 玩家昵称
        PlayerAvatar   string `json:"playerAvatar"`   // 玩家头像
        MatchCoin      int64  `json:"matchCoin"`      // 比赛金币
        IsEliminated   bool   `json:"isEliminated"`   // 是否淘汰
        IsChampion     bool   `json:"isChampion"`     // 是否冠军
        EliminatedRound int   `json:"eliminatedRound"` // 淘汰轮次
}
