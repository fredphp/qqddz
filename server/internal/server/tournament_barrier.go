// Package server 提供竞技场跨桌同步屏障
package server

import (
        "log"
        "sync"
        "time"
)

// =============================================
// TournamentRoundBarrier - 跨桌同步屏障
// 核心机制：确保所有桌完成后才能推进到下一轮
// =============================================

// TournamentRoundBarrier 跨桌同步屏障
type TournamentRoundBarrier struct {
        periodNo       string
        round          int
        totalTables    int
        finishedTables map[uint64]bool // tableID -> finished
        advanced       bool            // 是否已推进（防重入）
        advancedTime   time.Time       // 推进时间

        // 玩家ID列表（用于广播）
        playerIDs []string

        // 超时保护
        maxWaitSeconds int
        startTime      time.Time
        timeoutTriggered bool

        // 回调函数
        onAllFinished    func(periodNo string, round int, playerIDs []string)
        onTimeout        func(periodNo string, round int)

        mu sync.RWMutex
}

// NewTournamentRoundBarrier 创建跨桌同步屏障
func NewTournamentRoundBarrier(periodNo string, round, totalTables int, playerIDs []string) *TournamentRoundBarrier {
        return &TournamentRoundBarrier{
                periodNo:        periodNo,
                round:           round,
                totalTables:     totalTables,
                finishedTables:  make(map[uint64]bool),
                advanced:        false,
                playerIDs:       playerIDs,
                maxWaitSeconds:  120, // 默认120秒超时
                startTime:       time.Now(),
                timeoutTriggered: false,
        }
}

// SetMaxWaitSeconds 设置最大等待时间
func (b *TournamentRoundBarrier) SetMaxWaitSeconds(seconds int) {
        b.mu.Lock()
        defer b.mu.Unlock()
        b.maxWaitSeconds = seconds
}

// SetOnAllFinished 设置全部完成回调
func (b *TournamentRoundBarrier) SetOnAllFinished(callback func(periodNo string, round int, playerIDs []string)) {
        b.mu.Lock()
        defer b.mu.Unlock()
        b.onAllFinished = callback
}

// SetOnTimeout 设置超时回调
func (b *TournamentRoundBarrier) SetOnTimeout(callback func(periodNo string, round int)) {
        b.mu.Lock()
        defer b.mu.Unlock()
        b.onTimeout = callback
}

// RegisterTableFinished 标记桌完成
// 返回值: (是否全部完成, 当前已完成桌数, 总桌数)
func (b *TournamentRoundBarrier) RegisterTableFinished(tableID uint64, playerIDs []string) (bool, int, int) {
        b.mu.Lock()
        defer b.mu.Unlock()

        // 检查是否已推进
        if b.advanced {
                log.Printf("[TOURNAMENT] ⚠️ 屏障已推进，忽略桌完成: periodNo=%s, tableID=%d", b.periodNo, tableID)
                return false, b.totalTables, b.totalTables
        }

        // 检查是否已记录
        if b.finishedTables[tableID] {
                log.Printf("[TOURNAMENT] ⚠️ 桌已完成，忽略重复标记: periodNo=%s, tableID=%d", b.periodNo, tableID)
                return false, len(b.finishedTables), b.totalTables
        }

        // 记录桌完成
        b.finishedTables[tableID] = true

        // 合并玩家ID
        for _, pid := range playerIDs {
                found := false
                for _, existing := range b.playerIDs {
                        if existing == pid {
                                found = true
                                break
                        }
                }
                if !found {
                        b.playerIDs = append(b.playerIDs, pid)
                }
        }

        finishedCount := len(b.finishedTables)
        log.Printf("[TOURNAMENT] 桌完成: periodNo=%s, round=%d, tableID=%d, progress=%d/%d",
                b.periodNo, b.round, tableID, finishedCount, b.totalTables)

        // 检查是否全部完成
        if finishedCount >= b.totalTables {
                log.Printf("[TOURNAMENT] ✅ 所有桌完成: periodNo=%s, round=%d, finished=%d/%d",
                        b.periodNo, b.round, finishedCount, b.totalTables)
                return true, finishedCount, b.totalTables
        }

        return false, finishedCount, b.totalTables
}

// IsAllFinished 检查是否全部完成
func (b *TournamentRoundBarrier) IsAllFinished() bool {
        b.mu.RLock()
        defer b.mu.RUnlock()
        return len(b.finishedTables) >= b.totalTables
}

// AdvanceOnce 推进到下一轮（只允许一次）
// 返回值: 是否成功推进（false表示已推进过）
func (b *TournamentRoundBarrier) AdvanceOnce() bool {
        b.mu.Lock()
        defer b.mu.Unlock()

        // 检查是否已推进
        if b.advanced {
                log.Printf("[TOURNAMENT] ⚠️ 屏障已推进，忽略重复推进: periodNo=%s, round=%d", b.periodNo, b.round)
                return false
        }

        // 检查是否全部完成
        if len(b.finishedTables) < b.totalTables {
                log.Printf("[TOURNAMENT] ⚠️ 未全部完成，禁止推进: periodNo=%s, round=%d, finished=%d/%d",
                        b.periodNo, b.round, len(b.finishedTables), b.totalTables)
                return false
        }

        // 标记已推进
        b.advanced = true
        b.advancedTime = time.Now()

        log.Printf("[TOURNAMENT] 🚀 屏障推进: periodNo=%s, round=%d -> round=%d",
                b.periodNo, b.round, b.round+1)

        // 调用回调
        if b.onAllFinished != nil {
                go b.onAllFinished(b.periodNo, b.round, b.playerIDs)
        }

        return true
}

// IsAdvanced 检查是否已推进
func (b *TournamentRoundBarrier) IsAdvanced() bool {
        b.mu.RLock()
        defer b.mu.RUnlock()
        return b.advanced
}

// GetProgress 获取进度
func (b *TournamentRoundBarrier) GetProgress() (finished, total int) {
        b.mu.RLock()
        defer b.mu.RUnlock()
        return len(b.finishedTables), b.totalTables
}

// CheckTimeout 检查超时
// 返回值: 是否超时
func (b *TournamentRoundBarrier) CheckTimeout() bool {
        b.mu.Lock()
        defer b.mu.Unlock()

        // 如果已推进，不检查超时
        if b.advanced {
                return false
        }

        // 检查是否已超时
        elapsed := time.Since(b.startTime).Seconds()
        if elapsed >= float64(b.maxWaitSeconds) {
                // 防止重复触发
                if b.timeoutTriggered {
                        return false
                }
                b.timeoutTriggered = true

                log.Printf("[TOURNAMENT] ⚠️ 等待超时: periodNo=%s, round=%d, elapsed=%.1fs, finished=%d/%d",
                        b.periodNo, b.round, elapsed, len(b.finishedTables), b.totalTables)

                // 调用超时回调
                if b.onTimeout != nil {
                        go b.onTimeout(b.periodNo, b.round)
                }

                return true
        }

        return false
}

// ForceAdvance 强制推进（用于超时或异常情况）
func (b *TournamentRoundBarrier) ForceAdvance(reason string) bool {
        b.mu.Lock()
        defer b.mu.Unlock()

        if b.advanced {
                return false
        }

        b.advanced = true
        b.advancedTime = time.Now()

        log.Printf("[TOURNAMENT] ⚠️ 强制推进: periodNo=%s, round=%d, reason=%s, finished=%d/%d",
                b.periodNo, b.round, reason, len(b.finishedTables), b.totalTables)

        // 调用回调
        if b.onAllFinished != nil {
                go b.onAllFinished(b.periodNo, b.round, b.playerIDs)
        }

        return true
}

// =============================================
// TournamentBarrierManager - 屏障管理器
// =============================================

// TournamentBarrierManager 屏障管理器
type TournamentBarrierManager struct {
        barriers map[string]*TournamentRoundBarrier // periodNo_round -> barrier
        mu       sync.RWMutex
}

// NewTournamentBarrierManager 创建屏障管理器
func NewTournamentBarrierManager() *TournamentBarrierManager {
        mgr := &TournamentBarrierManager{
                barriers: make(map[string]*TournamentRoundBarrier),
        }

        // 启动超时检查协程
        go mgr.timeoutCheckLoop()

        return mgr
}

// CreateBarrier 创建屏障
func (m *TournamentBarrierManager) CreateBarrier(periodNo string, round, totalTables int, playerIDs []string) *TournamentRoundBarrier {
        m.mu.Lock()
        defer m.mu.Unlock()

        key := m.barrierKey(periodNo, round)

        // 如果已存在，返回现有的
        if barrier, exists := m.barriers[key]; exists {
                log.Printf("[TOURNAMENT] 屏障已存在: key=%s, tables=%d", key, barrier.totalTables)
                return barrier
        }

        barrier := NewTournamentRoundBarrier(periodNo, round, totalTables, playerIDs)
        m.barriers[key] = barrier

        log.Printf("[TOURNAMENT] 创建屏障: key=%s, tables=%d, players=%d", key, totalTables, len(playerIDs))

        return barrier
}

// GetBarrier 获取屏障
func (m *TournamentBarrierManager) GetBarrier(periodNo string, round int) *TournamentRoundBarrier {
        m.mu.RLock()
        defer m.mu.RUnlock()
        return m.barriers[m.barrierKey(periodNo, round)]
}

// RemoveBarrier 移除屏障
func (m *TournamentBarrierManager) RemoveBarrier(periodNo string, round int) {
        m.mu.Lock()
        defer m.mu.Unlock()
        delete(m.barriers, m.barrierKey(periodNo, round))
}

// RegisterTableFinished 注册桌完成
// 返回值: (是否全部完成, 当前已完成桌数, 总桌数, 屏障)
func (m *TournamentBarrierManager) RegisterTableFinished(periodNo string, round int, tableID uint64, playerIDs []string) (bool, int, int, *TournamentRoundBarrier) {
        m.mu.RLock()
        barrier := m.barriers[m.barrierKey(periodNo, round)]
        m.mu.RUnlock()

        if barrier == nil {
                log.Printf("[TOURNAMENT] ⚠️ 屏障不存在: periodNo=%s, round=%d", periodNo, round)
                return false, 0, 0, nil
        }

        allFinished, finished, total := barrier.RegisterTableFinished(tableID, playerIDs)
        return allFinished, finished, total, barrier
}

// barrierKey 生成屏障键
func (m *TournamentBarrierManager) barrierKey(periodNo string, round int) string {
        return periodNo + "_" + string(rune(round+'0'))
}

// timeoutCheckLoop 超时检查循环
// 🔧【修复】添加 panic 恢复机制
func (m *TournamentBarrierManager) timeoutCheckLoop() {
        defer func() {
                if r := recover(); r != nil {
                        log.Printf("[TOURNAMENT] ⚠️ timeoutCheckLoop panic 恢复: %v", r)
                }
        }()

        ticker := time.NewTicker(5 * time.Second)
        defer ticker.Stop()

        for range ticker.C {
                m.checkAllTimeouts()
        }
}

// checkAllTimeouts 检查所有屏障超时
// 🔧【修复】添加 panic 恢复机制
func (m *TournamentBarrierManager) checkAllTimeouts() {
        defer func() {
                if r := recover(); r != nil {
                        log.Printf("[TOURNAMENT] ⚠️ checkAllTimeouts panic 恢复: %v", r)
                }
        }()

        m.mu.RLock()
        barriers := make([]*TournamentRoundBarrier, 0, len(m.barriers))
        for _, b := range m.barriers {
                barriers = append(barriers, b)
        }
        m.mu.RUnlock()

        for _, barrier := range barriers {
                func() {
                        defer func() {
                                if r := recover(); r != nil {
                                        log.Printf("[TOURNAMENT] ⚠️ CheckTimeout panic 恢复: %v", r)
                                }
                        }()
                        barrier.CheckTimeout()
                }()
        }
}
