/*
 斗地主游戏数据库 - 安全初始化脚本
 可以重复执行，不会报错
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 确保数据库存在
CREATE DATABASE IF NOT EXISTS `ddz_game` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `ddz_game`;

-- =============================================
-- 删除已存在的对象（按依赖顺序）
-- =============================================

-- 删除事件
DROP EVENT IF EXISTS `evt_clean_login_logs`;
DROP EVENT IF EXISTS `evt_clean_sms_codes`;

-- 删除存储过程
DROP PROCEDURE IF EXISTS `sp_clean_expired_sms_codes`;
DROP PROCEDURE IF EXISTS `sp_clean_old_login_logs`;
DROP PROCEDURE IF EXISTS `sp_update_player_stats`;

-- 删除视图
DROP VIEW IF EXISTS `v_player_overall_stats`;
DROP VIEW IF EXISTS `v_recent_games`;
DROP VIEW IF EXISTS `v_user_info`;

-- =============================================
-- 创建表
-- =============================================

-- 叫地主日志表
CREATE TABLE IF NOT EXISTS `ddz_bid_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` int NOT NULL COMMENT '叫地主顺序(1-3)',
  `bid_type` tinyint NOT NULL COMMENT '叫地主类型: 0-不叫, 1-叫地主, 2-抢地主',
  `bid_score` int NOT NULL DEFAULT 0 COMMENT '叫分(1-3分)',
  `is_success` tinyint NOT NULL DEFAULT 0 COMMENT '是否成功成为地主',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_bid_order`(`bid_order` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '叫地主日志表' ROW_FORMAT = Dynamic;

-- 发牌日志表
CREATE TABLE IF NOT EXISTS `ddz_deal_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint NOT NULL COMMENT '玩家角色: 1-地主, 2-农民',
  `hand_cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌(逗号分隔的牌编码)',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌(仅地主有)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '发牌日志表' ROW_FORMAT = Dynamic;

-- 游戏记录表
CREATE TABLE IF NOT EXISTS `ddz_game_records` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识(UUID)',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` int NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` tinyint NOT NULL DEFAULT 0 COMMENT '是否春天: 0-否, 1-地主春天, 2-反春天',
  `result` tinyint NOT NULL COMMENT '结果: 1-地主胜, 2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币(正为赢,负为输)',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_result`(`result` ASC) USING BTREE,
  INDEX `idx_game_records_composite`(`landlord_id` ASC, `started_at` ASC) USING BTREE,
  INDEX `idx_game_records_composite2`(`farmer1_id` ASC, `started_at` ASC) USING BTREE,
  INDEX `idx_game_records_composite3`(`farmer2_id` ASC, `started_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏记录表' ROW_FORMAT = Dynamic;

-- 登录日志表
CREATE TABLE IF NOT EXISTS `ddz_login_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `account_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
  `login_type` tinyint NOT NULL COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
  `login_result` tinyint NOT NULL COMMENT '登录结果: 0-失败, 1-成功',
  `fail_reason` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点(IP解析)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_login_type`(`login_type` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_login_log_player_time`(`player_id` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_login_log_result`(`login_result` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '登录日志表' ROW_FORMAT = Dynamic;

-- 出牌日志表
CREATE TABLE IF NOT EXISTS `ddz_play_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint NOT NULL COMMENT '玩家角色: 1-地主, 2-农民',
  `round_num` int NOT NULL COMMENT '回合数',
  `play_order` int NOT NULL COMMENT '本回合出牌顺序(1-3)',
  `play_type` tinyint NOT NULL COMMENT '出牌类型: 1-出牌, 2-不出/过, 3-超时自动出牌',
  `cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '出的牌(逗号分隔的牌编码)',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '牌型: 单牌, 对子, 三带一, 炸弹, 顺子等',
  `is_bomb` tinyint NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint NOT NULL DEFAULT 0 COMMENT '是否火箭(王炸)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_play_logs_composite`(`game_id` ASC, `round_num` ASC, `play_order` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '出牌日志表' ROW_FORMAT = Dynamic;

-- 玩家统计表
CREATE TABLE IF NOT EXISTS `ddz_player_stats` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `total_games` int NOT NULL DEFAULT 0 COMMENT '总场次',
  `win_games` int NOT NULL DEFAULT 0 COMMENT '胜场',
  `lose_games` int NOT NULL DEFAULT 0 COMMENT '负场',
  `win_rate` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '胜率(%)',
  `landlord_games` int NOT NULL DEFAULT 0 COMMENT '当地主场次',
  `landlord_wins` int NOT NULL DEFAULT 0 COMMENT '当地主胜场',
  `farmer_games` int NOT NULL DEFAULT 0 COMMENT '当农民场次',
  `farmer_wins` int NOT NULL DEFAULT 0 COMMENT '当农民胜场',
  `total_gold_change` bigint NOT NULL DEFAULT 0 COMMENT '总金币变化',
  `max_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大赢金',
  `max_lose_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大输金',
  `total_bombs` int NOT NULL DEFAULT 0 COMMENT '炸弹总数',
  `total_rockets` int NOT NULL DEFAULT 0 COMMENT '火箭总数',
  `spring_count` int NOT NULL DEFAULT 0 COMMENT '春天次数',
  `anti_spring_count` int NOT NULL DEFAULT 0 COMMENT '反春天次数',
  `avg_game_duration` int NOT NULL DEFAULT 0 COMMENT '平均游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_player_date`(`player_id` ASC, `stat_date` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_stat_date`(`stat_date` ASC) USING BTREE,
  INDEX `idx_win_rate`(`win_rate` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '玩家统计表' ROW_FORMAT = Dynamic;

-- 玩家表
CREATE TABLE IF NOT EXISTS `ddz_players` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '玩家ID',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `avatar` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '头像URL',
  `gender` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `gold` bigint NOT NULL DEFAULT 0 COMMENT '金币余额',
  `diamond` int NOT NULL DEFAULT 0 COMMENT '钻石余额',
  `experience` int NOT NULL DEFAULT 0 COMMENT '经验值',
  `level` int NOT NULL DEFAULT 1 COMMENT '等级',
  `vip_level` int NOT NULL DEFAULT 0 COMMENT 'VIP等级',
  `win_count` int NOT NULL DEFAULT 0 COMMENT '胜场数',
  `lose_count` int NOT NULL DEFAULT 0 COMMENT '负场数',
  `landlord_count` int NOT NULL DEFAULT 0 COMMENT '当地主次数',
  `farmer_count` int NOT NULL DEFAULT 0 COMMENT '当农民次数',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-封禁',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '最后登录IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_nickname`(`nickname` ASC) USING BTREE,
  INDEX `idx_gold`(`gold` ASC) USING BTREE,
  INDEX `idx_level`(`level` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  UNIQUE INDEX `idx_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '玩家表' ROW_FORMAT = Dynamic;

-- 房间配置表
CREATE TABLE IF NOT EXISTS `ddz_room_config` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间名称',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型: 1-普通场, 2-高级场, 3-富豪场, 4-至尊场',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '初始倍数',
  `min_gold` bigint NOT NULL DEFAULT 0 COMMENT '最低入场金币',
  `max_gold` bigint NOT NULL DEFAULT 0 COMMENT '最高入场金币(0表示无限制)',
  `bot_enabled` tinyint NOT NULL DEFAULT 1 COMMENT '是否允许机器人: 0-否, 1-是',
  `bot_count` int NOT NULL DEFAULT 0 COMMENT '房间机器人数量',
  `fee_rate` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '手续费率',
  `max_round` int NOT NULL DEFAULT 20 COMMENT '最大回合数',
  `timeout_seconds` int NOT NULL DEFAULT 30 COMMENT '操作超时时间(秒)',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-关闭, 1-开启',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '房间描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间配置表' ROW_FORMAT = Dynamic;

-- 插入房间配置数据（如果不存在）
INSERT IGNORE INTO `ddz_room_config` VALUES 
(1, '新手场', 1, 1, 1, 1000, 50000, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', NOW(), NOW(), NULL),
(2, '普通场', 2, 2, 1, 50000, 200000, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', NOW(), NOW(), NULL),
(3, '高级场', 3, 5, 2, 200000, 1000000, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', NOW(), NOW(), NULL),
(4, '富豪场', 4, 10, 3, 1000000, 5000000, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', NOW(), NOW(), NULL),
(5, '至尊场', 5, 20, 5, 5000000, 0, 0, 0, 0.0500, 20, 15, 1, 5, '底分20,倍数5,顶级玩家对决,无上限', NOW(), NOW(), NULL);

-- 短信验证码记录表
CREATE TABLE IF NOT EXISTS `ddz_sms_codes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码',
  `type` tinyint NOT NULL DEFAULT 1 COMMENT '类型: 1-登录, 2-注册, 3-绑定手机, 4-修改密码',
  `is_used` tinyint NOT NULL DEFAULT 0 COMMENT '是否已使用: 0-否, 1-是',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `used_at` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_phone_code`(`phone` ASC, `code` ASC) USING BTREE,
  INDEX `idx_expire_at`(`expire_at` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_sms_phone_type`(`phone` ASC, `type` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '短信验证码记录表' ROW_FORMAT = Dynamic;

-- 用户账户表
CREATE TABLE IF NOT EXISTS `ddz_user_accounts` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '关联玩家ID',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码(加密存储,可选)',
  `wx_openid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_unionid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `wx_session_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信会话密钥',
  `wx_nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信昵称',
  `wx_avatar` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信头像URL',
  `login_type` tinyint NOT NULL DEFAULT 1 COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
  `token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录Token',
  `token_expire_at` datetime NULL DEFAULT NULL COMMENT 'Token过期时间',
  `refresh_token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '刷新Token',
  `refresh_token_expire_at` datetime NULL DEFAULT NULL COMMENT '刷新Token过期时间',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型: ios, android, web',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `login_count` int NOT NULL DEFAULT 0 COMMENT '登录次数',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-封禁',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  UNIQUE INDEX `idx_phone`(`phone` ASC) USING BTREE,
  UNIQUE INDEX `idx_wx_openid`(`wx_openid` ASC) USING BTREE,
  INDEX `idx_token`(`token` ASC) USING BTREE,
  INDEX `idx_wx_unionid`(`wx_unionid` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_last_login_at`(`last_login_at` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_account_status_login`(`status` ASC, `last_login_at` ASC) USING BTREE,
  INDEX `idx_account_phone_status`(`phone` ASC, `status` ASC) USING BTREE,
  INDEX `idx_account_openid_status`(`wx_openid` ASC, `status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户账户表' ROW_FORMAT = Dynamic;

-- =============================================
-- 创建视图
-- =============================================

CREATE OR REPLACE VIEW `v_player_overall_stats` AS 
SELECT 
    `p`.`id` AS `player_id`,
    `p`.`nickname` AS `nickname`,
    `p`.`avatar` AS `avatar`,
    `p`.`gold` AS `gold`,
    `p`.`level` AS `level`,
    `p`.`win_count` AS `win_count`,
    `p`.`lose_count` AS `lose_count`,
    `p`.`landlord_count` AS `landlord_count`,
    `p`.`farmer_count` AS `farmer_count`,
    (CASE WHEN ((`p`.`win_count` + `p`.`lose_count`) = 0) THEN 0 ELSE ROUND(((`p`.`win_count` * 100.0) / (`p`.`win_count` + `p`.`lose_count`)), 2) END) AS `win_rate`,
    (`p`.`win_count` + `p`.`lose_count`) AS `total_games` 
FROM `ddz_players` `p` 
WHERE (`p`.`deleted_at` IS NULL);

CREATE OR REPLACE VIEW `v_recent_games` AS 
SELECT 
    `gr`.`game_id` AS `game_id`,
    `gr`.`room_id` AS `room_id`,
    `gr`.`room_type` AS `room_type`,
    `rc`.`room_name` AS `room_name`,
    `gr`.`landlord_id` AS `landlord_id`,
    `p1`.`nickname` AS `landlord_nickname`,
    `gr`.`farmer1_id` AS `farmer1_id`,
    `p2`.`nickname` AS `farmer1_nickname`,
    `gr`.`farmer2_id` AS `farmer2_id`,
    `p3`.`nickname` AS `farmer2_nickname`,
    `gr`.`base_score` AS `base_score`,
    `gr`.`multiplier` AS `multiplier`,
    `gr`.`bomb_count` AS `bomb_count`,
    `gr`.`spring` AS `spring`,
    `gr`.`result` AS `result`,
    `gr`.`landlord_win_gold` AS `landlord_win_gold`,
    `gr`.`farmer1_win_gold` AS `farmer1_win_gold`,
    `gr`.`farmer2_win_gold` AS `farmer2_win_gold`,
    `gr`.`started_at` AS `started_at`,
    `gr`.`ended_at` AS `ended_at`,
    `gr`.`duration_seconds` AS `duration_seconds` 
FROM `ddz_game_records` `gr` 
LEFT JOIN `ddz_room_config` `rc` ON `gr`.`room_type` = `rc`.`room_type`
LEFT JOIN `ddz_players` `p1` ON `gr`.`landlord_id` = `p1`.`id`
LEFT JOIN `ddz_players` `p2` ON `gr`.`farmer1_id` = `p2`.`id`
LEFT JOIN `ddz_players` `p3` ON `gr`.`farmer2_id` = `p3`.`id`
ORDER BY `gr`.`started_at` DESC;

CREATE OR REPLACE VIEW `v_user_info` AS 
SELECT 
    `ua`.`id` AS `account_id`,
    `ua`.`player_id` AS `player_id`,
    `p`.`username` AS `username`,
    `p`.`nickname` AS `nickname`,
    `p`.`avatar` AS `avatar`,
    `p`.`gender` AS `gender`,
    `p`.`gold` AS `gold`,
    `p`.`diamond` AS `diamond`,
    `p`.`experience` AS `experience`,
    `p`.`level` AS `level`,
    `p`.`vip_level` AS `vip_level`,
    `p`.`win_count` AS `win_count`,
    `p`.`lose_count` AS `lose_count`,
    `p`.`landlord_count` AS `landlord_count`,
    `p`.`farmer_count` AS `farmer_count`,
    `ua`.`phone` AS `phone`,
    `ua`.`wx_openid` AS `wx_openid`,
    `ua`.`wx_nickname` AS `wx_nickname`,
    `ua`.`wx_avatar` AS `wx_avatar`,
    `ua`.`login_type` AS `login_type`,
    `ua`.`token` AS `token`,
    `ua`.`token_expire_at` AS `token_expire_at`,
    `ua`.`last_login_at` AS `last_login_at`,
    `ua`.`last_login_ip` AS `last_login_ip`,
    `p`.`status` AS `status`,
    `p`.`created_at` AS `player_created_at`,
    `ua`.`created_at` AS `account_created_at` 
FROM `ddz_user_accounts` `ua` 
LEFT JOIN `ddz_players` `p` ON `ua`.`player_id` = `p`.`id`
WHERE `ua`.`deleted_at` IS NULL AND `p`.`deleted_at` IS NULL;

-- =============================================
-- 创建存储过程
-- =============================================

DELIMITER ;;

CREATE PROCEDURE `sp_clean_expired_sms_codes`()
BEGIN
    DELETE FROM ddz_sms_codes
    WHERE expire_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    SELECT ROW_COUNT() AS deleted_count;
END
;;

CREATE PROCEDURE `sp_clean_old_login_logs`()
BEGIN
    DELETE FROM ddz_login_logs
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    SELECT ROW_COUNT() AS deleted_count;
END
;;

CREATE PROCEDURE `sp_update_player_stats`(IN p_player_id BIGINT, IN p_stat_date DATE)
BEGIN
    DECLARE v_total_games INT DEFAULT 0;
    DECLARE v_win_games INT DEFAULT 0;
    DECLARE v_lose_games INT DEFAULT 0;
    DECLARE v_landlord_games INT DEFAULT 0;
    DECLARE v_landlord_wins INT DEFAULT 0;
    DECLARE v_farmer_games INT DEFAULT 0;
    DECLARE v_farmer_wins INT DEFAULT 0;
    DECLARE v_total_gold BIGINT DEFAULT 0;
    DECLARE v_max_win BIGINT DEFAULT 0;
    DECLARE v_max_lose BIGINT DEFAULT 0;
    DECLARE v_avg_duration INT DEFAULT 0;
    DECLARE v_win_rate DECIMAL(5,2) DEFAULT 0.00;
    
    -- 统计当天作为地主的场次
    SELECT 
        COUNT(*),
        SUM(CASE WHEN gr.result = 1 THEN 1 ELSE 0 END)
    INTO v_landlord_games, v_landlord_wins
    FROM ddz_game_records gr
    WHERE gr.landlord_id = p_player_id
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 统计当天作为农民的场次
    SELECT 
        COUNT(*),
        SUM(CASE WHEN gr.result = 2 THEN 1 ELSE 0 END)
    INTO v_farmer_games, v_farmer_wins
    FROM ddz_game_records gr
    WHERE (gr.farmer1_id = p_player_id OR gr.farmer2_id = p_player_id)
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 计算总场次和胜负
    SET v_total_games = v_landlord_games + v_farmer_games;
    SET v_win_games = v_landlord_wins + v_farmer_wins;
    SET v_lose_games = v_total_games - v_win_games;
    
    -- 计算胜率
    IF v_total_games > 0 THEN
        SET v_win_rate = ROUND(v_win_games * 100.0 / v_total_games, 2);
    END IF;
    
    -- 计算金币变化
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN gr.landlord_id = p_player_id THEN gr.landlord_win_gold
                WHEN gr.farmer1_id = p_player_id THEN gr.farmer1_win_gold
                ELSE gr.farmer2_win_gold
            END
        ), 0)
    INTO v_total_gold
    FROM ddz_game_records gr
    WHERE (gr.landlord_id = p_player_id OR gr.farmer1_id = p_player_id OR gr.farmer2_id = p_player_id)
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 插入或更新统计记录
    INSERT INTO ddz_player_stats (
        player_id, stat_date, total_games, win_games, lose_games, win_rate,
        landlord_games, landlord_wins, farmer_games, farmer_wins,
        total_gold_change
    ) VALUES (
        p_player_id, p_stat_date, v_total_games, v_win_games, v_lose_games, v_win_rate,
        v_landlord_games, v_landlord_wins, v_farmer_games, v_farmer_wins,
        v_total_gold
    )
    ON DUPLICATE KEY UPDATE
        total_games = v_total_games,
        win_games = v_win_games,
        lose_games = v_lose_games,
        win_rate = v_win_rate,
        landlord_games = v_landlord_games,
        landlord_wins = v_landlord_wins,
        farmer_games = v_farmer_games,
        farmer_wins = v_farmer_wins,
        total_gold_change = v_total_gold,
        updated_at = CURRENT_TIMESTAMP;
END
;;

DELIMITER ;

-- =============================================
-- 创建事件（需要开启事件调度器）
-- =============================================

-- 确保事件调度器开启
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS `evt_clean_login_logs`;
CREATE EVENT `evt_clean_login_logs`
ON SCHEDULE EVERY 1 WEEK STARTS DATE_ADD(DATE(NOW()), INTERVAL 7 DAY) + INTERVAL 3 HOUR
DO CALL sp_clean_old_login_logs();

DROP EVENT IF EXISTS `evt_clean_sms_codes`;
CREATE EVENT `evt_clean_sms_codes`
ON SCHEDULE EVERY 1 DAY STARTS DATE_ADD(DATE(NOW()), INTERVAL 1 DAY) + INTERVAL 2 HOUR
DO CALL sp_clean_expired_sms_codes();

SET FOREIGN_KEY_CHECKS = 1;

-- 执行成功提示
SELECT '数据库初始化完成！' AS message;
