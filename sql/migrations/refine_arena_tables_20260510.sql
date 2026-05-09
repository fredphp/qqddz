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
-- 第一部分: 创建辅助存储过程
-- ============================================================

DELIMITER //

-- 安全添加字段的存储过程
DROP PROCEDURE IF EXISTS safe_add_column //
CREATE PROCEDURE safe_add_column(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_column_definition VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND column_name = p_column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已添加字段: ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 字段已存在: ', p_table_name, '.', p_column_name) AS result;
    END IF;
END //

-- 安全删除字段的存储过程
DROP PROCEDURE IF EXISTS safe_drop_column //
CREATE PROCEDURE safe_drop_column(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND column_name = p_column_name;
    
    IF column_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' DROP COLUMN ', p_column_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已删除字段: ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 字段不存在: ', p_table_name, '.', p_column_name) AS result;
    END IF;
END //

-- 安全添加索引的存储过程
DROP PROCEDURE IF EXISTS safe_add_index //
CREATE PROCEDURE safe_add_index(
    IN p_table_name VARCHAR(100),
    IN p_index_name VARCHAR(100),
    IN p_columns VARCHAR(500)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND index_name = p_index_name;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, '(', p_columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已添加索引: ', p_table_name, '.', p_index_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 索引已存在: ', p_table_name, '.', p_index_name) AS result;
    END IF;
END //

DELIMITER ;

-- ============================================================
-- 第二部分: 修改 ddz_arena_participations 表结构
-- ============================================================

-- 2.1 添加 period_no 字段
CALL safe_add_column('ddz_arena_participations', 'period_no', "varchar(20) DEFAULT NULL COMMENT '期号(关联报名记录)' AFTER player_id");

-- 2.2 添加 period_no 索引
CALL safe_add_index('ddz_arena_participations', 'idx_period_no', 'period_no');

-- 2.3 删除 signup_time 字段（如果需要，取消下面注释）
-- CALL safe_drop_column('ddz_arena_participations', 'signup_time');

-- 2.4 删除 signup_fee 字段（如果需要，取消下面注释）
-- CALL safe_drop_column('ddz_arena_participations', 'signup_fee');

-- ============================================================
-- 第三部分: 迁移 ddz_arena_period_players 分表
-- ============================================================

DELIMITER //

DROP PROCEDURE IF EXISTS migrate_arena_period_players_tables //
CREATE PROCEDURE migrate_arena_period_players_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(100);
    DECLARE cur CURSOR FOR 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name LIKE 'ddz_arena_period_players_%';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 添加 final_rank 字段
        CALL safe_add_column(tbl_name, 'final_rank', "int DEFAULT NULL COMMENT '最终排名(比赛结束时从participations同步)'");
        
        -- 删除冗余字段
        CALL safe_drop_column(tbl_name, 'arena_gold');
        CALL safe_drop_column(tbl_name, 'is_eliminated');
        CALL safe_drop_column(tbl_name, 'eliminated_round');
        CALL safe_drop_column(tbl_name, 'rank_no');
        
        SELECT CONCAT('✅ 已完成表迁移: ', tbl_name) AS result;
    END LOOP;
    
    CLOSE cur;
    
    SELECT '🎉 所有 period_players 分表迁移完成' AS result;
END //

DELIMITER ;

-- 执行分表迁移
CALL migrate_arena_period_players_tables();

-- ============================================================
-- 第四部分: 数据迁移（可选，用于历史数据同步）
-- ============================================================

-- 注意: 以下数据迁移SQL需要根据实际的分表名称调整后执行

-- 4.1 将 period_players.arena_gold 同步到 participations.match_coin
-- 需要对每个分表执行类似以下SQL:
-- UPDATE ddz_arena_participations p
-- SET p.match_coin = (
--     SELECT pp.arena_gold 
--     FROM ddz_arena_period_players_YYYYMM pp 
--     WHERE pp.period_no = p.period_no AND pp.player_id = p.player_id
-- )
-- WHERE p.match_coin = 0 AND p.period_no IS NOT NULL;

-- 4.2 将 period_players.is_eliminated 同步到 participations.is_eliminated
-- UPDATE ddz_arena_participations p
-- SET p.is_eliminated = (
--     SELECT pp.is_eliminated 
--     FROM ddz_arena_period_players_YYYYMM pp 
--     WHERE pp.period_no = p.period_no AND pp.player_id = p.player_id
-- )
-- WHERE p.period_no IS NOT NULL;

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
-- 第六部分: 清理临时存储过程（可选）
-- ============================================================

-- 如果不再需要这些辅助存储过程，可以执行以下清理:
-- DROP PROCEDURE IF EXISTS safe_add_column;
-- DROP PROCEDURE IF EXISTS safe_drop_column;
-- DROP PROCEDURE IF EXISTS safe_add_index;
-- DROP PROCEDURE IF EXISTS migrate_arena_period_players_tables;

-- ============================================================
-- 回滚脚本（如需回滚）
-- ============================================================

-- 恢复 period_players 表字段（需要根据分表名调整）
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
-- 5. 本脚本使用存储过程来实现字段的安全添加/删除，兼容所有MySQL版本
