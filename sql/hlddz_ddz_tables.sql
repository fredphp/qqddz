-- =============================================
-- 在 hlddz 数据库中创建 DDZ 相关表
-- 因为游戏服务器配置连接的是 hlddz 数据库
-- =============================================

USE `hlddz`;

-- =============================================
-- 玩家表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_players` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '玩家ID',
    `username` VARCHAR(64) NULL DEFAULT NULL COMMENT '用户名',
    `nickname` VARCHAR(64) NOT NULL COMMENT '昵称',
    `avatar` VARCHAR(256) DEFAULT '' COMMENT '头像URL',
    `gender` TINYINT UNSIGNED DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    `gold` BIGINT NOT NULL DEFAULT 0 COMMENT '金币余额',
    `diamond` INT NOT NULL DEFAULT 0 COMMENT '钻石余额',
    `experience` INT NOT NULL DEFAULT 0 COMMENT '经验值',
    `level` INT NOT NULL DEFAULT 1 COMMENT '等级',
    `vip_level` INT NOT NULL DEFAULT 0 COMMENT 'VIP等级',
    `win_count` INT NOT NULL DEFAULT 0 COMMENT '胜场数',
    `lose_count` INT NOT NULL DEFAULT 0 COMMENT '负场数',
    `landlord_count` INT NOT NULL DEFAULT 0 COMMENT '当地主次数',
    `farmer_count` INT NOT NULL DEFAULT 0 COMMENT '当农民次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-封禁',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(64) DEFAULT '' COMMENT '最后登录IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_username` (`username`),
    UNIQUE KEY `idx_nickname` (`nickname`),
    KEY `idx_gold` (`gold`),
    KEY `idx_level` (`level`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩家表';

-- =============================================
-- 用户账户表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_user_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '关联玩家ID',
    `phone` VARCHAR(20) NULL DEFAULT NULL COMMENT '手机号',
    `password` VARCHAR(128) NULL DEFAULT NULL COMMENT '密码(加密存储,可选)',
    `wx_openid` VARCHAR(64) NULL DEFAULT NULL COMMENT '微信OpenID',
    `wx_unionid` VARCHAR(64) NULL DEFAULT NULL COMMENT '微信UnionID',
    `wx_session_key` VARCHAR(64) NULL DEFAULT NULL COMMENT '微信会话密钥',
    `wx_nickname` VARCHAR(64) NULL DEFAULT NULL COMMENT '微信昵称',
    `wx_avatar` VARCHAR(256) NULL DEFAULT NULL COMMENT '微信头像URL',
    `login_type` TINYINT NOT NULL DEFAULT 1 COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `token` VARCHAR(128) NULL DEFAULT NULL COMMENT '登录Token',
    `token_expire_at` DATETIME NULL DEFAULT NULL COMMENT 'Token过期时间',
    `refresh_token` VARCHAR(128) NULL DEFAULT NULL COMMENT '刷新Token',
    `refresh_token_expire_at` DATETIME NULL DEFAULT NULL COMMENT '刷新Token过期时间',
    `device_id` VARCHAR(64) NULL DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) NULL DEFAULT NULL COMMENT '设备类型: ios, android, web',
    `last_login_at` DATETIME NULL DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(64) NULL DEFAULT NULL COMMENT '最后登录IP',
    `login_count` INT NOT NULL DEFAULT 0 COMMENT '登录次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-封禁',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_player_id` (`player_id`),
    UNIQUE KEY `idx_phone` (`phone`),
    UNIQUE KEY `idx_wx_openid` (`wx_openid`),
    INDEX `idx_token` (`token`),
    INDEX `idx_wx_unionid` (`wx_unionid`),
    INDEX `idx_status` (`status`),
    INDEX `idx_last_login_at` (`last_login_at`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户表';

-- =============================================
-- 登录日志表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `account_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
    `login_type` TINYINT NOT NULL COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `login_result` TINYINT NOT NULL COMMENT '登录结果: 0-失败, 1-成功',
    `fail_reason` VARCHAR(128) NULL DEFAULT NULL COMMENT '失败原因',
    `ip` VARCHAR(64) NULL DEFAULT NULL COMMENT '登录IP',
    `device_id` VARCHAR(64) NULL DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) NULL DEFAULT NULL COMMENT '设备类型',
    `user_agent` VARCHAR(256) NULL DEFAULT NULL COMMENT 'User-Agent',
    `location` VARCHAR(64) NULL DEFAULT NULL COMMENT '登录地点(IP解析)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `idx_player_id` (`player_id`) USING BTREE,
    INDEX `idx_account_id` (`account_id`) USING BTREE,
    INDEX `idx_login_type` (`login_type`) USING BTREE,
    INDEX `idx_created_at` (`created_at`) USING BTREE,
    INDEX `idx_login_log_player_time` (`player_id`, `created_at`) USING BTREE,
    INDEX `idx_login_log_result` (`login_result`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- =============================================
-- 短信验证码记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_sms_codes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `code` VARCHAR(10) NOT NULL COMMENT '验证码',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型: 1-登录, 2-注册, 3-绑定手机, 4-修改密码',
    `is_used` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已使用: 0-否, 1-是',
    `expire_at` DATETIME NOT NULL COMMENT '过期时间',
    `used_at` DATETIME NULL DEFAULT NULL COMMENT '使用时间',
    `ip` VARCHAR(64) NULL DEFAULT NULL COMMENT '请求IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `idx_phone` (`phone`) USING BTREE,
    INDEX `idx_phone_code` (`phone`, `code`) USING BTREE,
    INDEX `idx_expire_at` (`expire_at`) USING BTREE,
    INDEX `idx_created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信验证码记录表';

-- =============================================
-- 房间配置表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_room_config` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `room_name` VARCHAR(64) NOT NULL COMMENT '房间名称',
    `room_type` TINYINT NOT NULL DEFAULT 1 COMMENT '房间类型: 1-普通场, 2-高级场, 3-富豪场, 4-至尊场',
    `base_score` INT NOT NULL DEFAULT 1 COMMENT '底分',
    `multiplier` INT NOT NULL DEFAULT 1 COMMENT '初始倍数',
    `min_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '最低入场金币',
    `max_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '最高入场金币(0表示无限制)',
    `bot_enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否允许机器人: 0-否, 1-是',
    `bot_count` INT NOT NULL DEFAULT 0 COMMENT '房间机器人数量',
    `fee_rate` DECIMAL(5,4) NOT NULL DEFAULT 0.0000 COMMENT '手续费率',
    `max_round` INT NOT NULL DEFAULT 20 COMMENT '最大回合数',
    `timeout_seconds` INT NOT NULL DEFAULT 30 COMMENT '操作超时时间(秒)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-关闭, 1-开启',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
    `description` VARCHAR(256) DEFAULT '' COMMENT '房间描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_room_type` (`room_type`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间配置表';

-- 插入房间配置数据（如果不存在）
INSERT IGNORE INTO `ddz_room_config` VALUES 
(1, '新手场', 1, 1, 1, 1000, 50000, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', NOW(), NOW(), NULL),
(2, '普通场', 2, 2, 1, 50000, 200000, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', NOW(), NOW(), NULL),
(3, '高级场', 3, 5, 2, 200000, 1000000, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', NOW(), NOW(), NULL),
(4, '富豪场', 4, 10, 3, 1000000, 5000000, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', NOW(), NOW(), NULL),
(5, '至尊场', 5, 20, 5, 5000000, 0, 0, 0, 0.0500, 20, 15, 1, 5, '底分20,倍数5,顶级玩家对决,无上限', NOW(), NOW(), NULL);

-- =============================================
-- 游戏记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_game_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
    `game_id` VARCHAR(64) NOT NULL COMMENT '游戏唯一标识(UUID)',
    `room_id` VARCHAR(64) NOT NULL COMMENT '房间ID',
    `room_type` TINYINT NOT NULL DEFAULT 1 COMMENT '房间类型',
    `landlord_id` BIGINT UNSIGNED NOT NULL COMMENT '地主玩家ID',
    `farmer1_id` BIGINT UNSIGNED NOT NULL COMMENT '农民1玩家ID',
    `farmer2_id` BIGINT UNSIGNED NOT NULL COMMENT '农民2玩家ID',
    `base_score` INT NOT NULL DEFAULT 1 COMMENT '底分',
    `multiplier` INT NOT NULL DEFAULT 1 COMMENT '最终倍数',
    `bomb_count` INT NOT NULL DEFAULT 0 COMMENT '炸弹数量',
    `spring` TINYINT NOT NULL DEFAULT 0 COMMENT '是否春天: 0-否, 1-地主春天, 2-反春天',
    `result` TINYINT NOT NULL COMMENT '结果: 1-地主胜, 2-农民胜',
    `landlord_win_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '地主输赢金币(正为赢,负为输)',
    `farmer1_win_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
    `farmer2_win_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
    `started_at` DATETIME NOT NULL COMMENT '开始时间',
    `ended_at` DATETIME NULL DEFAULT NULL COMMENT '结束时间',
    `duration_seconds` INT NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_game_id`(`game_id`),
    INDEX `idx_room_id`(`room_id`),
    INDEX `idx_landlord_id`(`landlord_id`),
    INDEX `idx_farmer1_id`(`farmer1_id`),
    INDEX `idx_farmer2_id`(`farmer2_id`),
    INDEX `idx_started_at`(`started_at`),
    INDEX `idx_result`(`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表';

-- =============================================
-- 玩家统计表
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_player_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `stat_date` DATE NOT NULL COMMENT '统计日期',
    `total_games` INT NOT NULL DEFAULT 0 COMMENT '总场次',
    `win_games` INT NOT NULL DEFAULT 0 COMMENT '胜场',
    `lose_games` INT NOT NULL DEFAULT 0 COMMENT '负场',
    `win_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT '胜率(%)',
    `landlord_games` INT NOT NULL DEFAULT 0 COMMENT '当地主场次',
    `landlord_wins` INT NOT NULL DEFAULT 0 COMMENT '当地主胜场',
    `farmer_games` INT NOT NULL DEFAULT 0 COMMENT '当农民场次',
    `farmer_wins` INT NOT NULL DEFAULT 0 COMMENT '当农民胜场',
    `total_gold_change` BIGINT NOT NULL DEFAULT 0 COMMENT '总金币变化',
    `max_win_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '单局最大赢金',
    `max_lose_gold` BIGINT NOT NULL DEFAULT 0 COMMENT '单局最大输金',
    `total_bombs` INT NOT NULL DEFAULT 0 COMMENT '炸弹总数',
    `total_rockets` INT NOT NULL DEFAULT 0 COMMENT '火箭总数',
    `spring_count` INT NOT NULL DEFAULT 0 COMMENT '春天次数',
    `anti_spring_count` INT NOT NULL DEFAULT 0 COMMENT '反春天次数',
    `avg_game_duration` INT NOT NULL DEFAULT 0 COMMENT '平均游戏时长(秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_player_date`(`player_id`, `stat_date`),
    INDEX `idx_player_id`(`player_id`),
    INDEX `idx_stat_date`(`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩家统计表';

-- 执行成功提示
SELECT '✅ hlddz 数据库 DDZ 表创建完成！' AS message;
