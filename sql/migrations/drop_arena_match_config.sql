-- 删除冗余的竞技场比赛配置表
-- 该表的配置已全部整合到 ddz_room_config 表中
-- 执行时间: 2026-05-11

-- 备份数据（可选，如果需要保留数据）
-- CREATE TABLE ddz_arena_match_config_backup AS SELECT * FROM ddz_arena_match_config;

-- 删除表
DROP TABLE IF EXISTS ddz_arena_match_config;

-- 说明：
-- 1. 服务端代码已修改为从 ddz_room_config 表读取配置
-- 2. ddz_room_config 表已包含以下竞技场配置字段：
--    - match_time_ranges: 开赛时间段
--    - match_round_duration: 每场时长(分钟)
--    - match_round_count: 轮次
--    - min_arena_coin: 报名费/入场门槛
--    - max_players: 最大人数
--    - min_players: 最小开赛人数
--    - champion_reward_id: 冠军奖励ID
