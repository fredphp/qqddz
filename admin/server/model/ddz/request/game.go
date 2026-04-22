package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZGameRecordSearch 游戏记录搜索请求
type DDZGameRecordSearch struct {
	request.PageInfo
	RoomID     string `json:"roomId" form:"roomId"`
	PlayerID   string `json:"playerId" form:"playerId"`
	Winner     *int   `json:"winner" form:"winner"`
	RoomType   *int   `json:"roomType" form:"roomType"`
	StartTime  string `json:"startTime" form:"startTime"`
	EndTime    string `json:"endTime" form:"endTime"`
	Spring     *int   `json:"spring" form:"spring"`
	MinDuration int   `json:"minDuration" form:"minDuration"`
	MaxDuration int   `json:"maxDuration" form:"maxDuration"`
}

// DDZGameRecordDetail 游戏记录详情请求
type DDZGameRecordDetail struct {
	ID uint `json:"ID" form:"ID" binding:"required"`
}
