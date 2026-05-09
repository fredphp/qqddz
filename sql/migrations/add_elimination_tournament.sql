-- =====================================================
-- 动态淘汰赛竞技系统 - 数据库迁移脚本
-- 创建时间: 2025-01-19
-- 说明: 为竞技场添加动态淘汰赛功能
-- =====================================================

-- 1. 为 ddz_room_config 表新增淘汰赛相关字段
ALTER TABLE `ddz_room_config`
ADD COLUMN `elimination_rules` VARCHAR(255) DEFAULT '[60,30,18,9,3]' COMMENT '淘汰规则JSON数组，如[60,30,18,9,3]表示每轮保留人数' AFTER `champion_reward_id`,
ADD COLUMN `rank_wait_seconds` INT NOT NULL DEFAULT 30 COMMENT '排行榜阶段等待秒数' AFTER `elimination_rules`,
ADD COLUMN `min_match_players` INT NOT NULL DEFAULT 1 COMMENT '最小匹配人数，不足时补机器人' AFTER `rank_wait_seconds`;

-- 2. 为 ddz_arena_sessions 表新增淘汰赛相关字段
ALTER TABLE `ddz_arena_sessions`
ADD COLUMN `elimination_rules` VARCHAR(255) DEFAULT '[60,30,18,9,3]' COMMENT '淘汰规则JSON数组' AFTER `total_rounds`,
ADD COLUMN `current_elimination_idx` INT NOT NULL DEFAULT 0 COMMENT '当前淘汰规则索引' AFTER `elimination_rules`,
ADD COLUMN `tournament_stage` VARCHAR(32) DEFAULT 'SIGNUP' COMMENT '赛事阶段: SIGNUP, PREPARE, PLAYING, RANKING, ELIMINATING, FINAL, FINISHED' AFTER `current_elimination_idx`,
ADD COLUMN `rank_wait_until` DATETIME NULL COMMENT '排行榜阶段等待截止时间' AFTER `tournament_stage`,
ADD COLUMN `tables_completed` INT NOT NULL DEFAULT 0 COMMENT '本轮已完成的桌数' AFTER `rank_wait_until`;

-- 3. 为 ddz_arena_participations 表新增淘汰赛相关字段
ALTER TABLE `ddz_arena_participations`
ADD COLUMN `is_tournament_bot` TINYINT NOT NULL DEFAULT 0 COMMENT '是否为锦标赛补位机器人(不可获奖)' AFTER `is_robot`,
ADD COLUMN `round_match_coin` BIGINT NOT NULL DEFAULT 0 COMMENT '本轮比赛金币(每轮重置)' AFTER `match_coin`,
ADD COLUMN `current_table_id` BIGINT UNSIGNED NULL COMMENT '当前所在桌ID' AFTER `last_table_id`;

-- 4. 创建淘汰轮次记录表
CREATE TABLE IF NOT EXISTS `ddz_tournament_rounds` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `session_id` BIGINT UNSIGNED NOT NULL COMMENT '比赛会话ID',
    `round_num` INT NOT NULL COMMENT '轮次号',
    `elimination_target` INT NOT NULL COMMENT '本轮淘汰目标人数(保留人数)',
    `total_players` INT NOT NULL COMMENT '本轮开始时总人数',
    `tables_count` INT NOT NULL COMMENT '本轮桌数',
    `stage` VARCHAR(32) NOT NULL DEFAULT 'PREPARE' COMMENT '阶段: PREPARE, PLAYING, RANKING, ELIMINATING, COMPLETED',
    `started_at` DATETIME NULL COMMENT '开始时间',
    `ended_at` DATETIME NULL COMMENT '结束时间',
    `rank_wait_until` DATETIME NULL COMMENT '排行榜等待截止时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_round_num` (`session_id`, `round_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='锦标赛淘汰轮次表';

-- 5. 创建淘汰记录表
CREATE TABLE IF NOT EXISTS `ddz_tournament_eliminations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `session_id` BIGINT UNSIGNED NOT NULL COMMENT '比赛会话ID',
    `round_num` INT NOT NULL COMMENT '轮次号',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '被淘汰玩家ID',
    `rank_before` INT NOT NULL COMMENT '淘汰前排名',
    `match_coin` BIGINT NOT NULL COMMENT '淘汰时比赛金币',
    `eliminated_reason` VARCHAR(32) NOT NULL DEFAULT 'lose' COMMENT '淘汰原因: lose-输掉比赛, offline-掉线, forfeit-弃权',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_player_id` (`player_id`),
    INDEX `idx_round_num` (`session_id`, `round_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='锦标赛淘汰记录表';

-- 6. 插入初始数据更新
-- 为现有的竞技场房间配置添加默认淘汰规则
UPDATE `ddz_room_config` 
SET `elimination_rules` = '[60,30,18,9,3]', 
    `rank_wait_seconds` = 30,
    `min_match_players` = 1
WHERE `room_category` = 2;

-- 7. 为现有的竞技场会话添加默认值
UPDATE `ddz_arena_sessions`
SET `elimination_rules` = '[60,30,18,9,3]',
    `tournament_stage` = 'SIGNUP',
    `current_elimination_idx` = 0
WHERE 1=1;

-- =====================================================
-- 回滚脚本 (如需回滚，请执行以下语句)
-- =====================================================
-- ALTER TABLE `ddz_room_config` DROP COLUMN `elimination_rules`, DROP COLUMN `rank_wait_seconds`, DROP COLUMN `min_match_players`;
-- ALTER TABLE `ddz_arena_sessions` DROP COLUMN `elimination_rules`, DROP COLUMN `current_elimination_idx`, DROP COLUMN `tournament_stage`, DROP COLUMN `rank_wait_until`, DROP COLUMN `tables_completed`;
-- ALTER TABLE `ddz_arena_participations` DROP COLUMN `is_tournament_bot`, DROP COLUMN `round_match_coin`, DROP COLUMN `current_table_id`;
-- DROP TABLE IF EXISTS `ddz_tournament_rounds`;
-- DROP TABLE IF EXISTS `ddz_tournament_eliminations`;
