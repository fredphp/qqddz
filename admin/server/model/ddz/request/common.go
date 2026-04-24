package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZPlayerSearch 玩家搜索请求
type DDZPlayerSearch struct {
        request.PageInfo
        PlayerID string `json:"playerId" form:"playerId"`
        Nickname string `json:"nickname" form:"nickname"`
        Status   *int   `json:"status" form:"status"`
        VipLevel int    `json:"vipLevel" form:"vipLevel"`
        MinCoins int64  `json:"minCoins" form:"minCoins"`
        MaxCoins int64  `json:"maxCoins" form:"maxCoins"`
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
}

// DDZPlayerUpdate 更新玩家信息请求
type DDZPlayerUpdate struct {
        ID       uint   `json:"ID" binding:"required"`
        Nickname string `json:"nickname"`
        Avatar   string `json:"avatar"`
        Gender   int    `json:"gender"`
        VipLevel int    `json:"vipLevel"`
        Coins    int64  `json:"coins"`
        Diamonds int64  `json:"diamonds"`
}

// DDZPlayerCoinsUpdate 更新玩家金币请求
type DDZPlayerCoinsUpdate struct {
        PlayerID string `json:"playerId" binding:"required"`
        Coins    int64  `json:"coins" binding:"required"`
        Reason   string `json:"reason" binding:"required"`
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
