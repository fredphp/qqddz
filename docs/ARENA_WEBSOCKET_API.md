# 斗地主竞技场 WebSocket API 对接文档

## 文档说明
- **版本**: v1.0
- **更新时间**: 2026-05-14
- **适用范围**: 斗地主竞技场赛事系统客户端对接

---

## 一、连接说明

### 1.1 WebSocket 连接地址
```
ws://{服务器地址}:{端口}/ws
```

- 开发环境: `ws://localhost:1780/ws`
- 生产环境: 根据实际部署地址配置

### 1.2 消息格式
所有消息采用 JSON 格式：

```json
{
    "type": "消息类型",
    "payload": {
        // 消息内容
    }
}
```

---

## 二、赛事状态机

### 2.1 赛事阶段 (TournamentStage)

| 阶段 | 值 | 说明 |
|------|-----|------|
| 报名阶段 | `SIGNUP` | 玩家可以报名参赛 |
| 准备阶段 | `PREPARE` | 报名结束，等待进入游戏 |
| 比赛中 | `PLAYING` | 游戏进行中 |
| 排行榜 | `RANKING` | 等待排名统计 |
| 淘汰阶段 | `ELIMINATING` | 淘汰低排名玩家 |
| 决赛阶段 | `FINAL` | 决出冠亚季军 |
| 已结束 | `FINISHED` | 比赛结束 |

### 2.2 竞技场期号状态 (ArenaPeriodStatus)

| 状态值 | 说明 |
|--------|------|
| 0 | 准备中 |
| 1 | 报名中 |
| 2 | 等待开赛 |
| 3 | 比赛进行中 |
| 4 | 已结束 |
| 5 | 已取消 |

---

## 三、客户端发送消息

### 3.1 竞技场报名
**消息类型**: `arena_signup`

**请求参数**:
```json
{
    "type": "arena_signup",
    "payload": {
        "room_id": 1
    }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| room_id | uint64 | 是 | 竞技场房间配置ID |

**成功响应**: `arena_signup_success`
```json
{
    "type": "arena_signup_success",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "signup_fee": 100,
        "balance_after": 900,
        "signup_time": 1715678400000
    }
}
```

**失败响应**: `arena_signup_failed`
```json
{
    "type": "arena_signup_failed",
    "payload": {
        "code": 1,
        "message": "当前不在报名时间内"
    }
}
```

| 错误码 | 说明 |
|--------|------|
| 1 | 当前不在报名时间内 |
| 2 | 已报名，请勿重复报名 |
| 3 | 竞技币不足 |
| 4 | 报名费不足 |
| 5 | 报名失败，请重试 |

---

### 3.2 取消报名
**消息类型**: `arena_cancel_signup`

**请求参数**:
```json
{
    "type": "arena_cancel_signup",
    "payload": {
        "room_id": 1
    }
}
```

**成功响应**: `arena_cancel_success`
```json
{
    "type": "arena_cancel_success",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "refund_amount": 100,
        "balance_after": 1000
    }
}
```

---

### 3.3 进入比赛
**消息类型**: `arena_enter`

> 报名结束后，玩家点击"进入比赛"按钮发送此消息

**请求参数**:
```json
{
    "type": "arena_enter",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1
    }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period_no | string | 是 | 期号 |
| room_id | uint64 | 是 | 房间配置ID |

**成功响应**: `arena_enter_success`
```json
{
    "type": "arena_enter_success",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "message": "正在进入游戏..."
    }
}
```

---

### 3.4 取消进入
**消息类型**: `arena_cancel_enter`

> 玩家点击"取消"按钮，退出比赛并返还报名费

**请求参数**:
```json
{
    "type": "arena_cancel_enter",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1
    }
}
```

**成功响应**: `arena_cancel_enter_success`
```json
{
    "type": "arena_cancel_enter_success",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "refund_amount": 100,
        "balance_after": 1000,
        "message": "已取消进入游戏，返还 100 竞技币"
    }
}
```

---

## 四、服务端推送消息

### 4.1 竞技场状态推送
**消息类型**: `arena_status`

> 服务端定期推送（每秒检查，变化时推送）

```json
{
    "type": "arena_status",
    "payload": {
        "arenas": [
            {
                "room_id": 1,
                "room_name": "初级竞技场",
                "period_no": 34,
                "period_no_str": "260514010034",
                "phase": 1,
                "countdown": 180,
                "can_signup": true,
                "status_text": "报名中",
                "total_players": 45
            }
        ],
        "time": 1715678400000
    }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| arenas | array | 竞技场列表 |
| room_id | uint64 | 房间ID |
| room_name | string | 房间名称 |
| period_no | int | 期号序号 |
| period_no_str | string | 完整期号 |
| phase | int | 阶段：0-准备，1-报名 |
| countdown | int | 倒计时秒数 |
| can_signup | bool | 是否可报名 |
| status_text | string | 状态文本 |
| total_players | int | 报名人数 |

---

### 4.2 比赛开始通知
**消息类型**: `arena_match_start`

> 报名结束时推送给所有已报名玩家

```json
{
    "type": "arena_match_start",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "room_name": "初级竞技场",
        "room_config_id": 1,
        "signup_fee": 100,
        "total_players": 60,
        "match_duration": 5,
        "match_rounds": 5,
        "countdown": 60,
        "start_time": 1715678400000,
        "message": "比赛即将开始，请点击进入！"
    }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| period_no | string | 期号 |
| room_id | uint64 | 房间ID |
| room_name | string | 房间名称 |
| signup_fee | int64 | 报名费 |
| total_players | int | 总报名人数 |
| match_duration | int | 每轮时长（分钟） |
| match_rounds | int | 总轮次数 |
| countdown | int | 进入倒计时（秒） |
| start_time | int64 | 开始时间戳（毫秒） |
| message | string | 提示消息 |

---

### 4.3 等待阶段状态
**消息类型**: `arena_waiting_status`

> 玩家点击进入后，推送等待界面状态

```json
{
    "type": "arena_waiting_status",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "room_name": "初级竞技场",
        "phase": "waiting",
        "countdown": 55,
        "start_time": 1715678400000,
        "total_players": 60,
        "entered_players": 45,
        "players": [
            {
                "player_id": "1001",
                "player_name": "张三",
                "avatar": "https://...",
                "is_robot": false,
                "entered_at": 1715678400000
            }
        ],
        "message": "等待其他玩家进入..."
    }
}
```

| phase 值 | 说明 |
|----------|------|
| waiting | 等待阶段（60秒） |
| assigning | 分配阶段（10秒） |
| entering | 进入游戏 |

---

### 4.4 等待倒计时更新
**消息类型**: `arena_waiting_tick`

> 每秒推送一次

```json
{
    "type": "arena_waiting_tick",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "countdown": 45,
        "entered_players": 48
    }
}
```

---

### 4.5 分配阶段开始
**消息类型**: `arena_assign_start`

> 等待阶段结束，开始分配玩家到桌子

```json
{
    "type": "arena_assign_start",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "total_players": 60,
        "total_tables": 20,
        "countdown": 10,
        "message": "正在分配玩家到 20 桌，10秒后进入游戏"
    }
}
```

---

### 4.6 等待进度广播
**消息类型**: `tournament_wait_progress`

> 玩家完成当前轮次后，显示等待其他桌完成的进度

```json
{
    "type": "tournament_wait_progress",
    "payload": {
        "period_no": "260514010001",
        "round": 1,
        "total_rounds": 5,
        "finished_tables": 15,
        "total_tables": 20,
        "player_table_done": true,
        "status": "WAITING",
        "message": "正在等待其他玩家完成..."
    }
}
```

| status 值 | 说明 |
|-----------|------|
| WAITING | 等待中 |
| CALCULATING | 计算排名中 |
| MATCHING | 匹配下一轮中 |

---

### 4.7 下一轮通知
**消息类型**: `tournament_round_advance`

> 所有桌完成当前轮次后，广播进入下一轮

```json
{
    "type": "tournament_round_advance",
    "payload": {
        "period_no": "260514010001",
        "new_round": 2,
        "total_rounds": 5,
        "message": "进入下一轮，请准备"
    }
}
```

---

### 4.8 最终榜单
**消息类型**: `tournament_final_rank`

> 比赛结束时推送最终排名

```json
{
    "type": "tournament_final_rank",
    "payload": {
        "period_no": "260514010001",
        "total_players": 60,
        "top3": [
            {
                "rank": 1,
                "player_id": "1001",
                "player_name": "张三",
                "avatar": "https://...",
                "match_coin": 25000,
                "is_robot": false
            }
        ],
        "top20": [...],
        "my_rank": 5,
        "my_match_coin": 15000,
        "message": "比赛结束"
    }
}
```

---

### 4.9 冠军跑马灯广播
**消息类型**: `arena_champion_broadcast`

> 比赛结束时向所有在线玩家广播冠军信息

```json
{
    "type": "arena_champion_broadcast",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "room_name": "初级竞技场",
        "champion_id": 1001,
        "champion_name": "张三",
        "champion_avatar": "https://...",
        "runner_up_name": "李四",
        "third_name": "王五",
        "total_players": 60,
        "match_coin": 25000,
        "message": "恭喜 张三 在期号 260514010001 夺得初级竞技场冠军！",
        "timestamp": 1715678400000
    }
}
```

---

### 4.10 关闭弹窗通知
**消息类型**: `arena_close_dialog`

> 新期号开始或比赛结束时，关闭弹窗

```json
{
    "type": "arena_close_dialog",
    "payload": {
        "room_id": 1,
        "period_no": "260514010001",
        "reason": "new_period_started",
        "message": "新一轮已开始，上一轮的弹窗已关闭"
    }
}
```

---

### 4.11 断线重连状态恢复
**消息类型**: `arena_reconnect_state`

> 玩家重连时推送当前状态

```json
{
    "type": "arena_reconnect_state",
    "payload": {
        "phase": "playing",
        "period_no": "260514010001",
        "room_id": 1,
        "room_name": "初级竞技场",
        "round": 2,
        "total_rounds": 5,
        "countdown": 30,
        "arena_gold": 12000,
        "table_id": 5,
        "room_code": "ABC123",
        "total_players": 60,
        "my_rank": 15,
        "is_eliminated": false,
        "message": "游戏进行中"
    }
}
```

| phase 值 | 说明 |
|----------|------|
| signup | 报名阶段 |
| waiting | 等待阶段 |
| assigning | 分配阶段 |
| playing | 游戏中 |
| settlement | 结算中 |
| finished | 已结束 |

---

### 4.12 比赛结束通知
**消息类型**: `arena_match_end`

> 所有轮次打完后，通知玩家比赛结束

```json
{
    "type": "arena_match_end",
    "payload": {
        "period_no": "260514010001",
        "room_id": 1,
        "message": "比赛结束"
    }
}
```

---

## 五、淘汰赛规则

### 5.1 淘汰规则配置
淘汰规则在房间配置中设置，格式为数组：

```json
{
    "elimination_rules": [60, 30, 18, 9, 3]
}
```

含义：
- 第1轮结束保留60人
- 第2轮结束保留30人
- 第3轮结束保留18人
- 第4轮结束保留9人
- 第5轮（决赛）保留3人

### 5.2 动态轮次计算
根据报名人数动态计算总轮次：

| 报名人数 | 淘汰路径 | 总轮次 |
|----------|----------|--------|
| 102人 | 102→60→30→18→9→3 | 6轮 |
| 60人 | 60→30→18→9→3 | 5轮 |
| 52人 | 52→30→18→9→3 | 5轮 |
| 30人 | 30→18→9→3 | 4轮 |
| 17人 | 17→9→3 | 3轮 |
| 3人 | 直接决赛 | 1轮 |

### 5.3 机器人补位
- 报名人数不是3的倍数时，自动添加机器人补位
- 机器人不消耗竞技币
- 机器人不能获得奖励

---

## 六、赛事金币系统

### 6.1 初始金币
- 所有参赛玩家进入比赛后获得统一赛事金币
- 初始金币由房间配置决定（如10000）
- 比赛中的输赢只影响赛事金币排名

### 6.2 金币变动
| 变动原因 | 说明 |
|----------|------|
| INIT | 初始化（报名时发放） |
| WIN | 赢得金币 |
| LOSE | 输掉金币 |
| SETTLEMENT | 结算 |
| ELIMINATE | 淘汰 |

### 6.3 排名计算
- 金币越高排名越高
- 同金币时按报名时间排序（先报名优先）

---

## 七、异常处理

### 7.1 断线重连
- 玩家断线后可重连
- 服务端发送 `arena_reconnect_state` 恢复状态
- 客户端应保存 period_no 用于重连

### 7.2 超时处理
- 进入阶段超时（60秒）：
  - 未点击进入的玩家自动取消报名
  - 已点击进入的玩家正常开始游戏
  - 人数不足时自动补机器人

### 7.3 服务器恢复
- 服务器重启后自动检查进行中的赛事
- 从 Redis 恢复进入阶段状态
- 检查数据库中 PLAYING 状态的期号

---

## 八、客户端对接要点

### 8.1 时间同步
- ⚠️ **所有倒计时以服务端推送为准**
- 客户端不得使用本地时间作为最终依据
- 服务端推送 `countdown` 字段表示剩余秒数

### 8.2 消息处理流程
```
1. 连接 WebSocket
2. 接收 arena_status 获取当前状态
3. 玩家报名 → 发送 arena_signup
4. 接收 arena_match_start 显示弹窗
5. 玩家点击进入 → 发送 arena_enter
6. 接收 arena_waiting_status 显示等待界面
7. 进入游戏房间
8. 游戏中接收 tournament_wait_progress
9. 接收 tournament_final_rank 显示最终榜单
10. 接收 arena_champion_broadcast 显示跑马灯
```

### 8.3 弹窗显示条件
- 收到 `arena_match_start` 时显示弹窗
- 弹窗显示60秒倒计时
- 收到 `arena_close_dialog` 时关闭弹窗
- 玩家刷新页面后应重新请求状态

---

## 九、房间配置字段

房间配置表 `ddz_room_config` 中竞技场相关字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| room_category | int | 房间分类：2=竞技场 |
| min_arena_coin | int64 | 报名费（竞技币） |
| min_gold | int64 | 初始赛事金币 |
| match_duration | int | 每轮时长（分钟） |
| elimination_rules | string | 淘汰规则JSON |
| match_time_ranges | string | 开赛时间段JSON |

---

## 十、更新日志

### v1.0 (2026-05-14)
- 初始版本
- 包含完整的竞技场 WebSocket API
- 支持报名、进入、淘汰、排名、冠军广播
- 支持断线重连状态恢复
- 支持服务器异常恢复
