-- ============================================
-- 子分区管理菜单和API权限配置SQL
-- 执行此脚本添加菜单和API配置
-- ============================================

-- ============================================
-- 第一部分：菜单配置
-- ============================================

-- 步骤1: 查找或创建斗地主管理父菜单
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`,
    `path`, `name`, `hidden`, `component`, `sort`,
    `title`, `icon`, `close_tab`
)
SELECT NOW(), NOW(), 0, 0, 'ddz', 'ddz', 0, 'view/routerHolder.vue', 2, '斗地主管理', 'option', 0
WHERE NOT EXISTS (SELECT 1 FROM sys_base_menus WHERE `name` = 'ddz');

-- 获取斗地主管理菜单ID
SET @ddz_parent_id = (SELECT id FROM sys_base_menus WHERE `name` = 'ddz' LIMIT 1);

-- 步骤2: 创建子分区管理菜单（如果不存在）
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`,
    `path`, `name`, `hidden`, `component`, `sort`,
    `title`, `icon`, `close_tab`
)
SELECT NOW(), NOW(), 1, @ddz_parent_id,
    'roomSublevel', 'roomSublevel', 0, 'view/ddz/roomSublevel/roomSublevel.vue', 1,
    '子分区管理', 'list', 0
WHERE NOT EXISTS (SELECT 1 FROM sys_base_menus WHERE `name` = 'roomSublevel');

-- 获取子分区菜单ID
SET @sublevel_menu_id = (SELECT id FROM sys_base_menus WHERE `name` = 'roomSublevel' LIMIT 1);

-- 步骤3: 为管理员角色(888)添加菜单权限
INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
VALUES (888, @ddz_parent_id);

INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
VALUES (888, @sublevel_menu_id);

-- ============================================
-- 第二部分：API权限配置
-- ============================================

-- 添加子分区管理相关API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/list', '获取子分区列表', '子分区管理', 'GET'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/list' AND `method` = 'GET');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/detail', '获取子分区详情', '子分区管理', 'GET'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/detail' AND `method` = 'GET');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/create', '创建子分区', '子分区管理', 'POST'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/create' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/update', '更新子分区', '子分区管理', 'PUT'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/update' AND `method` = 'PUT');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/delete', '删除子分区', '子分区管理', 'DELETE'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/delete' AND `method` = 'DELETE');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/batchCreate', '批量创建默认子分区', '子分区管理', 'POST'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/batchCreate' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/byRoom', '根据房间配置获取子分区', '子分区管理', 'GET'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/byRoom' AND `method` = 'GET');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomSublevel/refreshCache', '刷新子分区缓存', '子分区管理', 'POST'
WHERE NOT EXISTS (SELECT 1 FROM sys_apis WHERE `path` = '/ddz/roomSublevel/refreshCache' AND `method` = 'POST');

-- ============================================
-- 第三部分：为管理员角色(888)添加API权限
-- ============================================

-- 获取所有子分区管理API的ID并添加到casbin规则
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`)
SELECT 'p', '888', `path`, `method`
FROM `sys_apis`
WHERE `api_group` = '子分区管理'
AND NOT EXISTS (
    SELECT 1 FROM `casbin_rule`
    WHERE `ptype` = 'p'
    AND `v0` = '888'
    AND `v1` = `path`
    AND `v2` = `method`
);

-- ============================================
-- 验证结果
-- ============================================

-- 查看菜单
SELECT id, parent_id, path, name, title FROM sys_base_menus WHERE `name` IN ('ddz', 'roomSublevel');

-- 查看API
SELECT id, path, description, api_group, method FROM sys_apis WHERE `api_group` = '子分区管理';

-- 查看角色API权限
SELECT * FROM casbin_rule WHERE `ptype` = 'p' AND `v0` = '888' AND `v1` LIKE '/ddz/roomSublevel%';
