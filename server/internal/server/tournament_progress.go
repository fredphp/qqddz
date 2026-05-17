// Package server 提供竞技场赛事进度管理
package server

import (
        "log"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
)

// =============================================
// 竞技场赛事进度管理器
// 负责管理多桌等待进度和最终榜单推送
// =============================================

// TournamentProgressManager 赛事进度管理器
type TournamentProgressManager struct {
        server *Server

        // 赛事进度缓存: periodNo -> *TournamentProgress
        progressMap map[string]*TournamentProgress

        // 跨桌同步屏障管理器
        barrierManager *TournamentBarrierManager

        mu sync.RWMutex
}

// TournamentProgress 赛事进度
type TournamentProgress struct {
        PeriodNo       string           // 期号
        Round          int              // 当前轮次
        TotalRounds    int              // 总轮次
        TotalTables    int              // 总桌数
        FinishedTables int              // 已完成桌数
        Tables         []*TableProgress // 各桌进度

        // 玩家所在桌状态: playerID -> tableFinished
        PlayerTableStatus map[string]bool

        // 状态: WAITING, CALCULATING, MATCHING
        Status string

        UpdatedAt time.Time
}

// TableProgress 桌进度
type TableProgress struct {
        TableID    uint64
        Status     string // "playing", "finished"
        FinishedAt time.Time
}

// 状态常量
const (
        TournamentStatusWaiting    = "WAITING"
        TournamentStatusCalculating = "CALCULATING"
        TournamentStatusMatching   = "MATCHING"
)

// NewTournamentProgressManager 创建赛事进度管理器
func NewTournamentProgressManager(server *Server) *TournamentProgressManager {
        return &TournamentProgressManager{
                server:           server,
                progressMap:      make(map[string]*TournamentProgress),
                barrierManager:   NewTournamentBarrierManager(),
        }
}

// =============================================
// 进度更新方法
// =============================================

// InitTournament 初始化赛事进度
func (tm *TournamentProgressManager) InitTournament(periodNo string, totalRounds, totalTables int, playerIDs []string) {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        if _, exists := tm.progressMap[periodNo]; exists {
                return // 已存在，不重复初始化
        }

        tables := make([]*TableProgress, totalTables)
        for i := 0; i < totalTables; i++ {
                tables[i] = &TableProgress{
                        Status: "playing",
                }
        }

        tm.progressMap[periodNo] = &TournamentProgress{
                PeriodNo:          periodNo,
                Round:             1,
                TotalRounds:       totalRounds,
                TotalTables:       totalTables,
                FinishedTables:    0,
                Tables:            tables,
                PlayerTableStatus: make(map[string]bool),
                Status:            TournamentStatusWaiting,
                UpdatedAt:         time.Now(),
        }

        // 创建跨桌同步屏障
        tm.barrierManager.CreateBarrier(periodNo, 1, totalTables, playerIDs)

        log.Printf("[TOURNAMENT] 初始化赛事进度: periodNo=%s, rounds=%d, tables=%d, players=%d",
                periodNo, totalRounds, totalTables, len(playerIDs))
}

// UpdateTableFinished 更新桌完成状态
// 返回值: (是否全部完成, 已完成桌数, 总桌数)
func (tm *TournamentProgressManager) UpdateTableFinished(periodNo string, round int, tableID uint64, playerIDs []string) (bool, int, int) {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        progress, exists := tm.progressMap[periodNo]
        if !exists {
                log.Printf("[TOURNAMENT] ⚠️ 赛事不存在: periodNo=%s", periodNo)
                return false, 0, 0
        }

        // 更新桌状态
        for _, table := range progress.Tables {
                if table.TableID == tableID || table.TableID == 0 {
                        table.TableID = tableID
                        table.Status = "finished"
                        table.FinishedAt = time.Now()
                        break
                }
        }

        // 更新完成桌数
        progress.FinishedTables++
        progress.UpdatedAt = time.Now()

        // 标记玩家所在桌已完成
        for _, playerID := range playerIDs {
                progress.PlayerTableStatus[playerID] = true
        }

        log.Printf("[TOURNAMENT] 桌完成: periodNo=%s, tableID=%d, finished=%d/%d",
                periodNo, tableID, progress.FinishedTables, progress.TotalTables)

        // 注册到屏障
        allFinished, finishedCount, totalTables, _ := tm.barrierManager.RegisterTableFinished(periodNo, round, tableID, playerIDs)

        // 广播进度更新
        tm.broadcastWaitProgress(progress)

        // 检查是否全部完成
        if progress.FinishedTables >= progress.TotalTables {
                log.Printf("[TOURNAMENT] 本轮全部完成: periodNo=%s, round=%d", periodNo, progress.Round)
                // 设置状态为计算中
                progress.Status = TournamentStatusCalculating
        }

        return allFinished, finishedCount, totalTables
}

// GetProgress 获取赛事进度
func (tm *TournamentProgressManager) GetProgress(periodNo string) *TournamentProgress {
        tm.mu.RLock()
        defer tm.mu.RUnlock()

        return tm.progressMap[periodNo]
}

// GetActivePlayerCount 获取剩余玩家数
// 返回 PlayerTableStatus 中的玩家数量
func (tm *TournamentProgressManager) GetActivePlayerCount(periodNo string) int {
        tm.mu.RLock()
        defer tm.mu.RUnlock()

        if progress, exists := tm.progressMap[periodNo]; exists {
                return len(progress.PlayerTableStatus)
        }
        return 0
}

// AdvanceRound 推进到下一轮
// 返回值: 是否成功推进
func (tm *TournamentProgressManager) AdvanceRound(periodNo string, newTotalTables int, playerIDs []string) bool {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        progress, exists := tm.progressMap[periodNo]
        if !exists {
                return false
        }

        // 获取屏障
        barrier := tm.barrierManager.GetBarrier(periodNo, progress.Round)
        if barrier != nil {
                // 尝试推进屏障
                if !barrier.AdvanceOnce() {
                        log.Printf("[TOURNAMENT] ⚠️ 屏障推进失败，可能已推进: periodNo=%s, round=%d", periodNo, progress.Round)
                        return false
                }
        }

        // 更新轮次
        progress.Round++
        progress.TotalTables = newTotalTables
        progress.FinishedTables = 0
        progress.Status = TournamentStatusMatching

        // 重置桌状态
        tables := make([]*TableProgress, newTotalTables)
        for i := 0; i < newTotalTables; i++ {
                tables[i] = &TableProgress{
                        Status: "playing",
                }
        }
        progress.Tables = tables
        progress.PlayerTableStatus = make(map[string]bool)
        progress.UpdatedAt = time.Now()

        log.Printf("[TOURNAMENT] 进入下一轮: periodNo=%s, round=%d/%d, tables=%d",
                periodNo, progress.Round, progress.TotalRounds, newTotalTables)

        // 创建新一轮的屏障
        tm.barrierManager.CreateBarrier(periodNo, progress.Round, newTotalTables, playerIDs)

        // 广播下一轮通知
        tm.broadcastRoundAdvance(progress)

        return true
}

// SetStatus 设置状态
func (tm *TournamentProgressManager) SetStatus(periodNo string, status string) {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        if progress, exists := tm.progressMap[periodNo]; exists {
                progress.Status = status
                progress.UpdatedAt = time.Now()
                log.Printf("[TOURNAMENT] 状态更新: periodNo=%s, status=%s", periodNo, status)
        }
}

// ForceAdvance 强制推进（用于超时）
func (tm *TournamentProgressManager) ForceAdvance(periodNo string, round int, reason string) bool {
        barrier := tm.barrierManager.GetBarrier(periodNo, round)
        if barrier == nil {
                return false
        }
        return barrier.ForceAdvance(reason)
}

// =============================================
// 广播方法
// =============================================

// broadcastWaitProgress 广播等待进度
func (tm *TournamentProgressManager) broadcastWaitProgress(progress *TournamentProgress) {
        payload := &protocol.TournamentWaitProgressPayload{
                PeriodNo:        progress.PeriodNo,
                Round:           progress.Round,
                TotalRounds:     progress.TotalRounds,
                FinishedTables:  progress.FinishedTables,
                TotalTables:     progress.TotalTables,
                PlayerTableDone: false, // 由具体玩家逻辑设置
                Status:          progress.Status,
                Message:         tm.getStatusMessage(progress),
        }

        // 广播给所有该期号的玩家
        if tm.server != nil {
                tm.server.BroadcastToPeriodPlayers(progress.PeriodNo, codec.MustNewMessage(protocol.MsgTournamentWaitProgress, payload))
        }

        log.Printf("[TOURNAMENT] 广播等待进度: periodNo=%s, round=%d, finished=%d/%d, status=%s",
                progress.PeriodNo, progress.Round, progress.FinishedTables, progress.TotalTables, progress.Status)
}

// BroadcastWaitProgressToPlayer 向特定玩家广播等待进度
func (tm *TournamentProgressManager) BroadcastWaitProgressToPlayer(periodNo string, playerID string) {
        tm.mu.RLock()
        defer tm.mu.RUnlock()

        progress, exists := tm.progressMap[periodNo]
        if !exists {
                return
        }

        playerTableDone := progress.PlayerTableStatus[playerID]

        payload := &protocol.TournamentWaitProgressPayload{
                PeriodNo:        progress.PeriodNo,
                Round:           progress.Round,
                TotalRounds:     progress.TotalRounds,
                FinishedTables:  progress.FinishedTables,
                TotalTables:     progress.TotalTables,
                PlayerTableDone: playerTableDone,
                Status:          progress.Status,
                Message:         tm.getStatusMessage(progress),
        }

        // 发送给特定玩家
        if tm.server != nil {
                tm.server.SendToPlayer(playerID, codec.MustNewMessage(protocol.MsgTournamentWaitProgress, payload))
        }
}

// getStatusMessage 获取状态消息
func (tm *TournamentProgressManager) getStatusMessage(progress *TournamentProgress) string {
        switch progress.Status {
        case TournamentStatusCalculating:
                return "正在统计全场排名..."
        case TournamentStatusMatching:
                return "晋级成功！正在匹配下一轮..."
        default:
                if progress.FinishedTables >= progress.TotalTables {
                        return "本轮比赛结束，请稍候..."
                }
                return "正在等待其他玩家完成..."
        }
}

// broadcastRoundAdvance 广播下一轮通知
func (tm *TournamentProgressManager) broadcastRoundAdvance(progress *TournamentProgress) {
        payload := &protocol.TournamentRoundAdvancePayload{
                PeriodNo:    progress.PeriodNo,
                NewRound:    progress.Round,
                TotalRounds: progress.TotalRounds,
                Message:     "进入下一轮，请准备",
        }

        // 广播给所有该期号的玩家
        if tm.server != nil {
                tm.server.BroadcastToPeriodPlayers(progress.PeriodNo, codec.MustNewMessage(protocol.MsgTournamentRoundAdvance, payload))
        }

        log.Printf("[TOURNAMENT] 广播下一轮通知: periodNo=%s, newRound=%d", progress.PeriodNo, progress.Round)
}

// BroadcastFinalRank 广播最终榜单
func (tm *TournamentProgressManager) BroadcastFinalRank(periodNo string, totalPlayers int, top3, top20 []protocol.TournamentRankEntry, myPlayerID string, myRank int, myMatchCoin int64) {
        // 构建payload
        payload := &protocol.TournamentFinalRankPayload{
                PeriodNo:     periodNo,
                TotalPlayers: totalPlayers,
                Top3:         top3,
                Top20:        top20,
                MyRank:       myRank,
                MyMatchCoin:  myMatchCoin,
                Message:      "比赛结束",
        }

        // 如果有特定玩家，发送个性化榜单
        if myPlayerID != "" && tm.server != nil {
                tm.server.SendToPlayer(myPlayerID, codec.MustNewMessage(protocol.MsgTournamentFinalRank, payload))
        }

        log.Printf("[TOURNAMENT] 广播最终榜单: periodNo=%s, totalPlayers=%d", periodNo, totalPlayers)
}

// BroadcastFinalRankToAll 向所有玩家广播最终榜单
func (tm *TournamentProgressManager) BroadcastFinalRankToAll(periodNo string, totalPlayers int, rankings []protocol.TournamentRankEntry) {
        // 构建TOP3和TOP20
        top3 := make([]protocol.TournamentRankEntry, 0, 3)
        top20 := make([]protocol.TournamentRankEntry, 0, 20)

        for i, r := range rankings {
                if i < 3 {
                        top3 = append(top3, r)
                }
                if i < 20 {
                        top20 = append(top20, r)
                }
        }

        // 广播给每个玩家（个性化榜单）
        if tm.server != nil {
                for _, r := range rankings {
                        payload := &protocol.TournamentFinalRankPayload{
                                PeriodNo:     periodNo,
                                TotalPlayers: totalPlayers,
                                Top3:         top3,
                                Top20:        top20,
                                MyRank:       r.Rank,
                                MyMatchCoin:  r.MatchCoin,
                                Message:      "比赛结束",
                        }
                        tm.server.SendToPlayer(r.PlayerID, codec.MustNewMessage(protocol.MsgTournamentFinalRank, payload))
                }
        }

        log.Printf("[TOURNAMENT] 广播最终榜单给所有玩家: periodNo=%s, totalPlayers=%d", periodNo, totalPlayers)
}

// =============================================
// 清理方法
// =============================================

// ClearTournament 清理赛事进度
func (tm *TournamentProgressManager) ClearTournament(periodNo string) {
        tm.mu.Lock()
        defer tm.mu.Unlock()

        delete(tm.progressMap, periodNo)
        // 清理所有屏障
        for round := 1; round <= 10; round++ {
                tm.barrierManager.RemoveBarrier(periodNo, round)
        }
        log.Printf("[TOURNAMENT] 清理赛事进度: periodNo=%s", periodNo)
}

// =============================================
// 屏障访问方法
// =============================================

// GetBarrierManager 获取屏障管理器
func (tm *TournamentProgressManager) GetBarrierManager() *TournamentBarrierManager {
        return tm.barrierManager
}
