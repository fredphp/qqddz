-- 斗地主后台管理系统数据迁移脚本
-- 添加房间游戏活动日志API权限
-- 执行前请确认sys_apis表中不存在重复数据

-- =====================================================
-- 第一部分：添加API到 sys_apis 表
-- =====================================================

-- 获取房间游戏记录列表
INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
SELECT NOW(), NOW(), '/ddz/room/game-records', '获取房间游戏活动日志', '斗地主游戏房间', 'POST'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_apis` WHERE `path` = '/ddz/room/game-records' AND `method` = 'POST');

-- =====================================================
-- 第二部分：添加权限到 casbin_rule 表 (管理员角色888)
-- =====================================================

-- 为管理员角色(888)授权房间游戏活动日志API
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`)
SELECT 'p', '888', '/ddz/room/game-records', 'POST', '', '', ''
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `casbin_rule`
    WHERE `ptype` = 'p' AND `v0` = '888' AND `v1` = '/ddz/room/game-records' AND `v2` = 'POST'
);
