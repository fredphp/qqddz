-- =============================================
-- 索引优化脚本 - 提升查询性能
-- =============================================

USE `ddz_game`;

-- =============================================
-- 用户账户表索引优化
-- =============================================
-- 复合索引：常用查询组合

-- 创建索引（如果不存在）
-- idx_account_status_login
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_user_accounts' AND INDEX_NAME = 'idx_account_status_login');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_account_status_login ON ddz_user_accounts (status, last_login_at)',
    'SELECT ''Index idx_account_status_login already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_account_phone_status
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_user_accounts' AND INDEX_NAME = 'idx_account_phone_status');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_account_phone_status ON ddz_user_accounts (phone, status)',
    'SELECT ''Index idx_account_phone_status already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_account_openid_status
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_user_accounts' AND INDEX_NAME = 'idx_account_openid_status');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_account_openid_status ON ddz_user_accounts (wx_openid, status)',
    'SELECT ''Index idx_account_openid_status already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 登录日志表索引优化
-- =============================================
-- idx_login_log_player_time
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_login_logs' AND INDEX_NAME = 'idx_login_log_player_time');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_login_log_player_time ON ddz_login_logs (player_id, created_at)',
    'SELECT ''Index idx_login_log_player_time already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_login_log_result
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_login_logs' AND INDEX_NAME = 'idx_login_log_result');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_login_log_result ON ddz_login_logs (login_result, created_at)',
    'SELECT ''Index idx_login_log_result already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 短信验证码表索引优化
-- =============================================
-- idx_sms_phone_type
SET @exist_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ddz_sms_codes' AND INDEX_NAME = 'idx_sms_phone_type');
SET @sql := IF(@exist_idx = 0,
    'CREATE INDEX idx_sms_phone_type ON ddz_sms_codes (phone, type)',
    'SELECT ''Index idx_sms_phone_type already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 清理过期数据存储过程
-- =============================================
DELIMITER //

-- 清理过期的短信验证码(保留7天)
DROP PROCEDURE IF EXISTS `sp_clean_expired_sms_codes`//
CREATE PROCEDURE `sp_clean_expired_sms_codes`()
BEGIN
    DELETE FROM ddz_sms_codes
    WHERE expire_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

    SELECT ROW_COUNT() AS deleted_count;
END //

-- 清理旧的登录日志(保留90天)
DROP PROCEDURE IF EXISTS `sp_clean_old_login_logs`//
CREATE PROCEDURE `sp_clean_old_login_logs`()
BEGIN
    DELETE FROM ddz_login_logs
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

    SELECT ROW_COUNT() AS deleted_count;
END //

DELIMITER ;

-- =============================================
-- 事件调度器(需要开启事件调度器)
-- =============================================
-- 开启事件调度器
SET GLOBAL event_scheduler = ON;

-- 删除已存在的事件（如果需要重新创建）
DROP EVENT IF EXISTS `evt_clean_sms_codes`;
DROP EVENT IF EXISTS `evt_clean_login_logs`;

-- 每天凌晨2点清理过期短信验证码
CREATE EVENT `evt_clean_sms_codes`
ON SCHEDULE EVERY 1 DAY STARTS CONCAT(DATE(NOW() + INTERVAL 1 DAY), ' 02:00:00')
DO CALL sp_clean_expired_sms_codes();

-- 每周凌晨3点清理旧登录日志
CREATE EVENT `evt_clean_login_logs`
ON SCHEDULE EVERY 1 WEEK STARTS CONCAT(DATE(NOW() + INTERVAL 1 WEEK), ' 03:00:00')
DO CALL sp_clean_old_login_logs();
