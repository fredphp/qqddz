-- =============================================
-- 创建游戏房间实例表 (ddz_rooms)
-- 存储实际创建的游戏房间
-- =============================================

-- 创建房间实例表
CREATE TABLE IF NOT EXISTS `ddz_rooms` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `room_id` VARCHAR(64) NOT NULL COMMENT '房间唯一标识',
    `room_config_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '房间配置ID(关联ddz_room_config表)',
    `room_name` VARCHAR(64) NOT NULL COMMENT '房间名称',
    `room_type` TINYINT NOT NULL DEFAULT 1 COMMENT '房间类型:1-新手场,2-普通场,3-高级场,4-富豪场,5-至尊场',
    `room_category` TINYINT NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '房间状态:1-等待中,2-游戏中,3-已结束',
    `player_count` TINYINT NOT NULL DEFAULT 0 COMMENT '当前玩家数',
    `max_players` TINYINT NOT NULL DEFAULT 3 COMMENT '最大玩家数',
    `creator_id` VARCHAR(64) DEFAULT NULL COMMENT '创建者玩家ID',
    `players` TEXT DEFAULT NULL COMMENT '玩家列表(JSON格式)',
    `base_score` INT NOT NULL DEFAULT 1 COMMENT '底分',
    `multiplier` INT NOT NULL DEFAULT 1 COMMENT '初始倍数',
    `current_game_id` VARCHAR(64) DEFAULT NULL COMMENT '当前游戏ID',
    `started_at` DATETIME DEFAULT NULL COMMENT '游戏开始时间',
    `ended_at` DATETIME DEFAULT NULL COMMENT '游戏结束时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_room_id` (`room_id`),
    KEY `idx_room_config_id` (`room_config_id`),
    KEY `idx_room_type` (`room_type`),
    KEY `idx_room_category` (`room_category`),
    KEY `idx_status` (`status`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏房间实例表';

-- =============================================
-- 删除重复的 ddz_room_configs 表（如果存在）
-- 注意：此操作不可逆，请确保已备份数据
-- =============================================
-- DROP TABLE IF EXISTS `ddz_room_configs`;
