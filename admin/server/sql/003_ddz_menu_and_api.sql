-- =============================================
-- DDZ用户管理菜单和API初始化SQL
-- 包含：用户账户管理、玩家管理两个菜单
-- =============================================

-- 注意：以下SQL需要在gin-vue-admin数据库中执行
-- 执行前请根据实际数据库连接切换数据库

-- =============================================
-- 1. 添加DDZ用户管理父菜单
-- =============================================
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES (
    NOW(), NOW(), 0, 0, 'ddzUser', 'ddzUser', 0, 'view/ddz/index.vue', 2, '用户管理', 'user', 0
);

-- 获取刚插入的父菜单ID (需要在实际执行时获取)
SET @ddz_user_parent_id = LAST_INSERT_ID();

-- =============================================
-- 2. 添加用户账户管理子菜单
-- =============================================
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES (
    NOW(), NOW(), 1, @ddz_user_parent_id, 'userAccount', 'ddzUserAccount', 0,
    'view/ddz/userAccount/userAccount.vue', 1, '用户列表', 'avatar', 0
);

-- =============================================
-- 3. 添加玩家管理子菜单
-- =============================================
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES (
    NOW(), NOW(), 1, @ddz_user_parent_id, 'player', 'ddzPlayer', 0,
    'view/ddz/player/player.vue', 2, '玩家列表', 'peoples', 0
);

-- =============================================
-- 4. 添加用户账户API
-- =============================================
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/userAccount/create', '创建用户账户', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/delete', '删除用户账户', 'DDZ用户账户管理', 'DELETE'),
(NOW(), NOW(), '/ddz/userAccount/list', '获取用户账户列表', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/info', '获取用户账户信息', 'DDZ用户账户管理', 'GET'),
(NOW(), NOW(), '/ddz/userAccount/update', '更新用户账户', 'DDZ用户账户管理', 'PUT'),
(NOW(), NOW(), '/ddz/userAccount/status', '更新用户账户状态', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/bindPhone', '绑定手机号', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/unbindWechat', '解绑微信', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/resetToken', '重置Token(强制下线)', 'DDZ用户账户管理', 'POST'),
(NOW(), NOW(), '/ddz/userAccount/loginLog', '获取登录日志列表', 'DDZ用户账户管理', 'POST');

-- =============================================
-- 5. 添加玩家API
-- =============================================
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/player/create', '创建玩家', 'DDZ玩家管理', 'POST'),
(NOW(), NOW(), '/ddz/player/delete', '删除玩家', 'DDZ玩家管理', 'DELETE'),
(NOW(), NOW(), '/ddz/player/deleteByPlayerId', '根据PlayerID删除玩家', 'DDZ玩家管理', 'DELETE'),
(NOW(), NOW(), '/ddz/player/list', '获取玩家列表', 'DDZ玩家管理', 'POST'),
(NOW(), NOW(), '/ddz/player/info', '获取玩家信息', 'DDZ玩家管理', 'GET'),
(NOW(), NOW(), '/ddz/player/ban', '封禁玩家', 'DDZ玩家管理', 'POST'),
(NOW(), NOW(), '/ddz/player/unban', '解封玩家', 'DDZ玩家管理', 'POST'),
(NOW(), NOW(), '/ddz/player/update', '更新玩家信息', 'DDZ玩家管理', 'PUT'),
(NOW(), NOW(), '/ddz/player/coins', '更新玩家金币', 'DDZ玩家管理', 'POST');

-- =============================================
-- 6. 为管理员角色(888)分配菜单权限
-- =============================================
-- 注意：以下SQL需要在获取菜单ID后执行
-- 假设管理员角色ID为888

-- 获取父菜单ID
SET @parent_menu_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUser' LIMIT 1);
-- 获取用户账户菜单ID
SET @user_account_menu_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUserAccount' LIMIT 1);
-- 获取玩家菜单ID
SET @player_menu_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzPlayer' LIMIT 1);

-- 为管理员角色添加菜单关联
INSERT INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`) VALUES
(888, @parent_menu_id),
(888, @user_account_menu_id),
(888, @player_menu_id);

-- =============================================
-- 7. 为管理员角色(888)分配API权限 (casbin_rule)
-- =============================================
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/userAccount/create', 'POST'),
('p', '888', '/ddz/userAccount/delete', 'DELETE'),
('p', '888', '/ddz/userAccount/list', 'POST'),
('p', '888', '/ddz/userAccount/info', 'GET'),
('p', '888', '/ddz/userAccount/update', 'PUT'),
('p', '888', '/ddz/userAccount/status', 'POST'),
('p', '888', '/ddz/userAccount/bindPhone', 'POST'),
('p', '888', '/ddz/userAccount/unbindWechat', 'POST'),
('p', '888', '/ddz/userAccount/resetToken', 'POST'),
('p', '888', '/ddz/userAccount/loginLog', 'POST'),
('p', '888', '/ddz/player/create', 'POST'),
('p', '888', '/ddz/player/delete', 'DELETE'),
('p', '888', '/ddz/player/deleteByPlayerId', 'DELETE'),
('p', '888', '/ddz/player/list', 'POST'),
('p', '888', '/ddz/player/info', 'GET'),
('p', '888', '/ddz/player/ban', 'POST'),
('p', '888', '/ddz/player/unban', 'POST'),
('p', '888', '/ddz/player/update', 'PUT'),
('p', '888', '/ddz/player/coins', 'POST');

-- =============================================
-- 说明
-- =============================================
-- 1. 菜单结构：
--    - 用户管理 (父菜单)
--      - 用户列表 (用户账户管理)
--      - 玩家列表 (玩家管理)
--
-- 2. 如果系统已有DDZ相关菜单，请先删除或跳过相应INSERT语句
--
-- 3. 角色权限说明：
--    - 888: 管理员角色
--    - 如需为其他角色分配权限，请修改casbin_rule插入语句
--
-- 4. 执行顺序：
--    a. 先执行菜单INSERT
--    b. 获取菜单ID
--    c. 执行菜单-角色关联
--    d. 执行API权限关联
-- =============================================
