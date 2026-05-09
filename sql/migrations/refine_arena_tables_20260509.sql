-- =====================================================
-- 竞技场表结构优化迁移脚本
-- 日期: 2026-05-09
-- 目的: 职责分离 - period_players专注报名，participations专注比赛
-- =====================================================

-- =====================================================
-- 1. 修改 ddz_arena_participations 表
-- 新增 period_no 字段用于关联报名记录
-- =====================================================

-- 添加 period_no 字段
ALTER TABLE `ddz_arena_participations` 
ADD COLUMN `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '期号(关联报名记录)' AFTER `player_id`;

-- 添加索引
ALTER TABLE `ddz_arena_participations` 
ADD INDEX `idx_period_no` (`period_no`);

-- =====================================================
-- 2. 修改 ddz_arena_period_players 表
-- 删除比赛过程字段，保留报名专用字段
-- 新增 final_rank 字段（比赛结束时同步）
-- =====================================================

-- 重命名 rank_no 为 final_rank（更清晰的命名）
ALTER TABLE `ddz_arena_period_players` 
CHANGE COLUMN `rank_no` `final_rank` int DEFAULT NULL COMMENT '最终排名(比赛结束时同步)';

-- 注意：以下字段在新架构中不再需要，但为了兼容性暂时保留
-- 后续版本可以删除这些字段:
-- - arena_gold (使用 participations.match_coin)
-- - is_eliminated (使用 participations.is_eliminated)
-- - eliminated_round (使用 participations.eliminated_round)

-- 如果需要立即删除这些字段，取消以下注释:
-- ALTER TABLE `ddz_arena_period_players` DROP COLUMN `arena_gold`;
-- ALTER TABLE `ddz_arena_period_players` DROP COLUMN `is_eliminated`;
-- ALTER TABLE `ddz_arena_period_players` DROP COLUMN `eliminated_round`;

-- =====================================================
-- 3. 数据迁移（如果有历史数据）
-- 将现有的 participations 关联到 period_no
-- =====================================================

-- 从 sessions 表获取 period_no 并更新到 participations
UPDATE `ddz_arena_participations` p
INNER JOIN `ddz_arena_sessions` s ON p.session_id = s.id
SET p.period_no = s.period_no
WHERE p.period_no = '' OR p.period_no IS NULL;

-- =====================================================
-- 4. 同步分表结构
-- 如果有分表，需要对分表也执行相同的修改
-- =====================================================

-- 例如: ddz_arena_period_players_202605
-- ALTER TABLE `ddz_arena_period_players_202605` 
-- CHANGE COLUMN `rank_no` `final_rank` int DEFAULT NULL COMMENT '最终排名(比赛结束时同步)';

-- =====================================================
-- 5. 更新表注释
-- =====================================================

ALTER TABLE `ddz_arena_period_players` COMMENT '竞技场期号报名玩家表(报名专用)';
ALTER TABLE `ddz_arena_participations` COMMENT '竞技场参赛记录表(比赛过程数据)';

-- =====================================================
-- 完成说明
-- =====================================================
-- 本次迁移实现了职责分离:
-- 1. ddz_arena_period_players: 报名管理 + 历史记录查询（按月分表）
--    - 保留: signup_time, signup_order, signup_fee, status, player_status, final_rank
--    - 删除: arena_gold, is_eliminated, eliminated_round (可选，暂保留兼容)
--
-- 2. ddz_arena_participations: 比赛过程数据 + 实时排名（主表）
--    - 新增: period_no (关联报名记录)
--    - 保留: match_coin, is_eliminated, eliminated_round, rank 等比赛字段
