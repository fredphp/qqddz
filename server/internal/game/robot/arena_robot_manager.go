// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"errors"
	"fmt"
	"log"
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
	ErrRobotAlreadyLocked     = errors.New("机器人已被锁定")
	ErrRobotNotInArena        = errors.New("机器人不在竞技场中")
	ErrNoAvailableRobots      = errors.New("没有可用的机器人")
	ErrInvalidArenaStatus     = errors.New("无效的竞技场状态")
)

// =============================================
// 竞技场机器人状态常量
// =============================================

const (
	// ArenaRobotStatusIdle 空闲
	ArenaRobotStatusIdle uint8 = 0
	// ArenaRobotStatusInArena 竞技中
	ArenaRobotStatusInArena uint8 = 1
	// ArenaRobotStatusEliminated 已淘汰
	ArenaRobotStatusEliminated uint8 = 2
)

// =============================================
// ArenaRobotManager 竞技场机器人管理器
// =============================================

// ArenaRobotManager 竞技场机器人管理器
// 负责竞技场专属的机器人分配、锁定、生命周期管理
// 与普通场机器人系统完全隔离
type ArenaRobotManager struct {
	db *gorm.DB

	// 运行时状态缓存
	arenaRobots   map[uint64]*ArenaRobotRuntime // robotID -> runtime
	mu            sync.RWMutex

	// 按竞技场房间索引
	roomRobots    map[uint64][]uint64 // roomID -> []robotID

	// 按期号索引
	periodRobots  map[string][]uint64 // periodNo -> []robotID
}

// ArenaRobotRuntime 竞技场机器人运行时状态
type ArenaRobotRuntime struct {
	RobotID        uint64    `json:"robot_id"`
	PlayerID       string    `json:"player_id"`
	Nickname       string    `json:"nickname"`
	Avatar         string    `json:"avatar"`

	// 锁定信息
	LockRoomID     uint64    `json:"lock_room_id"`     // 锁定的竞技场房间ID
	LockSessionID  uint64    `json:"lock_session_id"`  // 锁定的会话ID
	LockPeriodNo   string    `json:"lock_period_no"`   // 锁定的期号
	LockTableID    int       `json:"lock_table_id"`    // 分配的桌号
	LockedAt       time.Time `json:"locked_at"`

	// 竞技状态
	ArenaStatus    uint8     `json:"arena_status"`     // 0-空闲, 1-竞技中, 2-已淘汰
	CurrentScore   int64     `json:"current_score"`    // 当前积分
	Rank           int       `json:"rank"`             // 当前排名
	IsChampion     bool      `json:"is_champion"`      // 是否冠军（用于奖励跳过）

	// AI配置
	AIConfig       *database.RobotAIConfig `json:"ai_config"`

	// 分数控制
	ScoreControl   *ScoreControlConfig `json:"score_control"`
}

// ScoreControlConfig 分数控制配置
type ScoreControlConfig struct {
	TargetRankRange  [2]int   `json:"target_rank_range"`  // 目标排名范围 [min, max]
	WinProbability   float64  `json:"win_probability"`    // 获胜概率
	LetWinEnabled    bool     `json:"let_win_enabled"`    // 是否启用让牌
	LetWinTargetID   uint64   `json:"let_win_target_id"`  // 让牌目标玩家ID
	MistakeRate      float64  `json:"mistake_rate"`       // 失误率
}

// NewArenaRobotManager 创建竞技场机器人管理器
func NewArenaRobotManager(db *gorm.DB) *ArenaRobotManager {
	return &ArenaRobotManager{
		db:           db,
		arenaRobots:  make(map[uint64]*ArenaRobotRuntime),
		roomRobots:   make(map[uint64][]uint64),
		periodRobots: make(map[string][]uint64),
	}
}

// =============================================
// 机器人补位
// =============================================

// FillArenaPlayers 为竞技场补位机器人
// 确保玩家数量是3的倍数
// 参数:
// - roomID: 竞技场房间配置ID
// - sessionID: 竞技场会话ID
// - periodNo: 期号
// - realPlayers: 真人玩家列表
// 返回:
// - 补位的机器人列表
// - 所有玩家列表（真人+机器人）
func (m *ArenaRobotManager) FillArenaPlayers(roomID, sessionID uint64, periodNo string, realPlayers []uint64) ([]*database.Player, []uint64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// 计算需要补位的数量
	playerCount := len(realPlayers)
	remainder := playerCount % 3

	if remainder == 0 {
		log.Printf("[ArenaRobot] 报名人数 %d 已是3的倍数，无需补位", playerCount)
		return nil, realPlayers, nil
	}

	fillCount := 3 - remainder
	log.Printf("[ArenaRobot] 报名人数 %d 不是3的倍数，需要补位 %d 个机器人: roomID=%d, periodNo=%s",
		playerCount, fillCount, roomID, periodNo)

	// 从数据库选择可用机器人
	robots, err := m.selectAvailableRobots(fillCount)
	if err != nil {
		log.Printf("[ArenaRobot] ❌ 选择可用机器人失败: %v", err)
		return nil, realPlayers, err
	}

	if len(robots) < fillCount {
		err = fmt.Errorf("可用机器人不足，需要 %d，只有 %d: %w", fillCount, len(robots), ErrNoAvailableRobots)
		log.Printf("[ArenaRobot] ❌ %v", err)
		return nil, realPlayers, err
	}

	// 锁定机器人
	now := time.Now()
	lockedRobots := make([]*database.Player, 0, fillCount)

	for _, robot := range robots {
		// 更新数据库状态
		err = m.db.Model(&database.Player{}).Where("id = ? AND robot_status = ?", robot.ID, database.RobotStatusIdle).
			Updates(map[string]interface{}{
				"robot_status":             ArenaRobotStatusInArena,
				"robot_current_session_id": sessionID,
				"robot_locked_at":          now,
			}).Error

		if err != nil {
			log.Printf("[ArenaRobot] ⚠️ 锁定机器人 %d 失败: %v", robot.ID, err)
			continue
		}

		// 创建运行时状态
		runtime := &ArenaRobotRuntime{
			RobotID:       robot.ID,
			PlayerID:      robot.Username,
			Nickname:      robot.Nickname,
			Avatar:        robot.Avatar,
			LockRoomID:    roomID,
			LockSessionID: sessionID,
			LockPeriodNo:  periodNo,
			LockedAt:      now,
			ArenaStatus:   ArenaRobotStatusInArena,
			CurrentScore:  0,
			Rank:          0,
			AIConfig:      m.createAIConfig(),
			ScoreControl:  m.createScoreControlConfig(),
		}

		// 缓存运行时状态
		m.arenaRobots[robot.ID] = runtime
		m.roomRobots[roomID] = append(m.roomRobots[roomID], robot.ID)
		m.periodRobots[periodNo] = append(m.periodRobots[periodNo], robot.ID)

		lockedRobots = append(lockedRobots, robot)
		log.Printf("[ArenaRobot] ✅ 机器人 %d (%s) 已锁定到竞技场: roomID=%d, periodNo=%s",
			robot.ID, robot.Nickname, roomID, periodNo)
	}

	// 合并玩家列表
	allPlayers := make([]uint64, len(realPlayers))
	copy(allPlayers, realPlayers)
	for _, robot := range lockedRobots {
		allPlayers = append(allPlayers, robot.ID)
	}

	log.Printf("[ArenaRobot] ✅ 补位完成: 真人 %d + 机器人 %d = 总计 %d",
		len(realPlayers), len(lockedRobots), len(allPlayers))

	return lockedRobots, allPlayers, nil
}

// selectAvailableRobots 从数据库选择可用机器人
func (m *ArenaRobotManager) selectAvailableRobots(count int) ([]*database.Player, error) {
	var players []*database.Player

	err := m.db.Where("player_type = ? AND robot_status = ?",
		database.PlayerTypeRobot, database.RobotStatusIdle).
		Order("RAND()").
		Limit(count).
		Find(&players).Error

	if err != nil {
		return nil, fmt.Errorf("查询可用机器人失败: %w", err)
	}

	return players, nil
}

// =============================================
// 机器人锁定/释放
// =============================================

// IsRobotLocked 检查机器人是否被锁定
func (m *ArenaRobotManager) IsRobotLocked(robotID uint64) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	// 检查内存缓存
	if _, exists := m.arenaRobots[robotID]; exists {
		return true
	}

	// 检查数据库
	var player database.Player
	err := m.db.Select("robot_status").First(&player, robotID).Error
	if err != nil {
		return false
	}

	return player.RobotStatus != database.RobotStatusIdle
}

// GetRobotRuntime 获取机器人运行时状态
func (m *ArenaRobotManager) GetRobotRuntime(robotID uint64) *ArenaRobotRuntime {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.arenaRobots[robotID]
}

// GetArenaRobots 获取指定竞技场的所有机器人
func (m *ArenaRobotManager) GetArenaRobots(roomID uint64) []*ArenaRobotRuntime {
	m.mu.RLock()
	defer m.mu.RUnlock()

	robotIDs, exists := m.roomRobots[roomID]
	if !exists {
		return nil
	}

	robots := make([]*ArenaRobotRuntime, 0, len(robotIDs))
	for _, id := range robotIDs {
		if runtime, ok := m.arenaRobots[id]; ok {
			robots = append(robots, runtime)
		}
	}
	return robots
}

// GetPeriodRobots 获取指定期号的所有机器人
func (m *ArenaRobotManager) GetPeriodRobots(periodNo string) []*ArenaRobotRuntime {
	m.mu.RLock()
	defer m.mu.RUnlock()

	robotIDs, exists := m.periodRobots[periodNo]
	if !exists {
		return nil
	}

	robots := make([]*ArenaRobotRuntime, 0, len(robotIDs))
	for _, id := range robotIDs {
		if runtime, ok := m.arenaRobots[id]; ok {
			robots = append(robots, runtime)
		}
	}
	return robots
}

// =============================================
// 机器人生命周期管理
// =============================================

// UpdateRobotScore 更新机器人积分
func (m *ArenaRobotManager) UpdateRobotScore(robotID uint64, scoreDelta int64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	runtime, exists := m.arenaRobots[robotID]
	if !exists {
		return
	}

	runtime.CurrentScore += scoreDelta
	log.Printf("[ArenaRobot] 机器人 %d 积分更新: %+d -> %d", robotID, scoreDelta, runtime.CurrentScore)
}

// MarkRobotEliminated 标记机器人已淘汰
func (m *ArenaRobotManager) MarkRobotEliminated(robotID uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	runtime, exists := m.arenaRobots[robotID]
	if !exists {
		return
	}

	runtime.ArenaStatus = ArenaRobotStatusEliminated
	log.Printf("[ArenaRobot] 机器人 %d 已淘汰: roomID=%d, periodNo=%s, score=%d",
		robotID, runtime.LockRoomID, runtime.LockPeriodNo, runtime.CurrentScore)
}

// ReleaseRobot 释放单个机器人
func (m *ArenaRobotManager) ReleaseRobot(robotID uint64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	runtime, exists := m.arenaRobots[robotID]
	if !exists {
		return nil // 已释放或不存在
	}

	// 更新数据库
	err := m.db.Model(&database.Player{}).Where("id = ?", robotID).Updates(map[string]interface{}{
		"robot_status":             database.RobotStatusIdle,
		"robot_current_session_id": nil,
		"robot_locked_at":          nil,
	}).Error

	if err != nil {
		log.Printf("[ArenaRobot] ⚠️ 释放机器人 %d 数据库更新失败: %v", robotID, err)
		return err
	}

	// 从索引中移除
	roomID := runtime.LockRoomID
	periodNo := runtime.LockPeriodNo

	// 从房间索引移除
	if robotIDs, ok := m.roomRobots[roomID]; ok {
		for i, id := range robotIDs {
			if id == robotID {
				m.roomRobots[roomID] = append(robotIDs[:i], robotIDs[i+1:]...)
				break
			}
		}
	}

	// 从期号索引移除
	if robotIDs, ok := m.periodRobots[periodNo]; ok {
		for i, id := range robotIDs {
			if id == robotID {
				m.periodRobots[periodNo] = append(robotIDs[:i], robotIDs[i+1:]...)
				break
			}
		}
	}

	// 从运行时缓存移除
	delete(m.arenaRobots, robotID)

	log.Printf("[ArenaRobot] ✅ 机器人 %d 已释放: roomID=%d, periodNo=%s", robotID, roomID, periodNo)
	return nil
}

// ReleaseArenaRobots 释放指定竞技场的所有机器人
func (m *ArenaRobotManager) ReleaseArenaRobots(roomID uint64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	robotIDs, exists := m.roomRobots[roomID]
	if !exists || len(robotIDs) == 0 {
		return nil
	}

	// 批量更新数据库
	err := m.db.Model(&database.Player{}).Where("id IN ?", robotIDs).Updates(map[string]interface{}{
		"robot_status":             database.RobotStatusIdle,
		"robot_current_session_id": nil,
		"robot_locked_at":          nil,
	}).Error

	if err != nil {
		log.Printf("[ArenaRobot] ⚠️ 批量释放机器人失败: %v", err)
		return err
	}

	// 清理缓存
	for _, id := range robotIDs {
		delete(m.arenaRobots, id)
	}
	delete(m.roomRobots, roomID)

	log.Printf("[ArenaRobot] ✅ 已释放竞技场 %d 的所有机器人: %d 个", roomID, len(robotIDs))
	return nil
}

// ReleasePeriodRobots 释放指定期号的所有机器人
func (m *ArenaRobotManager) ReleasePeriodRobots(periodNo string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	robotIDs, exists := m.periodRobots[periodNo]
	if !exists || len(robotIDs) == 0 {
		return nil
	}

	// 批量更新数据库
	err := m.db.Model(&database.Player{}).Where("id IN ?", robotIDs).Updates(map[string]interface{}{
		"robot_status":             database.RobotStatusIdle,
		"robot_current_session_id": nil,
		"robot_locked_at":          nil,
	}).Error

	if err != nil {
		log.Printf("[ArenaRobot] ⚠️ 批量释放期号机器人失败: %v", err)
		return err
	}

	// 清理缓存
	for _, id := range robotIDs {
		if runtime, ok := m.arenaRobots[id]; ok {
			// 从房间索引移除
			if roomIDs, ok := m.roomRobots[runtime.LockRoomID]; ok {
				for i, rid := range roomIDs {
					if rid == id {
						m.roomRobots[runtime.LockRoomID] = append(roomIDs[:i], roomIDs[i+1:]...)
						break
					}
				}
			}
		}
		delete(m.arenaRobots, id)
	}
	delete(m.periodRobots, periodNo)

	log.Printf("[ArenaRobot] ✅ 已释放期号 %s 的所有机器人: %d 个", periodNo, len(robotIDs))
	return nil
}

// =============================================
// 辅助方法
// =============================================

// createAIConfig 创建AI配置
func (m *ArenaRobotManager) createAIConfig() *database.RobotAIConfig {
	return database.RobotAIConfigDefault()
}

// createScoreControlConfig 创建分数控制配置
func (m *ArenaRobotManager) createScoreControlConfig() *ScoreControlConfig {
	// 默认目标排名在中游
	// 冠军概率 5%，亚军概率 20%，中间概率 55%，淘汰概率 20%
	targetRank := rand.Intn(3) + 2 // 2-4名

	return &ScoreControlConfig{
		TargetRankRange: [2]int{targetRank, targetRank + 2},
		WinProbability:  0.45, // 45% 获胜概率
		LetWinEnabled:   true,
		MistakeRate:     0.15, // 15% 失误率
	}
}

// IsArenaRobot 检查玩家是否是竞技场机器人
func (m *ArenaRobotManager) IsArenaRobot(playerID uint64) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	_, exists := m.arenaRobots[playerID]
	return exists
}

// GetRobotCount 获取指定竞技场的机器人数量
func (m *ArenaRobotManager) GetRobotCount(roomID uint64) int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.roomRobots[roomID])
}

// SetRobotRank 设置机器人排名
func (m *ArenaRobotManager) SetRobotRank(robotID uint64, rank int) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if runtime, exists := m.arenaRobots[robotID]; exists {
		runtime.Rank = rank
	}
}

// SetRobotChampion 标记机器人为冠军
func (m *ArenaRobotManager) SetRobotChampion(robotID uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if runtime, exists := m.arenaRobots[robotID]; exists {
		runtime.IsChampion = true
	}
}

// IsRobotChampion 检查机器人是否是冠军
func (m *ArenaRobotManager) IsRobotChampion(robotID uint64) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if runtime, exists := m.arenaRobots[robotID]; exists {
		return runtime.IsChampion
	}
	return false
}
