-- ============================================
-- 子分区管理菜单SQL
-- 执行此脚本添加菜单配置
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

-- 获取新创建的菜单ID
SET @sublevel_menu_id = (SELECT id FROM sys_base_menus WHERE `name` = 'roomSublevel' LIMIT 1);

-- 步骤3: 为管理员角色(888)添加菜单权限
INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
VALUES (888, @ddz_parent_id);

INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
VALUES (888, @sublevel_menu_id);

-- 验证结果
SELECT id, parent_id, path, name, title FROM sys_base_menus WHERE `name` IN ('ddz', 'roomSublevel');
