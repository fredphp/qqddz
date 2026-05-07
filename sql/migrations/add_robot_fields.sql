-- =============================================
-- 添加机器人相关字段到 ddz_players 表
-- 执行时间: 2026-05-06
-- =============================================

-- 1. 添加 player_type 字段（玩家类型: 1-真人, 2-机器人）
ALTER TABLE `ddz_players` 
ADD COLUMN `player_type` tinyint NOT NULL DEFAULT 1 COMMENT '玩家类型: 1-真人, 2-机器人' AFTER `status`;

-- 2. 添加 robot_status 字段（机器人状态: 0-空闲, 1-竞技场中）
ALTER TABLE `ddz_players` 
ADD COLUMN `robot_status` tinyint NOT NULL DEFAULT 0 COMMENT '机器人状态: 0-空闲, 1-竞技场中' AFTER `player_type`;

-- 3. 添加 robot_current_session_id 字段（当前竞技场会话ID）
ALTER TABLE `ddz_players` 
ADD COLUMN `robot_current_session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前竞技场会话ID' AFTER `robot_status`;

-- 4. 添加 robot_locked_at 字段（机器人锁定时间）
ALTER TABLE `ddz_players` 
ADD COLUMN `robot_locked_at` datetime NULL DEFAULT NULL COMMENT '机器人锁定时间' AFTER `robot_current_session_id`;

-- 5. 添加索引
ALTER TABLE `ddz_players` 
ADD INDEX `idx_player_type` (`player_type`),
ADD INDEX `idx_robot_status` (`robot_status`);

-- =============================================
-- 添加机器人玩家数据
-- =============================================

-- 插入10个机器人玩家
INSERT INTO `ddz_players` (`username`, `nickname`, `avatar`, `gender`, `gold`, `arena_coin`, `diamond`, `experience`, `level`, `vip_level`, `win_count`, `lose_count`, `landlord_count`, `farmer_count`, `status`, `player_type`, `robot_status`) VALUES
('robot_001', '小明', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot1', 1, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_002', '小红', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot2', 2, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_003', '小华', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot3', 1, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_004', '小李', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot4', 2, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_005', '小王', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot5', 1, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_006', '小张', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot6', 2, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_007', '小刘', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot7', 1, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_008', '小陈', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot8', 2, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_009', '小杨', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot9', 1, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0),
('robot_010', '小赵', 'https://api.dicebear.com/7.x/adventurer/svg?seed=robot10', 2, 100000, 10000, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0);

-- =============================================
-- 验证
-- =============================================
-- 查看添加的字段
-- SHOW COLUMNS FROM `ddz_players` LIKE 'player_type';
-- SHOW COLUMNS FROM `ddz_players` LIKE 'robot_status';

-- 查看机器人数据
-- SELECT id, username, nickname, player_type, robot_status FROM `ddz_players` WHERE player_type = 2;
