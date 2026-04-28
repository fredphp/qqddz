-- 游戏记录分表设计方案
-- 按月份分表存储游戏记录，解决数据量过大的问题

-- ==============================================
-- 方案一：MySQL 分区表（推荐）
-- ==============================================

-- 修改现有游戏记录表，添加分区支持
-- 注意：需要先备份数据，删除外键约束后再执行

-- 1. 创建新的分区表（按月份分区）
CREATE TABLE IF NOT EXISTS `ddz_game_records_partitioned` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '房间类型',
  `room_category` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '房间分类:1-普通场,2-竞技场',
  `landlord_id` bigint unsigned NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint unsigned NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint unsigned NOT NULL COMMENT '农民2玩家ID',
  `base_score` int NOT NULL DEFAULT '1' COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT '1' COMMENT '最终倍数',
  `bomb_count` int NOT NULL DEFAULT '0' COMMENT '炸弹数量',
  `spring` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否春天:0-否,1-地主春天,2-反春天',
  `result` tinyint unsigned NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT '0' COMMENT '地主输赢金币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT '0' COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT '0' COMMENT '农民2输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT '0' COMMENT '地主输赢竞技币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT '0' COMMENT '农民1输赢竞技币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT '0' COMMENT '农民2输赢竞技币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int NOT NULL DEFAULT '0' COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`, `started_at`),
  UNIQUE KEY `idx_game_id` (`game_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_landlord_id` (`landlord_id`),
  KEY `idx_farmer1_id` (`farmer1_id`),
  KEY `idx_farmer2_id` (`farmer2_id`),
  KEY `idx_started_at` (`started_at`),
  KEY `idx_result` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表(分区)'
PARTITION BY RANGE (TO_DAYS(started_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    PARTITION p202404 VALUES LESS THAN (TO_DAYS('2024-05-01')),
    PARTITION p202405 VALUES LESS THAN (TO_DAYS('2024-06-01')),
    PARTITION p202406 VALUES LESS THAN (TO_DAYS('2024-07-01')),
    PARTITION p202407 VALUES LESS THAN (TO_DAYS('2024-08-01')),
    PARTITION p202408 VALUES LESS THAN (TO_DAYS('2024-09-01')),
    PARTITION p202409 VALUES LESS THAN (TO_DAYS('2024-10-01')),
    PARTITION p202410 VALUES LESS THAN (TO_DAYS('2024-11-01')),
    PARTITION p202411 VALUES LESS THAN (TO_DAYS('2024-12-01')),
    PARTITION p202412 VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- ==============================================
-- 方案二：手动分表（更灵活）
-- ==============================================

-- 创建游戏记录表的存储过程
DELIMITER //

CREATE PROCEDURE create_game_record_table(IN table_suffix VARCHAR(10))
BEGIN
    DECLARE table_name VARCHAR(64);
    SET table_name = CONCAT('ddz_game_records_', table_suffix);
    
    SET @sql = CONCAT('
        CREATE TABLE IF NOT EXISTS `', table_name, '` (
            `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT ''游戏记录ID'',
            `game_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT ''游戏唯一标识'',
            `room_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT ''房间ID'',
            `room_type` tinyint unsigned NOT NULL DEFAULT ''1'' COMMENT ''房间类型'',
            `room_category` tinyint unsigned NOT NULL DEFAULT ''1'' COMMENT ''房间分类'',
            `landlord_id` bigint unsigned NOT NULL COMMENT ''地主玩家ID'',
            `farmer1_id` bigint unsigned NOT NULL COMMENT ''农民1玩家ID'',
            `farmer2_id` bigint unsigned NOT NULL COMMENT ''农民2玩家ID'',
            `base_score` int NOT NULL DEFAULT ''1'' COMMENT ''底分'',
            `multiplier` int NOT NULL DEFAULT ''1'' COMMENT ''最终倍数'',
            `bomb_count` int NOT NULL DEFAULT ''0'' COMMENT ''炸弹数量'',
            `spring` tinyint unsigned NOT NULL DEFAULT ''0'' COMMENT ''是否春天'',
            `result` tinyint unsigned NOT NULL COMMENT ''结果:1-地主胜,2-农民胜'',
            `landlord_win_gold` bigint NOT NULL DEFAULT ''0'' COMMENT ''地主输赢金币'',
            `farmer1_win_gold` bigint NOT NULL DEFAULT ''0'' COMMENT ''农民1输赢金币'',
            `farmer2_win_gold` bigint NOT NULL DEFAULT ''0'' COMMENT ''农民2输赢金币'',
            `landlord_win_arena_coin` bigint NOT NULL DEFAULT ''0'' COMMENT ''地主输赢竞技币'',
            `farmer1_win_arena_coin` bigint NOT NULL DEFAULT ''0'' COMMENT ''农民1输赢竞技币'',
            `farmer2_win_arena_coin` bigint NOT NULL DEFAULT ''0'' COMMENT ''农民2输赢竞技币'',
            `started_at` datetime NOT NULL COMMENT ''开始时间'',
            `ended_at` datetime DEFAULT NULL COMMENT ''结束时间'',
            `duration_seconds` int NOT NULL DEFAULT ''0'' COMMENT ''游戏时长(秒)'',
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_game_id` (`game_id`),
            KEY `idx_room_id` (`room_id`),
            KEY `idx_landlord_id` (`landlord_id`),
            KEY `idx_farmer1_id` (`farmer1_id`),
            KEY `idx_farmer2_id` (`farmer2_id`),
            KEY `idx_started_at` (`started_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''游戏记录表'
    ');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- 创建当月表
CALL create_game_record_table(DATE_FORMAT(NOW(), '%Y%m'));

-- 创建下月表（提前创建）
CALL create_game_record_table(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y%m'));

-- ==============================================
-- 自动创建月份表的事件（可选）
-- ==============================================

-- 创建事件：每月1号自动创建下个月的表
DELIMITER //

CREATE EVENT IF NOT EXISTS auto_create_game_record_table
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 00:00:00'
DO
BEGIN
    CALL create_game_record_table(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y%m'));
END //

DELIMITER ;

-- ==============================================
-- 房间记录分表（类似处理）
-- ==============================================

-- 创建房间记录分表的存储过程
DELIMITER //

CREATE PROCEDURE create_room_table(IN table_suffix VARCHAR(10))
BEGIN
    DECLARE table_name VARCHAR(64);
    SET table_name = CONCAT('ddz_rooms_', table_suffix);
    
    SET @sql = CONCAT('
        CREATE TABLE IF NOT EXISTS `', table_name, '` (
            `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT ''房间ID'',
            `room_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT ''房间号'',
            `room_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''' COMMENT ''房间名称'',
            `room_config_id` bigint unsigned DEFAULT NULL COMMENT ''房间配置ID'',
            `room_type` tinyint unsigned NOT NULL DEFAULT ''1'' COMMENT ''房间类型'',
            `room_category` tinyint unsigned NOT NULL DEFAULT ''1'' COMMENT ''房间分类'',
            `creator_id` bigint unsigned NOT NULL COMMENT ''创建者玩家ID'',
            `player_count` int NOT NULL DEFAULT ''0'' COMMENT ''当前玩家数量'',
            `max_players` int NOT NULL DEFAULT ''3'' COMMENT ''最大玩家数量'',
            `status` tinyint unsigned NOT NULL DEFAULT ''1'' COMMENT ''状态'',
            `base_score` int NOT NULL DEFAULT ''1'' COMMENT ''底分'',
            `multiplier` int NOT NULL DEFAULT ''1'' COMMENT ''倍数'',
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
            `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''更新时间'',
            `ended_at` datetime DEFAULT NULL COMMENT ''结束时间'',
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_room_code` (`room_code`),
            KEY `idx_creator_id` (`creator_id`),
            KEY `idx_status` (`status`),
            KEY `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''房间表'
    ');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- 创建当月房间表
CALL create_room_table(DATE_FORMAT(NOW(), '%Y%m'));
