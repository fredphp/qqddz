package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZGameRecordSearch 游戏记录搜索请求
type DDZGameRecordSearch struct {
	request.PageInfo
	GameID    string `json:"gameId" form:"gameId"`
	RoomID    string `json:"roomId" form:"roomId"`
	RoomType  *int   `json:"roomType" form:"roomType"`
	PlayerID  string `json:"playerId" form:"playerId"`
	Result    *int   `json:"result" form:"result"`
	Spring    *int   `json:"spring" form:"spring"`
	StartDate string `json:"startDate" form:"startDate"`
	EndDate   string `json:"endDate" form:"endDate"`
}

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
	GameID    string `json:"gameId" form:"gameId"`
	PlayerID  string `json:"playerId" form:"playerId"`
	PlayerRole *int  `json:"playerRole" form:"playerRole"`
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

// DDZRoomConfigSearch 房间配置搜索请求
type DDZRoomConfigSearch struct {
	request.PageInfo
	RoomType *int `json:"roomType" form:"roomType"`
	Status   *int `json:"status" form:"status"`
}

// DDZRoomConfigCreate 创建房间配置请求
type DDZRoomConfigCreate struct {
	RoomName       string  `json:"roomName" binding:"required"`
	RoomType       int     `json:"roomType" binding:"required"`
	BaseScore      int     `json:"baseScore"`
	Multiplier     int     `json:"multiplier"`
	MinGold        int64   `json:"minGold"`
	MaxGold        int64   `json:"maxGold"`
	BotEnabled     int     `json:"botEnabled"`
	BotCount       int     `json:"botCount"`
	FeeRate        float64 `json:"feeRate"`
	MaxRound       int     `json:"maxRound"`
	TimeoutSeconds int     `json:"timeoutSeconds"`
	Status         int     `json:"status"`
	SortOrder      int     `json:"sortOrder"`
	Description    string  `json:"description"`
}

// DDZRoomConfigUpdate 更新房间配置请求
type DDZRoomConfigUpdate struct {
	ID             uint    `json:"ID" binding:"required"`
	RoomName       string  `json:"roomName"`
	BaseScore      int     `json:"baseScore"`
	Multiplier     int     `json:"multiplier"`
	MinGold        int64   `json:"minGold"`
	MaxGold        int64   `json:"maxGold"`
	BotEnabled     int     `json:"botEnabled"`
	BotCount       int     `json:"botCount"`
	FeeRate        float64 `json:"feeRate"`
	MaxRound       int     `json:"maxRound"`
	TimeoutSeconds int     `json:"timeoutSeconds"`
	Status         *int    `json:"status"`
	SortOrder      int     `json:"sortOrder"`
	Description    string  `json:"description"`
}

// DDZSmsCodeSearch 短信验证码搜索请求
type DDZSmsCodeSearch struct {
	request.PageInfo
	Phone    string `json:"phone" form:"phone"`
	Type     *int   `json:"type" form:"type"`
	IsUsed   *int   `json:"isUsed" form:"isUsed"`
	StartDate string `json:"startDate" form:"startDate"`
	EndDate   string `json:"endDate" form:"endDate"`
}
