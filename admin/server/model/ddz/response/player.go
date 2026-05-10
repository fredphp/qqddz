package response

// DDZPlayerResponse 玩家响应
type DDZPlayerResponse struct {
        ID           uint    `json:"ID"`
        PlayerID     string  `json:"playerId"`
        Nickname     string  `json:"nickname"`
        Avatar       string  `json:"avatar"`
        Gender       int     `json:"gender"`
        PlayerType   int     `json:"playerType"`   // 玩家类型: 1-平台用户 2-机器人
        PlayerTypeText string `json:"playerTypeText"` // 玩家类型文本
        Coins        int64   `json:"coins"`
        ArenaCoin    int64   `json:"arenaCoin"`
        Diamonds     int64   `json:"diamonds"`
        WinCount     int     `json:"winCount"`
        LoseCount    int     `json:"loseCount"`
        DrawCount    int     `json:"drawCount"`
        TotalGames   int     `json:"totalGames"`
        WinRate      float64 `json:"winRate"`
        MaxWinStreak int     `json:"maxWinStreak"`
        WinStreak    int     `json:"winStreak"`
        Level        int     `json:"level"`
        Experience   int     `json:"experience"`
        VipLevel     int     `json:"vipLevel"`
        Status       int     `json:"status"`
        StatusText   string  `json:"statusText"`   // 状态文本
        StatusReason string  `json:"statusReason"` // 状态原因
        StatusExpire string  `json:"statusExpire"` // 状态过期时间
        BanReason    string  `json:"banReason"`
        BanTime      string  `json:"banTime"`
        UnbanTime    string  `json:"unbanTime"`
        LastLoginIP  string  `json:"lastLoginIp"`
        LastLoginAt  string  `json:"lastLoginAt"`
        RegisterIP   string  `json:"registerIp"`
        DeviceID     string  `json:"deviceId"`
        CreatedAt    string  `json:"createdAt"`
        UpdatedAt    string  `json:"updatedAt"`
        // 账户相关信息（从 ddz_user_accounts 关联查询）
        Phone         string `json:"phone"`         // 手机号
        LoginType     int    `json:"loginType"`     // 登录类型: 1-手机号 2-微信 3-游客
        LoginTypeText string `json:"loginTypeText"` // 登录类型文本
        DeviceType    string `json:"deviceType"`    // 设备类型: ios/android/web
        LoginCount    int    `json:"loginCount"`    // 登录次数
}

// DDZPlayerListResponse 玩家列表响应
type DDZPlayerListResponse struct {
        List     []DDZPlayerResponse `json:"list"`
        Total    int64               `json:"total"`
        Page     int                 `json:"page"`
        PageSize int                 `json:"pageSize"`
}

// DDZPlayerStatusLogResponse 玩家状态日志响应
type DDZPlayerStatusLogResponse struct {
        ID             uint   `json:"ID"`
        PlayerId       uint64 `json:"playerId"`
        ActionType     int    `json:"actionType"`
        ActionTypeText string `json:"actionTypeText"`
        Reason         string `json:"reason"`
        Duration       int    `json:"duration"`
        DurationText   string `json:"durationText"` // 时长文本
        ExpireAt       string `json:"expireAt"`
        OperatorName   string `json:"operatorName"`
        CreatedAt      string `json:"createdAt"`
}

// DDZGenerateRobotsResponse 生成机器人响应
type DDZGenerateRobotsResponse struct {
        SuccessCount int                   `json:"successCount"` // 成功数量
        FailedCount  int                   `json:"failedCount"`  // 失败数量
        Robots       []DDZPlayerResponse   `json:"robots"`       // 生成的机器人列表
}
