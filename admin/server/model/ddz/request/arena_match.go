package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZArenaSessionSearch 会话查询请求
type DDZArenaSessionSearch struct {
        request.PageInfo
        PeriodNo     string     `json:"periodNo" form:"periodNo"`
        RoomConfigID NullUint64 `json:"roomConfigId" form:"roomConfigId"`
        Status       *uint8     `json:"status" form:"status"`
}

// DDZArenaSignupLogSearch 报名日志查询请求
type DDZArenaSignupLogSearch struct {
        request.PageInfo
        PlayerID NullUint64 `json:"playerId" form:"playerId"`
        PeriodNo string     `json:"periodNo" form:"periodNo"`
        Action   *uint8     `json:"action" form:"action"`
}

// DDZArenaRoundRecordSearch 轮次记录查询请求
type DDZArenaRoundRecordSearch struct {
        request.PageInfo
        SessionID NullUint64 `json:"sessionId" form:"sessionId"`
        Status    *uint8     `json:"status" form:"status"`
}

// DDZArenaTableSearch 桌号查询请求
type DDZArenaTableSearch struct {
        request.PageInfo
        SessionID NullUint64 `json:"sessionId" form:"sessionId"`
        RoundID   NullUint64 `json:"roundId" form:"roundId"`
}
