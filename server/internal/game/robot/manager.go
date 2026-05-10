// Package robot 机器人管理模块
package robot

import (
        "errors"
        "fmt"
        "math/rand"
        "sync"
        "time"

        "gorm.io/gorm"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// 错误定义
// =============================================

var (
        ErrRobotNotFound      = errors.New("机器人不存在")
        ErrRobotBusy          = errors.New("机器人正在忙碌中")
        ErrRobotNotAvailable  = errors.New("没有可用的机器人")
        ErrRobotNotLocked     = errors.New("机器人未被锁定")
)

// =============================================
// RobotManager 机器人管理器
// =============================================

// RobotManager 机器人管理器
// 负责机器人的选择、锁定、释放等生命周期管理
type RobotManager struct {
        db *gorm.DB
        
        // 运行时状态缓存（内存）
        runtimes map[uint64]*database.RobotRuntime
        mu       sync.RWMutex
        
        // 默认配置
        defaultConfig *database.RobotConfig
}

// NewRobotManager 创建机器人管理器
func NewRobotManager(db *gorm.DB) *RobotManager {
        return &RobotManager{
                db:            db,
                runtimes:      make(map[uint64]*database.RobotRuntime),
                defaultConfig: database.RobotConfigDefault(),
        }
}

// =============================================
// 机器人选择
// =============================================

// SelectAvailableRobots 选择可用机器人
// 从ddz_players表中选择player_type=2且robot_status=0的玩家
func (rm *RobotManager) SelectAvailableRobots(count int) ([]*database.Player, error) {
        var players []*database.Player
        
        err := rm.db.Where("player_type = ? AND robot_status = ?", 
                database.PlayerTypeRobot, database.RobotStatusIdle).
                Order("RAND()").
                Limit(count).
                Find(&players).Error
        
        if err != nil {
                return nil, fmt.Errorf("查询可用机器人失败: %w", err)
        }
        
        return players, nil
}

// GetAvailableRobotCount 获取可用机器人数量
func (rm *RobotManager) GetAvailableRobotCount() (int64, error) {
        var count int64
        err := rm.db.Model(&database.Player{}).
                Where("player_type = ? AND robot_status = ?", 
                        database.PlayerTypeRobot, database.RobotStatusIdle).
                Count(&count).Error
        return count, err
}

// =============================================
// 机器人锁定/释放
// =============================================

// LockRobot 锁定机器人
// 更新ddz_players表的robot_status=1和robot_current_session_id
func (rm *RobotManager) LockRobot(robotID, sessionID uint64) error {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        // 检查内存缓存
        if runtime, exists := rm.runtimes[robotID]; exists {
                return fmt.Errorf("机器人%d已在会话%d中: %w", robotID, runtime.SessionID, ErrRobotBusy)
        }
        
        // 查询玩家
        var player database.Player
        err := rm.db.First(&player, robotID).Error
        if err != nil {
                return ErrRobotNotFound
        }
        
        // 检查是否为机器人
        if player.PlayerType != database.PlayerTypeRobot {
                return fmt.Errorf("玩家%d不是机器人", robotID)
        }
        
        // 检查状态
        if player.RobotStatus != database.RobotStatusIdle {
                return fmt.Errorf("机器人%d状态为%d: %w", robotID, player.RobotStatus, ErrRobotBusy)
        }
        
        // 更新数据库
        now := time.Now()
        err = rm.db.Model(&player).Updates(map[string]interface{}{
                "robot_status":             database.RobotStatusInArena,
                "robot_current_session_id": sessionID,
                "robot_locked_at":          now,
        }).Error
        
        if err != nil {
                return fmt.Errorf("锁定机器人失败: %w", err)
        }
        
        // 更新内存缓存
        rm.runtimes[robotID] = &database.RobotRuntime{
                RobotID:   robotID,
                PlayerID:  player.Username,
                SessionID: sessionID,
                LockedAt:  now,
                
                // 使用默认配置
                ThinkTimeMin: rm.defaultConfig.MinThinkTime,
                ThinkTimeMax: rm.defaultConfig.MaxThinkTime,
        }
        
        return nil
}

// ReleaseRobot 释放机器人
// 更新ddz_players表的robot_status=0
func (rm *RobotManager) ReleaseRobot(robotID uint64) error {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        // 更新数据库
        err := rm.db.Model(&database.Player{}).Where("id = ?", robotID).Updates(map[string]interface{}{
                "robot_status":             database.RobotStatusIdle,
                "robot_current_session_id": nil,
                "robot_locked_at":          nil,
        }).Error
        
        if err != nil {
                return fmt.Errorf("释放机器人失败: %w", err)
        }
        
        // 移除内存缓存
        delete(rm.runtimes, robotID)
        
        return nil
}

// ReleaseRobotsBySession 释放指定会话的所有机器人
func (rm *RobotManager) ReleaseRobotsBySession(sessionID uint64) error {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        // 更新数据库
        err := rm.db.Model(&database.Player{}).
                Where("robot_current_session_id = ?", sessionID).
                Updates(map[string]interface{}{
                        "robot_status":             database.RobotStatusIdle,
                        "robot_current_session_id": nil,
                        "robot_locked_at":          nil,
                }).Error
        
        if err != nil {
                return fmt.Errorf("释放会话机器人失败: %w", err)
        }
        
        // 清理内存缓存
        for robotID, runtime := range rm.runtimes {
                if runtime.SessionID == sessionID {
                        delete(rm.runtimes, robotID)
                }
        }
        
        return nil
}

// LockRobotInMemory 在内存中锁定机器人（用于事务内调用）
// 仅更新内存缓存，不更新数据库
func (rm *RobotManager) LockRobotInMemory(robotID, sessionID uint64, lockedAt time.Time) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        rm.runtimes[robotID] = &database.RobotRuntime{
                RobotID:   robotID,
                SessionID: sessionID,
                LockedAt:  lockedAt,
                
                // 使用默认配置
                ThinkTimeMin: rm.defaultConfig.MinThinkTime,
                ThinkTimeMax: rm.defaultConfig.MaxThinkTime,
        }
}

// ClearRobotMemory 清除机器人的内存缓存
// 用于事务失败时清理已更新的内存状态
func (rm *RobotManager) ClearRobotMemory(robotID uint64) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        delete(rm.runtimes, robotID)
}

// =============================================
// 状态查询
// =============================================

// IsRobotBusy 检查机器人是否忙碌
func (rm *RobotManager) IsRobotBusy(robotID uint64) bool {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        
        // 检查内存缓存
        if _, exists := rm.runtimes[robotID]; exists {
                return true
        }
        
        // 检查数据库
        var player database.Player
        err := rm.db.Select("robot_status").First(&player, robotID).Error
        if err != nil {
                return false
        }
        
        return player.RobotStatus != database.RobotStatusIdle
}

// GetRobotRuntime 获取机器人运行时状态
func (rm *RobotManager) GetRobotRuntime(robotID uint64) *database.RobotRuntime {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        
        return rm.runtimes[robotID]
}

// GetSessionRobots 获取指定会话的所有机器人
func (rm *RobotManager) GetSessionRobots(sessionID uint64) []*database.RobotRuntime {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        
        var robots []*database.RobotRuntime
        for _, runtime := range rm.runtimes {
                if runtime.SessionID == sessionID {
                        robots = append(robots, runtime)
                }
        }
        return robots
}

// =============================================
// 让牌策略
// =============================================

// EnableLetWin 启用让牌策略
// targetPlayerID: 让牌目标玩家ID（真人玩家）
func (rm *RobotManager) EnableLetWin(robotID uint64, targetPlayerID uint64) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        if runtime, exists := rm.runtimes[robotID]; exists {
                runtime.LetWinEnabled = true
                runtime.LetWinTargetID = targetPlayerID
        }
}

// GetLetWinTarget 获取机器人的让牌目标玩家ID
func (rm *RobotManager) GetLetWinTarget(robotID uint64) uint64 {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        
        if runtime, exists := rm.runtimes[robotID]; exists {
                return runtime.LetWinTargetID
        }
        return 0
}

// DisableLetWin 禁用让牌策略
func (rm *RobotManager) DisableLetWin(robotID uint64) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        
        if runtime, exists := rm.runtimes[robotID]; exists {
                runtime.LetWinEnabled = false
        }
}

// IsLetWinEnabled 检查是否启用让牌
func (rm *RobotManager) IsLetWinEnabled(robotID uint64) bool {
        rm.mu.RLock()
        defer rm.mu.RUnlock()
        
        if runtime, exists := rm.runtimes[robotID]; exists {
                return runtime.LetWinEnabled
        }
        return false
}

// =============================================
// 竞技场补位
// =============================================

// FillArenaRobots 为竞技场补位机器人
// playerCount: 当前报名人数
// 返回: 补位的机器人列表
func (rm *RobotManager) FillArenaRobots(playerCount int, sessionID uint64) ([]*database.Player, error) {
        // 计算需要补位数量（凑成3的倍数）
        remainder := playerCount % 3
        if remainder == 0 {
                return nil, nil // 不需要补位
        }
        
        fillCount := 3 - remainder
        
        // 选择可用机器人
        robots, err := rm.SelectAvailableRobots(fillCount)
        if err != nil {
                return nil, err
        }
        
        if len(robots) < fillCount {
                return nil, fmt.Errorf("可用机器人不足，需要%d，只有%d: %w", fillCount, len(robots), ErrRobotNotAvailable)
        }
        
        // 锁定机器人
        for _, robot := range robots {
                if err := rm.LockRobot(robot.ID, sessionID); err != nil {
                        // 回滚已锁定的机器人
                        for _, r := range robots {
                                if r.ID == robot.ID {
                                        break
                                }
                                rm.ReleaseRobot(r.ID)
                        }
                        return nil, err
                }
        }
        
        return robots, nil
}

// =============================================
// 思考时间计算
// =============================================

// CalculateThinkTime 计算机器人思考时间
// 普通出牌: 1.5-3秒, 炸弹: 3-5秒
func (rm *RobotManager) CalculateThinkTime(robotID uint64, isBomb bool) time.Duration {
        runtime := rm.GetRobotRuntime(robotID)
        
        var minMs, maxMs int
        
        if isBomb {
                // 炸弹使用专门的思考时间范围（3-5秒）
                minMs = 3000
                maxMs = rm.defaultConfig.BombThinkTime // 默认4000ms
                if maxMs <= minMs {
                        maxMs = 5000
                }
        } else if runtime != nil {
                minMs = runtime.ThinkTimeMin
                maxMs = runtime.ThinkTimeMax
        } else {
                minMs = rm.defaultConfig.MinThinkTime
                maxMs = rm.defaultConfig.MaxThinkTime
        }
        
        // 确保范围有效
        if maxMs <= minMs {
                maxMs = minMs + 1500
        }
        
        // 随机思考时间
        thinkMs := minMs + rand.Intn(maxMs-minMs)
        
        return time.Duration(thinkMs) * time.Millisecond
}

// =============================================
// 判断是否为机器人玩家
// =============================================

// IsRobotPlayer 检查玩家是否为机器人
func IsRobotPlayer(player *database.Player) bool {
        return player != nil && player.PlayerType == database.PlayerTypeRobot
}

// IsTrusteePlayer 检查玩家是否为托管玩家（真人掉线后托管）
// 注意：托管玩家是真人掉线，不是机器人玩家
func IsTrusteePlayer(isTrustee bool, player *database.Player) bool {
        return isTrustee && player.PlayerType == database.PlayerTypeHuman
}
