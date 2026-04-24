package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"gorm.io/gorm"
)

// GetDDZDB 获取DDZ数据库连接
// 优先使用配置的 ddz-game 数据库，如果未配置则使用默认数据库
func GetDDZDB() *gorm.DB {
	db := global.GetGlobalDBByDBName("ddz-game")
	if db == nil {
		db = global.GVA_DB
	}
	return db
}
