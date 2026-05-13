-- ============================================
-- Rollback Migration: 回滚用户协议管理API权限
-- Date: 2026-05-14
-- Database: hlddz
-- Description: 回滚用户协议相关API定义和权限规则
-- ============================================

USE `hlddz`;

-- ============================================
-- 1. 删除 sys_apis 表中的用户协议API定义
-- ============================================

DELETE FROM `sys_apis`
WHERE `path` LIKE '/sysUserAgreement/%'
AND `api_group` IN ('用户协议', '单页管理');

-- ============================================
-- 2. 删除 casbin_rule 表中的用户协议权限规则
-- ============================================

DELETE FROM `casbin_rule`
WHERE `v1` LIKE '/sysUserAgreement/%'
AND `ptype` = 'p'
AND `v0` IN ('888', '9528');

-- ============================================
-- 3. 验证删除结果
-- ============================================

-- 确认API定义已删除
SELECT COUNT(*) AS '剩余用户协议API数量' 
FROM `sys_apis` 
WHERE `path` LIKE '/sysUserAgreement/%';

-- 确认权限规则已删除
SELECT COUNT(*) AS '剩余用户协议权限规则数量' 
FROM `casbin_rule` 
WHERE `v1` LIKE '/sysUserAgreement/%' 
AND `ptype` = 'p';

-- ============================================
-- 执行说明
-- ============================================
--
-- mysql -u root -p hlddz < 20260514_add_user_agreement_api_permissions_rollback.sql
--
-- ============================================
