package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
)

// SysUserAgreementSearch 用户协议搜索请求
type SysUserAgreementSearch struct {
	request.PageInfo
	Title  string `json:"title" form:"title"`
	Status *int   `json:"status" form:"status"`
	Type   string `json:"type" form:"type"`
}

// SysUserAgreementCreate 创建用户协议请求
type SysUserAgreementCreate struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Version string `json:"version"`
	Status  int    `json:"status"`
	Sort    int    `json:"sort"`
	Type    string `json:"type"`
}

// SysUserAgreementUpdate 更新用户协议请求
type SysUserAgreementUpdate struct {
	ID      uint   `json:"id" binding:"required"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Version string `json:"version"`
	Status  *int   `json:"status"`
	Sort    *int   `json:"sort"`
	Type    string `json:"type"`
}

// SysUserAgreementStatus 更新状态请求
type SysUserAgreementStatus struct {
	ID     uint `json:"id" binding:"required"`
	Status int  `json:"status" binding:"oneof=0 1"`
}

// SysHelpArticleSearch 帮助文章搜索请求
type SysHelpArticleSearch struct {
	request.PageInfo
	Title  string `json:"title" form:"title"`
	Status *int   `json:"status" form:"status"`
}

// SysHelpArticleCreate 创建帮助文章请求
type SysHelpArticleCreate struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Sort    int    `json:"sort"`
	Status  int    `json:"status"`
}

// SysHelpArticleUpdate 更新帮助文章请求
type SysHelpArticleUpdate struct {
	ID      uint   `json:"id" binding:"required"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Sort    *int   `json:"sort"`
	Status  *int   `json:"status"`
}
