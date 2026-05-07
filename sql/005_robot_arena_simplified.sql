-- =====================================================
-- 迁移脚本: 机器人竞技系统简化设计
-- 数据库: hlddz
-- 说明: 
--   机器人完全复用真人玩家的数据表和流程
--   只需要最小化的扩展来支持：
--   1. 机器人唯一占用（不能同时在多个竞技场）
--   2. 决赛让牌策略控制
-- =====================================================

-- =====================================================
-- 第一部分: 为ddz_players表添加机器人状态字段
-- 说明: 用于机器人唯一占用控制，防止同一机器人同时参加多个竞技场
-- =====================================================

-- 添加机器人状态字段
ALTER TABLE `ddz_players` 
ADD COLUMN `robot_status` TINYINT NOT NULL DEFAULT 0 COMMENT '机器人状态:0-空闲,1-竞技场中' AFTER `player_type`,
ADD COLUMN `robot_current_session_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前竞技场会话ID' AFTER `robot_status`,
ADD COLUMN `robot_locked_at` DATETIME DEFAULT NULL COMMENT '锁定时间' AFTER `robot_current_session_id`;

-- 添加索引（快速查询空闲机器人）
ALTER TABLE `ddz_players` ADD INDEX `idx_robot_available` (`player_type`, `robot_status`);


-- =====================================================
-- 第二部分: 为ddz_arena_participations表添加字段
-- 说明: 用于标记参赛者是否为机器人，以及决赛让牌控制
-- =====================================================

-- 检查并添加is_robot字段
ALTER TABLE `ddz_arena_participations` 
ADD COLUMN `is_robot` TINYINT NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是' AFTER `player_id`,
ADD COLUMN `let_win_enabled` TINYINT NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略(决赛阶段)' AFTER `is_robot`,
ADD COLUMN `robot_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '机器人ID(当is_robot=1时等于player_id)' AFTER `let_win_enabled`;

-- 添加索引
ALTER TABLE `ddz_arena_participations` ADD INDEX `idx_is_robot` (`session_id`, `is_robot`);


-- =====================================================
-- 第三部分: 机器人AI配置表（可选，用于调整AI行为）
-- 说明: 配置不同等级AI的出牌行为，让机器人更像真人
-- =====================================================

CREATE TABLE IF NOT EXISTS `ddz_robot_config` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `config_name` VARCHAR(64) NOT NULL COMMENT '配置名称',
    
    -- 思考时间参数（模拟真人思考）
    `min_think_time` INT NOT NULL DEFAULT 1500 COMMENT '最小思考时间(毫秒)',
    `max_think_time` INT NOT NULL DEFAULT 3000 COMMENT '最大思考时间(毫秒)',
    `bomb_think_time` INT NOT NULL DEFAULT 4000 COMMENT '炸弹思考时间(毫秒)',
    
    -- 出牌行为参数
    `bomb_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.60 COMMENT '炸弹使用概率(0-1)',
    `landlord_bid_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.50 COMMENT '抢地主概率(0-1)',
    
    -- 决赛让牌参数
    `let_win_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.85 COMMENT '决赛让牌概率(0-1)',
    `let_win_min_rank` INT NOT NULL DEFAULT 3 COMMENT '触发让牌的最小排名(剩余人数<=此值时)',
    
    `is_default` TINYINT NOT NULL DEFAULT 1 COMMENT '是否默认配置',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机器人AI配置表';


-- =====================================================
-- 第四部分: 插入默认配置
-- =====================================================

INSERT INTO `ddz_robot_config` 
(`config_name`, `min_think_time`, `max_think_time`, `bomb_think_time`, 
 `bomb_probability`, `landlord_bid_probability`, `let_win_probability`, `let_win_min_rank`, `is_default`) 
VALUES
('默认配置', 1500, 3000, 4000, 0.60, 0.50, 0.85, 3, 1);


-- =====================================================
-- 第五部分: 添加API权限
-- =====================================================

INSERT INTO `sys_apis` (`path`, `description`, `api_group`, `method`, `created_at`, `updated_at`) VALUES
('/ddz/robot/generateRobots', '批量生成机器人玩家', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/robot/list', '获取机器人列表', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/robot/release', '释放机器人占用', 'DDZ玩家管理', 'POST', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();


-- =====================================================
-- 第六部分: 验证
-- =====================================================

-- 验证字段
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'ddz_players' 
AND COLUMN_NAME IN ('robot_status', 'robot_current_session_id', 'robot_locked_at');

SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'ddz_arena_participations' 
AND COLUMN_NAME IN ('is_robot', 'let_win_enabled', 'robot_id');


-- =====================================================
-- 第七部分: 回滚脚本
-- =====================================================
/*
-- 回滚API权限
DELETE FROM `sys_apis` WHERE `path` LIKE '/ddz/robot/%';

-- 回滚配置
DELETE FROM `ddz_robot_config` WHERE 1=1;
DROP TABLE IF EXISTS `ddz_robot_config`;

-- 回滚ddz_arena_participations字段
ALTER TABLE `ddz_arena_participations` DROP INDEX `idx_is_robot`;
ALTER TABLE `ddz_arena_participations` DROP COLUMN `robot_id`;
ALTER TABLE `ddz_arena_participations` DROP COLUMN `let_win_enabled`;
ALTER TABLE `ddz_arena_participations` DROP COLUMN `is_robot`;

-- 回滚ddz_players字段
ALTER TABLE `ddz_players` DROP INDEX `idx_robot_available`;
ALTER TABLE `ddz_players` DROP COLUMN `robot_locked_at`;
ALTER TABLE `ddz_players` DROP COLUMN `robot_current_session_id`;
ALTER TABLE `ddz_players` DROP COLUMN `robot_status`;
*/
