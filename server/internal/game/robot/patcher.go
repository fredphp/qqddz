// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
        "errors"
        "log"
        "math"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "gorm.io/gorm"
)

// =============================================
// 错误定义
// =============================================

var (
        ErrSessionNotWaiting   = errors.New("比赛会话不在等待状态")
        ErrNoRobotsAvailable   = errors.New("没有可用的机器人")
        ErrFillCountExceeded   = errors.New("补位数量超过限制")
)

// =============================================
// ArenaPatcher 竞技场补位器
// =============================================

// ArenaPatcher 竞技场补位器
// 负责在比赛人数不足时自动补充机器人玩家
type ArenaPatcher struct {
        db           *gorm.DB
        robotManager *RobotManager

        // 补位配置
        config *PatcherConfig

        // 补位记录: sessionID -> *FillRecord
        fillRecords map[uint64]*FillRecord

        mu sync.RWMutex
}

// PatcherConfig 补位配置
type PatcherConfig struct {
        // 是否启用自动补位
        EnableAutoFill bool `json:"enable_auto_fill" yaml:"enable_auto_fill"`

        // 补位延迟时间（秒）
        FillDelaySeconds int `json:"fill_delay_seconds" yaml:"fill_delay_seconds"`

        // 最大补位数量
        MaxFillCount int `json:"max_fill_count" yaml:"max_fill_count"`

        // 补位机器人等级范围
        RobotLevelMin uint8 `json:"robot_level_min" yaml:"robot_level_min"`
        RobotLevelMax uint8 `json:"robot_level_max" yaml:"robot_level_max"`

        // 补位策略: "random", "balanced", "weak_first"
        FillStrategy string `json:"fill_strategy" yaml:"fill_strategy"`

        // 是否允许决赛补位
        AllowFinalRoundFill bool `json:"allow_final_round_fill" yaml:"allow_final_round_fill"`
}

// FillRecord 补位记录
type FillRecord struct {
        SessionID    uint64         `json:"session_id"`
        FilledRobots []*FilledRobot `json:"filled_robots"`
        FillTime     time.Time      `json:"fill_time"`
        FillReason   string         `json:"fill_reason"`
}

// FilledRobot 已补位的机器人
type FilledRobot struct {
        RobotID    uint64 `json:"robot_id"`
        PlayerID   uint64 `json:"player_id"`
        Nickname   string `json:"nickname"`
        RobotLevel uint8  `json:"robot_level"`
        TableID    uint64 `json:"table_id"`
}

// DefaultPatcherConfig 默认补位配置
func DefaultPatcherConfig() *PatcherConfig {
        return &PatcherConfig{
                EnableAutoFill:      true,
                FillDelaySeconds:    30,
                MaxFillCount:        6,
                RobotLevelMin:       database.RobotLevelBeginner,
                RobotLevelMax:       database.RobotLevelAdvanced,
                FillStrategy:        "balanced",
                AllowFinalRoundFill: false,
        }
}

// NewArenaPatcher 创建竞技场补位器
func NewArenaPatcher(db *gorm.DB, robotManager *RobotManager, config *PatcherConfig) *ArenaPatcher {
        if config == nil {
                config = DefaultPatcherConfig()
        }

        ap := &ArenaPatcher{
                db:           db,
                robotManager: robotManager,
                config:       config,
                fillRecords:  make(map[uint64]*FillRecord),
        }

        log.Printf("[ArenaPatcher] 补位器已创建，配置: 延迟=%ds, 最大补位=%d, 策略=%s",
                config.FillDelaySeconds, config.MaxFillCount, config.FillStrategy)

        return ap
}

// =============================================
// 补位核心方法
// =============================================

// CheckAndFillArena 检查并执行补位
// 在比赛开始前或轮次间检查人数不足时调用
func (ap *ArenaPatcher) CheckAndFillArena(sessionID uint64, currentPlayers int, minPlayers int) ([]*FilledRobot, error) {
        ap.mu.Lock()
        defer ap.mu.Unlock()

        log.Printf("[ArenaPatcher] 检查补位需求: 会话=%d, 当前人数=%d, 最小人数=%d",
                sessionID, currentPlayers, minPlayers)

        // 检查是否启用自动补位
        if !ap.config.EnableAutoFill {
                log.Printf("[ArenaPatcher] 自动补位已禁用")
                return nil, nil
        }

        // 计算需要补位的数量
        fillCount := ap.calculateFillCount(currentPlayers, minPlayers)
        if fillCount <= 0 {
                log.Printf("[ArenaPatcher] 无需补位")
                return nil, nil
        }

        // 检查补位数量限制
        if fillCount > ap.config.MaxFillCount {
                log.Printf("[ArenaPatcher] 补位数量 %d 超过最大限制 %d，调整补位数量", fillCount, ap.config.MaxFillCount)
                fillCount = ap.config.MaxFillCount
        }

        // 执行补位
        robots, err := ap.fillRobots(sessionID, fillCount)
        if err != nil {
                log.Printf("[ArenaPatcher] 补位失败: %v", err)
                return nil, err
        }

        // 记录补位信息
        ap.recordFill(sessionID, robots, "人数不足自动补位")

        return robots, nil
}

// calculateFillCount 计算需要补位的数量
// 核心逻辑：确保补位后人数是3的倍数（每桌3人）
func (ap *ArenaPatcher) calculateFillCount(currentPlayers int, minPlayers int) int {
        // 检查当前人数是否是3的倍数
        remainder := currentPlayers % 3
        
        // 如果已经是3的倍数，不需要补位
        if remainder == 0 {
                return 0
        }
        
        // 补位到下一个3的倍数
        // 例如：1人需要补2个，2人需要补1个，4人需要补2个
        fillCount := 3 - remainder
        
        // 确保补位后至少达到最小人数
        // 如果当前人数+补位数 < 最小人数，需要补更多
        // 但这种情况理论上不应该发生（最小人数应该是3的倍数）
        if currentPlayers+fillCount < minPlayers {
                // 计算还需要补多少才能达到最小人数
                additionalNeeded := minPlayers - (currentPlayers + fillCount)
                // 确保补位后仍然是3的倍数
                if additionalNeeded%3 != 0 {
                        additionalNeeded += 3 - (additionalNeeded % 3)
                }
                fillCount += additionalNeeded
        }
        
        log.Printf("[ArenaPatcher] 计算补位数量: 当前人数=%d, 余数=%d, 补位数=%d", 
                currentPlayers, remainder, fillCount)

        return fillCount
}

// fillRobots 执行机器人补位
// 使用事务确保原子性，避免并发问题
func (ap *ArenaPatcher) fillRobots(sessionID uint64, count int) ([]*FilledRobot, error) {
        log.Printf("[ArenaPatcher] 执行补位: 会话=%d, 数量=%d", sessionID, count)

        // 选择可用机器人（暂时忽略等级筛选，因为简化设计中机器人没有等级字段）
        robots, err := ap.robotManager.SelectAvailableRobots(count)
        if err != nil {
                return nil, err
        }

        if len(robots) == 0 {
                log.Printf("[ArenaPatcher] 没有可用的机器人")
                return nil, ErrNoRobotsAvailable
        }

        filledRobots := make([]*FilledRobot, 0, len(robots))
        var lockedRobotIDs []uint64 // 记录已锁定的机器人ID，用于回滚

        // 使用事务确保原子性
        err = ap.db.Transaction(func(tx *gorm.DB) error {
                for _, robot := range robots {
                        // 在事务内锁定机器人（检查并更新状态）
                        var player database.Player
                        if err := tx.Where("id = ? AND player_type = ? AND robot_status = ?",
                                robot.ID, database.PlayerTypeRobot, database.RobotStatusIdle).First(&player).Error; err != nil {
                                log.Printf("[ArenaPatcher] 机器人 %d 不可用: %v", robot.ID, err)
                                continue
                        }

                        // 更新机器人状态
                        now := time.Now()
                        if err := tx.Model(&database.Player{}).Where("id = ?", robot.ID).Updates(map[string]interface{}{
                                "robot_status":             database.RobotStatusInArena,
                                "robot_current_session_id": sessionID,
                                "robot_locked_at":          now,
                        }).Error; err != nil {
                                log.Printf("[ArenaPatcher] 锁定机器人 %d 失败: %v", robot.ID, err)
                                continue
                        }

                        lockedRobotIDs = append(lockedRobotIDs, robot.ID)

                        // 创建参赛记录
                        // 🔧【重构】不再写入 signup_time 和 signup_fee，这些字段保留在 period_players 表
                        participation := &database.ArenaParticipation{
                                SessionID:    sessionID,
                                PlayerID:     robot.ID,
                                RobotID:      robot.ID, // 机器人ID等于玩家ID
                                MatchCoin:    0,
                                IsOnline:     1,
                                IsRobot:      1,
                        }

                        if err := tx.Create(participation).Error; err != nil {
                                log.Printf("[ArenaPatcher] 创建机器人参赛记录失败: %v", err)
                                return err // 回滚事务
                        }

                        filledRobots = append(filledRobots, &FilledRobot{
                                RobotID:    robot.ID,
                                PlayerID:   robot.ID,
                                Nickname:   robot.Nickname,
                                RobotLevel: database.RobotLevelNormal,
                        })

                        log.Printf("[ArenaPatcher] 机器人 %s(ID:%d) 已加入会话 %d",
                                robot.Nickname, robot.ID, sessionID)

                        // 更新内存缓存
                        ap.robotManager.LockRobotInMemory(robot.ID, sessionID, now)
                }

                // 更新会话参赛人数
                if len(filledRobots) > 0 {
                        if err := tx.Model(&database.ArenaSession{}).
                                Where("id = ?", sessionID).
                                Updates(map[string]interface{}{
                                        "total_players":  gorm.Expr("total_players + ?", len(filledRobots)),
                                        "active_players": gorm.Expr("active_players + ?", len(filledRobots)),
                                }).Error; err != nil {
                                return err
                        }
                }

                return nil
        })

        if err != nil {
                // 事务失败，GORM会自动回滚数据库操作
                // 但需要清理内存缓存中已锁定的机器人
                log.Printf("[ArenaPatcher] 补位事务失败: %v", err)
                for _, robotID := range lockedRobotIDs {
                        ap.robotManager.ClearRobotMemory(robotID)
                }
                return nil, err
        }

        log.Printf("[ArenaPatcher] 补位成功，共补位 %d 个机器人", len(filledRobots))
        return filledRobots, nil
}

// selectRobotLevel 选择机器人等级
func (ap *ArenaPatcher) selectRobotLevel() uint8 {
        switch ap.config.FillStrategy {
        case "weak_first":
                // 优先选择低等级机器人
                return ap.config.RobotLevelMin
        case "strong_first":
                // 优先选择高等级机器人
                return ap.config.RobotLevelMax
        case "balanced":
                // 选择中等等级机器人
                return uint8((int(ap.config.RobotLevelMin) + int(ap.config.RobotLevelMax)) / 2)
        case "random":
                // 随机等级，返回0表示从所有等级选择
                return 0
        default:
                return 0
        }
}

// recordFill 记录补位信息
func (ap *ArenaPatcher) recordFill(sessionID uint64, robots []*FilledRobot, reason string) {
        record := &FillRecord{
                SessionID:    sessionID,
                FilledRobots: robots,
                FillTime:     time.Now(),
                FillReason:   reason,
        }

        ap.fillRecords[sessionID] = record

        // 记录日志
        log.Printf("[ArenaPatcher] 会话 %d 补位完成，补位机器人数量: %d，原因: %s",
                sessionID, len(robots), reason)
}

// =============================================
// 补位辅助方法
// =============================================

// GetFillRecord 获取补位记录
func (ap *ArenaPatcher) GetFillRecord(sessionID uint64) (*FillRecord, bool) {
        ap.mu.RLock()
        defer ap.mu.RUnlock()

        record, exists := ap.fillRecords[sessionID]
        return record, exists
}

// RemoveFilledRobots 移除补位的机器人
func (ap *ArenaPatcher) RemoveFilledRobots(sessionID uint64) error {
        ap.mu.Lock()
        defer ap.mu.Unlock()

        record, exists := ap.fillRecords[sessionID]
        if !exists {
                return nil
        }

        // 释放所有补位的机器人
        for _, robot := range record.FilledRobots {
                if err := ap.robotManager.ReleaseRobot(robot.RobotID); err != nil {
                        log.Printf("[ArenaPatcher] 释放机器人 %d 失败: %v", robot.RobotID, err)
                }

                // 删除参赛记录
                ap.db.Where("session_id = ? AND player_id = ?", sessionID, robot.PlayerID).
                        Delete(&database.ArenaParticipation{})
        }

        delete(ap.fillRecords, sessionID)
        log.Printf("[ArenaPatcher] 已移除会话 %d 的 %d 个补位机器人", sessionID, len(record.FilledRobots))

        return nil
}

// CheckPlayerCount 检查是否需要补位
// 返回需要补位的数量
func (ap *ArenaPatcher) CheckPlayerCount(sessionID uint64) (int, error) {
        // 获取会话信息
        var session database.ArenaSession
        if err := ap.db.Preload("RoomConfig").First(&session, sessionID).Error; err != nil {
                return 0, err
        }

        // 获取当前参赛人数
        var count int64
        ap.db.Model(&database.ArenaParticipation{}).
                Where("session_id = ? AND is_eliminated = 0", sessionID).
                Count(&count)

        // 计算是否需要补位
        // MinPlayers 配置在 RoomConfig 中
        minPlayers := session.RoomConfig.MinPlayers
        if minPlayers <= 0 {
                minPlayers = 3 // 默认最小人数
        }
        fillCount := ap.calculateFillCount(int(count), minPlayers)
        return fillCount, nil
}

// CanFillInRound 检查是否可以在当前轮次补位
func (ap *ArenaPatcher) CanFillInRound(session *database.ArenaSession) bool {
        // 如果允许决赛补位，直接返回true
        if ap.config.AllowFinalRoundFill {
                return true
        }

        // 检查是否是决赛阶段（最后一轮或剩余玩家<=3）
        if session.CurrentRound >= session.TotalRounds {
                log.Printf("[ArenaPatcher] 决赛阶段不允许补位")
                return false
        }

        return true
}

// CalculateOptimalFillCount 计算最优补位数量
// 考虑当前人数和桌数，确保每桌都能正常开始
func (ap *ArenaPatcher) CalculateOptimalFillCount(currentPlayers int) int {
        // 每桌需要3人
        tableCount := int(math.Ceil(float64(currentPlayers) / 3.0))
        neededPlayers := tableCount * 3

        // 如果已经是3的倍数，检查是否需要加桌
        if currentPlayers%3 == 0 && currentPlayers > 0 {
                // 当前人数刚好，不需要补位
                return 0
        }

        // 补位到下一个完整的桌数
        fillCount := neededPlayers - currentPlayers
        if fillCount < 0 {
                fillCount = 0
        }

        return fillCount
}

// =============================================
// 配置方法
// =============================================

// UpdateConfig 更新补位配置
func (ap *ArenaPatcher) UpdateConfig(config *PatcherConfig) {
        ap.mu.Lock()
        defer ap.mu.Unlock()

        ap.config = config
        log.Printf("[ArenaPatcher] 配置已更新: %+v", config)
}

// GetConfig 获取当前配置
func (ap *ArenaPatcher) GetConfig() *PatcherConfig {
        ap.mu.RLock()
        defer ap.mu.RUnlock()

        return ap.config
}
