// Package server 提供斗地主游戏服务器核心功能
package server

import (
        "fmt"
        "log"
        "sort"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/robot"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
)

// =============================================
// 竞技场结算处理
// =============================================

// ArenaSettlement 竞技场结算处理器
// 负责处理竞技场结束时的结算逻辑
// 包括：排名计算、奖励分配、机器人处理
type ArenaSettlement struct {
        server         *Server
        robotManager   *robot.ArenaRobotManager
        scoreController *robot.RobotScoreController
}

// NewArenaSettlement 创建竞技场结算处理器
func NewArenaSettlement(server *Server) *ArenaSettlement {
        return &ArenaSettlement{
                server:          server,
                robotManager:    robot.NewArenaRobotManager(database.DB()),
                scoreController: robot.GetScoreController(),
        }
}

// =============================================
// 排名计算
// =============================================

// PlayerRankInfo 玩家排名信息
type PlayerRankInfo struct {
        PlayerID    uint64 `json:"player_id"`
        PlayerName  string `json:"player_name"`
        IsRobot     bool   `json:"is_robot"`
        Score       int64  `json:"score"`
        Rank        int    `json:"rank"`
        SkipReward  bool   `json:"skip_reward"`  // 是否跳过奖励（机器人冠军）
}

// CalculateRankings 计算竞技场排名
// players: 所有参与的玩家
// scores: 玩家积分 map[playerID]score
// 返回排序后的排名列表
func (s *ArenaSettlement) CalculateRankings(players []uint64, scores map[uint64]int64) []*PlayerRankInfo {
        rankings := make([]*PlayerRankInfo, 0, len(players))

        // 获取玩家信息
        for _, playerID := range players {
                var player database.Player
                if err := database.DB().First(&player, playerID).Error; err != nil {
                        log.Printf("[ArenaSettlement] 获取玩家信息失败: playerID=%d, err=%v", playerID, err)
                        continue
                }

                score := scores[playerID]
                isRobot := player.PlayerType == database.PlayerTypeRobot

                rankings = append(rankings, &PlayerRankInfo{
                        PlayerID:   playerID,
                        PlayerName: player.Nickname,
                        IsRobot:    isRobot,
                        Score:      score,
                        Rank:       0, // 稍后计算
                        SkipReward: false,
                })
        }

        // 按积分排序（从高到低）
        sort.Slice(rankings, func(i, j int) bool {
                return rankings[i].Score > rankings[j].Score
        })

        // 计算排名
        for i, r := range rankings {
                r.Rank = i + 1
        }

        return rankings
}

// =============================================
// 奖励分配
// =============================================

// DistributeRewards 分配竞技场奖励
// 机器人不能获得奖励，奖励顺延给真人玩家
func (s *ArenaSettlement) DistributeRewards(rankings []*PlayerRankInfo, roomID uint64) map[uint64]int64 {
        // 获取奖励配置
        rewards := s.getRewardConfig(roomID)

        allocations := make(map[uint64]int64)

        // 处理排名，机器人跳过奖励
        rewardIndex := 0
        for _, r := range rankings {
                if r.IsRobot {
                        // 机器人不获得奖励
                        log.Printf("[ArenaSettlement] 🤖 机器人 %s 排名 #%d，跳过奖励", r.PlayerName, r.Rank)
                        r.SkipReward = true
                        continue
                }

                // 真人玩家获得奖励
                if rewardIndex < len(rewards) {
                        allocations[r.PlayerID] = rewards[rewardIndex]
                        log.Printf("[ArenaSettlement] 🏆 玩家 %s 排名 #%d 获得奖励 %d 金币",
                                r.PlayerName, r.Rank, rewards[rewardIndex])
                        rewardIndex++
                }
        }

        return allocations
}

// getRewardConfig 获取奖励配置
func (s *ArenaSettlement) getRewardConfig(roomID uint64) []int64 {
        // 从数据库获取房间配置
        roomConfig, err := database.GetRoomConfigByID(roomID)
        if err != nil {
                log.Printf("[ArenaSettlement] 获取房间配置失败: %v", err)
                return []int64{1000, 500, 300} // 默认奖励
        }

        // 根据报名费计算奖励
        signupFee := roomConfig.EntryGold
        if signupFee <= 0 {
                signupFee = 100
        }

        // 冠军、亚军、季军奖励
        // 简化计算：冠军=报名费*3, 亚军=报名费*2, 季军=报名费*1
        return []int64{
                signupFee * 3, // 冠军
                signupFee * 2, // 亚军
                signupFee * 1, // 季军
        }
}

// =============================================
// 机器人处理
// =============================================

// AdjustRobotRankings 调整机器人排名
// 确保机器人排名在合理范围内
func (s *ArenaSettlement) AdjustRobotRankings(rankings []*PlayerRankInfo) []*PlayerRankInfo {
        // 检查冠军是否是机器人
        for i, r := range rankings {
                if r.Rank == 1 && r.IsRobot {
                        log.Printf("[ArenaSettlement] 🤖 机器人 %s 获得冠军，调整排名", r.PlayerName)

                        // 找到排名最高的真人玩家
                        for j, r2 := range rankings {
                                if !r2.IsRobot {
                                        // 交换排名（只调整显示）
                                        rankings[i].Rank = rankings[j].Rank
                                        rankings[j].Rank = 1
                                        rankings[i].SkipReward = true
                                        log.Printf("[ArenaSettlement] 🏆 真人玩家 %s 上升为冠军", r2.PlayerName)
                                        break
                                }
                        }
                        break
                }
        }

        return rankings
}

// ReleaseArenaRobots 释放竞技场的所有机器人
func (s *ArenaSettlement) ReleaseArenaRobots(roomID uint64) error {
        return s.robotManager.ReleaseArenaRobots(roomID)
}

// ReleasePeriodRobots 释放指定期号的所有机器人
func (s *ArenaSettlement) ReleasePeriodRobots(periodNo string) error {
        return s.robotManager.ReleasePeriodRobots(periodNo)
}

// =============================================
// 结算流程
// =============================================

// ProcessSettlement 处理竞技场结算
// 返回：奖励分配结果
func (s *ArenaSettlement) ProcessSettlement(periodNo string, roomID uint64, players []uint64, scores map[uint64]int64) map[uint64]int64 {
        log.Printf("[ArenaSettlement] ===== 开始竞技场结算 =====")
        log.Printf("[ArenaSettlement] 期号: %s, 房间ID: %d, 玩家数: %d", periodNo, roomID, len(players))

        // 1. 计算排名
        rankings := s.CalculateRankings(players, scores)

        // 2. 调整机器人排名
        rankings = s.AdjustRobotRankings(rankings)

        // 3. 分配奖励
        allocations := s.DistributeRewards(rankings, roomID)

        // 4. 发放奖励
        for playerID, amount := range allocations {
                if amount > 0 {
                        err := database.UpdatePlayerGoldWithLog(
                                playerID,
                                amount,
                                database.GoldChangeArenaReward,
                                periodNo,
                                "竞技场奖励",
                        )
                        if err != nil {
                                log.Printf("[ArenaSettlement] 发放奖励失败: playerID=%d, amount=%d, err=%v", playerID, amount, err)
                        } else {
                                log.Printf("[ArenaSettlement] ✅ 发放奖励: playerID=%d, amount=%d", playerID, amount)
                        }
                }
        }

        // 5. 释放机器人
        if err := s.ReleasePeriodRobots(periodNo); err != nil {
                log.Printf("[ArenaSettlement] ⚠️ 释放机器人失败: %v", err)
        }

        // 6. 记录结算结果
        s.logSettlement(rankings, allocations)

        // 7. 🏆 冠军跑马灯广播
        s.broadcastChampion(periodNo, roomID, rankings, len(players))

        log.Printf("[ArenaSettlement] ===== 竞技场结算完成 =====")

        return allocations
}

// broadcastChampion 广播冠军跑马灯消息
// 在大厅显示："恭喜 XXX 在期号 XXXXXX 夺得XX竞技场冠军！"
func (s *ArenaSettlement) broadcastChampion(periodNo string, roomID uint64, rankings []*PlayerRankInfo, totalPlayers int) {
        if len(rankings) == 0 {
                return
        }

        // 获取冠军（排名第一且不是机器人）
        var champion *PlayerRankInfo
        for _, r := range rankings {
                if r.Rank == 1 && !r.IsRobot {
                        champion = r
                        break
                }
        }

        // 如果没有真人冠军，跳过广播
        if champion == nil {
                log.Printf("[ArenaSettlement] 🏆 无真人冠军，跳过跑马灯广播")
                return
        }

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(roomID)
        roomName := "竞技场"
        if err == nil && roomConfig != nil {
                roomName = roomConfig.RoomName
        }

        // 获取亚军和季军名称
        runnerUpName := ""
        thirdName := ""
        for _, r := range rankings {
                if r.Rank == 2 && !r.IsRobot {
                        runnerUpName = r.PlayerName
                }
                if r.Rank == 3 && !r.IsRobot {
                        thirdName = r.PlayerName
                }
        }

        // 获取冠军头像
        championPlayer, _ := database.GetPlayerByID(champion.PlayerID)
        championAvatar := ""
        if championPlayer != nil {
                championAvatar = championPlayer.Avatar
        }

        // 构建广播消息
        payload := &protocol.ArenaChampionBroadcastPayload{
                PeriodNo:        periodNo,
                RoomID:          roomID,
                RoomName:        roomName,
                ChampionID:      champion.PlayerID,
                ChampionName:    champion.PlayerName,
                ChampionAvatar:  championAvatar,
                RunnerUpName:    runnerUpName,
                ThirdName:       thirdName,
                TotalPlayers:    totalPlayers,
                MatchCoin:       champion.Score,
                Message:         fmt.Sprintf("恭喜 %s 在期号 %s 夺得%s冠军！", champion.PlayerName, periodNo, roomName),
                Timestamp:       time.Now().UnixMilli(),
        }

        // 广播给所有在线玩家
        s.server.BroadcastChampion(payload)

        log.Printf("[ArenaSettlement] 🏆 冠军跑马灯广播: %s", payload.Message)
}

// logSettlement 记录结算结果
func (s *ArenaSettlement) logSettlement(rankings []*PlayerRankInfo, allocations map[uint64]int64) {
        log.Printf("[ArenaSettlement] 排名结果:")
        for _, r := range rankings {
                suffix := ""
                if r.IsRobot {
                        suffix = " 🤖"
                }
                if r.SkipReward {
                        suffix += " (跳过奖励)"
                }
                amount := allocations[r.PlayerID]
                log.Printf("[ArenaSettlement]   #%d %s: %d 积分, 奖励 %d%s",
                        r.Rank, r.PlayerName, r.Score, amount, suffix)
        }
}

// =============================================
// 统计信息
// =============================================

// GetSettlementStats 获取结算统计
func (s *ArenaSettlement) GetSettlementStats(rankings []*PlayerRankInfo) map[string]interface{} {
        totalPlayers := len(rankings)
        robotCount := 0
        realPlayerCount := 0

        for _, r := range rankings {
                if r.IsRobot {
                        robotCount++
                } else {
                        realPlayerCount++
                }
        }

        return map[string]interface{}{
                "total_players":    totalPlayers,
                "robot_count":      robotCount,
                "real_player_count": realPlayerCount,
        }
}
