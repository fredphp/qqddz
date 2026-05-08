-- 竞技场机器人系统迁移脚本
-- 执行时间: 2024-01-01
-- 说明: 添加机器人竞技场锁定相关字段

-- =============================================
-- 1. 添加机器人竞技场状态字段
-- =============================================

-- 检查字段是否存在，不存在则添加
-- 注意：MySQL 5.7+ 不支持 IF NOT EXISTS，需要手动检查或使用存储过程

-- 添加 arena_lock_room_id 字段（机器人锁定的竞技场房间ID）
ALTER TABLE `ddz_players`
ADD COLUMN IF NOT EXISTS `arena_lock_room_id` bigint unsigned DEFAULT NULL COMMENT '竞技场锁定房间ID' AFTER `robot_locked_at`;

-- 添加 arena_status 字段（机器人竞技场状态）
ALTER TABLE `ddz_players`
ADD COLUMN IF NOT EXISTS `arena_status` tinyint NOT NULL DEFAULT 0 COMMENT '竞技场状态:0-空闲,1-竞技中,2-已淘汰' AFTER `arena_lock_room_id`;

-- 添加索引
CREATE INDEX IF NOT EXISTS `idx_arena_lock_room_id` ON `ddz_players` (`arena_lock_room_id`);
CREATE INDEX IF NOT EXISTS `idx_arena_status` ON `ddz_players` (`arena_status`);

-- =============================================
-- 2. 创建竞技场机器人配置表
-- =============================================

CREATE TABLE IF NOT EXISTS `ddz_arena_robot_config` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_name` varchar(64) NOT NULL COMMENT '配置名称',
    `room_id` bigint unsigned NOT NULL COMMENT '适用房间ID',
    
    -- AI智能参数
    `intelligence_level` tinyint NOT NULL DEFAULT 2 COMMENT '智能等级:1-初级,2-中级,3-高级',
    `memory_enabled` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用记牌器',
    `teammate_aware` tinyint NOT NULL DEFAULT 1 COMMENT '是否有队友意识',
    
    -- 出牌策略
    `bomb_threshold` decimal(5,2) NOT NULL DEFAULT 0.50 COMMENT '炸弹使用阈值',
    `rocket_threshold` decimal(5,2) NOT NULL DEFAULT 0.30 COMMENT '王炸使用阈值',
    `play_aggressiveness` decimal(5,2) NOT NULL DEFAULT 0.50 COMMENT '出牌激进程度',
    
    -- 叫地主策略
    `bid_threshold` decimal(5,2) NOT NULL DEFAULT 0.60 COMMENT '叫地主阈值',
    `grab_threshold` decimal(5,2) NOT NULL DEFAULT 0.70 COMMENT '抢地主阈值',
    `bid_aggressiveness` decimal(5,2) NOT NULL DEFAULT 0.50 COMMENT '叫地主激进程度',
    
    -- 分数控制
    `target_rank_min` int NOT NULL DEFAULT 2 COMMENT '目标排名最小值',
    `target_rank_max` int NOT NULL DEFAULT 5 COMMENT '目标排名最大值',
    `win_probability` decimal(5,2) NOT NULL DEFAULT 0.45 COMMENT '获胜概率',
    `let_win_enabled` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用让牌',
    `mistake_rate` decimal(5,2) NOT NULL DEFAULT 0.15 COMMENT '失误率',
    
    -- 思考时间
    `min_think_time` int NOT NULL DEFAULT 1500 COMMENT '最小思考时间(毫秒)',
    `max_think_time` int NOT NULL DEFAULT 3000 COMMENT '最大思考时间(毫秒)',
    `bomb_think_time` int NOT NULL DEFAULT 4000 COMMENT '炸弹思考时间(毫秒)',
    
    `is_default` tinyint NOT NULL DEFAULT 0 COMMENT '是否默认配置',
    `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` datetime DEFAULT NULL COMMENT '删除时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场机器人配置表';

-- =============================================
-- 3. 创建竞技场机器人运行记录表
-- =============================================

CREATE TABLE IF NOT EXISTS `ddz_arena_robot_records` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `robot_id` bigint unsigned NOT NULL COMMENT '机器人ID',
    `period_no` varchar(32) NOT NULL COMMENT '期号',
    `room_id` bigint unsigned NOT NULL COMMENT '房间ID',
    `session_id` bigint unsigned NOT NULL COMMENT '会话ID',
    
    -- 竞技信息
    `table_id` int NOT NULL DEFAULT 0 COMMENT '桌号',
    `final_rank` int NOT NULL DEFAULT 0 COMMENT '最终排名',
    `final_score` bigint NOT NULL DEFAULT 0 COMMENT '最终积分',
    `is_champion` tinyint NOT NULL DEFAULT 0 COMMENT '是否冠军',
    
    -- 统计信息
    `total_games` int NOT NULL DEFAULT 0 COMMENT '总局数',
    `win_games` int NOT NULL DEFAULT 0 COMMENT '胜局',
    `lose_games` int NOT NULL DEFAULT 0 COMMENT '负局',
    `bomb_count` int NOT NULL DEFAULT 0 COMMENT '炸弹数',
    
    `locked_at` datetime NOT NULL COMMENT '锁定时间',
    `released_at` datetime DEFAULT NULL COMMENT '释放时间',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_robot_id` (`robot_id`),
    KEY `idx_period_no` (`period_no`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞技场机器人运行记录表';

-- =============================================
-- 4. 插入默认配置
-- =============================================

INSERT INTO `ddz_arena_robot_config` (`config_name`, `room_id`, `intelligence_level`, `is_default`, `status`)
VALUES 
    ('初级场默认配置', 0, 2, 1, 1),
    ('中级场默认配置', 0, 2, 1, 1),
    ('高级场默认配置', 0, 3, 1, 1)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- =============================================
-- 5. 创建索引优化查询
-- =============================================

-- 为机器人查询添加复合索引
CREATE INDEX IF NOT EXISTS `idx_robot_available` ON `ddz_players` (`player_type`, `robot_status`);

-- 为竞技场机器人查询添加复合索引
CREATE INDEX IF NOT EXISTS `idx_arena_robot_lookup` ON `ddz_players` (`player_type`, `arena_status`, `arena_lock_room_id`);
