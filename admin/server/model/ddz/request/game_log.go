package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZBidLogSearch 叫地主日志搜索请求
type DDZBidLogSearch struct {
        request.PageInfo
        GameID   string `json:"gameId" form:"gameId"`
        PlayerID string `json:"playerId" form:"playerId"`
        BidType  *int   `json:"bidType" form:"bidType"`
        Month    string `json:"month" form:"month"` // 月份筛选，格式: 202401，默认当月
}

// DDZDealLogSearch 发牌日志搜索请求
type DDZDealLogSearch struct {
        request.PageInfo
        GameID     string `json:"gameId" form:"gameId"`
        PlayerID   string `json:"playerId" form:"playerId"`
        PlayerRole *int   `json:"playerRole" form:"playerRole"`
        Month      string `json:"month" form:"month"` // 月份筛选，格式: 202401，默认当月
}

// DDZPlayLogSearch 出牌日志搜索请求
type DDZPlayLogSearch struct {
        request.PageInfo
        GameID      string `json:"gameId" form:"gameId"`
        PlayerID    string `json:"playerId" form:"playerId"`
        PlayType    *int   `json:"playType" form:"playType"`
        IsBomb      *int   `json:"isBomb" form:"isBomb"`
        CardPattern string `json:"cardPattern" form:"cardPattern"`
        Month       string `json:"month" form:"month"` // 月份筛选，格式: 202401，默认当月
}

// DDZPlayerStatSearch 玩家统计搜索请求
type DDZPlayerStatSearch struct {
        request.PageInfo
        PlayerID  string `json:"playerId" form:"playerId"`
        StartDate string `json:"startDate" form:"startDate"`
        EndDate   string `json:"endDate" form:"endDate"`
        OrderBy   string `json:"orderBy" form:"orderBy"` // winRate, totalGames, winGames
}

// DDZSmsCodeSearch 短信验证码搜索请求
type DDZSmsCodeSearch struct {
        request.PageInfo
        Phone     string `json:"phone" form:"phone"`
        Type      *int   `json:"type" form:"type"`
        IsUsed    *int   `json:"isUsed" form:"isUsed"`
        StartDate string `json:"startDate" form:"startDate"`
        EndDate   string `json:"endDate" form:"endDate"`
}

// DDZGameConfigCreate 创建游戏配置请求
type DDZGameConfigCreate struct {
        ConfigKey   string `json:"configKey" binding:"required"`
        ConfigValue string `json:"configValue"`
        Description string `json:"description"`
}

// DDZGamePlayerRecordSearch 游戏玩家记录搜索请求
type DDZGamePlayerRecordSearch struct {
        request.PageInfo
        GameID   string `json:"gameId" form:"gameId"`
        PlayerID uint64 `json:"playerId" form:"playerId"`
}

// DDZGamePlayRecordSearch 出牌记录搜索请求
type DDZGamePlayRecordSearch struct {
        request.PageInfo
        GameID   string  `json:"gameId" form:"gameId"`
        PlayerID uint64  `json:"playerId" form:"playerId"`
        PlayType *uint8  `json:"playType" form:"playType"`
}

// DDZDealRecordSearch 发牌记录搜索请求
type DDZDealRecordSearch struct {
        request.PageInfo
        GameID   string `json:"gameId" form:"gameId"`
        PlayerID uint64 `json:"playerId" form:"playerId"`
}

// DDZStatsSearch 统计搜索请求
type DDZStatsSearch struct {
        request.PageInfo
        PlayerID  string `json:"playerId" form:"playerId"`
        StartDate string `json:"startDate" form:"startDate"`
        EndDate   string `json:"endDate" form:"endDate"`
}
