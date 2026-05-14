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
}

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

        // 初始化玩家状态（机器人标记为已进入，真人需要点击进入）
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
                        HasEntered:   isRobot, // 只有机器人标记为已进入，真人需要点击
                        HasCancelled: false,
                        SignupFee:    signupFee,
                        TableID:      tableID,
                }
        }

        // 保存进入阶段信息
        b.enterPhasesMu.Lock()
        b.enterPhases[periodNo] = enterPhase
        b.enterPhasesMu.Unlock()

        // 🔧【关键修复】启动倒计时定时器，倒计时结束后处理超时
        enterPhase.timer = time.AfterFunc(time.Duration(EnterPhaseCountdown)*time.Second, func() {
                b.handleEnterPhaseTimeout(periodNo)
        })

        // 🔧【修复】发送弹窗消息给所有真人玩家
        b.sendMatchStartPopup(roomID, periodNo, roomConfig, realPlayers, playerMap)

        // 🔧【关键】机器人自动进入房间
        for _, robotID := range robotPlayers {
                b.HandlePlayerEnter(periodNo, robotID)
        }
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
        // 清理进入阶段信息
        delete(b.enterPhases, periodNo)
        b.enterPhasesMu.Unlock()

        // 统计玩家状态
        var timeoutPlayers []uint64

        for playerID, status := range enterPhase.PlayerStatuses {
                if !status.HasEntered && !status.HasCancelled {
                        // 未进入也未取消的玩家 = 超时未响应
                        timeoutPlayers = append(timeoutPlayers, playerID)
                }
        }

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
        }

        // 🔧【关键修复】对于已经进入的玩家，为他们的桌子开始游戏
        for _, table := range enterPhase.Tables {
                if !table.RoomCreated || table.RoomCode == "" {
                        continue
                }
                // 检查这桌是否有已进入的玩家
                hasEnteredPlayer := false
                for _, playerID := range table.Players {
                        if status, ok := enterPhase.PlayerStatuses[playerID]; ok && status.HasEntered {
                                hasEnteredPlayer = true
                                break
                        }
                }
                // 如果有已进入的玩家且游戏未开始，开始游戏
                if hasEnteredPlayer && !table.AllEntered {
                        gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
                        if gameRoom != nil {
                                table.AllEntered = true
                                b.startArenaGame(gameRoom)
                        }
                }
        }

        // 发送关闭弹窗消息
        b.sendCloseDialogNotification(enterPhase.RoomID, periodNo)
}

// 🔧【新增】处理玩家点击"进入"按钮
// 玩家点击进入时，根据分组信息创建/加入对应的房间
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

        if status.HasEntered {
                // 玩家已经点击过进入，检查桌子房间是否已创建
                tableID := status.TableID
                if tableID > 0 && tableID <= len(enterPhase.Tables) {
                        table := enterPhase.Tables[tableID-1]
                        if table.RoomCreated && table.RoomCode != "" {
                                // 房间已创建，重新发送 room_joined 给这个玩家
                                b.sendRoomJoinedToTablePlayer(enterPhase, table, playerID)
                        }
                }
                return nil // 不是错误，只是重复点击
        }

        // 标记玩家已进入
        status.HasEntered = true
        tableID := status.TableID
        
        // 获取玩家所在的桌子
        if tableID == 0 || tableID > len(enterPhase.Tables) {
                return fmt.Errorf("玩家未分配到桌子")
        }
        
        table := enterPhase.Tables[tableID-1]
        
        // 标记玩家进入状态
        table.PlayerStatuses[playerID] = true

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

        // 检查该桌房间是否已创建
        if !table.RoomCreated {
                // 房间未创建，由该玩家创建房间
                err := b.createTableRoom(enterPhase, table, client)
                if err != nil {
                        log.Printf("[ArenaStatus] 创建桌子房间失败: %v", err)
                        return err
                }
        } else {
                // 房间已创建，加入房间
                gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
                if gameRoom == nil {
                        return fmt.Errorf("房间不存在: %s", table.RoomCode)
                }
                
                // 加入房间
                _, err := b.server.roomManager.JoinRoom(client, table.RoomCode)
                if err != nil {
                        return err
                }
                
                // 设置玩家为准备状态
                b.server.roomManager.SetPlayerReady(client, true)
        }

        // 发送 room_joined 消息
        gameRoom := b.server.roomManager.GetRoom(table.RoomCode)
        if gameRoom != nil {
                b.sendRoomJoinedToTablePlayer(enterPhase, table, playerID)
        }

        // 检查该桌是否所有玩家都已进入
        allEntered := b.checkTableAllEntered(table)
        if allEntered && !table.AllEntered {
                table.AllEntered = true
                if gameRoom != nil {
                        b.startArenaGame(gameRoom)
                }
        }

        // 🔧【新增】检查所有桌子是否都已开始游戏，如果是则停止定时器
        allTablesStarted := true
        for _, t := range enterPhase.Tables {
                if !t.AllEntered {
                        allTablesStarted = false
                        break
                }
        }
        if allTablesStarted && enterPhase.timer != nil {
                enterPhase.timer.Stop()
                // 清理进入阶段信息
                delete(b.enterPhases, periodNo)
        }

        return nil
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
func (b *ArenaStatusBroadcaster) sendToNewClient(playerID uint64) {
        b.server.clientsMu.RLock()
        var client *Client
        for _, c := range b.server.clients {
                if c.PlayerID == playerID {
                        client = c
                        break
                }
        }
        b.server.clientsMu.RUnlock()

        if client == nil || client.GetRoom() != "" {
                return
        }

        arenas := b.calculateArenaStatus()
        if len(arenas) == 0 {
                return
        }

        payload := protocol.ArenaStatusPayload{
                Arenas: arenas,
                Time:   time.Now().UnixMilli(),
        }

        msg := codec.MustNewMessage(protocol.MsgArenaStatus, payload)
        client.SendMessage(msg)
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
                return nil
        }

        ctx := context.Background()
        key := getSignupListKey(periodNo)

        // 使用SMembers获取集合所有成员
        result, err := b.server.redis.SMembers(ctx, key).Result()
        if err != nil {
                return nil
        }

        players := make([]uint64, 0, len(result))
        for _, s := range result {
                if id, err := strconv.ParseUint(s, 10, 64); err == nil {
                        players = append(players, id)
                }
        }

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
func (b *ArenaStatusBroadcaster) GetCurrentPeriodInfo(roomID uint64) *types.PeriodInfo {
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
