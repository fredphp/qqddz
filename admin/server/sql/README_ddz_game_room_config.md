# DDZ 游戏房间配置菜单和 API 权限初始化说明

## 概述

本说明文档描述如何为 `ddz_room_config` 表添加后台管理菜单和 API 权限。

## 文件说明

- `ddz_game_room_config_menu_api.sql` - 包含菜单、API 权限和默认数据的 SQL 脚本

## 执行方式

### 方式一：通过 MySQL 命令行执行

```bash
# 连接到 MySQL
mysql -u root -p

# 执行 SQL 文件
source /path/to/ddz_game_room_config_menu_api.sql
```

### 方式二：直接复制 SQL 执行

打开 `ddz_game_room_config_menu_api.sql` 文件，复制内容并在 MySQL 客户端中执行。

## SQL 内容摘要

### 1. 添加菜单

- 父菜单：`斗地主管理` (ddzManage)
- 子菜单：`游戏房间配置` (ddzGameRoomConfig)
  - 路径：`gameRoomConfig`
  - 组件：`view/ddz/roomConfig/roomConfig.vue`
  - 排序：3

### 2. 添加 API 权限

| API 路径 | 方法 | 描述 |
|---------|------|------|
| `/ddz/roomConfig/list` | POST | 获取游戏房间配置列表 |
| `/ddz/roomConfig/create` | POST | 创建游戏房间配置 |
| `/ddz/roomConfig/update` | PUT | 更新游戏房间配置 |
| `/ddz/roomConfig/delete` | DELETE | 删除游戏房间配置 |

### 3. 分配角色权限

- 为管理员角色(888)分配菜单权限
- 为管理员角色(888)分配 API 权限

### 4. 默认房间配置数据

| ID | 房间名称 | 房间类型 | 底分 | 倍数 | 最低金币 | 最高金币 |
|----|---------|---------|------|------|---------|---------|
| 1 | 新手场 | 1 | 1 | 1 | 1,000 | 50,000 |
| 2 | 普通场 | 2 | 2 | 1 | 50,000 | 200,000 |
| 3 | 高级场 | 3 | 5 | 2 | 200,000 | 1,000,000 |
| 4 | 富豪场 | 4 | 10 | 3 | 1,000,000 | 5,000,000 |
| 5 | 至尊场 | 5 | 20 | 5 | 5,000,000 | 无限制 |

## 访问菜单

执行 SQL 后，在后台管理系统中可以看到：

- 菜单路径：`斗地主管理` -> `游戏房间配置`
- URL：`http://localhost:8080/#/layout/ddzManage/gameRoomConfig`

## 注意事项

1. SQL 使用 `INSERT IGNORE` 语法，可以重复执行不会报错
2. 如果菜单已存在，不会重复插入
3. 执行前请确保 `hlddz` 和 `ddz_game` 数据库已创建

## 已修改的文件

### 后端
- `admin/server/service/ddz/game_log.go` - 更新房间类型名称映射

### 前端
- `admin/web/src/view/ddz/roomConfig/roomConfig.vue` - 更新房间类型选项和显示
