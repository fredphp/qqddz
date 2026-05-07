-- =====================================================
-- 迁移脚本: 机器人配置管理功能
-- 数据库: hlddz (主数据库)
-- 说明:
--   1. 添加机器人配置管理API权限到 sys_apis 表
--   2. 此脚本需要在admin后台数据库执行
-- =====================================================

-- =====================================================
-- 第一部分: 添加API权限到 sys_apis 表
-- =====================================================

INSERT INTO `sys_apis` (`path`, `description`, `api_group`, `method`, `created_at`, `updated_at`) VALUES
-- 配置管理
('/ddz/robotConfig/create', '创建机器人配置', 'DDZ机器人配置', 'POST', NOW(), NOW()),
('/ddz/robotConfig/update', '更新机器人配置', 'DDZ机器人配置', 'PUT', NOW(), NOW()),
('/ddz/robotConfig/delete', '删除机器人配置', 'DDZ机器人配置', 'DELETE', NOW(), NOW()),
('/ddz/robotConfig/setDefault', '设置默认配置', 'DDZ机器人配置', 'POST', NOW(), NOW()),
-- 配置查询
('/ddz/robotConfig/list', '获取机器人配置列表', 'DDZ机器人配置', 'POST', NOW(), NOW()),
('/ddz/robotConfig/info', '获取机器人配置详情', 'DDZ机器人配置', 'GET', NOW(), NOW()),
('/ddz/robotConfig/default', '获取默认配置', 'DDZ机器人配置', 'GET', NOW(), NOW()),
('/ddz/robotConfig/all', '获取所有启用的配置', 'DDZ机器人配置', 'GET', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();


-- =====================================================
-- 第二部分: 验证
-- =====================================================

-- 验证API权限
SELECT `id`, `path`, `description`, `api_group`, `method`
FROM `sys_apis`
WHERE `api_group` = 'DDZ机器人配置'
ORDER BY `id`;


-- =====================================================
-- 第三部分: 回滚脚本
-- =====================================================
/*
-- 回滚API权限
DELETE FROM `sys_apis` WHERE `api_group` = 'DDZ机器人配置';
*/
