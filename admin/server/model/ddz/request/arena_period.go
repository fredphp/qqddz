package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// ArenaPeriodSearch 期号搜索请求
type ArenaPeriodSearch struct {
        request.PageInfo
        PeriodNo   string `json:"periodNo" form:"periodNo"`     // 期号
        RoomID     uint64 `json:"roomId" form:"roomId"`         // 房间ID
        Status     *int   `json:"status" form:"status"`         // 状态
        StartDate  string `json:"startDate" form:"startDate"`   // 开始日期
        EndDate    string `json:"endDate" form:"endDate"`       // 结束日期
        RoomType   *int   `json:"roomType" form:"roomType"`     // 房间类型(1初级/2中级/3高级/4专家)
}

// ArenaPeriodCreate 创建期号请求
type ArenaPeriodCreate struct {
        RoomID          uint64 `json:"roomId" binding:"required"`          // 房间ID
        RoomConfigID    uint64 `json:"roomConfigId" binding:"required"`    // 房间配置ID
        PeriodIndex     int    `json:"periodIndex"`                        // 场次号
        StartTime       string `json:"startTime" binding:"required"`       // 开始时间
        SignupStartTime string `json:"signupStartTime" binding:"required"` // 报名开始时间
        SignupEndTime   string `json:"signupEndTime" binding:"required"`   // 报名结束时间
        EndTime         string `json:"endTime" binding:"required"`         // 结束时间
}

// ArenaPeriodUpdate 更新期号请求
type ArenaPeriodUpdate struct {
        ID              uint64 `json:"ID" binding:"required"`    // 主键ID
        Status          *uint8 `json:"status"`                   // 状态
        TotalSignup     *int   `json:"totalSignup"`              // 报名总人数
        TotalCancel     *int   `json:"totalCancel"`              // 取消报名人数
        FinalPlayers    *int   `json:"finalPlayers"`             // 最终参赛人数
}

// ArenaPeriodDelete 删除期号请求
type ArenaPeriodDelete struct {
        ID uint64 `json:"ID" binding:"required"` // 主键ID
}

// ArenaPeriodPlayerSearch 期号玩家搜索请求
type ArenaPeriodPlayerSearch struct {
        request.PageInfo
        PeriodID uint64 `json:"periodId" form:"periodId" binding:"required"` // 期号ID
        Status   *int   `json:"status" form:"status"`                        // 状态
}

// ArenaPeriodSignupLogSearch 期号报名日志搜索请求
type ArenaPeriodSignupLogSearch struct {
        request.PageInfo
        PeriodID   uint64 `json:"periodId" form:"periodId"`     // 期号ID
        PlayerID   uint64 `json:"playerId" form:"playerId"`     // 玩家ID
        ActionType *int   `json:"actionType" form:"actionType"` // 操作类型
}

// ArenaPeriodLeaderboardSearch 期数排行榜搜索请求
type ArenaPeriodLeaderboardSearch struct {
        PeriodID uint64 `json:"periodId" form:"periodId" binding:"required"` // 期号ID
        Limit    int    `json:"limit" form:"limit"`                         // 限制返回数量，默认50
}
