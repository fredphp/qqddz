package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZPlayerSearch 玩家搜索请求
type DDZPlayerSearch struct {
        request.PageInfo
        PlayerID   string `json:"playerId" form:"playerId"`
        Nickname   string `json:"nickname" form:"nickname"`
        Status     *int   `json:"status" form:"status"`
        VipLevel   int    `json:"vipLevel" form:"vipLevel"`
        MinCoins   int64  `json:"minCoins" form:"minCoins"`
        MaxCoins   int64  `json:"maxCoins" form:"maxCoins"`
        PlayerType *int   `json:"playerType" form:"playerType"` // 玩家类型: 1-平台用户 2-机器人
}

// DDZPlayerBan 封禁玩家请求
type DDZPlayerBan struct {
        PlayerID string `json:"playerId" binding:"required"`
        Reason   string `json:"reason" binding:"required"`
        Duration int    `json:"duration"` // 封禁时长(小时)，0为永久
}

// DDZPlayerUnban 解封玩家请求
type DDZPlayerUnban struct {
        PlayerID string `json:"playerId" binding:"required"`
        Reason   string `json:"reason" binding:"required"` // 解封原因
}

// DDZPlayerFreeze 冻结玩家请求
type DDZPlayerFreeze struct {
        PlayerID uint64 `json:"playerId" binding:"required"` // 玩家主键ID
        Reason   string `json:"reason" binding:"required"`   // 冻结原因
        Duration int    `json:"duration"`                    // 冻结时长(小时)，0为永久
}

// DDZPlayerUnfreeze 解冻玩家请求
type DDZPlayerUnfreeze struct {
        PlayerID uint64 `json:"playerId" binding:"required"` // 玩家主键ID
        Reason   string `json:"reason" binding:"required"`   // 解冻原因
}

// DDZPlayerStatusLogSearch 玩家状态日志搜索请求
type DDZPlayerStatusLogSearch struct {
        request.PageInfo
        PlayerID   uint64 `json:"playerId" form:"playerId"`
        ActionType *int   `json:"actionType" form:"actionType"`
}

// DDZPlayerUpdate 更新玩家信息请求
type DDZPlayerUpdate struct {
        ID         uint   `json:"ID" binding:"required"`
        Nickname   string `json:"nickname"`
        Avatar     string `json:"avatar"`
        Gender     int    `json:"gender"`
        VipLevel   int    `json:"vipLevel"`
        Coins      int64  `json:"coins"`
        Diamonds   int64  `json:"diamonds"`
        ArenaCoin  int64  `json:"arenaCoin"`
        ArenaCoinRemark string `json:"arenaCoinRemark"` // 竞技币变动备注
}

// DDZPlayerCurrencyUpdate 货币调整请求（通用）
type DDZPlayerCurrencyUpdate struct {
        ID          uint   `json:"ID" binding:"required"`         // 玩家主键ID
        CurrencyType string `json:"currencyType" binding:"required"` // 货币类型: gold/arenaCoin/diamond
        Amount      int64  `json:"amount" binding:"required"`     // 变动数量(正数增加,负数减少)
        Remark      string `json:"remark"`                        // 备注说明
}

// DDZPlayerArenaCoinUpdate 更新玩家竞技币请求
type DDZPlayerArenaCoinUpdate struct {
        ID      uint   `json:"ID" binding:"required"`       // 玩家主键ID
        Amount  int64  `json:"amount" binding:"required"`   // 变动数量(正数增加,负数减少)
        Remark  string `json:"remark"`                      // 备注说明
}

// DDZPlayerCoinsUpdate 更新玩家金币请求
type DDZPlayerCoinsUpdate struct {
        PlayerID string `json:"playerId" binding:"required"`
        Coins    int64  `json:"coins" binding:"required"`
        Reason   string `json:"reason" binding:"required"`
}

// DDZCoinLogSearch 流水日志搜索请求
type DDZCoinLogSearch struct {
        request.PageInfo
        PlayerID     uint64 `json:"playerId" form:"playerId"`
        CurrencyType string `json:"currencyType" form:"currencyType"` // gold/arenaCoin/diamond
        ChangeType   *int   `json:"changeType" form:"changeType"`
        StartDate    string `json:"startDate" form:"startDate"`
        EndDate      string `json:"endDate" form:"endDate"`
}

// DDZPlayerCreate 创建玩家请求
type DDZPlayerCreate struct {
        PlayerID  string `json:"playerId" binding:"required"`  // 玩家ID（唯一标识）
        Nickname  string `json:"nickname" binding:"required"`  // 昵称
        Avatar    string `json:"avatar"`                       // 头像URL
        Gender    int    `json:"gender"`                       // 性别 0未知 1男 2女
        Coins     int64  `json:"coins"`                        // 初始金币
        Diamonds  int64  `json:"diamonds"`                     // 初始钻石
        VipLevel  int    `json:"vipLevel"`                     // VIP等级
        DeviceID  string `json:"deviceId"`                     // 设备ID
}

// DDZPlayerDelete 删除玩家请求
type DDZPlayerDelete struct {
        ID uint `json:"ID" binding:"required"` // 玩家主键ID
}

// DDZPlayerDeleteByPlayerID 根据PlayerID删除玩家请求
type DDZPlayerDeleteByPlayerID struct {
        PlayerID string `json:"playerId" binding:"required"` // 玩家ID
}

// DDZGenerateRobots 生成机器人请求
type DDZGenerateRobots struct {
        Count int `json:"count" binding:"required,min=1,max=20"` // 生成数量(1-20)
}
