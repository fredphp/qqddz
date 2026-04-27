-- 添加房间分类字段到 ddz_room_config 表
-- 执行时间: 2026-04-26
-- 说明: 添加 room_category 字段区分普通场和竞技场

-- 添加 room_category 字段
ALTER TABLE `ddz_room_config` 
ADD COLUMN `room_category` tinyint NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场' AFTER `room_type`,
ADD INDEX `idx_ddz_room_config_room_category` (`room_category` ASC);

-- 添加 bg_image_num 字段（如果不存在）
-- 先检查是否存在
SET @exist_bg := (SELECT COUNT(*) FROM information_schema.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'ddz_room_config' 
                  AND COLUMN_NAME = 'bg_image_num');

SET @sql_bg := IF(@exist_bg = 0, 
    'ALTER TABLE `ddz_room_config` ADD COLUMN `bg_image_num` tinyint NOT NULL DEFAULT 2 COMMENT ''背景图编号'' AFTER `max_gold`', 
    'SELECT ''bg_image_num column already exists''');

PREPARE stmt FROM @sql_bg;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有数据（可选：根据需要设置某些房间为竞技场）
-- UPDATE `ddz_room_config` SET `room_category` = 2 WHERE `room_type` IN (5, 6);
