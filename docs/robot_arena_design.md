# 高级智能机器人竞技系统设计方案

## 一、系统概述

### 1.1 需求总结

| 需求项 | 描述 |
|--------|------|
| 自动补位 | 报名人数不是3的倍数时，自动补机器人凑齐 |
| 机器人来源 | 数据库ddz_players表，player_type=2的真实机器人账号 |
| 唯一占用 | 机器人不能同时出现在多个竞技场 |
| 生命周期 | 机器人必须持续参与直到被淘汰 |
| 不能夺冠 | 机器人不能获得最终冠军奖励 |
| 智能AI | 具备斗地主思考能力，像真人一样出牌 |
| 随机思考 | 出牌时间随机，不秒出牌 |
| 后台管理 | 可查看机器人状态 |

### 1.2 现有系统分析

```
现有功能：
├── 竞技场系统 ✅ 完整（报名、开赛、分桌、淘汰、奖励）
├── 匹配系统 ✅ 完整（队列、补位、自动准备）
├── AI出牌逻辑 ✅ 完整（FindSmallestBeatingCards）
├── 托管系统 ✅ 框架存在（IsTrustee字段）
└── 超时处理 ✅ 有框架（需连接AI）

需要新增：
├── 机器人运行时管理
├── 机器人唯一占用机制
├── 竞技场自动补位
├── 高级AI策略
├── 机器人不能夺冠逻辑
└── 后台管理功能
```

---

## 二、系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           高级智能机器人竞技系统                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ 竞技场管理器 │◄──►│ 机器人管理器 │◄──►│  机器人AI   │                  │
│  │ ArenaManager│    │RobotManager │    │  RobotAI    │                  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                  │
│         │                  │                  │                          │
│         │    ┌─────────────┴─────────────┐    │                          │
│         │    │                           │    │                          │
│         ▼    ▼                           ▼    ▼                          │
│  ┌─────────────────┐              ┌─────────────────┐                   │
│  │   运行时状态     │              │   数据库存储     │                   │
│  │  RobotRuntime   │              │ ddz_robot_arena │                   │
│  └─────────────────┘              └─────────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 模块职责

| 模块 | 职责 |
|------|------|
| RobotManager | 机器人生命周期管理、占用状态、选择分配 |
| RobotAI | 高级AI决策：出牌、抢地主、配合、记牌 |
| RobotRuntime | 内存运行时状态：当前竞技场、轮次、积分 |
| ArenaPatcher | 竞技场补位：检测人数、计算补位数量、分配机器人 |

---

## 三、数据库设计

### 3.1 新增表：ddz_robot_arena（机器人竞技运行时）

```sql
CREATE TABLE `ddz_robot_arena` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `robot_id` BIGINT UNSIGNED NOT NULL COMMENT '机器人玩家ID',
    `robot_player_id` VARCHAR(64) NOT NULL COMMENT '机器人PlayerID',
    `session_id` BIGINT UNSIGNED NOT NULL COMMENT '竞技场会话ID',
    `period_id` BIGINT UNSIGNED NOT NULL COMMENT '期号ID',
    `room_config_id` BIGINT UNSIGNED NOT NULL COMMENT '房间配置ID',
    
    -- 状态字段
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-参赛中,2-已淘汰,3-已夺冠(不允许)',
    `current_round` INT NOT NULL DEFAULT 1 COMMENT '当前轮次',
    `current_table_id` BIGINT UNSIGNED COMMENT '当前比赛桌ID',
    
    -- 比赛数据
    `tournament_coins` BIGINT NOT NULL DEFAULT 0 COMMENT '比赛金币',
    `win_count` INT NOT NULL DEFAULT 0 COMMENT '胜场数',
    `lose_count` INT NOT NULL DEFAULT 0 COMMENT '负场数',
    `landlord_count` INT NOT NULL DEFAULT 0 COMMENT '当地主次数',
    
    -- AI策略
    `ai_level` TINYINT NOT NULL DEFAULT 2 COMMENT 'AI等级:1-简单,2-普通,3-困难',
    `play_style` TINYINT NOT NULL DEFAULT 1 COMMENT '出牌风格:1-保守,2-正常,3-激进',
    `score_adjustment` INT NOT NULL DEFAULT 0 COMMENT '分数调整值(-100~+100)',
    
    -- 时间字段
    `join_time` DATETIME NOT NULL COMMENT '加入时间',
    `eliminate_time` DATETIME COMMENT '淘汰时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY `uk_robot_session` (`robot_id`, `session_id`),
    INDEX `idx_session` (`session_id`),
    INDEX `idx_robot` (`robot_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机器人竞技运行时表';
```

### 3.2 新增字段：ddz_players表

```sql
-- 为机器人玩家添加运行时状态字段
ALTER TABLE `ddz_players` ADD COLUMN `robot_status` TINYINT NOT NULL DEFAULT 0 COMMENT '机器人状态:0-空闲,1-竞技场中,2-普通场中' AFTER `player_type`;
ALTER TABLE `ddz_players` ADD COLUMN `robot_session_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前竞技场会话ID' AFTER `robot_status`;
ALTER TABLE `ddz_players` ADD COLUMN `robot_room_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前房间ID' AFTER `robot_session_id`;
ALTER TABLE `ddz_players` ADD COLUMN `robot_locked_at` DATETIME DEFAULT NULL COMMENT '锁定时间' AFTER `robot_room_id`;

-- 添加索引
ALTER TABLE `ddz_players` ADD INDEX `idx_robot_status` (`player_type`, `robot_status`);
```

### 3.3 新增表：ddz_robot_ai_config（机器人AI配置）

```sql
CREATE TABLE `ddz_robot_ai_config` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `config_name` VARCHAR(64) NOT NULL COMMENT '配置名称',
    `ai_level` TINYINT NOT NULL COMMENT 'AI等级',
    
    -- 出牌策略参数
    `bomb_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.60 COMMENT '炸弹使用概率(0-1)',
    `landlord_bid_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.50 COMMENT '抢地主概率(0-1)',
    `pass_probability` DECIMAL(5,2) NOT NULL DEFAULT 0.30 COMMENT 'PASS概率(0-1)',
    
    -- 思考时间参数
    `min_think_time` INT NOT NULL DEFAULT 1500 COMMENT '最小思考时间(毫秒)',
    `max_think_time` INT NOT NULL DEFAULT 3000 COMMENT '最大思考时间(毫秒)',
    `bomb_think_time` INT NOT NULL DEFAULT 4000 COMMENT '炸弹思考时间(毫秒)',
    
    -- 分数控制
    `score_factor` DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '分数系数',
    `win_rate_target` DECIMAL(5,2) NOT NULL DEFAULT 0.45 COMMENT '目标胜率',
    
    `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认配置',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机器人AI配置表';
```

---

## 四、核心流程设计

### 4.1 竞技场补位流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       竞技场补位流程                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [开赛检查]                                                               │
│      │                                                                   │
│      ▼                                                                   │
│  报名人数 % 3 != 0 ?                                                      │
│      │                                                                   │
│      ├── 否 ──→ 正常开赛                                                  │
│      │                                                                   │
│      └── 是 ──→ 计算补位数量 = 3 - (报名人数 % 3)                          │
│                   │                                                      │
│                   ▼                                                      │
│              [查找可用机器人]                                              │
│                   │                                                      │
│                   ├─ 条件: player_type=2 AND robot_status=0              │
│                   │                                                      │
│                   ├─ 随机选择N个                                          │
│                   │                                                      │
│                   ▼                                                      │
│              [锁定机器人]                                                  │
│                   │                                                      │
│                   ├─ 更新: robot_status=1, robot_session_id=X            │
│                   │                                                      │
│                   ▼                                                      │
│              [创建参赛记录]                                                │
│                   │                                                      │
│                   ├─ ArenaParticipation (player_type=2)                  │
│                   │                                                      │
│                   ├─ RobotArena 运行时记录                                 │
│                   │                                                      │
│                   ▼                                                      │
│              [加入分桌]                                                    │
│                   │                                                      │
│                   └─→ 正常开赛                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 机器人生命周期

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       机器人生命周期                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [空闲状态]                                                               │
│      │                                                                   │
│      │ 被选中补位                                                        │
│      ▼                                                                   │
│  [锁定状态] ──→ 更新robot_status=1, robot_session_id=X                   │
│      │                                                                   │
│      │ 竞技场开赛                                                        │
│      ▼                                                                   │
│  [参赛状态]                                                               │
│      │                                                                   │
│      ├── 每轮比赛 ──→ 更新比赛金币、胜负场                                 │
│      │                                                                   │
│      │ 轮次结束                                                          │
│      ▼                                                                   │
│  [淘汰检查]                                                               │
│      │                                                                   │
│      ├── 未被淘汰 ──→ 继续参赛                                           │
│      │                                                                   │
│      ├── 被淘汰 ──→ [释放状态]                                           │
│      │                    │                                              │
│      │                    └─→ robot_status=0, robot_session_id=NULL      │
│      │                                                                   │
│      │ 进入决赛                                                          │
│      ▼                                                                   │
│  [决赛处理]                                                               │
│      │                                                                   │
│      ├── 机器人是冠军候选                                                 │
│      │       │                                                           │
│      │       ▼                                                           │
│      │   [AI故意输牌]                                                     │
│      │       │                                                           │
│      │       └─→ 降低出牌质量，让真人获胜                                  │
│      │                                                                   │
│      └── 最终结束 ──→ [释放状态]                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 机器人不能夺冠流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     机器人不能夺冠逻辑                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [决赛阶段检查]                                                           │
│      │                                                                   │
│      │ 剩余人数 <= 3                                                     │
│      ▼                                                                   │
│  检查当前排名                                                             │
│      │                                                                   │
│      ├── 机器人排名第1                                                   │
│      │       │                                                           │
│      │       ▼                                                           │
│      │   [启动"让牌"策略]                                                 │
│      │       │                                                           │
│      │       ├─ 降低抢地主概率 (0.1)                                      │
│      │       ├─ 增加PASS概率 (0.8)                                        │
│      │       ├─ 炸弹使用概率降低 (0.1)                                    │
│      │       └─ 出牌选择次优解而非最优解                                  │
│      │                                                                   │
│      ├── 机器人排名第2/3                                                 │
│      │       │                                                           │
│      │       └─→ 正常比赛                                                 │
│      │                                                                   │
│      └── 只剩机器人                                                      │
│              │                                                           │
│              └─→ 特殊处理：比赛取消或奖励作废                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 五、高级AI策略设计

### 5.1 AI决策架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         机器人AI决策系统                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      AI决策核心引擎                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │   │
│  │   │ 牌型分析 │   │ 记牌器   │   │ 对手建模 │   │ 策略选择 │    │   │
│  │   │ Analyzer │   │ Remember │   │ Opponent │   │ Strategy │    │   │
│  │   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘    │   │
│  │        │              │              │              │           │   │
│  │        └──────────────┴──────────────┴──────────────┘           │   │
│  │                              │                                   │   │
│  │                              ▼                                   │   │
│  │                     ┌───────────────┐                           │   │
│  │                     │   决策输出    │                           │   │
│  │                     │ DecisionMaker │                           │   │
│  │                     └───────────────┘                           │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      特殊场景处理                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • 决赛让牌策略                                                   │   │
│  │  • 农民配合策略                                                   │   │
│  │  • 地主压制策略                                                   │   │
│  │  • 记牌推断策略                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 出牌决策算法

```go
// RobotAIDecision 机器人AI决策结构
type RobotAIDecision struct {
    Action      Action      // 动作类型
    Cards       []card.Card // 出牌
    ThinkTime   int         // 思考时间(毫秒)
    Confidence  float64     // 决策信心度
    Reason      string      // 决策原因
}

// AI决策主流程
func (ai *RobotAI) MakeDecision(ctx *GameContext) *RobotAIDecision {
    // 1. 分析当前局势
    analysis := ai.analyzeSituation(ctx)
    
    // 2. 检查特殊策略
    if special := ai.checkSpecialStrategy(ctx, analysis); special != nil {
        return special
    }
    
    // 3. 根据角色选择策略
    switch ctx.Role {
    case RoleLandlord:
        return ai.landlordStrategy(ctx, analysis)
    case RoleFarmer:
        return ai.farmerStrategy(ctx, analysis)
    }
    
    // 4. 默认策略
    return ai.defaultStrategy(ctx, analysis)
}
```

### 5.3 地主AI策略

```
地主AI策略要点：
├── 记牌：记住大牌和王炸
├── 控制：控制出牌节奏
├── 压制：适时压制农民
├── 炸弹：关键时刻使用炸弹
└── 算牌：推算农民剩余牌型

具体策略：
1. 手牌<=5张时：
   - 计算能否一次出完
   - 优先出小牌保留控制牌
   
2. 农民只剩1-2张牌时：
   - 优先拆对子打单牌
   - 阻止农民跑牌
   
3. 炸弹使用时机：
   - 自己牌型好时：保留炸弹
   - 农民快跑时：果断炸
```

### 5.4 农民AI配合策略

```
农民AI配合策略要点：
├── 配合：与队友协同
├── 阻止：阻止地主跑牌
├── 放牌：给队友创造机会
└── 牺牲：关键时刻顶地主

具体策略：
1. 队友只剩1-2张牌时：
   - 打最小单牌放队友
   - 不抢队友的牌
   
2. 地主只剩1-2张牌时：
   - 用最大牌压地主
   - 必要时用炸弹阻止
   
3. 自己牌好时：
   - 正常打牌
   - 不影响队友放牌
```

### 5.5 记牌器设计

```go
// CardMemory 记牌器
type CardMemory struct {
    // 已出的牌
    PlayedCards map[card.Rank]int
    
    // 剩余推断
    RemainingCards map[card.Rank]int
    
    // 特殊牌追踪
    BigJokerPlayed  bool  // 大王是否已出
    SmallJokerPlayed bool  // 小王是否已出
    TwosRemaining    int   // 剩余2的数量
    
    // 炸弹追踪
    BombsRemaining   int   // 剩余炸弹数
    BombRanks        []card.Rank  // 炸弹点数
}

// 更新记牌器
func (m *CardMemory) Update(played []card.Card) {
    for _, c := range played {
        m.PlayedCards[c.Rank]++
        m.RemainingCards[c.Rank]--
        
        // 追踪特殊牌
        if c.Rank == card.RankBigJoker {
            m.BigJokerPlayed = true
        }
        if c.Rank == card.RankSmallJoker {
            m.SmallJokerPlayed = true
        }
        if c.Rank == card.RankTwo {
            m.TwosRemaining--
        }
        
        // 更新炸弹统计
        if m.RemainingCards[c.Rank] < 4 {
            m.updateBombStatus(c.Rank)
        }
    }
}
```

### 5.6 思考时间模拟

```go
// 计算思考时间
func (ai *RobotAI) calculateThinkTime(ctx *GameContext, decision *RobotAIDecision) int {
    baseTime := ai.config.MinThinkTime
    
    // 根据牌型复杂度调整
    complexity := ai.calculateComplexity(ctx, decision)
    additionalTime := complexity * 500
    
    // 炸弹额外思考
    if decision.Action == ActionBomb || decision.Action == ActionRocket {
        additionalTime += ai.config.BombThinkTime - ai.config.MinThinkTime
    }
    
    // 加上随机波动
    randomOffset := rand.Intn(1000) - 500
    
    total := baseTime + additionalTime + randomOffset
    
    // 限制在配置范围内
    if total < ai.config.MinThinkTime {
        total = ai.config.MinThinkTime
    }
    if total > ai.config.MaxThinkTime {
        total = ai.config.MaxThinkTime
    }
    
    return total
}
```

---

## 六、代码实现设计

### 6.1 新增文件清单

| 文件路径 | 说明 |
|----------|------|
| `server/internal/game/robot/manager.go` | 机器人管理器 |
| `server/internal/game/robot/ai.go` | 高级AI核心 |
| `server/internal/game/robot/memory.go` | 记牌器 |
| `server/internal/game/robot/strategy.go` | 策略模块 |
| `server/internal/game/robot/config.go` | 配置管理 |
| `server/internal/game/database/robot_models.go` | 数据模型 |

### 6.2 修改文件清单

| 文件路径 | 修改内容 |
|----------|----------|
| `server/internal/game/arena/manager.go` | 增加补位逻辑 |
| `server/internal/server/session/game.go` | 区分真人和机器人托管 |
| `server/internal/server/session/timer.go` | 机器人使用高级AI |
| `server/internal/game/database/models.go` | Player增加机器人状态字段 |

### 6.3 RobotManager 核心接口

```go
// RobotManager 机器人管理器
type RobotManager struct {
    db        *gorm.DB
    redis     *redis.Client
    busyRobots map[uint64]*RobotRuntime
    mu         sync.RWMutex
}

// SelectAvailableRobots 选择可用机器人
func (m *RobotManager) SelectAvailableRobots(count int, roomConfigID uint64) ([]*Player, error)

// LockRobot 锁定机器人
func (m *RobotManager) LockRobot(robotID, sessionID uint64) error

// ReleaseRobot 释放机器人
func (m *RobotManager) ReleaseRobot(robotID uint64) Error

// IsRobotBusy 检查机器人是否忙碌
func (m *RobotManager) IsRobotBusy(robotID uint64) bool

// GetRobotRuntime 获取运行时状态
func (m *RobotManager) GetRobotRuntime(robotID uint64) *RobotRuntime
```

---

## 七、后台管理设计

### 7.1 机器人状态API

```
GET /api/ddz/robot/list
请求参数：
- page: 页码
- pageSize: 每页数量
- status: 状态筛选(0-空闲,1-竞技场中)
- keyword: 关键词搜索

响应数据：
{
    "list": [
        {
            "id": 1,
            "username": "robot_abc123",
            "nickname": "快乐的小猫88",
            "status": 1,
            "statusText": "竞技场中",
            "currentSession": {
                "id": 100,
                "periodId": "240101001",
                "round": 3,
                "tournamentCoins": 1500,
                "isEliminated": false
            }
        }
    ],
    "total": 50
}
```

### 7.2 后台显示字段

| 显示字段 | 说明 |
|----------|------|
| 头像 | 机器人头像 |
| 用户名 | robot_xxx格式 |
| 昵称 | 随机昵称 |
| 状态 | 空闲/竞技场中/已淘汰 |
| 当前竞技场 | 会话ID、期号 |
| 当前轮次 | 第几轮 |
| 比赛积分 | 当前金币 |
| 是否淘汰 | 是/否 |
| 参赛统计 | 总场次、胜率、平均排名 |

---

## 八、实现优先级

### Phase 1: 基础框架 (优先)

1. 数据库表结构创建
2. Player表字段扩展
3. RobotManager基础框架
4. 竞技场补位逻辑

### Phase 2: AI增强

1. 高级AI决策系统
2. 记牌器实现
3. 思考时间模拟
4. 农民配合策略

### Phase 3: 特殊逻辑

1. 机器人不能夺冠逻辑
2. 决赛让牌策略
3. 生命周期管理
4. 异常处理

### Phase 4: 后台管理

1. 机器人列表接口
2. 状态显示页面
3. 统计分析功能

---

## 九、风险控制

### 9.1 不影响现有功能的保障

```
隔离原则：
├── 机器人管理器独立模块
├── AI逻辑独立模块
├── 竞技场补位为可选扩展
├── 通过配置开关控制
└── 单元测试覆盖

兼容性保障：
├── 不修改现有游戏核心逻辑
├── 不修改现有匹配逻辑
├── 不修改现有结算逻辑
├── 新增代码通过接口扩展
└── 旧代码路径保持不变
```

### 9.2 配置开关

```yaml
robot:
  enabled: true
  arena_fill_enabled: true
  advanced_ai_enabled: true
  let_win_enabled: true
  think_time_enabled: true
```

---

## 十、总结

本设计方案实现了一个完整的高级智能机器人竞技系统，具备以下特点：

1. **真实机器人账号**：使用数据库中player_type=2的真实玩家
2. **唯一占用机制**：机器人不能同时出现在多个竞技场
3. **完整生命周期**：从补位到淘汰的全程管理
4. **高级AI系统**：具备记牌、配合、策略的智能AI
5. **不能夺冠**：决赛阶段让真人获胜
6. **像真人出牌**：随机思考时间，不秒出牌
7. **后台管理**：完整的状态显示和统计
8. **不影响现有**：通过模块隔离和配置开关保障
