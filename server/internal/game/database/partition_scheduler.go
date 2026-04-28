// Package database 提供分表定时任务功能
package database

import (
	"log"
	"sync"
	"time"
)

// PartitionScheduler 分表定时调度器
type PartitionScheduler struct {
	manager   *PartitionManager
	stopChan  chan struct{}
	running   bool
	mu        sync.RWMutex
}

// partitionScheduler 分表定时调度器单例
var partitionScheduler *PartitionScheduler
var schedulerOnce sync.Once

// GetPartitionScheduler 获取分表定时调度器单例
func GetPartitionScheduler() *PartitionScheduler {
	schedulerOnce.Do(func() {
		partitionScheduler = &PartitionScheduler{
			manager:  GetPartitionManager(),
			stopChan: make(chan struct{}),
		}
	})
	return partitionScheduler
}

// Start 启动定时调度器
func (ps *PartitionScheduler) Start() {
	ps.mu.Lock()
	if ps.running {
		ps.mu.Unlock()
		return
	}
	ps.running = true
	ps.mu.Unlock()

	go ps.run()
	log.Println("📊 分表定时调度器已启动")
}

// Stop 停止定时调度器
func (ps *PartitionScheduler) Stop() {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	if !ps.running {
		return
	}

	close(ps.stopChan)
	ps.running = false
	log.Println("📊 分表定时调度器已停止")
}

// run 运行定时任务
func (ps *PartitionScheduler) run() {
	// 每天检查一次，确保下个月的分表已创建
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// 启动时立即检查一次
	ps.checkAndCreateTables()

	for {
		select {
		case <-ps.stopChan:
			return
		case <-ticker.C:
			ps.checkAndCreateTables()
		}
	}
}

// checkAndCreateTables 检查并创建需要的分表
func (ps *PartitionScheduler) checkAndCreateTables() {
	now := time.Now()

	// 确保当月分表存在
	if err := ps.manager.createMonthTables(now); err != nil {
		log.Printf("⚠️ 检查当月分表失败: %v", err)
	}

	// 确保下月分表存在（提前创建）
	nextMonth := now.AddDate(0, 1, 0)
	if err := ps.manager.createMonthTables(nextMonth); err != nil {
		log.Printf("⚠️ 检查下月分表失败: %v", err)
	}

	// 如果是当月最后一天，提前创建下下个月的分表
	if isLastDayOfMonth(now) {
		nextNextMonth := now.AddDate(0, 2, 0)
		if err := ps.manager.createMonthTables(nextNextMonth); err != nil {
			log.Printf("⚠️ 创建下下月分表失败: %v", err)
		} else {
			log.Printf("✅ 已提前创建下下月分表: %s", nextNextMonth.Format("200601"))
		}
	}
}

// isLastDayOfMonth 判断是否是当月最后一天
func isLastDayOfMonth(t time.Time) bool {
	nextDay := t.AddDate(0, 0, 1)
	return nextDay.Month() != t.Month()
}

// =============================================
// 全局便捷函数
// =============================================

// StartPartitionScheduler 启动分表定时调度器
func StartPartitionScheduler() {
	GetPartitionScheduler().Start()
}

// StopPartitionScheduler 停止分表定时调度器
func StopPartitionScheduler() {
	GetPartitionScheduler().Stop()
}
