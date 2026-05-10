package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// ArenaParticipationSearch 参赛记录搜索请求
type ArenaParticipationSearch struct {
        request.PageInfo
        SessionID    uint64 `json:"sessionId" form:"sessionId"`       // 会话ID
        PeriodNo     string `json:"periodNo" form:"periodNo"`         // 期号
        PlayerID     uint64 `json:"playerId" form:"playerId"`         // 玩家ID
        IsEliminated *uint8 `json:"isEliminated" form:"isEliminated"` // 是否淘汰
        StartDate    string `json:"startDate" form:"startDate"`       // 开始日期
        EndDate      string `json:"endDate" form:"endDate"`           // 结束日期
}

// TournamentRoundSearch 锦标赛轮次搜索请求
type TournamentRoundSearch struct {
        request.PageInfo
        SessionID uint64 `json:"sessionId" form:"sessionId" binding:"required"` // 会话ID
}

// TournamentEliminationSearch 锦标赛淘汰记录搜索请求
type TournamentEliminationSearch struct {
        request.PageInfo
        SessionID uint64 `json:"sessionId" form:"sessionId" binding:"required"` // 会话ID
        RoundNum  int    `json:"roundNum" form:"roundNum"`                      // 轮次
        PlayerID  uint64 `json:"playerId" form:"playerId"`                      // 玩家ID
}
