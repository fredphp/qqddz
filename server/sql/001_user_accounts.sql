-- =============================================
-- 用户账户表 - 用于登录认证
-- =============================================

USE `ddz_game`;

-- =============================================
-- 1. 用户账户表 (ddz_user_accounts)
-- 存储手机号、微信信息、token等登录相关数据
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_user_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '关联玩家ID',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `password` VARCHAR(128) DEFAULT NULL COMMENT '密码(加密存储,可选)',
    `wx_openid` VARCHAR(64) DEFAULT NULL COMMENT '微信OpenID',
    `wx_unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信UnionID',
    `wx_session_key` VARCHAR(64) DEFAULT NULL COMMENT '微信会话密钥',
    `wx_nickname` VARCHAR(64) DEFAULT NULL COMMENT '微信昵称',
    `wx_avatar` VARCHAR(256) DEFAULT NULL COMMENT '微信头像URL',
    `login_type` TINYINT NOT NULL DEFAULT 1 COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `token` VARCHAR(128) DEFAULT NULL COMMENT '登录Token',
    `token_expire_at` DATETIME DEFAULT NULL COMMENT 'Token过期时间',
    `refresh_token` VARCHAR(128) DEFAULT NULL COMMENT '刷新Token',
    `refresh_token_expire_at` DATETIME DEFAULT NULL COMMENT '刷新Token过期时间',
    `device_id` VARCHAR(64) DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) DEFAULT NULL COMMENT '设备类型: ios, android, web',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(64) DEFAULT NULL COMMENT '最后登录IP',
    `login_count` INT NOT NULL DEFAULT 0 COMMENT '登录次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-封禁',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_player_id` (`player_id`),
    UNIQUE KEY `idx_phone` (`phone`),
    UNIQUE KEY `idx_wx_openid` (`wx_openid`),
    KEY `idx_token` (`token`),
    KEY `idx_wx_unionid` (`wx_unionid`),
    KEY `idx_status` (`status`),
    KEY `idx_last_login_at` (`last_login_at`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户表';

-- =============================================
-- 2. 短信验证码记录表 (ddz_sms_codes)
-- 用于记录发送的短信验证码(测试阶段可不使用)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_sms_codes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `code` VARCHAR(10) NOT NULL COMMENT '验证码',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型: 1-登录, 2-注册, 3-绑定手机, 4-修改密码',
    `is_used` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已使用: 0-否, 1-是',
    `expire_at` DATETIME NOT NULL COMMENT '过期时间',
    `used_at` DATETIME DEFAULT NULL COMMENT '使用时间',
    `ip` VARCHAR(64) DEFAULT NULL COMMENT '请求IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_phone` (`phone`),
    KEY `idx_phone_code` (`phone`, `code`),
    KEY `idx_expire_at` (`expire_at`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信验证码记录表';

-- =============================================
-- 3. 登录日志表 (ddz_login_logs)
-- 记录用户登录日志
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `account_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '账户ID',
    `login_type` TINYINT NOT NULL COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `login_result` TINYINT NOT NULL COMMENT '登录结果: 0-失败, 1-成功',
    `fail_reason` VARCHAR(128) DEFAULT NULL COMMENT '失败原因',
    `ip` VARCHAR(64) DEFAULT NULL COMMENT '登录IP',
    `device_id` VARCHAR(64) DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) DEFAULT NULL COMMENT '设备类型',
    `user_agent` VARCHAR(256) DEFAULT NULL COMMENT 'User-Agent',
    `location` VARCHAR(64) DEFAULT NULL COMMENT '登录地点(IP解析)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_account_id` (`account_id`),
    KEY `idx_login_type` (`login_type`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- =============================================
-- 4. 为玩家表补充账户相关字段
-- =============================================
-- 如果玩家表还没有username字段，则添加
SET @dbname = DATABASE();
SET @tablename = 'ddz_players';
SET @columnname = 'username';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @columnname
    ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(64) DEFAULT NULL COMMENT ''用户名'' AFTER `nickname`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 为username创建唯一索引
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = 'idx_username'
    ) > 0,
    'SELECT 1',
    CONCAT('CREATE UNIQUE INDEX idx_username ON `', @tablename, '` (`username`)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- =============================================
-- 5. 初始数据 - 无需初始数据
-- =============================================

-- =============================================
-- 6. 创建视图 - 用户完整信息视图
-- =============================================
CREATE OR REPLACE VIEW `v_user_info` AS
SELECT 
    ua.id AS account_id,
    ua.player_id,
    p.username,
    p.nickname,
    p.avatar,
    p.gender,
    p.gold,
    p.diamond,
    p.experience,
    p.level,
    p.vip_level,
    p.win_count,
    p.lose_count,
    p.landlord_count,
    p.farmer_count,
    ua.phone,
    ua.wx_openid,
    ua.wx_nickname,
    ua.wx_avatar,
    ua.login_type,
    ua.token,
    ua.token_expire_at,
    ua.last_login_at,
    ua.last_login_ip,
    p.status,
    p.created_at AS player_created_at,
    ua.created_at AS account_created_at
FROM `ddz_user_accounts` ua
LEFT JOIN `ddz_players` p ON ua.player_id = p.id
WHERE ua.deleted_at IS NULL AND p.deleted_at IS NULL;

-- =============================================
-- 说明
-- =============================================
-- 登录流程:
-- 1. 手机号登录:
--    - 验证手机号格式(正则)
--    - 查找ddz_user_accounts表中是否有该手机号
--    - 如果有，更新token，返回登录成功
--    - 如果没有:
--      a. 在ddz_players表创建新玩家(自动生成虚拟昵称和用户名)
--      b. 在ddz_user_accounts表创建账户记录
--      c. 返回登录成功
--
-- 2. 微信登录:
--    - 调用微信API获取openid
--    - 查找ddz_user_accounts表中是否有该openid
--    - 如果有，更新token，返回登录成功
--    - 如果没有:
--      a. 在ddz_players表创建新玩家
--      b. 在ddz_user_accounts表创建账户记录
--      c. 返回登录成功
--
-- Token有效期建议:
-- - token: 7天
-- - refresh_token: 30天
-- =============================================
