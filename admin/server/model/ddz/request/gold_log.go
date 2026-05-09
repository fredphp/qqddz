package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZGoldLogSearch 金币流水搜索请求
type DDZGoldLogSearch struct {
	request.PageInfo
	PlayerID   uint64 `json:"playerId" form:"playerId"`
	ChangeType *int   `json:"changeType" form:"changeType"`
	StartDate  string `json:"startDate" form:"startDate"`
	EndDate    string `json:"endDate" form:"endDate"`
}

// DDZArenaCoinLogSearch 竞技币流水搜索请求
type DDZArenaCoinLogSearch struct {
	request.PageInfo
	PlayerID   uint64 `json:"playerId" form:"playerId"`
	ChangeType *int   `json:"changeType" form:"changeType"`
	StartDate  string `json:"startDate" form:"startDate"`
	EndDate    string `json:"endDate" form:"endDate"`
}
