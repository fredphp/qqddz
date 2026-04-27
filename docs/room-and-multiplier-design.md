# 斗地主 Redis 房间存储与倍率玩法设计

## 目录
1. [Redis 房间存储设计](#1-redis-房间存储设计)
2. [房间管理逻辑](#2-房间管理逻辑)
3. [斗地主倍率玩法设计](#3-斗地主倍率玩法设计)
4. [结算计算公式](#4-结算计算公式)

---

## 1. Redis 房间存储设计

### 1.1 数据结构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     Redis 数据结构                          │
├─────────────────────────────────────────────────────────────┤
│  room:{code}          → Hash    (房间详情)                  │
│  room:list            → Sorted Set (房间列表，按创建时间)    │
│  room:player:{pid}    → String  (玩家所在房间映射)          │
│  player:session:{pid} → Hash    (玩家会话信息)              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 房间详情存储（Hash）

**Key 设计**: `room:{roomCode}`

```
room:123456
```

**Hash 字段设计**:

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `code` | String | 房间号 | `"123456"` |
| `state` | Integer | 房间状态 | `0`=等待, `1`=叫地主, `2`=游戏中, `3`=已结束 |
| `room_type` | Integer | 房间类型 | `1`=初级, `2`=中级, `3`=高级, `4`=至尊 |
| `base_score` | Integer | 底分 | `1`, `2`, `3`, `5` |
| `creator_id` | String | 创建者ID | `"player_001"` |
| `created_at` | Long | 创建时间戳 | `1703001234567` |
| `player_count` | Integer | 当前人数 | `2` |
| `player_order` | String(JSON) | 玩家顺序 | `["p1","p2","p3"]` |
| `players` | String(JSON) | 玩家详情 | 见下表 |

**Players JSON 结构**:

```json
[
  {
    "id": "player_001",
    "name": "张三",
    "seat": 0,
    "ready": true,
    "is_landlord": false,
    "is_offline": false
  },
  {
    "id": "player_002",
    "name": "李四",
    "seat": 1,
    "ready": false,
    "is_landlord": false,
    "is_offline": false
  }
]
```

**TTL 过期策略**:
- 空房间：5分钟自动删除
- 游戏中房间：2小时自动删除（防止异常中断）
- 已结束房间：10分钟后删除

### 1.3 房间列表（Sorted Set）

**Key 设计**: `room:list:{roomType}`

```
room:list:1    # 初级房间列表
room:list:2    # 中级房间列表
room:list:3    # 高级房间列表
room:list:4    # 至尊房间列表
```

**Score**: 房间创建时间戳（毫秒）

**Member**: 房间号

**示例**:
```
ZADD room:list:1 1703001234567 "123456"
ZADD room:list:1 1703001245678 "234567"
```

**查询可加入房间**:
```redis
# 获取所有等待中的房间（按创建时间升序）
ZRANGE room:list:1 0 -1

# 获取最近的10个房间
ZREVRANGE room:list:1 0 9
```

### 1.4 玩家-房间映射（String）

**Key 设计**: `room:player:{playerId}`

**Value**: 房间号

**示例**:
```
SET room:player:player_001 "123456"
EXPIRE room:player:player_001 7200
```

**用途**: 快速查找玩家所在房间，支持断线重连

### 1.5 玩家会话信息（Hash）

**Key 设计**: `player:session:{playerId}`

```
player:session:player_001
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `player_id` | String | 玩家ID |
| `player_name` | String | 玩家昵称 |
| `room_code` | String | 所在房间号 |
| `reconnect_token` | String | 重连令牌 |
| `is_online` | Integer | 是否在线 0/1 |
| `disconnected_at` | Long | 断线时间戳 |

---

## 2. 房间管理逻辑

### 2.1 创建房间流程

```
┌─────────────────────────────────────────────────────────────┐
│                     创建房间流程                            │
├─────────────────────────────────────────────────────────────┤
│  1. 检查玩家是否已在房间中 → 若是则先离开                    │
│  2. 生成唯一房间号（6位数字）                                │
│  3. 创建房间对象，设置初始状态                               │
│  4. 将创建者加入房间                                        │
│  5. 保存到 Redis Hash                                       │
│  6. 添加到房间列表 Sorted Set                               │
│  7. 设置玩家-房间映射                                       │
│  8. 返回房间信息                                            │
└─────────────────────────────────────────────────────────────┘
```

**伪代码**:

```go
func CreateRoom(client Client, roomType int) (*Room, error) {
    // 1. 检查是否已在房间
    if client.GetRoom() != "" {
        LeaveRoom(client)
    }
    
    // 2. 生成房间号
    code := generateRoomCode()
    
    // 3. 根据房间类型获取底分
    baseScore := getBaseScore(roomType)
    
    // 4. 创建房间
    room := &Room{
        Code:      code,
        State:     RoomStateWaiting,
        RoomType:  roomType,
        BaseScore: baseScore,
        CreatorID: client.GetID(),
        CreatedAt: time.Now().UnixMilli(),
        Players:   make(map[string]*RoomPlayer),
    }
    
    // 5. 添加创建者
    room.AddPlayer(client, 0)
    
    // 6. 保存到 Redis
    ctx := context.Background()
    
    // 保存房间详情
    redis.HSet(ctx, "room:" + code, room.ToMap())
    redis.Expire(ctx, "room:" + code, 5 * time.Minute) // 空房间5分钟过期
    
    // 添加到房间列表
    redis.ZAdd(ctx, "room:list:" + roomType, &redis.Z{
        Score:  float64(room.CreatedAt),
        Member: code,
    })
    
    // 设置玩家-房间映射
    redis.Set(ctx, "room:player:" + client.GetID(), code, 2 * time.Hour)
    
    return room, nil
}
```

### 2.2 玩家加入房间流程

```
┌─────────────────────────────────────────────────────────────┐
│                     加入房间流程                            │
├─────────────────────────────────────────────────────────────┤
│  1. 检查玩家是否已在房间 → 若是则先离开                      │
│  2. 从 Redis 获取房间信息                                   │
│  3. 验证房间状态（等待中、未满员）                           │
│  4. 分配座位号                                              │
│  5. 添加玩家到房间                                          │
│  6. 更新 Redis 房间详情                                     │
│  7. 设置玩家-房间映射                                       │
│  8. 广播玩家加入消息                                        │
└─────────────────────────────────────────────────────────────┘
```

**伪代码**:

```go
func JoinRoom(client Client, code string) (*Room, error) {
    ctx := context.Background()
    
    // 1. 检查是否已在房间
    if client.GetRoom() != "" {
        LeaveRoom(client)
    }
    
    // 2. 从 Redis 获取房间
    roomData, err := redis.HGetAll(ctx, "room:" + code).Result()
    if err != nil || len(roomData) == 0 {
        return nil, ErrRoomNotFound
    }
    
    // 3. 验证房间状态
    state := roomData["state"]
    if state != "0" { // RoomStateWaiting
        return nil, ErrGameStarted
    }
    
    playerCount := roomData["player_count"]
    if playerCount >= 3 {
        return nil, ErrRoomFull
    }
    
    // 4. 分配座位并加入
    seat := playerCount
    room.AddPlayer(client, seat)
    
    // 5. 更新 Redis
    redis.HSet(ctx, "room:" + code, "player_count", playerCount + 1)
    redis.HSet(ctx, "room:" + code, "players", room.GetPlayersJSON())
    
    // 刷新过期时间
    redis.Expire(ctx, "room:" + code, 2 * time.Hour)
    
    // 6. 设置玩家映射
    redis.Set(ctx, "room:player:" + client.GetID(), code, 2 * time.Hour)
    
    return room, nil
}
```

### 2.3 玩家离开房间流程

```
┌─────────────────────────────────────────────────────────────┐
│                     离开房间流程                            │
├─────────────────────────────────────────────────────────────┤
│  1. 获取玩家所在房间                                        │
│  2. 从房间移除玩家                                          │
│  3. 广播玩家离开消息                                        │
│  4. 判断房间是否为空：                                      │
│     ├─ 空房间 → 删除房间及 Redis 相关数据                   │
│     └─ 非空 → 更新 Redis 房间信息                          │
│  5. 删除玩家-房间映射                                       │
└─────────────────────────────────────────────────────────────┘
```

**伪代码**:

```go
func LeaveRoom(client Client) {
    ctx := context.Background()
    playerID := client.GetID()
    
    // 1. 获取房间号
    code, err := redis.Get(ctx, "room:player:" + playerID).Result()
    if err != nil {
        return
    }
    
    // 2. 从房间移除玩家
    room := rooms[code]
    room.RemovePlayer(playerID)
    
    // 3. 广播离开消息
    room.Broadcast(MsgPlayerLeft, PlayerLeftPayload{
        PlayerID: playerID,
    })
    
    // 4. 判断是否为空房间
    if len(room.Players) == 0 {
        // 删除房间
        delete(rooms, code)
        redis.Del(ctx, "room:" + code)
        redis.ZRem(ctx, "room:list:" + room.RoomType, code)
    } else {
        // 更新房间信息
        redis.HSet(ctx, "room:" + code, "player_count", len(room.Players))
        redis.HSet(ctx, "room:" + code, "players", room.GetPlayersJSON())
        
        // 如果人数为1，重置为空房间过期时间
        if len(room.Players) == 1 {
            redis.Expire(ctx, "room:" + code, 5 * time.Minute)
        }
    }
    
    // 5. 删除玩家映射
    redis.Del(ctx, "room:player:" + playerID)
    client.SetRoom("")
}
```

### 2.4 获取可加入房间列表

**筛选条件**:
- 房间状态为等待中（state = 0）
- 人数少于3且大于0（0 < player_count < 3）

**伪代码**:

```go
func GetAvailableRoomList(roomType int) []RoomListItem {
    ctx := context.Background()
    
    // 获取该类型的所有房间号
    codes, _ := redis.ZRange(ctx, "room:list:" + roomType, 0, -1).Result()
    
    var result []RoomListItem
    for _, code := range codes {
        // 获取房间详情
        roomData, _ := redis.HGetAll(ctx, "room:" + code).Result()
        if len(roomData) == 0 {
            continue
        }
        
        state := roomData["state"]
        playerCount := roomData["player_count"]
        
        // 筛选条件：等待中，且 0 < 人数 < 3
        if state == "0" && playerCount > 0 && playerCount < 3 {
            result = append(result, RoomListItem{
                RoomCode:    code,
                PlayerCount: playerCount,
                MaxPlayers:  3,
                BaseScore:   roomData["base_score"],
                CreatedAt:   roomData["created_at"],
            })
        }
    }
    
    return result
}
```

### 2.5 房间状态变更同步

```
┌─────────────────────────────────────────────────────────────┐
│                  状态变更处理流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  等待中 ──→ 叫地主阶段 ──→ 游戏中 ──→ 已结束               │
│    │           │             │            │                 │
│    ▼           ▼             ▼            ▼                 │
│  TTL 5分钟   TTL 2小时    TTL 2小时    TTL 10分钟           │
│                                                             │
│  状态变更时执行：                                           │
│  1. 更新 Redis Hash 中的 state 字段                         │
│  2. 更新 TTL 过期时间                                       │
│  3. 若进入游戏，从房间列表移除                              │
│  4. 若游戏结束，更新玩家金币                                │
└─────────────────────────────────────────────────────────────┘
```

**伪代码**:

```go
func UpdateRoomState(room *Room, newState RoomState) {
    ctx := context.Background()
    room.State = newState
    
    // 更新 Redis
    redis.HSet(ctx, "room:" + room.Code, "state", int(newState))
    
    switch newState {
    case RoomStateWaiting:
        redis.Expire(ctx, "room:" + room.Code, 5 * time.Minute)
        // 加入可加入列表
        redis.ZAdd(ctx, "room:list:" + room.RoomType, &redis.Z{
            Score:  float64(room.CreatedAt),
            Member: room.Code,
        })
        
    case RoomStateBidding, RoomStatePlaying:
        redis.Expire(ctx, "room:" + room.Code, 2 * time.Hour)
        // 从可加入列表移除
        redis.ZRem(ctx, "room:list:" + room.RoomType, room.Code)
        
    case RoomStateEnded:
        redis.Expire(ctx, "room:" + room.Code, 10 * time.Minute)
        // 从列表移除
        redis.ZRem(ctx, "room:list:" + room.RoomType, room.Code)
    }
}
```

---

## 3. 斗地主倍率玩法设计

### 3.1 倍率组成结构

```
┌─────────────────────────────────────────────────────────────┐
│                     倍率计算公式                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  总倍数 = 底分 × 叫地主倍数 × 炸弹倍数 × 春天倍数           │
│                                                             │
│  示例：                                                     │
│  底分(2) × 叫地主(3分=3倍) × 炸弹(2个=4倍) × 春天(2倍)     │
│  = 2 × 3 × 4 × 2 = 48 倍                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 底分配置

| 房间类型 | 房间等级 | 底分 | 入场金币要求 |
|---------|---------|------|-------------|
| 初级房 | 1 | 1分 | ≥ 100 金币 |
| 中级房 | 2 | 2分 | ≥ 500 金币 |
| 高级房 | 3 | 3分 | ≥ 2000 金币 |
| 至尊房 | 4 | 5分 | ≥ 10000 金币 |

### 3.3 叫地主倍数

**叫地主规则**:
- 玩家可以选择叫 1分、2分、3分 或者不叫
- 叫分最高的玩家成为地主
- 如果都不叫，流局重新发牌

| 叫分 | 倍数 |
|-----|------|
| 不叫 | 0（流局） |
| 1分 | 1倍 |
| 2分 | 2倍 |
| 3分 | 3倍 |

**叫地主流程**:

```
┌─────────────────────────────────────────────────────────────┐
│                     叫地主流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  开始                                                       │
│    │                                                        │
│    ▼                                                        │
│  随机选择第一个叫分玩家                                     │
│    │                                                        │
│    ▼                                                        │
│  ┌─────────────────────┐                                    │
│  │ 当前玩家叫分        │                                    │
│  │ ├─ 不叫 → 跳过      │                                    │
│  │ └─ 叫分 → 记录最高  │                                    │
│  └─────────────────────┘                                    │
│    │                                                        │
│    ▼                                                        │
│  判断：是否有人叫3分？                                      │
│    ├─ 是 → 结束，叫3分者成为地主                           │
│    └─ 否 → 继续下一玩家                                    │
│    │                                                        │
│    ▼                                                        │
│  判断：一轮结束？                                           │
│    ├─ 有人叫分 → 最高叫分者成为地主                        │
│    └─ 都不叫 → 流局，重新发牌                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 炸弹倍数

**炸弹类型及倍数**:

| 类型 | 说明 | 倍数效果 |
|------|------|---------|
| 普通炸弹 | 四张相同点数的牌 | 当前倍数 × 2 |
| 王炸 | 大小王一对 | 当前倍数 × 2 |

**炸弹倍数计算规则**:
- 每打出一张炸弹，总倍数翻倍
- 炸弹翻倍累积计算

**示例**:
```
初始倍数：3（叫地主3分）
打出炸弹1：3 × 2 = 6
打出炸弹2：6 × 2 = 12
打出王炸：12 × 2 = 24

最终炸弹倍数：24
```

**炸弹记录伪代码**:

```go
type GameSession struct {
    // ... 其他字段
    bombCount     int  // 炸弹数量
    multiplier    int  // 当前倍数
}

func (gs *GameSession) recordBomb(isRocket bool) {
    gs.bombCount++
    gs.multiplier *= 2
    
    // 广播倍数变化
    gs.room.Broadcast(MsgMultiplierChanged, MultiplierChangedPayload{
        Reason:      "bomb",
        BombCount:   gs.bombCount,
        Multiplier:  gs.multiplier,
        IsRocket:    isRocket,
    })
}
```

### 3.5 春天倍数

**春天定义**:

| 类型 | 条件 | 倍数效果 |
|------|------|---------|
| 春天（地主春天） | 地主获胜，且两个农民一张牌都没出 | 总倍数 × 2 |
| 反春天 | 农民获胜，且地主只出了底牌后的20张牌 | 总倍数 × 2 |

**春天检测逻辑**:

```go
type SpringType int

const (
    SpringNone SpringType = iota
    SpringLandlord    // 地主春天
    SpringAnti        // 反春天
)

func (gs *GameSession) checkSpring(winner *GamePlayer) SpringType {
    if winner.IsLandlord {
        // 地主获胜，检查是否春天
        // 农民手牌必须完整（17张）
        for _, p := range gs.players {
            if !p.IsLandlord && len(p.Hand) == 17 {
                continue
            }
            if !p.IsLandlord {
                return SpringNone // 农民出过牌
            }
        }
        return SpringLandlord
    } else {
        // 农民获胜，检查是否反春天
        for _, p := range gs.players {
            if p.IsLandlord && len(p.Hand) == 17 {
                return SpringAnti // 地主只拿了底牌后未出
            }
        }
        return SpringNone
    }
}
```

---

## 4. 结算计算公式

### 4.1 金币结算公式

**基本公式**:

```
单局输赢金币 = 底分 × 总倍数

总倍数 = 叫地主倍数 × 2^炸弹数 × 春天倍数
```

**结算规则**:

| 获胜方 | 地主输赢 | 每个农民输赢 |
|--------|---------|-------------|
| 地主赢 | +2 × 底分 × 倍数 | -1 × 底分 × 倍数 |
| 农民赢 | -2 × 底分 × 倍数 | +1 × 底分 × 倍数 |

### 4.2 详细计算示例

**示例1：地主获胜（无炸弹、无春天）**
```
房间类型：中级房（底分 2）
叫地主：3分（倍数 3）
炸弹数量：0
春天：无

总倍数 = 3 × 2^0 × 1 = 3
地主获得 = 2 × 2 × 3 = 12 金币
每个农民支付 = 2 × 3 = 6 金币
```

**示例2：地主获胜（有炸弹、春天）**
```
房间类型：高级房（底分 3）
叫地主：3分（倍数 3）
炸弹数量：2（一个普通炸弹 + 一个王炸）
春天：是

总倍数 = 3 × 2^2 × 2 = 24
地主获得 = 2 × 3 × 24 = 144 金币
每个农民支付 = 3 × 24 = 72 金币
```

**示例3：农民获胜（有炸弹、反春天）**
```
房间类型：至尊房（底分 5）
叫地主：2分（倍数 2）
炸弹数量：1
春天：反春天

总倍数 = 2 × 2^1 × 2 = 8
地主支付 = 2 × 5 × 8 = 80 金币（每个农民获得 40）
每个农民获得 = 5 × 8 = 40 金币
```

### 4.3 结算代码实现

```go
// Settlement 结算结构
type Settlement struct {
    RoomType       int      `json:"room_type"`       // 房间类型
    BaseScore      int      `json:"base_score"`      // 底分
    BidScore       int      `json:"bid_score"`       // 叫地主分数
    BombCount      int      `json:"bomb_count"`      // 炸弹数量
    SpringType     int      `json:"spring_type"`     // 春天类型
    TotalMultiplier int     `json:"total_multiplier"` // 总倍数
    
    LandlordID     string   `json:"landlord_id"`
    LandlordWin    int64    `json:"landlord_win"`    // 地主输赢金币
    
    FarmerIDs      []string `json:"farmer_ids"`
    FarmerWins     []int64  `json:"farmer_wins"`     // 农民输赢金币
}

// CalculateSettlement 计算结算
func CalculateSettlement(
    roomType int,
    bidScore int,
    bombCount int,
    springType SpringType,
    landlordWinsGame bool,
) *Settlement {
    // 1. 获取底分
    baseScore := getBaseScore(roomType)
    
    // 2. 计算总倍数
    // 叫地主倍数
    bidMultiplier := bidScore
    
    // 炸弹倍数 = 2^bombCount
    bombMultiplier := 1 << bombCount // 2 的 bombCount 次方
    
    // 春天倍数
    springMultiplier := 1
    if springType == SpringLandlord || springType == SpringAnti {
        springMultiplier = 2
    }
    
    // 总倍数
    totalMultiplier := bidMultiplier * bombMultiplier * springMultiplier
    
    // 3. 计算金币
    baseGold := int64(baseScore * totalMultiplier)
    
    var landlordWin int64
    var farmerWins []int64
    
    if landlordWinsGame {
        // 地主获胜
        landlordWin = baseGold * 2  // 从两个农民各获得 baseGold
        farmerWins = []int64{-baseGold, -baseGold}  // 每个农民输 baseGold
    } else {
        // 农民获胜
        landlordWin = -baseGold * 2  // 地主输给两个农民
        farmerWins = []int64{baseGold, baseGold}  // 每个农民获得 baseGold
    }
    
    return &Settlement{
        RoomType:        roomType,
        BaseScore:       baseScore,
        BidScore:        bidScore,
        BombCount:       bombCount,
        SpringType:      int(springType),
        TotalMultiplier: totalMultiplier,
        LandlordWin:     landlordWin,
        FarmerWins:      farmerWins,
    }
}

// 根据房间类型获取底分
func getBaseScore(roomType int) int {
    switch roomType {
    case 1:
        return 1 // 初级房
    case 2:
        return 2 // 中级房
    case 3:
        return 3 // 高级房
    case 4:
        return 5 // 至尊房
    default:
        return 1
    }
}
```

### 4.4 防负金币保护

**保护机制**:
- 玩家金币不足以支付输掉的金额时，按实际拥有金币结算
- 胜者按输者实际支付的金币获得（不会获得超过输者拥有的金币）

```go
// ApplySettlement 应用结算（带保护）
func ApplySettlement(
    landlord *Player,
    farmers []*Player,
    settlement *Settlement,
) map[string]int64 {
    results := make(map[string]int64)
    
    if settlement.LandlordWin > 0 {
        // 地主赢
        actualLandlordWin := int64(0)
        for _, farmer := range farmers {
            // 农民实际支付的金额（不超过其拥有）
            farmerLoss := settlement.FarmerWins[0] // 负数
            if farmer.Gold + farmerLoss < 0 {
                farmerLoss = -farmer.Gold
            }
            farmer.Gold += farmerLoss
            actualLandlordWin -= farmerLoss // 减负数等于加正数
            results[farmer.ID] = farmerLoss
        }
        landlord.Gold += actualLandlordWin
        results[landlord.ID] = actualLandlordWin
    } else {
        // 农民赢
        actualLandlordLoss := settlement.LandlordWin // 负数
        if landlord.Gold + actualLandlordLoss < 0 {
            actualLandlordLoss = -landlord.Gold
        }
        landlord.Gold += actualLandlordLoss
        
        // 两个农民平分地主输的金币
        farmerWin := -actualLandlordLoss / 2
        for i, farmer := range farmers {
            farmer.Gold += farmerWin
            results[farmer.ID] = farmerWin
        }
        results[landlord.ID] = actualLandlordLoss
    }
    
    return results
}
```

### 4.5 结算结果广播

**协议定义**:

```go
type GameOverPayload struct {
    WinnerID       string          `json:"winner_id"`
    WinnerName     string          `json:"winner_name"`
    IsLandlord     bool            `json:"is_landlord"`
    
    // 结算信息
    BaseScore      int             `json:"base_score"`
    BidScore       int             `json:"bid_score"`
    BombCount      int             `json:"bomb_count"`
    SpringType     int             `json:"spring_type"`
    TotalMultiplier int            `json:"total_multiplier"`
    
    // 玩家金币变化
    GoldChanges    []PlayerGold    `json:"gold_changes"`
    
    // 剩余手牌
    PlayerHands    []PlayerHand    `json:"player_hands"`
}

type PlayerGold struct {
    PlayerID   string `json:"player_id"`
    PlayerName string `json:"player_name"`
    GoldBefore int64  `json:"gold_before"`
    GoldChange int64  `json:"gold_change"`
    GoldAfter  int64  `json:"gold_after"`
}
```

---

## 5. 附录

### 5.1 Redis Key 汇总

| Key Pattern | 类型 | 说明 | TTL |
|-------------|------|------|-----|
| `room:{code}` | Hash | 房间详情 | 5分钟~2小时 |
| `room:list:{type}` | Sorted Set | 房间列表 | 永久 |
| `room:player:{pid}` | String | 玩家房间映射 | 2小时 |
| `player:session:{pid}` | Hash | 玩家会话 | 2小时 |
| `match:queue` | List | 匹配队列 | - |

### 5.2 房间状态枚举

```go
const (
    RoomStateWaiting   RoomState = 0 // 等待中
    RoomStateBidding   RoomState = 1 // 叫地主
    RoomStatePlaying   RoomState = 2 // 游戏中
    RoomStateEnded     RoomState = 3 // 已结束
)
```

### 5.3 春天类型枚举

```go
const (
    SpringNone     SpringType = 0 // 无春天
    SpringLandlord SpringType = 1 // 地主春天
    SpringAnti     SpringType = 2 // 反春天
)
```

### 5.4 数据流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         完整游戏流程                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  创建房间 ──→ 加入玩家 ──→ 全部准备 ──→ 发牌                        │
│      │            │            │            │                       │
│      ▼            ▼            ▼            ▼                       │
│   Redis Hash   Redis Hash   状态变更    发送手牌                    │
│   设置 TTL     更新人数     移除列表                                │
│                                                                     │
│  发牌 ──→ 叫地主 ──→ 抢地主 ──→ 出牌阶段                            │
│    │         │          │           │                               │
│    ▼         ▼          ▼           ▼                               │
│  分发17张  记录叫分   地主确定   炸弹翻倍                            │
│  底牌3张   倍数确定   获得底牌   轮流出牌                            │
│                                                                     │
│  出牌阶段 ──→ 有人出完 ──→ 结算                                     │
│       │             │            │                                  │
│       ▼             ▼            ▼                                  │
│    炸弹检测     检测春天    计算金币                                 │
│    倍数更新     胜负判定    更新数据库                               │
│                              广播结果                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
