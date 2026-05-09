// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
	"context"
	"log"
	"sync"
	"time"

	"gorm.io/gorm"
)

// =============================================
// 状态机 - 管理赛事阶段转换
// =============================================

// StateMachine 状态机
type StateMachine struct {
	db *gorm.DB
	mu sync.RWMutex
}

// NewStateMachine 创建状态机
func NewStateMachine(db *gorm.DB) *StateMachine {
	return &StateMachine{
		db: db,
	}
}

// SessionState 会话状态（简化版，用于状态机内部）
type SessionState struct {
	SessionID         uint64
	Stage             TournamentStage
	CurrentRound      int
	CurrentElimIdx    int
	TotalPlayers      int
	ActivePlayers     int
	TablesCompleted   int
	EliminationRules  EliminationRules
	RankWaitUntil     *time.Time
	UpdatedAt         time.Time
}

// GetCurrentState 获取当前状态
func (sm *StateMachine) GetCurrentState(sessionID uint64) (*SessionState, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var state SessionState
	err := sm.db.Table("ddz_arena_sessions").
		Select("id as session_id, tournament_stage as stage, current_round, current_elimination_idx, "+
			"total_players, active_players, tables_completed, elimination_rules, rank_wait_until, updated_at").
		Where("id = ?", sessionID).
		First(&state).Error

	if err != nil {
		return nil, err
	}

	return &state, nil
}

// Transition 阶段转换
func (sm *StateMachine) Transition(sessionID uint64, toStage TournamentStage) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	// 获取当前状态
	var currentStage TournamentStage
	err := sm.db.Table("ddz_arena_sessions").
		Select("tournament_stage").
		Where("id = ?", sessionID).
		Scan(&currentStage).Error

	if err != nil {
		return err
	}

	// 验证转换是否有效
	if !currentStage.IsTransitionValid(toStage) {
		log.Printf("[StateMachine] 无效的阶段转换: %s -> %s, sessionID: %d", currentStage, toStage, sessionID)
		return ErrInvalidTransition
	}

	// 执行转换
	now := time.Now()
	updates := map[string]interface{}{
		"tournament_stage": toStage,
		"updated_at":       now,
	}

	// 特殊阶段处理
	switch toStage {
	case StageRanking:
		// 进入排行榜阶段，设置等待截止时间
		var rankWaitSeconds int
		sm.db.Table("ddz_arena_sessions").
			Select("COALESCE((SELECT rank_wait_seconds FROM ddz_room_config WHERE id = room_config_id), 30)").
			Where("id = ?", sessionID).
			Scan(&rankWaitSeconds)
		
		waitUntil := now.Add(time.Duration(rankWaitSeconds) * time.Second)
		updates["rank_wait_until"] = waitUntil
		
	case StagePlaying:
		// 进入游戏阶段，重置已完成桌数
		updates["tables_completed"] = 0
		
	case StagePrepare:
		// 进入准备阶段，轮次+1
		updates["current_round"] = gorm.Expr("current_round + 1")
	}

	err = sm.db.Table("ddz_arena_sessions").
		Where("id = ?", sessionID).
		Updates(updates).Error

	if err != nil {
		return err
	}

	log.Printf("[StateMachine] 阶段转换成功: %s -> %s, sessionID: %d", currentStage, toStage, sessionID)
	return nil
}

// ForceTransition 强制阶段转换（跳过验证）
func (sm *StateMachine) ForceTransition(sessionID uint64, toStage TournamentStage) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	now := time.Now()
	return sm.db.Table("ddz_arena_sessions").
		Where("id = ?", sessionID).
		Updates(map[string]interface{}{
			"tournament_stage": toStage,
			"updated_at":       now,
		}).Error
}

// CheckRankingTimeout 检查排行榜阶段是否超时
func (sm *StateMachine) CheckRankingTimeout(sessionID uint64) (bool, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var rankWaitUntil *time.Time
	err := sm.db.Table("ddz_arena_sessions").
		Select("rank_wait_until").
		Where("id = ? AND tournament_stage = ?", sessionID, StageRanking).
		Scan(&rankWaitUntil).Error

	if err != nil {
		return false, err
	}

	if rankWaitUntil == nil {
		return false, nil
	}

	return time.Now().After(*rankWaitUntil), nil
}

// IncrementTablesCompleted 增加已完成桌数
func (sm *StateMachine) IncrementTablesCompleted(sessionID uint64) (int, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	var tablesCompleted int
	err := sm.db.Table("ddz_arena_sessions").
		Where("id = ?", sessionID).
		Update("tables_completed", gorm.Expr("tables_completed + 1")).
		Select("tables_completed").
		Scan(&tablesCompleted).Error

	return tablesCompleted, err
}

// GetTablesInfo 获取本轮所有桌信息
func (sm *StateMachine) GetTablesInfo(sessionID uint64, roundNum int) ([]TableInfo, int, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var tables []struct {
		ID        uint64
		TableCode string
		RoundNum  int
		Status    uint8
		GameID    *string
		Player1ID *uint64
		Player2ID *uint64
		Player3ID *uint64
	}

	err := sm.db.Table("ddz_arena_tables").
		Where("session_id = ? AND round_num = ?", sessionID, roundNum).
		Find(&tables).Error

	if err != nil {
		return nil, 0, err
	}

	result := make([]TableInfo, len(tables))
	for i, t := range tables {
		result[i] = TableInfo{
			TableID:   t.ID,
			TableCode: t.TableCode,
			RoundNum:  t.RoundNum,
			Status:    TableStatus(t.Status),
			GameID:    ptrToStr(t.GameID),
		}
		if t.Player1ID != nil {
			result[i].Players[0] = &PlayerInfo{PlayerID: *t.Player1ID}
		}
		if t.Player2ID != nil {
			result[i].Players[1] = &PlayerInfo{PlayerID: *t.Player2ID}
		}
		if t.Player3ID != nil {
			result[i].Players[2] = &PlayerInfo{PlayerID: *t.Player3ID}
		}
	}

	return result, len(tables), nil
}

// GetTotalTablesCount 获取本轮总桌数
func (sm *StateMachine) GetTotalTablesCount(sessionID uint64, roundNum int) (int, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var count int64
	err := sm.db.Table("ddz_arena_tables").
		Where("session_id = ? AND round_num = ?", sessionID, roundNum).
		Count(&count).Error

	return int(count), err
}

// UpdateCurrentEliminationIdx 更新当前淘汰规则索引
func (sm *StateMachine) UpdateCurrentEliminationIdx(sessionID uint64, idx int) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	return sm.db.Table("ddz_arena_sessions").
		Where("id = ?", sessionID).
		Updates(map[string]interface{}{
			"current_elimination_idx": idx,
			"updated_at":              time.Now(),
		}).Error
}

// GetActivePlayers 获取活跃玩家列表
func (sm *StateMachine) GetActivePlayers(sessionID uint64) (PlayerList, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var players []struct {
		PlayerID        uint64
		Nickname        string
		MatchCoin       int64
		RoundMatchCoin  int64
		IsRobot         uint8
		IsTournamentBot uint8
		IsOnline        uint8
		IsEliminated    uint8
		Rank            *int
		CurrentTableID  *uint64
	}

	err := sm.db.Table("ddz_arena_participations").
		Select("p.player_id, pl.nickname, p.match_coin, p.round_match_coin, p.is_robot, "+
			"p.is_tournament_bot, p.is_online, p.is_eliminated, p.rank, p.current_table_id").
		Joins("LEFT JOIN ddz_players pl ON p.player_id = pl.id").
		Alias("p").
		Where("p.session_id = ?", sessionID).
		Find(&players).Error

	if err != nil {
		return nil, err
	}

	result := make(PlayerList, len(players))
	for i, p := range players {
		result[i] = &PlayerInfo{
			PlayerID:        p.PlayerID,
			Nickname:        p.Nickname,
			MatchCoin:       p.MatchCoin,
			RoundMatchCoin:  p.RoundMatchCoin,
			IsRobot:         p.IsRobot == 1,
			IsTournamentBot: p.IsTournamentBot == 1,
			IsOnline:        p.IsOnline == 1,
			IsEliminated:    p.IsEliminated == 1,
			CurrentTableID:  ptrToUint64(p.CurrentTableID),
		}
		if p.Rank != nil {
			result[i].Rank = *p.Rank
		}
	}

	return result, nil
}

// StartRankingCountdown 启动排行榜倒计时
func (sm *StateMachine) StartRankingCountdown(ctx context.Context, sessionID uint64, rankWaitSeconds int, onTimeout func()) {
	go func() {
		// 等待排行榜阶段超时
		timer := time.NewTimer(time.Duration(rankWaitSeconds) * time.Second)
		defer timer.Stop()

		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			// 检查是否仍在排行榜阶段
			state, err := sm.GetCurrentState(sessionID)
			if err != nil {
				log.Printf("[StateMachine] 获取状态失败: %v", err)
				return
			}

			if state.Stage == StageRanking {
				log.Printf("[StateMachine] 排行榜阶段超时，sessionID: %d", sessionID)
				onTimeout()
			}
		}
	}()
}

// 辅助函数
func ptrToStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func ptrToUint64(u *uint64) uint64 {
	if u == nil {
		return 0
	}
	return *u
}
