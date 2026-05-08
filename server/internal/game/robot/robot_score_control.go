// Package robot 提供斗地主游戏的机器人系统核心功能
package robot

import (
	"log"
	"math/rand"
	"sort"
	"time"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// 机器人分数控制系统
// =============================================

// RobotScoreController 机器人分数控制器
// 负责控制机器人在竞技场中的表现，确保排名分布合理
// 目标分布：
// - 冠军概率: 5%
// - 亚军概率: 20%
// - 中间排名概率: 55%
// - 淘汰概率: 20%
type RobotScoreController struct {
	// 排名概率配置
	ChampionProbability float64 // 冠军概率
	RunnerUpProbability float64 // 亚军概率
	MiddleProbability   float64 // 中间排名概率
	EliminatedProbability float64 // 淘汰概率

	// 积分控制
	MinScoreDelta int64 // 最小积分变化
	MaxScoreDelta int64 // 最大积分变化

	// 让牌控制
	LetWinThreshold float64 // 让牌阈值
}

// NewRobotScoreController 创建分数控制器
func NewRobotScoreController() *RobotScoreController {
	return &RobotScoreController{
		ChampionProbability:   0.05,  // 5%
		RunnerUpProbability:   0.20,  // 20%
		MiddleProbability:     0.55,  // 55%
		EliminatedProbability: 0.20,  // 20%
		MinScoreDelta:         -500,
		MaxScoreDelta:         500,
		LetWinThreshold:       0.8,
	}
}

// =============================================
// 排名控制
// =============================================

// DetermineTargetRank 确定目标排名
// 根据概率分布决定机器人的目标排名
func (c *RobotScoreController) DetermineTargetRank(totalPlayers int) int {
	if totalPlayers <= 0 {
		return 1
	}

	// 生成随机数
	r := rand.Float64()

	// 根据概率分布确定排名
	switch {
	case r < c.ChampionProbability:
		// 冠军
		log.Printf("[ScoreControl] 目标排名: 冠军 (概率 %.0f%%)", c.ChampionProbability*100)
		return 1
	case r < c.ChampionProbability+c.RunnerUpProbability:
		// 亚军
		log.Printf("[ScoreControl] 目标排名: 亚军 (概率 %.0f%%)", c.RunnerUpProbability*100)
		return 2
	case r < c.ChampionProbability+c.RunnerUpProbability+c.EliminatedProbability:
		// 淘汰区
		// 淘汰排名在末尾
		eliminatedRank := totalPlayers - rand.Intn(totalPlayers/3)
		if eliminatedRank < 3 {
			eliminatedRank = totalPlayers
		}
		log.Printf("[ScoreControl] 目标排名: 淘汰区 #%d (概率 %.0f%%)", eliminatedRank, c.EliminatedProbability*100)
		return eliminatedRank
	default:
		// 中间区
		middleStart := 3
		middleEnd := totalPlayers - totalPlayers/3
		if middleEnd <= middleStart {
			middleEnd = totalPlayers / 2
		}
		middleRank := middleStart + rand.Intn(middleEnd-middleStart+1)
		log.Printf("[ScoreControl] 目标排名: 中间区 #%d (概率 %.0f%%)", middleRank, c.MiddleProbability*100)
		return middleRank
	}
}

// CalculateScoreAdjustment 计算积分调整
// 根据目标排名和当前状态计算应该给予的积分变化
func (c *RobotScoreController) CalculateScoreAdjustment(currentRank, targetRank int, currentScore int64) int64 {
	// 如果当前排名比目标好，需要降低积分
	if currentRank > 0 && currentRank < targetRank {
		// 需要表现差一些
		adjustment := -int64(rand.Intn(200) + 100)
		log.Printf("[ScoreControl] 当前 #%d 比目标 #%d 好，降低积分: %+d", currentRank, targetRank, adjustment)
		return adjustment
	}

	// 如果当前排名比目标差，需要提高积分
	if currentRank > targetRank {
		// 需要表现好一些
		adjustment := int64(rand.Intn(150) + 50)
		log.Printf("[ScoreControl] 当前 #%d 比目标 #%d 差，提高积分: %+d", currentRank, targetRank, adjustment)
		return adjustment
	}

	// 保持现状
	adjustment := int64(rand.Intn(100) - 50)
	log.Printf("[ScoreControl] 当前 #%d 符合目标 #%d，微调积分: %+d", currentRank, targetRank, adjustment)
	return adjustment
}

// =============================================
// 胜负控制
// =============================================

// ShouldWinRound 判断是否应该赢得本轮
// 基于目标排名和当前状态
func (c *RobotScoreController) ShouldWinRound(runtime *ArenaRobotRuntime) bool {
	if runtime == nil || runtime.ScoreControl == nil {
		return rand.Float64() < 0.5 // 默认50%胜率
	}

	// 获取目标排名
	targetMin := runtime.ScoreControl.TargetRankRange[0]
	targetMax := runtime.ScoreControl.TargetRankRange[1]
	currentRank := runtime.Rank

	// 当前排名比目标好很多，需要输
	if currentRank > 0 && currentRank < targetMin {
		winProb := runtime.ScoreControl.WinProbability * 0.3 // 降低获胜概率
		shouldWin := rand.Float64() < winProb
		log.Printf("[ScoreControl] 当前 #%d 比目标 #%d-#%d 好，获胜概率 %.0f%% -> %v",
			currentRank, targetMin, targetMax, winProb*100, shouldWin)
		return shouldWin
	}

	// 当前排名比目标差，需要赢
	if currentRank > targetMax {
		winProb := runtime.ScoreControl.WinProbability * 1.5 // 提高获胜概率
		if winProb > 0.9 {
			winProb = 0.9
		}
		shouldWin := rand.Float64() < winProb
		log.Printf("[ScoreControl] 当前 #%d 比目标 #%d-#%d 差，获胜概率 %.0f%% -> %v",
			currentRank, targetMin, targetMax, winProb*100, shouldWin)
		return shouldWin
	}

	// 在目标范围内，正常概率
	shouldWin := rand.Float64() < runtime.ScoreControl.WinProbability
	log.Printf("[ScoreControl] 当前 #%d 在目标 #%d-#%d 内，获胜概率 %.0f%% -> %v",
		currentRank, targetMin, targetMax, runtime.ScoreControl.WinProbability*100, shouldWin)
	return shouldWin
}

// ShouldLetWin 判断是否应该让牌
// 在关键时刻让对手赢
func (c *RobotScoreController) ShouldLetWin(runtime *ArenaRobotRuntime) bool {
	if runtime == nil || runtime.ScoreControl == nil {
		return false
	}

	// 检查是否启用让牌
	if !runtime.ScoreControl.LetWinEnabled {
		return false
	}

	// 当前排名比目标好，触发让牌
	targetMin := runtime.ScoreControl.TargetRankRange[0]
	currentRank := runtime.Rank

	if currentRank > 0 && currentRank < targetMin {
		// 高概率让牌
		if rand.Float64() < c.LetWinThreshold {
			log.Printf("[ScoreControl] 触发让牌: 当前 #%d < 目标 #%d", currentRank, targetMin)
			return true
		}
	}

	// 根据失误率随机让牌
	if rand.Float64() < runtime.ScoreControl.MistakeRate {
		log.Printf("[ScoreControl] 失误触发让牌")
		return true
	}

	return false
}

// =============================================
// 奖励分配
// =============================================

// AdjustFinalRanking 调整最终排名
// 确保机器人排名在合理范围内
// 返回：是否应该跳过机器人（不给予奖励）
func (c *RobotScoreController) AdjustFinalRanking(rankings []*PlayerRanking) []*PlayerRanking {
	if len(rankings) == 0 {
		return rankings
	}

	// 按积分排序
	sort.Slice(rankings, func(i, j int) bool {
		return rankings[i].Score > rankings[j].Score
	})

	// 检查冠军是否是机器人
	for i, r := range rankings {
		if r.IsRobot && r.Rank == 1 {
			// 机器人冠军，标记跳过奖励
			r.SkipReward = true
			log.Printf("[ScoreControl] 机器人 %d 获得冠军，跳过奖励", r.PlayerID)

			// 找到排名最高的真人玩家
			for j, r2 := range rankings {
				if !r2.IsRobot {
					// 交换排名（不交换积分，只调整排名显示）
					// 机器人降为第二
					rankings[i].Rank = 2
					rankings[j].Rank = 1
					log.Printf("[ScoreControl] 真人玩家 %d 上升为冠军", r2.PlayerID)
					break
				}
			}
			break
		}
	}

	return rankings
}

// PlayerRanking 玩家排名信息
type PlayerRanking struct {
	PlayerID   uint64 `json:"player_id"`
	IsRobot    bool   `json:"is_robot"`
	Rank       int    `json:"rank"`
	Score      int64  `json:"score"`
	SkipReward bool   `json:"skip_reward"`
}

// =============================================
// 游戏结果控制
// =============================================

// InjectControlledMistake 注入受控失误
// 在关键时刻故意打错牌
func (c *RobotScoreController) InjectControlledMistake(runtime *ArenaRobotRuntime) bool {
	if runtime == nil || runtime.ScoreControl == nil {
		return false
	}

	// 检查是否需要让牌
	if c.ShouldLetWin(runtime) {
		log.Printf("[ScoreControl] 注入受控失误: 机器人 %d", runtime.RobotID)
		return true
	}

	return false
}

// =============================================
// 分数记录
// =============================================

// RecordGameResult 记录游戏结果
// 用于统计机器人的表现
func (c *RobotScoreController) RecordGameResult(robotID uint64, isWin bool, scoreDelta int64) {
	log.Printf("[ScoreControl] 记录游戏结果: 机器人=%d, 获胜=%v, 积分变化=%+d", robotID, isWin, scoreDelta)
}

// =============================================
// 工厂方法
// =============================================

// CreateScoreControlConfig 创建分数控制配置
func (c *RobotScoreController) CreateScoreControlConfig(targetRank int) *ScoreControlConfig {
	// 根据目标排名确定配置
	winProb := 0.45
	mistakeRate := 0.15

	switch {
	case targetRank == 1:
		// 冠军配置
		winProb = 0.65
		mistakeRate = 0.05
	case targetRank == 2:
		// 亚军配置
		winProb = 0.55
		mistakeRate = 0.10
	case targetRank >= 3 && targetRank <= 5:
		// 中间配置
		winProb = 0.45
		mistakeRate = 0.15
	default:
		// 淘汰配置
		winProb = 0.35
		mistakeRate = 0.25
	}

	return &ScoreControlConfig{
		TargetRankRange: [2]int{targetRank, targetRank + 2},
		WinProbability:  winProb,
		LetWinEnabled:   targetRank > 1,
		MistakeRate:     mistakeRate,
	}
}

// =============================================
// 全局实例
// =============================================

var (
	globalScoreController *RobotScoreController
	scoreControllerMu     sync.RWMutex
)

// GetScoreController 获取全局分数控制器
func GetScoreController() *RobotScoreController {
	scoreControllerMu.Lock()
	defer scoreControllerMu.Unlock()

	if globalScoreController == nil {
		globalScoreController = NewRobotScoreController()
	}

	return globalScoreController
}

// InitializeScoreController 初始化分数控制器
func InitializeScoreController(config *database.RobotConfig) *RobotScoreController {
	scoreControllerMu.Lock()
	defer scoreControllerMu.Unlock()

	globalScoreController = &RobotScoreController{
		ChampionProbability:   0.05,
		RunnerUpProbability:   0.20,
		MiddleProbability:     0.55,
		EliminatedProbability: 0.20,
		MinScoreDelta:         -500,
		MaxScoreDelta:         500,
		LetWinThreshold:       float64(config.LetWinProbability),
	}

	return globalScoreController
}

// =============================================
// 竞技场结算辅助函数
// =============================================

// FilterRobotFromRewards 过滤机器人，不给予奖励
// 返回：应该获得奖励的真人玩家列表
func FilterRobotFromRewards(rankings []*PlayerRanking, robotManager *ArenaRobotManager) []*PlayerRanking {
	result := make([]*PlayerRanking, 0)

	for _, r := range rankings {
		if r.IsRobot {
			// 机器人不获得奖励
			log.Printf("[ScoreControl] 机器人 %d 排名 #%d，跳过奖励", r.PlayerID, r.Rank)
			continue
		}
		result = append(result, r)
	}

	return result
}

// DistributeArenaRewards 分配竞技场奖励
// 机器人不能获得奖励，奖励顺延给真人玩家
func DistributeArenaRewards(rankings []*PlayerRanking, rewards []RewardConfig, robotManager *ArenaRobotManager) map[uint64]int64 {
	allocations := make(map[uint64]int64)

	// 过滤机器人
	realPlayers := FilterRobotFromRewards(rankings, robotManager)

	// 按排名分配奖励
	for i, player := range realPlayers {
		if i < len(rewards) {
			allocations[player.PlayerID] = rewards[i].Amount
			log.Printf("[ScoreControl] 玩家 %d 排名 #%d 获得奖励 %d",
				player.PlayerID, i+1, rewards[i].Amount)
		}
	}

	return allocations
}

// RewardConfig 奖励配置
type RewardConfig struct {
	Rank   int   `json:"rank"`
	Amount int64 `json:"amount"`
}

// =============================================
// 初始化
// =============================================

func init() {
	rand.Seed(time.Now().UnixNano())
}
