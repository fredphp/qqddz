// 自动生成模板SysUserAgreement
package example

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// SysUserAgreement 用户协议
type SysUserAgreement struct {
	global.GVA_MODEL
	Title   string `json:"title" form:"title" gorm:"column:title;comment:协议标题;" binding:"required"` // 协议标题
	Content string `json:"content" form:"content" gorm:"column:content;type:text;comment:协议内容;"`      // 协议内容
	Version string `json:"version" form:"version" gorm:"column:version;comment:版本号;"`                // 版本号
	Status  int    `json:"status" form:"status" gorm:"column:status;default:1;comment:状态(1:启用,0:禁用);"` // 状态
	Sort    int    `json:"sort" form:"sort" gorm:"column:sort;default:0;comment:排序;"`               // 排序
}

// TableName 用户协议 SysUserAgreement自定义表名 sys_user_agreement
func (SysUserAgreement) TableName() string {
	return "sys_user_agreement"
}
