-- =====================================================
-- 迁移脚本: 添加机器人配置管理菜单
-- 数据库: hlddz (主数据库)
-- 说明:
--   1. 添加机器人配置管理菜单到 sys_base_menus 表
--   2. 关联菜单到管理员角色
-- =====================================================

-- =====================================================
-- 第一部分: 添加菜单
-- =====================================================

-- 首先检查是否已存在斗地主父菜单，如果不存在则创建
-- 注意：根据现有数据，斗地主相关菜单可能已经存在

-- 查找或创建斗地主游戏数据父菜单 (id=102 已存在)
-- 如果需要创建新的父菜单，可以使用以下语句：
-- INSERT INTO `sys_base_menus` (
--     `created_at`, `updated_at`, `deleted_at`, `menu_level`, `parent_id`, 
--     `path`, `name`, `hidden`, `component`, `sort`, `title`, `icon`, `close_tab`
-- ) VALUES (
--     NOW(), NOW(), NULL, 0, 0, 
--     'ddzGame', 'ddzGame', 0, 'view/routerHolder.vue', 3, '游戏数据', 'coordinate', 0
-- ) ON DUPLICATE KEY UPDATE `title` = '游戏数据';

-- 添加机器人配置管理子菜单到"游戏数据"菜单下 (parent_id=102)
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `deleted_at`, `menu_level`, `parent_id`, 
    `path`, `name`, `hidden`, `component`, `sort`, `active_name`, `keep_alive`, 
    `default_menu`, `title`, `icon`, `close_tab`, `transition_type`
) VALUES (
    NOW(), NOW(), NULL, 1, 102, 
    'robotConfig', 'ddzRobotConfig', 0, 'view/ddz/robotConfig/robotConfig.vue', 
    14, '', 0, 0, '机器人配置', 'setting', 0, ''
) ON DUPLICATE KEY UPDATE 
    `component` = 'view/ddz/robotConfig/robotConfig.vue',
    `title` = '机器人配置',
    `updated_at` = NOW();


-- =====================================================
-- 第二部分: 关联菜单到管理员角色
-- =====================================================

-- 获取机器人配置菜单ID并关联到管理员角色
INSERT INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
SELECT '888', `id` 
FROM `sys_base_menus` 
WHERE `name` = 'ddzRobotConfig' AND `deleted_at` IS NULL
LIMIT 1
ON DUPLICATE KEY UPDATE `sys_authority_authority_id` = '888';


-- =====================================================
-- 第三部分: 验证
-- =====================================================

-- 验证菜单
SELECT `id`, `parent_id`, `path`, `name`, `title`, `component`
FROM `sys_base_menus`
WHERE `name` = 'ddzRobotConfig' AND `deleted_at` IS NULL;

-- 验证角色菜单关联
SELECT am.`sys_authority_authority_id`, m.`name`, m.`title`
FROM `sys_authority_menus` am
JOIN `sys_base_menus` m ON am.`sys_base_menu_id` = m.`id`
WHERE m.`name` = 'ddzRobotConfig';


-- =====================================================
-- 第四部分: 回滚脚本
-- =====================================================
/*
-- 获取菜单ID
SET @robot_config_menu_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzRobotConfig' LIMIT 1);

-- 删除角色菜单关联
DELETE FROM `sys_authority_menus`
WHERE `sys_base_menu_id` = @robot_config_menu_id;

-- 软删除菜单（推荐方式）
UPDATE `sys_base_menus` SET `deleted_at` = NOW() WHERE `name` = 'ddzRobotConfig';

-- 或者硬删除菜单（不推荐）
-- DELETE FROM `sys_base_menus` WHERE `name` = 'ddzRobotConfig';
*/
