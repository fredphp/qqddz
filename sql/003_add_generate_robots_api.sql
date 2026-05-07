-- =====================================================
-- 迁移脚本: 添加机器人生成API权限
-- 数据库: hlddz
-- 表: sys_apis
-- 说明: 添加批量生成机器人玩家API权限
-- 创建时间: 2024-01-01
-- =====================================================

-- 添加机器人生成API权限
INSERT INTO `sys_apis` (`path`, `description`, `api_group`, `method`, `created_at`, `updated_at`) VALUES
('/ddz/player/generateRobots', '批量生成机器人玩家', 'DDZ玩家管理', 'POST', NOW(), NOW());

-- 验证插入结果
SELECT `id`, `path`, `description`, `api_group`, `method` 
FROM `sys_apis` 
WHERE `path` = '/ddz/player/generateRobots';

-- =====================================================
-- 重要说明：权限分配
-- 执行完此SQL后，还需要在管理后台执行以下操作：
-- 1. 访问 http://localhost:8080/#/layout/admin/api 确认API权限已添加
-- 2. 访问 http://localhost:8080/#/layout/superAdmin/role 编辑角色权限
-- 3. 勾选 "/ddz/player/generateRobots" 权限并保存
-- =====================================================
