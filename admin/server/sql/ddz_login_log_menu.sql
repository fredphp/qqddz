-- =============================================
-- 登录日志菜单和API权限配置
-- 在用户管理菜单下添加登录日志子菜单
-- =============================================

-- 注意：此SQL需要在gin-vue-admin系统数据库(hlddz)中执行

-- =============================================
-- 一、检查并创建登录日志菜单
-- =============================================

-- 获取用户管理父菜单ID
SET @ddz_user_parent_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUser' LIMIT 1);

-- 如果用户管理菜单不存在，先创建
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
)
SELECT NOW(), NOW(), 0, 0, 'ddzUser', 'ddzUser', 0, 'view/routerHolder.vue', 2, '用户管理', 'user', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzUser');

-- 重新获取用户管理父菜单ID
SET @ddz_user_parent_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzUser' LIMIT 1);

-- 检查登录日志菜单是否已存在，不存在则创建
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
)
SELECT NOW(), NOW(), 1, @ddz_user_parent_id, 'loginLog', 'ddzLoginLog', 0,
    'view/ddz/loginLog/loginLog.vue', 3, '登录日志', 'monitor', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzLoginLog');

-- =============================================
-- 二、添加登录日志API权限
-- =============================================

-- 添加登录日志API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/userAccount/loginLog', '获取登录日志列表', 'DDZ登录日志', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/userAccount/loginLog' AND `method` = 'POST');

-- =============================================
-- 三、为管理员角色(888)分配菜单权限
-- =============================================

-- 获取登录日志菜单ID
SET @menu_login_log = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzLoginLog' LIMIT 1);

-- 为管理员角色添加登录日志菜单关联
INSERT INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
SELECT 888, @menu_login_log
FROM DUAL
WHERE @menu_login_log IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM `sys_authority_menus`
    WHERE `sys_authority_authority_id` = 888 AND `sys_base_menu_id` = @menu_login_log
);

-- =============================================
-- 四、为管理员角色(888)分配API权限
-- =============================================

-- 添加登录日志API权限到casbin_rule
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`)
SELECT 'p', '888', '/ddz/userAccount/loginLog', 'POST'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `casbin_rule`
    WHERE `ptype` = 'p' AND `v0` = '888' AND `v1` = '/ddz/userAccount/loginLog' AND `v2` = 'POST'
);

-- =============================================
-- 验证结果
-- =============================================
SELECT '菜单创建结果:' AS info;
SELECT id, path, name, title, parent_id FROM sys_base_menus WHERE name IN ('ddzUser', 'ddzLoginLog');

SELECT '菜单权限分配结果:' AS info;
SELECT am.sys_authority_authority_id, m.name as menu_name, m.title
FROM sys_authority_menus am
JOIN sys_base_menus m ON am.sys_base_menu_id = m.id
WHERE m.name IN ('ddzUser', 'ddzLoginLog') AND am.sys_authority_authority_id = 888;

SELECT 'API权限分配结果:' AS info;
SELECT * FROM casbin_rule WHERE v1 LIKE '%loginLog%';
