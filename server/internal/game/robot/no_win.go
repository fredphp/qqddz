// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
        "log"
        "math/rand"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "gorm.io/gorm"
)

// =============================================
// NoWinController 机器人不能夺冠控制器
// =============================================

// NoWinController 机器人不能夺冠控制器
// 负责在决赛阶段控制机器人行为，确保机器人不会获得冠军
type NoWinController struct {
        db           *gorm.DB
        robotManager *RobotManager

        // 控制配置
        config *NoWinConfig

        // 决赛阶段标记: sessionID -> true
        finalRounds map[uint64]bool

        // 让牌目标: robotID -> targetPlayerID
        letWinTargets map[uint64]uint64

        mu sync.RWMutex
}

// NoWinConfig 不能夺冠配置
type NoWinConfig struct {
        // 是否启用不能夺冠逻辑
        EnableNoWin bool `json:"enable_no_win" yaml:"enable_no_win"`

        // 开始让牌的轮次（从后往前数，如最后2轮）
        StartFromRound int `json:"start_from_round" yaml:"start_from_round"`

        // 让牌概率（0-100）
        LetWinProbability int `json:"let_win_probability" yaml:"let_win_probability"`

        // 是否强制让牌（当只剩1个真人玩家时）
        ForceLetWin bool `json:"force_let_win" yaml:"force_let_win"`

        // 让牌策略: "smart", "random", "aggressive"
        LetWinStrategy string `json:"let_win_strategy" yaml:"let_win_strategy"`

        // 机器人最大可获得的排名（1为冠军，不能设置1）
        MaxRank int `json:"max_rank" yaml:"max_rank"`
}

// DefaultNoWinConfig 默认不能夺冠配置
func DefaultNoWinConfig() *NoWinConfig {
        return &NoWinConfig{
                EnableNoWin:       true,
                StartFromRound:    2,
                LetWinProbability: 70,
                ForceLetWin:       true,
                LetWinStrategy:    "smart",
                MaxRank:           2, // 机器人最多只能获得亚军
        }
}

// NewNoWinController 创建不能夺冠控制器
func NewNoWinController(db *gorm.DB, robotManager *RobotManager, config *NoWinConfig) *NoWinController {
        if config == nil {
                config = DefaultNoWinConfig()
        }

        nwc := &NoWinController{
                db:            db,
                robotManager:  robotManager,
                config:        config,
                finalRounds:   make(map[uint64]bool),
                letWinTargets: make(map[uint64]uint64),
        }

        log.Printf("[NoWinController] 控制器已创建，配置: 让牌概率=%d%%, 最大排名=%d, 策略=%s",
                config.LetWinProbability, config.MaxRank, config.LetWinStrategy)

        return nwc
}

// =============================================
// 决赛检查方法
// =============================================

// CheckFinalRound 检查是否进入决赛阶段
// 当剩余玩家数量较少或进入最后几轮时标记为决赛阶段
func (nwc *NoWinController) CheckFinalRound(session *database.ArenaSession, activePlayers []*database.ArenaParticipation) bool {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        // 检查是否启用不能夺冠逻辑
        if !nwc.config.EnableNoWin {
                return false
        }

        // 计算剩余轮次
        remainingRounds := session.TotalRounds - session.CurrentRound + 1

        // 检查是否进入决赛阶段
        isFinal := false

        // 条件1：进入最后N轮
        if remainingRounds <= nwc.config.StartFromRound {
                isFinal = true
                log.Printf("[NoWinController] 会话 %d 进入决赛阶段（剩余%d轮）", session.ID, remainingRounds)
        }

        // 条件2：剩余玩家数量较少（<=4人）
        if len(activePlayers) <= 4 {
                isFinal = true
                log.Printf("[NoWinController] 会话 %d 进入决赛阶段（剩余%d人）", session.ID, len(activePlayers))
        }

        // 条件3：剩余玩家中只有1个真人
        realPlayerCount := 0
        for _, p := range activePlayers {
                if p.IsRobot == 0 {
                        realPlayerCount++
                }
        }
        if realPlayerCount <= 1 && len(activePlayers) > 1 {
                isFinal = true
                log.Printf("[NoWinController] 会话 %d 进入决赛阶段（只剩%d个真人）", session.ID, realPlayerCount)
        }

        // 更新决赛阶段标记
        if isFinal {
                nwc.finalRounds[session.ID] = true
        }

        return isFinal
}

// IsFinalRound 检查会话是否处于决赛阶段
func (nwc *NoWinController) IsFinalRound(sessionID uint64) bool {
        nwc.mu.RLock()
        defer nwc.mu.RUnlock()

        return nwc.finalRounds[sessionID]
}

// ClearFinalRound 清除决赛阶段标记
func (nwc *NoWinController) ClearFinalRound(sessionID uint64) {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        delete(nwc.finalRounds, sessionID)
}

// =============================================
// 让牌判断方法
// =============================================

// ShouldLetWin 判断机器人是否应该让牌
// 返回true表示机器人应该让真人玩家赢
func (nwc *NoWinController) ShouldLetWin(robotID uint64, sessionID uint64, tablePlayers []*database.ArenaParticipation) bool {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        // 检查是否启用不能夺冠逻辑
        if !nwc.config.EnableNoWin {
                return false
        }

        // 检查是否在决赛阶段
        if !nwc.finalRounds[sessionID] {
                return false
        }

        // 检查是否有真人玩家在桌上
        realPlayerID := nwc.findRealPlayerOnTable(tablePlayers)
        if realPlayerID == 0 {
                // 桌上全是机器人，不需要让牌
                return false
        }

        // 根据策略判断是否让牌
        shouldLetWin := false
        switch nwc.config.LetWinStrategy {
        case "smart":
                shouldLetWin = nwc.smartLetWinDecision(robotID, sessionID, realPlayerID, tablePlayers)
        case "random":
                shouldLetWin = nwc.randomLetWinDecision()
        case "aggressive":
                shouldLetWin = true
        default:
                shouldLetWin = nwc.randomLetWinDecision()
        }

        if shouldLetWin {
                // 记录让牌目标
                nwc.letWinTargets[robotID] = realPlayerID
                log.Printf("[NoWinController] 机器人 %d 将让牌给玩家 %d", robotID, realPlayerID)
        }

        return shouldLetWin
}

// findRealPlayerOnTable 找到桌上的真人玩家
func (nwc *NoWinController) findRealPlayerOnTable(players []*database.ArenaParticipation) uint64 {
        for _, p := range players {
                if p.IsRobot == 0 {
                        return p.PlayerID
                }
        }
        return 0
}

// smartLetWinDecision 智能让牌决策
// 考虑多种因素来决定是否让牌
func (nwc *NoWinController) smartLetWinDecision(robotID uint64, sessionID uint64, targetPlayerID uint64, tablePlayers []*database.ArenaParticipation) bool {
        // 如果只有一个真人玩家，强制让牌
        realPlayerCount := 0
        for _, p := range tablePlayers {
                if p.IsRobot == 0 {
                        realPlayerCount++
                }
        }

        if realPlayerCount == 1 && nwc.config.ForceLetWin {
                log.Printf("[NoWinController] 桌上只有1个真人，强制让牌")
                return true
        }

        // 检查真人玩家的排名情况
        // 如果真人玩家处于劣势（比赛金币较低），增加让牌概率
        targetPlayer := nwc.findPlayerByID(tablePlayers, targetPlayerID)
        robotPlayer := nwc.findRobotPlayerByID(tablePlayers, robotID)

        if targetPlayer != nil && robotPlayer != nil {
                // 如果真人玩家比赛金币低于机器人，增加让牌概率
                if targetPlayer.MatchCoin < robotPlayer.MatchCoin {
                        adjustedProbability := nwc.config.LetWinProbability + 15
                        if adjustedProbability > 100 {
                                adjustedProbability = 100
                        }
                        return rand.Intn(100) < adjustedProbability
                }
        }

        // 默认使用配置的概率
        return nwc.randomLetWinDecision()
}

// randomLetWinDecision 随机让牌决策
func (nwc *NoWinController) randomLetWinDecision() bool {
        return rand.Intn(100) < nwc.config.LetWinProbability
}

// findPlayerByID 根据ID找到玩家
func (nwc *NoWinController) findPlayerByID(players []*database.ArenaParticipation, playerID uint64) *database.ArenaParticipation {
        for _, p := range players {
                if p.PlayerID == playerID {
                        return p
                }
        }
        return nil
}

// findRobotPlayerByID 根据机器人ID找到参赛记录
func (nwc *NoWinController) findRobotPlayerByID(players []*database.ArenaParticipation, robotID uint64) *database.ArenaParticipation {
        for _, p := range players {
                if p.RobotID == robotID {
                        return p
                }
        }
        return nil
}

// =============================================
// AI策略调整方法
// =============================================

// AdjustAIStrategy 调整AI策略
// 在决赛阶段调整机器人的AI行为
func (nwc *NoWinController) AdjustAIStrategy(robotID uint64, sessionID uint64, config *database.RobotAIConfig) *database.RobotAIConfig {
        nwc.mu.RLock()
        defer nwc.mu.RUnlock()

        // 检查是否应该让牌
        targetPlayerID, shouldLetWin := nwc.letWinTargets[robotID]
        if !shouldLetWin {
                return config
        }

        // 创建调整后的配置副本
        adjustedConfig := *config

        // 降低AI强度
        adjustedConfig.PlayStrength = maxInt(1, config.PlayStrength-30)

        // 增加失误概率
        adjustedConfig.MistakeProbability = minInt(50, config.MistakeProbability+20)

        // 增加思考时间（表现出犹豫）
        adjustedConfig.BaseThinkTime = config.BaseThinkTime + 500

        // 降低炸弹使用意愿
        adjustedConfig.BombProbability = maxFloat(0.1, config.BombProbability-0.3)

        log.Printf("[NoWinController] 机器人 %d AI策略已调整，让牌目标=%d", robotID, targetPlayerID)

        return &adjustedConfig
}

// GetLetWinTarget 获取机器人的让牌目标
func (nwc *NoWinController) GetLetWinTarget(robotID uint64) uint64 {
        nwc.mu.RLock()
        defer nwc.mu.RUnlock()

        return nwc.letWinTargets[robotID]
}

// ClearLetWinTarget 清除让牌目标
func (nwc *NoWinController) ClearLetWinTarget(robotID uint64) {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        delete(nwc.letWinTargets, robotID)
}

// =============================================
// 淘汰阶段处理方法
// =============================================

// ProcessElimination 处理淘汰阶段
// 在决赛阶段确保机器人优先被淘汰
func (nwc *NoWinController) ProcessElimination(sessionID uint64, activePlayers []*database.ArenaParticipation) ([]*database.ArenaParticipation, error) {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        // 检查是否在决赛阶段
        if !nwc.finalRounds[sessionID] {
                return nil, nil
        }

        // 分离机器人和真人玩家
        var robots []*database.ArenaParticipation
        var realPlayers []*database.ArenaParticipation

        for _, p := range activePlayers {
                if p.IsRobot == 1 {
                        robots = append(robots, p)
                } else {
                        realPlayers = append(realPlayers, p)
                }
        }

        // 如果只剩机器人和一个真人，确保机器人被淘汰
        if len(realPlayers) == 1 && len(robots) > 0 {
                log.Printf("[NoWinController] 决赛阶段确保机器人优先淘汰，真人玩家=%d", realPlayers[0].PlayerID)

                // 返回需要优先淘汰的机器人（按比赛金币从低到高排序）
                // 低金币的机器人优先淘汰
                nwc.sortByMatchCoinAsc(robots)

                // 标记机器人需要让牌
                for _, robot := range robots {
                        nwc.letWinTargets[robot.RobotID] = realPlayers[0].PlayerID
                }

                return robots, nil
        }

        return nil, nil
}

// sortByMatchCoinAsc 按比赛金币升序排序
func (nwc *NoWinController) sortByMatchCoinAsc(players []*database.ArenaParticipation) {
        for i := 0; i < len(players)-1; i++ {
                for j := i + 1; j < len(players); j++ {
                        if players[i].MatchCoin > players[j].MatchCoin {
                                players[i], players[j] = players[j], players[i]
                        }
                }
        }
}

// =============================================
// 冠军检查方法
// =============================================

// CheckAndPreventRobotChampion 检查并阻止机器人夺冠
// 如果机器人即将夺冠，调整排名
func (nwc *NoWinController) CheckAndPreventRobotChampion(sessionID uint64, activePlayers []*database.ArenaParticipation) (*database.ArenaParticipation, error) {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        // 检查是否启用不能夺冠逻辑
        if !nwc.config.EnableNoWin {
                return nil, nil
        }

        // 按比赛金币排序
        nwc.sortByMatchCoinDesc(activePlayers)

        // 检查第一名是否是机器人
        if len(activePlayers) > 0 && activePlayers[0].IsRobot == 1 {
                // 找到排名最靠前的真人玩家
                var topRealPlayer *database.ArenaParticipation
                for _, p := range activePlayers {
                        if p.IsRobot == 0 {
                                topRealPlayer = p
                                break
                        }
                }

                if topRealPlayer != nil {
                        // 调整排名：真人玩家成为冠军
                        robotID := activePlayers[0].RobotID
                        robotPlayerID := activePlayers[0].PlayerID
                        realPlayerID := topRealPlayer.PlayerID
                        maxRank := nwc.config.MaxRank

                        // 使用事务更新数据库，确保数据一致性
                        err := nwc.db.Transaction(func(tx *gorm.DB) error {
                                // 更新机器人排名
                                if err := tx.Model(&database.ArenaParticipation{}).
                                        Where("session_id = ? AND player_id = ?", sessionID, robotPlayerID).
                                        Update("rank", maxRank).Error; err != nil {
                                        return err
                                }

                                // 更新真人玩家排名为冠军
                                if err := tx.Model(&database.ArenaParticipation{}).
                                        Where("session_id = ? AND player_id = ?", sessionID, realPlayerID).
                                        Update("rank", 1).Error; err != nil {
                                        return err
                                }

                                // 更新会话冠军ID
                                if err := tx.Model(&database.ArenaSession{}).
                                        Where("id = ?", sessionID).
                                        Update("champion_id", realPlayerID).Error; err != nil {
                                        return err
                                }

                                return nil
                        })

                        if err != nil {
                                log.Printf("[NoWinController] 更新排名事务失败: %v", err)
                                return nil, err
                        }

                        log.Printf("[NoWinController] 阻止机器人 %d 夺冠，冠军调整为玩家 %d", robotID, realPlayerID)

                        return topRealPlayer, nil
                }
        }

        return nil, nil
}

// sortByMatchCoinDesc 按比赛金币降序排序
func (nwc *NoWinController) sortByMatchCoinDesc(players []*database.ArenaParticipation) {
        for i := 0; i < len(players)-1; i++ {
                for j := i + 1; j < len(players); j++ {
                        if players[i].MatchCoin < players[j].MatchCoin {
                                players[i], players[j] = players[j], players[i]
                        }
                }
        }
}

// =============================================
// 配置方法
// =============================================

// UpdateConfig 更新配置
func (nwc *NoWinController) UpdateConfig(config *NoWinConfig) {
        nwc.mu.Lock()
        defer nwc.mu.Unlock()

        nwc.config = config
        log.Printf("[NoWinController] 配置已更新: %+v", config)
}

// GetConfig 获取当前配置
func (nwc *NoWinController) GetConfig() *NoWinConfig {
        nwc.mu.RLock()
        defer nwc.mu.RUnlock()

        return nwc.config
}

// =============================================
// 辅助函数
// =============================================

func minInt(a, b int) int {
        if a < b {
                return a
        }
        return b
}

func maxInt(a, b int) int {
        if a > b {
                return a
        }
        return b
}

func maxFloat(a, b float64) float64 {
        if a > b {
                return a
        }
        return b
}

// =============================================
// 初始化随机种子
// =============================================

func init() {
        rand.Seed(time.Now().UnixNano())
}
