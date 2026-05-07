package server

import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "strconv"
        "strings"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

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
}

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
                        log.Printf("[ArenaStatus] 房间 %d 首次获取状态，期号=%s，需要广播", roomID, status.PeriodNoStr)
                        continue
                }

                // 检查是否需要广播
                shouldBroadcast := false

                // 情况1：期号变化
                if lastStatus.PeriodNoStr != status.PeriodNoStr && status.PeriodNoStr != "" {
                        shouldBroadcast = true
                        log.Printf("[ArenaStatus] 房间 %d 期号变化: %s -> %s", roomID, lastStatus.PeriodNoStr, status.PeriodNoStr)

                        // 期号变化时，触发上一期结算和新期号创建
                        b.handlePeriodChange(roomID, lastStatus.PeriodNoStr, status.PeriodNoStr, status)
                }

                // 情况2：阶段变化
                if lastStatus.StatusText != status.StatusText {
                        shouldBroadcast = true
                        log.Printf("[ArenaStatus] 房间 %d 状态变化: %s -> %s", roomID, lastStatus.StatusText, status.StatusText)

                        // 阶段变化处理
                        b.handlePhaseChange(roomID, status)
                }

                // 情况3：报名人数变化（超过阈值时推送）
                if status.TotalPlayers > 0 && lastStatus.TotalPlayers != status.TotalPlayers {
                        shouldBroadcast = true
                        log.Printf("[ArenaStatus] 房间 %d 报名人数变化: %d -> %d", roomID, lastStatus.TotalPlayers, status.TotalPlayers)
                }

                if shouldBroadcast {
                        needBroadcast = true
                }

                // 更新缓存的状态
                b.lastStatus[roomID] = &status
        }

        // 决定是否广播
        if needBroadcast {
                log.Printf("📢 [checkAndBroadcast] 需要广播，共 %d 个房间", len(currentStatus))
                b.server.BroadcastArenaStatus(currentStatus)
                b.lastBroadcastTime = time.Now()
        } else if needFallbackBroadcast && len(currentStatus) > 0 {
                log.Printf("📢 [checkAndBroadcast] 兜底广播（30秒）")
                b.server.BroadcastArenaStatus(currentStatus)
                b.lastBroadcastTime = time.Now()
        }
}

// handlePeriodChange 处理期号变化
func (b *ArenaStatusBroadcaster) handlePeriodChange(roomID uint64, oldPeriodNo, newPeriodNo string, status protocol.ArenaRoomStatus) {
        b.processedPeriodsMu.Lock()
        defer b.processedPeriodsMu.Unlock()

        // 检查是否已处理过这个新期号
        if lastProcessed, exists := b.processedPeriods[roomID]; exists && lastProcessed == newPeriodNo {
                return
        }

        // 获取期号缓存信息
        periodInfo := b.getPeriodCache(roomID)
        if periodInfo == nil {
                return
        }

        // 1. 结算上一期（如果存在）- 结算任务会自动清理缓存
        if oldPeriodNo != "" {
                b.queue.PushPeriodFinalize(PeriodFinalizeData{
                        PeriodNo: oldPeriodNo,
                        RoomID:   roomID,
                })
                log.Printf("[ArenaStatus] 触发上一期结算: roomID=%d, periodNo=%s", roomID, oldPeriodNo)
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

        // 标记已处理
        b.processedPeriods[roomID] = newPeriodNo
        log.Printf("[ArenaStatus] 触发新期号创建: roomID=%d, periodNo=%s", roomID, newPeriodNo)
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
        var timeRanges []database.MatchTimeRange
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
        var matchedRange *database.MatchTimeRange
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
