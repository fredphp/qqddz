-- =============================================
-- 修复 ddz_rooms 表上的错误外键约束
-- GORM AutoMigrate 可能创建了错误方向的外键约束
-- 执行时间：2026-04-28
-- =============================================

-- 1. 查看当前 ddz_rooms 表的所有外键约束
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ddz_rooms'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 2. 删除错误的外键约束（从 ddz_rooms 引用 ddz_room_players）
-- MySQL 5.7+ 支持 DROP FOREIGN KEY IF EXISTS 语法
-- 如果您的 MySQL 版本较旧，请先运行上面的查询，然后手动删除

-- 方法1：使用 IF EXISTS（MySQL 8.0.19+）
-- ALTER TABLE `ddz_rooms` DROP FOREIGN KEY IF EXISTS `fk_ddz_room_players_room`;

-- 方法2：兼容旧版本的写法
SET @dbname = DATABASE();
SET @tablename = 'ddz_rooms';
SET @constraintname = 'fk_ddz_room_players_room';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND CONSTRAINT_NAME = @constraintname
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) > 0,
    CONCAT('ALTER TABLE `', @tablename, '` DROP FOREIGN KEY `', @constraintname, '`'),
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 确保 ddz_room_players 表有正确的外键约束
-- 先删除可能存在的旧约束
SET @tablename = 'ddz_room_players';

-- 删除旧的 fk_room_players_room（如果存在）
SET @constraintname = 'fk_room_players_room';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND CONSTRAINT_NAME = @constraintname
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) > 0,
    CONCAT('ALTER TABLE `', @tablename, '` DROP FOREIGN KEY `', @constraintname, '`'),
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 删除旧的 fk_room_players_player（如果存在）
SET @constraintname = 'fk_room_players_player';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND CONSTRAINT_NAME = @constraintname
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) > 0,
    CONCAT('ALTER TABLE `', @tablename, '` DROP FOREIGN KEY `', @constraintname, '`'),
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 添加正确的外键约束（正确方向：ddz_room_players -> ddz_rooms）
-- 注意：需要确保 ddz_room_players.room_code 和 ddz_rooms.room_code 数据一致
-- 如果数据不一致，需要先清理数据

-- 添加外键：room_code -> ddz_rooms.room_code
ALTER TABLE `ddz_room_players`
    ADD CONSTRAINT `fk_room_players_room`
    FOREIGN KEY (`room_code`) REFERENCES `ddz_rooms` (`room_code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- 添加外键：player_id -> ddz_players.id
ALTER TABLE `ddz_room_players`
    ADD CONSTRAINT `fk_room_players_player`
    FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- 5. 验证修复结果
SELECT
    '修复完成，当前外键约束：' AS message;

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = DATABASE()
    AND (
        (TABLE_NAME = 'ddz_rooms' AND REFERENCED_TABLE_NAME IS NOT NULL)
        OR (TABLE_NAME = 'ddz_room_players' AND REFERENCED_TABLE_NAME IS NOT NULL)
    );
