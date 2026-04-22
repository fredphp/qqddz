package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"time"
)

type SysUserAgreementSearch struct {
	StartCreatedAt *time.Time `json:"startCreatedAt" form:"startCreatedAt"`
	EndCreatedAt   *time.Time `json:"endCreatedAt" form:"endCreatedAt"`
	Title          string     `json:"title" form:"title"`
	Version        string     `json:"version" form:"version"`
	Status         *int       `json:"status" form:"status"`
	request.PageInfo
}
