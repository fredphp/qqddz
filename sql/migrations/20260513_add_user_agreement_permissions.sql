-- ============================================
-- Migration: 添加用户协议管理权限
-- Date: 2026-05-13
-- Description: 添加setUserAgreementStatus等API权限
-- ============================================

-- ============================================
-- 1. 添加API定义到 sys_apis 表
-- ============================================

-- 添加 setUserAgreementStatus API
INSERT INTO `sys_apis` (`id`, `created_at`, `updated_at`, `deleted_at`, `path`, `description`, `api_group`, `method`)
VALUES (509, NOW(), NOW(), NULL, '/sysUserAgreement/setUserAgreementStatus', '设置用户协议状态', '用户协议', 'PUT');

-- 如果需要添加其他用户协议相关API（通常这些应该已存在，但以防万一）
-- INSERT INTO `sys_apis` (`id`, `created_at`, `updated_at`, `deleted_at`, `path`, `description`, `api_group`, `method`)
-- VALUES
-- (510, NOW(), NOW(), NULL, '/sysUserAgreement/createSysUserAgreement', '创建用户协议', '用户协议', 'POST'),
-- (511, NOW(), NOW(), NULL, '/sysUserAgreement/updateSysUserAgreement', '更新用户协议', '用户协议', 'PUT'),
-- (512, NOW(), NOW(), NULL, '/sysUserAgreement/deleteSysUserAgreement', '删除用户协议', '用户协议', 'DELETE'),
-- (513, NOW(), NOW(), NULL, '/sysUserAgreement/deleteSysUserAgreementByIds', '批量删除用户协议', '用户协议', 'DELETE');

-- ============================================
-- 2. 添加权限到 casbin_rule 表 (888角色 - 管理员)
-- ============================================

-- 添加用户协议管理权限
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '888', '/sysUserAgreement/setUserAgreementStatus', 'PUT', '', '', ''),
('p', '888', '/sysUserAgreement/createSysUserAgreement', 'POST', '', '', ''),
('p', '888', '/sysUserAgreement/updateSysUserAgreement', 'PUT', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreement', 'DELETE', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreementByIds', 'DELETE', '', '', '');

-- 如果有其他角色需要这些权限，可以添加以下记录
-- 9528角色权限
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '9528', '/sysUserAgreement/setUserAgreementStatus', 'PUT', '', '', ''),
('p', '9528', '/sysUserAgreement/createSysUserAgreement', 'POST', '', '', ''),
('p', '9528', '/sysUserAgreement/updateSysUserAgreement', 'PUT', '', '', ''),
('p', '9528', '/sysUserAgreement/deleteSysUserAgreement', 'DELETE', '', '', ''),
('p', '9528', '/sysUserAgreement/deleteSysUserAgreementByIds', 'DELETE', '', '', '');

-- ============================================
-- 3. 更新现有数据的 type 字段默认值 (如果表中有该字段)
-- ============================================

-- 注意：请根据实际表结构决定是否执行以下语句
-- 如果表中没有 type 字段，请跳过此部分

-- 为没有type字段的记录设置默认值
-- UPDATE `sys_user_agreement`
-- SET `type` = 'user_agreement'
-- WHERE `type` IS NULL OR `type` = '';

-- ============================================
-- 4. 同步 sys_ignore_apis 表 (可选)
-- ============================================

-- 如果想将某些API设为不需要权限验证，可以添加以下记录
-- 注意：setUserAgreementStatus 是管理功能，不建议添加到忽略列表
-- INSERT INTO `sys_ignore_apis` (`created_at`, `updated_at`, `path`, `method`)
-- VALUES (NOW(), NOW(), '/sysUserAgreement/setUserAgreementStatus', 'PUT');

-- ============================================
-- 执行说明
-- ============================================
--
-- 方法1: 直接在MySQL中执行
-- mysql -u root -p ddz_game < 20260513_add_user_agreement_permissions.sql
--
-- 方法2: 使用远程连接执行
-- mysql -h 8.137.78.189 -P 3306 -u qqddz_admin -p'Qqddz@2024#Admin' ddz_game < 20260513_add_user_agreement_permissions.sql
--
-- 方法3: 在后台管理系统中操作
-- 访问: 超级管理员 -> API管理 -> 同步API
-- 然后在权限管理中为相应角色分配权限
--
-- ============================================
