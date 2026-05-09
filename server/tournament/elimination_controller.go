// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
        "log"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "gorm.io/gorm"
)

// =============================================
// EliminationController - 淘汰控制器
// =============================================

// EliminationController 淘汰控制器
type EliminationController struct {
        db             *gorm.DB
        stateMachine   *StateMachine
        rankCalculator *RankCalculator
}

// NewEliminationController 创建淘汰控制器
func NewEliminationController(db *gorm.DB, sm *StateMachine, rc *RankCalculator) *EliminationController {
        return &EliminationController{
                db:             db,
                stateMachine:   sm,
                rankCalculator: rc,
        }
}

// ExecuteElimination 执行淘汰
// 参数:
// - sessionID: 会话ID
// - roundNum: 轮次号
// - eliminationTarget: 本轮保留人数
// 返回:
// - result: 淘汰结果
// - error: 错误
func (ec *EliminationController) ExecuteElimination(sessionID uint64, roundNum int, eliminationTarget int) (*EliminationResult, error) {
        log.Printf("[EliminationController] 开始执行淘汰: sessionID=%d, round=%d, target=%d",
                sessionID, roundNum, eliminationTarget)

        // 1. 先处理掉线玩家
        offlinePlayers, err := ec.rankCalculator.GetOfflinePlayers(sessionID)
        if err != nil {
                log.Printf("[EliminationController] 获取掉线玩家失败: %v", err)
        }

        // 2. 淘汰掉线玩家
        if len(offlinePlayers) > 0 {
                for _, p := range offlinePlayers {
                        if err := ec.eliminatePlayer(sessionID, p.PlayerID, roundNum, "offline"); err != nil {
                                log.Printf("[EliminationController] 淘汰掉线玩家失败: playerID=%d, err=%v", p.PlayerID, err)
                        } else {
                                log.Printf("[EliminationController] 淘汰掉线玩家: playerID=%d", p.PlayerID)
                        }
                }
        }

        // 3. 获取需要淘汰的玩家（按排名）
        toEliminate, err := ec.rankCalculator.GetPlayersToEliminate(sessionID, eliminationTarget)
        if err != nil {
                return nil, err
        }

        // 4. 执行淘汰
        for _, p := range toEliminate {
                if err := ec.eliminatePlayer(sessionID, p.PlayerID, roundNum, p.EliminatedReason); err != nil {
                        log.Printf("[EliminationController] 淘汰玩家失败: playerID=%d, err=%v", p.PlayerID, err)
                        continue
                }
                log.Printf("[EliminationController] 淘汰玩家: playerID=%d, rank=%d, reason=%s",
                        p.PlayerID, p.Rank, p.EliminatedReason)
        }

        // 5. 获取剩余玩家数
        remainingCount, err := ec.rankCalculator.GetRemainingPlayers(sessionID)
        if err != nil {
                return nil, err
        }

        // 6. 保存淘汰记录（使用分表）
        if err := ec.saveEliminationRecords(sessionID, roundNum, toEliminate); err != nil {
                log.Printf("[EliminationController] 保存淘汰记录失败: %v", err)
        }

        // 7. 更新会话活跃玩家数
        if err := ec.updateActivePlayers(sessionID); err != nil {
                log.Printf("[EliminationController] 更新活跃玩家数失败: %v", err)
        }

        // 8. 判断是否进入决赛
        isFinalRound := remainingCount <= 3

        result := &EliminationResult{
                SessionID:       sessionID,
                RoundNum:        roundNum,
                EliminatedCount: len(toEliminate),
                RemainingCount:  remainingCount,
                Eliminated:      toEliminate,
                IsFinalRound:    isFinalRound,
        }

        log.Printf("[EliminationController] 淘汰完成: eliminated=%d, remaining=%d, isFinal=%v",
                result.EliminatedCount, result.RemainingCount, result.IsFinalRound)

        return result, nil
}

// eliminatePlayer 淘汰单个玩家
// 🔧【重构】使用分表操作
func (ec *EliminationController) eliminatePlayer(sessionID, playerID uint64, roundNum int, reason string) error {
        // 获取淘汰前排名
        rank := 0
        if participations, err := database.GetActiveParticipations(sessionID); err == nil {
                for i, p := range participations {
                        if p.PlayerID == playerID {
                                rank = i + 1
                                break
                        }
                }
        }

        // 更新玩家淘汰状态（使用分表）
        return database.UpdateParticipationElimination(sessionID, playerID, true, roundNum, reason)
}

// saveEliminationRecords 保存淘汰记录
// 🔧【重构】使用分表存储
func (ec *EliminationController) saveEliminationRecords(sessionID uint64, roundNum int, players []*EliminatedPlayer) error {
        if len(players) == 0 {
                return nil
        }

        // 转换为数据库记录格式
        records := make([]*database.TournamentEliminationRecord, 0, len(players))
        for _, p := range players {
                records = append(records, &database.TournamentEliminationRecord{
                        SessionID:       sessionID,
                        RoundNum:        roundNum,
                        PlayerID:        p.PlayerID,
                        RankBefore:      p.Rank,
                        MatchCoin:       p.MatchCoin,
                        EliminatedReason: p.EliminatedReason,
                })
        }

        return database.BatchCreateTournamentEliminations(sessionID, roundNum, records)
}

// updateActivePlayers 更新会话活跃玩家数
// 🔧【重构】使用分表查询
func (ec *EliminationController) updateActivePlayers(sessionID uint64) error {
        count, err := database.CountActiveParticipations(sessionID)
        if err != nil {
                return err
        }

        return ec.db.Model(&database.ArenaSession{}).
                Where("id = ?", sessionID).
                Updates(map[string]interface{}{
                        "active_players": count,
                        "updated_at":     time.Now(),
                }).Error
}

// CheckAndEliminateOffline 检查并淘汰掉线玩家
func (ec *EliminationController) CheckAndEliminateOffline(sessionID uint64, roundNum int) ([]*EliminatedPlayer, error) {
        // 获取掉线玩家
        offlinePlayers, err := ec.rankCalculator.GetOfflinePlayers(sessionID)
        if err != nil {
                return nil, err
        }

        if len(offlinePlayers) == 0 {
                return []*EliminatedPlayer{}, nil
        }

        // 淘汰掉线玩家
        for _, p := range offlinePlayers {
                if err := ec.eliminatePlayer(sessionID, p.PlayerID, roundNum, "offline"); err != nil {
                        log.Printf("[EliminationController] 淘汰掉线玩家失败: playerID=%d, err=%v", p.PlayerID, err)
                } else {
                        log.Printf("[EliminationController] 淘汰掉线玩家: playerID=%d", p.PlayerID)
                }
        }

        return offlinePlayers, nil
}

// DetermineFinalRankings 确定决赛排名
// 🔧【重构】使用分表操作
func (ec *EliminationController) DetermineFinalRankings(sessionID uint64, players PlayerList) (*FinalResult, error) {
        if len(players) < 3 {
                return nil, ErrInsufficientPlayers
        }

        // 按比赛金币排序
        ec.rankCalculator.SortPlayersByCoin(players)

        // 处理机器人获奖情况（机器人不可获奖，顺延给真人）
        champion := players[0]
        runnerUp := players[1]
        third := players[2]

        // 如果冠军是补位机器人，顺延给第一个真人
        if champion.IsTournamentBot {
                for _, p := range players {
                        if !p.IsTournamentBot && !p.IsRobot {
                                champion = p
                                break
                        }
                }
        }

        // 如果亚军是补位机器人且冠军已被替换，同样顺延
        if runnerUp.IsTournamentBot && runnerUp.PlayerID == champion.PlayerID {
                for _, p := range players {
                        if !p.IsTournamentBot && !p.IsRobot && p.PlayerID != champion.PlayerID {
                                runnerUp = p
                                break
                        }
                }
        }

        // 如果季军是补位机器人，同样顺延
        if third.IsTournamentBot {
                for _, p := range players {
                        if !p.IsTournamentBot && !p.IsRobot &&
                                p.PlayerID != champion.PlayerID && p.PlayerID != runnerUp.PlayerID {
                                third = p
                                break
                        }
                }
        }

        // 更新数据库中的排名（使用分表）
        err := ec.db.Transaction(func(tx *gorm.DB) error {
                // 更新冠军
                if err := database.UpdateParticipationRank(sessionID, champion.PlayerID, 1, true); err != nil {
                        return err
                }

                // 更新亚军
                if err := database.UpdateParticipationRank(sessionID, runnerUp.PlayerID, 2, false); err != nil {
                        return err
                }

                // 更新季军
                if err := database.UpdateParticipationRank(sessionID, third.PlayerID, 3, false); err != nil {
                        return err
                }

                // 更新会话冠军信息
                now := time.Now()
                return tx.Model(&database.ArenaSession{}).
                        Where("id = ?", sessionID).
                        Updates(map[string]interface{}{
                                "champion_id":     champion.PlayerID,
                                "runner_up_id":    runnerUp.PlayerID,
                                "third_id":        third.PlayerID,
                                "status":          4, // 已结束
                                "end_time":        now,
                                "tournament_stage": "FINISHED",
                                "updated_at":      now,
                        }).Error
        })

        if err != nil {
                return nil, err
        }

        return &FinalResult{
                SessionID: sessionID,
                Champion:   champion,
                RunnerUp:   runnerUp,
                Third:      third,
                EndedAt:    time.Now(),
        }, nil
}

// GetEliminationBroadcast 构建淘汰广播数据
func (ec *EliminationController) GetEliminationBroadcast(result *EliminationResult) *EliminationBroadcastMessage {
        return &EliminationBroadcastMessage{
                RoundNum:        result.RoundNum,
                EliminatedCount: result.EliminatedCount,
                RemainingCount:  result.RemainingCount,
                Eliminated:      result.Eliminated,
        }
}

// GetFinalBroadcast 构建决赛广播数据
func (ec *EliminationController) GetFinalBroadcast(result *FinalResult) *FinalBroadcastMessage {
        return &FinalBroadcastMessage{
                ChampionName: result.Champion.Nickname,
                RunnerUpName: result.RunnerUp.Nickname,
                ThirdName:    result.Third.Nickname,
        }
}

// RecordRound 记录淘汰轮次信息
// 🔧【重构】使用分表存储
func (ec *EliminationController) RecordRound(sessionID uint64, roundNum, eliminationTarget, totalPlayers, tablesCount int) error {
        // 检查是否已存在
        rounds, err := database.GetTournamentRoundsBySessionID(sessionID)
        if err == nil {
                for _, r := range rounds {
                        if r["round_num"] == roundNum {
                                // 已存在，更新
                                return ec.db.Exec(`
                                        UPDATE `+getTableName("ddz_tournament_rounds")+`
                                        SET elimination_target = ?, total_players = ?, tables_count = ?, updated_at = NOW()
                                        WHERE session_id = ? AND round_num = ?
                                `, eliminationTarget, totalPlayers, tablesCount, sessionID, roundNum).Error
                        }
                }
        }

        // 创建新记录
        return database.CreateTournamentRound(sessionID, roundNum, eliminationTarget, totalPlayers, tablesCount)
}

// UpdateRoundStage 更新轮次阶段
// 🔧【重构】使用分表更新
func (ec *EliminationController) UpdateRoundStage(sessionID uint64, roundNum int, stage TournamentStage) error {
        return database.UpdateTournamentRoundStage(sessionID, roundNum, string(stage))
}

// CompleteRound 完成轮次
// 🔧【重构】使用分表更新
func (ec *EliminationController) CompleteRound(sessionID uint64, roundNum int) error {
        return database.CompleteTournamentRound(sessionID, roundNum)
}

// getTableName 获取分表名
func getTableName(baseTable string) string {
        suffix := time.Now().Format("200601")
        return baseTable + "_" + suffix
}
