// Package database 提供数据写入队列系统
// 🔧【优化】减轻高并发下的数据库存储压力
package database

import (
        "context"
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
func (q *WriteQueue) Submit(data *GameResultData) error {
        if data == nil {
                return nil
        }

        // 检查队列是否已初始化
        if q.queue == nil {
                log.Printf("⚠️ [WriteQueue] 队列未初始化，直接写入")
                return q.writeSingleNoLimit(data)
        }

        data.SubmitTime = time.Now()
        data.CreatedAt = time.Now()

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
func (q *WriteQueue) SubmitBlocking(data *GameResultData) {
        if data == nil {
                return
        }

        // 检查队列是否已初始化
        if q.queue == nil {
                log.Printf("⚠️ [WriteQueue] 队列未初始化，直接写入")
                q.writeSingleNoLimit(data)
                return
        }

        data.SubmitTime = time.Now()
        data.CreatedAt = time.Now()

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
func (q *WriteQueue) worker() {
        defer q.wg.Done()

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
                                q.flushBatch()
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
                        q.flushBatch()
                        batchTimer.Reset(q.config.BatchTimeout)
                }
        }
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
func (q *WriteQueue) writeBatchNoLimit(batch []*GameResultData) {
        if len(batch) == 0 {
                return
        }

        // 检查数据库连接
        if q.db == nil {
                log.Printf("❌ [WriteQueue] 数据库连接为空，无法写入 %d 条数据", len(batch))
                return
        }

        startTime := time.Now()
        atomic.AddUint64(&q.totalProcessed, uint64(len(batch)))

        // 使用事务批量写入
        err := q.db.Transaction(func(tx *gorm.DB) error {
                for _, data := range batch {
                        if data == nil {
                                continue
                        }

                        // 创建游戏记录
                        record := &GameRecord{
                                GameID:              data.GameID,
                                RoomID:              data.RoomID,
                                RoomType:            data.RoomType,
                                RoomCategory:        data.RoomCategory,
                                LandlordID:          data.LandlordID,
                                Farmer1ID:           data.Farmer1ID,
                                Farmer2ID:           data.Farmer2ID,
                                BaseScore:           data.BaseScore,
                                Multiplier:          data.Multiplier,
                                BombCount:           data.BombCount,
                                Spring:              data.Spring,
                                Result:              data.Result,
                                LandlordWinGold:     data.LandlordWinGold,
                                Farmer1WinGold:      data.Farmer1WinGold,
                                Farmer2WinGold:      data.Farmer2WinGold,
                                LandlordWinArenaCoin: data.LandlordWinArenaCoin,
                                Farmer1WinArenaCoin: data.Farmer1WinArenaCoin,
                                Farmer2WinArenaCoin: data.Farmer2WinArenaCoin,
                                StartedAt:           data.StartedAt,
                                EndedAt:             data.EndedAt,
                                DurationSeconds:     data.DurationSeconds,
                        }

                        if err := tx.Create(record).Error; err != nil {
                                return err
                        }

                        // 保存发牌日志
                        if len(data.DealLogs) > 0 {
                                if err := tx.Create(&data.DealLogs).Error; err != nil {
                                        return err
                                }
                        }

                        // 保存叫地主日志
                        if len(data.BidLogs) > 0 {
                                if err := tx.Create(&data.BidLogs).Error; err != nil {
                                        return err
                                }
                        }

                        // 保存出牌日志
                        if len(data.PlayLogs) > 0 {
                                if err := tx.Create(&data.PlayLogs).Error; err != nil {
                                        return err
                                }
                        }

                        // 更新玩家金币
                        if err := UpdatePlayerGoldWithTx(tx, data.LandlordID, data.LandlordWinGold); err != nil {
                                return err
                        }
                        if err := UpdatePlayerGoldWithTx(tx, data.Farmer1ID, data.Farmer1WinGold); err != nil {
                                return err
                        }
                        if err := UpdatePlayerGoldWithTx(tx, data.Farmer2ID, data.Farmer2WinGold); err != nil {
                                return err
                        }

                        // 更新玩家统计
                        landlordWin := data.Result == GameResultLandlordWin
                        if err := UpdatePlayerStatsWithTx(tx, data.LandlordID, landlordWin, true); err != nil {
                                return err
                        }
                        if err := UpdatePlayerStatsWithTx(tx, data.Farmer1ID, !landlordWin, false); err != nil {
                                return err
                        }
                        if err := UpdatePlayerStatsWithTx(tx, data.Farmer2ID, !landlordWin, false); err != nil {
                                return err
                        }
                }
                return nil
        })

        elapsed := time.Since(startTime)

        if err != nil {
                log.Printf("❌ [WriteQueue] 批量写入失败: %v, 数量: %d, 耗时: %v", err, len(batch), elapsed)
                atomic.AddUint64(&q.totalFailed, uint64(len(batch)))

                // 重试逻辑 - 只在队列启动时才重试
                if atomic.LoadInt32(&q.started) == 1 {
                        for _, data := range batch {
                                if data != nil {
                                        q.retryOrDrop(data)
                                }
                        }
                }
        } else {
                atomic.AddUint64(&q.totalSuccess, uint64(len(batch)))
                log.Printf("✅ [WriteQueue] 批量写入成功: 数量=%d, 耗时=%v", len(batch), elapsed)
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
func (q *WriteQueue) writeSingleNoLimit(data *GameResultData) error {
        if data == nil {
                return nil
        }

        // 检查数据库连接
        if q.db == nil {
                log.Printf("❌ [WriteQueue] 数据库连接为空，无法写入 GameID=%s", data.GameID)
                return fmt.Errorf("数据库连接为空")
        }

        atomic.AddUint64(&q.totalProcessed, 1)

        // 使用事务写入
        err := SaveGameResult(
                &GameRecord{
                        GameID:              data.GameID,
                        RoomID:              data.RoomID,
                        RoomType:            data.RoomType,
                        RoomCategory:        data.RoomCategory,
                        LandlordID:          data.LandlordID,
                        Farmer1ID:           data.Farmer1ID,
                        Farmer2ID:           data.Farmer2ID,
                        BaseScore:           data.BaseScore,
                        Multiplier:          data.Multiplier,
                        BombCount:           data.BombCount,
                        Spring:              data.Spring,
                        Result:              data.Result,
                        LandlordWinGold:     data.LandlordWinGold,
                        Farmer1WinGold:      data.Farmer1WinGold,
                        Farmer2WinGold:      data.Farmer2WinGold,
                        LandlordWinArenaCoin: data.LandlordWinArenaCoin,
                        Farmer1WinArenaCoin: data.Farmer1WinArenaCoin,
                        Farmer2WinArenaCoin: data.Farmer2WinArenaCoin,
                        StartedAt:           data.StartedAt,
                        EndedAt:             data.EndedAt,
                        DurationSeconds:     data.DurationSeconds,
                },
                data.DealLogs,
                data.BidLogs,
                data.PlayLogs,
        )

        if err != nil {
                atomic.AddUint64(&q.totalFailed, 1)
                // 只在队列启动时才重试
                if atomic.LoadInt32(&q.started) == 1 {
                        q.retryOrDrop(data)
                }
                return err
        }

        atomic.AddUint64(&q.totalSuccess, 1)
        return nil
}

// retryOrDrop 重试或丢弃
func (q *WriteQueue) retryOrDrop(data *GameResultData) {
        if data == nil {
                return
        }

        data.RetryCount++

        if data.RetryCount >= q.config.MaxRetries {
                log.Printf("❌ [WriteQueue] 数据丢弃，超过最大重试次数(%d): GameID=%s, RoomID=%s",
                        data.RetryCount, data.GameID, data.RoomID)
                return
        }

        atomic.AddUint64(&q.totalRetries, 1)

        // 计算退避延迟
        delay := q.config.RetryBaseDelay * time.Duration(1<<uint(data.RetryCount-1))
        if delay > q.config.RetryMaxDelay {
                delay = q.config.RetryMaxDelay
        }

        log.Printf("🔄 [WriteQueue] 准备重试: GameID=%s, 第%d次重试, 延迟=%v",
                data.GameID, data.RetryCount, delay)

        // 异步重试（使用 time.AfterFunc 更安全）
        time.AfterFunc(delay, func() {
                // 再次检查队列是否仍在运行（使用原子操作）
                if atomic.LoadInt32(&q.started) == 0 {
                        log.Printf("⚠️ [WriteQueue] 队列已停止，取消重试 GameID=%s", data.GameID)
                        return
                }
                // 重试时直接写入，避免队列循环
                if err := q.writeSingleNoLimit(data); err != nil {
                        log.Printf("❌ [WriteQueue] 重试写入失败: %v, GameID=%s", err, data.GameID)
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
func (q *WriteQueue) metricsReporter() {
        defer q.wg.Done()

        ticker := time.NewTicker(q.config.MetricsInterval)
        defer ticker.Stop()

        for {
                select {
                case <-q.ctx.Done():
                        return
                case <-ticker.C:
                        q.reportMetrics()
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
