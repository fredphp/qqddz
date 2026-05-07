-- ============================================================
-- 清理和整理 sys_apis 表和 casbin_rule 表数据
-- 日期: 2026-05-06
-- 说明: 清理重复/多余的API，删除客户端API，修复casbin_rule重复记录
-- 注意: 执行此脚本前请先备份数据库
-- ============================================================

-- ============================================================
-- 第一步: 清理 sys_apis 表
-- ============================================================

-- 1. 删除重复的 API 记录（如果存在）
DELETE FROM `sys_apis` WHERE `id` = 444 AND `path` = '/ddz/room/delete' AND `method` = 'DELETE';

-- 2. 删除客户端接口（这些不应该在管理后台API中）
-- arena/* 接口是给游戏客户端使用的，不是管理后台API
DELETE FROM `sys_apis` WHERE `path` = '/ddz/arena/register' AND `method` = 'POST';
DELETE FROM `sys_apis` WHERE `path` = '/ddz/arena/cancel' AND `method` = 'POST';
DELETE FROM `sys_apis` WHERE `path` = '/ddz/arena/status' AND `method` = 'GET';
DELETE FROM `sys_apis` WHERE `path` = '/ddz/arena/list' AND `method` = 'GET';
DELETE FROM `sys_apis` WHERE `path` = '/ddz/arena/registration/list' AND `method` = 'POST';

-- 2.1 删除不存在的API（路由文件中不存在）
DELETE FROM `sys_apis` WHERE `path` = '/ddz/player/create' AND `method` = 'POST';

-- 3. 删除重复的奖励商品/订单API（有两组相同path但不同api_group的记录）
-- 删除 "斗地主奖励" 和 "斗地主订单" 分组的API，保留 "DDZ奖励商品" 和 "DDZ奖励订单" 分组
DELETE FROM `sys_apis` WHERE `id` IN (415, 416, 417, 418, 419, 420, 421, 422, 423);

-- ============================================================
-- 第二步: 清理 casbin_rule 表
-- ============================================================

-- 1. 删除客户端API权限 (ddz/arena/*)
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/arena/register' AND `v2` = 'POST';
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/arena/cancel' AND `v2` = 'POST';
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/arena/status' AND `v2` = 'GET';
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/arena/list' AND `v2` = 'GET';
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/arena/registration/list' AND `v2` = 'POST';

-- 2. 删除不存在API的权限记录
DELETE FROM `casbin_rule` WHERE `v1` = '/ddz/player/create' AND `v2` = 'POST';

-- 3. 删除客户端API权限 (arena/* 客户端接口)
DELETE FROM `casbin_rule` WHERE `v1` = '/arena/register' AND `v2` = 'POST';
DELETE FROM `casbin_rule` WHERE `v1` = '/arena/cancel' AND `v2` = 'POST';
DELETE FROM `casbin_rule` WHERE `v1` = '/arena/status' AND `v2` = 'GET';
DELETE FROM `casbin_rule` WHERE `v1` = '/arena/list' AND `v2` = 'GET';
DELETE FROM `casbin_rule` WHERE `v1` = '/arena/registration/list' AND `v2` = 'POST';

-- 4. 删除重复的casbin_rule记录（保留ID较小的记录）
-- 这些重复是因为 v3, v4, v5 为 NULL 时唯一索引无法阻止重复
DELETE FROM `casbin_rule` WHERE `id` IN (1270, 1271, 1272, 1273, 1274);

-- 5. 更新 casbin_rule 表，将 NULL 转换为空字符串，以便唯一索引正常工作
UPDATE `casbin_rule` SET `v3` = '' WHERE `v3` IS NULL;
UPDATE `casbin_rule` SET `v4` = '' WHERE `v4` IS NULL;
UPDATE `casbin_rule` SET `v5` = '' WHERE `v5` IS NULL;

-- ============================================================
-- 第三步: 修复 casbin_rule 表结构（可选，需要根据实际情况决定）
-- 建议将 v3, v4, v5 字段改为 NOT NULL DEFAULT ''
-- ============================================================

-- 如果需要修改表结构，可以执行以下语句（请先备份数据库）：
-- ALTER TABLE `casbin_rule` MODIFY `v3` varchar(100) NOT NULL DEFAULT '';
-- ALTER TABLE `casbin_rule` MODIFY `v4` varchar(100) NOT NULL DEFAULT '';
-- ALTER TABLE `casbin_rule` MODIFY `v5` varchar(100) NOT NULL DEFAULT '';

-- ============================================================
-- 执行完成后说明:
-- ============================================================
-- 1. sys_apis 表清理：
--    - 删除重复记录
--    - 删除客户端API (/ddz/arena/*)
--    - 删除不存在的API
--
-- 2. casbin_rule 表清理：
--    - 删除客户端API权限
--    - 删除重复记录 (ID: 1270-1274)
--    - 将 NULL 字段更新为空字符串，确保唯一索引正常工作
--
-- 3. 问题原因：
--    MySQL 中 NULL != NULL，导致唯一索引无法阻止重复记录
--    当 v3, v4, v5 为 NULL 时，相同的权限记录可以多次插入
-- ============================================================
