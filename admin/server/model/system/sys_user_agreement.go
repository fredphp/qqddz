package system

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// SysUserAgreement 用户协议/单页管理表
type SysUserAgreement struct {
	global.GVA_MODEL
	Title   string         `json:"title" gorm:"comment:标题;type:varchar(255)"`
	Content string         `json:"content" gorm:"comment:内容;type:longtext"`
	Version string         `json:"version" gorm:"comment:版本号;type:varchar(50)"`
	Status  int            `json:"status" gorm:"comment:状态 0-禁用 1-启用;default:1"`
	Sort    int            `json:"sort" gorm:"comment:排序;default:0"`
	Type    string         `json:"type" gorm:"comment:类型 user_agreement-用户协议 help-帮助中心 privacy-隐私政策;type:varchar(50);default:'user_agreement'"`
}

// TableName 指定表名
func (SysUserAgreement) TableName() string {
	return "sys_user_agreement"
}

// SysHelpArticle 帮助文章表（使用相同的表，通过type区分）
type SysHelpArticle struct {
	global.GVA_MODEL
	Title   string         `json:"title" gorm:"comment:标题;type:varchar(255)"`
	Content string         `json:"content" gorm:"comment:内容;type:longtext"`
	Version string         `json:"version" gorm:"comment:版本号;type:varchar(50)"`
	Status  int            `json:"status" gorm:"comment:状态 0-禁用 1-启用;default:1"`
	Sort    int            `json:"sort" gorm:"comment:排序;default:0"`
	Type    string         `json:"type" gorm:"comment:类型;type:varchar(50);default:'help'"`
}

// TableName 指定表名
func (SysHelpArticle) TableName() string {
	return "sys_user_agreement"
}

// SysUserAgreementResponse 用户协议响应
type SysUserAgreementResponse struct {
	ID        uint            `json:"id"`
	CreatedAt time.Time       `json:"createdAt"`
	UpdatedAt time.Time       `json:"updatedAt"`
	Title     string          `json:"title"`
	Content   string          `json:"content"`
	Version   string          `json:"version"`
	Status    int             `json:"status"`
	Sort      int             `json:"sort"`
	Type      string          `json:"type"`
}

// ToResponse 转换为响应结构
func (s *SysUserAgreement) ToResponse() *SysUserAgreementResponse {
	return &SysUserAgreementResponse{
		ID:        s.ID,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
		Title:     s.Title,
		Content:   s.Content,
		Version:   s.Version,
		Status:    s.Status,
		Sort:      s.Sort,
		Type:      s.Type,
	}
}

// Decimal 类型别名（用于兼容）
type Decimal = decimal.Decimal
