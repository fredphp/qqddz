package initialize

import (
        "strings"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        "go.uber.org/zap"
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

// dropIndex 删除指定索引（如果存在）
func dropIndex(db *gorm.DB, tableName, indexName string) {
        var count int
        err := db.Raw(`
                SELECT COUNT(*)
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ?
                AND INDEX_NAME = ?
        `, tableName, indexName).Scan(&count).Error

        if err != nil {
                global.GVA_LOG.Warn("check index failed", zap.String("table", tableName), zap.String("index", indexName), zap.Error(err))
                return
        }

        if count > 0 {
                if err := db.Exec("ALTER TABLE `" + tableName + "` DROP INDEX `" + indexName + "`").Error; err != nil {
                        global.GVA_LOG.Warn("drop index failed", zap.String("table", tableName), zap.String("index", indexName), zap.Error(err))
                }
        }
}

// cleanEmptyUniqueFields 清理唯一索引字段的空字符串，改为 NULL
func cleanEmptyUniqueFields(db *gorm.DB) {
        // 将 wx_open_id 的空字符串改为 NULL（NULL 不参与唯一约束）
        db.Exec("UPDATE `ddz_user_accounts` SET `wx_open_id` = NULL WHERE `wx_open_id` = ''")
        // 将 phone 的空字符串改为 NULL
        db.Exec("UPDATE `ddz_user_accounts` SET `phone` = NULL WHERE `phone` = ''")
        // 将 wx_union_id 的空字符串改为 NULL
        db.Exec("UPDATE `ddz_user_accounts` SET `wx_union_id` = NULL WHERE `wx_union_id` = ''")
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
        dropForeignKeys(db, "ddz_user_accounts")

        // 删除可能冲突的唯一索引
        dropIndex(db, "ddz_user_accounts", "idx_ddz_user_accounts_wx_open_id")
        dropIndex(db, "ddz_user_accounts", "idx_ddz_user_accounts_phone")
        dropIndex(db, "ddz_user_accounts", "idx_ddz_user_accounts_player_id")
        // 删除 ddz_daily_stats 表的冲突索引（之前可能手动创建过，或 GORM 自动生成）
        dropIndex(db, "ddz_daily_stats", "idx_ddz_daily_stats_date")
        dropIndex(db, "ddz_daily_stats", "idx_ddz_daily_stats_stat_date")
        dropIndex(db, "ddz_daily_stats", "stat_date") // 可能的唯一约束名
        dropIndex(db, "ddz_daily_stats", "uni_ddz_daily_stats_stat_date") // 可能的唯一索引名

        // 清理空字符串，改为 NULL
        cleanEmptyUniqueFields(db)

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
                // 机器人配置
                ddz.DDZRobotConfig{},
                // 玩家状态日志
                ddz.DDZPlayerStatusLog{},
                // 货币日志
                ddz.DDZGoldLog{},
                ddz.DDZDiamondLog{},
                ddz.DDZArenaCoinLog{},
                // 广告奖励
                ddz.DDZAdReward{},
        )

        // 重新启用外键约束检查
        db.Exec("SET FOREIGN_KEY_CHECKS = 1;")

        if err != nil {
                // 如果只是索引重复错误，只记录警告但不返回错误
                if strings.Contains(err.Error(), "Duplicate key name") {
                        global.GVA_LOG.Warn("index already exists, skipping", zap.Error(err))
                        return nil
                }
                return err
        }
        return nil
}
