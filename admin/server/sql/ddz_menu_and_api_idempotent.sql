-- =============================================
-- DDZ后台管理系统菜单和API初始化SQL (幂等版本)
-- 数据库：hlddz (gin-vue-admin系统数据库)
-- 可重复执行，不会报主键冲突错误
-- =============================================

-- =============================================
-- 一、添加菜单 (使用 INSERT IGNORE 避免重复)
-- =============================================

-- 添加父菜单
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 0, 0, 'ddzUser', 'ddzUser', 0, 'view/routerHolder.vue', 2, '用户管理', 'user', 0),
(NOW(), NOW(), 0, 0, 'ddzManage', 'ddzManage', 0, 'view/routerHolder.vue', 3, '斗地主管理', 'game', 0),
(NOW(), NOW(), 0, 0, 'ddzStats', 'ddzStats', 0, 'view/routerHolder.vue', 4, '数据统计', 'chart', 0);

-- 添加子菜单 - 用户管理
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzUser') t), 'userAccount', 'ddzUserAccount', 0, 'view/ddz/userAccount/userAccount.vue', 1, '用户列表', 'avatar', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzUser') t), 'player', 'ddzPlayer', 0, 'view/ddz/player/player.vue', 2, '玩家列表', 'peoples', 0);

-- 添加子菜单 - 斗地主管理
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'gameRecord', 'ddzGameRecord', 0, 'view/ddz/gameRecord/gameRecord.vue', 1, '游戏记录', 'document', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'playerStat', 'ddzPlayerStat', 0, 'view/ddz/playerStat/playerStat.vue', 2, '玩家统计', 'chart', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'roomConfig', 'ddzRoomConfig', 0, 'view/ddz/roomConfig/roomConfig.vue', 3, '房间配置', 'setting', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'loginLog', 'ddzLoginLog', 0, 'view/ddz/loginLog/loginLog.vue', 4, '登录日志', 'monitor', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'smsCode', 'ddzSmsCode', 0, 'view/ddz/smsCode/smsCode.vue', 5, '短信记录', 'message', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'bidLog', 'ddzBidLog', 0, 'view/ddz/bidLog/bidLog.vue', 6, '叫地主日志', 'history', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'dealLog', 'ddzDealLog', 0, 'view/ddz/dealLog/dealLog.vue', 7, '发牌日志', 'tickets', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 'playLog', 'ddzPlayLog', 0, 'view/ddz/playLog/playLog.vue', 8, '出牌日志', 'list', 0);

-- 添加子菜单 - 数据统计
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzStats') t), 'overview', 'ddzOverview', 0, 'view/ddz/stats/overview.vue', 1, '概览统计', 'data', 0),
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzStats') t), 'leaderboard', 'ddzLeaderboard', 0, 'view/ddz/stats/leaderboard.vue', 2, '排行榜', 'trophy', 0);

-- =============================================
-- 二、添加API权限 (sys_apis表) - 使用 INSERT IGNORE
-- =============================================

-- 游戏记录API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/game/list', '获取游戏记录列表', 'DDZ游戏', 'POST'),
(NOW(), NOW(), '/ddz/game/detail', '获取游戏记录详情', 'DDZ游戏', 'GET'),
(NOW(), NOW(), '/ddz/gameRecord/list', '获取游戏记录列表(新)', 'DDZ游戏记录', 'POST'),
(NOW(), NOW(), '/ddz/gameRecord/detail', '获取游戏记录详情(新)', 'DDZ游戏记录', 'GET'),
(NOW(), NOW(), '/ddz/gameRecord/delete', '删除游戏记录', 'DDZ游戏记录', 'DELETE');

-- 玩家API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/player/create', '创建玩家', 'DDZ玩家', 'POST'),
(NOW(), NOW(), '/ddz/player/delete', '删除玩家', 'DDZ玩家', 'DELETE'),
(NOW(), NOW(), '/ddz/player/deleteByPlayerId', '根据PlayerID删除玩家', 'DDZ玩家', 'DELETE'),
(NOW(), NOW(), '/ddz/player/list', '获取玩家列表', 'DDZ玩家', 'POST'),
(NOW(), NOW(), '/ddz/player/info', '获取玩家信息', 'DDZ玩家', 'GET'),
(NOW(), NOW(), '/ddz/player/ban', '封禁玩家', 'DDZ玩家', 'POST'),
(NOW(), NOW(), '/ddz/player/unban', '解封玩家', 'DDZ玩家', 'POST'),
(NOW(), NOW(), '/ddz/player/update', '更新玩家信息', 'DDZ玩家', 'PUT'),
(NOW(), NOW(), '/ddz/player/coins', '更新玩家金币', 'DDZ玩家', 'POST');

-- 用户账户API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/userAccount/create', '创建用户账户', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/delete', '删除用户账户', 'DDZ用户账户', 'DELETE'),
(NOW(), NOW(), '/ddz/userAccount/list', '获取用户账户列表', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/info', '获取用户账户信息', 'DDZ用户账户', 'GET'),
(NOW(), NOW(), '/ddz/userAccount/update', '更新用户账户', 'DDZ用户账户', 'PUT'),
(NOW(), NOW(), '/ddz/userAccount/status', '更新用户账户状态', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/bindPhone', '绑定手机号', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/unbindWechat', '解绑微信', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/resetToken', '重置Token', 'DDZ用户账户', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/loginLog', '获取登录日志列表', 'DDZ用户账户', 'POST');

-- 配置API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/config/room/list', '获取房间配置列表', 'DDZ配置', 'POST'),
(NOW(), NOW(), '/ddz/config/room/create', '创建房间配置', 'DDZ配置', 'POST'),
(NOW(), NOW(), '/ddz/config/room/update', '更新房间配置', 'DDZ配置', 'PUT'),
(NOW(), NOW(), '/ddz/config/room/delete', '删除房间配置', 'DDZ配置', 'DELETE'),
(NOW(), NOW(), '/ddz/config/game/list', '获取游戏配置列表', 'DDZ配置', 'POST'),
(NOW(), NOW(), '/ddz/config/game/update', '更新游戏配置', 'DDZ配置', 'PUT');

-- 房间配置API (新路由)
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/roomConfig/list', '获取房间配置列表(新)', 'DDZ房间配置', 'POST'),
(NOW(), NOW(), '/ddz/roomConfig/create', '创建房间配置(新)', 'DDZ房间配置', 'POST'),
(NOW(), NOW(), '/ddz/roomConfig/update', '更新房间配置(新)', 'DDZ房间配置', 'PUT'),
(NOW(), NOW(), '/ddz/roomConfig/delete', '删除房间配置(新)', 'DDZ房间配置', 'DELETE');

-- 统计API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/stats/overview', '获取概览统计', 'DDZ统计', 'GET'),
(NOW(), NOW(), '/ddz/stats/daily', '获取每日统计', 'DDZ统计', 'POST'),
(NOW(), NOW(), '/ddz/stats/leaderboard', '获取排行榜', 'DDZ统计', 'POST'),
(NOW(), NOW(), '/ddz/stats/player', '获取玩家统计', 'DDZ统计', 'POST'),
(NOW(), NOW(), '/ddz/stats/chart/active', '获取每日活跃图表', 'DDZ统计', 'GET'),
(NOW(), NOW(), '/ddz/stats/chart/games', '获取每日游戏场次图表', 'DDZ统计', 'GET');

-- 玩家统计API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/playerStat/list', '获取玩家统计列表', 'DDZ玩家统计', 'POST');

-- 游戏日志API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/log/bid/list', '获取叫地主日志列表', 'DDZ游戏日志', 'POST'),
(NOW(), NOW(), '/ddz/log/deal/list', '获取发牌日志列表', 'DDZ游戏日志', 'POST'),
(NOW(), NOW(), '/ddz/log/play/list', '获取出牌日志列表', 'DDZ游戏日志', 'POST');

-- 短信验证码API
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/smsCode/list', '获取短信验证码列表', 'DDZ短信记录', 'POST'),
(NOW(), NOW(), '/ddz/smsCode/delete', '删除短信验证码', 'DDZ短信记录', 'DELETE');

-- =============================================
-- 三、为管理员角色(888)分配菜单权限 - 使用 INSERT IGNORE
-- =============================================

INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
SELECT 888, id FROM sys_base_menus WHERE name IN (
    'ddzUser', 'ddzManage', 'ddzStats',
    'ddzUserAccount', 'ddzPlayer', 'ddzGameRecord', 'ddzPlayerStat',
    'ddzRoomConfig', 'ddzLoginLog', 'ddzSmsCode', 'ddzBidLog',
    'ddzDealLog', 'ddzPlayLog', 'ddzOverview', 'ddzLeaderboard'
);

-- =============================================
-- 四、为管理员角色(888)分配API权限 (casbin_rule) - 使用 INSERT IGNORE
-- =============================================

-- 游戏记录API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/game/list', 'POST'),
('p', '888', '/ddz/game/detail', 'GET'),
('p', '888', '/ddz/gameRecord/list', 'POST'),
('p', '888', '/ddz/gameRecord/detail', 'GET'),
('p', '888', '/ddz/gameRecord/delete', 'DELETE');

-- 玩家API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/player/create', 'POST'),
('p', '888', '/ddz/player/delete', 'DELETE'),
('p', '888', '/ddz/player/deleteByPlayerId', 'DELETE'),
('p', '888', '/ddz/player/list', 'POST'),
('p', '888', '/ddz/player/info', 'GET'),
('p', '888', '/ddz/player/ban', 'POST'),
('p', '888', '/ddz/player/unban', 'POST'),
('p', '888', '/ddz/player/update', 'PUT'),
('p', '888', '/ddz/player/coins', 'POST');

-- 用户账户API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/userAccount/create', 'POST'),
('p', '888', '/ddz/userAccount/delete', 'DELETE'),
('p', '888', '/ddz/userAccount/list', 'POST'),
('p', '888', '/ddz/userAccount/info', 'GET'),
('p', '888', '/ddz/userAccount/update', 'PUT'),
('p', '888', '/ddz/userAccount/status', 'POST'),
('p', '888', '/ddz/userAccount/bindPhone', 'POST'),
('p', '888', '/ddz/userAccount/unbindWechat', 'POST'),
('p', '888', '/ddz/userAccount/resetToken', 'POST'),
('p', '888', '/ddz/userAccount/loginLog', 'POST');

-- 配置API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/config/room/list', 'POST'),
('p', '888', '/ddz/config/room/create', 'POST'),
('p', '888', '/ddz/config/room/update', 'PUT'),
('p', '888', '/ddz/config/room/delete', 'DELETE'),
('p', '888', '/ddz/config/game/list', 'POST'),
('p', '888', '/ddz/config/game/update', 'PUT');

-- 房间配置API权限(新路由)
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/roomConfig/list', 'POST'),
('p', '888', '/ddz/roomConfig/create', 'POST'),
('p', '888', '/ddz/roomConfig/update', 'PUT'),
('p', '888', '/ddz/roomConfig/delete', 'DELETE');

-- 统计API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/stats/overview', 'GET'),
('p', '888', '/ddz/stats/daily', 'POST'),
('p', '888', '/ddz/stats/leaderboard', 'POST'),
('p', '888', '/ddz/stats/player', 'POST'),
('p', '888', '/ddz/stats/chart/active', 'GET'),
('p', '888', '/ddz/stats/chart/games', 'GET');

-- 玩家统计API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/playerStat/list', 'POST');

-- 游戏日志API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/log/bid/list', 'POST'),
('p', '888', '/ddz/log/deal/list', 'POST'),
('p', '888', '/ddz/log/play/list', 'POST');

-- 短信验证码API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/smsCode/list', 'POST'),
('p', '888', '/ddz/smsCode/delete', 'DELETE');

-- =============================================
-- 执行完成提示
-- =============================================
SELECT 'DDZ菜单和API权限初始化完成!' AS result;
