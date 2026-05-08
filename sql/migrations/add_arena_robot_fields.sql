-- 竞技场机器人系统迁移脚本
-- 说明: 优化机器人查询索引，支持竞技场补位
-- 
-- 注意事项:
-- 1. 机器人数据存储在 ddz_players 表中，player_type=2 表示机器人
-- 2. 机器人状态通过 robot_status 和 robot_current_session_id 字段管理
-- 3. 机器人AI配置存储在 ddz_robot_config 表中
-- 4. 不需要额外的机器人运行记录表，运行时状态在内存中管理

-- =============================================
-- 1. 创建索引优化机器人查询
-- =============================================

-- 为机器人查询添加复合索引
-- 查询空闲机器人: SELECT * FROM ddz_players WHERE player_type=2 AND robot_status=0
CREATE INDEX IF NOT EXISTS `idx_robot_available` ON `ddz_players` (`player_type`, `robot_status`);

-- 为机器人会话查询添加索引
-- 查询会话中的机器人: SELECT * FROM ddz_players WHERE robot_current_session_id = ?
CREATE INDEX IF NOT EXISTS `idx_robot_session` ON `ddz_players` (`robot_current_session_id`);

-- =============================================
-- 2. 确认机器人配置表存在
-- =============================================

-- 机器人AI配置表 ddz_robot_config 应该已存在
-- 如果不存在，请参考 ddz_game.sql 中的定义创建

-- =============================================
-- 3. 说明
-- =============================================

-- 机器人逻辑与真人逻辑一致:
-- 1. 报名: 通过 ArenaPatcher 自动补位，创建 ddz_arena_participations 记录
-- 2. 比赛: 使用相同的游戏逻辑，通过 RobotAI 进行决策
-- 3. 淘汰: 通过 ddz_arena_participations.is_eliminated 和 rank 字段记录
-- 4. 奖励: 机器人不能获得冠军奖励（NoWinController 处理）
-- 5. 释放: 比赛结束后通过 ReleaseRobotsBySession 释放机器人状态

-- 机器人状态管理:
-- robot_status: 0=空闲, 1=竞技场中
-- robot_current_session_id: 当前所在的会话ID
-- robot_locked_at: 锁定时间

-- 内存中的运行时状态:
-- 由 RobotManager.runtimes 和 ArenaRobotManager.arenaRobots 管理
-- 不需要额外的数据库表存储运行时状态
