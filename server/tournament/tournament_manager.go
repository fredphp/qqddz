// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
        "context"
        "encoding/json"
        "errors"
        "log"
        "sync"
        "time"

        "github.com/redis/go-redis/v9"
        "gorm.io/gorm"
)

// =============================================
// TournamentManager - 锦标赛管理器
// =============================================

// TournamentManager 锦标赛管理器
type TournamentManager struct {
        db                *gorm.DB
        redis             *redis.Client
        stateMachine      *StateMachine
        matchScheduler    *MatchScheduler
        rankCalculator    *RankCalculator
        eliminationCtrl   *EliminationController

        // 会话上下文管理
        sessionContexts map[uint64]context.CancelFunc
        mu              sync.RWMutex

        // 广播回调
        broadcastFunc func(sessionID uint64, msgType TournamentMessageType, data interface{})
}

// NewTournamentManager 创建锦标赛管理器
func NewTournamentManager(db *gorm.DB, redisClient *redis.Client) *TournamentManager {
        stateMachine := NewStateMachine(db)
        matchScheduler := NewMatchScheduler(db)
        rankCalculator := NewRankCalculator(db)
        eliminationCtrl := NewEliminationController(db, stateMachine, rankCalculator)

        tm := &TournamentManager{
                db:              db,
                redis:           redisClient,
                stateMachine:    stateMachine,
                matchScheduler:  matchScheduler,
                rankCalculator:  rankCalculator,
                eliminationCtrl: eliminationCtrl,
                sessionContexts: make(map[uint64]context.CancelFunc),
        }

        return tm
}

// SetBroadcastFunc 设置广播回调函数
func (tm *TournamentManager) SetBroadcastFunc(fn func(sessionID uint64, msgType TournamentMessageType, data interface{})) {
        tm.broadcastFunc = fn
}

// broadcast 广播消息
func (tm *TournamentManager) broadcast(sessionID uint64, msgType TournamentMessageType, data interface{}) {
        if tm.broadcastFunc != nil {
                tm.broadcastFunc(sessionID, msgType, data)
        }
}

// =============================================
// 赛事生命周期
// =============================================

// InitializeTournament 初始化锦标赛
// 🔧【修复】不再固定设置 current_elimination_idx = 0
// 起始索引将在 StartTournament 时根据实际报名人数动态计算
func (tm *TournamentManager) InitializeTournament(sessionID uint64, config *TournamentConfig) error {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 解析淘汰规则
        var rules EliminationRules
        if config.EliminationRules != nil {
                rules = config.EliminationRules
        } else {
                rules = EliminationRules{60, 30, 18, 9, 3}
        }

        // 更新会话配置
        // 注意：current_elimination_idx 初始化为 -1，表示未确定
        // 实际值将在 StartTournament 时根据报名人数计算
        rulesJSON, _ := json.Marshal(rules)
        err := tm.db.Exec(`
                UPDATE ddz_arena_sessions 
                SET elimination_rules = ?,
                        tournament_stage = 'SIGNUP',
                        current_elimination_idx = -1,
                        current_round = 0,
                        updated_at = NOW()
                WHERE id = ?
        `, string(rulesJSON), sessionID).Error

        if err != nil {
                return err
        }

        log.Printf("[TournamentManager] 初始化锦标赛: sessionID=%d, rules=%v", sessionID, rules)
        return nil
}

// StartTournament 开始锦标赛
// 🔧【修复】动态计算起始淘汰轮次
func (tm *TournamentManager) StartTournament(sessionID uint64) error {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 1. 获取会话状态
        state, err := tm.stateMachine.GetCurrentState(sessionID)
        if err != nil {
                return err
        }

        if state.Stage != StageSignup && state.Stage != StagePrepare {
                return errors.New("当前阶段不允许开始比赛")
        }

        // 2. 获取参赛玩家
        players, err := tm.stateMachine.GetActivePlayers(sessionID)
        if err != nil {
                return err
        }

        if len(players) < 1 {
                return ErrInsufficientPlayers
        }

        // 🔧【日志】报名人数（补位前）
        log.Printf("[TOURNAMENT] registered players: %d", len(players))

        // 3. 补位机器人（确保人数是3的倍数）
        // 注意：机器人补位在 arena_status.go 中执行，这里只记录日志
        if len(players)%3 != 0 {
                log.Printf("[TournamentManager] 需要补位机器人: current=%d, need=%d",
                        len(players), (3-len(players)%3))
        }

        // 4. 解析淘汰规则并确定起始轮
        var rules EliminationRules
        if state.EliminationRules != nil {
                rules = state.EliminationRules
        } else {
                rules = EliminationRules{60, 30, 18, 9, 3}
        }

        // 🔧【修复】动态计算起始淘汰索引
        startIdx := rules.FindStartIndex(len(players))
        activeRules := rules.GetActiveRules(len(players))
        totalRounds := rules.GetTotalRounds(len(players))

        // 🔧【日志】起始轮次和总轮次
        log.Printf("[TOURNAMENT] start round target: %d", func() int {
                if startIdx < len(rules) {
                        return rules[startIdx]
                }
                return 3 // 决赛
        }())
        log.Printf("[TOURNAMENT] total rounds: %d", totalRounds)

        log.Printf("[TournamentManager] 淘汰规则: players=%d, startIdx=%d, activeRules=%v, totalRounds=%d",
                len(players), startIdx, activeRules, totalRounds)

        // 5. 更新淘汰规则索引
        if err := tm.stateMachine.UpdateCurrentEliminationIdx(sessionID, startIdx); err != nil {
                return err
        }

        // 6. 判断是否直接进入决赛
        // 🔧【修复】当 startIdx >= len(rules) 或人数 <= 3 时直接决赛
        if startIdx >= len(rules) || len(players) <= 3 {
                log.Printf("[TOURNAMENT] 直接进入决赛: players=%d", len(players))
                return tm.startFinalRound(sessionID, players)
        }

        // 7. 进入准备阶段
        if err := tm.stateMachine.Transition(sessionID, StagePrepare); err != nil {
                return err
        }

        // 8. 分桌
        roundNum := 1
        tables, err := tm.matchScheduler.ScheduleTables(sessionID, players, roundNum)
        if err != nil {
                return err
        }

        // 9. 记录轮次信息
        // 🔧【修复】确保 activeRules 不为空
        eliminationTarget := activeRules[0]

        // 🔧【日志】第一轮淘汰人数
        eliminateCount := len(players) - eliminationTarget
        log.Printf("[TOURNAMENT] round1 eliminate %d", eliminateCount)

        if err := tm.eliminationCtrl.RecordRound(sessionID, roundNum, eliminationTarget, len(players), len(tables)); err != nil {
                log.Printf("[TournamentManager] 记录轮次信息失败: %v", err)
        }

        // 10. 进入游戏阶段
        if err := tm.stateMachine.Transition(sessionID, StagePlaying); err != nil {
                return err
        }

        // 11. 广播比赛开始
        tm.broadcast(sessionID, MsgTypeTournamentStart, map[string]interface{}{
                "round_num":          roundNum,
                "tables":             len(tables),
                "total_players":      len(players),
                "total_rounds":       totalRounds,
                "elimination_target": eliminationTarget,
        })

        // 12. 启动会话上下文（用于倒计时等）
        ctx, cancel := context.WithCancel(context.Background())
        tm.sessionContexts[sessionID] = cancel
        go tm.monitorSession(ctx, sessionID)

        log.Printf("[TournamentManager] 锦标赛开始: sessionID=%d, players=%d, tables=%d, target=%d, totalRounds=%d",
                sessionID, len(players), len(tables), eliminationTarget, totalRounds)

        return nil
}

// startFinalRound 开始决赛轮
func (tm *TournamentManager) startFinalRound(sessionID uint64, players PlayerList) error {
        // 进入决赛阶段
        if err := tm.stateMachine.Transition(sessionID, StageFinal); err != nil {
                return err
        }

        // 如果只有3人，直接分桌
        if len(players) == 3 {
                table, err := tm.matchScheduler.ScheduleFinal(sessionID, players, 1)
                if err != nil {
                        return err
                }

                // 进入游戏阶段
                if err := tm.stateMachine.Transition(sessionID, StagePlaying); err != nil {
                        return err
                }

                // 广播决赛开始
                tm.broadcast(sessionID, MsgTypeTournamentFinal, map[string]interface{}{
                        "table_id":    table.TableID,
                        "table_code":  table.TableCode,
                        "players":     players,
                })

                log.Printf("[TournamentManager] 决赛开始: sessionID=%d", sessionID)
        }

        return nil
}

// OnTableComplete 桌完成回调
func (tm *TournamentManager) OnTableComplete(sessionID, tableID uint64, results map[uint64]int64) error {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 1. 获取当前状态
        state, err := tm.stateMachine.GetCurrentState(sessionID)
        if err != nil {
                return err
        }

        if state.Stage != StagePlaying {
                return errors.New("当前不是游戏阶段")
        }

        // 2. 更新玩家比赛金币
        if err := tm.rankCalculator.RecordRoundResults(sessionID, state.CurrentRound, results); err != nil {
                return err
        }

        // 3. 更新桌状态
        if err := tm.db.Exec(`
                UPDATE ddz_arena_tables 
                SET status = 2, updated_at = NOW()
                WHERE id = ?
        `, tableID).Error; err != nil {
                return err
        }

        // 4. 增加已完成桌数
        tablesCompleted, err := tm.stateMachine.IncrementTablesCompleted(sessionID)
        if err != nil {
                return err
        }

        // 5. 获取总桌数
        totalTables, err := tm.stateMachine.GetTotalTablesCount(sessionID, state.CurrentRound)
        if err != nil {
                return err
        }

        log.Printf("[TournamentManager] 桌完成: sessionID=%d, tableID=%d, completed=%d/%d",
                sessionID, tableID, tablesCompleted, totalTables)

        // 6. 检查是否所有桌都完成
        if tablesCompleted >= totalTables {
                return tm.onRoundComplete(sessionID, state)
        }

        return nil
}

// onRoundComplete 轮次完成处理
func (tm *TournamentManager) onRoundComplete(sessionID uint64, state *SessionState) error {
        log.Printf("[TournamentManager] 轮次完成: sessionID=%d, round=%d", sessionID, state.CurrentRound)

        // 1. 获取淘汰目标
        eliminationTarget := tm.getEliminationTarget(state)

        // 2. 进入排行榜阶段
        if err := tm.stateMachine.Transition(sessionID, StageRanking); err != nil {
                return err
        }

        // 3. 计算并广播排行榜
        rankingInfo, err := tm.rankCalculator.CalculateRankings(sessionID, state.CurrentRound, eliminationTarget)
        if err != nil {
                return err
        }

        // 4. 广播排行榜
        tm.broadcast(sessionID, MsgTypeTournamentRanking, &RankingBroadcastMessage{
                CurrentRound:    state.CurrentRound,
                Remaining:       rankingInfo.Remaining,
                EliminationLine: eliminationTarget,
                Countdown:       30,
                Rankings:        rankingInfo.Rankings,
        })

        // 5. 启动倒计时
        go tm.waitForRankingTimeout(sessionID, state.CurrentRound, eliminationTarget)

        return nil
}

// waitForRankingTimeout 等待排行榜阶段超时
// 🔧【修复】添加 panic 恢复机制，防止 goroutine 崩溃
func (tm *TournamentManager) waitForRankingTimeout(sessionID uint64, roundNum, eliminationTarget int) {
        defer func() {
                if r := recover(); r != nil {
                        log.Printf("[TournamentManager] ⚠️ waitForRankingTimeout panic 恢复: sessionID=%d, recover=%v", sessionID, r)
                }
        }()

        // 等待30秒
        time.Sleep(30 * time.Second)

        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 检查是否仍在排行榜阶段
        state, err := tm.stateMachine.GetCurrentState(sessionID)
        if err != nil {
                return
        }

        if state.Stage != StageRanking {
                return
        }

        // 执行淘汰
        if err := tm.executeElimination(sessionID, roundNum, eliminationTarget); err != nil {
                log.Printf("[TournamentManager] 执行淘汰失败: %v", err)
        }
}

// executeElimination 执行淘汰
func (tm *TournamentManager) executeElimination(sessionID uint64, roundNum, eliminationTarget int) error {
        // 1. 进入淘汰阶段
        if err := tm.stateMachine.Transition(sessionID, StageEliminating); err != nil {
                return err
        }

        // 2. 执行淘汰
        result, err := tm.eliminationCtrl.ExecuteElimination(sessionID, roundNum, eliminationTarget)
        if err != nil {
                return err
        }

        // 3. 广播淘汰结果
        tm.broadcast(sessionID, MsgTypeTournamentEliminate, tm.eliminationCtrl.GetEliminationBroadcast(result))

        // 4. 更新轮次状态
        if err := tm.eliminationCtrl.CompleteRound(sessionID, roundNum); err != nil {
                log.Printf("[TournamentManager] 完成轮次失败: %v", err)
        }

        // 5. 重置玩家本轮比赛金币
        if err := tm.rankCalculator.ResetRoundMatchCoin(sessionID); err != nil {
                log.Printf("[TournamentManager] 重置本轮金币失败: %v", err)
        }

        // 6. 判断是否进入决赛或下一轮
        if result.IsFinalRound {
                return tm.prepareFinalRound(sessionID)
        }

        // 7. 准备下一轮
        return tm.prepareNextRound(sessionID, result.RemainingCount)
}

// prepareNextRound 准备下一轮
func (tm *TournamentManager) prepareNextRound(sessionID uint64, remainingPlayers int) error {
        // 获取淘汰规则
        state, err := tm.stateMachine.GetCurrentState(sessionID)
        if err != nil {
                return err
        }

        // 更新淘汰规则索引
        newIdx := state.CurrentElimIdx + 1
        if newIdx >= len(state.EliminationRules) {
                // 已完成所有淘汰轮，进入决赛
                return tm.prepareFinalRound(sessionID)
        }

        if err := tm.stateMachine.UpdateCurrentEliminationIdx(sessionID, newIdx); err != nil {
                return err
        }

        // 进入准备阶段
        if err := tm.stateMachine.Transition(sessionID, StagePrepare); err != nil {
                return err
        }

        // 获取活跃玩家
        players, err := tm.stateMachine.GetActivePlayers(sessionID)
        if err != nil {
                return err
        }

        // 检查是否直接进入决赛
        if len(players) <= 3 {
                return tm.prepareFinalRound(sessionID)
        }

        // 分桌
        roundNum := state.CurrentRound + 1
        tables, err := tm.matchScheduler.ScheduleTables(sessionID, players, roundNum)
        if err != nil {
                return err
        }

        // 记录轮次
        eliminationTarget := state.EliminationRules[newIdx]
        if err := tm.eliminationCtrl.RecordRound(sessionID, roundNum, eliminationTarget, len(players), len(tables)); err != nil {
                log.Printf("[TournamentManager] 记录轮次失败: %v", err)
        }

        // 进入游戏阶段
        if err := tm.stateMachine.Transition(sessionID, StagePlaying); err != nil {
                return err
        }

        // 广播新一轮开始
        tm.broadcast(sessionID, MsgTypeTournamentStart, map[string]interface{}{
                "round_num":          roundNum,
                "tables":             len(tables),
                "total_players":      len(players),
                "elimination_target": eliminationTarget,
        })

        log.Printf("[TournamentManager] 新一轮开始: sessionID=%d, round=%d, players=%d, target=%d",
                sessionID, roundNum, len(players), eliminationTarget)

        return nil
}

// prepareFinalRound 准备决赛
func (tm *TournamentManager) prepareFinalRound(sessionID uint64) error {
        // 获取活跃玩家
        players, err := tm.stateMachine.GetActivePlayers(sessionID)
        if err != nil {
                return err
        }

        // 如果只剩1人，直接颁奖
        if len(players) == 1 {
                return tm.endTournament(sessionID, players)
        }

        // 进入决赛阶段
        if err := tm.stateMachine.Transition(sessionID, StageFinal); err != nil {
                return err
        }

        // 分桌
        roundNum := 1 // 决赛轮次
        table, err := tm.matchScheduler.ScheduleFinal(sessionID, players, roundNum)
        if err != nil {
                return err
        }

        // 进入游戏阶段
        if err := tm.stateMachine.Transition(sessionID, StagePlaying); err != nil {
                return err
        }

        // 广播决赛开始
        tm.broadcast(sessionID, MsgTypeTournamentFinal, map[string]interface{}{
                "table_id":    table.TableID,
                "table_code":  table.TableCode,
                "players":     players,
        })

        log.Printf("[TournamentManager] 决赛开始: sessionID=%d, players=%d", sessionID, len(players))

        return nil
}

// OnFinalComplete 决赛完成
func (tm *TournamentManager) OnFinalComplete(sessionID uint64, results map[uint64]int64) error {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 更新玩家比赛金币
        if err := tm.rankCalculator.RecordRoundResults(sessionID, 1, results); err != nil {
                return err
        }

        // 获取玩家列表
        players, err := tm.stateMachine.GetActivePlayers(sessionID)
        if err != nil {
                return err
        }

        return tm.endTournament(sessionID, players)
}

// endTournament 结束锦标赛
// 🔧【修复】移除内部锁获取，由调用方负责加锁，避免死锁
func (tm *TournamentManager) endTournament(sessionID uint64, players PlayerList) error {
        // 确定排名
        result, err := tm.eliminationCtrl.DetermineFinalRankings(sessionID, players)
        if err != nil {
                return err
        }

        // 广播比赛结束
        tm.broadcast(sessionID, MsgTypeTournamentEnd, tm.eliminationCtrl.GetFinalBroadcast(result))

        // 取消会话上下文（调用方已持有锁，不需要再次获取）
        if cancel, exists := tm.sessionContexts[sessionID]; exists {
                cancel()
                delete(tm.sessionContexts, sessionID)
        }

        log.Printf("[TournamentManager] 锦标赛结束: sessionID=%d, champion=%d, runner_up=%d, third=%d",
                sessionID, result.Champion.PlayerID, result.RunnerUp.PlayerID, result.Third.PlayerID)

        return nil
}

// getEliminationTarget 获取当前淘汰目标
// 🔧【修复】处理 CurrentElimIdx == -1 的情况
func (tm *TournamentManager) getEliminationTarget(state *SessionState) int {
        if state.EliminationRules == nil || len(state.EliminationRules) == 0 {
                return 3
        }

        idx := state.CurrentElimIdx
        // 🔧【修复】处理索引未初始化或越界的情况
        if idx < 0 || idx >= len(state.EliminationRules) {
                return 3
        }

        return state.EliminationRules[idx]
}

// monitorSession 监控会话状态
// 🔧【修复】添加 panic 恢复机制，防止 goroutine 崩溃导致整个服务宕机
func (tm *TournamentManager) monitorSession(ctx context.Context, sessionID uint64) {
        defer func() {
                if r := recover(); r != nil {
                        log.Printf("[TournamentManager] ⚠️ monitorSession panic 恢复: sessionID=%d, recover=%v", sessionID, r)
                }
        }()

        ticker := time.NewTicker(10 * time.Second)
        defer ticker.Stop()

        for {
                select {
                case <-ctx.Done():
                        return
                case <-ticker.C:
                        // 定期检查会话状态
                        state, err := tm.stateMachine.GetCurrentState(sessionID)
                        if err != nil {
                                continue
                        }

                        // 如果比赛已结束，停止监控
                        if state.Stage == StageFinished {
                                return
                        }

                        // 如果在排行榜阶段，检查超时
                        if state.Stage == StageRanking {
                                timeout, err := tm.stateMachine.CheckRankingTimeout(sessionID)
                                if err == nil && timeout {
                                        // 执行淘汰
                                        eliminationTarget := tm.getEliminationTarget(state)
                                        tm.executeElimination(sessionID, state.CurrentRound, eliminationTarget)
                                }
                        }
                }
        }
}

// GetTournamentState 获取锦标赛状态
func (tm *TournamentManager) GetTournamentState(sessionID uint64) (*SessionState, error) {
        return tm.stateMachine.GetCurrentState(sessionID)
}

// GetRankingInfo 获取排行榜信息
func (tm *TournamentManager) GetRankingInfo(sessionID uint64) (*RankingInfo, error) {
        state, err := tm.stateMachine.GetCurrentState(sessionID)
        if err != nil {
                return nil, err
        }

        eliminationTarget := tm.getEliminationTarget(state)
        return tm.rankCalculator.CalculateRankings(sessionID, state.CurrentRound, eliminationTarget)
}

// PlayerDisconnect 玩家掉线处理
func (tm *TournamentManager) PlayerDisconnect(sessionID, playerID uint64) error {
        // 更新玩家在线状态
        return tm.db.Exec(`
                UPDATE ddz_arena_participations 
                SET is_online = 0, updated_at = NOW()
                WHERE session_id = ? AND player_id = ?
        `, sessionID, playerID).Error
}

// PlayerReconnect 玩家重连处理
func (tm *TournamentManager) PlayerReconnect(sessionID, playerID uint64) error {
        // 更新玩家在线状态
        return tm.db.Exec(`
                UPDATE ddz_arena_participations 
                SET is_online = 1, updated_at = NOW()
                WHERE session_id = ? AND player_id = ?
        `, sessionID, playerID).Error
}

// CancelTournament 取消锦标赛
func (tm *TournamentManager) CancelTournament(sessionID uint64) error {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        // 取消会话上下文
        if cancel, exists := tm.sessionContexts[sessionID]; exists {
                cancel()
                delete(tm.sessionContexts, sessionID)
        }

        // 更新会话状态
        return tm.db.Exec(`
                UPDATE ddz_arena_sessions 
                SET status = 5, tournament_stage = 'FINISHED', updated_at = NOW()
                WHERE id = ?
        `, sessionID).Error
}
