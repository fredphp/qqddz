-- ============================================
-- Migration: 添加用户协议管理API权限（完整版）
-- Date: 2026-05-14
-- Database: hlddz
-- Description: 解决"权限不足"问题，添加用户协议相关API定义到sys_apis表
-- Issue: 接口 /sysUserAgreement/updateSysUserAgreement 返回 code:7 "权限不足"
-- ============================================

USE `hlddz`;

-- ============================================
-- 1. 添加API定义到 sys_apis 表
-- ============================================

-- 首先检查并获取当前最大ID，避免ID冲突
-- SET @max_id = (SELECT IFNULL(MAX(id), 0) FROM `sys_apis`);
-- SELECT @max_id AS '当前最大ID';

-- 添加用户协议相关API定义（使用大于500的ID以避免冲突）
-- 注意：如果ID已存在，请修改ID值或使用INSERT IGNORE

INSERT IGNORE INTO `sys_apis` (`id`, `created_at`, `updated_at`, `deleted_at`, `path`, `description`, `api_group`, `method`)
VALUES
(510, NOW(), NOW(), NULL, '/sysUserAgreement/createSysUserAgreement', '创建用户协议', '用户协议', 'POST'),
(511, NOW(), NOW(), NULL, '/sysUserAgreement/updateSysUserAgreement', '更新用户协议', '用户协议', 'PUT'),
(512, NOW(), NOW(), NULL, '/sysUserAgreement/deleteSysUserAgreement', '删除用户协议', '用户协议', 'DELETE'),
(513, NOW(), NOW(), NULL, '/sysUserAgreement/deleteSysUserAgreementByIds', '批量删除用户协议', '用户协议', 'DELETE'),
(514, NOW(), NOW(), NULL, '/sysUserAgreement/setUserAgreementStatus', '设置用户协议状态', '用户协议', 'PUT');

-- 如果INSERT IGNORE不生效，可以使用以下替代方案（先删除再插入）
-- DELETE FROM `sys_apis` WHERE `path` LIKE '/sysUserAgreement/%' AND `api_group` = '用户协议';
-- INSERT INTO `sys_apis` (`created_at`, `updated_at`, `path`, `description`, `api_group`, `method`)
-- VALUES
-- (NOW(), NOW(), '/sysUserAgreement/createSysUserAgreement', '创建用户协议', '用户协议', 'POST'),
-- (NOW(), NOW(), '/sysUserAgreement/updateSysUserAgreement', '更新用户协议', '用户协议', 'PUT'),
-- (NOW(), NOW(), '/sysUserAgreement/deleteSysUserAgreement', '删除用户协议', '用户协议', 'DELETE'),
-- (NOW(), NOW(), '/sysUserAgreement/deleteSysUserAgreementByIds', '批量删除用户协议', '用户协议', 'DELETE'),
-- (NOW(), NOW(), '/sysUserAgreement/setUserAgreementStatus', '设置用户协议状态', '用户协议', 'PUT');

-- ============================================
-- 2. 添加权限规则到 casbin_rule 表（如果不存在）
-- ============================================

-- 为888角色（管理员）添加用户协议管理权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '888', '/sysUserAgreement/createSysUserAgreement', 'POST', '', '', ''),
('p', '888', '/sysUserAgreement/updateSysUserAgreement', 'PUT', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreement', 'DELETE', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreementByIds', 'DELETE', '', '', ''),
('p', '888', '/sysUserAgreement/setUserAgreementStatus', 'PUT', '', '', '');

-- 为9528角色（如果有）添加用户协议管理权限
INSERT IGNORE INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '9528', '/sysUserAgreement/createSysUserAgreement', 'POST', '', '', ''),
('p', '9528', '/sysUserAgreement/updateSysUserAgreement', 'PUT', '', '', ''),
('p', '9528', '/sysUserAgreement/deleteSysUserAgreement', 'DELETE', '', '', ''),
('p', '9528', '/sysUserAgreement/deleteSysUserAgreementByIds', 'DELETE', '', '', ''),
('p', '9528', '/sysUserAgreement/setUserAgreementStatus', 'PUT', '', '', '');

-- ============================================
-- 3. 验证插入结果
-- ============================================

-- 查看新添加的API定义
SELECT id, path, description, api_group, method 
FROM `sys_apis` 
WHERE `path` LIKE '/sysUserAgreement/%' 
ORDER BY id;

-- 查看新添加的权限规则
SELECT ptype, v0 AS role_id, v1 AS api_path, v2 AS method 
FROM `casbin_rule` 
WHERE `v1` LIKE '/sysUserAgreement/%' 
AND `ptype` = 'p'
ORDER BY v0, v1;

-- ============================================
-- 执行说明
-- ============================================
--
-- 方法1: 直接在MySQL中执行
-- mysql -u root -p hlddz < 20260514_add_user_agreement_api_permissions.sql
--
-- 方法2: 使用远程连接执行
-- mysql -h <host> -P <port> -u <user> -p<password> hlddz < 20260514_add_user_agreement_api_permissions.sql
--
-- 方法3: 在后台管理系统中操作
-- 访问: 超级管理员 → API管理 → 同步API
-- 然后在权限管理中为相应角色分配权限
--
-- ============================================
-- 注意事项
-- ============================================
-- 1. 执行前请确保数据库 hlddz 存在
-- 2. 如果ID冲突，请修改ID值或使用自动递增
-- 3. 执行后请重启后台服务或清理缓存
-- 4. INSERT IGNORE 会忽略重复记录，不会报错
--
-- ============================================
