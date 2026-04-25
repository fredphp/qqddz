package initialize

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
)

func bizModel() error {
	// 使用 ddz-game 数据库连接（配置在 config.yaml 的 db-list 中）
	db := global.GetGlobalDBByDBName("ddz-game")
	if db == nil {
		// 如果未配置 ddz-game 数据库，使用默认数据库
		db = global.GVA_DB
	}

	// 禁用外键约束检查
	db.Exec("SET FOREIGN_KEY_CHECKS = 0;")

	// 删除 ddz_game_records 表的所有外键约束
	var foreignKeys []string
	db.Raw(`
		SELECT CONSTRAINT_NAME
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'ddz_game_records'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY'
	`).Scan(&foreignKeys)

	for _, fk := range foreignKeys {
		db.Exec("ALTER TABLE `ddz_game_records` DROP FOREIGN KEY `" + fk + "`")
	}

	// 删除 ddz_game_player_records 表的所有外键约束
	db.Raw(`
		SELECT CONSTRAINT_NAME
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'ddz_game_player_records'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY'
	`).Scan(&foreignKeys)

	for _, fk := range foreignKeys {
		db.Exec("ALTER TABLE `ddz_game_player_records` DROP FOREIGN KEY `" + fk + "`")
	}

	// 删除 ddz_game_play_records 表的所有外键约束
	db.Raw(`
		SELECT CONSTRAINT_NAME
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'ddz_game_play_records'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY'
	`).Scan(&foreignKeys)

	for _, fk := range foreignKeys {
		db.Exec("ALTER TABLE `ddz_game_play_records` DROP FOREIGN KEY `" + fk + "`")
	}

	// 删除 ddz_deal_records 表的所有外键约束
	db.Raw(`
		SELECT CONSTRAINT_NAME
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'ddz_deal_records'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY'
	`).Scan(&foreignKeys)

	for _, fk := range foreignKeys {
		db.Exec("ALTER TABLE `ddz_deal_records` DROP FOREIGN KEY `" + fk + "`")
	}

	// 删除 ddz_player_online 表的所有外键约束
	db.Raw(`
		SELECT CONSTRAINT_NAME
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'ddz_player_online'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY'
	`).Scan(&foreignKeys)

	for _, fk := range foreignKeys {
		db.Exec("ALTER TABLE `ddz_player_online` DROP FOREIGN KEY `" + fk + "`")
	}

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
