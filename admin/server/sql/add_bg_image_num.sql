-- =============================================
-- 为 ddz_room_config 表添加 bg_image_num 字段
-- 如果字段已存在则不会报错
-- =============================================

-- 使用 ddz_game 数据库
USE `ddz_game`;

-- 添加 bg_image_num 字段（如果不存在）
-- MySQL 8.0+ 支持，否则需要手动检查
SET @dbname = DATABASE();
SET @tablename = 'ddz_room_config';
SET @columnname = 'bg_image_num';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @columnname
    ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` TINYINT NOT NULL DEFAULT 2 COMMENT ''背景图编号(对应btn_happy_{编号}.png,如:2->btn_happy_2.png)'' AFTER `max_gold`')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有数据的 bg_image_num 值（根据 room_type 设置默认值）
UPDATE `ddz_room_config` SET `bg_image_num` = `room_type` WHERE `bg_image_num` = 0 OR `bg_image_num` IS NULL;

-- 确保所有房间都有背景图编号
UPDATE `ddz_room_config` SET `bg_image_num` = 2 WHERE `room_type` = 2 AND (`bg_image_num` = 0 OR `bg_image_num` IS NULL);
UPDATE `ddz_room_config` SET `bg_image_num` = 3 WHERE `room_type` = 3 AND (`bg_image_num` = 0 OR `bg_image_num` IS NULL);
UPDATE `ddz_room_config` SET `bg_image_num` = 4 WHERE `room_type` = 4 AND (`bg_image_num` = 0 OR `bg_image_num` IS NULL);
UPDATE `ddz_room_config` SET `bg_image_num` = 5 WHERE `room_type` = 5 AND (`bg_image_num` = 0 OR `bg_image_num` IS NULL);

-- 验证更新
SELECT id, room_name, room_type, bg_image_num FROM `ddz_room_config`;

SELECT 'bg_image_num 字段添加完成!' AS result;
