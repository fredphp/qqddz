package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZGameRecordSearch 游戏记录搜索请求
type DDZGameRecordSearch struct {
        request.PageInfo
        GameID        string `json:"gameId" form:"gameId"`
        RoomID        string `json:"roomId" form:"roomId"`
        PlayerID      string `json:"playerId" form:"playerId"`
        Winner        *int   `json:"winner" form:"winner"`
        RoomType      *int   `json:"roomType" form:"roomType"`
        RoomCategory  *int   `json:"roomCategory" form:"roomCategory"`
        Result        *int   `json:"result" form:"result"`
        StartTime     string `json:"startTime" form:"startTime"`
        EndTime       string `json:"endTime" form:"endTime"`
        Spring        *int   `json:"spring" form:"spring"`
        MinDuration   int    `json:"minDuration" form:"minDuration"`
        MaxDuration   int    `json:"maxDuration" form:"maxDuration"`
        Month         string `json:"month" form:"month"`         // 月份筛选，格式: 202401，默认当月
}

// DDZGameRecordDetail 游戏记录详情请求
type DDZGameRecordDetail struct {
        ID    uint   `json:"ID" form:"ID" binding:"required"`
        Month string `json:"month" form:"month"` // 月份筛选，格式: 202401
}
