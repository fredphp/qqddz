-- =============================================
-- 索引优化脚本 - 提升查询性能
-- =============================================

USE `ddz_game`;

-- =============================================
-- 用户账户表索引优化
-- =============================================
-- 复合索引：常用查询组合
CREATE INDEX IF NOT EXISTS idx_account_status_login ON ddz_user_accounts (status, last_login_at);
CREATE INDEX IF NOT EXISTS idx_account_phone_status ON ddz_user_accounts (phone, status);
CREATE INDEX IF NOT EXISTS idx_account_openid_status ON ddz_user_accounts (wx_openid, status);

-- =============================================
-- 登录日志表索引优化
-- =============================================
CREATE INDEX IF NOT EXISTS idx_login_log_player_time ON ddz_login_logs (player_id, created_at);
CREATE INDEX IF NOT EXISTS idx_login_log_result ON ddz_login_logs (login_result, created_at);

-- =============================================
-- 短信验证码表索引优化
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sms_phone_type ON ddz_sms_codes (phone, type);

-- =============================================
-- 清理过期数据存储过程
-- =============================================
DELIMITER //

-- 清理过期的短信验证码(保留7天)
CREATE PROCEDURE IF NOT EXISTS `sp_clean_expired_sms_codes`()
BEGIN
    DELETE FROM ddz_sms_codes 
    WHERE expire_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    SELECT ROW_COUNT() AS deleted_count;
END //

-- 清理旧的登录日志(保留90天)
CREATE PROCEDURE IF NOT EXISTS `sp_clean_old_login_logs`()
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

-- 每天凌晨2点清理过期短信验证码
CREATE EVENT IF NOT EXISTS `evt_clean_sms_codes`
ON SCHEDULE EVERY 1 DAY STARTS CONCAT(DATE(NOW() + INTERVAL 1 DAY), ' 02:00:00')
DO CALL sp_clean_expired_sms_codes();

-- 每周日凌晨3点清理旧登录日志
CREATE EVENT IF NOT EXISTS `evt_clean_login_logs`
ON SCHEDULE EVERY 1 WEEK STARTS CONCAT(DATE(NOW() + INTERVAL 1 WEEK), ' 03:00:00')
DO CALL sp_clean_old_login_logs();
