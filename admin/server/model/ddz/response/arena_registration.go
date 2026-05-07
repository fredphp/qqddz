package response

// DDZArenaRegistrationResponse 竞技场报名响应
type DDZArenaRegistrationResponse struct {
        ID             uint   `json:"ID"`
        PlayerID       uint64 `json:"playerId"`
        PlayerNickname string `json:"playerNickname"`
        ArenaLevel     int    `json:"arenaLevel"`
        ArenaLevelName string `json:"arenaLevelName"`
        ArenaCoinCost  int64  `json:"arenaCoinCost"`
        Status         int    `json:"status"`
        StatusText     string `json:"statusText"`
        RegisteredAt   string `json:"registeredAt"`
        CancelledAt    string `json:"cancelledAt"`
        OperateIP      string `json:"operateIp"`
        CreatedAt      string `json:"createdAt"`
}

// DDZArenaStatusResponse 竞技场报名状态响应
type DDZArenaStatusResponse struct {
        IsRegistered     bool   `json:"isRegistered"`     // 是否已报名
        ArenaLevel       int    `json:"arenaLevel"`       // 报名的竞技场等级（0表示未报名）
        ArenaLevelName   string `json:"arenaLevelName"`   // 竞技场名称
        ArenaCoinCost    int64  `json:"arenaCoinCost"`    // 消耗的竞技币
        RegisteredAt     string `json:"registeredAt"`     // 报名时间
        PlayerArenaCoin  int64  `json:"playerArenaCoin"`  // 玩家当前竞技币
}

// DDZArenaListResponse 竞技场列表响应
type DDZArenaListResponse struct {
        ArenaLevel       int    `json:"arenaLevel"`
        ArenaLevelName   string `json:"arenaLevelName"`
        ArenaCoinCost    int64  `json:"arenaCoinCost"`    // 报名费
        MinArenaCoin     int64  `json:"minArenaCoin"`     // 最低入场竞技币
        IsRegistered     bool   `json:"isRegistered"`     // 当前玩家是否已报名此场
        CanRegister      bool   `json:"canRegister"`      // 是否可以报名
        InMatchTime      bool   `json:"inMatchTime"`      // 是否在开赛时间内
        NextMatchTime    string `json:"nextMatchTime"`    // 下一个开赛时间段
        MatchTimeRanges  string `json:"matchTimeRanges"`  // 开赛时间段配置
}

// DDZArenaOperateResponse 竞技场操作响应（报名/取消）
type DDZArenaOperateResponse struct {
        Success         bool   `json:"success"`
        Message         string `json:"message"`
        PlayerArenaCoin int64  `json:"playerArenaCoin"` // 操作后玩家竞技币余额
}
