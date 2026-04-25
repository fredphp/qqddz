package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "gorm.io/gorm"
)

// GetDDZDB 获取DDZ数据库连接
// 使用主数据库（hlddz），因为游戏服务器也将数据写入该数据库
func GetDDZDB() *gorm.DB {
        // 优先尝试使用 ddz-game 数据库配置
        db := global.GetGlobalDBByDBName("ddz-game")
        if db != nil {
                return db
        }
        // 使用主数据库（游戏服务器配置的数据库名称）
        return global.GVA_DB
}
