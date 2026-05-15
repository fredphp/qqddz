package server

import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "math/rand"
        "strconv"
        "strings"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/room"
        "github.com/palemoky/fight-the-landlord/tournament"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

// =============================================
// 类型定义
// =============================================

// MatchTimeRange 开赛时间段
type MatchTimeRange struct {
        Start string `json:"start"` // 开始时间，格式 "HH:MM"
        End   string `json:"end"`   // 结束时间，格式 "HH:MM"
}

// =============================================
// 常量定义
// =============================================

const (
        // 每期总时长（分钟）
        PeriodTotalMinutes = 5
        // 准备阶段时长（分钟）- 用于处理进入游戏
        PrepareMinutes = 1
        // 报名阶段时长（分钟）
        SignupMinutes = 4
)

// PhaseType 阶段类型
type PhaseType int

const (
        PhaseNone    PhaseType = iota // 不可用
        PhasePrepare                  // 准备阶段
        PhaseSignup                   // 报名阶段
)

// =============================================
// 竞技场状态广播器
// =============================================

// ArenaStatusBroadcaster 竞技场状态广播器
type ArenaStatusBroadcaster struct {
        server *Server
        done   chan struct{}

        // 上次推送的状态，用于检测是否需要推送
        lastStatus   map[uint64]*protocol.ArenaRoomStatus // roomID -> status
        lastStatusMu sync.RWMutex

        // 新客户端连接通知通道
        newClientChan chan uint64 // playerID

        // 上次广播时间（用于兜底机制）
        lastBroadcastTime time.Time

        // 当前期号信息缓存（内存）
        periodCache   map[uint64]*PeriodInfo // roomID -> PeriodInfo
        periodCacheMu sync.RWMutex

        // 已处理的期号（用于触发一次性操作）
        processedPeriods   map[uint64]string // roomID -> lastProcessedPeriodNo
        processedPeriodsMu sync.Mutex

        // 消息队列
        queue *ArenaMessageQueue

        // 🔧【新增】进入阶段管理
        // 记录进入阶段的信息：periodNo -> *EnterPhaseInfo
        enterPhases   map[string]*EnterPhaseInfo
        enterPhasesMu sync.RWMutex
}

// 🔧【新增】游戏桌信息
// 用于表示一桌游戏的分配情况
type GameTable struct {
        TableID       int                // 桌号（从1开始）
        RoomCode      string             // 房间号（创建后填充）
        HostPlayerID  uint64             // 房主玩家ID（随机选择）
        Players       []uint64           // 这一桌的所有玩家ID（3人）
        RobotPlayers  []uint64           // 这一桌的机器人ID
        RoomCreated   bool               // 房间是否已创建
        AllEntered    bool               // 所有玩家是否都已进入
        PlayerStatuses map[uint64]bool   // playerID -> 是否已进入
}

// 🔧【新增】进入阶段信息
// 用于跟踪玩家是否在进入阶段点击了"进入"或"取消"
type EnterPhaseInfo struct {
        PeriodNo       string         // 期号
        RoomID         uint64         // 竞技场配置ID
        SignupFee      int64          // 报名费（用于退还）
        PlayerStatuses map[uint64]*PlayerEnterStatus // playerID -> status
        StartTime      time.Time      // 进入阶段开始时间
        Countdown      int            // 倒计时秒数
        timer          *time.Timer    // 定时器
        
        // 🔧【重构】多桌管理
        Tables         []*GameTable   // 所有游戏桌
        PlayerToTable  map[uint64]int // playerID -> 桌号（用于快速查找玩家在哪桌）
        
        // 🔧【新增】等待阶段管理
        WaitingPhase    WaitingPhaseType // 当前等待阶段
        WaitingTimer    *time.Ticker     // 等待阶段倒计时定时器（每秒触发）
        AssigningTimer  *time.Timer      // 分配阶段倒计时定时器
        WaitingCountdown int             // 等待阶段剩余倒计时
}

// 🔧【新增】等待阶段类型
type WaitingPhaseType int

const (
        WaitingPhaseNone      WaitingPhaseType = iota // 无等待阶段
        WaitingPhaseWaiting                             // 等待玩家进入阶段（60秒）
        WaitingPhaseAssigning                           // 分配阶段（10秒）
        WaitingPhaseEntering                            // 进入游戏阶段
)

// 🔧【新增】玩家进入状态
type PlayerEnterStatus struct {
        PlayerID    uint64 // 玩家ID
        IsRobot     bool   // 是否是机器人
        HasEntered  bool   // 是否已点击进入
        HasCancelled bool  // 是否已点击取消
        SignupFee   int64  // 报名费（用于退还）
        TableID     int    // 分配的桌号（0表示未分配）
}

// 🔧【新增】进入阶段倒计时秒数
// 进入阶段应该与准备阶段一致（1分钟 = 60秒）
// 弹窗在准备阶段显示，准备阶段结束后关闭
const EnterPhaseCountdown = 60

// 🔧【新增】等待阶段和分配阶段倒计时秒数
const (
        // 等待阶段：玩家点击"进入"后等待其他玩家进入（60秒）
        WaitingPhaseCountdown = 60
        // 分配阶段：等待阶段结束后，分配玩家到桌子（10秒）
        AssigningPhaseCountdown = 10
)

// 🔧【新增】可序列化的进入阶段信息（用于 Redis 持久化）
type EnterPhaseInfoForRedis struct {
        PeriodNo       string                              `json:"period_no"`
        RoomID         uint64                              `json:"room_id"`
        SignupFee      int64                               `json:"signup_fee"`
        PlayerStatuses map[uint64]*PlayerEnterStatus       `json:"player_statuses"`
        StartTime      time.Time                           `json:"start_time"`
        Countdown      int                                 `json:"countdown"`
        Tables         []*GameTableForRedis                `json:"tables"`
        PlayerToTable  map[uint64]int                      `json:"player_to_table"`
}

// 🔧【新增】可序列化的游戏桌信息（用于 Redis 持久化）
type GameTableForRedis struct {
        TableID       int              `json:"table_id"`
        RoomCode      string           `json:"room_code"`
        HostPlayerID  uint64           `json:"host_player_id"`
        Players       []uint64         `json:"players"`
        RobotPlayers  []uint64         `json:"robot_players"`
        RoomCreated   bool             `json:"room_created"`
        AllEntered    bool             `json:"all_entered"`
        PlayerStatuses map[uint64]bool `json:"player_statuses"`
}

// Redis key 前缀
const EnterPhaseRedisKeyPrefix = "ddz:arena:enter_phase:"

// PeriodInfo 期号信息
type PeriodInfo struct {
        PeriodNo       string    // 期号，如 "C2605050001"
        Phase          PhaseType // 当前阶段
        StartTime      time.Time // 本期开始时间
        SignupEndTime  time.Time // 报名截止时间
        TotalPlayers   int       // 报名人数
        LastUpdate     time.Time // 最后更新时间
        SessionID      uint64    // 数据库会话ID
        PeriodID       uint64    // 数据库期号ID
        RoomConfigID   uint64    // 房间配置ID
}

// NewArenaStatusBroadcaster 创建竞技场状态广播器
func NewArenaStatusBroadcaster(server *Server) *ArenaStatusBroadcaster {
        b := &ArenaStatusBroadcaster{
                server:            server,
                done:              make(chan struct{}),
                lastStatus:        make(map[uint64]*protocol.ArenaRoomStatus),
                newClientChan:     make(chan uint64, 100),
                lastBroadcastTime: time.Now(),
                periodCache:       make(map[uint64]*PeriodInfo),
                processedPeriods:  make(map[uint64]string),
                enterPhases:       make(map[string]*EnterPhaseInfo),
        }
        // 创建消息队列（3个工作线程，1000缓冲区）
        b.queue = NewArenaMessageQueue(server, 3, 1000)
        return b
}

// Start 启动定期检查
func (b *ArenaStatusBroadcaster) Start() {
        // 启动时强制刷新Redis缓存，确保使用最新的房间配置
        b.refreshRedisCacheFromDB()

        // 启动消息队列
        b.queue.Start()
        
        // [Enhanced] Restore in-progress tournaments from Redis/DB
        go b.RestoreInProgressTournaments()

        go func() {
                // 每秒检查一次是否需要推送
                ticker := time.NewTicker(1 * time.Second)
                defer ticker.Stop()

                for {
                        select {
                        case <-ticker.C:
                                b.checkAndBroadcast()
                        case playerID := <-b.newClientChan:
                                // 新客户端连接，单独推送
                                b.sendToNewClient(playerID)
                        case <-b.done:
                                return
                        }
                }
        }()
}

// Stop 停止广播
func (b *ArenaStatusBroadcaster) Stop() {
        close(b.done)
        b.queue.Stop()
}

// OnNewClient 通知有新客户端连接
func (b *ArenaStatusBroadcaster) OnNewClient(playerID uint64) {
        select {
        case b.newClientChan <- playerID:
        default:
                // 通道满，跳过（不阻塞）
        }
}

// GetQueue 获取消息队列
func (b *ArenaStatusBroadcaster) GetQueue() *ArenaMessageQueue {
        return b.queue
}

// =============================================
// 期号生成
// =============================================

// generatePeriodNo 生成期号
// 新格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
// 示例: 260506010034 = 2026年5月6日，房间ID=1，第0034期
// 简洁易读，无需字母前缀
func (b *ArenaStatusBroadcaster) generatePeriodNo(roomID uint64, roomType int, daySequence int) string {
        // 日期 YYMMDD (6位)
        now := time.Now()
        dateStr := fmt.Sprintf("%02d%02d%02d", now.Year()%100, int(now.Month()), now.Day())

        // 房间ID (2位)
        roomIDStr := fmt.Sprintf("%02d", roomID%100) // 取后两位，支持1-99号房间

        // 期序号 (4位)
        seqStr := fmt.Sprintf("%04d", daySequence)

        return fmt.Sprintf("%s%s%s", dateStr, roomIDStr, seqStr)
}

// getPeriodPrefixByRoomType 已废弃，保留空函数以兼容旧代码
func getPeriodPrefixByRoomType(roomType int) string {
        return ""
}

// =============================================
// 状态计算
// =============================================

// checkAndBroadcast 检查是否需要广播
func (b *ArenaStatusBroadcaster) checkAndBroadcast() {
        currentStatus := b.calculateArenaStatus()

        needBroadcast := false
        b.lastStatusMu.Lock()
        defer b.lastStatusMu.Unlock()

        // 兜底机制：每30秒强制推送一次
        timeSinceLastBroadcast := time.Since(b.lastBroadcastTime)
        needFallbackBroadcast := timeSinceLastBroadcast >= 30*time.Second

        for _, status := range currentStatus {
                roomID := status.RoomID
                lastStatus, exists := b.lastStatus[roomID]

                // 首次获取状态，标记需要广播
                if !exists {
                        b.lastStatus[roomID] = &status
                        needBroadcast = true
                        continue
                }

                // 检查是否需要广播
                shouldBroadcast := false

                // 情况1：期号变化
                if lastStatus.PeriodNoStr != status.PeriodNoStr && status.PeriodNoStr != "" {
                        shouldBroadcast = true
                        // 期号变化时，触发上一期结算和新期号创建
                        b.handlePeriodChange(roomID, lastStatus.PeriodNoStr, status.PeriodNoStr, status)
                }

                // 情况2：阶段变化
                if lastStatus.StatusText != status.StatusText {
                        shouldBroadcast = true
                        // 阶段变化处理
                        b.handlePhaseChange(roomID, status)
                }

                // 情况3：报名人数变化（超过阈值时推送）
                if status.TotalPlayers > 0 && lastStatus.TotalPlayers != status.TotalPlayers {
                        shouldBroadcast = true
                }

                if shouldBroadcast {
                        needBroadcast = true
                }

                // 更新缓存的状态
                b.lastStatus[roomID] = &status
        }

        // 决定是否广播
        if needBroadcast {
                b.server.BroadcastArenaStatus(currentStatus)
                b.lastBroadcastTime = time.Now()
        } else if needFallbackBroadcast && len(currentStatus) > 0 {
                b.server.BroadcastArenaStatus(currentStatus)
                b.lastBroadcastTime = time.Now()
        }

        // 🔧【关键新增】每30秒检查并推送弹窗给需要但没收到的玩家
        if needFallbackBroadcast {
                b.checkAndPushPendingMatchStartPopups()
        }
}

// 🔧【新增】checkAndPushPendingMatchStartPopups 检查并推送待处理的比赛开始弹窗
// 这是解决弹窗不显示问题的关键：每30秒检查一次，确保所有报名玩家都能收到弹窗
func (b *ArenaStatusBroadcaster) checkAndPushPendingMatchStartPopups() {
        if b.server.redis == nil {
                return
        }

        ctx := context.Background()
        // 获取所有进入阶段的 key
        keys, err := b.server.redis.Keys(ctx, "ddz:arena:enter_phase:*").Result()
        if err != nil || len(keys) == 0 {
                return
        }

        log.Printf("[ArenaStatus] 🔄 检查待推送弹窗: 发现 %d 个进入阶段记录", len(keys))

        // 遍历每个玩家的进入阶段状态
        for _, key := range keys {
                // 提取 playerID
                playerIDStr := strings.TrimPrefix(key, "ddz:arena:enter_phase:")
                playerID, err := strconv.ParseUint(playerIDStr, 10, 64)
                if err != nil {
                        continue
                }

                // 获取玩家状态
                data := b.getPlayerEnterPhaseFromRedis(playerID)
                if data == nil {
                        continue
                }

                // 检查是否已取消或已进入
                if data.HasCancelled || data.HasEntered {
                        continue
                }

                // 检查是否超时
                elapsed := time.Now().Unix() - data.StartTime
                remaining := data.Countdown - int(elapsed)
                if remaining <= 0 {
                        // 超时，清理数据
                        b.removePlayerEnterPhaseFromRedis(playerID)
                        continue
                }

                // 查找玩家客户端
                b.server.clientsMu.RLock()
                var client *Client
                for _, c := range b.server.clients {
                        if c.PlayerID == playerID && c.GetRoom() == "" {
                                client = c
                                break
                        }
                }
                b.server.clientsMu.RUnlock()

                if client == nil {
                        continue // 玩家不在线
                }

                // 发送弹窗
                b.sendMatchStartPopupToPlayer(playerID, client, data, remaining)
        }
}

// 🔧【新增】sendMatchStartPopupToPlayer 发送比赛开始弹窗给指定玩家
func (b *ArenaStatusBroadcaster) sendMatchStartPopupToPlayer(playerID uint64, client *Client, data *EnterPhaseRedisData, remaining int) {
        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(data.RoomID)
        if err != nil {
                return
        }

        // 构建弹窗消息
        payload := &protocol.ArenaMatchStartPayload{
                PeriodNo:      data.PeriodNo,
                RoomID:        data.RoomID,
                RoomName:      roomConfig.RoomName,
                RoomConfigID:  data.RoomID,
                SignupFee:     data.SignupFee,
                TotalPlayers:  0, // 无法从Redis获取，使用默认值
                MatchDuration: PeriodTotalMinutes,
                MatchRounds:   5, // 默认值
                Countdown:     remaining,
                StartTime:     data.StartTime,
                Message:       "比赛进行中，请点击进入！",
        }

        msg := codec.MustNewMessage(protocol.MsgArenaMatchStart, payload)
        client.SendMessage(msg)
        log.Printf("[ArenaStatus] ✅ 定时推送弹窗: playerID=%d, periodNo=%s, remaining=%ds", playerID, data.PeriodNo, remaining)
}

// handlePeriodChange 处理期号变化
func (b *ArenaStatusBroadcaster) handlePeriodChange(roomID uint64, oldPeriodNo, newPeriodNo string, status protocol.ArenaRoomStatus) {
        b.processedPeriodsMu.Lock()
        defer b.processedPeriodsMu.Unlock()

        // 🔧【调试】添加日志
        log.Printf("[ArenaStatus] 🔄 期号变化: roomID=%d, oldPeriodNo=%s, newPeriodNo=%s", roomID, oldPeriodNo, newPeriodNo)

        // 检查是否已处理过这个新期号
        if lastProcessed, exists := b.processedPeriods[roomID]; exists && lastProcessed == newPeriodNo {
                log.Printf("[ArenaStatus] ⚠️ 期号 %s 已处理过，跳过", newPeriodNo)
                return
        }

        // 获取期号缓存信息
        periodInfo := b.getPeriodCache(roomID)
        if periodInfo == nil {
                log.Printf("[ArenaStatus] ⚠️ 无法获取期号缓存信息: roomID=%d", roomID)
                return
        }

        // 1. 结算上一期（如果存在）- 结算任务会自动清理缓存
        if oldPeriodNo != "" {
                // 🔧【新增】在结算之前，先获取上一期的报名玩家并发送比赛开始通知
                // 获取上一期的报名玩家列表
                signupPlayers := b.GetSignupList(oldPeriodNo)
                log.Printf("[ArenaStatus] 📋 获取报名列表: oldPeriodNo=%s, 报名人数=%d", oldPeriodNo, len(signupPlayers))
                
                // 🔧【重构】如果报名人数不是3的倍数，自动添加机器人补位
                // 例如：31人 -> 补2个机器人 -> 33人（11桌）
                //       32人 -> 补1个机器人 -> 33人（11桌）
                //       34人 -> 补2个机器人 -> 36人（12桌）
                // 机器人报名不需要竞技币
                if len(signupPlayers) > 0 {
                        remainder := len(signupPlayers) % 3
                        if remainder != 0 {
                                fillCount := 3 - remainder
                                
                                // 添加机器人到报名列表
                                robots := b.fillRobotsToSignupList(oldPeriodNo, roomID, fillCount)
                                if len(robots) > 0 {
                                        signupPlayers = append(signupPlayers, robots...)
                                        log.Printf("[ArenaStatus] 🤖 添加 %d 个机器人补位", len(robots))
                                }
                        }
                }
                
                if len(signupPlayers) > 0 {
                        log.Printf("[ArenaStatus] 🚀 开始发送比赛开始通知: roomID=%d, periodNo=%s, 总人数=%d", roomID, oldPeriodNo, len(signupPlayers))
                        // 发送比赛开始通知给已报名玩家
                        b.sendMatchStartNotification(roomID, oldPeriodNo, signupPlayers)
                } else {
                        log.Printf("[ArenaStatus] ⚠️ 报名列表为空，不发送比赛开始通知")
                }

                b.queue.PushPeriodFinalize(PeriodFinalizeData{
                        PeriodNo: oldPeriodNo,
                        RoomID:   roomID,
                })
        } else {
                log.Printf("[ArenaStatus] ℹ️ 没有上一期，跳过结算")
        }

        // 2. 创建新期号记录
        b.queue.PushPeriodCreate(PeriodCreateData{
                PeriodNo:        newPeriodNo,
                RoomID:          roomID,
                RoomConfigID:    periodInfo.RoomConfigID,
                PeriodIndex:     status.PeriodNo,
                StartTime:       periodInfo.StartTime,
                SignupStartTime: periodInfo.StartTime.Add(PrepareMinutes * time.Minute),
                SignupEndTime:   periodInfo.SignupEndTime,
                EndTime:         periodInfo.StartTime.Add(PeriodTotalMinutes * time.Minute),
        })
        
        // 🔧【修复】不立即发送关闭弹窗消息
        // 而是启动一个进入阶段倒计时，倒计时结束后处理未响应的玩家
        // 关闭弹窗消息将在进入阶段结束时发送

        // 标记已处理
        b.processedPeriods[roomID] = newPeriodNo
}

// sendMatchStartNotification 发送比赛开始通知给已报名玩家
// 🔧【重构】报名结束后立即进行多桌分组、创建房间、自动准备、开始游戏
// 流程：报名结束 → 写入数据库 → 随机分组（3人一桌，不足补机器人）→ 创建房间 → 加入玩家 → 自动准备 → 开始发牌
func (b *ArenaStatusBroadcaster) sendMatchStartNotification(roomID uint64, periodNo string, playerIDs []uint64) {
        if len(playerIDs) == 0 {
                return
        }

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(roomID)
        if err != nil {
                log.Printf("[ArenaStatus] 获取房间配置失败: roomID=%d, err=%v", roomID, err)
                return
        }

        // 🔧【关键修复】比赛开始时写入数据库
        // 1. 获取初始金币
        initialGold := roomConfig.MinGold
        if initialGold <= 0 {
                initialGold = 10000
        }

        // 2. 获取期号记录
        period, _ := database.GetArenaPeriodByPeriodNo(periodNo)
        var periodID uint64
        var periodTime time.Time
        if period != nil {
                periodID = period.ID
                periodTime = period.StartTime
        } else {
                periodTime = time.Now()
        }

        // 3. 写入 period_players 表（报名记录）
        for order, playerID := range playerIDs {
                playerRecord := &database.ArenaPeriodPlayer{
                        PeriodNo:    periodNo,
                        PeriodID:    periodID,
                        RoomID:      roomID,
                        PlayerID:    playerID,
                        SignupTime:  time.Now(),
                        SignupOrder: order + 1,
                        Status:      database.ArenaPeriodPlayerStatusNormal,
                        ArenaGold:   initialGold, // 初始化金币
                }
                database.FirstOrCreateArenaPeriodPlayerWithTime(periodID, playerID, playerRecord, periodTime)
        }
        log.Printf("[ArenaStatus] ✅ 已写入 period_players 表: periodNo=%s, count=%d, initialGold=%d", periodNo, len(playerIDs), initialGold)

        // 4. 写入 participations 表（参赛记录）
        err = database.CreateParticipationsForPeriod(0, periodNo, initialGold, playerIDs)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 写入 participations 表失败: %v", err)
        } else {
                log.Printf("[ArenaStatus] ✅ 已写入 participations 表: periodNo=%s, count=%d", periodNo, len(playerIDs))
        }

        // 获取所有玩家信息，区分机器人和真人
        var players []database.Player
        database.DB().Where("id IN ?", playerIDs).Find(&players)
        playerMap := make(map[uint64]*database.Player)
        for i := range players {
                playerMap[players[i].ID] = &players[i]
        }

        // 分离真人和机器人玩家
        var realPlayers []uint64
        var robotPlayers []uint64
        for _, playerID := range playerIDs {
                player, exists := playerMap[playerID]
                isRobot := exists && player.PlayerType == database.PlayerTypeRobot
                if isRobot {
                        robotPlayers = append(robotPlayers, playerID)
                } else {
                        realPlayers = append(realPlayers, playerID)
                }
        }

        log.Printf("[ArenaStatus] 🔥 报名结束，开始分组: periodNo=%s, realPlayers=%d, robots=%d", 
                periodNo, len(realPlayers), len(robotPlayers))

        // 🔧【核心】多桌分组逻辑
        // 1. 合并所有玩家并随机打乱
        allPlayers := make([]uint64, 0, len(realPlayers)+len(robotPlayers))
        allPlayers = append(allPlayers, realPlayers...)
        allPlayers = append(allPlayers, robotPlayers...)
        
        // 随机打乱玩家顺序
        rand.Shuffle(len(allPlayers), func(i, j int) {
                allPlayers[i], allPlayers[j] = allPlayers[j], allPlayers[i]
        })

        // 2. 每3人一组创建游戏桌，不足3人补机器人
        tables := make([]*GameTable, 0)
        playerToTable := make(map[uint64]int)
        
        for i := 0; i < len(allPlayers); i += 3 {
                tableID := len(tables) + 1
                table := &GameTable{
                        TableID:        tableID,
                        Players:        make([]uint64, 0, 3),
                        RobotPlayers:   make([]uint64, 0),
                        PlayerStatuses: make(map[uint64]bool),
                }
                
                // 添加玩家到这一桌
                end := i + 3
                if end > len(allPlayers) {
                        end = len(allPlayers)
                }
                
                for j := i; j < end; j++ {
                        playerID := allPlayers[j]
                        table.Players = append(table.Players, playerID)
                        table.PlayerStatuses[playerID] = true // 标记为已进入
                        playerToTable[playerID] = tableID
                    
                        // 记录是否是机器人
                        if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                                table.RobotPlayers = append(table.RobotPlayers, playerID)
                        }
                }
                
                // 🔧【关键】如果这桌不足3人，补机器人
                if len(table.Players) < 3 {
                        needRobots := 3 - len(table.Players)
                        log.Printf("[ArenaStatus] 桌号 %d 不足3人，需要补 %d 个机器人", tableID, needRobots)
                        
                        // 获取空闲机器人
                        var robots []database.Player
                        err := database.DB().Where("player_type = ? AND robot_status = ?", 
                                database.PlayerTypeRobot, database.RobotStatusIdle).
                                Order("RAND()").
                                Limit(needRobots).
                                Find(&robots).Error
                        
                        if err != nil {
                                log.Printf("[ArenaStatus] ⚠️ 获取机器人失败: %v", err)
                        } else if len(robots) < needRobots {
                                log.Printf("[ArenaStatus] ⚠️ 机器人不足，需要 %d，实际 %d", needRobots, len(robots))
                        }
                        
                        // 🔧【修复】即使机器人不足，也尽量添加可用的机器人
                        for i := 0; i < len(robots); i++ {
                                robot := &robots[i]
                                table.Players = append(table.Players, robot.ID)
                                table.RobotPlayers = append(table.RobotPlayers, robot.ID)
                                table.PlayerStatuses[robot.ID] = true
                                playerToTable[robot.ID] = tableID
                                playerMap[robot.ID] = robot
                                log.Printf("[ArenaStatus] 机器人 %d (%s) 补位到桌号 %d", robot.ID, robot.Nickname, tableID)
                        }
                        
                        // 🔧【新增】如果仍然不足3人，记录警告但继续游戏
                        if len(table.Players) < 3 {
                                log.Printf("[ArenaStatus] ⚠️ 桌号 %d 最终只有 %d 人，游戏可能受影响", tableID, len(table.Players))
                        }
                }
                
                // 随机选择房主（优先选择真人玩家）
                var hostCandidates []uint64
                for _, pid := range table.Players {
                        if playerMap[pid] == nil || playerMap[pid].PlayerType != database.PlayerTypeRobot {
                                hostCandidates = append(hostCandidates, pid)
                        }
                }
                if len(hostCandidates) == 0 {
                        hostCandidates = table.Players
                }
                table.HostPlayerID = hostCandidates[rand.Intn(len(hostCandidates))]
                
                tables = append(tables, table)
                log.Printf("[ArenaStatus] 📋 分组完成: 桌号=%d, 玩家=%v, 房主=%d", tableID, table.Players, table.HostPlayerID)
        }

        // 3. 创建进入阶段信息
        enterPhase := &EnterPhaseInfo{
                PeriodNo:       periodNo,
                RoomID:         roomID,
                SignupFee:      roomConfig.MinArenaCoin,
                PlayerStatuses: make(map[uint64]*PlayerEnterStatus),
                StartTime:      time.Now(),
                Countdown:      EnterPhaseCountdown,
                Tables:         tables,
                PlayerToTable:  playerToTable,
        }

        // 初始化玩家状态（所有玩家初始都是"等待中"状态，包括机器人和真人）
        for _, playerID := range playerIDs {
                player, exists := playerMap[playerID]
                isRobot := exists && player.PlayerType == database.PlayerTypeRobot
                signupFee := roomConfig.MinArenaCoin
                if isRobot {
                        signupFee = 0
                }
                tableID := playerToTable[playerID]
                
                enterPhase.PlayerStatuses[playerID] = &PlayerEnterStatus{
                        PlayerID:     playerID,
                        IsRobot:      isRobot,
                        HasEntered:   false, // 所有玩家初始都是"等待中"状态
                        HasCancelled: false,
                        SignupFee:    signupFee,
                        TableID:      tableID,
                }
        }

        // 保存进入阶段信息
        b.enterPhasesMu.Lock()
        b.enterPhases[periodNo] = enterPhase
        b.enterPhasesMu.Unlock()

        // 🔧【新增】持久化进入阶段信息到 Redis（用于断线重连恢复）
        b.saveEnterPhaseToRedis(enterPhase)

        // 🔧【关键修复】启动倒计时定时器，倒计时结束后处理超时
        enterPhase.timer = time.AfterFunc(time.Duration(EnterPhaseCountdown)*time.Second, func() {
                b.handleEnterPhaseTimeout(periodNo)
        })

        // 🔧【关键新增】保存真人玩家的进入阶段状态到 Redis（持久化，确保刷新页面后也能恢复弹窗）
        startTimeUnix := time.Now().UnixMilli()
        for _, playerID := range realPlayers {
                tableID := playerToTable[playerID]
                b.savePlayerEnterPhaseToRedis(playerID, &EnterPhaseRedisData{
                        PeriodNo:  periodNo,
                        RoomID:    roomID,
                        SignupFee: roomConfig.MinArenaCoin,
                        TableID:   tableID,
                        Countdown: EnterPhaseCountdown,
                        StartTime: startTimeUnix,
                })
        }

        // 🔧【修复】发送弹窗消息给所有真人玩家
        b.sendMatchStartPopup(roomID, periodNo, roomConfig, realPlayers, playerMap)

        // 🔧【修改】机器人不自动进入，保持"等待中"状态
        // 机器人显示为"等待中"，只有真人玩家点击进入后才显示"已进入"
        // 原逻辑：机器人自动调用 HandlePlayerEnter，导致 HasEntered = true
        // 新逻辑：机器人保持 HasEntered = false，显示"等待中"状态
}

// 🔧【新增】发送比赛开始弹窗通知给真人玩家
// 🔧【修复】动态计算总轮次，根据报名人数和淘汰规则
func (b *ArenaStatusBroadcaster) sendMatchStartPopup(roomID uint64, periodNo string, roomConfig *database.RoomConfig, realPlayers []uint64, playerMap map[uint64]*database.Player) {
        // 🔧【修复】动态计算总轮次
        // 解析淘汰规则
        var rules tournament.EliminationRules
        if roomConfig.EliminationRules != "" {
                if err := json.Unmarshal([]byte(roomConfig.EliminationRules), &rules); err != nil {
                        log.Printf("[ArenaStatus] 解析淘汰规则失败，使用默认值: %v", err)
                        rules = tournament.EliminationRules{60, 30, 18, 9, 3}
                }
        } else {
                rules = tournament.EliminationRules{60, 30, 18, 9, 3}
        }

        // 计算总报名人数（真人 + 机器人）
        totalPlayers := len(playerMap)

        // 动态计算总轮次
        totalRounds := rules.GetTotalRounds(totalPlayers)

        // 🔧【日志】输出计算结果
        log.Printf("[TOURNAMENT] 计算总轮次: players=%d, rules=%v, totalRounds=%d", totalPlayers, rules, totalRounds)

        // 构建弹窗消息
        payload := &protocol.ArenaMatchStartPayload{
                PeriodNo:      periodNo,
                RoomID:        roomID,
                RoomName:      roomConfig.RoomName,
                RoomConfigID:  roomID,
                SignupFee:     roomConfig.MinArenaCoin,
                TotalPlayers:  totalPlayers,
                MatchDuration: PeriodTotalMinutes,
                MatchRounds:   totalRounds, // 🔧【修复】动态计算的总轮次
                Countdown:     EnterPhaseCountdown,
                StartTime:     time.Now().UnixMilli(),
                Message:       "比赛即将开始，请点击进入！",
        }

        msg := codec.MustNewMessage(protocol.MsgArenaMatchStart, payload)

        // 🔧【调试】添加日志
        log.Printf("[ArenaStatus] 📢 发送比赛开始弹窗: periodNo=%s, roomID=%d, realPlayers=%v", periodNo, roomID, realPlayers)

        // 发送给所有在线的真人玩家
        b.server.clientsMu.RLock()
        sentCount := 0
        for _, playerID := range realPlayers {
                found := false
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID {
                                found = true
                                roomCode := client.GetRoom()
                                log.Printf("[ArenaStatus] 📢 检查玩家 %d: 在线=%v, 当前房间='%s'", playerID, true, roomCode)
                                if roomCode == "" {
                                        client.SendMessage(msg)
                                        sentCount++
                                        log.Printf("[ArenaStatus] ✅ 已发送弹窗给玩家 %d", playerID)
                                } else {
                                        log.Printf("[ArenaStatus] ⚠️ 玩家 %d 当前在房间 '%s'，跳过发送", playerID, roomCode)
                                }
                                break
                        }
                }
                if !found {
                        log.Printf("[ArenaStatus] ⚠️ 玩家 %d 不在线，无法发送弹窗", playerID)
                }
        }
        b.server.clientsMu.RUnlock()
        log.Printf("[ArenaStatus] 📢 弹窗发送完成: 成功发送 %d 个", sentCount)
}

// 🔧【重构】为一桌玩家创建房间并开始游戏
// 流程：3人同时分配 → 随机选房主 → 创建房间 → 三人同时加入 → 自动准备 → 开始游戏
func (b *ArenaStatusBroadcaster) createAndStartTableGame(enterPhase *EnterPhaseInfo, table *GameTable, roomConfigID uint64, playerMap map[uint64]*database.Player) {
        if b.server.roomManager == nil {
                return
        }

        // ============================================================
        // 1. 收集所有在线玩家客户端（真人）
        // ============================================================
        onlineClients := make([]*Client, 0) // 在线的真人玩家
        
        b.server.clientsMu.RLock()
        for _, playerID := range table.Players {
                // 跳过机器人
                if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                        continue
                }
                
                // 查找真人玩家的客户端连接
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                onlineClients = append(onlineClients, client)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()

        // 如果没有在线的真人玩家，使用第一个机器人作为房主
        var hostRobotID uint64 = 0 // 记录作为房主的机器人ID
        var robotHostClient *RobotClient // 机器人房主客户端
        if len(onlineClients) == 0 {
                // 使用机器人作为房主
                if len(table.RobotPlayers) > 0 {
                        hostRobotID = table.RobotPlayers[0]
                        robotHostClient = NewRobotClient(hostRobotID, b.server)
                }
                if robotHostClient == nil {
                        return
                }
        }

        // ============================================================
        // 2. 随机选择房主并创建房间
        // ============================================================
        var hostClient types.ClientInterface
        if robotHostClient != nil {
                // 使用机器人作为房主
                hostClient = robotHostClient
        } else {
                // 从在线真人玩家中随机选择房主
                hostIdx := rand.Intn(len(onlineClients))
                hostClient = onlineClients[hostIdx]
                
                // 从在线列表中移除房主（房主创建房间时已自动加入）
                onlineClients = append(onlineClients[:hostIdx], onlineClients[hostIdx+1:]...)
        }

        // ============================================================
        // 3. 创建房间（房主自动加入，座位0）
        // ============================================================
        gameRoom, err := b.server.roomManager.CreateRoom(hostClient, roomConfigID)
        if err != nil {
                log.Printf("[ArenaStatus] ❌ 创建房间失败: %v", err)
                return
        }

        // 🔧【关键修复】设置竞技场期号
        gameRoom.SetPeriodNo(enterPhase.PeriodNo)

        // 记录房间信息
        table.RoomCreated = true
        table.RoomCode = gameRoom.Code

        // ============================================================
        // 4. 将其他真人玩家加入房间（座位1、2）
        // ============================================================
        for _, client := range onlineClients {
                b.server.roomManager.JoinRoom(client, gameRoom.Code)
        }

        // ============================================================
        // 5. 将机器人加入房间（跳过已经是房主的机器人）
        // ============================================================
        for _, robotID := range table.RobotPlayers {
                // 跳过已经是房主的机器人
                if robotID == hostRobotID {
                        continue
                }
                robotClient := NewRobotClient(robotID, b.server)
                if robotClient != nil {
                        b.server.roomManager.JoinRoom(robotClient, gameRoom.Code)
                }
        }

        // ============================================================
        // 6. 设置所有玩家为已准备状态
        // ============================================================
        gameRoom.SetAllPlayersReady()

        // ============================================================
        // 7. 获取房间内所有玩家信息（用于广播）
        // ============================================================
        players := gameRoom.GetAllPlayersInfo()

        // ============================================================
        // 8. 发送 room_joined 消息给所有真人玩家
        // ============================================================
        b.server.clientsMu.RLock()
        for _, playerID := range table.Players {
                // 只给真人玩家发送消息
                if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                        continue
                }
                
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID {
                                playerInfo := gameRoom.GetPlayerInfo(client.GetID())
                                payload := &protocol.RoomJoinedPayload{
                                        RoomCode:     gameRoom.Code,
                                        Player:       playerInfo,
                                        Players:      players,
                                        CreatorID:    gameRoom.CreatorID,
                                        RoomCategory: gameRoom.RoomCategory, // 🔧【新增】房间分类
                                        PeriodNo:     gameRoom.PeriodNo,     // 🔧【新增】期号
                                }
                                client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, payload))
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()

        // ============================================================
        // 9. 广播所有玩家准备状态
        // ============================================================
        for _, player := range gameRoom.Players {
                if player.Client != nil {
                        gameRoom.Broadcast(codec.MustNewMessage(protocol.MsgPlayerReady, &protocol.PlayerReadyPayload{
                                PlayerID: player.Client.GetID(),
                                Ready:    true,
                        }))
                }
        }

        // ============================================================
        // 10. 开始游戏
        // ============================================================
        if err := gameRoom.StartGame(); err != nil {
                return
        }

        // ============================================================
        // 11. 触发游戏会话创建（发牌）
        // ============================================================
        if b.server.roomManager != nil {
                b.server.roomManager.TriggerOnGameStart(gameRoom)
        }
}

// 🔧【新增】处理进入阶段超时
// 倒计时结束后，检查哪些玩家没有响应，自动取消并返还竞技币
// 对于已进入的玩家，开始游戏
func (b *ArenaStatusBroadcaster) handleEnterPhaseTimeout(periodNo string) {
        b.enterPhasesMu.Lock()
        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                b.enterPhasesMu.Unlock()
                return
        }
        // 停止定时器（如果还在运行）
        if enterPhase.timer != nil {
                enterPhase.timer.Stop()
        }
        // 停止等待阶段定时器
        if enterPhase.WaitingTimer != nil {
                enterPhase.WaitingTimer.Stop()
        }
        // 停止分配阶段定时器
        if enterPhase.AssigningTimer != nil {
                enterPhase.AssigningTimer.Stop()
        }
        // 清理进入阶段信息
        delete(b.enterPhases, periodNo)
        b.enterPhasesMu.Unlock()

        // 🔧【新增】从 Redis 删除进入阶段信息
        b.deleteEnterPhaseFromRedis(periodNo)

        // 统计玩家状态
        var timeoutPlayers []uint64
        var enteredPlayers []uint64

        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered && !status.HasCancelled {
                        // 未进入也未取消的玩家 = 超时未响应
                        timeoutPlayers = append(timeoutPlayers, playerID)
                } else if status.HasEntered && !status.HasCancelled {
                        // 已进入的玩家
                        enteredPlayers = append(enteredPlayers, playerID)
                }
        }

        log.Printf("[ArenaStatus] ⏰ 进入阶段超时: periodNo=%s, 超时玩家=%d, 已进入玩家=%d", 
                periodNo, len(timeoutPlayers), len(enteredPlayers))

        // 对于超时未响应的玩家，自动取消并返还竞技币
        for _, playerID := range timeoutPlayers {
                status := enterPhase.PlayerStatuses[playerID]
                if status.SignupFee > 0 {
                        // 返还竞技币并记录流水
                        database.UpdatePlayerArenaCoinWithLog(
                                playerID,
                                status.SignupFee,
                                database.ArenaCoinChangeRefund,
                                periodNo,
                                fmt.Sprintf("进入阶段超时返还，期号:%s", periodNo),
                        )
                }
                // 🔧【修改】更新 Redis 中的取消状态（而不是删除），这样玩家不会再收到弹窗
                b.updatePlayerEnterPhaseCancelled(playerID)
        }

        // 🔧【关键修复】对于已经进入的玩家，为他们创建房间并开始游戏
        if len(enteredPlayers) > 0 {
                // 检查是否已有房间创建
                hasCreatedRoom := false
                for _, table := range enterPhase.Tables {
                        if table.RoomCreated && table.RoomCode != "" {
                                hasCreatedRoom = true
                                break
                        }
                }

                if hasCreatedRoom {
                        // 已有房间，检查并开始游戏
                        for _, table := range enterPhase.Tables {
                                if !table.RoomCreated || table.RoomCode == "" {
                                        continue
                                }
                                hasEnteredPlayer := false
                                for _, playerID := range table.Players {
                                        if status, ok := enterPhase.PlayerStatuses[playerID]; ok && status.HasEntered {
                                                hasEnteredPlayer = true
                                                break
                                        }
                                }
                                if hasEnteredPlayer && !table.AllEntered {
                                        gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
                                        if gameRoom != nil {
                                                table.AllEntered = true
                                                b.startArenaGame(gameRoom)
                                        }
                                }
                        }
                } else {
                        // 没有房间创建，需要为已进入的玩家创建房间
                        log.Printf("[ArenaStatus] 🚀 为已进入玩家创建房间: periodNo=%s, 玩家数=%d", periodNo, len(enteredPlayers))
                        b.createRoomsForEnteredPlayers(enterPhase, enteredPlayers)
                }
        }

        // 发送关闭弹窗消息
        b.sendCloseDialogNotification(enterPhase.RoomID, periodNo)
}

// 🔧【新增】为已进入的玩家创建房间并开始游戏
func (b *ArenaStatusBroadcaster) createRoomsForEnteredPlayers(enterPhase *EnterPhaseInfo, enteredPlayers []uint64) {
        if len(enteredPlayers) == 0 {
                return
        }

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 获取房间配置失败: %v", err)
                return
        }

        // 获取所有玩家信息
        var players []database.Player
        database.DB().Where("id IN ?", enteredPlayers).Find(&players)
        playerMap := make(map[uint64]*database.Player)
        for i := range players {
                playerMap[players[i].ID] = &players[i]
        }

        // 随机打乱玩家顺序
        rand.Shuffle(len(enteredPlayers), func(i, j int) {
                enteredPlayers[i], enteredPlayers[j] = enteredPlayers[j], enteredPlayers[i]
        })

        // 每3人一桌，不足补机器人
        for i := 0; i < len(enteredPlayers); i += 3 {
                tableID := i/3 + 1
                table := &GameTable{
                        TableID:        tableID,
                        Players:        make([]uint64, 0, 3),
                        RobotPlayers:   make([]uint64, 0),
                        PlayerStatuses: make(map[uint64]bool),
                }

                end := i + 3
                if end > len(enteredPlayers) {
                        end = len(enteredPlayers)
                }

                // 添加玩家
                for j := i; j < end; j++ {
                        playerID := enteredPlayers[j]
                        table.Players = append(table.Players, playerID)
                        table.PlayerStatuses[playerID] = true

                        if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                                table.RobotPlayers = append(table.RobotPlayers, playerID)
                        }
                }

                // 如果不足3人，补机器人
                if len(table.Players) < 3 {
                        needRobots := 3 - len(table.Players)
                        var robots []database.Player
                        database.DB().Where("player_type = ? AND robot_status = ?",
                                database.PlayerTypeRobot, database.RobotStatusIdle).
                                Order("RAND()").
                                Limit(needRobots).
                                Find(&robots)

                        for idx := range robots {
                                robot := &robots[idx]
                                table.Players = append(table.Players, robot.ID)
                                table.RobotPlayers = append(table.RobotPlayers, robot.ID)
                                table.PlayerStatuses[robot.ID] = true
                                playerMap[robot.ID] = robot
                        }
                }

                log.Printf("[ArenaStatus] 📋 创建桌子: tableID=%d, 玩家=%v", tableID, table.Players)

                // 为这桌创建房间并开始游戏
                b.createAndStartTableGameForWaiting(enterPhase, table)
        }
}

// 🔧【新增】处理玩家点击"进入"按钮
// 🔧【重构】玩家点击进入后进入等待阶段，等待其他玩家进入
// 等待阶段60秒结束后，进入分配阶段（10秒），然后创建房间开始游戏
func (b *ArenaStatusBroadcaster) HandlePlayerEnter(periodNo string, playerID uint64) error {
        b.enterPhasesMu.Lock()
        defer b.enterPhasesMu.Unlock()

        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                return fmt.Errorf("进入阶段不存在或已结束")
        }

        status, exists := enterPhase.PlayerStatuses[playerID]
        if !exists {
                return fmt.Errorf("玩家未报名此期号")
        }

        if status.HasCancelled {
                return fmt.Errorf("玩家已取消报名")
        }

        // 获取客户端连接
        var client *Client
        b.server.clientsMu.RLock()
        for _, c := range b.server.clients {
                if c.PlayerID == playerID {
                        client = c
                        break
                }
        }
        b.server.clientsMu.RUnlock()

        if client == nil {
                return fmt.Errorf("玩家不在线")
        }

        // 如果已经在等待阶段或更后面的阶段，直接推送当前状态
        if status.HasEntered {
                // 推送当前等待状态给玩家
                b.sendWaitingStatusToPlayer(enterPhase, playerID, client)
                return nil
        }

        // 标记玩家已进入
        status.HasEntered = true
        status.TableID = 0 // 等待阶段结束后再分配桌子

        // 🔧【修改】更新 Redis 中的进入状态
        b.updatePlayerEnterPhaseEntered(playerID)

        log.Printf("[ArenaStatus] 玩家 %d 进入等待阶段: periodNo=%s", playerID, periodNo)

        // 如果等待阶段还未启动，启动等待阶段
        if enterPhase.WaitingPhase == WaitingPhaseNone {
                b.startWaitingPhase(enterPhase)
        }

        // 🔧【新增】广播玩家加入消息给所有本期玩家
        b.broadcastPlayerJoined(enterPhase, playerID, status.IsRobot)

        // 推送等待状态给所有已进入的玩家
        b.broadcastWaitingStatus(enterPhase)

        return nil
}

// 🔧【新增】启动等待阶段（60秒倒计时）
func (b *ArenaStatusBroadcaster) startWaitingPhase(enterPhase *EnterPhaseInfo) {
        enterPhase.WaitingPhase = WaitingPhaseWaiting
        enterPhase.WaitingCountdown = WaitingPhaseCountdown
        enterPhase.StartTime = time.Now()

        log.Printf("[ArenaStatus] 🚀 启动等待阶段: periodNo=%s, countdown=%d秒", enterPhase.PeriodNo, WaitingPhaseCountdown)

        // 启动每秒推送倒计时的定时器
        enterPhase.WaitingTimer = time.NewTicker(1 * time.Second)
        
        go func() {
                for {
                        select {
                        case <-enterPhase.WaitingTimer.C:
                                b.handleWaitingTick(enterPhase.PeriodNo)
                        case <-b.done:
                                return
                        }
                }
        }()
}

// 🔧【新增】处理等待阶段每秒倒计时
func (b *ArenaStatusBroadcaster) handleWaitingTick(periodNo string) {
        b.enterPhasesMu.Lock()
        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                b.enterPhasesMu.Unlock()
                return
        }

        // 检查是否还在等待阶段
        if enterPhase.WaitingPhase != WaitingPhaseWaiting {
                b.enterPhasesMu.Unlock()
                return
        }

        enterPhase.WaitingCountdown--

        // 推送倒计时更新给所有已进入的玩家
        b.broadcastWaitingTick(enterPhase)

        // 检查是否倒计时结束
        if enterPhase.WaitingCountdown <= 0 {
                log.Printf("[ArenaStatus] ⏰ 等待阶段结束，开始分配阶段: periodNo=%s", periodNo)
                
                // 停止等待阶段定时器
                if enterPhase.WaitingTimer != nil {
                        enterPhase.WaitingTimer.Stop()
                }
                
                // 进入分配阶段
                b.startAssigningPhaseLocked(enterPhase)
        }

        b.enterPhasesMu.Unlock()
}

// 🔧【新增】启动分配阶段（10秒倒计时）- 需要已持有锁
func (b *ArenaStatusBroadcaster) startAssigningPhaseLocked(enterPhase *EnterPhaseInfo) {
        enterPhase.WaitingPhase = WaitingPhaseAssigning
        enterPhase.WaitingCountdown = AssigningPhaseCountdown

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 获取房间配置失败: %v", err)
                return
        }

        // 🔧【重构】收集已进入的真人玩家和报名的机器人
        var enteredRealPlayers []uint64  // 已进入的真人玩家
        var signedRobots []uint64        // 报名的机器人（无论是否进入）
        var enteredRobots []uint64       // 已进入的机器人
        
        for playerID, status := range enterPhase.PlayerStatuses {
                if status.HasCancelled {
                        continue // 跳过已取消的玩家
                }
                
                if status.IsRobot {
                        signedRobots = append(signedRobots, playerID)
                        if status.HasEntered {
                                enteredRobots = append(enteredRobots, playerID)
                        }
                } else if status.HasEntered {
                        enteredRealPlayers = append(enteredRealPlayers, playerID)
                }
        }
        
        // 已进入的玩家总数（真人 + 已进入的机器人）
        var enteredPlayers []uint64
        enteredPlayers = append(enteredPlayers, enteredRealPlayers...)
        enteredPlayers = append(enteredPlayers, enteredRobots...)
        
        log.Printf("[ArenaStatus] 📊 玩家统计: 已进入真人=%d, 报名机器人=%d, 已进入机器人=%d", 
                len(enteredRealPlayers), len(signedRobots), len(enteredRobots))

        // 🔧【核心逻辑】计算需要补位的机器人数量
        // 人数必须是3的倍数才能分桌
        totalEntered := len(enteredRealPlayers) + len(enteredRobots)
        remainder := totalEntered % 3
        
        var needRobotCount int  // 需要的机器人数量
        var releaseRobots []uint64  // 需要释放的机器人
        
        if remainder == 0 {
                // 已经是3的倍数，不需要补位
                needRobotCount = 0
                // 如果有多余的报名机器人（未进入的），释放它们
                for _, robotID := range signedRobots {
                        if !contains(enteredRobots, robotID) {
                                releaseRobots = append(releaseRobots, robotID)
                        }
                }
        } else {
                // 需要补位 (3 - remainder) 个机器人
                needRobotCount = 3 - remainder
                
                // 检查已报名但未进入的机器人是否足够
                availableRobots := 0
                for _, robotID := range signedRobots {
                        if !contains(enteredRobots, robotID) {
                                availableRobots++
                        }
                }
                
                if availableRobots >= needRobotCount {
                        // 已有足够的报名机器人可以补位
                        // 从未进入的报名机器人中选择需要的数量
                        selectedCount := 0
                        for _, robotID := range signedRobots {
                                if !contains(enteredRobots, robotID) {
                                        if selectedCount < needRobotCount {
                                                // 标记为已进入
                                                enterPhase.PlayerStatuses[robotID].HasEntered = true
                                                enteredPlayers = append(enteredPlayers, robotID)
                                                selectedCount++
                                        } else {
                                                // 多余的机器人释放
                                                releaseRobots = append(releaseRobots, robotID)
                                        }
                                }
                        }
                } else {
                        // 报名机器人不够，需要从空闲机器人池获取
                        needFromPool := needRobotCount - availableRobots
                        
                        // 先使用所有可用的报名机器人
                        for _, robotID := range signedRobots {
                                if !contains(enteredRobots, robotID) {
                                        enterPhase.PlayerStatuses[robotID].HasEntered = true
                                        enteredPlayers = append(enteredPlayers, robotID)
                                }
                        }
                        
                        // 从空闲机器人池获取
                        idleRobots := b.getIdleRobots(needFromPool)
                        for _, robotID := range idleRobots {
                                enteredPlayers = append(enteredPlayers, robotID)
                                // 添加到玩家状态
                                enterPhase.PlayerStatuses[robotID] = &PlayerEnterStatus{
                                        PlayerID:     robotID,
                                        IsRobot:      true,
                                        HasEntered:   true,
                                        HasCancelled: false,
                                        SignupFee:    0,
                                        TableID:      0,
                                }
                        }
                }
        }
        
        // 释放多余的机器人
        for _, robotID := range releaseRobots {
                if status, ok := enterPhase.PlayerStatuses[robotID]; ok {
                        status.HasCancelled = true // 标记为取消，不参与分配
                }
                log.Printf("[ArenaStatus] 🔄 释放多余机器人: %d", robotID)
        }

        // 分配玩家到桌子
        totalPlayers := len(enteredPlayers)
        totalTables := (totalPlayers + 2) / 3 // 每3人一桌

        // 随机打乱玩家顺序
        rand.Shuffle(len(enteredPlayers), func(i, j int) {
                enteredPlayers[i], enteredPlayers[j] = enteredPlayers[j], enteredPlayers[i]
        })

        // 创建新的桌子分配
        enterPhase.Tables = make([]*GameTable, 0)
        enterPhase.PlayerToTable = make(map[uint64]int)

        for i := 0; i < len(enteredPlayers); i += 3 {
                tableID := len(enterPhase.Tables) + 1
                table := &GameTable{
                        TableID:        tableID,
                        Players:        make([]uint64, 0, 3),
                        RobotPlayers:   make([]uint64, 0),
                        PlayerStatuses: make(map[uint64]bool),
                }

                end := i + 3
                if end > len(enteredPlayers) {
                        end = len(enteredPlayers)
                }

                for j := i; j < end; j++ {
                        playerID := enteredPlayers[j]
                        table.Players = append(table.Players, playerID)
                        table.PlayerStatuses[playerID] = true
                        enterPhase.PlayerToTable[playerID] = tableID

                        // 更新玩家的桌号
                        if status, ok := enterPhase.PlayerStatuses[playerID]; ok {
                                status.TableID = tableID
                        }

                        // 记录机器人
                        if status, ok := enterPhase.PlayerStatuses[playerID]; ok && status.IsRobot {
                                table.RobotPlayers = append(table.RobotPlayers, playerID)
                        }
                }

                enterPhase.Tables = append(enterPhase.Tables, table)
        }

        log.Printf("[ArenaStatus] 📋 分配完成: 总人数=%d, 总桌数=%d", totalPlayers, totalTables)

        // 推送分配阶段开始消息
        b.broadcastAssigningStart(enterPhase, roomConfig, totalPlayers, totalTables)

        // 启动分配阶段倒计时
        enterPhase.AssigningTimer = time.AfterFunc(AssigningPhaseCountdown*time.Second, func() {
                b.handleAssigningTimeout(enterPhase.PeriodNo)
        })
}

// 🔧【新增】处理分配阶段超时
func (b *ArenaStatusBroadcaster) handleAssigningTimeout(periodNo string) {
        b.enterPhasesMu.Lock()
        defer b.enterPhasesMu.Unlock()

        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                return
        }

        log.Printf("[ArenaStatus] ⏰ 分配阶段结束，开始创建房间: periodNo=%s", periodNo)

        // 进入游戏阶段
        enterPhase.WaitingPhase = WaitingPhaseEntering

        // 为每桌创建房间并开始游戏
        for _, table := range enterPhase.Tables {
                b.createAndStartTableGameForWaiting(enterPhase, table)
        }

        // 清理进入阶段信息
        delete(b.enterPhases, periodNo)
}

// 🔧【新增】为等待阶段的桌子创建房间并开始游戏
func (b *ArenaStatusBroadcaster) createAndStartTableGameForWaiting(enterPhase *EnterPhaseInfo, table *GameTable) {
        if b.server.roomManager == nil {
                return
        }

        // 获取房间配置
        _, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 获取房间配置失败: %v", err)
                return
        }

        // 获取所有玩家信息
        var players []database.Player
        database.DB().Where("id IN ?", table.Players).Find(&players)
        playerMap := make(map[uint64]*database.Player)
        for i := range players {
                playerMap[players[i].ID] = &players[i]
        }

        // 收集在线玩家客户端
        onlineClients := make([]*Client, 0)
        b.server.clientsMu.RLock()
        for _, playerID := range table.Players {
                if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                onlineClients = append(onlineClients, client)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()

        // 如果没有在线真人玩家，使用机器人作为房主
        var hostClient types.ClientInterface
        var hostRobotID uint64 = 0
        var robotHostClient *RobotClient

        if len(onlineClients) == 0 {
                if len(table.RobotPlayers) > 0 {
                        hostRobotID = table.RobotPlayers[0]
                        robotHostClient = NewRobotClient(hostRobotID, b.server)
                        hostClient = robotHostClient
                }
                if robotHostClient == nil {
                        return
                }
        } else {
                // 随机选择一个真人玩家作为房主
                hostIdx := rand.Intn(len(onlineClients))
                hostClient = onlineClients[hostIdx]
                onlineClients = append(onlineClients[:hostIdx], onlineClients[hostIdx+1:]...)
        }

        // 创建房间
        gameRoom, err := b.server.roomManager.CreateRoom(hostClient, enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] ❌ 创建房间失败: %v", err)
                return
        }

        // 设置竞技场期号
        gameRoom.SetPeriodNo(enterPhase.PeriodNo)
        table.RoomCreated = true
        table.RoomCode = gameRoom.Code

        // 将其他真人玩家加入房间
        for _, client := range onlineClients {
                b.server.roomManager.JoinRoom(client, gameRoom.Code)
        }

        // 将机器人加入房间
        for _, robotID := range table.RobotPlayers {
                if robotID == hostRobotID {
                        continue
                }
                robotClient := NewRobotClient(robotID, b.server)
                if robotClient != nil {
                        b.server.roomManager.JoinRoom(robotClient, gameRoom.Code)
                }
        }

        // 设置所有玩家为已准备状态
        gameRoom.SetAllPlayersReady()

        // 发送 room_joined 消息给所有真人玩家
        playerInfos := gameRoom.GetAllPlayersInfo()
        b.server.clientsMu.RLock()
        for _, playerID := range table.Players {
                if playerMap[playerID] != nil && playerMap[playerID].PlayerType == database.PlayerTypeRobot {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID {
                                playerInfo := gameRoom.GetPlayerInfo(client.GetID())
                                payload := &protocol.RoomJoinedPayload{
                                        RoomCode:     gameRoom.Code,
                                        Player:       playerInfo,
                                        Players:      playerInfos,
                                        CreatorID:    gameRoom.CreatorID,
                                        RoomCategory: gameRoom.RoomCategory,
                                        PeriodNo:     gameRoom.PeriodNo,
                                }
                                client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, payload))
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()

        // 开始游戏
        if err := gameRoom.StartGame(); err != nil {
                log.Printf("[ArenaStatus] ⚠️ 开始游戏失败: %v", err)
                return
        }

        // 触发游戏会话创建（发牌）
        if b.server.roomManager != nil {
                b.server.roomManager.TriggerOnGameStart(gameRoom)
        }

        log.Printf("[ArenaStatus] ✅ 桌号 %d 房间创建成功: roomCode=%s", table.TableID, gameRoom.Code)
}

// 🔧【新增】获取空闲机器人
func (b *ArenaStatusBroadcaster) getIdleRobots(count int) []uint64 {
        if count <= 0 {
                return nil
        }

        var robots []database.Player
        err := database.DB().Where("player_type = ? AND robot_status = ?",
                database.PlayerTypeRobot, database.RobotStatusIdle).
                Order("RAND()").
                Limit(count).
                Find(&robots).Error

        if err != nil || len(robots) == 0 {
                return nil
        }

        var robotIDs []uint64
        for _, robot := range robots {
                robotIDs = append(robotIDs, robot.ID)
        }
        return robotIDs
}

// 🔧【新增】推送等待状态给单个玩家
// 修改：推送所有报名玩家（包括未进入的），让客户端显示完整列表
func (b *ArenaStatusBroadcaster) sendWaitingStatusToPlayer(enterPhase *EnterPhaseInfo, playerID uint64, client *Client) {
        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                return
        }

        // 收集所有报名玩家列表（不只是已进入的）
        var players []protocol.WaitingPlayerInfo
        var enteredCount int
        for pid, status := range enterPhase.PlayerStatuses {
                if status.HasCancelled {
                        continue // 跳过已取消的玩家
                }
                
                if status.HasEntered {
                        enteredCount++
                }
                
                // 获取玩家信息
                var player database.Player
                if err := database.DB().Where("id = ?", pid).First(&player).Error; err == nil {
                        // 只有已进入的玩家才有 entered_at 时间戳
                        var enteredAt int64
                        if status.HasEntered {
                                enteredAt = time.Now().UnixMilli()
                        } else {
                                enteredAt = 0 // 未进入的玩家 entered_at 为 0
                        }
                        
                        players = append(players, protocol.WaitingPlayerInfo{
                                PlayerID:   fmt.Sprintf("%d", pid),
                                PlayerName: player.Nickname,
                                Avatar:     player.Avatar,
                                IsRobot:    status.IsRobot,
                                EnteredAt:  enteredAt,
                        })
                }
        }

        phaseStr := "waiting"
        if enterPhase.WaitingPhase == WaitingPhaseAssigning {
                phaseStr = "assigning"
        } else if enterPhase.WaitingPhase == WaitingPhaseEntering {
                phaseStr = "entering"
        }

        payload := &protocol.ArenaWaitingStatusPayload{
                PeriodNo:       enterPhase.PeriodNo,
                RoomID:         enterPhase.RoomID,
                RoomName:       roomConfig.RoomName,
                Phase:          phaseStr,
                Countdown:      enterPhase.WaitingCountdown,
                StartTime:      enterPhase.StartTime.UnixMilli(),
                TotalPlayers:   len(enterPhase.PlayerStatuses),
                EnteredPlayers: enteredCount,
                Players:        players,
                Message:        "等待其他玩家进入...",
        }

        msg := codec.MustNewMessage(protocol.MsgArenaWaitingStatus, payload)
        client.SendMessage(msg)
}

// 🔧【新增】广播等待状态给所有已进入的玩家
// 修改：推送所有报名玩家（包括未进入的），让客户端显示完整列表
func (b *ArenaStatusBroadcaster) broadcastWaitingStatus(enterPhase *EnterPhaseInfo) {
        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                return
        }

        // 收集所有报名玩家列表（不只是已进入的）
        var players []protocol.WaitingPlayerInfo
        var enteredCount int
        for playerID, status := range enterPhase.PlayerStatuses {
                if status.HasCancelled {
                        continue // 跳过已取消的玩家
                }
                
                if status.HasEntered {
                        enteredCount++
                }
                
                var player database.Player
                if err := database.DB().Where("id = ?", playerID).First(&player).Error; err == nil {
                        // 只有已进入的玩家才有 entered_at 时间戳
                        var enteredAt int64
                        if status.HasEntered {
                                enteredAt = time.Now().UnixMilli()
                        } else {
                                enteredAt = 0 // 未进入的玩家 entered_at 为 0
                        }
                        
                        players = append(players, protocol.WaitingPlayerInfo{
                                PlayerID:   fmt.Sprintf("%d", playerID),
                                PlayerName: player.Nickname,
                                Avatar:     player.Avatar,
                                IsRobot:    status.IsRobot,
                                EnteredAt:  enteredAt,
                        })
                }
        }

        phaseStr := "waiting"
        if enterPhase.WaitingPhase == WaitingPhaseAssigning {
                phaseStr = "assigning"
        }

        payload := &protocol.ArenaWaitingStatusPayload{
                PeriodNo:       enterPhase.PeriodNo,
                RoomID:         enterPhase.RoomID,
                RoomName:       roomConfig.RoomName,
                Phase:          phaseStr,
                Countdown:      enterPhase.WaitingCountdown,
                StartTime:      enterPhase.StartTime.UnixMilli(),
                TotalPlayers:   len(enterPhase.PlayerStatuses),
                EnteredPlayers: enteredCount,
                Players:        players,
                Message:        "等待其他玩家进入...",
        }

        msg := codec.MustNewMessage(protocol.MsgArenaWaitingStatus, payload)

        // 发送给所有已进入的在线玩家（不包括机器人）
        b.server.clientsMu.RLock()
        for playerID, status := range enterPhase.PlayerStatuses {
                if status.HasCancelled || status.IsRobot {
                        continue
                }
                // 只发送给已点击进入的真人玩家
                if !status.HasEntered {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                client.SendMessage(msg)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()
}

// 🔧【新增】广播等待阶段倒计时更新
func (b *ArenaStatusBroadcaster) broadcastWaitingTick(enterPhase *EnterPhaseInfo) {
        var enteredCount int
        for _, status := range enterPhase.PlayerStatuses {
                if status.HasEntered && !status.HasCancelled {
                        enteredCount++
                }
        }

        payload := &protocol.ArenaWaitingTickPayload{
                PeriodNo:       enterPhase.PeriodNo,
                RoomID:         enterPhase.RoomID,
                Countdown:      enterPhase.WaitingCountdown,
                EnteredPlayers: enteredCount,
        }

        msg := codec.MustNewMessage(protocol.MsgArenaWaitingTick, payload)

        // 发送给所有已进入的在线玩家
        b.server.clientsMu.RLock()
        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered || status.HasCancelled || status.IsRobot {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                client.SendMessage(msg)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()
}

// 🔧【新增】广播玩家加入消息给所有本期玩家
// 当玩家点击"进入"按钮后，广播此消息通知所有已进入的玩家
func (b *ArenaStatusBroadcaster) broadcastPlayerJoined(enterPhase *EnterPhaseInfo, newPlayerID uint64, isRobot bool) {
        // 获取新加入玩家的信息
        var newPlayer database.Player
        if err := database.DB().Where("id = ?", newPlayerID).First(&newPlayer).Error; err != nil {
                log.Printf("[ArenaStatus] 获取玩家信息失败: %v", err)
                return
        }

        // 收集所有已进入玩家列表
        var players []protocol.ArenaWaitingPlayer
        var enteredCount int
        for playerID, status := range enterPhase.PlayerStatuses {
                if status.HasEntered && !status.HasCancelled {
                        enteredCount++
                        var player database.Player
                        if err := database.DB().Where("id = ?", playerID).First(&player).Error; err == nil {
                                players = append(players, protocol.ArenaWaitingPlayer{
                                        PlayerID:   fmt.Sprintf("%d", playerID),
                                        PlayerName: player.Nickname,
                                        Avatar:     player.Avatar,
                                        IsRobot:    status.IsRobot,
                                        EnteredAt:  time.Now().UnixMilli(),
                                })
                        }
                }
        }

        // 构建新加入玩家信息
        newPlayerInfo := protocol.ArenaWaitingPlayer{
                PlayerID:   fmt.Sprintf("%d", newPlayerID),
                PlayerName: newPlayer.Nickname,
                Avatar:     newPlayer.Avatar,
                IsRobot:    isRobot,
                EnteredAt:  time.Now().UnixMilli(),
        }

        // 构建广播消息
        payload := &protocol.ArenaPlayerJoinedPayload{
                PeriodNo:       enterPhase.PeriodNo,
                RoomID:         enterPhase.RoomID,
                Player:         newPlayerInfo,
                EnteredPlayers: enteredCount,
                TotalPlayers:   len(enterPhase.PlayerStatuses),
                Players:        players,
                Message:        fmt.Sprintf("%s 进入了比赛", newPlayer.Nickname),
        }

        msg := codec.MustNewMessage(protocol.MsgArenaPlayerJoined, payload)

        log.Printf("[ArenaStatus] 📢 广播玩家加入: periodNo=%s, playerID=%d, playerName=%s, enteredCount=%d/%d",
                enterPhase.PeriodNo, newPlayerID, newPlayer.Nickname, enteredCount, len(enterPhase.PlayerStatuses))

        // 发送给所有已进入的在线玩家
        b.server.clientsMu.RLock()
        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered || status.HasCancelled || status.IsRobot {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                client.SendMessage(msg)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()
}

// 🔧【新增】广播分配阶段开始
func (b *ArenaStatusBroadcaster) broadcastAssigningStart(enterPhase *EnterPhaseInfo, roomConfig *database.RoomConfig, totalPlayers, totalTables int) {
        payload := &protocol.ArenaAssignStartPayload{
                PeriodNo:     enterPhase.PeriodNo,
                RoomID:       enterPhase.RoomID,
                TotalPlayers: totalPlayers,
                TotalTables:  totalTables,
                Countdown:    AssigningPhaseCountdown,
                Message:      fmt.Sprintf("正在分配玩家到 %d 桌，%d秒后进入游戏", totalTables, AssigningPhaseCountdown),
        }

        msg := codec.MustNewMessage(protocol.MsgArenaAssignStart, payload)

        // 发送给所有已进入的在线玩家
        b.server.clientsMu.RLock()
        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered || status.HasCancelled || status.IsRobot {
                        continue
                }
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                client.SendMessage(msg)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()
}

// 🔧【新增】检查桌子是否所有玩家都已进入
func (b *ArenaStatusBroadcaster) checkTableAllEntered(table *GameTable) bool {
        for _, playerID := range table.Players {
                if !table.PlayerStatuses[playerID] {
                        return false
                }
        }
        return true
}

// 🔧【新增】为桌子创建房间
func (b *ArenaStatusBroadcaster) createTableRoom(enterPhase *EnterPhaseInfo, table *GameTable, hostClient *Client) error {
        if b.server.roomManager == nil {
                return fmt.Errorf("roomManager 未初始化")
        }

        // 创建房间
        gameRoom, err := b.server.roomManager.CreateRoom(hostClient, enterPhase.RoomID)
        if err != nil {
                return fmt.Errorf("创建房间失败: %v", err)
        }

        // 🔧【关键修复】设置竞技场期号
        gameRoom.SetPeriodNo(enterPhase.PeriodNo)

        // 记录房间信息
        table.RoomCreated = true
        table.RoomCode = gameRoom.Code
        
        // 将机器人加入房间
        for _, robotID := range table.RobotPlayers {
                robotClient := NewRobotClient(robotID, b.server)
                if robotClient != nil {
                        if _, err := b.server.roomManager.JoinRoom(robotClient, gameRoom.Code); err == nil {
                                table.PlayerStatuses[robotID] = true // 机器人标记为已进入
                        }
                }
        }

        // 设置所有已进入玩家为准备状态
        gameRoom.SetAllPlayersReady()

        return nil
}

// 🔧【新增】发送 room_joined 给桌子中的玩家
func (b *ArenaStatusBroadcaster) sendRoomJoinedToTablePlayer(enterPhase *EnterPhaseInfo, table *GameTable, playerID uint64) {
        if table.RoomCode == "" {
                return
        }

        gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
        if gameRoom == nil {
                return
        }

        b.server.clientsMu.RLock()
        for _, client := range b.server.clients {
                if client.PlayerID == playerID {
                        players := gameRoom.GetAllPlayersInfo()
                        payload := &protocol.RoomJoinedPayload{
                                RoomCode:     gameRoom.Code,
                                Player:       gameRoom.GetPlayerInfo(client.GetID()),
                                Players:      players,
                                CreatorID:    gameRoom.CreatorID,
                                RoomCategory: gameRoom.RoomCategory, // 🔧【新增】房间分类
                                PeriodNo:     gameRoom.PeriodNo,     // 🔧【新增】期号
                        }
                        client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, payload))
                        break
                }
        }
        b.server.clientsMu.RUnlock()
}

// 🔧【新增】开始竞技场游戏
func (b *ArenaStatusBroadcaster) startArenaGame(gameRoom *room.Room) error {
        if gameRoom == nil {
                return fmt.Errorf("房间为空")
        }

        // 开始游戏
        if err := gameRoom.StartGame(); err != nil {
                return fmt.Errorf("开始游戏失败: %v", err)
        }
        
        // 触发游戏会话创建（发牌）
        if b.server.roomManager != nil {
                b.server.roomManager.TriggerOnGameStart(gameRoom)
        }
        
        return nil
}

// 🔧【新增】处理玩家点击"取消"按钮
// 取消 = 取消进入游戏，返还报名竞技币
func (b *ArenaStatusBroadcaster) HandlePlayerCancelEnter(periodNo string, playerID uint64) (int64, error) {
        b.enterPhasesMu.Lock()
        defer b.enterPhasesMu.Unlock()

        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                return 0, fmt.Errorf("进入阶段不存在或已结束")
        }

        status, exists := enterPhase.PlayerStatuses[playerID]
        if !exists {
                return 0, fmt.Errorf("玩家未报名此期号")
        }

        if status.HasEntered {
                return 0, fmt.Errorf("玩家已进入游戏，无法取消")
        }

        if status.HasCancelled {
                return 0, fmt.Errorf("玩家已取消")
        }

        // 标记为已取消
        status.HasCancelled = true

        // 🔧【修改】更新 Redis 中的取消状态（而不是删除），这样玩家不会再收到弹窗
        b.updatePlayerEnterPhaseCancelled(playerID)

        // 返还报名费并记录流水
        var refundAmount int64
        if status.SignupFee > 0 {
                err := database.UpdatePlayerArenaCoinWithLog(
                        playerID,
                        status.SignupFee,
                        database.ArenaCoinChangeRefund,
                        periodNo,
                        fmt.Sprintf("玩家取消进入返还，期号:%s", periodNo),
                )
                if err != nil {
                        return 0, err
                }
                refundAmount = status.SignupFee
        }

        return refundAmount, nil
}

// 🔧【新增】添加机器人到报名列表
// 机器人报名不需要竞技币
// 注意：机器人必须预先存在于 ddz_players 表中，server服务不创建机器人
func (b *ArenaStatusBroadcaster) fillRobotsToSignupList(periodNo string, roomID uint64, count int) []uint64 {
        if count <= 0 {
                return nil
        }
        
        // 🔧【新增】获取房间配置以读取初始金币
        var roomConfig database.RoomConfig
        if err := database.DB().Where("id = ?", roomID).First(&roomConfig).Error; err != nil {
                roomConfig.MinGold = 10000 // 默认值
        }
        initialGold := roomConfig.MinGold
        if initialGold <= 0 {
                initialGold = 10000
        }
        
        // 从数据库获取可用机器人（player_type=2 且 robot_status=0）
        var robots []database.Player
        err := database.DB().Where("player_type = ? AND robot_status = ?", 
                database.PlayerTypeRobot, database.RobotStatusIdle).
                Order("RAND()").
                Limit(count).
                Find(&robots).Error
        
        if err != nil || len(robots) == 0 {
                return nil
        }
        
        var robotIDs []uint64
        now := time.Now()
        
        for _, robot := range robots {
                // 添加机器人到Redis报名列表
                if b.server.redis != nil {
                        ctx := context.Background()
                        key := getSignupListKey(periodNo)
                        b.server.redis.SAdd(ctx, key, robot.ID)
                }
                
                // 更新机器人状态为竞技场中
                database.DB().Model(&database.Player{}).Where("id = ?", robot.ID).Updates(map[string]interface{}{
                        "robot_status":             database.RobotStatusInArena,
                        "robot_current_session_id": nil, // 暂时不设置session，等比赛开始时再设置
                        "robot_locked_at":          now,
                })
                
                // 🔧【关键修复】初始化机器人当期赛事金币
                database.InitArenaGold(periodNo, robot.ID, initialGold)
                
                robotIDs = append(robotIDs, robot.ID)
        }
        
        return robotIDs
}

// 🔧【新增】发送关闭弹窗消息给客户端
// 新期号开始时，关闭上一轮的进入游戏弹窗
func (b *ArenaStatusBroadcaster) sendCloseDialogNotification(roomID uint64, oldPeriodNo string) {
        // 构建关闭弹窗消息
        payload := protocol.ArenaCloseDialogPayload{
                RoomID:    roomID,
                PeriodNo:  oldPeriodNo,
                Reason:    "new_period_started",
                Message:   "新一轮已开始，上一轮的弹窗已关闭",
        }
        
        msg := codec.MustNewMessage(protocol.MsgArenaCloseDialog, payload)
        
        // 向所有连接的客户端发送（只有相关客户端会处理）
        b.server.clientsMu.RLock()
        sentCount := 0
        for _, client := range b.server.clients {
                if client.GetRoom() == "" {
                        client.SendMessage(msg)
                        sentCount++
                }
        }
        b.server.clientsMu.RUnlock()
}

// handlePhaseChange 处理阶段变化
func (b *ArenaStatusBroadcaster) handlePhaseChange(roomID uint64, status protocol.ArenaRoomStatus) {
        periodInfo := b.getPeriodCache(roomID)
        if periodInfo == nil {
                return
        }

        // 进入报名阶段时，更新数据库状态
        if status.Phase == int(PhaseSignup) {
                go func() {
                        // 使用期号直接更新状态（自动路由到正确的分表）
                        updates := map[string]interface{}{
                                "status": database.ArenaPeriodStatusSigningUp,
                        }
                        database.UpdateArenaPeriodByPeriodNo(status.PeriodNoStr, updates)
                }()
        }
}

// sendToNewClient 向新连接的客户端发送竞技场状态
// 🔧【修复】同时检查是否有待发送的比赛弹窗
func (b *ArenaStatusBroadcaster) sendToNewClient(playerID uint64) {
        log.Printf("[ArenaStatus] 📤 sendToNewClient 被调用, playerID=%d", playerID)

        b.server.clientsMu.RLock()
        var client *Client
        for _, c := range b.server.clients {
                if c.PlayerID == playerID {
                        client = c
                        break
                }
        }
        b.server.clientsMu.RUnlock()

        if client == nil {
                log.Printf("[ArenaStatus] ⚠️ sendToNewClient: 找不到玩家客户端, playerID=%d", playerID)
                return
        }

        currentRoom := client.GetRoom()
        if currentRoom != "" {
                log.Printf("[ArenaStatus] ⚠️ sendToNewClient: 玩家已在房间中, playerID=%d, room=%s", playerID, currentRoom)
                return
        }

        // 1. 发送竞技场状态
        arenas := b.calculateArenaStatus()
        log.Printf("[ArenaStatus] 📊 calculateArenaStatus 返回 %d 个竞技场", len(arenas))
        if len(arenas) > 0 {
                payload := protocol.ArenaStatusPayload{
                        Arenas: arenas,
                        Time:   time.Now().UnixMilli(),
                }
                msg := codec.MustNewMessage(protocol.MsgArenaStatus, payload)
                client.SendMessage(msg)
                log.Printf("[ArenaStatus] ✅ 已发送 arena_status 给玩家 %d, 共 %d 个竞技场", playerID, len(arenas))
        } else {
                log.Printf("[ArenaStatus] ⚠️ 没有竞技场数据，不发送 arena_status")
        }

        // 2. 🔧【新增】检查是否有待进入的比赛弹窗
        b.sendPendingMatchStartPopup(playerID, client)
        
        // 3. [Enhanced] Send comprehensive reconnect state
        b.SendArenaReconnectState(playerID, client)
}

// 🔧【新增】检查并发送待处理的比赛开始弹窗
// 当玩家重连时，检查是否有正在等待进入的比赛
// 🔧【重构】同时检查内存和 Redis，确保弹窗100%可靠
func (b *ArenaStatusBroadcaster) sendPendingMatchStartPopup(playerID uint64, client *Client) {
        log.Printf("[ArenaStatus] 🔍 sendPendingMatchStartPopup: 检查玩家 %d 是否有待进入的比赛", playerID)

        // 🔧【修复】先尝试从 Redis 恢复进入阶段状态（同时检查内存）
        enterPhase := b.getActiveEnterPhaseForPlayer(playerID)
        if enterPhase == nil {
                log.Printf("[ArenaStatus] 🔍 玩家 %d 没有待进入的比赛", playerID)
                return
        }

        status, exists := enterPhase.PlayerStatuses[playerID]
        if !exists || status.HasCancelled {
                log.Printf("[ArenaStatus] 🔍 玩家 %d 状态不匹配: exists=%v, HasCancelled=%v", playerID, exists, status.HasCancelled)
                return
        }

        log.Printf("[ArenaStatus] 🔄 玩家 %d 重连，发现待进入的比赛: periodNo=%s, HasEntered=%v", playerID, enterPhase.PeriodNo, status.HasEntered)

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 获取房间配置失败: %v", err)
                return
        }

        // 动态计算总轮次
        var rules tournament.EliminationRules
        if roomConfig.EliminationRules != "" {
                if err := json.Unmarshal([]byte(roomConfig.EliminationRules), &rules); err != nil {
                        rules = tournament.EliminationRules{60, 30, 18, 9, 3}
                }
        } else {
                rules = tournament.EliminationRules{60, 30, 18, 9, 3}
        }
        totalRounds := rules.GetTotalRounds(len(enterPhase.PlayerStatuses))

        // 计算剩余倒计时
        elapsed := time.Since(enterPhase.StartTime)
        remaining := enterPhase.Countdown - int(elapsed.Seconds())
        if remaining <= 0 {
                log.Printf("[ArenaStatus] ⚠️ 进入阶段已超时: playerID=%d, periodNo=%s", playerID, enterPhase.PeriodNo)
                return
        }

        // 构建弹窗消息
        payload := &protocol.ArenaMatchStartPayload{
                PeriodNo:      enterPhase.PeriodNo,
                RoomID:        enterPhase.RoomID,
                RoomName:      roomConfig.RoomName,
                RoomConfigID:  enterPhase.RoomID,
                SignupFee:     enterPhase.SignupFee,
                TotalPlayers:  len(enterPhase.PlayerStatuses),
                MatchDuration: PeriodTotalMinutes,
                MatchRounds:   totalRounds,
                Countdown:     remaining,
                StartTime:     enterPhase.StartTime.UnixMilli(),
                Message:       "比赛进行中，请点击进入！",
        }

        msg := codec.MustNewMessage(protocol.MsgArenaMatchStart, payload)
        client.SendMessage(msg)
        log.Printf("[ArenaStatus] ✅ 已向重连玩家 %d 重新发送比赛弹窗: periodNo=%s, remaining=%ds", playerID, enterPhase.PeriodNo, remaining)
}

// calculateArenaStatus 计算所有竞技场的状态
func (b *ArenaStatusBroadcaster) calculateArenaStatus() []protocol.ArenaRoomStatus {
        arenas := make([]protocol.ArenaRoomStatus, 0)

        // 尝试从Redis获取缓存的房间配置
        if b.server.redis != nil {
                ctx := context.Background()
                cached, err := b.server.redis.Get(ctx, "ddz:room_config:list").Result()
                if err == nil && cached != "" {
                        var configs []map[string]interface{}
                        if jsonErr := json.Unmarshal([]byte(cached), &configs); jsonErr == nil {
                                for _, c := range configs {
                                        roomCategory, _ := c["room_category"].(float64)
                                        if roomCategory != 2 {
                                                continue
                                        }

                                        roomID := uint64(c["id"].(float64))
                                        roomName, _ := c["room_name"].(string)
                                        roomType := 1
                                        if v, ok := c["room_type"].(float64); ok {
                                                roomType = int(v)
                                        }
                                        roomConfigID := uint64(0)
                                        if v, ok := c["id"].(float64); ok {
                                                roomConfigID = uint64(v)
                                        }

                                        var matchTimeRangesStr string
                                        switch v := c["matchTimeRanges"].(type) {
                                        case string:
                                                matchTimeRangesStr = v
                                        case []interface{}:
                                                if data, err := json.Marshal(v); err == nil {
                                                        matchTimeRangesStr = string(data)
                                                }
                                        }

                                        matchDuration := 0
                                        if v, ok := c["matchDuration"].(float64); ok {
                                                matchDuration = int(v)
                                        }

                                        status := b.calculateRoomArenaStatus(roomID, roomName, roomType, roomConfigID, matchTimeRangesStr, matchDuration)
                                        arenas = append(arenas, status)
                                }
                                return arenas
                        }
                }
        }

        // Redis获取失败，从数据库获取
        arenas = b.getArenaStatusFromDB()
        if len(arenas) > 0 && b.server.redis != nil {
                b.refreshRedisCacheFromDB()
        }

        return arenas
}

// calculateRoomArenaStatus 计算单个竞技场房间的状态
// 时间轮转机制：
// - 根据 matchDuration 配置确定每期时长
// - 前20%时间：准备阶段
// - 后80%时间：报名阶段
func (b *ArenaStatusBroadcaster) calculateRoomArenaStatus(roomID uint64, roomName string, roomType int, roomConfigID uint64, matchTimeRanges string, matchDuration int) protocol.ArenaRoomStatus {
        now := time.Now()
        status := protocol.ArenaRoomStatus{
                RoomID:   roomID,
                RoomName: roomName,
        }

        // 解析开赛时间段
        var timeRanges []MatchTimeRange
        if matchTimeRanges != "" {
                if err := json.Unmarshal([]byte(matchTimeRanges), &timeRanges); err != nil {
                        // 解析失败，保持 timeRanges 为空
                }
        }

        // 只有未设置比赛时间段或轮次时间时，才显示"暂未开放"
        if len(timeRanges) == 0 || matchDuration <= 0 {
                status.CanSignup = false
                status.PeriodNo = 0
                status.PeriodNoStr = ""
                status.Phase = 0
                status.Countdown = -1
                status.StatusText = "暂未开放"
                return status
        }

        // 🔧【修复】使用配置的 matchDuration，而不是固定值
        // 每期总时长（秒）= matchDuration（分钟）* 60
        periodTotalSeconds := matchDuration * 60
        // 准备阶段：固定60秒（1分钟）
        prepareSeconds := 60
        signupSeconds := periodTotalSeconds - prepareSeconds

        // 查找当前所在的时间段，或下一个即将开始的时间段
        var startTime, endTime time.Time
        var matchedRange *MatchTimeRange
        var isWaitingForStart = false // 是否在等待下一轮开始

        for _, tr := range timeRanges {
                st := parseTimeWithToday(tr.Start, now)
                et := parseTimeWithToday(tr.End, now)
                if (now.After(st) || now.Equal(st)) && now.Before(et) {
                        matchedRange = &tr
                        startTime = st
                        endTime = et
                        break
                }
                // 如果当前时间早于这个时间段的开始时间，记录下来
                if now.Before(st) {
                        if startTime.IsZero() || st.Before(startTime) {
                                startTime = st
                                endTime = et
                                isWaitingForStart = true
                        }
                }
        }

        // 如果当前时间在所有时间段之后，查找明天的第一个时间段
        if matchedRange == nil && startTime.IsZero() {
                // 尝试获取明天的第一个时间段
                tomorrow := now.AddDate(0, 0, 1)
                for _, tr := range timeRanges {
                        st := parseTimeWithToday(tr.Start, tomorrow)
                        et := parseTimeWithToday(tr.End, tomorrow)
                        if !st.IsZero() {
                                startTime = st
                                endTime = et
                                isWaitingForStart = true
                                break
                        }
                }
        }

        // 如果仍然没有找到时间段（理论上不会发生，因为前面已经检查了 timeRanges 不为空）
        if matchedRange == nil && startTime.IsZero() {
                status.CanSignup = false
                status.PeriodNo = 0
                status.PeriodNoStr = ""
                status.Phase = 0
                status.Countdown = -1
                status.StatusText = "暂未开放"
                return status
        }

        // 如果在等待下一个时间段开始（不在服务时间段内），显示"暂未开放"
        if isWaitingForStart {
                status.CanSignup = false
                status.PeriodNo = 0
                status.PeriodNoStr = ""
                status.Phase = 0
                status.Countdown = -1
                status.StatusText = "暂未开放"
                return status
        }

        // 计算从开赛时间到现在的秒数
        secondsSinceStart := int(now.Sub(startTime).Seconds())
        if secondsSinceStart < 0 {
                secondsSinceStart = 0
        }

        // 计算当前是第几期（从1开始）
        periodNo := secondsSinceStart/periodTotalSeconds + 1

        // 计算本期已经过去的秒数
        periodStartSeconds := (periodNo - 1) * periodTotalSeconds
        elapsedInSeconds := secondsSinceStart - periodStartSeconds

        // 计算本期结束时间
        periodEndTime := startTime.Add(time.Duration(periodStartSeconds+periodTotalSeconds) * time.Second)

        // 如果本期结束时间超出时间段，开始新一轮（从时间段结束倒推）
        if periodEndTime.After(endTime) {
                // 计算最后一个完整期号的结束时间
                totalPeriods := int(endTime.Sub(startTime).Seconds()) / periodTotalSeconds
                if totalPeriods <= 0 {
                        // 时间段内无法容纳完整的一期，显示准备中
                        status.CanSignup = false
                        status.PeriodNo = 0
                        status.PeriodNoStr = ""
                        status.Phase = int(PhasePrepare)
                        status.Countdown = int(endTime.Sub(now).Seconds())
                        status.StatusText = "准备中"
                        return status
                }
                // 重新计算为最后一个期号
                periodNo = totalPeriods
                periodStartSeconds = (periodNo - 1) * periodTotalSeconds
                elapsedInSeconds = secondsSinceStart - periodStartSeconds
                periodEndTime = startTime.Add(time.Duration(periodStartSeconds+periodTotalSeconds) * time.Second)
        }

        // 生成长格式期号
        periodNoStr := b.generatePeriodNo(roomID, roomType, periodNo)

        // 确定当前阶段
        var phase PhaseType
        var countdown int
        var canSignup bool
        var statusText string

        if elapsedInSeconds < prepareSeconds {
                // 准备阶段（前1分钟）
                phase = PhasePrepare
                countdown = prepareSeconds - elapsedInSeconds
                canSignup = false
                statusText = "准备中"
        } else {
                // 报名阶段（后4分钟）
                phase = PhaseSignup
                countdown = signupSeconds - (elapsedInSeconds - prepareSeconds)
                canSignup = true
                statusText = "报名中"
        }

        // 获取报名人数
        totalPlayers := b.getTotalPlayers(roomID, periodNoStr)

        status.PeriodNo = periodNo
        status.PeriodNoStr = periodNoStr
        status.Phase = int(phase)
        status.Countdown = countdown
        status.CanSignup = canSignup
        status.StatusText = statusText
        status.TotalPlayers = totalPlayers

        // 更新期号缓存
        b.updatePeriodCache(roomID, &PeriodInfo{
                PeriodNo:     periodNoStr,
                Phase:        phase,
                StartTime:    startTime.Add(time.Duration(periodStartSeconds) * time.Second),
                SignupEndTime: startTime.Add(time.Duration(periodStartSeconds+periodTotalSeconds) * time.Second),
                TotalPlayers: totalPlayers,
                LastUpdate:   now,
                RoomConfigID: roomConfigID,
        })

        return status
}

// =============================================
// Redis 缓存管理
// =============================================

// getSignupListKey 获取报名列表Redis key
func getSignupListKey(periodNo string) string {
        return fmt.Sprintf("ddz:arena:signup_list:%s", periodNo)
}

// getPeriodInfoKey 获取期号信息Redis key
func getPeriodInfoKey(roomID uint64) string {
        return fmt.Sprintf("ddz:arena:period:%d", roomID)
}

// 🔧【新增】getEnterPhaseKey 获取玩家进入阶段状态的 Redis key
func getEnterPhaseKey(playerID uint64) string {
        return fmt.Sprintf("ddz:arena:enter_phase:%d", playerID)
}

// 🔧【新增】EnterPhaseRedisData 进入阶段 Redis 数据结构
type EnterPhaseRedisData struct {
        PeriodNo     string `json:"period_no"`
        RoomID       uint64 `json:"room_id"`
        SignupFee    int64  `json:"signup_fee"`
        TableID      int    `json:"table_id"`
        Countdown    int    `json:"countdown"`
        StartTime    int64  `json:"start_time"`    // Unix timestamp
        HasCancelled bool   `json:"has_cancelled"` // 🔧【新增】玩家是否已取消
        HasEntered   bool   `json:"has_entered"`   // 🔧【新增】玩家是否已进入
}

// 🔧【新增】savePlayerEnterPhaseToRedis 保存玩家进入阶段状态到 Redis
func (b *ArenaStatusBroadcaster) savePlayerEnterPhaseToRedis(playerID uint64, data *EnterPhaseRedisData) error {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getEnterPhaseKey(playerID)

        jsonData, err := json.Marshal(data)
        if err != nil {
                return err
        }

        // 设置过期时间为进入阶段倒计时 + 30秒缓冲
        expiration := time.Duration(data.Countdown+30) * time.Second
        err = b.server.redis.Set(ctx, key, jsonData, expiration).Err()
        if err != nil {
                return err
        }

        log.Printf("[ArenaStatus] 💾 保存玩家进入阶段到Redis: playerID=%d, periodNo=%s", playerID, data.PeriodNo)
        return nil
}

// 🔧【新增】getPlayerEnterPhaseFromRedis 从 Redis 获取玩家进入阶段状态
func (b *ArenaStatusBroadcaster) getPlayerEnterPhaseFromRedis(playerID uint64) *EnterPhaseRedisData {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getEnterPhaseKey(playerID)

        data, err := b.server.redis.Get(ctx, key).Result()
        if err != nil {
                return nil
        }

        var result EnterPhaseRedisData
        if err := json.Unmarshal([]byte(data), &result); err != nil {
                return nil
        }

        return &result
}

// 🔧【新增】removePlayerEnterPhaseFromRedis 从 Redis 删除玩家进入阶段状态
func (b *ArenaStatusBroadcaster) removePlayerEnterPhaseFromRedis(playerID uint64) error {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getEnterPhaseKey(playerID)

        return b.server.redis.Del(ctx, key).Err()
}

// 🔧【新增】updatePlayerEnterPhaseCancelled 更新玩家取消状态到 Redis
func (b *ArenaStatusBroadcaster) updatePlayerEnterPhaseCancelled(playerID uint64) error {
        data := b.getPlayerEnterPhaseFromRedis(playerID)
        if data == nil {
                return nil
        }

        data.HasCancelled = true
        return b.savePlayerEnterPhaseToRedis(playerID, data)
}

// 🔧【新增】updatePlayerEnterPhaseEntered 更新玩家进入状态到 Redis
func (b *ArenaStatusBroadcaster) updatePlayerEnterPhaseEntered(playerID uint64) error {
        data := b.getPlayerEnterPhaseFromRedis(playerID)
        if data == nil {
                return nil
        }

        data.HasEntered = true
        return b.savePlayerEnterPhaseToRedis(playerID, data)
}

// getTotalPlayers 获取报名人数
func (b *ArenaStatusBroadcaster) getTotalPlayers(roomID uint64, periodNo string) int {
        // 优先从Redis获取
        if b.server.redis != nil {
                ctx := context.Background()
                key := getSignupListKey(periodNo)
                
                // 使用SCard获取集合大小
                count, err := b.server.redis.SCard(ctx, key).Result()
                if err == nil {
                        return int(count)
                }
        }

        // Redis不可用或出错，从数据库获取
        count, err := database.CountArenaPeriodPlayersByPeriodNo(periodNo)
        if err != nil {
                return 0
        }
        return int(count)
}

// updatePeriodCache 更新期号缓存
func (b *ArenaStatusBroadcaster) updatePeriodCache(roomID uint64, info *PeriodInfo) {
        b.periodCacheMu.Lock()
        defer b.periodCacheMu.Unlock()
        b.periodCache[roomID] = info
}

// getPeriodCache 获取期号缓存
func (b *ArenaStatusBroadcaster) getPeriodCache(roomID uint64) *PeriodInfo {
        b.periodCacheMu.RLock()
        defer b.periodCacheMu.RUnlock()
        return b.periodCache[roomID]
}

// 🔧【新增】forceRefreshPeriodCache 强制刷新指定房间的期号缓存
// 这确保报名时使用的期号与广播时一致
func (b *ArenaStatusBroadcaster) forceRefreshPeriodCache(roomID uint64) {
        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(roomID)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 强制刷新缓存失败，无法获取房间配置: roomID=%d, err=%v", roomID, err)
                return
        }

        // 实时计算该房间的状态（会更新缓存）
        status := b.calculateRoomArenaStatus(
                roomID,
                roomConfig.RoomName,
                int(roomConfig.RoomType),
                roomID,
                roomConfig.MatchTimeRanges,
                roomConfig.MatchRoundDuration,
        )

        log.Printf("[ArenaStatus] 🔄 强制刷新期号缓存: roomID=%d, periodNoStr=%s, phase=%d, totalPlayers=%d",
                roomID, status.PeriodNoStr, status.Phase, status.TotalPlayers)
}

// AddPlayerToSignupList 添加玩家到报名列表（Redis）
func (b *ArenaStatusBroadcaster) AddPlayerToSignupList(periodNo string, playerID uint64) error {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getSignupListKey(periodNo)

        // 使用SISMEMBER检查是否已在集合中（O(1)复杂度，比LRange更高效）
        isMember, err := b.server.redis.SIsMember(ctx, key, playerID).Result()
        if err == nil && isMember {
                return fmt.Errorf("玩家已在报名列表中")
        }

        // 使用SAdd添加到集合（自动去重，更高效）
        if err := b.server.redis.SAdd(ctx, key, playerID).Err(); err != nil {
                return err
        }

        // 设置过期时间（10分钟后过期，每期只有5分钟，预留缓冲）
        b.server.redis.Expire(ctx, key, 10*time.Minute)

        log.Printf("[ArenaSignup] 玩家 %d 加入报名列表，期号=%s", playerID, periodNo)
        return nil
}

// RemovePlayerFromSignupList 从报名列表移除玩家
func (b *ArenaStatusBroadcaster) RemovePlayerFromSignupList(periodNo string, playerID uint64) error {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getSignupListKey(periodNo)

        // 从集合中移除玩家ID
        err := b.server.redis.SRem(ctx, key, playerID).Err()
        if err != nil {
                return err
        }

        log.Printf("[ArenaSignup] 玩家 %d 离开报名列表，期号=%s", playerID, periodNo)
        return nil
}

// ClearSignupList 清空报名列表
func (b *ArenaStatusBroadcaster) ClearSignupList(periodNo string) error {
        if b.server.redis == nil {
                return nil
        }

        ctx := context.Background()
        key := getSignupListKey(periodNo)

        err := b.server.redis.Del(ctx, key).Err()
        if err != nil {
                return err
        }

        log.Printf("[ArenaSignup] 清空报名列表，期号=%s", periodNo)
        return nil
}

// GetSignupList 获取报名列表
func (b *ArenaStatusBroadcaster) GetSignupList(periodNo string) []uint64 {
        if b.server.redis == nil {
                log.Printf("[ArenaStatus] ⚠️ Redis 不可用，无法获取报名列表: periodNo=%s", periodNo)
                return nil
        }

        ctx := context.Background()
        key := getSignupListKey(periodNo)

        // 🔧【调试】记录查询的 key
        log.Printf("[ArenaStatus] 🔍 查询报名列表: key=%s", key)

        // 使用SMembers获取集合所有成员
        result, err := b.server.redis.SMembers(ctx, key).Result()
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 获取报名列表失败: periodNo=%s, err=%v", periodNo, err)
                return nil
        }

        players := make([]uint64, 0, len(result))
        for _, s := range result {
                if id, err := strconv.ParseUint(s, 10, 64); err == nil {
                        players = append(players, id)
                }
        }

        // 🔧【调试】记录查询结果
        log.Printf("[ArenaStatus] 📋 报名列表查询结果: periodNo=%s, count=%d, players=%v", periodNo, len(players), players)

        return players
}

// =============================================
// 辅助函数
// =============================================

// parseTimeWithToday 使用今天的日期解析时间字符串
func parseTimeWithToday(timeStr string, now time.Time) time.Time {
        parts := strings.Split(timeStr, ":")
        if len(parts) != 2 {
                return now
        }
        hour, _ := strconv.Atoi(parts[0])
        minute, _ := strconv.Atoi(parts[1])
        return time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())
}

// refreshRedisCacheFromDB 从数据库刷新Redis缓存
func (b *ArenaStatusBroadcaster) refreshRedisCacheFromDB() {
        if b.server.redis == nil {
                return
        }

        db := database.DB()
        if db == nil {
                return
        }

        var configs []database.RoomConfig
        if err := db.Where("status = 1 AND deleted_at IS NULL").Order("sort_order ASC").Find(&configs).Error; err != nil {
                log.Printf("[ArenaStatus] 查询房间配置失败: %v", err)
                return
        }

        type CacheRoomConfig struct {
                ID                 uint   `json:"id"`
                RoomName           string `json:"room_name"`
                RoomType           int    `json:"room_type"`
                RoomCategory       int    `json:"room_category"`
                BaseScore          int    `json:"base_score"`
                Multiplier         int    `json:"multiplier"`
                MinGold            int64  `json:"min_gold"`
                MaxGold            int64  `json:"max_gold"`
                MinArenaCoin       int64  `json:"min_arena_coin"`
                MaxArenaCoin       int64  `json:"max_arena_coin"`
                EntryGold          int64  `json:"entry_gold"`
                BgImageNum         int    `json:"bg_image_num"`
                Description        string `json:"description"`
                Status             int    `json:"status"`
                SortOrder          int    `json:"sort_order"`
                MatchTimeRanges    string `json:"matchTimeRanges"`
                MatchRoundDuration int    `json:"matchDuration"`
                MatchRoundCount    int    `json:"matchRoundCount"`
                MaxPlayers         int    `json:"maxPlayers"`
                MinPlayers         int    `json:"minPlayers"`
                ChampionRewardID   uint   `json:"championRewardId"`
        }

        cacheConfigs := make([]CacheRoomConfig, 0, len(configs))
        for _, c := range configs {
                cacheConfigs = append(cacheConfigs, CacheRoomConfig{
                        ID:                 uint(c.ID),
                        RoomName:           c.RoomName,
                        RoomType:           int(c.RoomType),
                        RoomCategory:       int(c.RoomCategory),
                        BaseScore:          c.BaseScore,
                        Multiplier:         c.Multiplier,
                        MinGold:            c.MinGold,
                        MaxGold:            c.MaxGold,
                        MinArenaCoin:       c.MinArenaCoin,
                        MaxArenaCoin:       c.MaxArenaCoin,
                        EntryGold:          c.MinGold,
                        BgImageNum:         int(c.BgImageNum),
                        Description:        c.Description,
                        Status:             int(c.Status),
                        SortOrder:          c.SortOrder,
                        MatchTimeRanges:    c.MatchTimeRanges,
                        MatchRoundDuration: c.MatchRoundDuration,
                        MatchRoundCount:    c.MatchRoundCount,
                        MaxPlayers:         c.MaxPlayers,
                        MinPlayers:         c.MinPlayers,
                        ChampionRewardID:   c.ChampionRewardID,
                })
        }

        data, err := json.Marshal(cacheConfigs)
        if err != nil {
                log.Printf("[ArenaStatus] 序列化房间配置失败: %v", err)
                return
        }

        ctx := context.Background()
        if err := b.server.redis.Set(ctx, "ddz:room_config:list", string(data), 24*time.Hour).Err(); err != nil {
                log.Printf("[ArenaStatus] 写入Redis失败: %v", err)
        } else {
                log.Printf("[ArenaStatus] 已将%d条房间配置写入Redis缓存", len(cacheConfigs))
        }
}

// getArenaStatusFromDB 从数据库获取竞技场状态
func (b *ArenaStatusBroadcaster) getArenaStatusFromDB() []protocol.ArenaRoomStatus {
        arenas := make([]protocol.ArenaRoomStatus, 0)

        db := database.DB()
        if db == nil {
                return arenas
        }

        var configs []database.RoomConfig
        if err := db.Where("room_category = ? AND status = ?", 2, 1).Find(&configs).Error; err != nil {
                log.Printf("[ArenaStatus] 查询竞技场配置失败: %v", err)
                return arenas
        }

        for _, config := range configs {
                status := b.calculateRoomArenaStatus(
                        config.ID,
                        config.RoomName,
                        int(config.RoomType),
                        config.ID,
                        config.MatchTimeRanges,
                        config.MatchRoundDuration,
                )
                arenas = append(arenas, status)
        }

        return arenas
}

// GetCurrentStatus 获取当前竞技场状态（供外部调用）
func (b *ArenaStatusBroadcaster) GetCurrentStatus() []protocol.ArenaRoomStatus {
        return b.calculateArenaStatus()
}

// GetCurrentPeriodNo 获取当前期号（供外部调用）
func (b *ArenaStatusBroadcaster) GetCurrentPeriodNo(roomID uint64) string {
        info := b.getPeriodCache(roomID)
        if info != nil {
                return info.PeriodNo
        }
        return ""
}

// GetCurrentPeriodInfo 获取当前期号信息（实现 types.ArenaProvider 接口）
// 🔧【修复】报名时先强制刷新缓存，确保期号与广播时一致
func (b *ArenaStatusBroadcaster) GetCurrentPeriodInfo(roomID uint64) *types.PeriodInfo {
        // 🔧【关键修复】先强制刷新该房间的期号缓存
        // 这确保报名使用的期号与广播时一致，避免"报名人数变0"的问题
        b.forceRefreshPeriodCache(roomID)

        info := b.getPeriodCache(roomID)
        if info == nil {
                return nil
        }
        return &types.PeriodInfo{
                PeriodNo:     info.PeriodNo,
                Phase:        types.PhaseType(info.Phase),
                TotalPlayers: info.TotalPlayers,
                RoomConfigID: info.RoomConfigID,
        }
}

// GetCurrentPeriodInfoLocal 获取当前期号信息（本地类型，供内部调用）
func (b *ArenaStatusBroadcaster) GetCurrentPeriodInfoLocal(roomID uint64) *PeriodInfo {
        return b.getPeriodCache(roomID)
}

// =============================================
// 实现 types.ArenaQueueProvider 接口
// =============================================

// PushSignupLog 推送报名日志
func (b *ArenaStatusBroadcaster) PushSignupLog(periodNo string, roomID, playerID uint64, signupFee, balanceBefore, balanceAfter int64) bool {
        return b.queue.PushSignupLog(SignupLogData{
                PeriodNo:      periodNo,
                RoomID:        roomID,
                PlayerID:      playerID,
                SignupFee:     signupFee,
                BalanceBefore: balanceBefore,
                BalanceAfter:  balanceAfter,
        })
}

// PushCancelLog 推送取消日志
func (b *ArenaStatusBroadcaster) PushCancelLog(periodNo string, roomID, playerID uint64, signupFee, balanceBefore, balanceAfter int64) bool {
        return b.queue.PushCancelLog(CancelLogData{
                PeriodNo:      periodNo,
                RoomID:        roomID,
                PlayerID:      playerID,
                SignupFee:     signupFee,
                BalanceBefore: balanceBefore,
                BalanceAfter:  balanceAfter,
        })
}

// =============================================
// 立即广播方法（报名/取消报名后立即触发）
// =============================================

// ForceBroadcastNow 立即广播竞技场状态（不等待定时器）
// 用于报名/取消报名后立即通知所有客户端
func (b *ArenaStatusBroadcaster) ForceBroadcastNow() {
        currentStatus := b.calculateArenaStatus()
        if len(currentStatus) == 0 {
                return
        }

        // 更新缓存状态
        b.lastStatusMu.Lock()
        for _, status := range currentStatus {
                b.lastStatus[status.RoomID] = &status
        }
        b.lastStatusMu.Unlock()

        // 立即广播
        b.server.BroadcastArenaStatus(currentStatus)
        b.lastBroadcastTime = time.Now()

        log.Printf("[ArenaStatus] 立即广播竞技场状态，共 %d 个房间", len(currentStatus))
}

// ForceBroadcastRoomNow 立即广播指定房间的状态
// roomID: 指定要广播的房间ID，如果为0则广播所有房间
func (b *ArenaStatusBroadcaster) ForceBroadcastRoomNow(roomID uint64) {
        log.Printf("🔔 [ForceBroadcastRoomNow] 开始广播 roomID=%d", roomID)
        
        // 🔧 调试：直接检查 Redis 中所有报名列表的 key
        if b.server.redis != nil {
                ctx := context.Background()
                keys, err := b.server.redis.Keys(ctx, "ddz:arena:signup_list:*").Result()
                if err == nil {
                        log.Printf("🔑 [ForceBroadcastRoomNow] Redis中所有报名列表key: %v", keys)
                        for _, key := range keys {
                                count, _ := b.server.redis.SCard(ctx, key).Result()
                                log.Printf("🔑 [ForceBroadcastRoomNow] key=%s, count=%d", key, count)
                        }
                }
        }
        
        if roomID == 0 {
                b.ForceBroadcastNow()
                return
        }

        // 获取所有状态
        currentStatus := b.calculateArenaStatus()
        if len(currentStatus) == 0 {
                log.Printf("⚠️ [ForceBroadcastRoomNow] 没有获取到任何房间状态")
                return
        }

        // 找到指定房间的状态
        var targetStatus *protocol.ArenaRoomStatus
        for i := range currentStatus {
                if currentStatus[i].RoomID == roomID {
                        targetStatus = &currentStatus[i]
                        break
                }
        }

        if targetStatus == nil {
                log.Printf("⚠️ [ForceBroadcastRoomNow] 未找到房间 %d 的状态", roomID)
                return
        }

        log.Printf("📊 [ForceBroadcastRoomNow] 房间 %d 状态: periodNo=%s, periodNoStr=%s, totalPlayers=%d", 
                roomID, targetStatus.PeriodNo, targetStatus.PeriodNoStr, targetStatus.TotalPlayers)

        // 更新缓存状态
        b.lastStatusMu.Lock()
        b.lastStatus[roomID] = targetStatus
        b.lastStatusMu.Unlock()

        // 广播所有房间状态（保持一致性）
        log.Printf("📡 [ForceBroadcastRoomNow] 准备广播 %d 个房间状态:", len(currentStatus))
        for i := range currentStatus {
                log.Printf("📡 [ForceBroadcastRoomNow] 房间 %d: periodNoStr=%s, phase=%d, totalPlayers=%d",
                        currentStatus[i].RoomID, currentStatus[i].PeriodNoStr, currentStatus[i].Phase, currentStatus[i].TotalPlayers)
        }
        b.server.BroadcastArenaStatus(currentStatus)
        b.lastBroadcastTime = time.Now()

        log.Printf("✅ [ForceBroadcastRoomNow] 广播完成，房间 %d 报名人数=%d", roomID, targetStatus.TotalPlayers)
}

// 🔧【新增】OnPlayerReconnect 处理玩家重连时的竞技场状态恢复
// 当玩家断线重连时，检查是否有未处理的竞技场进入阶段，并发送相应的弹窗消息
func (b *ArenaStatusBroadcaster) OnPlayerReconnect(playerID uint64, client types.ClientInterface) {
        b.enterPhasesMu.RLock()
        defer b.enterPhasesMu.RUnlock()

        // 遍历所有进入阶段，查找该玩家
        for periodNo, enterPhase := range b.enterPhases {
                status, exists := enterPhase.PlayerStatuses[playerID]
                if !exists {
                        continue
                }

                // 玩家已报名但未进入且未取消
                if !status.HasEntered && !status.HasCancelled && !status.IsRobot {
                        log.Printf("[ArenaStatus] 🔄 玩家 %d 重连，恢复竞技场弹窗: periodNo=%s", playerID, periodNo)

                        // 获取房间配置
                        roomConfig, err := database.GetRoomConfigByID(enterPhase.RoomID)
                        if err != nil {
                                log.Printf("[ArenaStatus] ⚠️ 获取房间配置失败: %v", err)
                                continue
                        }

                        // 计算剩余倒计时
                        elapsed := time.Since(enterPhase.StartTime)
                        remaining := enterPhase.Countdown - int(elapsed.Seconds())
                        if remaining < 0 {
                                remaining = 0
                        }

                        // 计算总轮次
                        var rules tournament.EliminationRules
                        if roomConfig.EliminationRules != "" {
                                if err := json.Unmarshal([]byte(roomConfig.EliminationRules), &rules); err != nil {
                                        rules = tournament.EliminationRules{60, 30, 18, 9, 3}
                                }
                        } else {
                                rules = tournament.EliminationRules{60, 30, 18, 9, 3}
                        }
                        totalRounds := rules.GetTotalRounds(len(enterPhase.PlayerStatuses))

                        // 发送弹窗消息
                        payload := &protocol.ArenaMatchStartPayload{
                                PeriodNo:      periodNo,
                                RoomID:        enterPhase.RoomID,
                                RoomName:      roomConfig.RoomName,
                                RoomConfigID:  enterPhase.RoomID,
                                SignupFee:     enterPhase.SignupFee,
                                TotalPlayers:  len(enterPhase.PlayerStatuses),
                                MatchDuration: PeriodTotalMinutes,
                                MatchRounds:   totalRounds,
                                Countdown:     remaining,
                StartTime:     enterPhase.StartTime.UnixMilli(),
                                Message:       "比赛正在进行中，请点击进入！",
                        }

                        client.SendMessage(codec.MustNewMessage(protocol.MsgArenaMatchStart, payload))
                        log.Printf("[ArenaStatus] ✅ 已发送竞技场弹窗给重连玩家 %d, periodNo=%s, countdown=%d", playerID, periodNo, remaining)
                        return // 只处理第一个找到的进入阶段
                }
        }
}

// ============================================================
// 🔧【新增】Redis 持久化相关函数
// ============================================================

// saveEnterPhaseToRedis 保存进入阶段信息到 Redis
func (b *ArenaStatusBroadcaster) saveEnterPhaseToRedis(enterPhase *EnterPhaseInfo) {
        if b.server.redis == nil {
                log.Printf("[ArenaStatus] ⚠️ Redis 未初始化，跳过持久化进入阶段信息")
                return
        }

        // 转换为可序列化的格式
        data := b.enterPhaseToRedisFormat(enterPhase)

        jsonData, err := json.Marshal(data)
        if err != nil {
                log.Printf("[ArenaStatus] ⚠️ 序列化进入阶段信息失败: %v", err)
                return
        }

        key := EnterPhaseRedisKeyPrefix + enterPhase.PeriodNo
        // 设置过期时间为倒计时 + 5分钟（确保不会过早过期）
        expireTime := time.Duration(enterPhase.Countdown+300) * time.Second

        ctx := context.Background()
        if err := b.server.redis.Set(ctx, key, jsonData, expireTime).Err(); err != nil {
                log.Printf("[ArenaStatus] ⚠️ 保存进入阶段信息到 Redis 失败: %v", err)
        } else {
                log.Printf("[ArenaStatus] ✅ 已保存进入阶段信息到 Redis: periodNo=%s", enterPhase.PeriodNo)
        }
}

// getEnterPhaseFromRedis 从 Redis 获取进入阶段信息
func (b *ArenaStatusBroadcaster) getEnterPhaseFromRedis(periodNo string) *EnterPhaseInfo {
        if b.server.redis == nil {
                return nil
        }

        key := EnterPhaseRedisKeyPrefix + periodNo
        ctx := context.Background()

        jsonData, err := b.server.redis.Get(ctx, key).Bytes()
        if err != nil {
                return nil
        }

        var data EnterPhaseInfoForRedis
        if err := json.Unmarshal(jsonData, &data); err != nil {
                log.Printf("[ArenaStatus] ⚠️ 反序列化进入阶段信息失败: %v", err)
                return nil
        }

        return b.redisFormatToEnterPhase(&data)
}

// deleteEnterPhaseFromRedis 从 Redis 删除进入阶段信息
func (b *ArenaStatusBroadcaster) deleteEnterPhaseFromRedis(periodNo string) {
        if b.server.redis == nil {
                return
        }

        key := EnterPhaseRedisKeyPrefix + periodNo
        ctx := context.Background()

        if err := b.server.redis.Del(ctx, key).Err(); err != nil {
                log.Printf("[ArenaStatus] ⚠️ 删除 Redis 进入阶段信息失败: %v", err)
        } else {
                log.Printf("[ArenaStatus] ✅ 已删除 Redis 进入阶段信息: periodNo=%s", periodNo)
        }
}

// enterPhaseToRedisFormat 将 EnterPhaseInfo 转换为可序列化的格式
func (b *ArenaStatusBroadcaster) enterPhaseToRedisFormat(enterPhase *EnterPhaseInfo) *EnterPhaseInfoForRedis {
        data := &EnterPhaseInfoForRedis{
                PeriodNo:       enterPhase.PeriodNo,
                RoomID:         enterPhase.RoomID,
                SignupFee:      enterPhase.SignupFee,
                PlayerStatuses: enterPhase.PlayerStatuses,
                StartTime:      enterPhase.StartTime,
                Countdown:      enterPhase.Countdown,
                Tables:         make([]*GameTableForRedis, 0, len(enterPhase.Tables)),
                PlayerToTable:  enterPhase.PlayerToTable,
        }

        for _, table := range enterPhase.Tables {
                data.Tables = append(data.Tables, &GameTableForRedis{
                        TableID:        table.TableID,
                        RoomCode:       table.RoomCode,
                        HostPlayerID:   table.HostPlayerID,
                        Players:        table.Players,
                        RobotPlayers:   table.RobotPlayers,
                        RoomCreated:    table.RoomCreated,
                        AllEntered:     table.AllEntered,
                        PlayerStatuses: table.PlayerStatuses,
                })
        }

        return data
}

// redisFormatToEnterPhase 将 Redis 格式转换为 EnterPhaseInfo
func (b *ArenaStatusBroadcaster) redisFormatToEnterPhase(data *EnterPhaseInfoForRedis) *EnterPhaseInfo {
        enterPhase := &EnterPhaseInfo{
                PeriodNo:       data.PeriodNo,
                RoomID:         data.RoomID,
                SignupFee:      data.SignupFee,
                PlayerStatuses: data.PlayerStatuses,
                StartTime:      data.StartTime,
                Countdown:      data.Countdown,
                Tables:         make([]*GameTable, 0, len(data.Tables)),
                PlayerToTable:  data.PlayerToTable,
        }

        for _, table := range data.Tables {
                enterPhase.Tables = append(enterPhase.Tables, &GameTable{
                        TableID:        table.TableID,
                        RoomCode:       table.RoomCode,
                        HostPlayerID:   table.HostPlayerID,
                        Players:        table.Players,
                        RobotPlayers:   table.RobotPlayers,
                        RoomCreated:    table.RoomCreated,
                        AllEntered:     table.AllEntered,
                        PlayerStatuses: table.PlayerStatuses,
                })
        }

        return enterPhase
}

// getActiveEnterPhaseForPlayer 从 Redis 获取玩家的活跃进入阶段
func (b *ArenaStatusBroadcaster) getActiveEnterPhaseForPlayer(playerID uint64) *EnterPhaseInfo {
        // 先检查内存中的进入阶段
        b.enterPhasesMu.RLock()
        for _, enterPhase := range b.enterPhases {
                if status, exists := enterPhase.PlayerStatuses[playerID]; exists {
                        if !status.HasEntered && !status.HasCancelled && !status.IsRobot {
                                b.enterPhasesMu.RUnlock()
                                return enterPhase
                        }
                }
        }
        b.enterPhasesMu.RUnlock()

        // 如果内存中没有，尝试从 Redis 恢复
        // 这里需要扫描所有可能的进入阶段（通过 Redis SCAN 命令）
        if b.server.redis != nil {
                ctx := context.Background()
                iter := b.server.redis.Scan(ctx, 0, EnterPhaseRedisKeyPrefix+"*", 0).Iterator()
                for iter.Next(ctx) {
                        key := iter.Val()
                        periodNo := strings.TrimPrefix(key, EnterPhaseRedisKeyPrefix)

                        enterPhase := b.getEnterPhaseFromRedis(periodNo)
                        if enterPhase != nil {
                                if status, exists := enterPhase.PlayerStatuses[playerID]; exists {
                                        if !status.HasEntered && !status.HasCancelled && !status.IsRobot {
                                                // 检查是否过期
                                                elapsed := time.Since(enterPhase.StartTime)
                                                remaining := enterPhase.Countdown - int(elapsed.Seconds())
                                                if remaining > 0 {
                                                        // 恢复到内存中
                                                        b.enterPhasesMu.Lock()
                                                        if _, exists := b.enterPhases[periodNo]; !exists {
                                                                b.enterPhases[periodNo] = enterPhase
                                                                // 重新启动定时器
                                                                enterPhase.timer = time.AfterFunc(time.Duration(remaining)*time.Second, func() {
                                                                        b.handleEnterPhaseTimeout(periodNo)
                                                                })
                                                        }
                                                        b.enterPhasesMu.Unlock()
                                                        return enterPhase
                                                }
                                        }
                                }
                        }
                }
        }

        return nil
}

// =============================================
// [Enhanced] Enter Phase Timeout Handling
// =============================================

// handleEnterPhaseTimeoutImproved handles timeout with better table management
// Ensures tables with entered players can start games even when some timeout
func (b *ArenaStatusBroadcaster) handleEnterPhaseTimeoutImproved(periodNo string) {
        b.enterPhasesMu.Lock()
        enterPhase, exists := b.enterPhases[periodNo]
        if !exists {
                b.enterPhasesMu.Unlock()
                return
        }
        
        // Stop timer
        if enterPhase.timer != nil {
                enterPhase.timer.Stop()
        }
        delete(b.enterPhases, periodNo)
        b.enterPhasesMu.Unlock()

        // Delete from Redis
        b.deleteEnterPhaseFromRedis(periodNo)

        // Process timeout players
        var timeoutPlayers []uint64
        var enteredPlayers []uint64
        
        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered && !status.HasCancelled {
                        timeoutPlayers = append(timeoutPlayers, playerID)
                } else if status.HasEntered && !status.HasCancelled {
                        enteredPlayers = append(enteredPlayers, playerID)
                }
        }

        log.Printf("[ArenaStatus] Timeout handling: periodNo=%s, timeout=%d, entered=%d", 
                periodNo, len(timeoutPlayers), len(enteredPlayers))

        // Refund timeout players
        for _, playerID := range timeoutPlayers {
                status := enterPhase.PlayerStatuses[playerID]
                if status.SignupFee > 0 {
                        database.UpdatePlayerArenaCoinWithLog(
                                playerID,
                                status.SignupFee,
                                database.ArenaCoinChangeRefund,
                                periodNo,
                                fmt.Sprintf("Enter phase timeout refund, period:%s", periodNo),
                        )
                }
                b.updatePlayerEnterPhaseCancelled(playerID)
        }

        // [Key Fix] For tables with entered players, create rooms and start games
        // Group entered players by table
        tableEnteredPlayers := make(map[int][]uint64)
        for _, playerID := range enteredPlayers {
                if tableID := enterPhase.PlayerToTable[playerID]; tableID > 0 {
                        tableEnteredPlayers[tableID] = append(tableEnteredPlayers[tableID], playerID)
                }
        }

        // Process each table
        for tableID, players := range tableEnteredPlayers {
                if len(players) == 0 {
                        continue
                }
                
                // Find the table
                var table *GameTable
                for _, t := range enterPhase.Tables {
                        if t.TableID == tableID {
                                table = t
                                break
                        }
                }
                
                if table == nil {
                        log.Printf("[ArenaStatus] Warning: table %d not found", tableID)
                        continue
                }

                // Check if room already created
                if table.RoomCreated && table.RoomCode != "" {
                        gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
                        if gameRoom != nil && !table.AllEntered {
                                // Start game with available players
                                table.AllEntered = true
                                b.startArenaGame(gameRoom)
                                log.Printf("[ArenaStatus] Started game for existing room: table=%d, roomCode=%s", 
                                        tableID, table.RoomCode)
                        }
                } else if len(players) >= 1 {
                        // Create new room for entered players
                        // Fill with robots if needed
                        b.createRoomForTableWithRobots(enterPhase, table, players)
                }
        }

        // Send close dialog notification
        b.sendCloseDialogNotification(enterPhase.RoomID, periodNo)
}

// createRoomForTableWithRobots creates a room for a table, filling with robots if needed
func (b *ArenaStatusBroadcaster) createRoomForTableWithRobots(enterPhase *EnterPhaseInfo, table *GameTable, enteredPlayers []uint64) {
        if b.server.roomManager == nil {
                return
        }

        // Get player info
        var players []database.Player
        database.DB().Where("id IN ?", enteredPlayers).Find(&players)
        playerMap := make(map[uint64]*database.Player)
        for i := range players {
                playerMap[players[i].ID] = &players[i]
        }

        // Collect online clients
        onlineClients := make([]*Client, 0)
        b.server.clientsMu.RLock()
        for _, playerID := range enteredPlayers {
                for _, client := range b.server.clients {
                        if client.PlayerID == playerID && client.GetRoom() == "" {
                                onlineClients = append(onlineClients, client)
                                break
                        }
                }
        }
        b.server.clientsMu.RUnlock()

        // Need robots if less than 3 players
        needRobots := 3 - len(enteredPlayers)
        var robotClients []*RobotClient
        
        if needRobots > 0 {
                robots := b.getIdleRobots(needRobots)
                for _, robotID := range robots {
                        robotClient := NewRobotClient(robotID, b.server)
                        if robotClient != nil {
                                robotClients = append(robotClients, robotClient)
                                // Add to player map
                                var robot database.Player
                                if err := database.DB().First(&robot, robotID).Error; err == nil {
                                        playerMap[robotID] = &robot
                                }
                        }
                }
        }

        // Select host (prefer real player)
        var hostClient types.ClientInterface
        if len(onlineClients) > 0 {
                hostClient = onlineClients[0]
        } else if len(robotClients) > 0 {
                hostClient = robotClients[0]
        } else {
                log.Printf("[ArenaStatus] No available host for table %d", table.TableID)
                return
        }

        // Create room
        gameRoom, err := b.server.roomManager.CreateRoom(hostClient, enterPhase.RoomID)
        if err != nil {
                log.Printf("[ArenaStatus] Failed to create room for table %d: %v", table.TableID, err)
                return
        }

        gameRoom.SetPeriodNo(enterPhase.PeriodNo)
        table.RoomCreated = true
        table.RoomCode = gameRoom.Code

        // Join other real players
        for i, client := range onlineClients {
                if i > 0 { // Skip host (already joined)
                        b.server.roomManager.JoinRoom(client, gameRoom.Code)
                }
        }

        // Join robots
        for i, robotClient := range robotClients {
                if !(len(onlineClients) == 0 && i == 0) { // Skip if robot is host
                        b.server.roomManager.JoinRoom(robotClient, gameRoom.Code)
                }
        }

        // Set all ready and start
        gameRoom.SetAllPlayersReady()
        
        if err := gameRoom.StartGame(); err != nil {
                log.Printf("[ArenaStatus] Failed to start game: %v", err)
                return
        }
        
        if b.server.roomManager != nil {
                b.server.roomManager.TriggerOnGameStart(gameRoom)
        }

        log.Printf("[ArenaStatus] Created and started game for table %d: roomCode=%s, players=%d, robots=%d",
                table.TableID, gameRoom.Code, len(onlineClients), len(robotClients))
}

// =============================================
// [Enhanced] Server Recovery
// =============================================

// RestoreInProgressTournaments restores tournaments that were in progress when server crashed
// Should be called on server startup
func (b *ArenaStatusBroadcaster) RestoreInProgressTournaments() {
        if b.server.redis == nil {
                log.Printf("[ArenaStatus] Redis not available, skip recovery")
                return
        }

        ctx := context.Background()
        
        // Find all enter phase keys
        keys, err := b.server.redis.Keys(ctx, "ddz:arena:enter_phase:*").Result()
        if err != nil {
                log.Printf("[ArenaStatus] Failed to get enter phase keys: %v", err)
                return
        }

        log.Printf("[ArenaStatus] Found %d enter phase records to restore", len(keys))

        for _, key := range keys {
                // Extract player ID from key
                playerIDStr := strings.TrimPrefix(key, "ddz:arena:enter_phase:")
                playerID, err := strconv.ParseUint(playerIDStr, 10, 64)
                if err != nil {
                        continue
                }

                // Get the data
                data := b.getPlayerEnterPhaseFromRedis(playerID)
                if data == nil {
                        continue
                }

                // Check if expired
                elapsed := time.Now().Unix() - data.StartTime/1000
                remaining := data.Countdown - int(elapsed)
                if remaining <= 0 {
                        // Expired, clean up
                        b.removePlayerEnterPhaseFromRedis(playerID)
                        log.Printf("[ArenaStatus] Cleaned up expired enter phase for player %d", playerID)
                        continue
                }

                log.Printf("[ArenaStatus] Player %d has pending enter phase: periodNo=%s, remaining=%ds",
                        playerID, data.PeriodNo, remaining)
        }

        // Restore tournament progress from database
        // Find periods that are in PLAYING status
        var playingPeriods []database.ArenaPeriod
        err = database.DB().Where("status = ?", database.ArenaPeriodStatusInProgress).
                Where("start_time > ?", time.Now().Add(-2*time.Hour)).
                Find(&playingPeriods).Error
        
        if err != nil {
                log.Printf("[ArenaStatus] Failed to get playing periods: %v", err)
                return
        }

        log.Printf("[ArenaStatus] Found %d periods in PLAYING status to check", len(playingPeriods))

        for _, period := range playingPeriods {
                // Check if there are active games for this period
                // If not, the tournament was interrupted
                log.Printf("[ArenaStatus] Period %s was in PLAYING status, may need recovery", period.PeriodNo)
        }
}

// =============================================
// [Enhanced] Send Reconnect State
// =============================================

// SendArenaReconnectState sends comprehensive reconnect state to a player
func (b *ArenaStatusBroadcaster) SendArenaReconnectState(playerID uint64, client *Client) {
        // Check enter phase first
        enterPhase := b.getActiveEnterPhaseForPlayer(playerID)
        if enterPhase != nil {
                status, exists := enterPhase.PlayerStatuses[playerID]
                if exists && !status.HasCancelled {
                        // Player is in enter/waiting phase
                        roomConfig, _ := database.GetRoomConfigByID(enterPhase.RoomID)
                        roomName := ""
                        if roomConfig != nil {
                                roomName = roomConfig.RoomName
                        }
                        
                        elapsed := time.Since(enterPhase.StartTime)
                        remaining := enterPhase.Countdown - int(elapsed.Seconds())
                        if remaining < 0 {
                                remaining = 0
                        }
                        
                        phase := "waiting"
                        if enterPhase.WaitingPhase == WaitingPhaseAssigning {
                                phase = "assigning"
                        } else if enterPhase.WaitingPhase == WaitingPhaseEntering {
                                phase = "entering"
                        }
                        
                        payload := &protocol.ArenaReconnectStatePayload{
                                Phase:        phase,
                                PeriodNo:     enterPhase.PeriodNo,
                                RoomID:       enterPhase.RoomID,
                                RoomName:     roomName,
                                Countdown:    remaining,
                                TableID:      status.TableID,
                                TotalPlayers: len(enterPhase.PlayerStatuses),
                                Message:      "Tournament in progress, please enter",
                        }
                        
                        msg := codec.MustNewMessage(protocol.MsgArenaReconnectState, payload)
                        client.SendMessage(msg)
                        log.Printf("[ArenaStatus] Sent reconnect state for waiting phase: player=%d, phase=%s", playerID, phase)
                        return
                }
        }
        
        // Check if player is in an active game
        if client.GetRoom() != "" {
                gameRoom := b.server.roomManager.GetRoom(client.GetRoom())
                if gameRoom != nil && gameRoom.PeriodNo != "" {
                        // Player is in an arena game
                        roomConfig, _ := database.GetRoomConfigByID(gameRoom.RoomConfigID)
                        roomName := ""
                        if roomConfig != nil {
                                roomName = roomConfig.RoomName
                        }
                        
                        // Get player arena gold
                        arenaGold, _ := database.GetArenaGold(gameRoom.PeriodNo, playerID)
                        
                        payload := &protocol.ArenaReconnectStatePayload{
                                Phase:        "playing",
                                PeriodNo:     gameRoom.PeriodNo,
                                RoomID:       gameRoom.RoomConfigID,
                                RoomName:     roomName,
                                RoomCode:     gameRoom.Code,
                                ArenaGold:    arenaGold,
                                Message:      "Game in progress",
                        }
                        
                        msg := codec.MustNewMessage(protocol.MsgArenaReconnectState, payload)
                        client.SendMessage(msg)
                        log.Printf("[ArenaStatus] Sent reconnect state for playing phase: player=%d, roomCode=%s", playerID, gameRoom.Code)
                        return
                }
        }
        
        // Check if player recently finished a tournament
        // (Check database for recent participations)
}

// 🔧【新增】辅助函数：检查切片中是否包含某个元素
func contains(slice []uint64, item uint64) bool {
        for _, v := range slice {
                if v == item {
                        return true
                }
        }
        return false
}
