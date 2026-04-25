package initialize

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        "gorm.io/gorm"
)

// dropForeignKeys 删除指定表的所有外键约束
func dropForeignKeys(db *gorm.DB, tableName string) {
        var foreignKeys []string
        db.Raw(`
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ?
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        `, tableName).Scan(&foreignKeys)

        for _, fk := range foreignKeys {
                db.Exec("ALTER TABLE `" + tableName + "` DROP FOREIGN KEY `" + fk + "`")
        }
}

// dropDuplicateIndex 删除重复索引（如果存在）
func dropDuplicateIndex(db *gorm.DB, tableName, indexName string) {
        var count int
        db.Raw(`
                SELECT COUNT(*)
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ?
                AND INDEX_NAME = ?
        `, tableName, indexName).Scan(&count)

        if count > 0 {
                db.Exec("ALTER TABLE `" + tableName + "` DROP INDEX `" + indexName + "`")
        }
}

func bizModel() error {
        // 使用 ddz-game 数据库连接（配置在 config.yaml 的 db-list 中）
        db := global.GetGlobalDBByDBName("ddz-game")
        if db == nil {
                // 如果未配置 ddz-game 数据库，使用默认数据库
                db = global.GVA_DB
        }

        // 禁用外键约束检查
        db.Exec("SET FOREIGN_KEY_CHECKS = 0;")

        // 删除相关表的外键约束
        dropForeignKeys(db, "ddz_game_records")
        dropForeignKeys(db, "ddz_game_player_records")
        dropForeignKeys(db, "ddz_game_play_records")
        dropForeignKeys(db, "ddz_deal_records")
        dropForeignKeys(db, "ddz_player_online")

        // 删除重复索引
        dropDuplicateIndex(db, "ddz_user_accounts", "idx_ddz_user_accounts_wx_open_id")

        err := db.AutoMigrate(
                ddz.DDZPlayer{},
                ddz.DDZPlayerOnline{},
                ddz.DDZGameRecord{},
                ddz.DDZGamePlayerRecord{},
                ddz.DDZGamePlayRecord{},
                ddz.DDZDealRecord{},
                ddz.DDZPlayerStats{},
                ddz.DDZDailyStats{},
                ddz.DDZLeaderboard{},
                ddz.DDZRoomConfig{},
                ddz.DDZGameConfig{},
                ddz.DDZUserAccount{},
                ddz.DDZLoginLog{},
                ddz.DDZSmsCode{},
                // 新增游戏日志模型
                ddz.DDZBidLog{},
                ddz.DDZDealLog{},
                ddz.DDZPlayLog{},
                ddz.DDZPlayerStat{},
        )

        // 重新启用外键约束检查
        db.Exec("SET FOREIGN_KEY_CHECKS = 1;")

        if err != nil {
                return err
        }
        return nil
}
