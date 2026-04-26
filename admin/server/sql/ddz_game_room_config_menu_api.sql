-- =============================================
-- DDZ 游戏房间配置菜单和API权限初始化 SQL
-- 数据库：hlddz (gin-vue-admin系统数据库)
-- 说明：为 ddz_room_config 表添加后台管理菜单和API权限
-- 可重复执行，幂等设计
-- =============================================

USE `hlddz`;

-- =============================================
-- 一、检查并添加菜单 (幂等设计)
-- =============================================

-- 1. 确保父菜单存在 (斗地主管理)
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 0, 0, 'ddzManage', 'ddzManage', 0, 'view/routerHolder.vue', 3, '斗地主管理', 'game', 0);

-- 2. 添加游戏房间配置子菜单 (ddz_room_config 表的管理菜单)
-- 注意：使用 INSERT IGNORE 避免重复插入
INSERT IGNORE INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
) VALUES
(NOW(), NOW(), 1, (SELECT id FROM (SELECT id FROM sys_base_menus WHERE name = 'ddzManage') t), 
 'gameRoomConfig', 'ddzGameRoomConfig', 0, 'view/ddz/roomConfig/roomConfig.vue', 3, '游戏房间配置', 'setting', 0);

-- =============================================
-- 二、添加API权限 (sys_apis表) - 幂等设计
-- =============================================

-- 游戏房间配置API (对应 ddz_room_config 表)
INSERT IGNORE INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`) VALUES
(NOW(), NOW(), '/ddz/roomConfig/list', '获取游戏房间配置列表', 'DDZ游戏房间配置', 'POST'),
(NOW(), NOW(), '/ddz/roomConfig/create', '创建游戏房间配置', 'DDZ游戏房间配置', 'POST'),
(NOW(), NOW(), '/ddz/roomConfig/update', '更新游戏房间配置', 'DDZ游戏房间配置', 'PUT'),
(NOW(), NOW(), '/ddz/roomConfig/delete', '删除游戏房间配置', 'DDZ游戏房间配置', 'DELETE');

-- =============================================
-- 三、为管理员角色(888)分配菜单权限 - 幂等设计
-- =============================================

-- 分配游戏房间配置菜单权限
INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`)
SELECT 888, id FROM sys_base_menus WHERE name = 'ddzGameRoomConfig';

-- =============================================
-- 四、为管理员角色(888)分配API权限 (casbin_rule) - 幂等设计
-- =============================================

-- 游戏房间配置API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/roomConfig/list', 'POST'),
('p', '888', '/ddz/roomConfig/create', 'POST'),
('p', '888', '/ddz/roomConfig/update', 'PUT'),
('p', '888', '/ddz/roomConfig/delete', 'DELETE');

-- =============================================
-- 五、插入默认房间配置数据到 ddz_game 数据库
-- =============================================

USE `ddz_game`;

-- 插入默认房间配置数据 (如果不存在)
INSERT IGNORE INTO `ddz_room_config` 
(`id`, `room_name`, `room_type`, `base_score`, `multiplier`, `min_gold`, `max_gold`, `bot_enabled`, `bot_count`, `fee_rate`, `max_round`, `timeout_seconds`, `status`, `sort_order`, `description`, `created_at`, `updated_at`) 
VALUES
(1, '新手场', 1, 1, 1, 1000, 50000, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', NOW(), NOW()),
(2, '普通场', 2, 2, 1, 50000, 200000, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', NOW(), NOW()),
(3, '高级场', 3, 5, 2, 200000, 1000000, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', NOW(), NOW()),
(4, '富豪场', 4, 10, 3, 1000000, 5000000, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', NOW(), NOW()),
(5, '至尊场', 5, 20, 5, 5000000, 0, 0, 0, 0.0500, 20, 15, 1, 5, '底分20,倍数5,顶级玩家对决,无上限', NOW(), NOW());

-- =============================================
-- 执行完成提示
-- =============================================
SELECT 'DDZ游戏房间配置菜单和API权限初始化完成!' AS result;
SELECT '默认房间配置数据已插入!' AS result;
