-- ============================================================
-- 竞技场数据库架构精简迁移脚本
-- 日期: 2026-05-10
-- 说明: 实施方案二 - 渐进式职责分离
-- 
-- 变更内容:
-- 1. ddz_arena_period_players (报名表) 删除冗余字段:
--    - arena_gold (迁移到 participations.match_coin)
--    - is_eliminated (迁移到 participations.is_eliminated)
--    - eliminated_round (迁移到 participations.eliminated_round)
--    - rank_no (改用 final_rank)
-- 
-- 2. ddz_arena_participations (参赛表) 删除冗余字段:
--    - signup_time (保留在 period_players.signup_time)
--    - signup_fee (保留在 period_players.signup_fee)
-- 
-- 职责分离:
-- - period_players: 报名管理 + 历史记录
-- - participations: 比赛过程数据 + 实时排名 + 淘汰状态
-- ============================================================

-- ============================================================
-- 第一部分: 修改 ddz_arena_period_players 表结构
-- ============================================================

-- 1.1 添加 final_rank 字段（如果不存在）
-- 注意: 需要对所有月份的分表执行此操作
-- 示例: ddz_arena_period_players_202605, ddz_arena_period_players_202606, ...

-- 以下是需要对每个分表执行的SQL模板:
-- ALTER TABLE ddz_arena_period_players_YYYYMM 
--     ADD COLUMN IF NOT EXISTS final_rank int DEFAULT NULL COMMENT '最终排名(比赛结束时从participations同步)' AFTER player_status;

-- 1.2 删除冗余字段（如果存在）
-- 注意: 需要对所有月份的分表执行此操作

-- 以下是需要对每个分表执行的SQL模板:
-- ALTER TABLE ddz_arena_period_players_YYYYMM 
--     DROP COLUMN IF EXISTS arena_gold,
--     DROP COLUMN IF EXISTS is_eliminated,
--     DROP COLUMN IF EXISTS eliminated_round,
--     DROP COLUMN IF EXISTS rank_no;

-- ============================================================
-- 第二部分: 修改 ddz_arena_participations 表结构
-- ============================================================

-- 2.1 确保 period_no 字段存在
ALTER TABLE ddz_arena_participations 
    ADD COLUMN IF NOT EXISTS period_no varchar(20) DEFAULT NULL COMMENT '期号(关联报名记录)' AFTER player_id;

-- 添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_period_no ON ddz_arena_participations(period_no);

-- 2.2 删除冗余字段（如果存在）
-- 注意: 先备份数据再执行删除操作

-- 以下是删除字段的SQL（取消注释后执行）:
-- ALTER TABLE ddz_arena_participations 
--     DROP COLUMN IF EXISTS signup_time,
--     DROP COLUMN IF EXISTS signup_fee;

-- ============================================================
-- 第三部分: 数据迁移（可选，用于历史数据同步）
-- ============================================================

-- 3.1 将 period_players.arena_gold 同步到 participations.match_coin
-- 注意: 只同步尚未结束的比赛数据

-- UPDATE ddz_arena_participations p
-- SET p.match_coin = (
--     SELECT pp.arena_gold 
--     FROM ddz_arena_period_players_YYYYMM pp 
--     WHERE pp.period_no = p.period_no AND pp.player_id = p.player_id
-- )
-- WHERE p.match_coin = 0 AND p.period_no IS NOT NULL;

-- 3.2 将 period_players.is_eliminated 同步到 participations.is_eliminated

-- UPDATE ddz_arena_participations p
-- SET p.is_eliminated = (
--     SELECT pp.is_eliminated 
--     FROM ddz_arena_period_players_YYYYMM pp 
--     WHERE pp.period_no = p.period_no AND pp.player_id = p.player_id
-- )
-- WHERE p.period_no IS NOT NULL;

-- ============================================================
-- 第四部分: 执行脚本生成
-- ============================================================

-- 以下存储过程用于自动生成并执行所有分表的迁移SQL

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS migrate_arena_period_players_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(100);
    DECLARE cur CURSOR FOR 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name LIKE 'ddz_arena_period_players_%';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 添加 final_rank 字段
        SET @sql = CONCAT('ALTER TABLE ', table_name, 
            ' ADD COLUMN IF NOT EXISTS final_rank int DEFAULT NULL COMMENT ''最终排名''');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- 删除冗余字段（先检查字段是否存在）
        -- 注意: 实际删除前请确认数据已备份
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP COLUMN IF EXISTS arena_gold');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP COLUMN IF EXISTS is_eliminated');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP COLUMN IF EXISTS eliminated_round');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP COLUMN IF EXISTS rank_no');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('✅ 已迁移表: ', table_name) AS result;
    END LOOP;
    
    CLOSE cur;
    
    SELECT '🎉 所有 period_players 分表迁移完成' AS result;
END //

DELIMITER ;

-- 执行迁移存储过程
-- CALL migrate_arena_period_players_tables();

-- ============================================================
-- 第五部分: 验证脚本
-- ============================================================

-- 验证 period_players 表结构
SELECT 
    table_name,
    column_name,
    column_type,
    column_comment
FROM information_schema.columns
WHERE table_schema = DATABASE()
AND table_name LIKE 'ddz_arena_period_players%'
ORDER BY table_name, ordinal_position;

-- 验证 participations 表结构
SELECT 
    column_name,
    column_type,
    column_comment
FROM information_schema.columns
WHERE table_schema = DATABASE()
AND table_name = 'ddz_arena_participations'
ORDER BY ordinal_position;

-- ============================================================
-- 回滚脚本（如需回滚）
-- ============================================================

-- 恢复 period_players 表字段
-- ALTER TABLE ddz_arena_period_players_YYYYMM 
--     ADD COLUMN arena_gold bigint NOT NULL DEFAULT 0 COMMENT '当期赛事金币',
--     ADD COLUMN is_eliminated tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否淘汰',
--     ADD COLUMN eliminated_round int DEFAULT NULL COMMENT '淘汰轮次',
--     ADD COLUMN rank_no int DEFAULT NULL COMMENT '最终排名';

-- 恢复 participations 表字段
-- ALTER TABLE ddz_arena_participations 
--     ADD COLUMN signup_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
--     ADD COLUMN signup_fee bigint NOT NULL DEFAULT 0 COMMENT '报名费';

-- ============================================================
-- 注意事项
-- ============================================================
-- 1. 执行前请先备份数据库
-- 2. 建议在低峰期执行迁移
-- 3. 对于大型表，删除字段可能需要较长时间
-- 4. 新创建的分表会自动使用新的结构（由 partition_manager.go 定义）
