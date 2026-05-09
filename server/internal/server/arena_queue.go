package server

import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// 消息队列任务类型
// =============================================

// TaskType 任务类型
type TaskType int

const (
        TaskTypePeriodCreate       TaskType = iota // 创建新期号
        TaskTypePeriodFinalize                     // 结算期号(报名结束)
        TaskTypeSignupLog                          // 记录报名日志
        TaskTypeCancelLog                          // 记录取消日志
        TaskTypeSyncSignupPlayers                  // 同步报名玩家到数据库
        TaskTypeClearPeriodCache                   // 清理期号缓存
)

// =============================================
// 任务消息结构
// =============================================

// QueueTask 队列任务
type QueueTask struct {
        Type      TaskType
        Data      interface{}
        CreatedAt time.Time
}

// PeriodCreateData 创建期号任务数据
type PeriodCreateData struct {
        PeriodNo        string
        RoomID          uint64
        RoomConfigID    uint64
        PeriodIndex     int
        StartTime       time.Time
        SignupStartTime time.Time
        SignupEndTime   time.Time
        EndTime         time.Time
}

// PeriodFinalizeData 结算期号任务数据
type PeriodFinalizeData struct {
        PeriodNo string
        RoomID   uint64
}

// SignupLogData 报名日志任务数据
type SignupLogData struct {
        PeriodNo      string
        PeriodID      uint64
        RoomID        uint64
        PlayerID      uint64
        SignupFee     int64
        BalanceBefore int64
        BalanceAfter  int64
}

// CancelLogData 取消日志任务数据
type CancelLogData struct {
        PeriodNo      string
        PeriodID      uint64
        RoomID        uint64
        PlayerID      uint64
        SignupFee     int64
        BalanceBefore int64
        BalanceAfter  int64
}

// SyncSignupPlayersData 同步报名玩家任务数据
type SyncSignupPlayersData struct {
        PeriodNo string
        PeriodID uint64
        RoomID   uint64
        Players  []uint64 // 玩家ID列表
}

// ClearPeriodCacheData 清理缓存任务数据
type ClearPeriodCacheData struct {
        PeriodNo string
        RoomID   uint64
}

// =============================================
// 消息队列
// =============================================

// ArenaMessageQueue 竞技场消息队列
type ArenaMessageQueue struct {
        taskChan   chan QueueTask
        workerNum  int
        wg         sync.WaitGroup
        ctx        context.Context
        cancel     context.CancelFunc
        server     *Server
        isRunning  bool
        statusMu   sync.RWMutex

        // 任务处理统计
        totalProcessed int64
        totalFailed    int64
        statsMu        sync.RWMutex
}

// NewArenaMessageQueue 创建消息队列
func NewArenaMessageQueue(server *Server, workerNum, bufferSize int) *ArenaMessageQueue {
        if workerNum <= 0 {
                workerNum = 3 // 默认3个工作线程
        }
        if bufferSize <= 0 {
                bufferSize = 1000 // 默认缓冲区大小
        }

        ctx, cancel := context.WithCancel(context.Background())
        return &ArenaMessageQueue{
                taskChan:  make(chan QueueTask, bufferSize),
                workerNum: workerNum,
                ctx:       ctx,
                cancel:    cancel,
                server:    server,
        }
}

// Start 启动消息队列
func (q *ArenaMessageQueue) Start() {
        q.statusMu.Lock()
        defer q.statusMu.Unlock()

        if q.isRunning {
                return
        }

        q.isRunning = true
        for i := 0; i < q.workerNum; i++ {
                q.wg.Add(1)
                go q.worker(i)
        }
        log.Printf("[ArenaQueue] 消息队列已启动，工作线程数: %d", q.workerNum)
}

// Stop 停止消息队列
func (q *ArenaMessageQueue) Stop() {
        q.statusMu.Lock()
        defer q.statusMu.Unlock()

        if !q.isRunning {
                return
        }

        q.cancel()
        q.wg.Wait()
        q.isRunning = false
        log.Printf("[ArenaQueue] 消息队列已停止，处理任务: %d, 失败: %d", q.totalProcessed, q.totalFailed)
}

// Push 推送任务到队列
func (q *ArenaMessageQueue) Push(task QueueTask) bool {
        q.statusMu.RLock()
        defer q.statusMu.RUnlock()

        if !q.isRunning {
                log.Printf("[ArenaQueue] 队列未运行，任务被丢弃: type=%d", task.Type)
                return false
        }

        select {
        case q.taskChan <- task:
                return true
        default:
                log.Printf("[ArenaQueue] 队列已满，任务被丢弃: type=%d", task.Type)
                return false
        }
}

// worker 工作线程
func (q *ArenaMessageQueue) worker(id int) {
        defer q.wg.Done()

        log.Printf("[ArenaQueue] 工作线程 %d 启动", id)

        for {
                select {
                case <-q.ctx.Done():
                        log.Printf("[ArenaQueue] 工作线程 %d 停止", id)
                        return
                case task := <-q.taskChan:
                        q.processTask(id, task)
                }
        }
}

// processTask 处理任务
func (q *ArenaMessageQueue) processTask(workerID int, task QueueTask) {
        startTime := time.Now()
        var err error

        defer func() {
                q.statsMu.Lock()
                q.totalProcessed++
                if err != nil {
                        q.totalFailed++
                }
                q.statsMu.Unlock()

                duration := time.Since(startTime)
                if err != nil {
                        log.Printf("[ArenaQueue] Worker %d 处理任务失败: type=%d, 错误=%v, 耗时=%v",
                                workerID, task.Type, err, duration)
                } else {
                        log.Printf("[ArenaQueue] Worker %d 处理任务成功: type=%d, 耗时=%v",
                                workerID, task.Type, duration)
                }
        }()

        switch task.Type {
        case TaskTypePeriodCreate:
                err = q.handlePeriodCreate(task.Data)
        case TaskTypePeriodFinalize:
                err = q.handlePeriodFinalize(task.Data)
        case TaskTypeSignupLog:
                err = q.handleSignupLog(task.Data)
        case TaskTypeCancelLog:
                err = q.handleCancelLog(task.Data)
        case TaskTypeSyncSignupPlayers:
                err = q.handleSyncSignupPlayers(task.Data)
        case TaskTypeClearPeriodCache:
                err = q.handleClearPeriodCache(task.Data)
        default:
                err = fmt.Errorf("未知任务类型: %d", task.Type)
        }
}

// =============================================
// 任务处理函数
// =============================================

// handlePeriodCreate 处理创建期号任务
func (q *ArenaMessageQueue) handlePeriodCreate(data interface{}) error {
        d, ok := data.(PeriodCreateData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }

        period := &database.ArenaPeriod{
                PeriodNo:        d.PeriodNo,
                RoomID:          d.RoomID,
                RoomConfigID:    d.RoomConfigID,
                PeriodIndex:     d.PeriodIndex,
                StartTime:       d.StartTime,
                SignupStartTime: d.SignupStartTime,
                SignupEndTime:   d.SignupEndTime,
                EndTime:         d.EndTime,
                Status:          database.ArenaPeriodStatusPreparing,
        }

        if err := database.CreateArenaPeriod(period); err != nil {
                return fmt.Errorf("创建期号记录失败: %w", err)
        }

        log.Printf("[ArenaQueue] 创建期号成功: periodNo=%s, periodID=%d", d.PeriodNo, period.ID)
        return nil
}

// handlePeriodFinalize 处理结算期号任务
func (q *ArenaMessageQueue) handlePeriodFinalize(data interface{}) error {
        d, ok := data.(PeriodFinalizeData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }

        // 获取最终报名玩家列表（先获取，后面会清理）
        players := q.server.arenaBroadcaster.GetSignupList(d.PeriodNo)
        finalCount := len(players)

        // 获取期号记录（可能不存在，如果不是正式期号）
        period, err := database.GetArenaPeriodByPeriodNo(d.PeriodNo)
        if err == nil && period != nil {
                // 更新期号状态和最终人数（使用分表更新）
                now := time.Now()
                updates := map[string]interface{}{
                        "status":        database.ArenaPeriodStatusWaitingGame,
                        "final_players": finalCount,
                        "processed_at":  now,
                }

                if err := database.UpdateArenaPeriodByPeriodNo(d.PeriodNo, updates); err != nil {
                        log.Printf("[ArenaQueue] 更新期号状态失败: %v", err)
                }

                // 批量同步玩家数据到数据库（只有有玩家时才同步）
                if len(players) > 0 {
                        q.syncPlayersToDB(period.ID, d.PeriodNo, d.RoomID, players, period.StartTime)
                }
        }

        // 立即清理报名列表缓存（数据已同步到数据库，不再需要）
        if err := q.server.arenaBroadcaster.ClearSignupList(d.PeriodNo); err != nil {
                log.Printf("[ArenaQueue] 清理报名缓存失败: %v", err)
        }

        log.Printf("[ArenaQueue] 期号结算完成: periodNo=%s, players=%d, cache cleared", d.PeriodNo, finalCount)
        return nil
}

// syncPlayersToDB 批量同步玩家数据到数据库（使用分表）
// 🔧【重构】结算时只更新状态，不覆盖金币数据
func (q *ArenaMessageQueue) syncPlayersToDB(periodID uint64, periodNo string, roomID uint64, players []uint64, periodTime time.Time) {
        // 🔧【重要】数据已在比赛开始时写入，这里只确保记录存在
        // 不覆盖金币数据（arena_gold / match_coin 已在游戏过程中更新）
        for order, playerID := range players {
                // 检查记录是否已存在
                existingRecord, _ := database.GetArenaPeriodPlayer(periodNo, playerID)
                if existingRecord == nil {
                        // 记录不存在才创建（这不应该发生，因为比赛开始时已写入）
                        now := time.Now()
                        playerRecord := &database.ArenaPeriodPlayer{
                                PeriodNo:    periodNo,
                                PeriodID:    periodID,
                                RoomID:      roomID,
                                PlayerID:    playerID,
                                SignupTime:  now,
                                SignupOrder: order + 1,
                                Status:      database.ArenaPeriodPlayerStatusNormal,
                                ArenaGold:   0, // 不设置，让查询时从participations获取
                        }
                        database.FirstOrCreateArenaPeriodPlayerWithTime(periodID, playerID, playerRecord, periodTime)
                }
                // 记录已存在，不做任何操作（保留游戏过程中更新的金币）
        }
        log.Printf("[ArenaQueue] 同步玩家记录完成: periodID=%d, count=%d (不覆盖金币)", periodID, len(players))
}

// handleSignupLog 处理报名日志任务（简化版，不写入数据库，数据在结算时批量写入）
func (q *ArenaMessageQueue) handleSignupLog(data interface{}) error {
        d, ok := data.(SignupLogData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }
        // 只记录日志，不写入数据库（减少IO压力）
        // 最终玩家数据在结算时会批量写入数据库
        log.Printf("[ArenaQueue] 报名记录: playerID=%d, periodNo=%s, fee=%d, balance=%d->%d",
                d.PlayerID, d.PeriodNo, d.SignupFee, d.BalanceBefore, d.BalanceAfter)
        return nil
}

// handleCancelLog 处理取消日志任务（简化版，不写入数据库）
func (q *ArenaMessageQueue) handleCancelLog(data interface{}) error {
        d, ok := data.(CancelLogData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }
        // 只记录日志，不写入数据库
        log.Printf("[ArenaQueue] 取消报名: playerID=%d, periodNo=%s, refund=%d, balance=%d->%d",
                d.PlayerID, d.PeriodNo, d.SignupFee, d.BalanceBefore, d.BalanceAfter)
        return nil
}

// handleSyncSignupPlayers 处理同步报名玩家任务（已弃用，在handlePeriodFinalize中直接处理）
func (q *ArenaMessageQueue) handleSyncSignupPlayers(data interface{}) error {
        d, ok := data.(SyncSignupPlayersData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }
        // 直接调用批量同步（使用当前时间，因为该函数已弃用）
        q.syncPlayersToDB(d.PeriodID, d.PeriodNo, d.RoomID, d.Players, time.Now())
        return nil
}

// handleClearPeriodCache 处理清理缓存任务（已弃用，在handlePeriodFinalize中直接处理）
func (q *ArenaMessageQueue) handleClearPeriodCache(data interface{}) error {
        d, ok := data.(ClearPeriodCacheData)
        if !ok {
                return fmt.Errorf("无效的任务数据类型")
        }
        return q.server.arenaBroadcaster.ClearSignupList(d.PeriodNo)
}

// =============================================
// 便捷方法
// =============================================

// PushPeriodCreate 推送创建期号任务
func (q *ArenaMessageQueue) PushPeriodCreate(data PeriodCreateData) bool {
        return q.Push(QueueTask{
                Type: TaskTypePeriodCreate,
                Data: data,
        })
}

// PushPeriodFinalize 推送结算期号任务
func (q *ArenaMessageQueue) PushPeriodFinalize(data PeriodFinalizeData) bool {
        return q.Push(QueueTask{
                Type: TaskTypePeriodFinalize,
                Data: data,
        })
}

// PushSignupLog 推送报名日志任务
func (q *ArenaMessageQueue) PushSignupLog(data SignupLogData) bool {
        return q.Push(QueueTask{
                Type: TaskTypeSignupLog,
                Data: data,
        })
}

// PushCancelLog 推送取消日志任务
func (q *ArenaMessageQueue) PushCancelLog(data CancelLogData) bool {
        return q.Push(QueueTask{
                Type: TaskTypeCancelLog,
                Data: data,
        })
}

// PushClearCache 推送清理缓存任务
func (q *ArenaMessageQueue) PushClearCache(data ClearPeriodCacheData) bool {
        return q.Push(QueueTask{
                Type: TaskTypeClearPeriodCache,
                Data: data,
        })
}

// GetStats 获取队列统计信息
func (q *ArenaMessageQueue) GetStats() map[string]interface{} {
        q.statsMu.RLock()
        defer q.statsMu.RUnlock()

        return map[string]interface{}{
                "total_processed": q.totalProcessed,
                "total_failed":    q.totalFailed,
                "queue_length":    len(q.taskChan),
                "worker_num":      q.workerNum,
        }
}

// MarshalJSON 实现JSON序列化
func (q *ArenaMessageQueue) MarshalJSON() ([]byte, error) {
        return json.Marshal(q.GetStats())
}
