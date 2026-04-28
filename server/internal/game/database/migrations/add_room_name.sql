-- 为 ddz_rooms 表添加 room_name 和 room_config_id 字段
-- 执行时间: 2024-04-28

-- 添加 room_name 字段（如果不存在）
ALTER TABLE `ddz_rooms` 
ADD COLUMN IF NOT EXISTS `room_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '房间名称' 
AFTER `room_code`;

-- 添加 room_config_id 字段（如果不存在）
ALTER TABLE `ddz_rooms` 
ADD COLUMN IF NOT EXISTS `room_config_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID(关联ddz_room_config表)' 
AFTER `room_name`;

-- 添加索引
ALTER TABLE `ddz_rooms` 
ADD INDEX IF NOT EXISTS `idx_room_config_id` (`room_config_id`);

-- 更新现有记录，为没有房间名称的记录生成默认名称
UPDATE `ddz_rooms` 
SET `room_name` = CONCAT('房', `room_code`) 
WHERE `room_name` = '' OR `room_name` IS NULL;
