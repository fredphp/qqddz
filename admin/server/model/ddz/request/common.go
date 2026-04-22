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
