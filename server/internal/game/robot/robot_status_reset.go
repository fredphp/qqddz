// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"sync"
	"time"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
	"gorm.io/gorm"
)

// =============================================
// 机器人状态重置服务
// =============================================

// RobotStatusResetService 机器人状态重置服务
// 负责定时检查并重置长期未使用或状态异常的机器人
type RobotStatusResetService struct {
	db *gorm.DB

	// 定时器
	ticker *time.Ticker
	stopCh chan struct{}

	// 配置
	checkInterval   time.Duration // 检查间隔
	idleTimeout     time.Duration // 空闲超时时间（超过此时间的锁定机器人将被重置）
	sessionTimeout  time.Duration // 会话超时时间

	// 运行状态
	running bool
	mu      sync.RWMutex
}

// RobotStatusResetConfig 机器人状态重置配置
type RobotStatusResetConfig struct {
	CheckInterval  time.Duration // 检查间隔，默认 5 分钟
	IdleTimeout    time.Duration // 空闲超时时间，默认 30 分钟
	SessionTimeout time.Duration // 会话超时时间，默认 60 分钟
}

// DefaultRobotStatusResetConfig 默认配置
func DefaultRobotStatusResetConfig() *RobotStatusResetConfig {
	return &RobotStatusResetConfig{
		CheckInterval:  5 * time.Minute,  // 每5分钟检查一次
		IdleTimeout:    30 * time.Minute, // 锁定超过30分钟的机器人将被重置
		SessionTimeout: 60 * time.Minute, // 会话超过60分钟视为过期
	}
}

// NewRobotStatusResetService 创建机器人状态重置服务
func NewRobotStatusResetService(db *gorm.DB, config *RobotStatusResetConfig) *RobotStatusResetService {
	if config == nil {
		config = DefaultRobotStatusResetConfig()
	}

	return &RobotStatusResetService{
		db:             db,
		checkInterval:  config.CheckInterval,
		idleTimeout:    config.IdleTimeout,
		sessionTimeout: config.SessionTimeout,
		stopCh:         make(chan struct{}),
	}
}

// Start 启动定时重置服务
func (s *RobotStatusResetService) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running {
		log.Println("[RobotStatusReset] 服务已在运行中")
		return
	}

	s.ticker = time.NewTicker(s.checkInterval)
	s.running = true

	go s.run()

	log.Printf("[RobotStatusReset] ✅ 机器人状态重置服务已启动，检查间隔: %v，超时阈值: %v",
		s.checkInterval, s.idleTimeout)
}

// Stop 停止定时重置服务
func (s *RobotStatusResetService) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running {
		return
	}

	close(s.stopCh)
	if s.ticker != nil {
		s.ticker.Stop()
	}
	s.running = false

	log.Println("[RobotStatusReset] 🛑 机器人状态重置服务已停止")
}

// run 运行定时检查
func (s *RobotStatusResetService) run() {
	for {
		select {
		case <-s.ticker.C:
			s.checkAndReset()
		case <-s.stopCh:
			return
		}
	}
}

// checkAndReset 检查并重置异常状态的机器人
func (s *RobotStatusResetService) checkAndReset() {
	log.Println("[RobotStatusReset] 🔍 开始检查机器人状态...")

	// 1. 重置锁定时间过长的机器人
	s.resetLongLockedRobots()

	// 2. 重置会话已结束但状态未更新的机器人
	s.resetFinishedSessionRobots()

	// 3. 重置无有效会话的机器人
	s.resetInvalidSessionRobots()
}

// resetLongLockedRobots 重置锁定时间过长的机器人
// 条件：robot_status=1 且 robot_locked_at 超过阈值时间
func (s *RobotStatusResetService) resetLongLockedRobots() {
	threshold := time.Now().Add(-s.idleTimeout)

	result := s.db.Model(&database.Player{}).
		Where("player_type = ?", database.PlayerTypeRobot).
		Where("robot_status = ?", database.RobotStatusInArena).
		Where("robot_locked_at < ?", threshold).
		Updates(map[string]interface{}{
			"robot_status":             database.RobotStatusIdle,
			"robot_current_session_id": nil,
			"robot_locked_at":          nil,
		})

	if result.Error != nil {
		log.Printf("[RobotStatusReset] ⚠️ 重置长时间锁定机器人失败: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("[RobotStatusReset] ✅ 已重置 %d 个锁定超时的机器人", result.RowsAffected)
	}
}

// resetFinishedSessionRobots 重置会话已结束但状态未更新的机器人
// 条件：机器人关联的竞技场会话已经结束
func (s *RobotStatusResetService) resetFinishedSessionRobots() {
	// 查找所有状态为"竞技场中"的机器人
	var robots []struct {
		ID                  uint64
		RobotCurrentSessionID *uint64
	}

	err := s.db.Model(&database.Player{}).
		Select("id, robot_current_session_id").
		Where("player_type = ?", database.PlayerTypeRobot).
		Where("robot_status = ?", database.RobotStatusInArena).
		Where("robot_current_session_id IS NOT NULL").
		Find(&robots).Error

	if err != nil {
		log.Printf("[RobotStatusReset] ⚠️ 查询锁定机器人失败: %v", err)
		return
	}

	if len(robots) == 0 {
		return
	}

	// 收集所有会话ID
	sessionIDs := make([]uint64, 0, len(robots))
	robotSessionMap := make(map[uint64]uint64) // robotID -> sessionID
	for _, r := range robots {
		if r.RobotCurrentSessionID != nil {
			sessionIDs = append(sessionIDs, *r.RobotCurrentSessionID)
			robotSessionMap[r.ID] = *r.RobotCurrentSessionID
		}
	}

	if len(sessionIDs) == 0 {
		return
	}

	// 检查这些会话是否已结束
	var finishedSessionIDs []uint64
	err = s.db.Model(&database.ArenaSession{}).
		Select("id").
		Where("id IN ?", sessionIDs).
		Where("status = ? OR end_time < ?", 2, time.Now()). // status=2 表示已结束
		Pluck("id", &finishedSessionIDs).Error

	if err != nil {
		log.Printf("[RobotStatusReset] ⚠️ 查询会话状态失败: %v", err)
		return
	}

	// 构建需要重置的机器人ID列表
	finishedSessionMap := make(map[uint64]bool)
	for _, sid := range finishedSessionIDs {
		finishedSessionMap[sid] = true
	}

	var robotIDsToReset []uint64
	for robotID, sessionID := range robotSessionMap {
		if finishedSessionMap[sessionID] {
			robotIDsToReset = append(robotIDsToReset, robotID)
		}
	}

	if len(robotIDsToReset) == 0 {
		return
	}

	// 批量重置
	result := s.db.Model(&database.Player{}).
		Where("id IN ?", robotIDsToReset).
		Updates(map[string]interface{}{
			"robot_status":             database.RobotStatusIdle,
			"robot_current_session_id": nil,
			"robot_locked_at":          nil,
		})

	if result.Error != nil {
		log.Printf("[RobotStatusReset] ⚠️ 重置已结束会话的机器人失败: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("[RobotStatusReset] ✅ 已重置 %d 个会话已结束的机器人", result.RowsAffected)
	}
}

// resetInvalidSessionRobots 重置无有效会话的机器人
// 条件：机器人状态为"竞技场中"，但会话ID为空或会话不存在
func (s *RobotStatusResetService) resetInvalidSessionRobots() {
	// 重置会话ID为空的机器人
	result := s.db.Model(&database.Player{}).
		Where("player_type = ?", database.PlayerTypeRobot).
		Where("robot_status = ?", database.RobotStatusInArena).
		Where("robot_current_session_id IS NULL").
		Updates(map[string]interface{}{
			"robot_status":             database.RobotStatusIdle,
			"robot_locked_at":          nil,
		})

	if result.Error != nil {
		log.Printf("[RobotStatusReset] ⚠️ 重置无效会话机器人失败: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("[RobotStatusReset] ✅ 已重置 %d 个无效会话的机器人", result.RowsAffected)
	}

	// 重置会话ID存在但会话记录不存在的机器人
	var robotSessionPairs []struct {
		ID                  uint64
		RobotCurrentSessionID uint64
	}

	err := s.db.Model(&database.Player{}).
		Select("id, robot_current_session_id").
		Where("player_type = ?", database.PlayerTypeRobot).
		Where("robot_status = ?", database.RobotStatusInArena).
		Where("robot_current_session_id IS NOT NULL").
		Find(&robotSessionPairs).Error

	if err != nil {
		return
	}

	for _, pair := range robotSessionPairs {
		// 检查会话是否存在
		var count int64
		s.db.Model(&database.ArenaSession{}).Where("id = ?", pair.RobotCurrentSessionID).Count(&count)
		if count == 0 {
			// 会话不存在，重置机器人
			s.db.Model(&database.Player{}).Where("id = ?", pair.ID).Updates(map[string]interface{}{
				"robot_status":             database.RobotStatusIdle,
				"robot_current_session_id": nil,
				"robot_locked_at":          nil,
			})
			log.Printf("[RobotStatusReset] ✅ 已重置机器人 %d（会话 %d 不存在）", pair.ID, pair.RobotCurrentSessionID)
		}
	}
}

// ResetRobotNow 立即重置单个机器人
func (s *RobotStatusResetService) ResetRobotNow(robotID uint64) error {
	result := s.db.Model(&database.Player{}).
		Where("id = ? AND player_type = ?", robotID, database.PlayerTypeRobot).
		Updates(map[string]interface{}{
			"robot_status":             database.RobotStatusIdle,
			"robot_current_session_id": nil,
			"robot_locked_at":          nil,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		log.Printf("[RobotStatusReset] ✅ 已手动重置机器人 %d", robotID)
	}

	return nil
}

// ResetAllRobotsNow 立即重置所有异常状态的机器人
func (s *RobotStatusResetService) ResetAllRobotsNow() (int64, error) {
	result := s.db.Model(&database.Player{}).
		Where("player_type = ?", database.PlayerTypeRobot).
		Where("robot_status = ?", database.RobotStatusInArena).
		Updates(map[string]interface{}{
			"robot_status":             database.RobotStatusIdle,
			"robot_current_session_id": nil,
			"robot_locked_at":          nil,
		})

	if result.Error != nil {
		return 0, result.Error
	}

	log.Printf("[RobotStatusReset] ✅ 已手动重置 %d 个机器人", result.RowsAffected)
	return result.RowsAffected, nil
}

// GetRobotStatusStats 获取机器人状态统计
func (s *RobotStatusResetService) GetRobotStatusStats() map[string]int64 {
	stats := make(map[string]int64)

	var idleCount, inArenaCount int64

	s.db.Model(&database.Player{}).
		Where("player_type = ? AND robot_status = ?", database.PlayerTypeRobot, database.RobotStatusIdle).
		Count(&idleCount)

	s.db.Model(&database.Player{}).
		Where("player_type = ? AND robot_status = ?", database.PlayerTypeRobot, database.RobotStatusInArena).
		Count(&inArenaCount)

	stats["idle"] = idleCount
	stats["in_arena"] = inArenaCount
	stats["total"] = idleCount + inArenaCount

	return stats
}

// =============================================
// 全局实例
// =============================================

var (
	globalResetService *RobotStatusResetService
	resetServiceOnce    sync.Once
)

// GetRobotStatusResetService 获取全局机器人状态重置服务实例
func GetRobotStatusResetService() *RobotStatusResetService {
	resetServiceOnce.Do(func() {
		globalResetService = NewRobotStatusResetService(database.DB(), nil)
	})
	return globalResetService
}

// InitRobotStatusResetService 初始化全局机器人状态重置服务
func InitRobotStatusResetService(db *gorm.DB, config *RobotStatusResetConfig) *RobotStatusResetService {
	resetServiceOnce.Do(func() {
		globalResetService = NewRobotStatusResetService(db, config)
	})
	return globalResetService
}

// StartRobotStatusResetService 启动全局机器人状态重置服务
func StartRobotStatusResetService() {
	service := GetRobotStatusResetService()
	if service != nil {
		service.Start()
	}
}

// StopRobotStatusResetService 停止全局机器人状态重置服务
func StopRobotStatusResetService() {
	if globalResetService != nil {
		globalResetService.Stop()
	}
}
