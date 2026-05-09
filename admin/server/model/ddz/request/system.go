package ddz

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZTournamentRoundSearch 锦标赛轮次查询请求
type DDZTournamentRoundSearch struct {
	request.PageInfo
	SessionID uint64 `json:"sessionId" form:"sessionId"`
	Status    *uint8 `json:"status" form:"status"`
}

// DDZTournamentEliminationSearch 锦标赛淘汰记录查询请求
type DDZTournamentEliminationSearch struct {
	request.PageInfo
	SessionID uint64 `json:"sessionId" form:"sessionId"`
	RoundID   uint64 `json:"roundId" form:"roundId"`
	PlayerID  uint64 `json:"playerId" form:"playerId"`
}

// DDZPendingGameDataSearch 待处理数据查询请求
type DDZPendingGameDataSearch struct {
	request.PageInfo
	DataType string `json:"dataType" form:"dataType"`
	Status   *uint8 `json:"status" form:"status"`
}

// DDZWriteQueueErrorLogSearch 写入队列错误日志查询请求
type DDZWriteQueueErrorLogSearch struct {
	request.PageInfo
	QueueName string `json:"queueName" form:"queueName"`
	Status    *uint8 `json:"status" form:"status"`
}
