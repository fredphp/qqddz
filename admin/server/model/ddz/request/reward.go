package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// ==================== 奖励商品（ddz_reward_goods 表）====================

// DDZRewardGoodsSearch 奖励商品搜索请求
type DDZRewardGoodsSearch struct {
        request.PageInfo
        Name       string `json:"name" form:"name"`
        RewardType *int   `json:"rewardType" form:"rewardType"`
        Status     *int   `json:"status" form:"status"`
}

// DDZRewardGoodsCreate 创建奖励商品请求
type DDZRewardGoodsCreate struct {
        Name           string `json:"name" binding:"required"`
        Image          string `json:"image"`
        RoomConfigIDs  string `json:"roomConfigIds"`
        DetailRichtext string `json:"detailRichtext"`
        RewardType     int    `json:"rewardType" binding:"required"`
        RewardValue    int64  `json:"rewardValue"`
        Stock          int    `json:"stock"`
        Status         int    `json:"status"`
        SortOrder      int    `json:"sortOrder"`
}

// DDZRewardGoodsUpdate 更新奖励商品请求
type DDZRewardGoodsUpdate struct {
        ID             uint   `json:"ID" binding:"required"`
        Name           string `json:"name"`
        Image          string `json:"image"`
        RoomConfigIDs  string `json:"roomConfigIds"`
        DetailRichtext string `json:"detailRichtext"`
        RewardType     int    `json:"rewardType"`
        RewardValue    int64  `json:"rewardValue"`
        Stock          int    `json:"stock"`
        Status         int    `json:"status"`
        SortOrder      int    `json:"sortOrder"`
}

// ==================== 奖励订单（ddz_reward_orders 表）====================

// DDZRewardOrderSearch 奖励订单搜索请求
type DDZRewardOrderSearch struct {
        request.PageInfo
        OrderNo      string `json:"orderNo" form:"orderNo"`
        PlayerID     string `json:"playerId" form:"playerId"`
        RoomConfigID *uint  `json:"roomConfigId" form:"roomConfigId"`
        Status       *int   `json:"status" form:"status"`
        StartDate    string `json:"startDate" form:"startDate"`
        EndDate      string `json:"endDate" form:"endDate"`
}

// DDZRewardOrderShip 发货请求
type DDZRewardOrderShip struct {
        ID             uint   `json:"ID" binding:"required"`
        ExpressCompany string `json:"expressCompany" binding:"required"`
        ExpressNo      string `json:"expressNo" binding:"required"`
}

// DDZRewardOrderCancel 取消订单请求
type DDZRewardOrderCancel struct {
        ID     uint   `json:"ID" binding:"required"`
        Remark string `json:"remark"`
}
