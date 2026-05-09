// Package database 提供分表管理功能
package database

import (
        "fmt"
        "log"
        "sync"
        "time"

        "gorm.io/gorm"
)

// PartitionManager 分表管理器
type PartitionManager struct {
        db            *gorm.DB
        createdTables sync.Map // 已创建的分表缓存（线程安全）
}

// 分表相关常量
const (
        // 分表类型
        PartitionTypeRoom        = "room"         // 房间表分表
        PartitionTypeGameRecord  = "game_record"  // 游戏记录表分表
        PartitionTypePlayLog     = "play_log"     // 出牌日志表分表
        PartitionTypeDealLog     = "deal_log"     // 发牌日志表分表
        PartitionTypeBidLog      = "bid_log"      // 叫地主日志表分表
        PartitionTypeLoginLog    = "login_log"    // 登录日志表分表
        PartitionTypeArenaCoinLog = "arena_coin_log" // 竞技币流水表分表
        PartitionTypeArenaPeriod = "arena_period"    // 竞技场期号表分表
        PartitionTypeArenaSignupLog = "arena_signup_log" // 竞技场报名日志表分表
        PartitionTypeArenaPeriodPlayer = "arena_period_player" // 竞技场期号玩家表分表
        PartitionTypeArenaGoldLog = "arena_gold_log" // 🔧【新增】竞技场金币流水表分表
        // 🔧【新增】以下三个表按月分表
        PartitionTypeArenaParticipation    = "arena_participation"     // 竞技场参赛记录表分表
        PartitionTypeTournamentRound       = "tournament_round"        // 锦标赛轮次表分表
        PartitionTypeTournamentElimination = "tournament_elimination"  // 锦标赛淘汰记录表分表
)

// partitionManager 分表管理器单例
var partitionManager *PartitionManager
var partitionOnce sync.Once

// GetPartitionManager 获取分表管理器单例
func GetPartitionManager() *PartitionManager {
        partitionOnce.Do(func() {
                partitionManager = &PartitionManager{}
        })
        return partitionManager
}

// Init 初始化分表管理器
func (pm *PartitionManager) Init(db *gorm.DB) error {
        pm.db = db

        // 初始化时创建当月和下月的分表
        now := time.Now()

        // 创建当月分表
        if err := pm.createMonthTables(now); err != nil {
                return fmt.Errorf("创建当月分表失败: %w", err)
        }

        // 创建下月分表
        nextMonth := now.AddDate(0, 1, 0)
        if err := pm.createMonthTables(nextMonth); err != nil {
                return fmt.Errorf("创建下月分表失败: %w", err)
        }

        log.Println("✅ 分表管理器初始化完成")
        return nil
}

// createMonthTables 创建指定月份的所有分表
func (pm *PartitionManager) createMonthTables(t time.Time) error {
        suffix := t.Format("200601") // 格式: 202401

        // 创建房间分表
        if err := pm.createRoomTable(suffix); err != nil {
                return err
        }

        // 创建游戏记录分表
        if err := pm.createGameRecordTable(suffix); err != nil {
                return err
        }

        // 创建出牌日志分表
        if err := pm.createPlayLogTable(suffix); err != nil {
                return err
        }

        // 创建发牌日志分表
        if err := pm.createDealLogTable(suffix); err != nil {
                return err
        }

        // 创建叫地主日志分表
        if err := pm.createBidLogTable(suffix); err != nil {
                return err
        }

        // 创建登录日志分表
        if err := pm.createLoginLogTable(suffix); err != nil {
                return err
        }

        // 创建竞技币流水分表
        if err := pm.createArenaCoinLogTable(suffix); err != nil {
                return err
        }

        // 创建竞技场期号分表
        if err := pm.createArenaPeriodTable(suffix); err != nil {
                return err
        }

        // 创建竞技场报名日志分表
        if err := pm.createArenaSignupLogTable(suffix); err != nil {
                return err
        }

        // 创建竞技场期号玩家分表
        if err := pm.createArenaPeriodPlayerTable(suffix); err != nil {
                return err
        }

        // 创建竞技场金币流水分表
        if err := pm.createArenaGoldLogTable(suffix); err != nil {
                return err
        }

        // 🔧【新增】创建竞技场参赛记录分表
        if err := pm.createArenaParticipationTable(suffix); err != nil {
                return err
        }

        // 🔧【新增】创建锦标赛轮次分表
        if err := pm.createTournamentRoundTable(suffix); err != nil {
                return err
        }

        // 🔧【新增】创建锦标赛淘汰记录分表
        if err := pm.createTournamentEliminationTable(suffix); err != nil {
                return err
        }

        return nil
}

// getTableName 获取分表名称
func (pm *PartitionManager) getTableName(baseTable, suffix string) string {
        return fmt.Sprintf("%s_%s", baseTable, suffix)
}

// isTableExists 检查表是否存在
func (pm *PartitionManager) isTableExists(tableName string) bool {
        // 先检查缓存（sync.Map 是线程安全的）
        if _, exists := pm.createdTables.Load(tableName); exists {
                return true
        }

        // 检查数据库
        var count int64
        pm.db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)

        exists := count > 0
        if exists {
                pm.createdTables.Store(tableName, true)
        }
        return exists
}

// createRoomTable 创建房间分表
func (pm *PartitionManager) createRoomTable(suffix string) error {
        tableName := pm.getTableName("ddz_rooms", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                         id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '房间ID',
                        room_code varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
                        room_name varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间名称',
                        room_config_id bigint unsigned NOT NULL DEFAULT 0 COMMENT '房间配置ID',
                        room_type tinyint unsigned NOT NULL DEFAULT 1 COMMENT '房间类型',
                        room_category tinyint unsigned NOT NULL DEFAULT 1 COMMENT '房间分类',
                        creator_id bigint unsigned NOT NULL COMMENT '创建者玩家ID',
                        player_count int NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
                        max_players int NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
                        status tinyint unsigned NOT NULL DEFAULT 1 COMMENT '状态:0-已关闭,1-等待中,2-游戏中,3-已结束',
                        base_score int NOT NULL DEFAULT 1 COMMENT '底分',
                        multiplier int NOT NULL DEFAULT 1 COMMENT '倍数',
                        player1_id bigint unsigned DEFAULT NULL COMMENT '玩家1 ID',
                        player2_id bigint unsigned DEFAULT NULL COMMENT '玩家2 ID',
                        player3_id bigint unsigned DEFAULT NULL COMMENT '玩家3 ID',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        ended_at datetime DEFAULT NULL COMMENT '结束时间',
                        PRIMARY KEY (id),
                        UNIQUE KEY idx_room_code (room_code),
                        KEY idx_creator_id (creator_id),
                        KEY idx_status (status),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建房间分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建房间分表: %s", tableName)
        return nil
}

// createGameRecordTable 创建游戏记录分表
func (pm *PartitionManager) createGameRecordTable(suffix string) error {
        tableName := pm.getTableName("ddz_game_records", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
                        game_id varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
                        room_id varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
                        room_code varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
                        room_type tinyint unsigned NOT NULL DEFAULT 1 COMMENT '房间类型',
                        room_category tinyint unsigned NOT NULL DEFAULT 1 COMMENT '房间分类',
                        landlord_id bigint unsigned NOT NULL COMMENT '地主玩家ID',
                        farmer1_id bigint unsigned NOT NULL COMMENT '农民1玩家ID',
                        farmer2_id bigint unsigned NOT NULL COMMENT '农民2玩家ID',
                        base_score int NOT NULL DEFAULT 1 COMMENT '底分',
                        multiplier int NOT NULL DEFAULT 1 COMMENT '最终倍数',
                        bomb_count int NOT NULL DEFAULT 0 COMMENT '炸弹数量',
                        spring tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否春天:0-否,1-地主春天,2-反春天',
                        result tinyint unsigned NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
                        landlord_win_gold bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
                        farmer1_win_gold bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
                        farmer2_win_gold bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
                        landlord_win_arena_coin bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
                        farmer1_win_arena_coin bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
                        farmer2_win_arena_coin bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
                        started_at datetime NOT NULL COMMENT '开始时间',
                        ended_at datetime DEFAULT NULL COMMENT '结束时间',
                        duration_seconds int NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        UNIQUE KEY idx_game_id (game_id),
                        KEY idx_room_id (room_id),
                        KEY idx_room_code (room_code),
                        KEY idx_landlord_id (landlord_id),
                        KEY idx_farmer1_id (farmer1_id),
                        KEY idx_farmer2_id (farmer2_id),
                        KEY idx_started_at (started_at),
                        KEY idx_result (result)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建游戏记录分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建游戏记录分表: %s", tableName)
        return nil
}

// createPlayLogTable 创建出牌日志分表
func (pm *PartitionManager) createPlayLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_play_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                        game_id varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        player_role tinyint unsigned NOT NULL COMMENT '玩家角色:1-地主,2-农民',
                        round_num int NOT NULL COMMENT '回合数',
                        play_order int NOT NULL COMMENT '本回合出牌顺序',
                        play_type tinyint unsigned NOT NULL COMMENT '出牌类型:1-出牌,2-不出,3-超时',
                        cards varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '出的牌',
                        cards_count int NOT NULL DEFAULT 0 COMMENT '出牌数量',
                        card_pattern varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '牌型',
                        is_bomb tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否炸弹',
                        is_rocket tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否火箭',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_game_id (game_id),
                        KEY idx_player_id (player_id),
                        KEY idx_round_num (round_num),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出牌日志表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建出牌日志分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建出牌日志分表: %s", tableName)
        return nil
}

// createDealLogTable 创建发牌日志分表
func (pm *PartitionManager) createDealLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_deal_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                        game_id varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        player_role tinyint unsigned NOT NULL COMMENT '玩家角色:1-地主,2-农民',
                        hand_cards varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌',
                        cards_count int NOT NULL DEFAULT 0 COMMENT '手牌数量',
                        landlord_cards varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '底牌',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_game_id (game_id),
                        KEY idx_player_id (player_id),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发牌日志表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建发牌日志分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建发牌日志分表: %s", tableName)
        return nil
}

// createBidLogTable 创建叫地主日志分表
func (pm *PartitionManager) createBidLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_bid_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                        game_id varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        bid_order int NOT NULL COMMENT '叫地主顺序',
                        bid_type tinyint unsigned NOT NULL COMMENT '叫地主类型:0-不叫,1-叫,2-抢',
                        bid_score int NOT NULL DEFAULT 0 COMMENT '叫分',
                        is_success tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否成功',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_game_id (game_id),
                        KEY idx_player_id (player_id),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='叫地主日志表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建叫地主日志分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建叫地主日志分表: %s", tableName)
        return nil
}

// createLoginLogTable 创建登录日志分表
func (pm *PartitionManager) createLoginLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_login_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        account_id bigint unsigned DEFAULT NULL COMMENT '账户ID',
                        login_type tinyint unsigned NOT NULL COMMENT '登录类型',
                        login_result tinyint unsigned NOT NULL COMMENT '登录结果',
                        fail_reason varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '失败原因',
                        ip varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录IP',
                        device_id varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备ID',
                        device_type varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备类型',
                        user_agent varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User-Agent',
                        location varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录地点',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_player_id (player_id),
                        KEY idx_account_id (account_id),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建登录日志分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建登录日志分表: %s", tableName)
        return nil
}

// createArenaCoinLogTable 创建竞技币流水分表
func (pm *PartitionManager) createArenaCoinLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_coin_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        change_amount bigint NOT NULL COMMENT '变化金额',
                        balance_after bigint NOT NULL COMMENT '变化后余额',
                        change_type tinyint unsigned NOT NULL COMMENT '变化类型',
                        related_id varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '关联ID',
                        remark varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_player_id (player_id),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技币流水表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技币流水分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技币流水分表: %s", tableName)
        return nil
}

// createArenaPeriodTable 创建竞技场期号分表
func (pm *PartitionManager) createArenaPeriodTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_periods", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                        period_no varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号(格式J202605060001,14位)',
                        room_id bigint unsigned NOT NULL COMMENT '房间ID',
                        room_config_id bigint unsigned NOT NULL COMMENT '房间配置ID',
                        period_index int NOT NULL DEFAULT 1 COMMENT '当日场次号(1-9999)',
                        start_time datetime NOT NULL COMMENT '期号开始时间',
                        signup_start_time datetime NOT NULL COMMENT '报名开始时间',
                        signup_end_time datetime NOT NULL COMMENT '报名截止时间',
                        end_time datetime NOT NULL COMMENT '期号结束时间',
                        total_signup int NOT NULL DEFAULT 0 COMMENT '报名总人数',
                        total_cancel int NOT NULL DEFAULT 0 COMMENT '取消报名人数',
                        final_players int NOT NULL DEFAULT 0 COMMENT '最终参赛人数',
                        status tinyint unsigned NOT NULL DEFAULT 0 COMMENT '状态:0-准备中,1-报名中,2-等待开赛,3-比赛进行中,4-已结束,5-已取消',
                        session_id bigint unsigned DEFAULT NULL COMMENT '关联会话ID(开赛后填写)',
                        processed_at datetime DEFAULT NULL COMMENT '数据处理完成时间',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        PRIMARY KEY (id),
                        UNIQUE KEY idx_period_no (period_no),
                        KEY idx_room_id (room_id),
                        KEY idx_room_config_id (room_config_id),
                        KEY idx_status (status),
                        KEY idx_start_time (start_time),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场期号表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技场期号分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技场期号分表: %s", tableName)
        return nil
}

// createArenaSignupLogTable 创建竞技场报名日志分表
func (pm *PartitionManager) createArenaSignupLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_signup_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                        period_no varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
                        period_id bigint unsigned NOT NULL COMMENT '期号记录ID',
                        room_id bigint unsigned NOT NULL COMMENT '房间ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        action_type tinyint unsigned NOT NULL COMMENT '操作类型:1-报名,2-取消',
                        signup_fee bigint NOT NULL DEFAULT 0 COMMENT '报名费',
                        balance_before bigint NOT NULL DEFAULT 0 COMMENT '操作前竞技币余额',
                        balance_after bigint NOT NULL DEFAULT 0 COMMENT '操作后竞技币余额',
                        remark varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_period_no (period_no),
                        KEY idx_period_id (period_id),
                        KEY idx_room_id (room_id),
                        KEY idx_player_id (player_id),
                        KEY idx_action_type (action_type),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场报名日志表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技场报名日志分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技场报名日志分表: %s", tableName)
        return nil
}

// createArenaPeriodPlayerTable 创建竞技场期号玩家分表
func (pm *PartitionManager) createArenaPeriodPlayerTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_period_players", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                        period_no varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
                        period_id bigint unsigned NOT NULL COMMENT '期号记录ID',
                        room_id bigint unsigned NOT NULL COMMENT '房间ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        signup_time datetime NOT NULL COMMENT '报名时间',
                        signup_order int NOT NULL DEFAULT 0 COMMENT '报名顺序',
                        signup_fee bigint NOT NULL DEFAULT 0 COMMENT '报名费',
                        status tinyint unsigned NOT NULL DEFAULT 1 COMMENT '状态:1-正常,2-取消,3-超时未进入',
                        arena_gold bigint NOT NULL DEFAULT 0 COMMENT '当期赛事金币',
                        is_eliminated tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
                        eliminated_round int DEFAULT NULL COMMENT '淘汰轮次',
                        rank_no int DEFAULT NULL COMMENT '最终排名',
                        player_status tinyint unsigned NOT NULL DEFAULT 0 COMMENT '玩家状态:0-报名,1-比赛中,2-淘汰,3-晋级,4-结束',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        PRIMARY KEY (id),
                        KEY idx_period_no (period_no),
                        KEY idx_period_id (period_id),
                        KEY idx_room_id (room_id),
                        KEY idx_player_id (player_id),
                        KEY idx_status (status),
                        KEY idx_player_status (player_status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场期号玩家表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技场期号玩家分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技场期号玩家分表: %s", tableName)
        return nil
}

// createArenaGoldLogTable 创建竞技场金币流水分表
func (pm *PartitionManager) createArenaGoldLogTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_gold_logs", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '流水ID',
                        period_no varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
                        room_id bigint unsigned NOT NULL COMMENT '房间ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        match_id varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '对局ID',
                        before_gold bigint NOT NULL DEFAULT 0 COMMENT '变动前金币',
                        change_gold bigint NOT NULL DEFAULT 0 COMMENT '变动金币(正=赢,负=输)',
                        after_gold bigint NOT NULL DEFAULT 0 COMMENT '变动后金币',
                        reason varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '变动原因',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_period_no (period_no),
                        KEY idx_room_id (room_id),
                        KEY idx_player_id (player_id),
                        KEY idx_match_id (match_id),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场金币流水表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技场金币流水分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技场金币流水分表: %s", tableName)
        return nil
}

// 🔧【新增】createArenaParticipationTable 创建竞技场参赛记录分表
func (pm *PartitionManager) createArenaParticipationTable(suffix string) error {
        tableName := pm.getTableName("ddz_arena_participations", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                        session_id bigint unsigned NOT NULL COMMENT '比赛会话ID',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        period_no varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '期号(关联报名记录)',
                        robot_id bigint unsigned NOT NULL DEFAULT 0 COMMENT '机器人ID(当is_robot=1时等于player_id)',
                        is_robot tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是',
                        is_tournament_bot tinyint NOT NULL DEFAULT 0 COMMENT '是否为锦标赛补位机器人(不可获奖)',
                        let_win_enabled tinyint NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略',
                        match_coin bigint NOT NULL DEFAULT 0 COMMENT '比赛金币(用于排名)',
                        round_match_coin bigint NOT NULL DEFAULT 0 COMMENT '本轮比赛金币(每轮重置)',
                        current_round int NOT NULL DEFAULT 0 COMMENT '当前所在轮次',
                        final_rank int DEFAULT NULL COMMENT '最终排名',
                        is_eliminated tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否淘汰',
                        eliminated_round int DEFAULT NULL COMMENT '淘汰轮次',
                        eliminated_reason varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '淘汰原因',
                        is_champion tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否冠军',
                        is_online tinyint unsigned NOT NULL DEFAULT 1 COMMENT '是否在线',
                        last_table_id varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后所在桌号',
                        current_table_id bigint unsigned DEFAULT NULL COMMENT '当前所在桌ID',
                        reward_claimed tinyint unsigned NOT NULL DEFAULT 0 COMMENT '奖励是否已领取',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_session_player (session_id, player_id),
                        KEY idx_session_id (session_id),
                        KEY idx_player_id (player_id),
                        KEY idx_period_no (period_no),
                        KEY idx_is_eliminated (is_eliminated),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场参赛记录表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建竞技场参赛记录分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建竞技场参赛记录分表: %s", tableName)
        return nil
}

// 🔧【新增】createTournamentRoundTable 创建锦标赛轮次分表
func (pm *PartitionManager) createTournamentRoundTable(suffix string) error {
        tableName := pm.getTableName("ddz_tournament_rounds", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                        session_id bigint unsigned NOT NULL COMMENT '比赛会话ID',
                        round_num int NOT NULL COMMENT '轮次号',
                        elimination_target int NOT NULL DEFAULT 0 COMMENT '淘汰目标人数',
                        total_players int NOT NULL DEFAULT 0 COMMENT '总玩家数',
                        tables_count int NOT NULL DEFAULT 0 COMMENT '桌子数量',
                        stage varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PREPARE' COMMENT '阶段',
                        started_at datetime DEFAULT NULL COMMENT '开始时间',
                        ended_at datetime DEFAULT NULL COMMENT '结束时间',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_session_round (session_id, round_num),
                        KEY idx_session_id (session_id),
                        KEY idx_stage (stage),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='锦标赛轮次表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建锦标赛轮次分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建锦标赛轮次分表: %s", tableName)
        return nil
}

// 🔧【新增】createTournamentEliminationTable 创建锦标赛淘汰记录分表
func (pm *PartitionManager) createTournamentEliminationTable(suffix string) error {
        tableName := pm.getTableName("ddz_tournament_eliminations", suffix)

        if pm.isTableExists(tableName) {
                return nil
        }

        sql := fmt.Sprintf(`
                CREATE TABLE IF NOT EXISTS %s (
                        id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                        session_id bigint unsigned NOT NULL COMMENT '比赛会话ID',
                        round_num int NOT NULL COMMENT '轮次号',
                        player_id bigint unsigned NOT NULL COMMENT '玩家ID',
                        rank_before int NOT NULL DEFAULT 0 COMMENT '淘汰前排名',
                        match_coin bigint NOT NULL DEFAULT 0 COMMENT '淘汰时金币',
                        eliminated_reason varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '淘汰原因',
                        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        PRIMARY KEY (id),
                        KEY idx_session_id (session_id),
                        KEY idx_player_id (player_id),
                        KEY idx_round_num (round_num),
                        KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='锦标赛淘汰记录表(月份分表)'
        `, tableName)

        if err := pm.db.Exec(sql).Error; err != nil {
                return fmt.Errorf("创建锦标赛淘汰记录分表 %s 失败: %w", tableName, err)
        }

        pm.createdTables.Store(tableName, true)

        log.Printf("✅ 创建锦标赛淘汰记录分表: %s", tableName)
        return nil
}

// EnsureTableExists 确保指定日期的分表存在
func (pm *PartitionManager) EnsureTableExists(tableType, suffix string) error {
        switch tableType {
        case PartitionTypeRoom:
                return pm.createRoomTable(suffix)
        case PartitionTypeGameRecord:
                return pm.createGameRecordTable(suffix)
        case PartitionTypePlayLog:
                return pm.createPlayLogTable(suffix)
        case PartitionTypeDealLog:
                return pm.createDealLogTable(suffix)
        case PartitionTypeBidLog:
                return pm.createBidLogTable(suffix)
        case PartitionTypeLoginLog:
                return pm.createLoginLogTable(suffix)
        case PartitionTypeArenaCoinLog:
                return pm.createArenaCoinLogTable(suffix)
        case PartitionTypeArenaPeriod:
                return pm.createArenaPeriodTable(suffix)
        case PartitionTypeArenaSignupLog:
                return pm.createArenaSignupLogTable(suffix)
        case PartitionTypeArenaPeriodPlayer:
                return pm.createArenaPeriodPlayerTable(suffix)
        case PartitionTypeArenaGoldLog:
                return pm.createArenaGoldLogTable(suffix)
        // 🔧【新增】以下三个分表类型
        case PartitionTypeArenaParticipation:
                return pm.createArenaParticipationTable(suffix)
        case PartitionTypeTournamentRound:
                return pm.createTournamentRoundTable(suffix)
        case PartitionTypeTournamentElimination:
                return pm.createTournamentEliminationTable(suffix)
        default:
                return fmt.Errorf("未知的分表类型: %s", tableType)
        }
}

// GetRoomTableName 获取房间表名（根据时间）
func (pm *PartitionManager) GetRoomTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_rooms", suffix)
}

// GetGameRecordTableName 获取游戏记录表名（根据时间）
func (pm *PartitionManager) GetGameRecordTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_game_records", suffix)
}

// GetPlayLogTableName 获取出牌日志表名（根据时间）
func (pm *PartitionManager) GetPlayLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_play_logs", suffix)
}

// GetDealLogTableName 获取发牌日志表名（根据时间）
func (pm *PartitionManager) GetDealLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_deal_logs", suffix)
}

// GetBidLogTableName 获取叫地主日志表名（根据时间）
func (pm *PartitionManager) GetBidLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_bid_logs", suffix)
}

// GetLoginLogTableName 获取登录日志表名（根据时间）
func (pm *PartitionManager) GetLoginLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_login_logs", suffix)
}

// GetArenaCoinLogTableName 获取竞技币流水表名（根据时间）
func (pm *PartitionManager) GetArenaCoinLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_coin_logs", suffix)
}

// GetArenaPeriodTableName 获取竞技场期号表名（根据时间）
func (pm *PartitionManager) GetArenaPeriodTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_periods", suffix)
}

// GetArenaSignupLogTableName 获取竞技场报名日志表名（根据时间）
func (pm *PartitionManager) GetArenaSignupLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_signup_logs", suffix)
}

// GetArenaPeriodPlayerTableName 获取竞技场期号玩家表名（根据时间）
func (pm *PartitionManager) GetArenaPeriodPlayerTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_period_players", suffix)
}

// GetArenaGoldLogTableName 获取竞技场金币流水表名（根据时间）
func (pm *PartitionManager) GetArenaGoldLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_gold_logs", suffix)
}

// 🔧【新增】GetArenaParticipationTableName 获取竞技场参赛记录表名（根据时间）
func (pm *PartitionManager) GetArenaParticipationTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_arena_participations", suffix)
}

// 🔧【新增】GetTournamentRoundTableName 获取锦标赛轮次表名（根据时间）
func (pm *PartitionManager) GetTournamentRoundTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_tournament_rounds", suffix)
}

// 🔧【新增】GetTournamentEliminationTableName 获取锦标赛淘汰记录表名（根据时间）
func (pm *PartitionManager) GetTournamentEliminationTableName(t time.Time) string {
        suffix := t.Format("200601")
        return pm.getTableName("ddz_tournament_eliminations", suffix)
}

// GetCurrentRoomTableName 获取当前月份的房间表名
func (pm *PartitionManager) GetCurrentRoomTableName() string {
        return pm.GetRoomTableName(time.Now())
}

// GetCurrentGameRecordTableName 获取当前月份的游戏记录表名
func (pm *PartitionManager) GetCurrentGameRecordTableName() string {
        return pm.GetGameRecordTableName(time.Now())
}

// GetCurrentArenaPeriodTableName 获取当前月份的竞技场期号表名
func (pm *PartitionManager) GetCurrentArenaPeriodTableName() string {
        return pm.GetArenaPeriodTableName(time.Now())
}

// GetCurrentArenaSignupLogTableName 获取当前月份的竞技场报名日志表名
func (pm *PartitionManager) GetCurrentArenaSignupLogTableName() string {
        return pm.GetArenaSignupLogTableName(time.Now())
}

// GetCurrentArenaPeriodPlayerTableName 获取当前月份的竞技场期号玩家表名
func (pm *PartitionManager) GetCurrentArenaPeriodPlayerTableName() string {
        return pm.GetArenaPeriodPlayerTableName(time.Now())
}

// 🔧【新增】GetCurrentArenaParticipationTableName 获取当前月份的竞技场参赛记录表名
func (pm *PartitionManager) GetCurrentArenaParticipationTableName() string {
        return pm.GetArenaParticipationTableName(time.Now())
}

// 🔧【新增】GetCurrentTournamentRoundTableName 获取当前月份的锦标赛轮次表名
func (pm *PartitionManager) GetCurrentTournamentRoundTableName() string {
        return pm.GetTournamentRoundTableName(time.Now())
}

// 🔧【新增】GetCurrentTournamentEliminationTableName 获取当前月份的锦标赛淘汰记录表名
func (pm *PartitionManager) GetCurrentTournamentEliminationTableName() string {
        return pm.GetTournamentEliminationTableName(time.Now())
}

// =============================================
// 全局便捷函数
// =============================================

// InitPartitionManager 初始化分表管理器
func InitPartitionManager(db *gorm.DB) error {
        return GetPartitionManager().Init(db)
}

// GetPartitionRoomTable 获取房间分表名
func GetPartitionRoomTable(t time.Time) string {
        return GetPartitionManager().GetRoomTableName(t)
}

// GetPartitionGameRecordTable 获取游戏记录分表名
func GetPartitionGameRecordTable(t time.Time) string {
        return GetPartitionManager().GetGameRecordTableName(t)
}

// GetPartitionArenaPeriodTable 获取竞技场期号分表名
func GetPartitionArenaPeriodTable(t time.Time) string {
        return GetPartitionManager().GetArenaPeriodTableName(t)
}

// GetPartitionArenaSignupLogTable 获取竞技场报名日志分表名
func GetPartitionArenaSignupLogTable(t time.Time) string {
        return GetPartitionManager().GetArenaSignupLogTableName(t)
}

// GetPartitionArenaPeriodPlayerTable 获取竞技场期号玩家分表名
func GetPartitionArenaPeriodPlayerTable(t time.Time) string {
        return GetPartitionManager().GetArenaPeriodPlayerTableName(t)
}

// 🔧【新增】GetPartitionArenaParticipationTable 获取竞技场参赛记录分表名
func GetPartitionArenaParticipationTable(t time.Time) string {
        return GetPartitionManager().GetArenaParticipationTableName(t)
}

// 🔧【新增】GetPartitionTournamentRoundTable 获取锦标赛轮次分表名
func GetPartitionTournamentRoundTable(t time.Time) string {
        return GetPartitionManager().GetTournamentRoundTableName(t)
}

// 🔧【新增】GetPartitionTournamentEliminationTable 获取锦标赛淘汰记录分表名
func GetPartitionTournamentEliminationTable(t time.Time) string {
        return GetPartitionManager().GetTournamentEliminationTableName(t)
}

// EnsurePartitionTableExists 确保分表存在
func EnsurePartitionTableExists(tableType, suffix string) error {
        return GetPartitionManager().EnsureTableExists(tableType, suffix)
}
