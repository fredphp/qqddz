-- =====================================================
-- 迁移脚本: DDZ玩家管理模块迁移
-- 数据库: hlddz
-- 创建时间: 2024-01-01
-- 说明: 
--   1. 检查并添加player_type字段到ddz_players表
--   2. 添加DDZ玩家管理模块API权限到sys_apis表
-- =====================================================

-- =====================================================
-- 第一部分: 数据库表结构迁移
-- =====================================================

-- 检查并添加player_type字段到ddz_players表（如果不存在）
-- 注意: MySQL 5.7+ 支持，低版本可能需要手动检查后执行

-- 方法1: 使用存储过程自动检查并添加（推荐）
DELIMITER //
CREATE PROCEDURE `add_player_type_column_if_not_exists`()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ddz_players' 
    AND COLUMN_NAME = 'player_type';
    
    IF column_exists = 0 THEN
        ALTER TABLE `ddz_players` 
        ADD COLUMN `player_type` tinyint NOT NULL DEFAULT 1 COMMENT '玩家类型:1-平台用户,2-机器人' 
        AFTER `gender`;
        
        -- 添加索引
        ALTER TABLE `ddz_players` ADD INDEX `idx_player_type` (`player_type`);
        
        -- 更新已有机器人数据（根据username前缀判断）
        UPDATE `ddz_players` SET `player_type` = 2 WHERE `username` LIKE 'robot_%';
    END IF;
END //
DELIMITER ;

CALL `add_player_type_column_if_not_exists`();
DROP PROCEDURE IF EXISTS `add_player_type_column_if_not_exists`;

-- 方法2: 直接执行（如果确定字段不存在，直接执行以下语句）
-- ALTER TABLE `ddz_players` ADD COLUMN `player_type` tinyint NOT NULL DEFAULT 1 COMMENT '玩家类型:1-平台用户,2-机器人' AFTER `gender`;
-- ALTER TABLE `ddz_players` ADD INDEX `idx_player_type` (`player_type`);
-- UPDATE `ddz_players` SET `player_type` = 2 WHERE `username` LIKE 'robot_%';

-- 检查并添加token字段到ddz_players表（用于机器人token存储）
-- 方法1: 使用存储过程
DELIMITER //
CREATE PROCEDURE `add_token_column_if_not_exists`()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ddz_players' 
    AND COLUMN_NAME = 'token';
    
    IF column_exists = 0 THEN
        ALTER TABLE `ddz_players` 
        ADD COLUMN `token` varchar(32) DEFAULT NULL COMMENT '机器人token' 
        AFTER `player_type`;
    END IF;
END //
DELIMITER ;

CALL `add_token_column_if_not_exists`();
DROP PROCEDURE IF EXISTS `add_token_column_if_not_exists`;

-- 方法2: 直接执行（如果确定字段不存在）
-- ALTER TABLE `ddz_players` ADD COLUMN `token` varchar(32) DEFAULT NULL COMMENT '机器人token' AFTER `player_type`;


-- =====================================================
-- 第二部分: API权限数据迁移
-- =====================================================

-- 删除可能已存在的旧权限数据（避免重复插入）
DELETE FROM `sys_apis` WHERE `api_group` = 'DDZ玩家管理';

-- 插入DDZ玩家管理模块API权限
INSERT INTO `sys_apis` (`path`, `description`, `api_group`, `method`, `created_at`, `updated_at`) VALUES
-- 玩家基础管理
('/ddz/player/list', '分页获取玩家列表', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/info', '根据ID获取玩家信息', 'DDZ玩家管理', 'GET', NOW(), NOW()),
('/ddz/player/update', '更新玩家信息', 'DDZ玩家管理', 'PUT', NOW(), NOW()),
('/ddz/player/delete', '删除玩家', 'DDZ玩家管理', 'DELETE', NOW(), NOW()),
('/ddz/player/deleteByPlayerId', '根据PlayerID删除玩家', 'DDZ玩家管理', 'DELETE', NOW(), NOW()),

-- 玩家状态管理
('/ddz/player/ban', '封禁玩家', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/unban', '解封玩家', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/freeze', '冻结玩家', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/unfreeze', '解冻玩家', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/statusLogs', '获取玩家状态变更日志', 'DDZ玩家管理', 'POST', NOW(), NOW()),

-- 玩家货币管理
('/ddz/player/currency', '更新玩家货币', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/coins', '更新玩家金币', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/arenaCoin', '更新玩家竞技币', 'DDZ玩家管理', 'POST', NOW(), NOW()),
('/ddz/player/coinLogs', '获取货币流水日志', 'DDZ玩家管理', 'POST', NOW(), NOW()),

-- 机器人生成
('/ddz/player/generateRobots', '批量生成机器人玩家', 'DDZ玩家管理', 'POST', NOW(), NOW());


-- =====================================================
-- 第三部分: 验证结果
-- =====================================================

-- 验证表结构
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'ddz_players' 
AND COLUMN_NAME IN ('player_type', 'token');

-- 验证权限数据
SELECT `id`, `path`, `description`, `api_group`, `method` 
FROM `sys_apis` 
WHERE `api_group` = 'DDZ玩家管理' 
ORDER BY `id`;


-- =====================================================
-- 第四部分: 回滚脚本（如需回滚执行以下语句）
-- =====================================================
/*
-- 回滚API权限
DELETE FROM `sys_apis` WHERE `api_group` = 'DDZ玩家管理';

-- 回滚数据库字段（谨慎操作）
ALTER TABLE `ddz_players` DROP COLUMN `token`;
ALTER TABLE `ddz_players` DROP INDEX `idx_player_type`;
ALTER TABLE `ddz_players` DROP COLUMN `player_type`;
*/
