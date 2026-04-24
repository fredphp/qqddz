-- =============================================
-- 清理重复菜单SQL脚本
-- 数据库：hlddz (gin-vue-admin系统数据库)
-- =============================================

-- =============================================
-- 一、查看重复菜单情况
-- =============================================

-- 查看按name分组的重复菜单
SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM sys_base_menus 
WHERE name LIKE 'ddz%' OR name LIKE 'ddz%'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 查看所有DDZ相关菜单
SELECT id, name, path, title, parent_id, created_at
FROM sys_base_menus 
WHERE name LIKE 'ddz%' OR path LIKE '%ddz%'
ORDER BY name, id;

-- =============================================
-- 二、清理重复菜单 (保留最早创建的)
-- =============================================

-- 先删除sys_authority_menus中的关联
DELETE sam FROM sys_authority_menus sam
INNER JOIN (
    SELECT name, MIN(id) as keep_id
    FROM sys_base_menus
    WHERE name LIKE 'ddz%' OR name LIKE 'ddz%'
    GROUP BY name
    HAVING COUNT(*) > 1
) t1 ON sam.sys_base_menu_id != t1.keep_id
INNER JOIN sys_base_menus sbm ON sam.sys_base_menu_id = sbm.id AND sbm.name = t1.name;

-- 删除重复菜单 (保留最早创建的，即ID最小的)
DELETE sbm FROM sys_base_menus sbm
INNER JOIN (
    SELECT name, MIN(id) as keep_id
    FROM sys_base_menus
    WHERE name LIKE 'ddz%' OR name LIKE 'ddz%'
    GROUP BY name
    HAVING COUNT(*) > 1
) t1 ON sbm.name = t1.name AND sbm.id != t1.keep_id;

-- =============================================
-- 三、清理孤儿菜单关联 (菜单已删除但关联还在)
-- =============================================

DELETE sam FROM sys_authority_menus sam
LEFT JOIN sys_base_menus sbm ON sam.sys_base_menu_id = sbm.id
WHERE sbm.id IS NULL;

-- =============================================
-- 四、查看清理后的结果
-- =============================================

SELECT '=== 清理后的DDZ菜单 ===' AS info;

SELECT id, name, path, title, parent_id
FROM sys_base_menus 
WHERE name LIKE 'ddz%' OR path LIKE '%ddz%'
ORDER BY parent_id, sort;

SELECT '=== 清理完成 ===' AS result;
