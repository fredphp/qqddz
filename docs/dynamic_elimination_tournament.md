# 动态淘汰赛竞技系统 - 完整实现文档

## 一、系统概述

本系统实现了动态淘汰赛竞技功能，支持：
- 多轮淘汰机制
- 根据报名人数动态选择起始轮
- 掉线玩家直接淘汰
- 机器人补位（不可获奖）
- 排行榜阶段倒计时
- 决赛产生冠亚季军

## 二、修改文件列表

### 1. 数据库迁移脚本
```
sql/migrations/add_elimination_tournament.sql  (新增)
```

### 2. 服务端新增文件 (server/tournament/)
```
server/tournament/types.go                     (类型定义)
server/tournament/state_machine.go             (状态机)
server/tournament/match_scheduler.go           (分桌调度)
server/tournament/rank_calculator.go           (排名计算)
server/tournament/elimination_controller.go    (淘汰控制)
server/tournament/tournament_manager.go        (赛事管理器)
```

### 3. 服务端修改文件
```
server/internal/game/database/models.go        (RoomConfig新增字段)
server/internal/game/database/arena_models.go  (ArenaSession/ArenaParticipation新增字段)
```

### 4. Admin后台修改文件
```
admin/server/model/ddz/room_config.go          (新增eliminationRules等字段)
admin/web/src/view/ddz/roomConfig/roomConfig.vue (新增淘汰赛配置UI)
```

### 5. 客户端修改文件
```
nclient/assets/scripts/data/arenaData.js       (已包含排行榜支持的基础API)
```

## 三、数据库 Migration

### 1. ddz_room_config 表新增字段
| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| elimination_rules | VARCHAR(255) | '[60,30,18,9,3]' | 淘汰规则JSON数组 |
| rank_wait_seconds | INT | 30 | 排行榜阶段等待秒数 |
| min_match_players | INT | 1 | 最小匹配人数 |

### 2. ddz_arena_sessions 表新增字段
| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| elimination_rules | VARCHAR(255) | '[60,30,18,9,3]' | 淘汰规则JSON数组 |
| current_elimination_idx | INT | 0 | 当前淘汰规则索引 |
| tournament_stage | VARCHAR(32) | 'SIGNUP' | 赛事阶段 |
| rank_wait_until | DATETIME | NULL | 排行榜等待截止时间 |
| tables_completed | INT | 0 | 本轮已完成桌数 |

### 3. ddz_arena_participations 表新增字段
| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| is_tournament_bot | TINYINT | 0 | 是否为锦标赛补位机器人 |
| round_match_coin | BIGINT | 0 | 本轮比赛金币 |
| current_table_id | BIGINT | NULL | 当前所在桌ID |

### 4. 新增表
- `ddz_tournament_rounds` - 锦标赛淘汰轮次表
- `ddz_tournament_eliminations` - 锦标赛淘汰记录表

## 四、状态机设计

```
SIGNUP (报名)
   ↓
PREPARE (准备/分桌)
   ↓
PLAYING (游戏中)
   ↓
RANKING (排行榜阶段，30秒倒计时)
   ↓
ELIMINATING (淘汰阶段)
   ↓
[循环回到PREPARE] 或 [进入FINAL]
   ↓
FINAL (决赛，最后3人)
   ↓
FINISHED (结束)
```

### 特殊情况
- 报名人数 <= 3：直接进入决赛
- 报名人数 < elimination_rules最小值：直接进入决赛

## 五、淘汰规则详解

### 配置示例
```json
[60, 30, 18, 9, 3]
```

### 动态匹配规则

| 报名人数 | 起始轮保留人数 | 后续淘汰流程 |
|---------|---------------|-------------|
| 102 | 60 | 60→30→18→9→3(决赛) |
| 33 | 30 | 30→18→9→3(决赛) |
| 19 | 18 | 18→9→3(决赛) |
| 3 | 直接决赛 | - |
| 1 | 补2机器人后决赛 | - |

## 六、核心模块说明

### TournamentManager
- 赛事生命周期管理
- 协调各子模块工作
- 处理WebSocket广播

### MatchScheduler
- 随机分桌
- 确保每桌3人
- 支持决赛单独分桌

### RankCalculator
- 计算本轮排名
- 获取淘汰线内/外玩家
- 处理掉线玩家

### EliminationController
- 执行淘汰操作
- 记录淘汰原因
- 确定最终排名（冠亚季军）

## 七、WebSocket 消息类型

| 类型 | 说明 |
|------|------|
| TOURNAMENT_SIGNUP | 报名成功 |
| TOURNAMENT_START | 比赛开始 |
| TOURNAMENT_RANKING | 排行榜阶段 |
| TOURNAMENT_ELIMINATE | 淘汰通知 |
| TOURNAMENT_FINAL | 决赛通知 |
| TOURNAMENT_END | 比赛结束 |
| TOURNAMENT_TABLE | 分桌通知 |

## 八、调试测试 Case

### Case 1: 102人 -> 60 -> 30 -> 18 -> 9 -> 3
```
报名102人（补0机器人）
第1轮: 102人分34桌，保留60人
第2轮: 60人分20桌，保留30人
第3轮: 30人分10桌，保留18人
第4轮: 18人分6桌，保留9人
第5轮: 9人分3桌，保留3人
决赛: 3人1桌，产生冠亚季军
```

### Case 2: 33人 -> 30 -> 18 -> 9 -> 3
```
报名33人（补0机器人）
从30人档位开始
第1轮: 33人分11桌，保留30人（淘汰3人）
第2轮: 30人分10桌，保留18人
...后续同上
```

### Case 3: 1人 -> 补2机器人 -> 决赛
```
报名1人
补位2个机器人(is_tournament_bot=1)
直接进入决赛
机器人不可获奖，顺延给真人
```

### Case 4: 掉线直接淘汰
```
玩家掉线后标记is_online=0
下一轮淘汰时eliminated_reason='offline'
```

## 九、部署步骤

### 1. 执行数据库迁移
```bash
mysql -u root -p your_database < sql/migrations/add_elimination_tournament.sql
```

### 2. 编译服务端
```bash
cd server
go build -o ddz_server ./cmd/server
```

### 3. 编译Admin后台
```bash
cd admin/server
go build -o admin_server .

cd admin/web
npm run build
```

### 4. 重启服务
```bash
systemctl restart ddz-server
systemctl restart ddz-admin
```

## 十、配置示例

### Admin后台配置
在房间配置页面，选择"竞技场"类型后：
- 淘汰规则: `[60,30,18,9,3]`
- 排行榜等待: `30` 秒
- 最小匹配人数: `1`

### 普通场不受影响
所有竞技场逻辑完全隔离，普通场房间正常运行。

## 十一、注意事项

1. **机器人补位**：机器人标记`is_tournament_bot=1`，不可获奖
2. **掉线处理**：掉线玩家下一轮直接淘汰
3. **决赛顺延**：如果机器人进入前三，顺延给下一个真人
4. **倒计时**：排行榜阶段固定30秒（可配置）
5. **数据隔离**：不影响普通场功能

---

文档版本: 1.0
更新日期: 2025-01-19
