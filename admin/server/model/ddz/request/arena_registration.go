package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZArenaRegister 竞技场报名请求
type DDZArenaRegister struct {
	PlayerID   uint64 `json:"playerId" binding:"required"`
	ArenaLevel int    `json:"arenaLevel" binding:"required,min=1,max=3"` // 1-初级场,2-中级场,3-高级场
}

// DDZArenaCancel 竞技场取消报名请求
type DDZArenaCancel struct {
	PlayerID uint64 `json:"playerId" binding:"required"`
}

// DDZArenaRegistrationSearch 竞技场报名记录搜索请求
type DDZArenaRegistrationSearch struct {
	request.PageInfo
	PlayerID   uint64 `json:"playerId" form:"playerId"`
	ArenaLevel *int   `json:"arenaLevel" form:"arenaLevel"`
	Status     *int   `json:"status" form:"status"`
}

// DDZArenaStatus 查询玩家报名状态请求
type DDZArenaStatus struct {
	PlayerID uint64 `json:"playerId" binding:"required"`
}
