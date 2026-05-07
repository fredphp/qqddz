-- 迁移说明: 添加玩家类型字段(player_type)用于区分平台用户和机器人
-- 执行时间: 2026-05-07
-- 作者: AI Assistant

-- 1. 添加 player_type 字段到 ddz_players 表
ALTER TABLE `ddz_players` 
ADD COLUMN `player_type` tinyint NOT NULL DEFAULT 1 COMMENT '玩家类型:1-平台用户,2-机器人' AFTER `gender`;

-- 2. 添加索引以提高查询效率
ALTER TABLE `ddz_players` 
ADD INDEX `idx_ddz_players_player_type` (`player_type`);

-- 3. 根据现有username更新已存在的机器人数据
-- 机器人username以"robot_"开头，更新为player_type=2
UPDATE `ddz_players` 
SET `player_type` = 2 
WHERE `username` LIKE 'robot_%';

-- 4. 确保平台用户为player_type=1（默认值，不需要额外更新）
-- 所有非机器人的用户已经是默认值1

-- 5. 更新ddz_game数据库中的表结构（如果游戏服务端也使用此表）
-- 注意：此迁移需要在ddz_game数据库中执行

-- 回滚脚本（如需回滚执行以下语句）:
-- ALTER TABLE `ddz_players` DROP INDEX `idx_ddz_players_player_type`;
-- ALTER TABLE `ddz_players` DROP COLUMN `player_type`;
