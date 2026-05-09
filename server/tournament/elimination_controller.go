// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
	"log"
	"time"

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

	// 6. 保存淘汰记录
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
func (ec *EliminationController) eliminatePlayer(sessionID, playerID uint64, roundNum int, reason string) error {
	return ec.db.Transaction(func(tx *gorm.DB) error {
		// 获取淘汰前排名
		var rank int
		err := tx.Table("ddz_arena_participations").
			Select("COUNT(*) + 1").
			Where("session_id = ? AND is_eliminated = 0 AND round_match_coin > "+
				"(SELECT round_match_coin FROM ddz_arena_participations WHERE session_id = ? AND player_id = ?)",
				sessionID, sessionID, playerID).
			Scan(&rank).Error
		if err != nil {
			rank = 0
		}

		// 更新玩家淘汰状态
		err = tx.Exec(`
			UPDATE ddz_arena_participations 
			SET is_eliminated = 1,
				eliminated_round = ?,
				eliminated_reason = ?,
				rank = ?,
				updated_at = NOW()
			WHERE session_id = ? AND player_id = ?
		`, roundNum, reason, rank, sessionID, playerID).Error

		return err
	})
}

// saveEliminationRecords 保存淘汰记录
func (ec *EliminationController) saveEliminationRecords(sessionID uint64, roundNum int, players []*EliminatedPlayer) error {
	if len(players) == 0 {
		return nil
	}

	return ec.db.Transaction(func(tx *gorm.DB) error {
		for _, p := range players {
			err := tx.Exec(`
				INSERT INTO ddz_tournament_eliminations 
				(session_id, round_num, player_id, rank_before, match_coin, eliminated_reason, created_at)
				VALUES (?, ?, ?, ?, ?, ?, NOW())
			`, sessionID, roundNum, p.PlayerID, p.Rank, p.MatchCoin, p.EliminatedReason).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
}

// updateActivePlayers 更新会话活跃玩家数
func (ec *EliminationController) updateActivePlayers(sessionID uint64) error {
	return ec.db.Exec(`
		UPDATE ddz_arena_sessions s
		SET active_players = (
			SELECT COUNT(*) FROM ddz_arena_participations 
			WHERE session_id = s.id AND is_eliminated = 0
		),
		updated_at = NOW()
		WHERE id = ?
	`, sessionID).Error
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

	// 更新数据库中的排名
	err := ec.db.Transaction(func(tx *gorm.DB) error {
		// 更新冠军
		if err := tx.Exec(`
			UPDATE ddz_arena_participations 
			SET is_champion = 1, rank = 1, updated_at = NOW()
			WHERE session_id = ? AND player_id = ?
		`, sessionID, champion.PlayerID).Error; err != nil {
			return err
		}

		// 更新亚军
		if err := tx.Exec(`
			UPDATE ddz_arena_participations 
			SET rank = 2, updated_at = NOW()
			WHERE session_id = ? AND player_id = ?
		`, sessionID, runnerUp.PlayerID).Error; err != nil {
			return err
		}

		// 更新季军
		if err := tx.Exec(`
			UPDATE ddz_arena_participations 
			SET rank = 3, updated_at = NOW()
			WHERE session_id = ? AND player_id = ?
		`, sessionID, third.PlayerID).Error; err != nil {
			return err
		}

		// 更新会话冠军信息
		now := time.Now()
		return tx.Exec(`
			UPDATE ddz_arena_sessions 
			SET champion_id = ?, runner_up_id = ?, third_id = ?,
				status = 4, end_time = ?, tournament_stage = 'FINISHED', updated_at = NOW()
			WHERE id = ?
		`, champion.PlayerID, runnerUp.PlayerID, third.PlayerID, now, sessionID).Error
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
func (ec *EliminationController) RecordRound(sessionID uint64, roundNum, eliminationTarget, totalPlayers, tablesCount int) error {
	return ec.db.Exec(`
		INSERT INTO ddz_tournament_rounds 
		(session_id, round_num, elimination_target, total_players, tables_count, stage, started_at, created_at)
		VALUES (?, ?, ?, ?, ?, 'PREPARE', NOW(), NOW())
		ON DUPLICATE KEY UPDATE 
			elimination_target = VALUES(elimination_target),
			total_players = VALUES(total_players),
			tables_count = VALUES(tables_count),
			updated_at = NOW()
	`, sessionID, roundNum, eliminationTarget, totalPlayers, tablesCount).Error
}

// UpdateRoundStage 更新轮次阶段
func (ec *EliminationController) UpdateRoundStage(sessionID uint64, roundNum int, stage TournamentStage) error {
	return ec.db.Exec(`
		UPDATE ddz_tournament_rounds 
		SET stage = ?, updated_at = NOW()
		WHERE session_id = ? AND round_num = ?
	`, stage, sessionID, roundNum).Error
}

// CompleteRound 完成轮次
func (ec *EliminationController) CompleteRound(sessionID uint64, roundNum int) error {
	now := time.Now()
	return ec.db.Exec(`
		UPDATE ddz_tournament_rounds 
		SET stage = 'COMPLETED', ended_at = ?, updated_at = NOW()
		WHERE session_id = ? AND round_num = ?
	`, now, sessionID, roundNum).Error
}
