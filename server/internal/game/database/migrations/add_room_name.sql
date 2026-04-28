-- 为 ddz_rooms 表添加 room_name 字段
-- 执行时间: 2024-04-28

-- 添加 room_name 字段（如果不存在）
ALTER TABLE `ddz_rooms` 
ADD COLUMN IF NOT EXISTS `room_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '房间名称' 
AFTER `room_code`;

-- 更新现有记录，为没有房间名称的记录生成默认名称
UPDATE `ddz_rooms` 
SET `room_name` = CONCAT('房', `room_code`) 
WHERE `room_name` = '' OR `room_name` IS NULL;
