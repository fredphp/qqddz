package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZAdRewardSearch 广告奖励日志搜索请求
type DDZAdRewardSearch struct {
        request.PageInfo
        PlayerID     NullUint64 `json:"playerId" form:"playerId"`
        AdType       NullInt    `json:"adType" form:"adType"`
        CurrencyType NullInt    `json:"currencyType" form:"currencyType"`
        StartDate    string     `json:"startDate" form:"startDate"`
        EndDate      string     `json:"endDate" form:"endDate"`
}

// DDZAdRewardCreate 创建广告奖励记录请求
type DDZAdRewardCreate struct {
        PlayerID     uint64 `json:"playerId" binding:"required"`
        AdType       int    `json:"adType" binding:"required"`
        RewardAmount int64  `json:"rewardAmount" binding:"required"`
        CurrencyType int    `json:"currencyType" binding:"required"`
}
