package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZRoomConfigSearch 房间配置搜索请求
type DDZRoomConfigSearch struct {
	request.PageInfo
	RoomType *int `json:"roomType" form:"roomType"`
	Status   *int `json:"status" form:"status"`
}

// DDZRoomConfigCreate 创建房间配置请求
type DDZRoomConfigCreate struct {
	Name        string `json:"name" binding:"required"`
	RoomType    int    `json:"roomType" binding:"required"`
	RoomLevel   int    `json:"roomLevel" binding:"required"`
	BaseScore   int    `json:"baseScore" binding:"required"`
	MinCoins    int64  `json:"minCoins"`
	MaxCoins    int64  `json:"maxCoins"`
	ServiceFee  int    `json:"serviceFee"`
	MaxMultiple int    `json:"maxMultiple"`
	Timeout     int    `json:"timeout"`
	AllowSpring int    `json:"allowSpring"`
	AllowBomb   int    `json:"allowBomb"`
	AllowRocket int    `json:"allowRocket"`
	Status      int    `json:"status"`
	Sort        int    `json:"sort"`
	Description string `json:"description"`
}

// DDZRoomConfigUpdate 更新房间配置请求
type DDZRoomConfigUpdate struct {
	ID          uint   `json:"ID" binding:"required"`
	Name        string `json:"name"`
	RoomType    int    `json:"roomType"`
	RoomLevel   int    `json:"roomLevel"`
	BaseScore   int    `json:"baseScore"`
	MinCoins    int64  `json:"minCoins"`
	MaxCoins    int64  `json:"maxCoins"`
	ServiceFee  int    `json:"serviceFee"`
	MaxMultiple int    `json:"maxMultiple"`
	Timeout     int    `json:"timeout"`
	AllowSpring int    `json:"allowSpring"`
	AllowBomb   int    `json:"allowBomb"`
	AllowRocket int    `json:"allowRocket"`
	Status      int    `json:"status"`
	Sort        int    `json:"sort"`
	Description string `json:"description"`
}

// DDZGameConfigSearch 游戏配置搜索请求
type DDZGameConfigSearch struct {
	request.PageInfo
	ConfigKey string `json:"configKey" form:"configKey"`
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
