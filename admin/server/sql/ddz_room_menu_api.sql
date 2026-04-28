-- =============================================
-- DDZ房间列表菜单和API权限SQL
-- 数据库：hlddz (gin-vue-admin系统数据库)
-- =============================================

-- =============================================
-- 一、分析游戏日志与房间关联关系
-- =============================================
-- 当前设计：
-- ddz_game_records.room_id -> ddz_rooms.room_id (直接关联)
-- ddz_deal_logs.game_id -> ddz_game_records.game_id -> ddz_game_records.room_id (间接关联)
-- ddz_bid_logs.game_id -> ddz_game_records.game_id -> ddz_game_records.room_id (间接关联)
-- ddz_play_logs.game_id -> ddz_game_records.game_id -> ddz_game_records.room_id (间接关联)
--
-- 结论：关联关系合理，日志通过game_id间接关联房间

-- =============================================
-- 二、添加房间列表菜单（斗地主管理下）
-- =============================================

-- 获取斗地主管理父菜单ID
SET @ddz_manage_parent_id = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzManage' LIMIT 1);

-- 检查房间列表菜单是否已存在
-- 如果不存在则插入房间列表菜单
INSERT INTO `sys_base_menus` (
    `created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`,
    `component`, `sort`, `title`, `icon`, `close_tab`
)
SELECT NOW(), NOW(), 1, @ddz_manage_parent_id, 'gameRoom', 'ddzGameRoom', 0,
    'view/ddz/gameRoom/gameRoom.vue', 0, '房间列表', 'house', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_base_menus` WHERE `name` = 'ddzGameRoom');

-- 获取房间列表菜单ID
SET @menu_game_room = (SELECT `id` FROM `sys_base_menus` WHERE `name` = 'ddzGameRoom' LIMIT 1);

-- 为管理员角色添加房间列表菜单权限
INSERT IGNORE INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`) 
VALUES (888, @menu_game_room);

-- =============================================
-- 三、添加房间实例API权限 (sys_apis表)
-- =============================================

-- 房间实例API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/room/list', '获取房间列表', 'DDZ游戏房间', 'POST'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/room/list' AND `method` = 'POST');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/room/detail', '获取房间详情', 'DDZ游戏房间', 'GET'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/room/detail' AND `method` = 'GET');

INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/room/delete', '删除房间', 'DDZ游戏房间', 'DELETE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/room/delete' AND `method` = 'DELETE');

-- 房间配置刷新缓存API
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/roomConfig/refresh-cache', '刷新房间配置缓存', 'DDZ房间配置', 'POST'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/roomConfig/refresh-cache' AND `method` = 'POST');

-- =============================================
-- 四、为管理员角色(888)分配API权限 (casbin_rule)
-- =============================================

-- 房间实例API权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`) VALUES
('p', '888', '/ddz/room/list', 'POST'),
('p', '888', '/ddz/room/detail', 'GET'),
('p', '888', '/ddz/room/delete', 'DELETE'),
('p', '888', '/ddz/roomConfig/refresh-cache', 'POST');

-- =============================================
-- 五、更新游戏记录页面，添加房间ID显示
-- =============================================
-- 前端页面需要修改，这里只是SQL记录

-- =============================================
-- 六、数据表关联关系说明
-- =============================================
-- 
-- 表结构关系图：
-- 
-- ddz_room_config (房间模板配置)
--     ↓ room_type
-- ddz_rooms (实际房间实例)
--     ↓ room_id
-- ddz_game_records (游戏记录)
--     ↓ game_id
-- ├── ddz_deal_logs (发牌日志)
-- ├── ddz_bid_logs (叫地主日志)
-- └── ddz_play_logs (出牌日志)
-- 
-- 查询示例：
-- 1. 查询某房间的所有游戏记录
--    SELECT * FROM ddz_game_records WHERE room_id = 'xxx';
-- 
-- 2. 查询某游戏的所有日志
--    SELECT * FROM ddz_play_logs WHERE game_id = 'xxx';
-- 
-- 3. 查询某房间的所有出牌日志（通过游戏记录关联）
--    SELECT pl.* FROM ddz_play_logs pl
--    INNER JOIN ddz_game_records gr ON pl.game_id = gr.game_id
--    WHERE gr.room_id = 'xxx';

-- =============================================
-- 完成提示
-- =============================================
-- 执行完成后请：
-- 1. 刷新后台管理系统
-- 2. 重新登录以获取新权限
-- 3. 创建前端页面：view/ddz/gameRoom/gameRoom.vue
