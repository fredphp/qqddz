-- 添加竞技币字段到玩家表
-- 执行时间: 2024-01-XX
-- 描述: 为支持竞技场房间，添加新的竞技币字段

-- 1. 添加竞技币字段到玩家表
ALTER TABLE ddz_players ADD COLUMN arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '竞技币余额' AFTER gold;

-- 2. 添加竞技币变化字段到游戏记录表
ALTER TABLE ddz_game_records ADD COLUMN room_category TINYINT NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场' AFTER room_type;
ALTER TABLE ddz_game_records ADD COLUMN landlord_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币' AFTER landlord_win_gold;
ALTER TABLE ddz_game_records ADD COLUMN farmer1_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币' AFTER farmer1_win_gold;
ALTER TABLE ddz_game_records ADD COLUMN farmer2_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币' AFTER farmer2_win_gold;

-- 3. 添加竞技币变化字段到玩家统计表
ALTER TABLE ddz_player_stats ADD COLUMN total_arena_coin_change BIGINT NOT NULL DEFAULT 0 COMMENT '总竞技币变化' AFTER total_gold_change;
ALTER TABLE ddz_player_stats ADD COLUMN max_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '单局最大赢竞技币' AFTER max_win_gold;
ALTER TABLE ddz_player_stats ADD COLUMN max_lose_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '单局最大输竞技币' AFTER max_lose_gold;

-- 4. 更新房间配置表，添加竞技场房间的最低竞技币要求
ALTER TABLE ddz_room_config ADD COLUMN min_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '最低入场竞技币(竞技场房间使用)' AFTER min_gold;
ALTER TABLE ddz_room_config ADD COLUMN max_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '最高入场竞技币(竞技场房间使用,0表示无限制)' AFTER max_gold;

-- 5. 创建竞技币流水记录表
CREATE TABLE IF NOT EXISTS ddz_arena_coin_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    player_id BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    change_amount BIGINT NOT NULL COMMENT '变化金额(正数为获得,负数为消耗)',
    balance_after BIGINT NOT NULL COMMENT '变化后余额',
    change_type TINYINT NOT NULL COMMENT '变化类型:1-游戏结算,2-系统赠送,3-兑换,4-其他',
    related_id VARCHAR(64) DEFAULT '' COMMENT '关联ID(游戏ID等)',
    remark VARCHAR(256) DEFAULT '' COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_player_id (player_id),
    INDEX idx_created_at (created_at),
    INDEX idx_change_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞技币流水记录表';

-- 6. 初始化一些竞技场房间配置（可选）
-- INSERT INTO ddz_room_config (room_name, room_type, room_category, base_score, multiplier, min_arena_coin, bg_image_num, status, sort_order, description)
-- VALUES 
-- ('初级竞技场', 1, 2, 1, 1, 1000, 2, 1, 10, '初级竞技场，适合新手'),
-- ('中级竞技场', 2, 2, 2, 1, 5000, 3, 1, 11, '中级竞技场，适合进阶玩家'),
-- ('高级竞技场', 3, 2, 3, 1, 20000, 4, 1, 12, '高级竞技场，适合高手'),
-- ('大师竞技场', 4, 2, 5, 1, 100000, 5, 1, 13, '大师竞技场，顶尖对决');
