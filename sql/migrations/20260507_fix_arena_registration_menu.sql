-- 修复竞技场报名菜单配置
-- 将 arenaRegistration 菜单移动到 ddzArena 菜单下

-- 更新菜单配置：设置正确的父级ID和组件名称
UPDATE `sys_base_menus` 
SET 
    `parent_id` = 103,  -- 父级菜单改为 ddzArena (竞技数据)
    `component_name` = 'ddzArenaRegistration',  -- 组件名称
    `sort` = 4  -- 排序
WHERE `id` = 119;

-- 确认更新
SELECT id, parent_id, path, name, component_name, title 
FROM `sys_base_menus` 
WHERE `id` = 119 OR `parent_id` = 103;
