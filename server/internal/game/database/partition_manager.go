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
        mu            sync.RWMutex
        createdTables map[string]bool // 已创建的分表缓存
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
)

// partitionManager 分表管理器单例
var partitionManager *PartitionManager
var partitionOnce sync.Once

// GetPartitionManager 获取分表管理器单例
func GetPartitionManager() *PartitionManager {
        partitionOnce.Do(func() {
                partitionManager = &PartitionManager{
                        createdTables: make(map[string]bool),
                }
        })
        return partitionManager
}

// Init 初始化分表管理器
func (pm *PartitionManager) Init(db *gorm.DB) error {
        pm.mu.Lock()
        defer pm.mu.Unlock()

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

        return nil
}

// getTableName 获取分表名称
func (pm *PartitionManager) getTableName(baseTable, suffix string) string {
        return fmt.Sprintf("%s_%s", baseTable, suffix)
}

// isTableExists 检查表是否存在
// 注意：此方法不加锁，调用者需要确保线程安全
func (pm *PartitionManager) isTableExists(tableName string) bool {
        // 检查数据库
        var count int64
        pm.db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)

        return count > 0
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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

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

        pm.createdTables[tableName] = true

        log.Printf("✅ 创建竞技币流水分表: %s", tableName)
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

// GetCurrentRoomTableName 获取当前月份的房间表名
func (pm *PartitionManager) GetCurrentRoomTableName() string {
        return pm.GetRoomTableName(time.Now())
}

// GetCurrentGameRecordTableName 获取当前月份的游戏记录表名
func (pm *PartitionManager) GetCurrentGameRecordTableName() string {
        return pm.GetGameRecordTableName(time.Now())
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

// EnsurePartitionTableExists 确保分表存在
func EnsurePartitionTableExists(tableType, suffix string) error {
        return GetPartitionManager().EnsureTableExists(tableType, suffix)
}
