package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZRoomConfigSearch 房间配置搜索请求
type DDZRoomConfigSearch struct {
	request.PageInfo
	RoomName string `json:"roomName" form:"roomName"`
	RoomType *int   `json:"roomType" form:"roomType"`
	Status   *int   `json:"status" form:"status"`
}

// DDZRoomConfigCreate 创建房间配置请求
type DDZRoomConfigCreate struct {
	RoomName       string  `json:"roomName" binding:"required"`
	RoomType       int     `json:"roomType" binding:"required"`
	BaseScore      int     `json:"baseScore" binding:"required"`
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
	RoomType       int     `json:"roomType"`
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

// DDZGameConfigSearch 游戏配置搜索请求
type DDZGameConfigSearch struct {
	request.PageInfo
	ConfigKey  string `json:"configKey" form:"configKey"`
	ConfigType string `json:"configType" form:"configType"`
}

// DDZGameConfigUpdate 更新游戏配置请求
type DDZGameConfigUpdate struct {
	ID          uint   `json:"ID" binding:"required"`
	ConfigKey   string `json:"configKey"`
	ConfigValue string `json:"configValue"`
	ConfigType  string `json:"configType"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}
