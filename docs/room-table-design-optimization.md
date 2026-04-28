# 房间表设计优化方案

## 1. 关于 `room_id` 和 `room_code` 的说明

### 当前设计中：
- `room_code` (varchar(10)): 房间号，用户可见的6位数字标识，用于加入房间
- `room_id` (varchar(64)): 房间唯一标识，设计用于内部关联

### 问题分析：
在 Go 代码中，目前只使用了 `room_code`，没有使用 `room_id`。这导致：
1. `room_id` 字段冗余
2. 表设计不一致

### 建议方案：
**方案一**：移除 `room_id`，只保留 `room_code`
- `room_code` 作为主要标识已足够
- 减少冗余字段

**方案二**：将 `room_id` 改为 `room_uuid`，使用 UUID 作为内部关联键
- 优点：可用于分布式系统中的全局唯一标识
- 缺点：增加复杂度

**推荐方案一**：在 Go 模型中已经使用 `room_code` 作为主要标识，建议统一使用。

## 2. 关于 `room_config_id` 没有写入的问题

### 原因分析：
1. 客户端创建房间时没有传递 `room_config_id` 参数
2. 服务端接收到的 `roomConfigID` 默认为 0

### 已修复：
1. 更新客户端 `socket_ctr.js`，支持传递 `room_config_id`
2. 更新 `creatroom.js`，在创建房间时传递房间配置ID

### 验证：
创建房间后，检查数据库 `ddz_rooms` 表中的 `room_config_id` 字段是否有值。

## 3. 关于 `player1_id`, `player2_id`, `player3_id` 的设计问题

### 原设计问题：
- 固定座位设计，不支持玩家动态加入/退出
- 玩家退出后座位号无法重用
- 新玩家加入时需要找到空座位

### 优化方案：
创建新的 `ddz_room_players` 关联表：

```sql
CREATE TABLE `ddz_room_players` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `room_code` varchar(10) NOT NULL COMMENT '房间号',
  `player_id` bigint unsigned NOT NULL COMMENT '玩家ID',
  `seat_index` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '座位号: 0-2',
  `is_creator` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否房主: 0-否, 1-是',
  `is_ready` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否准备: 0-否, 1-是',
  `is_offline` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否离线: 0-在线, 1-离线',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `left_at` datetime DEFAULT NULL COMMENT '离开时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_room_player` (`room_code`, `player_id`),
  KEY `idx_room_code` (`room_code`),
  KEY `idx_player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间玩家关联表';
```

### 优点：
1. **支持动态加入/退出**：玩家离开只需设置 `left_at` 时间
2. **保留历史记录**：可以追溯玩家的加入/离开历史
3. **座位复用**：新玩家可以分配到已离开玩家的座位
4. **扩展性好**：可以轻松添加更多玩家状态字段

### 使用示例：
```go
// 玩家加入房间
database.CreateRoomPlayer(&database.RoomPlayer{
    RoomCode:  "123456",
    PlayerID:  playerID,
    SeatIndex: 0,
    IsCreator: 1,
})

// 玩家离开房间
database.RemoveRoomPlayer("123456", playerID)

// 获取房间当前玩家
players, _ := database.GetRoomPlayers("123456")
```

## 4. 房间记录分表方案

### 方案一：MySQL 分区表（推荐）
按月份分区，自动管理数据：
```sql
PARTITION BY RANGE (TO_DAYS(started_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    ...
);
```

### 方案二：手动分表
按月份创建独立的表：
- `ddz_game_records_202401`
- `ddz_game_records_202402`
- ...

### 优点：
1. 提高查询性能
2. 便于数据归档和清理
3. 支持大数据量存储

详细 SQL 请参考：`migrations/game_record_partition.sql`

## 5. 房间解散问题修复

### 问题描述：
用户刷新页面回到大厅后，之前的房间应该解散，但后台管理系统仍显示"等待中"。

### 原因分析：
1. 房主断开连接时，房间状态没有更新到数据库
2. `NotifyPlayerOffline` 只是在内存中标记玩家离线

### 已修复：
在 `lifecycle.go` 中的 `NotifyPlayerOffline` 函数：
1. 检测房主断开连接
2. 更新数据库房间状态为 `RoomStatusClosed`
3. 通知其他玩家房间已解散
4. 从内存和 Redis 中删除房间

```go
// 如果房间处于等待状态，房主断开连接时解散房间
if room.State == RoomStateWaiting && isCreator {
    // 更新数据库房间状态为已关闭
    database.UpdateRoomStatus(roomCode, database.RoomStatusClosed)
    // 通知其他玩家
    // 删除房间
}
```

## 6. 迁移步骤

### 第一步：创建新表
```bash
# 执行迁移脚本
mysql -u root -p ddz_game < migrations/add_room_players.sql
```

### 第二步：数据迁移（可选）
如果需要保留现有数据，可以将 `player1_id`, `player2_id`, `player3_id` 迁移到新表。

### 第三步：更新代码
- 已更新 Go 模型和数据库操作函数
- 已更新客户端创建房间逻辑

### 第四步：测试验证
1. 创建房间，验证 `room_config_id` 写入
2. 房主断开连接，验证房间状态更新
3. 玩家加入/离开，验证关联表记录

## 7. 总结

| 问题 | 状态 | 解决方案 |
|-----|------|---------|
| `room_id` 冗余 | 建议移除 | 统一使用 `room_code` |
| `room_config_id` 未写入 | ✅ 已修复 | 客户端传递配置ID |
| 固定座位设计不合理 | ✅ 已优化 | 创建关联表 |
| 房间未解散 | ✅ 已修复 | 房主断开时关闭房间 |
| 记录分表 | ✅ 已设计 | 按月份分区/分表 |
