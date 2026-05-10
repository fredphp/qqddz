package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZArenaGoldLogSearch 竞技场金币流水搜索请求
type DDZArenaGoldLogSearch struct {
        request.PageInfo
        PlayerID  NullUint64 `json:"playerId" form:"playerId"`
        PeriodNo  string     `json:"periodNo" form:"periodNo"`
        RoomID    NullUint64 `json:"roomId" form:"roomId"`
        StartDate string     `json:"startDate" form:"startDate"`
        EndDate   string     `json:"endDate" form:"endDate"`
        Reason    string     `json:"reason" form:"reason"`
}

// DDZArenaGoldLogCreate 创建竞技场金币流水请求
type DDZArenaGoldLogCreate struct {
        PeriodNo   string `json:"periodNo"`
        RoomID     uint64 `json:"roomId"`
        PlayerID   uint64 `json:"playerId" binding:"required"`
        MatchID    string `json:"matchId"`
        BeforeGold int64  `json:"beforeGold" binding:"required"`
        ChangeGold int64  `json:"changeGold" binding:"required"`
        AfterGold  int64  `json:"afterGold" binding:"required"`
        Reason     string `json:"reason"`
}
