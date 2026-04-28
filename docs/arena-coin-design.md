# 竞技币系统设计方案

## 1. 概述

本文档描述斗地主游戏的竞技币系统设计方案。竞技币是一种新的虚拟货币，专门用于竞技场房间的游戏结算。

### 1.1 币种分类

| 币种 | 用途 | 适用房间 |
|------|------|----------|
| 金币 (Gold) | 普通场房间 | 新手场、普通场、高级场、富豪场、至尊场 |
| 竞技币 (ArenaCoin) | 竞技场房间 | 初级竞技场、中级竞技场、高级竞技场、大师竞技场 |

### 1.2 设计原则

1. **独立结算**：普通场使用金币结算，竞技场使用竞技币结算，互不影响
2. **入场限制**：根据房间分类检查对应币种是否满足入场条件
3. **数据追踪**：记录竞技币流水，便于查询和分析

## 2. 数据库设计

### 2.1 玩家表 (ddz_players) 新增字段

```sql
ALTER TABLE ddz_players ADD COLUMN arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '竞技币余额' AFTER gold;
```

### 2.2 房间配置表 (ddz_room_config) 新增字段

```sql
ALTER TABLE ddz_room_config ADD COLUMN min_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '最低入场竞技币(竞技场房间使用)' AFTER min_gold;
ALTER TABLE ddz_room_config ADD COLUMN max_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '最高入场竞技币(竞技场房间使用,0表示无限制)' AFTER max_gold;
```

### 2.3 游戏记录表 (ddz_game_records) 新增字段

```sql
ALTER TABLE ddz_game_records ADD COLUMN room_category TINYINT NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场' AFTER room_type;
ALTER TABLE ddz_game_records ADD COLUMN landlord_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币' AFTER landlord_win_gold;
ALTER TABLE ddz_game_records ADD COLUMN farmer1_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币' AFTER farmer1_win_gold;
ALTER TABLE ddz_game_records ADD COLUMN farmer2_win_arena_coin BIGINT NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币' AFTER farmer2_win_gold;
```

### 2.4 新建竞技币流水表 (ddz_arena_coin_logs)

```sql
CREATE TABLE IF NOT EXISTS ddz_arena_coin_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    player_id BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
    change_amount BIGINT NOT NULL COMMENT '变化金额(正数为获得,负数为消耗)',
    balance_after BIGINT NOT NULL COMMENT '变化后余额',
    change_type TINYINT NOT NULL COMMENT '变化类型:1-游戏结算,2-系统赠送,3-兑换,4-其他',
    related_id VARCHAR(64) DEFAULT '' COMMENT '关联ID(游戏ID等)',
    remark VARCHAR(256) DEFAULT '' COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_player_id (player_id),
    INDEX idx_created_at (created_at),
    INDEX idx_change_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞技币流水记录表';
```

## 3. 后端代码修改

### 3.1 Admin 后台 (gin-vue-admin)

#### 3.1.1 模型修改

**文件**: `admin/server/model/ddz/player.go`

```go
type DDZPlayer struct {
    // ... 其他字段
    Gold          int64 `json:"gold"`       // 金币余额
    ArenaCoin     int64 `json:"arenaCoin"`  // 竞技币余额（新增）
    // ... 其他字段
}
```

**文件**: `admin/server/model/ddz/room_config.go`

```go
type DDZRoomConfig struct {
    // ... 其他字段
    MinGold      int64 `json:"minGold"`      // 最低入场金币
    MaxGold      int64 `json:"maxGold"`      // 最高入场金币
    MinArenaCoin int64 `json:"minArenaCoin"` // 最低入场竞技币（新增）
    MaxArenaCoin int64 `json:"maxArenaCoin"` // 最高入场竞技币（新增）
    // ... 其他字段
}
```

### 3.2 Server (游戏服务器)

#### 3.2.1 数据库模型

**文件**: `server/internal/game/database/models.go`

- Player 结构体添加 `ArenaCoin` 字段
- RoomConfig 结构体添加 `MinArenaCoin`、`MaxArenaCoin` 字段
- GameRecord 结构体添加 `RoomCategory` 和竞技币结算字段
- 新增 `ArenaCoinLog` 流水记录模型

#### 3.2.2 入场检查逻辑

```go
// CanEnterRoom 检查玩家是否可以进入指定房间
func (p *Player) CanEnterRoom(room *RoomConfig) (bool, string) {
    if p.Status != PlayerStatusNormal {
        return false, "玩家状态异常"
    }

    // 根据房间分类检查不同币种
    if room.RoomCategory == RoomCategoryArena {
        // 竞技场房间，检查竞技币
        if p.ArenaCoin < room.MinArenaCoin {
            return false, "竞技币不足"
        }
        if room.MaxArenaCoin > 0 && p.ArenaCoin > room.MaxArenaCoin {
            return false, "竞技币超过上限"
        }
    } else {
        // 普通场房间，检查金币
        if p.Gold < room.MinGold {
            return false, "金币不足"
        }
        if room.MaxGold > 0 && p.Gold > room.MaxGold {
            return false, "金币超过上限"
        }
    }
    return true, ""
}
```

#### 3.2.3 游戏结算逻辑

游戏结算时同时记录金币和竞技币变化：
- 普通场房间：只更新金币
- 竞技场房间：只更新竞技币

## 4. 客户端代码修改

### 4.1 玩家数据

**文件**: `client/assets/scripts/data/player.js`

```javascript
that.gobal_count = 0      // 金币
that.arena_coin = 0       // 竞技币（新增）
```

### 4.2 大厅显示

大厅界面需要：
1. 同时显示金币和竞技币余额
2. 房间列表根据房间分类显示不同入场门槛
3. 普通场显示"最低XXX金币"
4. 竞技场显示"最低XXX竞技币"

## 5. 房间分类常量

```go
const (
    RoomCategoryNormal uint8 = 1 // 普通场（使用金币）
    RoomCategoryArena  uint8 = 2 // 竞技场（使用竞技币）
)
```

## 6. 竞技币变化类型常量

```go
const (
    ArenaCoinChangeGame     uint8 = 1 // 游戏结算
    ArenaCoinChangeGift     uint8 = 2 // 系统赠送
    ArenaCoinChangeExchange uint8 = 3 // 兑换
    ArenaCoinChangeOther    uint8 = 4 // 其他
)
```

## 7. 迁移步骤

1. **执行数据库迁移**
   ```bash
   mysql -u root -p ddz_game < sql/migrations/add_arena_coin.sql
   ```

2. **重新编译服务器**
   ```bash
   cd server && go build -o bin/server ./cmd/server
   ```

3. **重新编译Admin后台**
   ```bash
   cd admin/server && go build -o bin/admin .
   ```

4. **更新客户端资源**
   - 添加竞技币图标
   - 更新房间列表UI

## 8. 测试要点

1. **入场检查测试**
   - 金币不足时无法进入普通场
   - 竞技币不足时无法进入竞技场
   - 金币充足可以进入普通场
   - 竞技币充足可以进入竞技场

2. **结算测试**
   - 普通场游戏结束后金币正确变化
   - 竞技场游戏结束后竞技币正确变化
   - 游戏记录正确保存

3. **流水记录测试**
   - 竞技币变化后流水记录正确生成
   - 流水记录余额与实际余额一致

## 9. 后续优化

1. **竞技币兑换功能**
   - 金币兑换竞技币
   - 竞技币兑换金币（如有需要）

2. **竞技币获取途径**
   - 首次登录赠送
   - 每日任务奖励
   - 活动奖励

3. **排行榜功能**
   - 竞技币排行榜
   - 竞技场胜率排行
