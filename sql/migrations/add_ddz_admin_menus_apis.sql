-- 斗地主后台管理系统数据迁移脚本
-- 添加菜单和API权限
-- 执行前请确认sys_apis和sys_base_menus表中不存在重复数据
-- 
-- 注意：此文件已去除与 hlddz.sql 中重复的菜单和API
-- 重复项说明：
--   - 菜单重复：ddzPlayer, ddzPlayerStat, ddzArenaPeriod, ddzGameRecord, ddzPlayLog, 
--               ddzDealLog, ddzBidLog, ddzGameRoom, ddzRoomConfig, ddzLoginLog, 
--               ddzRewardGoods, ddzRewardOrders, ddzUserAccount, ddzSmsCode, ddzRobotConfig
--   - API重复：/ddz/gameConfig/list

-- =====================================================
-- 第一部分：添加斗地主模块菜单（仅添加不存在的菜单）
-- =====================================================

-- 添加斗地主父菜单 (如果不存在)
-- 注意：hlddz.sql 中已有 ddzUser, ddzStats, ddzGame, ddzArena 等父菜单
-- 如果需要统一的 ddz 父菜单，请取消下面的注释
-- INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
-- SELECT NOW(), NOW(), 0, 0, 'ddz', 'ddz', 0, 'view/routerHolder.vue', 2, '斗地主管理', 'coordinate', 0
-- FROM DUAL
-- WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddz' AND `path` = 'ddz');

-- 获取斗地主父菜单ID (用于后续子菜单)
-- SET @ddz_parent_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddz' AND `path` = 'ddz' LIMIT 1);

-- =====================================================
-- 竞技场管理 - 新增子菜单
-- =====================================================

-- 新增：比赛配置 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'arenaMatchConfig', 'ddzArenaMatchConfig', 0, 'view/ddz/arenaMatchConfig/arenaMatchConfig.vue', 12, '比赛配置', 'setting', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaMatchConfig');

-- 新增：竞技场会话 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'arenaSession', 'ddzArenaSession', 0, 'view/ddz/arenaSession/arenaSession.vue', 13, '会话管理', 'connection', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaSession');

-- 新增：报名日志 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'arenaSignupLog', 'ddzArenaSignupLog', 0, 'view/ddz/arenaSignupLog/arenaSignupLog.vue', 14, '报名日志', 'document', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaSignupLog');

-- =====================================================
-- 游戏记录 - 新增子菜单
-- =====================================================

-- 新增：发牌记录 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGame' LIMIT 1), 'dealRecord', 'ddzDealRecord', 0, 'view/ddz/dealRecord/dealRecord.vue', 24, '发牌记录', 'postcard', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzDealRecord');

-- =====================================================
-- 房间管理 - 新增子菜单
-- =====================================================

-- 新增：房间玩家 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGame' LIMIT 1), 'roomPlayer', 'ddzRoomPlayer', 0, 'view/ddz/roomPlayer/roomPlayer.vue', 32, '房间玩家', 'peoples', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRoomPlayer');

-- =====================================================
-- 日志管理 - 新增子菜单
-- =====================================================

-- 新增：金币流水 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUser' LIMIT 1), 'goldLog', 'ddzGoldLog', 0, 'view/ddz/goldLog/goldLog.vue', 41, '金币流水', 'coin', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGoldLog');

-- 新增：竞技币流水 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUser' LIMIT 1), 'arenaCoinLog', 'ddzArenaCoinLog', 0, 'view/ddz/arenaCoinLog/arenaCoinLog.vue', 42, '竞技币流水', 'money', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaCoinLog');

-- 新增：竞技场金币流水 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'arenaGoldLog', 'ddzArenaGoldLog', 0, 'view/ddz/arenaGoldLog/arenaGoldLog.vue', 43, '竞技场金币流水', 'wallet', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaGoldLog');

-- 新增：广告奖励日志 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGame' LIMIT 1), 'adReward', 'ddzAdReward', 0, 'view/ddz/adReward/adReward.vue', 44, '广告奖励', 'video-play', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzAdReward');

-- =====================================================
-- 统计分析 - 新增子菜单
-- =====================================================

-- 新增：每日统计 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzStats' LIMIT 1), 'dailyStats', 'ddzDailyStats', 0, 'view/ddz/dailyStats/dailyStats.vue', 71, '每日统计', 'calendar', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzDailyStats');

-- 新增：在线玩家 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzStats' LIMIT 1), 'playerOnline', 'ddzPlayerOnline', 0, 'view/ddz/playerOnline/playerOnline.vue', 73, '在线玩家', 'online', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPlayerOnline');

-- =====================================================
-- 锦标赛管理 - 新增子菜单
-- =====================================================

-- 新增：锦标赛轮次 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'tournamentRound', 'ddzTournamentRound', 0, 'view/ddz/tournamentRound/tournamentRound.vue', 80, '锦标赛轮次', 'finished', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzTournamentRound');

-- 新增：锦标赛淘汰记录 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzArena' LIMIT 1), 'tournamentElimination', 'ddzTournamentElimination', 0, 'view/ddz/tournamentElimination/tournamentElimination.vue', 81, '淘汰记录', 'remove', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzTournamentElimination');

-- =====================================================
-- 系统管理 - 新增子菜单
-- =====================================================

-- 新增：待处理数据 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGame' LIMIT 1), 'pendingGameData', 'ddzPendingGameData', 0, 'view/ddz/pendingGameData/pendingGameData.vue', 90, '待处理数据', 'loading', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPendingGameData');

-- 新增：错误日志 (不存在于 hlddz.sql)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGame' LIMIT 1), 'writeQueueErrorLog', 'ddzWriteQueueErrorLog', 0, 'view/ddz/writeQueueErrorLog/writeQueueErrorLog.vue', 91, '队列错误日志', 'warn', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzWriteQueueErrorLog');


-- =====================================================
-- 第二部分：添加API权限（仅添加不存在的API）
-- 注意：hlddz.sql 中已存在大部分 /ddz/ 开头的API
-- =====================================================

-- 比赛配置API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaMatchConfig/list', '获取比赛配置列表', '斗地主比赛配置', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaMatchConfig/list' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaMatchConfig/create', '创建比赛配置', '斗地主比赛配置', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaMatchConfig/create' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaMatchConfig/update', '更新比赛配置', '斗地主比赛配置', 'PUT'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaMatchConfig/update' AND `method` = 'PUT');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaMatchConfig/delete', '删除比赛配置', '斗地主比赛配置', 'DELETE'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaMatchConfig/delete' AND `method` = 'DELETE');

-- 竞技场会话API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaSession/list', '获取竞技场会话列表', '斗地主竞技场会话', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaSession/list' AND `method` = 'POST');

-- 轮次记录API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaRoundRecord/list', '获取轮次记录列表', '斗地主轮次记录', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaRoundRecord/list' AND `method` = 'POST');

-- 报名日志API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaSignupLog/list', '获取报名日志列表', '斗地主报名日志', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaSignupLog/list' AND `method` = 'POST');

-- 桌号API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaTable/list', '获取桌号列表', '斗地主桌号管理', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaTable/list' AND `method` = 'POST');

-- 竞技场金币流水API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaGoldLog/list', '获取竞技场金币流水列表', '斗地主竞技场金币流水', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaGoldLog/list' AND `method` = 'POST');

-- 广告奖励日志API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/adReward/list', '获取广告奖励日志列表', '斗地主广告奖励', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/adReward/list' AND `method` = 'POST');

-- 游戏配置API - 仅添加不存在的API (hlddz.sql 中已有 /ddz/gameConfig/list 和 /ddz/gameConfig/update)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/create', '创建游戏配置', '斗地主游戏配置', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/create' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/delete', '删除游戏配置', '斗地主游戏配置', 'DELETE'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/delete' AND `method` = 'DELETE');

-- 游戏详情API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameDetail/gamePlayerRecordList', '获取游戏玩家记录列表', '斗地主游戏详情', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameDetail/gamePlayerRecordList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameDetail/gamePlayRecordList', '获取出牌记录列表', '斗地主游戏详情', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameDetail/gamePlayRecordList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameDetail/dealRecordList', '获取发牌记录列表', '斗地主游戏详情', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameDetail/dealRecordList' AND `method` = 'POST');

-- 统计详情API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/statsDetail/dailyStatsList', '获取每日统计列表', '斗地主统计分析', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/statsDetail/dailyStatsList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/statsDetail/leaderboardList', '获取排行榜列表', '斗地主统计分析', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/statsDetail/leaderboardList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/statsDetail/playerOnlineList', '获取在线玩家列表', '斗地主统计分析', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/statsDetail/playerOnlineList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/statsDetail/roomPlayerList', '获取房间玩家列表', '斗地主统计分析', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/statsDetail/roomPlayerList' AND `method` = 'POST');

-- 锦标赛API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/tournament/roundList', '获取锦标赛轮次列表', '斗地主锦标赛', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/tournament/roundList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/tournament/eliminationList', '获取锦标赛淘汰记录列表', '斗地主锦标赛', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/tournament/eliminationList' AND `method` = 'POST');

-- 系统API (不存在于 hlddz.sql)
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/system/pendingGameDataList', '获取待处理数据列表', '斗地主系统', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/system/pendingGameDataList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/system/writeQueueErrorLogList', '获取写入队列错误日志列表', '斗地主系统', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/system/writeQueueErrorLogList' AND `method` = 'POST');
