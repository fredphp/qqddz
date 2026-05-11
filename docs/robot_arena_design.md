# 竞技场机器人系统设计文档

## 一、概述

竞技场机器人系统负责在竞技场人数不足时自动补位，确保比赛能够正常进行。机器人使用与真人相同的游戏逻辑，但通过AI模块进行决策。

## 二、机器人数据来源

### 2.1 机器人玩家表
机器人数据存储在 `ddz_players` 表中：

```sql
-- 机器人标识
player_type = 2  -- 1=真人, 2=机器人

-- 机器人状态
robot_status = 0  -- 0=空闲, 1=竞技场中
robot_current_session_id  -- 当前所在的会话ID
robot_locked_at  -- 锁定时间
```

### 2.2 机器人AI配置表
机器人AI配置存储在 `ddz_robot_config` 表中：

| 字段 | 说明 | 默认值 |
|------|------|--------|
| min_think_time | 最小思考时间(毫秒) | 1500 |
| max_think_time | 最大思考时间(毫秒) | 3000 |
| bomb_think_time | 炸弹思考时间(毫秒) | 4000 |
| bomb_probability | 炸弹使用概率 | 0.60 |
| landlord_bid_probability | 抢地主概率 | 0.50 |
| let_win_probability | 决赛让牌概率 | 0.85 |

## 三、核心模块

### 3.1 RobotManager - 机器人管理器
**文件**: `server/internal/game/robot/manager.go`

**职责**:
- 选择可用机器人
- 锁定/释放机器人
- 管理运行时状态

**关键方法**:
```go
// 选择可用机器人
func (rm *RobotManager) SelectAvailableRobots(count int) ([]*database.Player, error)

// 锁定机器人
func (rm *RobotManager) LockRobot(robotID, sessionID uint64) error

// 释放机器人
func (rm *RobotManager) ReleaseRobot(robotID uint64) error
```

### 3.2 ArenaPatcher - 竞技场补位器
**文件**: `server/internal/game/robot/patcher.go`

**职责**:
- 检查是否需要补位（人数是否为3的倍数）
- 自动补位机器人
- 创建机器人参赛记录

**补位逻辑**:
```
当前人数 % 3 != 0 时需要补位
补位数量 = 3 - (当前人数 % 3)
例如：4人需要补2个，5人需要补1个
```

**关键方法**:
```go
// 检查并执行补位
func (ap *ArenaPatcher) CheckAndFillArena(sessionID uint64, currentPlayers int, minPlayers int) ([]*FilledRobot, error)
```

### 3.3 RobotAI - 机器人AI
**文件**: `server/internal/game/robot/ai.go`

**职责**:
- 叫地主决策
- 出牌决策
- 让牌策略

**AI策略**:
1. **叫地主决策**: 根据手牌质量评分决定是否叫地主
2. **出牌决策**: 
   - 地主策略：主动出击，优先出小牌
   - 农民策略：配合队友，压牌地主
3. **让牌策略**: 决赛阶段让真人玩家获胜

### 3.4 NoWinController - 阻止机器人夺冠
**文件**: `server/internal/game/robot/no_win.go`

**职责**:
- 决赛阶段检测
- 让牌决策
- 阻止机器人获得冠军

**阻止夺冠逻辑**:
```go
// 当机器人即将夺冠时
// 找到排名最靠前的真人玩家
// 调整排名：真人成为冠军，机器人降为亚军或更低
```

## 四、机器人生命周期

```
┌─────────────────────────────────────────────────────────────────┐
│                        机器人生命周期                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 空闲状态 (robot_status=0)                                   │
│     └── 等待被选中补位                                          │
│                                                                 │
│  2. 补位阶段                                                    │
│     ├── 检查报名人数是否为3的倍数                               │
│     ├── 选择可用机器人                                          │
│     ├── 更新 robot_status=1, robot_current_session_id           │
│     └── 创建 ddz_arena_participations 记录 (is_robot=1)         │
│                                                                 │
│  3. 比赛阶段                                                    │
│     ├── 参与每轮比赛                                            │
│     ├── 通过 RobotAI 进行决策                                   │
│     └── 更新比赛积分                                            │
│                                                                 │
│  4. 淘汰阶段                                                    │
│     ├── 更新 is_eliminated=1, rank                              │
│     └── 机器人不能获得冠军奖励                                  │
│                                                                 │
│  5. 释放阶段                                                    │
│     ├── 更新 robot_status=0                                     │
│     ├── 清空 robot_current_session_id                           │
│     └── 从内存中移除运行时状态                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 五、数据库表结构

### 5.1 ddz_players（玩家表）
机器人相关字段：
```sql
player_type tinyint        -- 玩家类型: 1=真人, 2=机器人
robot_status tinyint       -- 机器人状态: 0=空闲, 1=竞技场中
robot_current_session_id   -- 当前会话ID
robot_locked_at datetime   -- 锁定时间
```

### 5.2 ddz_arena_participations（参赛记录表）
```sql
session_id bigint          -- 会话ID
player_id bigint           -- 玩家ID
is_robot tinyint           -- 是否机器人: 0=否, 1=是
match_coin bigint          -- 比赛金币
is_eliminated tinyint      -- 是否淘汰
rank int                   -- 最终排名
```

### 5.3 ddz_robot_config（机器人配置表）
```sql
id bigint                  -- 配置ID
config_name varchar(64)    -- 配置名称
min_think_time int         -- 最小思考时间
max_think_time int         -- 最大思考时间
bomb_think_time int        -- 炸弹思考时间
bomb_probability decimal   -- 炸弹概率
let_win_probability decimal -- 让牌概率
is_default tinyint         -- 是否默认配置
```

## 六、不创建的表

根据设计，以下表**不需要创建**：

1. **ddz_arena_robot_records** - 机器人运行记录不需要单独存储
   - 运行时状态在内存中管理
   - 参赛记录通过 ddz_arena_participations 表查询

2. **ddz_arena_robot_config** - 机器人配置已存在于 ddz_robot_config

## 七、关键流程图

### 7.1 竞技场补位流程
```
开始比赛
    │
    ▼
获取报名人数
    │
    ▼
人数 % 3 != 0 ?
    │
    ├── 否 → 正常分桌开始比赛
    │
    └── 是 → 计算补位数量
              │
              ▼
         选择可用机器人
              │
              ▼
         锁定机器人
              │
              ▼
         创建参赛记录
              │
              ▼
         更新会话人数
              │
              ▼
         分桌开始比赛
```

### 7.2 机器人出牌流程
```
轮到机器人出牌
    │
    ▼
检查是否决赛阶段
    │
    ├── 是 → 检查是否需要让牌
    │         │
    │         ├── 是 → 执行让牌策略
    │         │
    │         └── 否 → 正常AI决策
    │
    └── 否 → 正常AI决策
              │
              ▼
         计算思考时间
              │
              ▼
         执行出牌
```

## 八、配置说明

### 8.1 补位配置
```go
type PatcherConfig struct {
    EnableAutoFill      bool   // 是否启用自动补位
    FillDelaySeconds    int    // 补位延迟时间（秒）
    MaxFillCount        int    // 最大补位数量
    FillStrategy        string // 补位策略: random, balanced, weak_first
}
```

### 8.2 让牌配置
```go
type NoWinConfig struct {
    EnableNoWin       bool   // 是否启用不能夺冠逻辑
    StartFromRound    int    // 开始让牌的轮次
    LetWinProbability int    // 让牌概率（0-100）
    ForceLetWin       bool   // 是否强制让牌
    MaxRank           int    // 机器人最大可获得排名
}
```

## 九、注意事项

1. **机器人不能获得冠军奖励**
   - 当机器人排名第一时，通过 NoWinController 调整排名
   - 冠军奖励顺延给排名最靠前的真人玩家

2. **机器人逻辑与真人一致**
   - 使用相同的游戏流程
   - 通过 RobotAI 进行决策
   - 参赛记录存储在同一张表

3. **运行时状态管理**
   - 机器人状态存储在内存中
   - 不需要额外的数据库表
   - 服务重启后通过数据库恢复状态
