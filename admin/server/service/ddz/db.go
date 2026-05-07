package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "go.uber.org/zap"
        "gorm.io/gorm"
)

// GetDDZDB 获取DDZ数据库连接
// 使用 ddz-game 数据库配置（连接 ddz_game 数据库）
func GetDDZDB() *gorm.DB {
        // 优先尝试使用 ddz-game 数据库配置
        db := global.GetGlobalDBByDBName("ddz-game")
        if db != nil {
                global.GVA_LOG.Debug("GetDDZDB: 使用 ddz-game 数据库连接")
                return db
        }
        // 如果 ddz-game 数据库连接不存在，使用主数据库
        global.GVA_LOG.Warn("GetDDZDB: ddz-game 数据库连接不存在，使用主数据库连接", 
                zap.String("主数据库", global.GVA_CONFIG.Mysql.Dbname))
        return global.GVA_DB
}
