-- ============================================
-- Rollback Migration: 回滚用户协议管理权限
-- Date: 2026-05-13
-- Description: 回滚setUserAgreementStatus等API权限
-- ============================================

-- ============================================
-- 1. 删除 sys_apis 表中的API定义
-- ============================================

DELETE FROM `sys_apis` WHERE `path` = '/sysUserAgreement/setUserAgreementStatus';

-- ============================================
-- 2. 删除 casbin_rule 表中的权限
-- ============================================

DELETE FROM `casbin_rule`
WHERE `v1` LIKE '/sysUserAgreement/%'
AND `ptype` = 'p'
AND `v0` IN ('888', '9528');

-- ============================================
-- 3. 重置 sys_user_agreement 表的 type 字段 (可选)
-- ============================================

-- 如果需要重置type字段
-- UPDATE `sys_user_agreement` SET `type` = 'user_agreement';

-- ============================================
-- 执行说明
-- ============================================
--
-- mysql -h 8.137.78.189 -P 3306 -u qqddz_admin -p'Qqddz@2024#Admin' ddz_game < 20260513_add_user_agreement_permissions_rollback.sql
--
-- ============================================
