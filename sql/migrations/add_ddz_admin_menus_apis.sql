-- 斗地主后台管理系统数据迁移脚本
-- 添加菜单和API权限
-- 执行前请确认sys_apis和sys_base_menus表中不存在重复数据

-- =====================================================
-- 第一部分：添加斗地主模块菜单
-- =====================================================

-- 先查询现有的斗地主菜单，避免重复添加
-- 如果已存在ddz父菜单，则跳过创建

-- 添加斗地主父菜单 (如果不存在)
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 0, 0, 'ddz', 'ddz', 0, 'view/routerHolder.vue', 2, '斗地主管理', 'coordinate', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddz' AND `path` = 'ddz');

-- 获取斗地主父菜单ID (用于后续子菜单)
SET @ddz_parent_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddz' AND `path` = 'ddz' LIMIT 1);

-- =====================================================
-- 玩家管理子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'player', 'ddzPlayer', 0, 'view/ddz/player/player.vue', 1, '玩家管理', 'user', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPlayer');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'playerStat', 'ddzPlayerStat', 0, 'view/ddz/playerStat/playerStat.vue', 2, '玩家统计', 'data-line', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPlayerStat');

-- =====================================================
-- 竞技场管理子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaPeriod', 'ddzArenaPeriod', 0, 'view/ddz/arenaPeriod/arenaPeriod.vue', 10, '期号管理', 'date', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaPeriod');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaRegistration', 'ddzArenaRegistration', 0, 'view/ddz/arenaRegistration/arenaRegistration.vue', 11, '报名管理', 'user-filled', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaRegistration');

-- 新增：比赛配置
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaMatchConfig', 'ddzArenaMatchConfig', 0, 'view/ddz/arenaMatchConfig/arenaMatchConfig.vue', 12, '比赛配置', 'setting', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaMatchConfig');

-- 新增：竞技场会话
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaSession', 'ddzArenaSession', 0, 'view/ddz/arenaSession/arenaSession.vue', 13, '会话管理', 'connection', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaSession');

-- 新增：报名日志
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaSignupLog', 'ddzArenaSignupLog', 0, 'view/ddz/arenaSignupLog/arenaSignupLog.vue', 14, '报名日志', 'document', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaSignupLog');

-- =====================================================
-- 游戏记录子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'gameRecord', 'ddzGameRecord', 0, 'view/ddz/gameRecord/gameRecord.vue', 20, '游戏记录', 'grid', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGameRecord');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'playLog', 'ddzPlayLog', 0, 'view/ddz/playLog/playLog.vue', 21, '出牌日志', 'edit', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPlayLog');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'dealLog', 'ddzDealLog', 0, 'view/ddz/dealLog/dealLog.vue', 22, '发牌日志', 'tickets', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzDealLog');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'bidLog', 'ddzBidLog', 0, 'view/ddz/bidLog/bidLog.vue', 23, '抢地主日志', 'star', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzBidLog');

-- 新增：发牌记录
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'dealRecord', 'ddzDealRecord', 0, 'view/ddz/dealRecord/dealRecord.vue', 24, '发牌记录', 'postcard', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzDealRecord');

-- =====================================================
-- 房间管理子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'gameRoom', 'ddzGameRoom', 0, 'view/ddz/gameRoom/gameRoom.vue', 30, '房间管理', 'home-filled', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGameRoom');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'roomConfig', 'ddzRoomConfig', 0, 'view/ddz/roomConfig/roomConfig.vue', 31, '房间配置', 'setting', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRoomConfig');

-- 新增：房间玩家
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'roomPlayer', 'ddzRoomPlayer', 0, 'view/ddz/roomPlayer/roomPlayer.vue', 32, '房间玩家', 'peoples', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRoomPlayer');

-- =====================================================
-- 日志管理子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'loginLog', 'ddzLoginLog', 0, 'view/ddz/loginLog/loginLog.vue', 40, '登录日志', 'monitor', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzLoginLog');

-- 新增：金币流水
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'goldLog', 'ddzGoldLog', 0, 'view/ddz/goldLog/goldLog.vue', 41, '金币流水', 'coin', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGoldLog');

-- 新增：竞技币流水
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaCoinLog', 'ddzArenaCoinLog', 0, 'view/ddz/arenaCoinLog/arenaCoinLog.vue', 42, '竞技币流水', 'money', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaCoinLog');

-- 新增：竞技场金币流水
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'arenaGoldLog', 'ddzArenaGoldLog', 0, 'view/ddz/arenaGoldLog/arenaGoldLog.vue', 43, '竞技场金币流水', 'wallet', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzArenaGoldLog');

-- 新增：广告奖励日志
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'adReward', 'ddzAdReward', 0, 'view/ddz/adReward/adReward.vue', 44, '广告奖励', 'video-play', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzAdReward');

-- =====================================================
-- 奖励管理子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'rewardGoods', 'ddzRewardGoods', 0, 'view/ddz/rewardGoods/rewardGoods.vue', 50, '奖励商品', 'shopping-cart', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRewardGoods');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'rewardOrders', 'ddzRewardOrders', 0, 'view/ddz/rewardOrders/rewardOrders.vue', 51, '兑换订单', 'list', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRewardOrders');

-- =====================================================
-- 系统配置子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'userAccount', 'ddzUserAccount', 0, 'view/ddz/userAccount/userAccount.vue', 60, '用户账户', 'avatar', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzUserAccount');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'robotConfig', 'ddzRobotConfig', 0, 'view/ddz/robotConfig/robotConfig.vue', 61, '机器人配置', 'cpu', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzRobotConfig');

INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'smsCode', 'ddzSmsCode', 0, 'view/ddz/smsCode/smsCode.vue', 62, '短信验证码', 'message', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzSmsCode');

-- 新增：游戏配置
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'gameConfig', 'ddzGameConfig', 0, 'view/ddz/gameConfig/gameConfig.vue', 63, '游戏配置', 'tools', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGameConfig');

-- =====================================================
-- 统计分析子菜单
-- =====================================================
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'stats', 'ddzStats', 0, 'view/ddz/stats/stats.vue', 70, '数据统计', 'data-analysis', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzStats');

-- 新增：每日统计
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'dailyStats', 'ddzDailyStats', 0, 'view/ddz/dailyStats/dailyStats.vue', 71, '每日统计', 'calendar', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzDailyStats');

-- 新增：排行榜
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'leaderboard', 'ddzLeaderboard', 0, 'view/ddz/leaderboard/leaderboard.vue', 72, '排行榜', 'trophy', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzLeaderboard');

-- 新增：在线玩家
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'playerOnline', 'ddzPlayerOnline', 0, 'view/ddz/playerOnline/playerOnline.vue', 73, '在线玩家', 'online', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPlayerOnline');

-- =====================================================
-- 锦标赛管理子菜单
-- =====================================================
-- 新增：锦标赛轮次
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'tournamentRound', 'ddzTournamentRound', 0, 'view/ddz/tournamentRound/tournamentRound.vue', 80, '锦标赛轮次', 'finished', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzTournamentRound');

-- 新增：锦标赛淘汰记录
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'tournamentElimination', 'ddzTournamentElimination', 0, 'view/ddz/tournamentElimination/tournamentElimination.vue', 81, '淘汰记录', 'remove', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzTournamentElimination');

-- =====================================================
-- 系统管理子菜单
-- =====================================================
-- 新增：待处理数据
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'pendingGameData', 'ddzPendingGameData', 0, 'view/ddz/pendingGameData/pendingGameData.vue', 90, '待处理数据', 'loading', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzPendingGameData');

-- 新增：错误日志
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`)
SELECT NOW(), NOW(), 1, @ddz_parent_id, 'writeQueueErrorLog', 'ddzWriteQueueErrorLog', 0, 'view/ddz/writeQueueErrorLog/writeQueueErrorLog.vue', 91, '队列错误日志', 'warn', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzWriteQueueErrorLog');


-- =====================================================
-- 第二部分：添加API权限
-- =====================================================

-- 比赛配置API
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

-- 竞技场会话API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaSession/list', '获取竞技场会话列表', '斗地主竞技场会话', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaSession/list' AND `method` = 'POST');

-- 轮次记录API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaRoundRecord/list', '获取轮次记录列表', '斗地主轮次记录', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaRoundRecord/list' AND `method` = 'POST');

-- 报名日志API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaSignupLog/list', '获取报名日志列表', '斗地主报名日志', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaSignupLog/list' AND `method` = 'POST');

-- 桌号API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/arenaTable/list', '获取桌号列表', '斗地主桌号管理', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/arenaTable/list' AND `method` = 'POST');

-- 游戏配置API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/list', '获取游戏配置列表', '斗地主游戏配置', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/list' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/create', '创建游戏配置', '斗地主游戏配置', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/create' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/update', '更新游戏配置', '斗地主游戏配置', 'PUT'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/update' AND `method` = 'PUT');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/gameConfig/delete', '删除游戏配置', '斗地主游戏配置', 'DELETE'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/gameConfig/delete' AND `method` = 'DELETE');

-- 游戏详情API
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

-- 统计详情API
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

-- 锦标赛API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/tournament/roundList', '获取锦标赛轮次列表', '斗地主锦标赛', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/tournament/roundList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/tournament/eliminationList', '获取锦标赛淘汰记录列表', '斗地主锦标赛', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/tournament/eliminationList' AND `method` = 'POST');

-- 系统API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/system/pendingGameDataList', '获取待处理数据列表', '斗地主系统', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/system/pendingGameDataList' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/system/writeQueueErrorLogList', '获取写入队列错误日志列表', '斗地主系统', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/system/writeQueueErrorLogList' AND `method` = 'POST');
