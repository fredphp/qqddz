package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZBidLogSearch 叫地主日志搜索请求
type DDZBidLogSearch struct {
	request.PageInfo
	GameID   string `json:"gameId" form:"gameId"`
	PlayerID string `json:"playerId" form:"playerId"`
	BidType  *int   `json:"bidType" form:"bidType"`
}

// DDZDealLogSearch 发牌日志搜索请求
type DDZDealLogSearch struct {
	request.PageInfo
	GameID     string `json:"gameId" form:"gameId"`
	PlayerID   string `json:"playerId" form:"playerId"`
	PlayerRole *int   `json:"playerRole" form:"playerRole"`
}

// DDZPlayLogSearch 出牌日志搜索请求
type DDZPlayLogSearch struct {
	request.PageInfo
	GameID      string `json:"gameId" form:"gameId"`
	PlayerID    string `json:"playerId" form:"playerId"`
	PlayType    *int   `json:"playType" form:"playType"`
	IsBomb      *int   `json:"isBomb" form:"isBomb"`
	CardPattern string `json:"cardPattern" form:"cardPattern"`
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
