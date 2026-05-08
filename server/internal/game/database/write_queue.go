// Package database 提供数据写入队列系统
// 🔧【优化】减轻高并发下的数据库存储压力
package database

import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "sync"
        "sync/atomic"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 写入队列配置
// =============================================

// WriteQueueConfig 写入队列配置
type WriteQueueConfig struct {
        // 队列配置
        QueueSize    int           // 队列大小（缓冲的游戏结果数量）
        BatchSize    int           // 批量写入大小
        BatchTimeout time.Duration // 批量写入超时时间

        // 限流配置
        MaxWriteRate int // 最大写入速率（每秒）
        WriteBurst   int // 写入突发大小

        // 重试配置
        MaxRetries     int           // 最大重试次数
        RetryBaseDelay time.Duration // 重试基础延迟
        RetryMaxDelay  time.Duration // 重试最大延迟

        // 监控配置
        MetricsInterval time.Duration // 指标上报间隔
}

// DefaultWriteQueueConfig 返回默认配置
func DefaultWriteQueueConfig() *WriteQueueConfig {
        return &WriteQueueConfig{
                QueueSize:       1000,                   // 队列缓冲1000个游戏结果
                BatchSize:       10,                     // 每批处理10个
                BatchTimeout:    500 * time.Millisecond, // 500ms超时触发批量写入
                MaxWriteRate:    100,                    // 每秒最多100次写入
                WriteBurst:      20,                     // 突发20次
                MaxRetries:      3,                      // 最多重试3次
                RetryBaseDelay:  1 * time.Second,        // 基础延迟1秒
                RetryMaxDelay:   10 * time.Second,       // 最大延迟10秒
                MetricsInterval: 30 * time.Second,       // 30秒上报一次指标
        }
}

// =============================================
// 游戏结果数据结构
// =============================================

// toGameRecord 将 GameResultData 转换为 GameRecord
// 🔧【整合】提取公共转换逻辑，避免重复代码
func (data *GameResultData) toGameRecord() *GameRecord {
        if data == nil {
                return nil
        }
        return &GameRecord{
                GameID:               data.GameID,
                RoomID:               data.RoomID,
                RoomType:             data.RoomType,
                RoomCategory:         data.RoomCategory,
                LandlordID:           data.LandlordID,
                Farmer1ID:            data.Farmer1ID,
                Farmer2ID:            data.Farmer2ID,
                BaseScore:            data.BaseScore,
                Multiplier:           data.Multiplier,
                BombCount:            data.BombCount,
                Spring:               data.Spring,
                Result:               data.Result,
                LandlordWinGold:      data.LandlordWinGold,
                Farmer1WinGold:       data.Farmer1WinGold,
                Farmer2WinGold:       data.Farmer2WinGold,
                LandlordWinArenaCoin: data.LandlordWinArenaCoin,
                Farmer1WinArenaCoin:  data.Farmer1WinArenaCoin,
                Farmer2WinArenaCoin:  data.Farmer2WinArenaCoin,
                StartedAt:            data.StartedAt,
                EndedAt:              data.EndedAt,
                DurationSeconds:      data.DurationSeconds,
        }
}

// GameResultData 游戏结果数据
type GameResultData struct {
        // 基本信息
        RoomCode     string
        GameID       string
        RoomID       string
        RoomType     uint8
        RoomCategory uint8

        // 玩家信息
        LandlordID uint64
        Farmer1ID  uint64
        Farmer2ID  uint64

        // 游戏数据
        BaseScore            int
        Multiplier           int
        BombCount            int
        Spring               uint8
        Result               uint8
        LandlordWinGold      int64
        Farmer1WinGold       int64
        Farmer2WinGold       int64
        LandlordWinArenaCoin int64
        Farmer1WinArenaCoin  int64
        Farmer2WinArenaCoin  int64
        DurationSeconds      int
        StartedAt            time.Time
        EndedAt              *time.Time

        // 日志数据
        DealLogs []DealLog
        BidLogs  []BidLog
        PlayLogs []PlayLog

        // 元数据
        CreatedAt  time.Time
        RetryCount int
        SubmitTime time.Time
}

// =============================================
// 令牌桶限流器
// =============================================

// TokenBucket 令牌桶限流器
type TokenBucket struct {
        tokens     int64 // 当前令牌数
        maxTokens  int64 // 最大令牌数
        refillRate int64 // 每秒填充令牌数
        lastRefill int64 // 上次填充时间（Unix纳秒）

        // 用于原子更新的互斥锁
        mu sync.Mutex
}

// NewTokenBucket 创建令牌桶
func NewTokenBucket(maxTokens, refillRate int64) *TokenBucket {
        return &TokenBucket{
                tokens:     maxTokens,
                maxTokens:  maxTokens,
                refillRate: refillRate,
                lastRefill: time.Now().UnixNano(),
        }
}

// Wait 等待指定数量的令牌
// 返回 true 表示成功获取令牌，false 表示 context 已取消
func (tb *TokenBucket) Wait(ctx context.Context, count int) bool {
        for {
                // 检查 context 是否已取消
                select {
                case <-ctx.Done():
                        return false
                default:
                }

                if tb.tryAcquire(int64(count)) {
                        return true
                }
                // 等待一小段时间后重试
                select {
                case <-ctx.Done():
                        return false
                case <-time.After(10 * time.Millisecond):
                }
        }
}

// tryAcquire 尝试获取令牌
func (tb *TokenBucket) tryAcquire(count int64) bool {
        tb.mu.Lock()
        defer tb.mu.Unlock()

        // 先填充令牌
        now := time.Now().UnixNano()
        elapsed := float64(now-tb.lastRefill) / 1e9 // 转换为秒
        if elapsed > 0 {
                tokensToAdd := int64(elapsed * float64(tb.refillRate))
                if tokensToAdd > 0 {
                        tb.tokens += tokensToAdd
                        if tb.tokens > tb.maxTokens {
                                tb.tokens = tb.maxTokens
                        }
                        tb.lastRefill = now
                }
        }

        // 尝试获取令牌
        if tb.tokens >= count {
                tb.tokens -= count
                return true
        }
        return false
}

// Available 返回当前可用令牌数
func (tb *TokenBucket) Available() int64 {
        tb.mu.Lock()
        defer tb.mu.Unlock()
        return tb.tokens
}

// =============================================
// 写入队列
// =============================================

// WriteQueue 写入队列
type WriteQueue struct {
        config *WriteQueueConfig
        queue  chan *GameResultData
        db     *gorm.DB

        // 控制信号
        ctx    context.Context
        cancel context.CancelFunc
        wg     sync.WaitGroup

        // 限流器
        tokenBucket *TokenBucket

        // 统计指标
        totalSubmitted  uint64 // 总提交数
        totalProcessed  uint64 // 总处理数
        totalSuccess    uint64 // 成功数
        totalFailed     uint64 // 失败数
        totalRetries    uint64 // 重试数
        currentQueueLen uint64 // 当前队列长度
        lastMetricsNano int64  // 上次指标上报时间（UnixNano，使用原子操作）

        // 批量处理缓冲区
        batchBuffer []*GameResultData
        batchMutex  sync.Mutex

        // 启动状态 - 使用原子操作保护
        started int32 // 0=未启动, 1=已启动
}

var (
        writeQueueInstance *WriteQueue
        writeQueueOnce     sync.Once
        writeQueueMutex    sync.Mutex
)

// GetWriteQueue 获取写入队列单例
func GetWriteQueue() *WriteQueue {
        writeQueueOnce.Do(func() {
                writeQueueInstance = &WriteQueue{
                        config: DefaultWriteQueueConfig(),
                }
        })
        return writeQueueInstance
}

// InitWriteQueue 初始化写入队列
func InitWriteQueue(config *WriteQueueConfig) error {
        q := GetWriteQueue()
        if config != nil {
                q.config = config
        }

        q.queue = make(chan *GameResultData, q.config.QueueSize)
        q.batchBuffer = make([]*GameResultData, 0, q.config.BatchSize)

        // 初始化令牌桶限流器
        q.tokenBucket = NewTokenBucket(int64(q.config.WriteBurst), int64(q.config.MaxWriteRate))

        // 初始化统计时间（使用原子操作）
        atomic.StoreInt64(&q.lastMetricsNano, time.Now().UnixNano())

        return nil
}

// Start 启动写入队列
// 🔧【优化】启动时自动恢复上次异常停止时未处理的数据
func (q *WriteQueue) Start(db *gorm.DB) {
        writeQueueMutex.Lock()
        defer writeQueueMutex.Unlock()

        // 使用原子操作检查是否已启动
        if atomic.LoadInt32(&q.started) == 1 {
                log.Println("⚠️ [WriteQueue] 写入队列已经启动，跳过重复启动")
                return
        }

        q.db = db
        q.ctx, q.cancel = context.WithCancel(context.Background())
        atomic.StoreInt32(&q.started, 1)

        // 启动工作协程
        q.wg.Add(2)
        go q.worker()
        go q.metricsReporter()

        log.Println("✅ [WriteQueue] 写入队列已启动")
        log.Printf("   📊 配置: 队列大小=%d, 批量大小=%d, 批量超时=%v",
                q.config.QueueSize, q.config.BatchSize, q.config.BatchTimeout)
        log.Printf("   📊 限流: 最大写入速率=%d/s, 突发大小=%d",
                q.config.MaxWriteRate, q.config.WriteBurst)

        // 🔧【关键】启动后恢复未处理的数据
        go func() {
                // 稍微延迟，确保队列完全启动
                time.Sleep(1 * time.Second)
                if err := q.RecoverPendingData(); err != nil {
                        log.Printf("❌ [WriteQueue] 恢复待处理数据失败: %v", err)
                }
        }()
}

// Stop 停止写入队列
func (q *WriteQueue) Stop() {
        writeQueueMutex.Lock()
        defer writeQueueMutex.Unlock()

        // 使用原子操作检查是否已停止
        if atomic.LoadInt32(&q.started) == 0 {
                return
        }

        if q.cancel != nil {
                q.cancel()
        }
        q.wg.Wait()

        // 处理剩余数据
        q.flushRemaining()

        atomic.StoreInt32(&q.started, 0)

        log.Println("✅ [WriteQueue] 写入队列已停止")
        log.Printf("   📊 统计: 提交=%d, 处理=%d, 成功=%d, 失败=%d, 重试=%d",
                atomic.LoadUint64(&q.totalSubmitted),
                atomic.LoadUint64(&q.totalProcessed),
                atomic.LoadUint64(&q.totalSuccess),
                atomic.LoadUint64(&q.totalFailed),
                atomic.LoadUint64(&q.totalRetries))
}

// Submit 提交游戏结果到队列
// 非阻塞模式：如果队列满，返回错误
// 🔧【优化】先持久化再入队，确保数据不丢失
func (q *WriteQueue) Submit(data *GameResultData) error {
        if data == nil {
                return nil
        }

        data.SubmitTime = time.Now()
        data.CreatedAt = time.Now()

        // 🔧【关键】先持久化数据，确保不丢失
        if q.db != nil {
                if err := q.persistData(data); err != nil {
                        log.Printf("⚠️ [WriteQueue] 持久化数据失败: %v, GameID=%s", err, data.GameID)
                        // 持久化失败不阻塞主流程，继续入队
                }
        }

        // 检查队列是否已初始化
        if q.queue == nil {
                log.Printf("⚠️ [WriteQueue] 队列未初始化，直接写入")
                return q.writeSingleNoLimit(data)
        }

        select {
        case q.queue <- data:
                atomic.AddUint64(&q.totalSubmitted, 1)
                atomic.StoreUint64(&q.currentQueueLen, uint64(len(q.queue)))
                return nil
        default:
                // 队列满，尝试直接写入
                log.Printf("⚠️ [WriteQueue] 队列已满，尝试直接写入")
                return q.writeSingle(data)
        }
}

// SubmitBlocking 阻塞式提交游戏结果
// 会等待队列有空间
// 🔧【优化】先持久化再入队，确保数据不丢失
func (q *WriteQueue) SubmitBlocking(data *GameResultData) {
        if data == nil {
                return
        }

        data.SubmitTime = time.Now()
        data.CreatedAt = time.Now()

        // 🔧【关键】先持久化数据，确保不丢失
        if q.db != nil {
                if err := q.persistData(data); err != nil {
                        log.Printf("⚠️ [WriteQueue] 持久化数据失败: %v, GameID=%s", err, data.GameID)
                        // 持久化失败不阻塞主流程，继续入队
                }
        }

        // 检查队列是否已初始化
        if q.queue == nil {
                log.Printf("⚠️ [WriteQueue] 队列未初始化，直接写入")
                q.writeSingleNoLimit(data)
                return
        }

        q.queue <- data
        atomic.AddUint64(&q.totalSubmitted, 1)
        atomic.StoreUint64(&q.currentQueueLen, uint64(len(q.queue)))
}

// IsStarted 检查队列是否已启动
func (q *WriteQueue) IsStarted() bool {
        return atomic.LoadInt32(&q.started) == 1
}

// =============================================
// 工作协程
// =============================================

// worker 工作协程
// 🔧【安全】添加 panic 恢复机制，防止崩溃
// 🔧【关键】panic 后尝试重启 worker，确保队列持续运行
func (q *WriteQueue) worker() {
        defer func() {
                q.wg.Done()
                if r := recover(); r != nil {
                        log.Printf("❌ [WriteQueue] worker 发生 panic: %v", r)
                        // 记录错误到数据库
                        q.recordError("worker_panic", fmt.Sprintf("worker panic: %v", r), "")

                        // 🔧【关键修复】尝试重启 worker，确保队列持续运行
                        // 只有在队列仍在运行状态时才重启
                        if atomic.LoadInt32(&q.started) == 1 {
                                log.Printf("🔄 [WriteQueue] 尝试重启 worker...")
                                q.wg.Add(1)
                                go q.worker()
                        }
                }
        }()

        batchTimer := time.NewTimer(q.config.BatchTimeout)
        defer batchTimer.Stop()

        for {
                select {
                case <-q.ctx.Done():
                        return

                case data := <-q.queue:
                        if data == nil {
                                continue
                        }
                        // 添加到批量缓冲区
                        q.batchMutex.Lock()
                        q.batchBuffer = append(q.batchBuffer, data)
                        shouldFlush := len(q.batchBuffer) >= q.config.BatchSize
                        q.batchMutex.Unlock()

                        if shouldFlush {
                                q.safeFlushBatch()
                                if !batchTimer.Stop() {
                                        select {
                                        case <-batchTimer.C:
                                        default:
                                        }
                                }
                                batchTimer.Reset(q.config.BatchTimeout)
                        }

                case <-batchTimer.C:
                        // 超时，刷新批量缓冲区
                        q.safeFlushBatch()
                        batchTimer.Reset(q.config.BatchTimeout)
                }
        }
}

// safeFlushBatch 安全地刷新批量缓冲区
// 🔧【新增】添加 panic 保护，确保 flushBatch 不会崩溃
func (q *WriteQueue) safeFlushBatch() {
        defer func() {
                if r := recover(); r != nil {
                        log.Printf("❌ [WriteQueue] flushBatch 发生 panic: %v", r)
                        q.recordError("flush_panic", fmt.Sprintf("flushBatch panic: %v", r), "")
                }
        }()
        q.flushBatch()
}

// flushBatch 刷新批量缓冲区
func (q *WriteQueue) flushBatch() {
        q.batchMutex.Lock()
        if len(q.batchBuffer) == 0 {
                q.batchMutex.Unlock()
                return
        }

        // 取出数据
        batch := q.batchBuffer
        q.batchBuffer = make([]*GameResultData, 0, q.config.BatchSize)
        q.batchMutex.Unlock()

        // 等待令牌（检查 tokenBucket 是否存在，使用 context 支持取消）
        if q.tokenBucket != nil && q.ctx != nil {
                if !q.tokenBucket.Wait(q.ctx, len(batch)) {
                        // Context 已取消，直接返回
                        log.Printf("⚠️ [WriteQueue] 队列已停止，跳过批量写入")
                        return
                }
        }

        // 批量写入
        q.writeBatchNoLimit(batch)
}

// flushRemaining 刷新剩余数据（停止时调用）
func (q *WriteQueue) flushRemaining() {
        // 先处理批量缓冲区中的数据
        q.batchMutex.Lock()
        if len(q.batchBuffer) > 0 {
                batch := q.batchBuffer
                q.batchBuffer = make([]*GameResultData, 0, q.config.BatchSize)
                q.batchMutex.Unlock()

                // 直接写入，不限流
                log.Printf("📝 [WriteQueue] 处理缓冲区剩余数据: %d 条", len(batch))
                q.writeBatchNoLimit(batch)
        } else {
                q.batchMutex.Unlock()
        }

        // 处理队列中剩余的数据
        if q.queue == nil {
                return
        }

        count := 0
        for {
                select {
                case data := <-q.queue:
                        if data != nil {
                                count++
                                q.writeSingleNoLimit(data)
                        }
                default:
                        if count > 0 {
                                log.Printf("📝 [WriteQueue] 处理队列剩余数据: %d 条", count)
                        }
                        return
                }
        }
}

// =============================================
// 写入操作
// =============================================

// writeBatchNoLimit 批量写入（不限流，用于关闭时）
// 🔧【整合】复用 SaveGameResult 避免重复代码
// 🔧【安全】添加 panic 恢复和错误记录
// 🔧【数据安全】处理成功后删除持久化记录
func (q *WriteQueue) writeBatchNoLimit(batch []*GameResultData) {
        if len(batch) == 0 {
                return
        }

        // 检查数据库连接
        if q.db == nil {
                log.Printf("❌ [WriteQueue] 数据库连接为空，无法写入 %d 条数据", len(batch))
                q.recordError("db_nil", fmt.Sprintf("数据库连接为空，无法写入 %d 条数据", len(batch)), "")
                return
        }

        startTime := time.Now()

        var successCount, failCount uint64

        for _, data := range batch {
                if data == nil {
                        continue
                }

                // 🔧【安全】为每条数据添加 panic 恢复
                func() {
                        defer func() {
                                if r := recover(); r != nil {
                                        failCount++
                                        atomic.AddUint64(&q.totalFailed, 1)
                                        log.Printf("❌ [WriteQueue] 写入单条数据发生 panic: %v, GameID=%s", r, data.GameID)
                                        q.recordError("write_panic",
                                                fmt.Sprintf("写入数据 panic: %v", r),
                                                fmt.Sprintf("GameID=%s, RoomID=%s", data.GameID, data.RoomID))
                                        // 标记持久化数据失败
                                        q.markDataFailed(data.GameID, data.RetryCount)
                                }
                        }()

                        atomic.AddUint64(&q.totalProcessed, 1)

                        // 🔧【整合】使用统一的 SaveGameResult 函数，避免重复代码
                        record := data.toGameRecord()
                        if record == nil {
                                log.Printf("⚠️ [WriteQueue] 数据转换为空，跳过: GameID=%s", data.GameID)
                                return
                        }

                        err := SaveGameResult(record, data.DealLogs, data.BidLogs, data.PlayLogs)

                        if err != nil {
                                failCount++
                                atomic.AddUint64(&q.totalFailed, 1)
                                log.Printf("❌ [WriteQueue] 保存游戏结果失败: %v, GameID=%s", err, data.GameID)
                                q.recordError("save_failed",
                                        fmt.Sprintf("保存游戏结果失败: %v", err),
                                        fmt.Sprintf("GameID=%s, RoomID=%s", data.GameID, data.RoomID))

                                // 标记持久化数据失败
                                q.markDataFailed(data.GameID, data.RetryCount)

                                // 重试逻辑 - 只在队列启动时才重试
                                if atomic.LoadInt32(&q.started) == 1 {
                                        q.retryOrDrop(data)
                                }
                        } else {
                                successCount++
                                atomic.AddUint64(&q.totalSuccess, 1)
                                // 🔧【关键】处理成功后删除持久化记录
                                q.markDataProcessed(data.GameID)
                        }
                }()
        }

        elapsed := time.Since(startTime)

        if failCount > 0 {
                log.Printf("⚠️ [WriteQueue] 批量写入部分失败: 成功=%d, 失败=%d, 总数=%d, 耗时=%v",
                        successCount, failCount, len(batch), elapsed)
        } else {
                log.Printf("✅ [WriteQueue] 批量写入成功: 数量=%d, 耗时=%v", successCount, elapsed)
        }
}

// writeSingle 单条写入（带限流）
func (q *WriteQueue) writeSingle(data *GameResultData) error {
        if data == nil {
                return nil
        }

        // 等待令牌限流（使用 context 支持取消）
        if q.tokenBucket != nil && q.ctx != nil {
                if !q.tokenBucket.Wait(q.ctx, 1) {
                        // Context 已取消
                        return fmt.Errorf("队列已停止")
                }
        }

        return q.writeSingleNoLimit(data)
}

// writeSingleNoLimit 单条写入（不限流，用于关闭时和回退场景）
// 🔧【整合】复用 SaveGameResult 和 toGameRecord 避免重复代码
// 🔧【安全】添加 panic 恢复和错误记录
// 🔧【数据安全】处理成功后删除持久化记录
func (q *WriteQueue) writeSingleNoLimit(data *GameResultData) (err error) {
        if data == nil {
                return nil
        }

        // 🔧【安全】添加 panic 恢复
        defer func() {
                if r := recover(); r != nil {
                        err = fmt.Errorf("写入数据发生 panic: %v", r)
                        log.Printf("❌ [WriteQueue] writeSingleNoLimit panic: %v, GameID=%s", r, data.GameID)
                        q.recordError("write_single_panic",
                                fmt.Sprintf("写入数据 panic: %v", r),
                                fmt.Sprintf("GameID=%s, RoomID=%s", data.GameID, data.RoomID))
                        // 标记持久化数据失败
                        q.markDataFailed(data.GameID, data.RetryCount)
                }
        }()

        // 检查数据库连接
        if q.db == nil {
                log.Printf("❌ [WriteQueue] 数据库连接为空，无法写入 GameID=%s", data.GameID)
                q.recordError("db_nil", "数据库连接为空", fmt.Sprintf("GameID=%s", data.GameID))
                return fmt.Errorf("数据库连接为空")
        }

        atomic.AddUint64(&q.totalProcessed, 1)

        // 🔧【整合】使用辅助函数转换数据
        record := data.toGameRecord()
        if record == nil {
                log.Printf("⚠️ [WriteQueue] 数据转换为空: GameID=%s", data.GameID)
                return fmt.Errorf("数据转换失败")
        }

        err = SaveGameResult(record, data.DealLogs, data.BidLogs, data.PlayLogs)

        if err != nil {
                atomic.AddUint64(&q.totalFailed, 1)
                log.Printf("❌ [WriteQueue] 保存游戏结果失败: %v, GameID=%s", err, data.GameID)
                q.recordError("save_failed",
                        fmt.Sprintf("保存游戏结果失败: %v", err),
                        fmt.Sprintf("GameID=%s, RoomID=%s", data.GameID, data.RoomID))
                // 标记持久化数据失败
                q.markDataFailed(data.GameID, data.RetryCount)
                // 只在队列启动时才重试
                if atomic.LoadInt32(&q.started) == 1 {
                        q.retryOrDrop(data)
                }
                return err
        }

        atomic.AddUint64(&q.totalSuccess, 1)
        // 🔧【关键】处理成功后删除持久化记录
        q.markDataProcessed(data.GameID)
        return nil
}

// retryOrDrop 重试或丢弃
// 🔧【安全】添加 panic 恢复机制，防止重试时崩溃
// 🔧【数据安全】更新持久化数据的重试次数
func (q *WriteQueue) retryOrDrop(data *GameResultData) {
        if data == nil {
                return
        }

        data.RetryCount++

        if data.RetryCount >= q.config.MaxRetries {
                log.Printf("❌ [WriteQueue] 数据丢弃，超过最大重试次数(%d): GameID=%s, RoomID=%s",
                        data.RetryCount, data.GameID, data.RoomID)
                // 🔧【新增】记录丢弃的数据到错误日志，供 admin 后台查看
                q.recordError("data_dropped",
                        fmt.Sprintf("超过最大重试次数(%d)", data.RetryCount),
                        fmt.Sprintf("GameID=%s, RoomID=%s", data.GameID, data.RoomID))
                // 🔧【关键】标记持久化数据为失败状态
                q.markDataFailed(data.GameID, data.RetryCount)
                return
        }

        atomic.AddUint64(&q.totalRetries, 1)

        // 🔧【关键】更新持久化数据的重试次数
        q.markDataFailed(data.GameID, data.RetryCount)

        // 计算退避延迟
        delay := q.config.RetryBaseDelay * time.Duration(1<<uint(data.RetryCount-1))
        if delay > q.config.RetryMaxDelay {
                delay = q.config.RetryMaxDelay
        }

        log.Printf("🔄 [WriteQueue] 准备重试: GameID=%s, 第%d次重试, 延迟=%v",
                data.GameID, data.RetryCount, delay)

        // 异步重试（使用 time.AfterFunc 更安全）
        // 🔧【安全】添加 panic 恢复，防止重试协程崩溃
        time.AfterFunc(delay, func() {
                defer func() {
                        if r := recover(); r != nil {
                                log.Printf("❌ [WriteQueue] 重试协程发生 panic: %v, GameID=%s", r, data.GameID)
                                q.recordError("retry_panic",
                                        fmt.Sprintf("重试协程 panic: %v", r),
                                        fmt.Sprintf("GameID=%s", data.GameID))
                                q.markDataFailed(data.GameID, data.RetryCount)
                        }
                }()

                // 再次检查队列是否仍在运行（使用原子操作）
                if atomic.LoadInt32(&q.started) == 0 {
                        log.Printf("⚠️ [WriteQueue] 队列已停止，取消重试 GameID=%s", data.GameID)
                        return
                }
                // 重试时直接写入，避免队列循环
                if err := q.writeSingleNoLimit(data); err != nil {
                        log.Printf("❌ [WriteQueue] 重试写入失败: %v, GameID=%s", err, data.GameID)
                        // 错误已在 writeSingleNoLimit 中记录，这里不再重复记录
                } else {
                        // 重试成功，更新统计
                        log.Printf("✅ [WriteQueue] 重试成功: GameID=%s", data.GameID)
                }
        })
}

// =============================================
// 监控指标
// =============================================

// metricsReporter 指标上报协程
// 🔧【安全】添加 panic 恢复机制，防止崩溃
// 🔧【关键】panic 后尝试重启，确保监控持续运行
func (q *WriteQueue) metricsReporter() {
        defer func() {
                q.wg.Done()
                if r := recover(); r != nil {
                        log.Printf("❌ [WriteQueue] metricsReporter 发生 panic: %v", r)
                        q.recordError("metrics_panic", fmt.Sprintf("metricsReporter panic: %v", r), "")

                        // 🔧【关键修复】尝试重启 metricsReporter
                        if atomic.LoadInt32(&q.started) == 1 {
                                log.Printf("🔄 [WriteQueue] 尝试重启 metricsReporter...")
                                q.wg.Add(1)
                                go q.metricsReporter()
                        }
                }
        }()

        ticker := time.NewTicker(q.config.MetricsInterval)
        defer ticker.Stop()

        for {
                select {
                case <-q.ctx.Done():
                        return
                case <-ticker.C:
                        // 🔧【安全】为 reportMetrics 添加 panic 保护
                        func() {
                                defer func() {
                                        if r := recover(); r != nil {
                                                log.Printf("❌ [WriteQueue] reportMetrics panic: %v", r)
                                                q.recordError("report_metrics_panic", fmt.Sprintf("reportMetrics panic: %v", r), "")
                                        }
                                }()
                                q.reportMetrics()
                        }()
                }
        }
}

// reportMetrics 上报指标
func (q *WriteQueue) reportMetrics() {
        // 使用原子操作读取上次上报时间
        lastNano := atomic.LoadInt64(&q.lastMetricsNano)
        lastTime := time.Unix(0, lastNano)
        elapsed := time.Since(lastTime)
        if elapsed == 0 {
                return
        }

        submitted := atomic.LoadUint64(&q.totalSubmitted)
        processed := atomic.LoadUint64(&q.totalProcessed)
        success := atomic.LoadUint64(&q.totalSuccess)
        failed := atomic.LoadUint64(&q.totalFailed)
        retries := atomic.LoadUint64(&q.totalRetries)
        queueLen := atomic.LoadUint64(&q.currentQueueLen)

        // 计算速率
        submitRate := float64(submitted) / elapsed.Seconds()
        processRate := float64(processed) / elapsed.Seconds()

        var successRate float64
        if processed > 0 {
                successRate = float64(success) / float64(processed) * 100
        }

        log.Printf("📊 [WriteQueue] 指标报告:")
        log.Printf("   📈 提交速率: %.1f/s, 处理速率: %.1f/s", submitRate, processRate)
        log.Printf("   📈 成功率: %.1f%%, 失败数: %d, 重试数: %d", successRate, failed, retries)
        if q.tokenBucket != nil {
                log.Printf("   📈 队列长度: %d/%d, 可用令牌: %d",
                        queueLen, q.config.QueueSize, q.tokenBucket.Available())
        } else {
                log.Printf("   📈 队列长度: %d/%d", queueLen, q.config.QueueSize)
        }

        // 更新时间（使用原子操作）
        atomic.StoreInt64(&q.lastMetricsNano, time.Now().UnixNano())
}

// GetMetrics 获取当前指标
func (q *WriteQueue) GetMetrics() map[string]interface{} {
        metrics := map[string]interface{}{
                "total_submitted": atomic.LoadUint64(&q.totalSubmitted),
                "total_processed": atomic.LoadUint64(&q.totalProcessed),
                "total_success":   atomic.LoadUint64(&q.totalSuccess),
                "total_failed":    atomic.LoadUint64(&q.totalFailed),
                "total_retries":   atomic.LoadUint64(&q.totalRetries),
                "queue_length":    atomic.LoadUint64(&q.currentQueueLen),
                "queue_capacity":  q.config.QueueSize,
                "started":         atomic.LoadInt32(&q.started) == 1,
        }
        if q.tokenBucket != nil {
                metrics["tokens_available"] = q.tokenBucket.Available()
        }
        return metrics
}

// =============================================
// 全局便捷函数
// =============================================

// StartWriteQueue 启动写入队列
func StartWriteQueue(db *gorm.DB) {
        q := GetWriteQueue()
        q.Start(db)
}

// StopWriteQueue 停止写入队列
func StopWriteQueue() {
        q := GetWriteQueue()
        q.Stop()
}

// SubmitGameResult 提交游戏结果
func SubmitGameResult(data *GameResultData) error {
        q := GetWriteQueue()
        return q.Submit(data)
}

// SubmitGameResultBlocking 阻塞式提交游戏结果
func SubmitGameResultBlocking(data *GameResultData) {
        q := GetWriteQueue()
        q.SubmitBlocking(data)
}

// GetWriteQueueMetrics 获取写入队列指标
func GetWriteQueueMetrics() map[string]interface{} {
        q := GetWriteQueue()
        return q.GetMetrics()
}

// =============================================
// 错误记录（供 admin 后台查看）
// =============================================

// WriteQueueErrorLog 写入队列错误日志
// 🔧【新增】记录错误到数据库，供 admin 后台查看
type WriteQueueErrorLog struct {
        ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
        ErrorType   string    `gorm:"type:varchar(50);index" json:"error_type"`     // 错误类型
        ErrorMsg    string    `gorm:"type:varchar(500)" json:"error_msg"`            // 错误消息
        ErrorDetail string    `gorm:"type:varchar(500)" json:"error_detail"`         // 错误详情
        Resolved    uint8     `gorm:"default:0;index" json:"resolved"`               // 是否已解决: 0-未解决, 1-已解决
        CreatedAt   time.Time `gorm:"autoCreateTime;index" json:"created_at"`        // 创建时间
}

// TableName 指定表名
func (WriteQueueErrorLog) TableName() string {
        return "ddz_write_queue_error_logs"
}

// =============================================
// 待处理数据持久化（防止服务器异常丢失数据）
// =============================================

// PendingGameData 待处理游戏数据
// 🔧【新增】持久化待处理数据，服务器异常重启后可恢复
type PendingGameData struct {
        ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
        GameID    string    `gorm:"type:varchar(64);uniqueIndex" json:"game_id"` // 游戏ID，唯一标识
        DataJSON  string    `gorm:"type:text" json:"data_json"`                         // 序列化的游戏数据（JSON格式）
        Status    uint8     `gorm:"default:0;index" json:"status"`                      // 状态: 0-待处理, 1-处理中, 2-处理成功, 3-处理失败
        RetryCount int       `gorm:"default:0" json:"retry_count"`                       // 重试次数
        CreatedAt time.Time `gorm:"autoCreateTime;index" json:"created_at"`             // 创建时间
        UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`                   // 更新时间
}

// TableName 指定表名
func (PendingGameData) TableName() string {
        return "ddz_pending_game_data"
}

// PendingGameDataStatus 状态常量
const (
        PendingStatusPending   uint8 = 0 // 待处理
        PendingStatusProcessing uint8 = 1 // 处理中
        PendingStatusSuccess    uint8 = 2 // 处理成功
        PendingStatusFailed     uint8 = 3 // 处理失败
)

// recordError 记录错误到数据库
// 🔧【新增】将错误持久化，供 admin 后台查看
func (q *WriteQueue) recordError(errorType, errorMsg, errorDetail string) {
        // 先记录到日志
        log.Printf("❌ [WriteQueue.Error] type=%s, msg=%s, detail=%s", errorType, errorMsg, errorDetail)

        // 如果数据库连接不可用，只记录日志
        if q.db == nil {
                log.Printf("❌ [WriteQueue.Error] 数据库连接为空，无法记录错误到数据库")
                return
        }

        // 创建错误日志记录
        errorLog := &WriteQueueErrorLog{
                ErrorType:   errorType,
                ErrorMsg:    errorMsg,
                ErrorDetail: errorDetail,
                Resolved:    0,
                CreatedAt:   time.Now(),
        }

        // 异步写入数据库，避免阻塞主流程
        go func() {
                defer func() {
                        if r := recover(); r != nil {
                                log.Printf("❌ [WriteQueue.Error] 记录错误时发生 panic: %v", r)
                        }
                }()

                if err := q.db.Create(errorLog).Error; err != nil {
                        log.Printf("❌ [WriteQueue.Error] 无法写入错误日志到数据库: %v", err)
                }
        }()
}

// GetWriteQueueErrorLogs 获取写入队列错误日志列表
// 🔧【新增】供 admin 后台调用
// 🔧【安全】添加数据库连接检查
func GetWriteQueueErrorLogs(page, pageSize int, resolved *uint8) ([]WriteQueueErrorLog, int64, error) {
        // 🔧【安全】检查数据库实例
        dbInstance := GetInstance()
        if dbInstance == nil {
                return nil, 0, fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return nil, 0, fmt.Errorf("数据库连接未建立")
        }

        var logs []WriteQueueErrorLog
        var total int64

        db := dbConn.Model(&WriteQueueErrorLog{})
        if resolved != nil {
                db = db.Where("resolved = ?", *resolved)
        }

        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
                return nil, 0, err
        }

        return logs, total, nil
}

// ResolveWriteQueueError 标记错误为已解决
// 🔧【新增】供 admin 后台调用
// 🔧【安全】添加数据库连接检查
func ResolveWriteQueueError(id uint64) error {
        // 🔧【安全】检查数据库实例
        dbInstance := GetInstance()
        if dbInstance == nil {
                return fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return fmt.Errorf("数据库连接未建立")
        }

        return dbConn.Model(&WriteQueueErrorLog{}).
                Where("id = ?", id).
                Update("resolved", 1).Error
}

// GetWriteQueueErrorStats 获取错误统计
// 🔧【新增】供 admin 后台调用
// 🔧【安全】添加数据库连接检查
func GetWriteQueueErrorStats() (map[string]interface{}, error) {
        // 🔧【安全】检查数据库实例
        dbInstance := GetInstance()
        if dbInstance == nil {
                return nil, fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return nil, fmt.Errorf("数据库连接未建立")
        }

        var total, unresolved, resolved int64

        db := dbConn.Model(&WriteQueueErrorLog{})

        if err := db.Count(&total).Error; err != nil {
                return nil, err
        }

        if err := db.Where("resolved = 0").Count(&unresolved).Error; err != nil {
                return nil, err
        }

        resolved = total - unresolved

        // 按错误类型统计
        type ErrorTypeCount struct {
                ErrorType string
                Count     int64
        }
        var typeCounts []ErrorTypeCount
        if err := db.Select("error_type, count(*) as count").
                Group("error_type").
                Order("count DESC").
                Limit(10).
                Find(&typeCounts).Error; err != nil {
                return nil, err
        }

        return map[string]interface{}{
                "total":       total,
                "unresolved":  unresolved,
                "resolved":    resolved,
                "type_counts": typeCounts,
        }, nil
}

// =============================================
// 数据持久化和恢复（防止服务器异常丢失数据）
// =============================================

// pendingGameDataAdapter 用于JSON序列化的适配器
// 🔧【说明】由于 DealLogs, BidLogs, PlayLogs 是切片，需要单独处理
type pendingGameDataAdapter struct {
        RoomCode            string       `json:"room_code"`
        GameID              string       `json:"game_id"`
        RoomID              string       `json:"room_id"`
        RoomType            uint8        `json:"room_type"`
        RoomCategory        uint8        `json:"room_category"`
        LandlordID          uint64       `json:"landlord_id"`
        Farmer1ID           uint64       `json:"farmer1_id"`
        Farmer2ID           uint64       `json:"farmer2_id"`
        BaseScore           int          `json:"base_score"`
        Multiplier          int          `json:"multiplier"`
        BombCount           int          `json:"bomb_count"`
        Spring              uint8        `json:"spring"`
        Result              uint8        `json:"result"`
        LandlordWinGold     int64        `json:"landlord_win_gold"`
        Farmer1WinGold      int64        `json:"farmer1_win_gold"`
        Farmer2WinGold      int64        `json:"farmer2_win_gold"`
        LandlordWinArenaCoin int64       `json:"landlord_win_arena_coin"`
        Farmer1WinArenaCoin int64        `json:"farmer1_win_arena_coin"`
        Farmer2WinArenaCoin int64        `json:"farmer2_win_arena_coin"`
        DurationSeconds     int          `json:"duration_seconds"`
        StartedAt           time.Time    `json:"started_at"`
        EndedAt             *time.Time   `json:"ended_at,omitempty"`
        DealLogs            []DealLog    `json:"deal_logs"`
        BidLogs             []BidLog     `json:"bid_logs"`
        PlayLogs            []PlayLog    `json:"play_logs"`
        RetryCount          int          `json:"retry_count"`
}

// ToJSON 将 GameResultData 序列化为 JSON
func (data *GameResultData) ToJSON() (string, error) {
        adapter := pendingGameDataAdapter{
                RoomCode:             data.RoomCode,
                GameID:               data.GameID,
                RoomID:               data.RoomID,
                RoomType:             data.RoomType,
                RoomCategory:         data.RoomCategory,
                LandlordID:           data.LandlordID,
                Farmer1ID:            data.Farmer1ID,
                Farmer2ID:            data.Farmer2ID,
                BaseScore:            data.BaseScore,
                Multiplier:           data.Multiplier,
                BombCount:            data.BombCount,
                Spring:               data.Spring,
                Result:               data.Result,
                LandlordWinGold:      data.LandlordWinGold,
                Farmer1WinGold:       data.Farmer1WinGold,
                Farmer2WinGold:       data.Farmer2WinGold,
                LandlordWinArenaCoin: data.LandlordWinArenaCoin,
                Farmer1WinArenaCoin:  data.Farmer1WinArenaCoin,
                Farmer2WinArenaCoin:  data.Farmer2WinArenaCoin,
                DurationSeconds:      data.DurationSeconds,
                StartedAt:            data.StartedAt,
                EndedAt:              data.EndedAt,
                DealLogs:             data.DealLogs,
                BidLogs:              data.BidLogs,
                PlayLogs:             data.PlayLogs,
                RetryCount:           data.RetryCount,
        }
        bytes, err := json.Marshal(adapter)
        if err != nil {
                return "", err
        }
        return string(bytes), nil
}

// FromJSON 从 JSON 反序列化为 GameResultData
func (data *GameResultData) FromJSON(jsonStr string) error {
        var adapter pendingGameDataAdapter
        if err := json.Unmarshal([]byte(jsonStr), &adapter); err != nil {
                return err
        }
        data.RoomCode = adapter.RoomCode
        data.GameID = adapter.GameID
        data.RoomID = adapter.RoomID
        data.RoomType = adapter.RoomType
        data.RoomCategory = adapter.RoomCategory
        data.LandlordID = adapter.LandlordID
        data.Farmer1ID = adapter.Farmer1ID
        data.Farmer2ID = adapter.Farmer2ID
        data.BaseScore = adapter.BaseScore
        data.Multiplier = adapter.Multiplier
        data.BombCount = adapter.BombCount
        data.Spring = adapter.Spring
        data.Result = adapter.Result
        data.LandlordWinGold = adapter.LandlordWinGold
        data.Farmer1WinGold = adapter.Farmer1WinGold
        data.Farmer2WinGold = adapter.Farmer2WinGold
        data.LandlordWinArenaCoin = adapter.LandlordWinArenaCoin
        data.Farmer1WinArenaCoin = adapter.Farmer1WinArenaCoin
        data.Farmer2WinArenaCoin = adapter.Farmer2WinArenaCoin
        data.DurationSeconds = adapter.DurationSeconds
        data.StartedAt = adapter.StartedAt
        data.EndedAt = adapter.EndedAt
        data.DealLogs = adapter.DealLogs
        data.BidLogs = adapter.BidLogs
        data.PlayLogs = adapter.PlayLogs
        data.RetryCount = adapter.RetryCount
        return nil
}

// persistData 持久化数据到数据库
// 🔧【关键】在入队前先持久化，确保数据不丢失
func (q *WriteQueue) persistData(data *GameResultData) error {
        if data == nil || q.db == nil {
                return nil
        }

        // 序列化数据
        jsonStr, err := data.ToJSON()
        if err != nil {
                log.Printf("❌ [WriteQueue] 序列化数据失败: %v, GameID=%s", err, data.GameID)
                return err
        }

        // 检查是否已存在
        var existing PendingGameData
        result := q.db.Where("game_id = ?", data.GameID).First(&existing)
        if result.Error == nil {
                // 已存在，更新
                return q.db.Model(&existing).Updates(map[string]interface{}{
                        "data_json":   jsonStr,
                        "status":      PendingStatusPending,
                        "retry_count": data.RetryCount,
                }).Error
        }

        // 不存在，创建新记录
        pending := &PendingGameData{
                GameID:     data.GameID,
                DataJSON:   jsonStr,
                Status:     PendingStatusPending,
                RetryCount: data.RetryCount,
        }
        return q.db.Create(pending).Error
}

// markDataProcessed 标记数据处理成功
// 🔧【关键】处理成功后删除持久化记录（或标记为成功）
func (q *WriteQueue) markDataProcessed(gameID string) error {
        if q.db == nil {
                return nil
        }
        // 删除已成功处理的记录（也可以改为标记状态）
        return q.db.Where("game_id = ?", gameID).Delete(&PendingGameData{}).Error
}

// markDataProcessing 标记数据处理中
func (q *WriteQueue) markDataProcessing(gameID string) error {
        if q.db == nil {
                return nil
        }
        return q.db.Model(&PendingGameData{}).
                Where("game_id = ?", gameID).
                Update("status", PendingStatusProcessing).Error
}

// markDataFailed 标记数据处理失败
func (q *WriteQueue) markDataFailed(gameID string, retryCount int) error {
        if q.db == nil {
                return nil
        }
        return q.db.Model(&PendingGameData{}).
                Where("game_id = ?", gameID).
                Updates(map[string]interface{}{
                        "status":      PendingStatusFailed,
                        "retry_count": retryCount,
                }).Error
}

// RecoverPendingData 恢复未处理的数据
// 🔧【关键】服务启动时调用，恢复上次异常时未处理完的数据
func (q *WriteQueue) RecoverPendingData() error {
        if q.db == nil {
                log.Printf("⚠️ [WriteQueue] 数据库连接为空，无法恢复待处理数据")
                return nil
        }

        // 查询所有待处理和处理中的数据（可能是上次异常停止时留下的）
        // 🔧【修复】使用 int 切片代替 uint8 切片，避免 GORM 将其当作二进制数据处理
        var pendingList []PendingGameData
        if err := q.db.Where("status IN ?", []int{int(PendingStatusPending), int(PendingStatusProcessing)}).
                Find(&pendingList).Error; err != nil {
                log.Printf("❌ [WriteQueue] 查询待处理数据失败: %v", err)
                return err
        }

        if len(pendingList) == 0 {
                log.Printf("✅ [WriteQueue] 没有待恢复的数据")
                return nil
        }

        log.Printf("🔄 [WriteQueue] 开始恢复 %d 条待处理数据...", len(pendingList))

        recoveredCount := 0
        for _, pending := range pendingList {
                // 反序列化数据
                var data GameResultData
                if err := data.FromJSON(pending.DataJSON); err != nil {
                        log.Printf("❌ [WriteQueue] 反序列化数据失败: %v, GameID=%s", err, pending.GameID)
                        // 标记为失败
                        q.db.Model(&PendingGameData{}).
                                Where("id = ?", pending.ID).
                                Update("status", PendingStatusFailed)
                        continue
                }

                // 重置状态为待处理
                q.db.Model(&PendingGameData{}).
                        Where("id = ?", pending.ID).
                        Update("status", PendingStatusPending)

                // 提交到队列（非阻塞）
                if err := q.Submit(&data); err != nil {
                        log.Printf("❌ [WriteQueue] 提交数据到队列失败: %v, GameID=%s", err, pending.GameID)
                        continue
                }

                recoveredCount++
        }

        log.Printf("✅ [WriteQueue] 成功恢复 %d/%d 条数据", recoveredCount, len(pendingList))
        return nil
}

// GetPendingGameDataList 获取待处理数据列表
// 🔧【新增】供 admin 后台调用
func GetPendingGameDataList(page, pageSize int, status *uint8) ([]PendingGameData, int64, error) {
        dbInstance := GetInstance()
        if dbInstance == nil {
                return nil, 0, fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return nil, 0, fmt.Errorf("数据库连接未建立")
        }

        var list []PendingGameData
        var total int64

        db := dbConn.Model(&PendingGameData{})
        if status != nil {
                db = db.Where("status = ?", *status)
        }

        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
                return nil, 0, err
        }

        return list, total, nil
}

// GetPendingGameDataStats 获取待处理数据统计
// 🔧【新增】供 admin 后台调用
func GetPendingGameDataStats() (map[string]interface{}, error) {
        dbInstance := GetInstance()
        if dbInstance == nil {
                return nil, fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return nil, fmt.Errorf("数据库连接未建立")
        }

        var total, pending, processing, success, failed int64

        db := dbConn.Model(&PendingGameData{})

        if err := db.Count(&total).Error; err != nil {
                return nil, err
        }

        if err := db.Where("status = ?", PendingStatusPending).Count(&pending).Error; err != nil {
                return nil, err
        }

        if err := db.Where("status = ?", PendingStatusProcessing).Count(&processing).Error; err != nil {
                return nil, err
        }

        if err := db.Where("status = ?", PendingStatusSuccess).Count(&success).Error; err != nil {
                return nil, err
        }

        if err := db.Where("status = ?", PendingStatusFailed).Count(&failed).Error; err != nil {
                return nil, err
        }

        return map[string]interface{}{
                "total":      total,
                "pending":    pending,
                "processing": processing,
                "success":    success,
                "failed":     failed,
        }, nil
}

// RetryPendingGameData 重试处理失败的待处理数据
// 🔧【新增】供 admin 后台手动触发重试
func RetryPendingGameData(gameID string) error {
        q := GetWriteQueue()
        if !q.IsStarted() {
                return fmt.Errorf("写入队列未启动")
        }

        dbInstance := GetInstance()
        if dbInstance == nil {
                return fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return fmt.Errorf("数据库连接未建立")
        }

        // 查询数据
        var pending PendingGameData
        if err := dbConn.Where("game_id = ?", gameID).First(&pending).Error; err != nil {
                return fmt.Errorf("数据不存在: %v", err)
        }

        // 反序列化
        var data GameResultData
        if err := data.FromJSON(pending.DataJSON); err != nil {
                return fmt.Errorf("反序列化失败: %v", err)
        }

        // 重置状态
        if err := dbConn.Model(&PendingGameData{}).
                Where("game_id = ?", gameID).
                Update("status", PendingStatusPending).Error; err != nil {
                return err
        }

        // 提交到队列
        return q.Submit(&data)
}

// DeletePendingGameData 删除待处理数据记录
// 🔧【新增】供 admin 后台调用（清理已成功或不再需要的数据）
func DeletePendingGameData(gameID string) error {
        dbInstance := GetInstance()
        if dbInstance == nil {
                return fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return fmt.Errorf("数据库连接未建立")
        }

        return dbConn.Where("game_id = ?", gameID).Delete(&PendingGameData{}).Error
}

// CleanupOldPendingData 清理过期的待处理数据
// 🔧【新增】定期清理成功或过期的数据
func CleanupOldPendingData(olderThanDays int) (int64, error) {
        dbInstance := GetInstance()
        if dbInstance == nil {
                return 0, fmt.Errorf("数据库实例未初始化")
        }

        dbConn := dbInstance.GetDB()
        if dbConn == nil {
                return 0, fmt.Errorf("数据库连接未建立")
        }

        cutoffTime := time.Now().AddDate(0, 0, -olderThanDays)
        result := dbConn.Where("status = ? AND created_at < ?", PendingStatusSuccess, cutoffTime).
                Delete(&PendingGameData{})

        return result.RowsAffected, result.Error
}
