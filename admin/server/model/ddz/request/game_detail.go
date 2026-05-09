package ddz

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZGameConfigSearch 游戏配置查询请求
type DDZGameConfigSearch struct {
	request.PageInfo
	ConfigKey string `json:"configKey" form:"configKey"`
}

// DDZGameConfigCreate 创建游戏配置请求
type DDZGameConfigCreate struct {
	ConfigKey   string `json:"configKey" binding:"required"`
	ConfigValue string `json:"configValue"`
	Description string `json:"description"`
}

// DDZGameConfigUpdate 更新游戏配置请求
type DDZGameConfigUpdate struct {
	ID          uint64 `json:"id" binding:"required"`
	ConfigKey   string `json:"configKey"`
	ConfigValue string `json:"configValue"`
	Description string `json:"description"`
}

// DDZGamePlayerRecordSearch 游戏玩家记录查询请求
type DDZGamePlayerRecordSearch struct {
	request.PageInfo
	GameID   string `json:"gameId" form:"gameId"`
	PlayerID uint64 `json:"playerId" form:"playerId"`
}

// DDZGamePlayRecordSearch 出牌记录查询请求
type DDZGamePlayRecordSearch struct {
	request.PageInfo
	GameID   string `json:"gameId" form:"gameId"`
	PlayerID uint64 `json:"playerId" form:"playerId"`
	PlayType *uint8 `json:"playType" form:"playType"`
}

// DDZDealRecordSearch 发牌记录查询请求
type DDZDealRecordSearch struct {
	request.PageInfo
	GameID   string `json:"gameId" form:"gameId"`
	PlayerID uint64 `json:"playerId" form:"playerId"`
}
