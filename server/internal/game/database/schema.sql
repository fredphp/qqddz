-- =============================================
-- 斗地主游戏数据库 - ddz_game
-- 独立于admin后台的hlddz数据库
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `ddz_game` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `ddz_game`;

-- =============================================
-- 1. 玩家表 (ddz_players)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_players` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '玩家ID',
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
    UNIQUE KEY `idx_nickname` (`nickname`),
    KEY `idx_gold` (`gold`),
    KEY `idx_level` (`level`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩家表';

-- =============================================
-- 2. 房间配置表 (ddz_room_config)
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

-- =============================================
-- 3. 房间表 (ddz_rooms)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_rooms` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '房间ID(自增主键)',
    `room_code` VARCHAR(10) NOT NULL COMMENT '房间号(业务使用，如123456)',
    `room_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '房间名称',
    `room_config_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID(关联ddz_room_config表)',
    `room_type` TINYINT NOT NULL DEFAULT 1 COMMENT '房间类型: 1-普通场, 2-高级场, 3-富豪场, 4-至尊场',
    `room_category` TINYINT NOT NULL DEFAULT 1 COMMENT '房间分类: 1-普通场, 2-竞技场',
    `creator_id` BIGINT UNSIGNED NOT NULL COMMENT '创建者玩家ID',
    `player_count` INT NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
    `max_players` INT NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-已关闭, 1-等待中, 2-游戏中, 3-已结束',
    `base_score` INT NOT NULL DEFAULT 1 COMMENT '底分',
    `multiplier` INT NOT NULL DEFAULT 1 COMMENT '倍数',
    `player1_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '玩家1 ID',
    `player2_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '玩家2 ID',
    `player3_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '玩家3 ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `ended_at` DATETIME DEFAULT NULL COMMENT '结束时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_room_code` (`room_code`),
    KEY `idx_room_config_id` (`room_config_id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间表';

-- =============================================
-- 4. 游戏记录表 (ddz_game_records)
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
    `ended_at` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration_seconds` INT NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_game_id` (`game_id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_landlord_id` (`landlord_id`),
    KEY `idx_farmer1_id` (`farmer1_id`),
    KEY `idx_farmer2_id` (`farmer2_id`),
    KEY `idx_started_at` (`started_at`),
    KEY `idx_result` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表';

-- =============================================
-- 4. 发牌日志表 (ddz_deal_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_deal_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `game_id` VARCHAR(64) NOT NULL COMMENT '游戏唯一标识',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `player_role` TINYINT NOT NULL COMMENT '玩家角色: 1-地主, 2-农民',
    `hand_cards` VARCHAR(64) NOT NULL COMMENT '手牌(逗号分隔的牌编码)',
    `cards_count` INT NOT NULL DEFAULT 0 COMMENT '手牌数量',
    `landlord_cards` VARCHAR(32) DEFAULT NULL COMMENT '底牌(仅地主有)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_game_id` (`game_id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发牌日志表';

-- =============================================
-- 5. 叫地主日志表 (ddz_bid_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_bid_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `game_id` VARCHAR(64) NOT NULL COMMENT '游戏唯一标识',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `bid_order` INT NOT NULL COMMENT '叫地主顺序(1-3)',
    `bid_type` TINYINT NOT NULL COMMENT '叫地主类型: 0-不叫, 1-叫地主, 2-抢地主',
    `bid_score` INT NOT NULL DEFAULT 0 COMMENT '叫分(1-3分)',
    `is_success` TINYINT NOT NULL DEFAULT 0 COMMENT '是否成功成为地主',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_game_id` (`game_id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_bid_order` (`bid_order`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='叫地主日志表';

-- =============================================
-- 6. 出牌日志表 (ddz_play_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_play_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `game_id` VARCHAR(64) NOT NULL COMMENT '游戏唯一标识',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `player_role` TINYINT NOT NULL COMMENT '玩家角色: 1-地主, 2-农民',
    `round_num` INT NOT NULL COMMENT '回合数',
    `play_order` INT NOT NULL COMMENT '本回合出牌顺序(1-3)',
    `play_type` TINYINT NOT NULL COMMENT '出牌类型: 1-出牌, 2-不出/过, 3-超时自动出牌',
    `cards` VARCHAR(64) DEFAULT '' COMMENT '出的牌(逗号分隔的牌编码)',
    `cards_count` INT NOT NULL DEFAULT 0 COMMENT '出牌数量',
    `card_pattern` VARCHAR(32) DEFAULT '' COMMENT '牌型: 单牌, 对子, 三带一, 炸弹, 顺子等',
    `is_bomb` TINYINT NOT NULL DEFAULT 0 COMMENT '是否炸弹',
    `is_rocket` TINYINT NOT NULL DEFAULT 0 COMMENT '是否火箭(王炸)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_game_id` (`game_id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_round_num` (`round_num`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出牌日志表';

-- =============================================
-- 7. 玩家统计表 (ddz_player_stats)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_player_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `stat_date` DATE NOT NULL COMMENT '统计日期',
    `total_games` INT NOT NULL DEFAULT 0 COMMENT '总场次',
    `win_games` INT NOT NULL DEFAULT 0 COMMENT '胜场',
    `lose_games` INT NOT NULL DEFAULT 0 COMMENT '负场',
    `win_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '胜率(%)',
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
    UNIQUE KEY `idx_player_date` (`player_id`, `stat_date`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_stat_date` (`stat_date`),
    KEY `idx_win_rate` (`win_rate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩家统计表';

-- =============================================
-- 插入默认房间配置数据
-- =============================================
INSERT INTO `ddz_room_config` 
(`room_name`, `room_type`, `base_score`, `multiplier`, `min_gold`, `max_gold`, `bot_enabled`, `bot_count`, `fee_rate`, `max_round`, `timeout_seconds`, `status`, `sort_order`, `description`) 
VALUES
('新手场', 1, 1, 1, 1000, 50000, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场'),
('普通场', 2, 2, 1, 50000, 200000, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家'),
('高级场', 3, 5, 2, 200000, 1000000, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决'),
('富豪场', 4, 10, 3, 1000000, 5000000, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属'),
('至尊场', 5, 20, 5, 5000000, 0, 0, 0, 0.0500, 20, 15, 1, 5, '底分20,倍数5,顶级玩家对决,无上限')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- =============================================
-- 创建视图 - 玩家综合统计视图
-- =============================================
CREATE OR REPLACE VIEW `v_player_overall_stats` AS
SELECT 
    p.id AS player_id,
    p.nickname,
    p.avatar,
    p.gold,
    p.level,
    p.win_count,
    p.lose_count,
    p.landlord_count,
    p.farmer_count,
    CASE 
        WHEN (p.win_count + p.lose_count) = 0 THEN 0
        ELSE ROUND(p.win_count * 100.0 / (p.win_count + p.lose_count), 2)
    END AS win_rate,
    (p.win_count + p.lose_count) AS total_games
FROM `ddz_players` p
WHERE p.deleted_at IS NULL;

-- =============================================
-- 创建视图 - 最近游戏记录视图
-- =============================================
CREATE OR REPLACE VIEW `v_recent_games` AS
SELECT 
    gr.game_id,
    gr.room_id,
    gr.room_type,
    rc.room_name,
    gr.landlord_id,
    p1.nickname AS landlord_nickname,
    gr.farmer1_id,
    p2.nickname AS farmer1_nickname,
    gr.farmer2_id,
    p3.nickname AS farmer2_nickname,
    gr.base_score,
    gr.multiplier,
    gr.bomb_count,
    gr.spring,
    gr.result,
    gr.landlord_win_gold,
    gr.farmer1_win_gold,
    gr.farmer2_win_gold,
    gr.started_at,
    gr.ended_at,
    gr.duration_seconds
FROM `ddz_game_records` gr
LEFT JOIN `ddz_room_config` rc ON gr.room_type = rc.room_type
LEFT JOIN `ddz_players` p1 ON gr.landlord_id = p1.id
LEFT JOIN `ddz_players` p2 ON gr.farmer1_id = p2.id
LEFT JOIN `ddz_players` p3 ON gr.farmer2_id = p3.id
ORDER BY gr.started_at DESC;

-- =============================================
-- 创建存储过程 - 更新玩家统计
-- =============================================
DELIMITER //

CREATE PROCEDURE `sp_update_player_stats`(
    IN p_player_id BIGINT,
    IN p_stat_date DATE
)
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
END //

DELIMITER ;

-- =============================================
-- 创建索引优化查询性能
-- =============================================
-- 游戏记录复合索引
CREATE INDEX idx_game_records_composite ON ddz_game_records (landlord_id, started_at);
CREATE INDEX idx_game_records_composite2 ON ddz_game_records (farmer1_id, started_at);
CREATE INDEX idx_game_records_composite3 ON ddz_game_records (farmer2_id, started_at);

-- 出牌日志复合索引
CREATE INDEX idx_play_logs_composite ON ddz_play_logs (game_id, round_num, play_order);

-- =============================================
-- 8. 用户账户表 (ddz_user_accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_user_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '关联玩家ID',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `password` VARCHAR(128) DEFAULT NULL COMMENT '密码(加密存储)',
    `wx_open_id` VARCHAR(64) DEFAULT NULL COMMENT '微信OpenID',
    `wx_union_id` VARCHAR(64) DEFAULT NULL COMMENT '微信UnionID',
    `wx_session_key` VARCHAR(64) DEFAULT NULL COMMENT '微信会话密钥',
    `wx_nickname` VARCHAR(64) DEFAULT NULL COMMENT '微信昵称',
    `wx_avatar` VARCHAR(256) DEFAULT NULL COMMENT '微信头像URL',
    `login_type` TINYINT NOT NULL DEFAULT 1 COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `token` VARCHAR(128) DEFAULT NULL COMMENT '登录Token',
    `token_expire_at` DATETIME DEFAULT NULL COMMENT 'Token过期时间',
    `refresh_token` VARCHAR(128) DEFAULT NULL COMMENT '刷新Token',
    `refresh_token_expire_at` DATETIME DEFAULT NULL COMMENT '刷新Token过期时间',
    `device_id` VARCHAR(64) DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) DEFAULT NULL COMMENT '设备类型: ios/android/web',
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
    UNIQUE KEY `idx_wx_open_id` (`wx_open_id`),
    KEY `idx_token` (`token`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户表';

-- =============================================
-- 9. 登录日志表 (ddz_login_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS `ddz_login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `player_id` BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    `account_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '账户ID',
    `login_type` TINYINT NOT NULL COMMENT '登录类型: 1-手机号, 2-微信, 3-游客',
    `login_result` TINYINT NOT NULL COMMENT '登录结果: 0-失败, 1-成功',
    `fail_reason` VARCHAR(128) DEFAULT NULL COMMENT '失败原因',
    `ip` VARCHAR(64) DEFAULT NULL COMMENT '登录IP',
    `device_id` VARCHAR(64) DEFAULT NULL COMMENT '设备ID',
    `device_type` VARCHAR(32) DEFAULT NULL COMMENT '设备类型',
    `user_agent` VARCHAR(256) DEFAULT NULL COMMENT 'User-Agent',
    `location` VARCHAR(64) DEFAULT NULL COMMENT '登录地点',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_account_id` (`account_id`),
    KEY `idx_login_type` (`login_type`),
    KEY `idx_login_result` (`login_result`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- =============================================
-- 10. 短信验证码表 (ddz_sms_codes)
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
    KEY `idx_type` (`type`),
    KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信验证码表';
