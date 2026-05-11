// Package arena 提供竞技场系统的核心管理逻辑
package arena

import (
        "context"
        "crypto/rand"
        "encoding/hex"
        "errors"
        "fmt"
        "log"
        "math"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/robot"
        "github.com/palemoky/fight-the-landlord/internal/game/room"
        "github.com/redis/go-redis/v9"
        "gorm.io/gorm"
)

// =============================================
// 错误定义
// =============================================

var (
        ErrSessionNotFound       = errors.New("比赛会话不存在")
        ErrSessionNotInProgress  = errors.New("比赛未在进行中")
        ErrSessionAlreadyStarted = errors.New("比赛已开始")
        ErrSessionFull           = errors.New("比赛人数已满")
        ErrPlayerAlreadySignedUp = errors.New("玩家已报名")
        ErrPlayerNotSignedUp     = errors.New("玩家未报名")
        ErrPlayerInOtherSession  = errors.New("玩家正在其他比赛中")
        ErrInsufficientArenaCoin = errors.New("竞技币不足")
        ErrMinPlayersNotReached  = errors.New("未达到最小开赛人数")
        ErrRoundNotComplete      = errors.New("本轮比赛未完成")
)

// =============================================
// ArenaManager 竞技场管理器
// =============================================

// ArenaManager 竞技场管理器
type ArenaManager struct {
        db           *gorm.DB
        redis        *redis.Client
        roomManager  *room.RoomManager

        // 机器人管理
        robotManager *robot.RobotManager
        patcher      *robot.ArenaPatcher
        noWinCtrl    *robot.NoWinController

        // 内存中的比赛会话缓存
        sessions map[uint64]*database.ArenaSession

        // 等待池: roomConfigID -> playerIDs
        // 用于快速查找某个房间配置下的等待中玩家
        waitingPools map[uint64]map[uint64]bool

        // 玩家当前参赛信息缓存: playerID -> sessionID
        playerSessions map[uint64]uint64

        // 比赛桌缓存: sessionID -> tableID -> *ArenaTable
        sessionTables map[uint64]map[uint64]*database.ArenaTable

        mu sync.RWMutex
}

// NewArenaManager 创建竞技场管理器
func NewArenaManager(db *gorm.DB, redisClient *redis.Client, roomManager *room.RoomManager) *ArenaManager {
        // 创建机器人管理器
        robotManager := robot.NewRobotManager(db)

        // 创建竞技场补位器
        patcher := robot.NewArenaPatcher(db, robotManager, nil)

        // 创建不能夺冠控制器
        noWinCtrl := robot.NewNoWinController(db, robotManager, nil)

        am := &ArenaManager{
                db:             db,
                redis:          redisClient,
                roomManager:    roomManager,
                robotManager:   robotManager,
                patcher:        patcher,
                noWinCtrl:      noWinCtrl,
                sessions:       make(map[uint64]*database.ArenaSession),
                waitingPools:   make(map[uint64]map[uint64]bool),
                playerSessions: make(map[uint64]uint64),
                sessionTables:  make(map[uint64]map[uint64]*database.ArenaTable),
        }

        // 启动后台任务
        go am.sessionRecoveryLoop()
        go am.sessionTimeoutCheckLoop()

        return am
}

// SetRobotManager 设置机器人管理器（可选，用于依赖注入）
func (am *ArenaManager) SetRobotManager(robotManager *robot.RobotManager) {
        am.mu.Lock()
        defer am.mu.Unlock()
        am.robotManager = robotManager
}

// SetPatcher 设置补位器（可选，用于依赖注入）
func (am *ArenaManager) SetPatcher(patcher *robot.ArenaPatcher) {
        am.mu.Lock()
        defer am.mu.Unlock()
        am.patcher = patcher
}

// SetNoWinController 设置不能夺冠控制器（可选，用于依赖注入）
func (am *ArenaManager) SetNoWinController(noWinCtrl *robot.NoWinController) {
        am.mu.Lock()
        defer am.mu.Unlock()
        am.noWinCtrl = noWinCtrl
}

// =============================================
// 报名相关方法
// =============================================

// SignupResult 报名结果
type SignupResult struct {
        Success     bool   `json:"success"`
        Message     string `json:"message"`
        SessionID   uint64 `json:"session_id,omitempty"`
        SignupFee   int64  `json:"signup_fee,omitempty"`
        TotalSigned int    `json:"total_signed,omitempty"`
        MaxPlayers  int    `json:"max_players,omitempty"`
}

// Signup 玩家报名参加比赛
func (am *ArenaManager) Signup(sessionID, playerID uint64) (*SignupResult, error) {
        am.mu.Lock()
        defer am.mu.Unlock()

        log.Printf("[Arena] 玩家 %d 报名比赛 %d", playerID, sessionID)

        // 1. 检查玩家是否已在其他比赛中
        if otherSessionID, exists := am.playerSessions[playerID]; exists {
                log.Printf("[Arena] 玩家 %d 已在比赛 %d 中", playerID, otherSessionID)
                return &SignupResult{
                        Success: false,
                        Message: fmt.Sprintf("玩家正在其他比赛中(会话ID: %d)", otherSessionID),
                }, ErrPlayerInOtherSession
        }

        // 2. 获取比赛会话
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return &SignupResult{
                        Success: false,
                        Message: "比赛会话不存在",
                }, err
        }

        // 3. 检查比赛状态
        if !session.CanSignup() {
                return &SignupResult{
                        Success: false,
                        Message: "当前比赛状态不允许报名",
                }, ErrSessionNotInProgress
        }

        // 4. 检查人数是否已满
        participations, err := am.getParticipationsBySessionLocked(sessionID)
        if err != nil {
                return nil, err
        }

        if len(participations) >= session.RoomConfig.MaxPlayers {
                return &SignupResult{
                        Success: false,
                        Message: "比赛人数已满",
                }, ErrSessionFull
        }

        // 5. 检查玩家是否已报名
        for _, p := range participations {
                if p.PlayerID == playerID {
                        return &SignupResult{
                                Success: false,
                                Message: "玩家已报名",
                        }, ErrPlayerAlreadySignedUp
                }
        }

        // 6. 获取玩家信息并检查竞技币
        player, err := am.getPlayerLocked(playerID)
        if err != nil {
                return &SignupResult{
                        Success: false,
                        Message: "玩家不存在",
                }, err
        }

        if player.ArenaCoin < session.SignupFee {
                return &SignupResult{
                        Success: false,
                        Message: fmt.Sprintf("竞技币不足，需要 %d，当前 %d", session.SignupFee, player.ArenaCoin),
                }, ErrInsufficientArenaCoin
        }

        // 7. 使用事务完成报名
        err = database.Transaction(func(tx *gorm.DB) error {
                // 扣除报名费
                if err := am.deductArenaCoinTx(tx, playerID, session.SignupFee, "报名费", sessionID); err != nil {
                        return err
                }

                // 创建参赛记录
                // 🔧【重构】不再写入 signup_time 和 signup_fee，这些字段保留在 period_players 表
                participation := &database.ArenaParticipation{
                        SessionID:  sessionID,
                        PlayerID:   playerID,
                        MatchCoin:  0,
                        IsOnline:   1,
                }

                if err := tx.Create(participation).Error; err != nil {
                        return err
                }

                // 更新会话参赛人数
                if err := tx.Model(&database.ArenaSession{}).
                        Where("id = ?", sessionID).
                        Updates(map[string]interface{}{
                                "total_players":  gorm.Expr("total_players + 1"),
                                "active_players": gorm.Expr("active_players + 1"),
                        }).Error; err != nil {
                        return err
                }

                return nil
        })

        if err != nil {
                log.Printf("[Arena] 报名事务失败: %v", err)
                return &SignupResult{
                        Success: false,
                        Message: "报名失败，请稍后重试",
                }, err
        }

        // 8. 更新内存缓存
        am.playerSessions[playerID] = sessionID
        am.addToWaitingPool(session.RoomConfigID, playerID)

        // 更新会话缓存中的参赛人数
        session.TotalPlayers++
        session.ActivePlayers++

        log.Printf("[Arena] 玩家 %d 报名成功，当前报名人数: %d/%d", playerID, session.TotalPlayers, session.RoomConfig.MaxPlayers)

        // 9. 广播报名成功
        am.broadcastSignupSuccess(sessionID, playerID, player.Nickname)

        // 10. 如果达到最小人数，检查是否可以开赛
        if session.TotalPlayers >= session.RoomConfig.MinPlayers && session.Status == database.ArenaSessionStatusWaitingSignup {
                am.updateSessionStatusLocked(sessionID, database.ArenaSessionStatusSigningUp)
        }

        return &SignupResult{
                Success:     true,
                Message:     "报名成功",
                SessionID:   sessionID,
                SignupFee:   session.SignupFee,
                TotalSigned: session.TotalPlayers,
                MaxPlayers:  session.RoomConfig.MaxPlayers,
        }, nil
}

// CancelSignup 取消报名
func (am *ArenaManager) CancelSignup(sessionID, playerID uint64) error {
        am.mu.Lock()
        defer am.mu.Unlock()

        log.Printf("[Arena] 玩家 %d 取消报名比赛 %d", playerID, sessionID)

        // 1. 检查玩家是否已报名
        participation, err := am.getParticipationLocked(sessionID, playerID)
        if err != nil {
                return ErrPlayerNotSignedUp
        }

        // 2. 获取比赛会话
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return err
        }

        // 3. 检查比赛是否已开始
        if session.Status >= database.ArenaSessionStatusInProgress {
                return ErrSessionAlreadyStarted
        }

        // 🔧【重构】从 period_players 表获取报名费
        var signupFee int64 = 0
        if session.PeriodNo != "" {
                periodPlayer, err := database.GetArenaPeriodPlayer(session.PeriodNo, playerID)
                if err == nil && periodPlayer != nil {
                        signupFee = periodPlayer.SignupFee
                }
        }

        // 4. 使用事务完成取消报名
        err = database.Transaction(func(tx *gorm.DB) error {
                // 退还报名费
                if signupFee > 0 {
                        if err := am.addArenaCoinTx(tx, playerID, signupFee, "取消报名退还", sessionID); err != nil {
                                return err
                        }
                }

                // 删除参赛记录
                if err := tx.Where("session_id = ? AND player_id = ?", sessionID, playerID).
                        Delete(&database.ArenaParticipation{}).Error; err != nil {
                        return err
                }

                // 更新会话参赛人数
                if err := tx.Model(&database.ArenaSession{}).
                        Where("id = ?", sessionID).
                        Updates(map[string]interface{}{
                                "total_players":  gorm.Expr("GREATEST(total_players - 1, 0)"),
                                "active_players": gorm.Expr("GREATEST(active_players - 1, 0)"),
                        }).Error; err != nil {
                        return err
                }

                return nil
        })

        if err != nil {
                log.Printf("[Arena] 取消报名事务失败: %v", err)
                return err
        }

        // 5. 更新内存缓存
        delete(am.playerSessions, playerID)
        am.removeFromWaitingPool(session.RoomConfigID, playerID)

        // 更新会话缓存
        session.TotalPlayers--
        session.ActivePlayers--

        log.Printf("[Arena] 玩家 %d 取消报名成功", playerID)

        // 6. 广播取消报名
        am.broadcastCancelSignup(sessionID, playerID)

        return nil
}

// GetSignupList 获取报名列表
func (am *ArenaManager) GetSignupList(roomConfigID uint64) ([]*database.ArenaParticipation, error) {
        am.mu.RLock()
        defer am.mu.RUnlock()

        // 获取当前等待报名或报名中的会话
        var sessions []database.ArenaSession
        err := am.db.Where("room_config_id = ? AND status IN ?",
                roomConfigID,
                []uint8{database.ArenaSessionStatusWaitingSignup, database.ArenaSessionStatusSigningUp}).
                Find(&sessions).Error
        if err != nil {
                return nil, err
        }

        if len(sessions) == 0 {
                return []*database.ArenaParticipation{}, nil
        }

        // 获取所有会话的参赛记录
        sessionIDs := make([]uint64, len(sessions))
        for i, s := range sessions {
                sessionIDs[i] = s.ID
        }

        var participations []*database.ArenaParticipation
        err = am.db.Where("session_id IN ?", sessionIDs).
                Preload("Player").
                Find(&participations).Error
        if err != nil {
                return nil, err
        }

        return participations, nil
}

// =============================================
// 比赛流程方法
// =============================================

// StartSession 开始比赛
func (am *ArenaManager) StartSession(sessionID uint64) error {
        am.mu.Lock()
        defer am.mu.Unlock()

        log.Printf("[Arena] 开始比赛 %d", sessionID)

        // 1. 获取比赛会话
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return err
        }

        // 2. 检查比赛状态
        if session.Status >= database.ArenaSessionStatusInProgress {
                return ErrSessionAlreadyStarted
        }

        // 3. 检查最小人数
        participations, err := am.getParticipationsBySessionLocked(sessionID)
        if err != nil {
                return err
        }

        if len(participations) < session.RoomConfig.MinPlayers {
                return ErrMinPlayersNotReached
        }

        // 4. 机器人自动补位（确保人数是3的倍数）
        if am.patcher != nil {
                filledRobots, err := am.patcher.CheckAndFillArena(sessionID, len(participations), session.RoomConfig.MinPlayers)
                if err != nil {
                        log.Printf("[Arena] 机器人补位失败: %v", err)
                        // 补位失败不阻止比赛开始，但需要记录日志
                } else if len(filledRobots) > 0 {
                        log.Printf("[Arena] 已补位 %d 个机器人", len(filledRobots))
                        // 重新获取参赛者列表
                        participations, err = am.getParticipationsBySessionLocked(sessionID)
                        if err != nil {
                                return err
                        }
                        // 更新会话中的参赛人数
                        session.TotalPlayers = len(participations)
                        session.ActivePlayers = len(participations)
                }
        }

        // 5. 更新会话状态为进行中
        now := time.Now()
        err = am.db.Model(&database.ArenaSession{}).
                Where("id = ?", sessionID).
                Updates(map[string]interface{}{
                        "status":             database.ArenaSessionStatusInProgress,
                        "actual_start_time":  now,
                        "current_round":      1,
                        "total_players":      len(participations),
                        "active_players":     len(participations),
                }).Error
        if err != nil {
                return err
        }

        // 更新缓存
        session.Status = database.ArenaSessionStatusInProgress
        session.ActualStartTime = &now
        session.CurrentRound = 1
        session.TotalPlayers = len(participations)
        session.ActivePlayers = len(participations)

        // 6. 分桌
        tables, err := am.assignTablesLocked(session, participations)
        if err != nil {
                log.Printf("[Arena] 分桌失败: %v", err)
                return err
        }

        log.Printf("[Arena] 比赛 %d 开始，共 %d 名玩家，分成 %d 桌", sessionID, len(participations), len(tables))

        // 7. 缓存比赛桌
        am.sessionTables[sessionID] = make(map[uint64]*database.ArenaTable)
        for _, table := range tables {
                am.sessionTables[sessionID][table.ID] = table
        }

        // 8. 保存比赛状态到Redis
        am.saveSessionToRedis(sessionID)

        // 9. 广播比赛开始
        am.broadcastSessionStart(sessionID, participations, tables)

        return nil
}

// TableResult 桌结算结果
type TableResult struct {
        TableID        uint64
        LandlordID     uint64
        Farmer1ID      uint64
        Farmer2ID      uint64
        LandlordWin    bool
        CoinChanges    map[uint64]int64 // 玩家ID -> 金币变化
        Multiplier     int
        GameID         string
}

// OnRoundEnd 轮次结束处理
func (am *ArenaManager) OnRoundEnd(sessionID, tableID uint64, result *TableResult) error {
        am.mu.Lock()
        defer am.mu.Unlock()

        log.Printf("[Arena] 桌 %d 轮次结束，会话 %d", tableID, sessionID)

        // 1. 获取比赛会话
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return err
        }

        if !session.IsInProgress() {
                return ErrSessionNotInProgress
        }

        // 2. 更新比赛桌状态
        err = am.db.Model(&database.ArenaTable{}).
                Where("id = ?", tableID).
                Updates(map[string]interface{}{
                        "status":  database.ArenaTableStatusEnded,
                        "game_id": result.GameID,
                }).Error
        if err != nil {
                return err
        }

        // 3. 记录轮次数据
        record := &database.ArenaRoundRecord{
                SessionID:          sessionID,
                TableID:            tableID,
                GameID:             result.GameID,
                RoundNum:           session.CurrentRound,
                LandlordID:         result.LandlordID,
                Farmer1ID:          result.Farmer1ID,
                Farmer2ID:          result.Farmer2ID,
                LandlordWin:        boolToUint8(result.LandlordWin),
                LandlordCoinChange: result.CoinChanges[result.LandlordID],
                Farmer1CoinChange:  result.CoinChanges[result.Farmer1ID],
                Farmer2CoinChange:  result.CoinChanges[result.Farmer2ID],
                Multiplier:         result.Multiplier,
                StartedAt:          time.Now().Add(-5 * time.Minute), // 假设游戏时长5分钟
                EndedAt:            ptrTime(time.Now()),
        }

        if err := am.db.Create(record).Error; err != nil {
                log.Printf("[Arena] 保存轮次记录失败: %v", err)
        }

        // 4. 更新参赛者的比赛金币
        for playerID, coinChange := range result.CoinChanges {
                err = am.db.Model(&database.ArenaParticipation{}).
                        Where("session_id = ? AND player_id = ?", sessionID, playerID).
                        Update("match_coin", gorm.Expr("match_coin + ?", coinChange)).Error
                if err != nil {
                        log.Printf("[Arena] 更新玩家 %d 比赛金币失败: %v", playerID, err)
                }
        }

        // 5. 检查本轮是否全部结束
        allTablesEnded, err := am.checkRoundCompleteLocked(sessionID, session.CurrentRound)
        if err != nil {
                return err
        }

        if !allTablesEnded {
                log.Printf("[Arena] 本轮未全部结束，等待其他桌")
                return nil
        }

        log.Printf("[Arena] 第 %d 轮全部结束", session.CurrentRound)

        // 6. 执行淘汰逻辑
        eliminatedPlayers, err := am.executeEliminationLocked(session)
        if err != nil {
                return err
        }

        // 7. 检查是否决出冠军
        if len(eliminatedPlayers) > 0 {
                // 广播淘汰通知
                for _, ep := range eliminatedPlayers {
                        am.notifyPlayerEliminated(ep.PlayerID, ep.Reason)
                }
        }

        // 8. 检查比赛是否结束
        activePlayers, err := am.getActivePlayersLocked(sessionID)
        if err != nil {
                return err
        }

        if len(activePlayers) <= 1 {
                // 决出冠军
                return am.finalizeSessionLocked(session, activePlayers)
        }

        // 9. 进入下一轮
        if session.CurrentRound < session.TotalRounds {
                // 还有轮次，继续下一轮
                return am.startNextRoundLocked(session, activePlayers)
        }

        // 所有轮次结束，按比赛金币排名
        return am.finalizeSessionLocked(session, activePlayers)
}

// EliminatedPlayer 被淘汰的玩家
type EliminatedPlayer struct {
        PlayerID uint64
        Reason   string
        Rank     int
}

// EliminatePlayers 淘汰玩家
func (am *ArenaManager) EliminatePlayers(sessionID uint64, playerIDs []uint64) error {
        am.mu.Lock()
        defer am.mu.Unlock()

        log.Printf("[Arena] 淘汰玩家: %v, 会话: %d", playerIDs, sessionID)

        // 1. 获取比赛会话
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return err
        }

        // 2. 获取当前活跃玩家数
        activePlayers, err := am.getActivePlayersLocked(sessionID)
        if err != nil {
                return err
        }

        // 计算淘汰后的排名
        eliminatedRank := len(activePlayers)

        // 3. 执行淘汰
        for _, playerID := range playerIDs {
                err = am.db.Model(&database.ArenaParticipation{}).
                        Where("session_id = ? AND player_id = ?", sessionID, playerID).
                        Updates(map[string]interface{}{
                                "is_eliminated":     1,
                                "eliminated_round":  session.CurrentRound,
                                "eliminated_reason": database.EliminatedReasonLose,
                                "rank":              eliminatedRank,
                        }).Error
                if err != nil {
                        log.Printf("[Arena] 更新玩家 %d 淘汰状态失败: %v", playerID, err)
                        continue
                }

                // 从缓存移除
                delete(am.playerSessions, playerID)
        }

        // 4. 更新活跃玩家数
        err = am.db.Model(&database.ArenaSession{}).
                Where("id = ?", sessionID).
                Update("active_players", gorm.Expr("active_players - ?", len(playerIDs))).Error
        if err != nil {
                return err
        }

        session.ActivePlayers -= len(playerIDs)

        // 5. 广播淘汰通知
        for _, playerID := range playerIDs {
                am.notifyPlayerEliminated(playerID, database.EliminatedReasonLose)
        }

        return nil
}

// DetermineWinner 决出冠军
func (am *ArenaManager) DetermineWinner(sessionID uint64) (*database.ArenaParticipation, error) {
        am.mu.Lock()
        defer am.mu.Unlock()

        // 获取活跃玩家
        activePlayers, err := am.getActivePlayersLocked(sessionID)
        if err != nil {
                return nil, err
        }

        if len(activePlayers) == 0 {
                return nil, errors.New("没有活跃玩家")
        }

        // 按比赛金币排序
        am.sortPlayersByMatchCoin(activePlayers)

        // 检查机器人是否夺冠，如果是则调整排名（让真人优先）
        if am.noWinCtrl != nil && activePlayers[0].IsRobot == 1 {
                realPlayer, err := am.noWinCtrl.CheckAndPreventRobotChampion(sessionID, activePlayers)
                if err != nil {
                        log.Printf("[Arena] 阻止机器人夺冠失败: %v", err)
                } else if realPlayer != nil {
                        // 重新排序
                        am.sortPlayersByMatchCoin(activePlayers)
                        log.Printf("[Arena] DetermineWinner: 已阻止机器人夺冠，冠军调整为玩家 %d", realPlayer.PlayerID)
                }
        }

        // 第一名为冠军
        champion := activePlayers[0]

        // 更新冠军状态
        err = am.db.Model(&database.ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, champion.PlayerID).
                Updates(map[string]interface{}{
                        "is_champion": 1,
                        "rank":        1,
                }).Error
        if err != nil {
                return nil, err
        }

        // 更新会话冠军ID
        err = am.db.Model(&database.ArenaSession{}).
                Where("id = ?", sessionID).
                Update("champion_id", champion.PlayerID).Error
        if err != nil {
                return nil, err
        }

        // 如果有第二名和第三名，更新他们的排名
        if len(activePlayers) > 1 {
                am.db.Model(&database.ArenaParticipation{}).
                        Where("session_id = ? AND player_id = ?", sessionID, activePlayers[1].PlayerID).
                        Updates(map[string]interface{}{"rank": 2})
                am.db.Model(&database.ArenaSession{}).
                        Where("id = ?", sessionID).
                        Update("runner_up_id", activePlayers[1].PlayerID)
        }

        if len(activePlayers) > 2 {
                am.db.Model(&database.ArenaParticipation{}).
                        Where("session_id = ? AND player_id = ?", sessionID, activePlayers[2].PlayerID).
                        Updates(map[string]interface{}{"rank": 3})
                am.db.Model(&database.ArenaSession{}).
                        Where("id = ?", sessionID).
                        Update("third_id", activePlayers[2].PlayerID)
        }

        return champion, nil
}

// =============================================
// 状态同步方法
// =============================================

// SessionStatus 会话状态
type SessionStatus struct {
        SessionID     uint64               `json:"session_id"`
        SessionCode   string               `json:"session_code"`
        Status        uint8                `json:"status"`
        CurrentRound  int                  `json:"current_round"`
        TotalRounds   int                  `json:"total_rounds"`
        TotalPlayers  int                  `json:"total_players"`
        ActivePlayers int                  `json:"active_players"`
        Tables        []*TableStatus       `json:"tables"`
        TopPlayers    []*PlayerRankInfo    `json:"top_players"`
        ScheduledEnd  time.Time            `json:"scheduled_end,omitempty"`
}

// TableStatus 桌状态
type TableStatus struct {
        TableID    uint64          `json:"table_id"`
        TableCode  string          `json:"table_code"`
        Status     uint8           `json:"status"`
        RoundNum   int             `json:"round_num"`
        Players    []*PlayerInfo   `json:"players"`
}

// PlayerInfo 玩家信息
type PlayerInfo struct {
        PlayerID   uint64 `json:"player_id"`
        Nickname   string `json:"nickname"`
        MatchCoin  int64  `json:"match_coin"`
        IsLandlord bool   `json:"is_landlord,omitempty"`
}

// PlayerRankInfo 玩家排名信息
type PlayerRankInfo struct {
        Rank      int    `json:"rank"`
        PlayerID  uint64 `json:"player_id"`
        Nickname  string `json:"nickname"`
        MatchCoin int64  `json:"match_coin"`
}

// BroadcastSessionStatus 广播比赛状态
func (am *ArenaManager) BroadcastSessionStatus(sessionID uint64) (*SessionStatus, error) {
        am.mu.RLock()
        defer am.mu.RUnlock()

        // 获取会话信息
        session, err := am.getSessionLocked(sessionID)
        if err != nil {
                return nil, err
        }

        // 获取比赛桌
        tables, err := am.getTablesBySessionLocked(sessionID)
        if err != nil {
                return nil, err
        }

        // 获取参赛者排名
        participations, err := am.getParticipationsBySessionLocked(sessionID)
        if err != nil {
                return nil, err
        }

        // 排序
        am.sortPlayersByMatchCoin(participations)

        // 构建返回数据
        status := &SessionStatus{
                SessionID:     session.ID,
                SessionCode:   session.SessionCode,
                Status:        session.Status,
                CurrentRound:  session.CurrentRound,
                TotalRounds:   session.TotalRounds,
                TotalPlayers:  session.TotalPlayers,
                ActivePlayers: session.ActivePlayers,
                Tables:        make([]*TableStatus, 0),
                TopPlayers:    make([]*PlayerRankInfo, 0),
        }

        // 添加桌信息
        for _, table := range tables {
                tableStatus := &TableStatus{
                        TableID:   table.ID,
                        TableCode: table.TableCode,
                        Status:    table.Status,
                        RoundNum:  table.RoundNum,
                        Players:   make([]*PlayerInfo, 0),
                }

                // 添加玩家信息
                for _, playerID := range table.GetPlayers() {
                        for _, p := range participations {
                                if p.PlayerID == playerID {
                                        tableStatus.Players = append(tableStatus.Players, &PlayerInfo{
                                                PlayerID:  p.PlayerID,
                                                Nickname:  p.Player.Nickname,
                                                MatchCoin: p.MatchCoin,
                                        })
                                        break
                                }
                        }
                }

                status.Tables = append(status.Tables, tableStatus)
        }

        // 添加排名信息（前10名）
        for i, p := range participations {
                if i >= 10 {
                        break
                }
                status.TopPlayers = append(status.TopPlayers, &PlayerRankInfo{
                        Rank:      i + 1,
                        PlayerID:  p.PlayerID,
                        Nickname:  p.Player.Nickname,
                        MatchCoin: p.MatchCoin,
                })
        }

        // TODO: 通过WebSocket广播状态
        log.Printf("[Arena] 广播比赛 %d 状态: %d/%d 轮, %d 活跃玩家",
                sessionID, session.CurrentRound, session.TotalRounds, session.ActivePlayers)

        return status, nil
}

// NotifyPlayerEliminated 通知玩家被淘汰
func (am *ArenaManager) NotifyPlayerEliminated(playerID uint64, reason string) {
        am.notifyPlayerEliminated(playerID, reason)
}

func (am *ArenaManager) notifyPlayerEliminated(playerID uint64, reason string) {
        log.Printf("[Arena] 玩家 %d 被淘汰，原因: %s", playerID, reason)
        // TODO: 通过WebSocket通知玩家
}

// NotifyChampion 通知冠军
func (am *ArenaManager) NotifyChampion(playerID uint64, reward *database.RewardGoods) {
        am.notifyChampion(playerID, reward)
}

func (am *ArenaManager) notifyChampion(playerID uint64, reward *database.RewardGoods) {
        log.Printf("[Arena] 恭喜玩家 %d 获得冠军，奖励: %s", playerID, reward.Name)
        // TODO: 通过WebSocket通知玩家
}

// =============================================
// 辅助方法
// =============================================

// GetActiveSession 获取当前进行的比赛
func (am *ArenaManager) GetActiveSession(roomConfigID uint64) (*database.ArenaSession, error) {
        am.mu.RLock()
        defer am.mu.RUnlock()

        var session database.ArenaSession
        err := am.db.Where("room_config_id = ? AND status = ?",
                roomConfigID, database.ArenaSessionStatusInProgress).
                Preload("RoomConfig").
                First(&session).Error
        if err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, nil
                }
                return nil, err
        }

        return &session, nil
}

// GetPlayerSession 获取玩家当前参赛信息
func (am *ArenaManager) GetPlayerSession(playerID uint64) (*database.ArenaParticipation, error) {
        am.mu.RLock()
        defer am.mu.RUnlock()

        // 先从缓存查找
        if sessionID, exists := am.playerSessions[playerID]; exists {
                return am.getParticipationLocked(sessionID, playerID)
        }

        // 从数据库查找
        var participation database.ArenaParticipation
        err := am.db.Where("player_id = ? AND is_eliminated = 0", playerID).
                Preload("Session").
                Preload("Session.RoomConfig").
                First(&participation).Error
        if err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, nil
                }
                return nil, err
        }

        // 更新缓存
        am.playerSessions[playerID] = participation.SessionID

        return &participation, nil
}

// IsPlayerInSession 检查玩家是否在比赛中
func (am *ArenaManager) IsPlayerInSession(playerID, sessionID uint64) (bool, error) {
        am.mu.RLock()
        defer am.mu.RUnlock()

        // 从缓存检查
        if cachedSessionID, exists := am.playerSessions[playerID]; exists {
                return cachedSessionID == sessionID, nil
        }

        // 从数据库检查
        var count int64
        err := am.db.Model(&database.ArenaParticipation{}).
                Where("session_id = ? AND player_id = ? AND is_eliminated = 0", sessionID, playerID).
                Count(&count).Error
        if err != nil {
                return false, err
        }

        return count > 0, nil
}

// =============================================
// 内部辅助方法
// =============================================

// getSessionLocked 获取会话（已加锁）
func (am *ArenaManager) getSessionLocked(sessionID uint64) (*database.ArenaSession, error) {
        // 先从缓存获取
        if session, exists := am.sessions[sessionID]; exists {
                return session, nil
        }

        // 从数据库获取
        var session database.ArenaSession
        err := am.db.Preload("RoomConfig").First(&session, sessionID).Error
        if err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, ErrSessionNotFound
                }
                return nil, err
        }

        // 缓存会话
        am.sessions[sessionID] = &session

        return &session, nil
}

// getParticipationLocked 获取参赛记录（已加锁）
func (am *ArenaManager) getParticipationLocked(sessionID, playerID uint64) (*database.ArenaParticipation, error) {
        var participation database.ArenaParticipation
        err := am.db.Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Preload("Player").
                First(&participation).Error
        if err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, ErrPlayerNotSignedUp
                }
                return nil, err
        }
        return &participation, nil
}

// getParticipationsBySessionLocked 获取会话的所有参赛记录（已加锁）
func (am *ArenaManager) getParticipationsBySessionLocked(sessionID uint64) ([]*database.ArenaParticipation, error) {
        var participations []*database.ArenaParticipation
        err := am.db.Where("session_id = ?", sessionID).
                Preload("Player").
                Order("match_coin DESC").
                Find(&participations).Error
        if err != nil {
                return nil, err
        }
        return participations, nil
}

// getActivePlayersLocked 获取活跃玩家列表（已加锁）
func (am *ArenaManager) getActivePlayersLocked(sessionID uint64) ([]*database.ArenaParticipation, error) {
        var participations []*database.ArenaParticipation
        err := am.db.Where("session_id = ? AND is_eliminated = 0", sessionID).
                Preload("Player").
                Order("match_coin DESC").
                Find(&participations).Error
        if err != nil {
                return nil, err
        }
        return participations, nil
}

// getTablesBySessionLocked 获取会话的比赛桌（已加锁）
func (am *ArenaManager) getTablesBySessionLocked(sessionID uint64) ([]*database.ArenaTable, error) {
        var tables []*database.ArenaTable
        err := am.db.Where("session_id = ?", sessionID).
                Order("round_num ASC, id ASC").
                Find(&tables).Error
        if err != nil {
                return nil, err
        }
        return tables, nil
}

// getPlayerLocked 获取玩家信息（已加锁）
func (am *ArenaManager) getPlayerLocked(playerID uint64) (*database.Player, error) {
        var player database.Player
        err := am.db.First(&player, playerID).Error
        if err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, errors.New("玩家不存在")
                }
                return nil, err
        }
        return &player, nil
}

// assignTablesLocked 分桌（已加锁）
func (am *ArenaManager) assignTablesLocked(session *database.ArenaSession, participations []*database.ArenaParticipation) ([]*database.ArenaTable, error) {
        // 随机打乱玩家顺序
        am.shuffleParticipations(participations)

        // 计算需要的桌数（每桌3人）
        playerCount := len(participations)
        tableCount := int(math.Ceil(float64(playerCount) / 3.0))

        tables := make([]*database.ArenaTable, 0, tableCount)

        // 创建比赛桌
        for i := 0; i < tableCount; i++ {
                startIdx := i * 3
                endIdx := startIdx + 3
                if endIdx > playerCount {
                        endIdx = playerCount
                }

                tablePlayers := participations[startIdx:endIdx]

                table := &database.ArenaTable{
                        TableCode: am.generateTableCode(),
                        SessionID: session.ID,
                        RoundNum:  1,
                        Status:    database.ArenaTableStatusWaiting,
                }

                // 分配玩家到桌
                if len(tablePlayers) >= 1 {
                        table.Player1ID = &tablePlayers[0].PlayerID
                }
                if len(tablePlayers) >= 2 {
                        table.Player2ID = &tablePlayers[1].PlayerID
                }
                if len(tablePlayers) >= 3 {
                        table.Player3ID = &tablePlayers[2].PlayerID
                }

                if err := am.db.Create(table).Error; err != nil {
                        log.Printf("[Arena] 创建比赛桌失败: %v", err)
                        continue
                }

                tables = append(tables, table)

                // 更新参赛者的最后所在桌
                for _, p := range tablePlayers {
                        am.db.Model(&database.ArenaParticipation{}).
                                Where("id = ?", p.ID).
                                Update("last_table_id", table.TableCode)
                }

                log.Printf("[Arena] 创建比赛桌: TableCode=%s, 玩家=%d", table.TableCode, len(tablePlayers))
        }

        return tables, nil
}

// checkRoundCompleteLocked 检查本轮是否全部结束（已加锁）
func (am *ArenaManager) checkRoundCompleteLocked(sessionID uint64, roundNum int) (bool, error) {
        var totalTables, endedTables int64

        err := am.db.Model(&database.ArenaTable{}).
                Where("session_id = ? AND round_num = ?", sessionID, roundNum).
                Count(&totalTables).Error
        if err != nil {
                return false, err
        }

        err = am.db.Model(&database.ArenaTable{}).
                Where("session_id = ? AND round_num = ? AND status = ?", sessionID, roundNum, database.ArenaTableStatusEnded).
                Count(&endedTables).Error
        if err != nil {
                return false, err
        }

        return totalTables == endedTables, nil
}

// executeEliminationLocked 执行淘汰逻辑（已加锁）
func (am *ArenaManager) executeEliminationLocked(session *database.ArenaSession) ([]*EliminatedPlayer, error) {
        // 获取活跃玩家
        activePlayers, err := am.getActivePlayersLocked(session.ID)
        if err != nil {
                return nil, err
        }

        if len(activePlayers) <= 2 {
                // 剩余2人以下不淘汰
                return nil, nil
        }

        // 按比赛金币排序
        am.sortPlayersByMatchCoin(activePlayers)

        // 淘汰最后一名（金币最低）
        eliminated := activePlayers[len(activePlayers)-1]

        // 更新淘汰状态
        rank := len(activePlayers)
        err = am.db.Model(&database.ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", session.ID, eliminated.PlayerID).
                Updates(map[string]interface{}{
                        "is_eliminated":     1,
                        "eliminated_round":  session.CurrentRound,
                        "eliminated_reason": database.EliminatedReasonLose,
                        "rank":              rank,
                }).Error
        if err != nil {
                return nil, err
        }

        // 更新活跃玩家数
        am.db.Model(&database.ArenaSession{}).
                Where("id = ?", session.ID).
                Update("active_players", gorm.Expr("active_players - 1"))

        session.ActivePlayers--

        // 从缓存移除
        delete(am.playerSessions, eliminated.PlayerID)

        // 如果是机器人，释放机器人资源
        if eliminated.IsRobot == 1 && am.robotManager != nil {
                if err := am.robotManager.ReleaseRobot(eliminated.PlayerID); err != nil {
                        log.Printf("[Arena] 释放机器人 %d 失败: %v", eliminated.PlayerID, err)
                } else {
                        log.Printf("[Arena] 机器人 %d 已被淘汰并释放", eliminated.PlayerID)
                }
        }

        return []*EliminatedPlayer{{
                PlayerID: eliminated.PlayerID,
                Reason:   database.EliminatedReasonLose,
                Rank:     rank,
        }}, nil
}

// startNextRoundLocked 开始下一轮（已加锁）
func (am *ArenaManager) startNextRoundLocked(session *database.ArenaSession, activePlayers []*database.ArenaParticipation) error {
        nextRound := session.CurrentRound + 1

        // 更新会话状态
        err := am.db.Model(&database.ArenaSession{}).
                Where("id = ?", session.ID).
                Update("current_round", nextRound).Error
        if err != nil {
                return err
        }

        session.CurrentRound = nextRound

        // 检查是否进入决赛阶段，为机器人启用让牌策略
        if am.noWinCtrl != nil {
                isFinal := am.noWinCtrl.CheckFinalRound(session, activePlayers)
                if isFinal {
                        am.enableLetWinForFinalRound(session.ID, activePlayers)
                }
        }

        // 重新分桌
        tables, err := am.assignTablesLocked(session, activePlayers)
        if err != nil {
                return err
        }

        // 更新缓存
        am.sessionTables[session.ID] = make(map[uint64]*database.ArenaTable)
        for _, table := range tables {
                am.sessionTables[session.ID][table.ID] = table
        }

        log.Printf("[Arena] 比赛 %d 进入第 %d 轮，剩余 %d 玩家，分成 %d 桌",
                session.ID, nextRound, len(activePlayers), len(tables))

        // 广播新一轮开始
        am.broadcastNewRound(session.ID, nextRound, activePlayers, tables)

        return nil
}

// enableLetWinForFinalRound 为决赛阶段的机器人启用让牌策略
func (am *ArenaManager) enableLetWinForFinalRound(sessionID uint64, activePlayers []*database.ArenaParticipation) {
        if am.robotManager == nil {
                return
        }

        // 找到排名最高的真人玩家
        var topRealPlayerID uint64
        for _, p := range activePlayers {
                if p.IsRobot == 0 {
                        topRealPlayerID = p.PlayerID
                        break
                }
        }

        if topRealPlayerID == 0 {
                log.Printf("[Arena] 决赛阶段没有真人玩家，不启用让牌策略")
                return
        }

        // 为所有机器人启用让牌策略
        for _, p := range activePlayers {
                if p.IsRobot == 1 {
                        am.robotManager.EnableLetWin(p.PlayerID, topRealPlayerID)
                        log.Printf("[Arena] 为机器人 %d 启用让牌策略，目标玩家 %d", p.PlayerID, topRealPlayerID)
                }
        }
}

// finalizeSessionLocked 结束比赛（已加锁）
func (am *ArenaManager) finalizeSessionLocked(session *database.ArenaSession, activePlayers []*database.ArenaParticipation) error {
        // 按比赛金币排序
        am.sortPlayersByMatchCoin(activePlayers)

        // 检查机器人是否夺冠，如果是则调整排名（让真人优先）
        if am.noWinCtrl != nil && len(activePlayers) > 0 && activePlayers[0].IsRobot == 1 {
                realPlayer, err := am.noWinCtrl.CheckAndPreventRobotChampion(session.ID, activePlayers)
                if err != nil {
                        log.Printf("[Arena] 阻止机器人夺冠失败: %v", err)
                } else if realPlayer != nil {
                        // 重新排序
                        am.sortPlayersByMatchCoin(activePlayers)
                        log.Printf("[Arena] 已阻止机器人夺冠，冠军调整为玩家 %d", realPlayer.PlayerID)
                }
        }

        now := time.Now()

        // 更新所有活跃玩家的排名
        for i, p := range activePlayers {
                rank := i + 1
                updates := map[string]interface{}{
                        "rank":         rank,
                        "is_eliminated": 1,
                }

                if rank == 1 {
                        updates["is_champion"] = 1
                }

                am.db.Model(&database.ArenaParticipation{}).
                        Where("session_id = ? AND player_id = ?", session.ID, p.PlayerID).
                        Updates(updates)
        }

        // 更新会话状态
        updates := map[string]interface{}{
                "status":        database.ArenaSessionStatusEnded,
                "end_time":      now,
                "active_players": 0,
        }

        if len(activePlayers) > 0 {
                updates["champion_id"] = activePlayers[0].PlayerID
        }
        if len(activePlayers) > 1 {
                updates["runner_up_id"] = activePlayers[1].PlayerID
        }
        if len(activePlayers) > 2 {
                updates["third_id"] = activePlayers[2].PlayerID
        }

        err := am.db.Model(&database.ArenaSession{}).
                Where("id = ?", session.ID).
                Updates(updates).Error
        if err != nil {
                return err
        }

        // 更新缓存
        session.Status = database.ArenaSessionStatusEnded
        session.EndTime = &now
        if len(activePlayers) > 0 {
                session.ChampionID = &activePlayers[0].PlayerID
        }

        // 清理缓存
        for _, p := range activePlayers {
                delete(am.playerSessions, p.PlayerID)
        }
        delete(am.sessions, session.ID)
        delete(am.sessionTables, session.ID)

        // 释放该会话的所有机器人
        if am.robotManager != nil {
                if err := am.robotManager.ReleaseRobotsBySession(session.ID); err != nil {
                        log.Printf("[Arena] 释放会话机器人失败: %v", err)
                } else {
                        log.Printf("[Arena] 已释放会话 %d 的所有机器人", session.ID)
                }
        }

        // 生成奖励订单
        am.generateRewardOrders(session, activePlayers)

        // 广播比赛结束
        am.broadcastSessionEnd(session.ID, activePlayers)

        log.Printf("[Arena] 比赛 %d 结束，冠军: %d", session.ID, activePlayers[0].PlayerID)

        return nil
}

// generateRewardOrders 生成奖励订单
func (am *ArenaManager) generateRewardOrders(session *database.ArenaSession, rankings []*database.ArenaParticipation) {
        // 获取房间配置
        var roomConfig database.RoomConfig
        if err := am.db.First(&roomConfig, session.RoomConfigID).Error; err != nil {
                log.Printf("[Arena] 获取房间配置失败: %v", err)
                return
        }

        // 为前三名生成奖励订单（奖励ID从 RoomConfig 获取）
        // 注意：目前 RoomConfig 只有 ChampionRewardID，亚季军奖励暂不处理
        rewardMap := map[int]uint64{}
        if roomConfig.ChampionRewardID > 0 {
                rewardMap[1] = roomConfig.ChampionRewardID
        }

        for rank, rewardID := range rewardMap {
                if rank > len(rankings) {
                        continue
                }

                player := rankings[rank-1]

                // 创建奖励订单
                order := &database.RewardOrder{
                        OrderNo:      am.generateOrderNo(),
                        PlayerID:     player.PlayerID,
                        RewardID:     rewardID,
                        RoomConfigID: &session.RoomConfigID,
                        SessionID:    &session.ID,
                        Rank:         &rank,
                        Status:       database.RewardOrderStatusPendingInfo,
                }

                if err := am.db.Create(order).Error; err != nil {
                        log.Printf("[Arena] 创建奖励订单失败: %v", err)
                        continue
                }

                // 获取奖励商品信息
                var reward database.RewardGoods
                if err := am.db.First(&reward, rewardID).Error; err == nil {
                        am.notifyChampion(player.PlayerID, &reward)
                }

                log.Printf("[Arena] 为玩家 %d 生成奖励订单: 排名=%d, 奖励ID=%d", player.PlayerID, rank, rewardID)
        }
}

// updateSessionStatusLocked 更新会话状态（已加锁）
func (am *ArenaManager) updateSessionStatusLocked(sessionID uint64, status uint8) error {
        err := am.db.Model(&database.ArenaSession{}).
                Where("id = ?", sessionID).
                Update("status", status).Error
        if err != nil {
                return err
        }

        if session, exists := am.sessions[sessionID]; exists {
                session.Status = status
        }

        return nil
}

// =============================================
// Redis 相关方法
// =============================================

const (
        redisSessionKeyPrefix = "arena:session:"
        redisPlayerKeyPrefix  = "arena:player:"
)

// saveSessionToRedis 保存会话状态到Redis
func (am *ArenaManager) saveSessionToRedis(sessionID uint64) {
        if am.redis == nil {
                return
        }

        ctx := context.Background()
        key := fmt.Sprintf("%s%d", redisSessionKeyPrefix, sessionID)

        // 保存会话ID到集合
        am.redis.SAdd(ctx, "arena:active_sessions", sessionID)

        // 设置过期时间
        am.redis.Expire(ctx, key, 24*time.Hour)
}

// removeSessionFromRedis 从Redis移除会话
func (am *ArenaManager) removeSessionFromRedis(sessionID uint64) {
        if am.redis == nil {
                return
        }

        ctx := context.Background()
        key := fmt.Sprintf("%s%d", redisSessionKeyPrefix, sessionID)

        am.redis.Del(ctx, key)
        am.redis.SRem(ctx, "arena:active_sessions", sessionID)
}

// =============================================
// 竞技币相关方法
// =============================================

// deductArenaCoinTx 扣除竞技币（事务中）
func (am *ArenaManager) deductArenaCoinTx(tx *gorm.DB, playerID uint64, amount int64, remark string, sessionID uint64) error {
        // 更新玩家竞技币
        result := tx.Model(&database.Player{}).
                Where("id = ? AND arena_coin >= ?", playerID, amount).
                Update("arena_coin", gorm.Expr("arena_coin - ?", amount))

        if result.Error != nil {
                return result.Error
        }

        if result.RowsAffected == 0 {
                return ErrInsufficientArenaCoin
        }

        // 创建流水记录
        logRecord := &database.ArenaCoinLog{
                PlayerID:     playerID,
                ChangeAmount: -amount,
                ChangeType:   database.ArenaCoinChangeOther,
                RelatedID:    fmt.Sprintf("%d", sessionID),
                Remark:       remark,
        }

        // 获取更新后的余额
        var player database.Player
        if err := tx.Select("arena_coin").First(&player, playerID).Error; err == nil {
                logRecord.BalanceAfter = player.ArenaCoin
        }

        return tx.Create(logRecord).Error
}

// addArenaCoinTx 增加竞技币（事务中）
func (am *ArenaManager) addArenaCoinTx(tx *gorm.DB, playerID uint64, amount int64, remark string, sessionID uint64) error {
        // 更新玩家竞技币
        result := tx.Model(&database.Player{}).
                Where("id = ?", playerID).
                Update("arena_coin", gorm.Expr("arena_coin + ?", amount))

        if result.Error != nil {
                return result.Error
        }

        // 创建流水记录
        logRecord := &database.ArenaCoinLog{
                PlayerID:     playerID,
                ChangeAmount: amount,
                ChangeType:   database.ArenaCoinChangeOther,
                RelatedID:    fmt.Sprintf("%d", sessionID),
                Remark:       remark,
        }

        // 获取更新后的余额
        var player database.Player
        if err := tx.Select("arena_coin").First(&player, playerID).Error; err == nil {
                logRecord.BalanceAfter = player.ArenaCoin
        }

        return tx.Create(logRecord).Error
}

// =============================================
// 等待池相关方法
// =============================================

func (am *ArenaManager) addToWaitingPool(roomConfigID, playerID uint64) {
        if _, exists := am.waitingPools[roomConfigID]; !exists {
                am.waitingPools[roomConfigID] = make(map[uint64]bool)
        }
        am.waitingPools[roomConfigID][playerID] = true
}

func (am *ArenaManager) removeFromWaitingPool(roomConfigID, playerID uint64) {
        if pool, exists := am.waitingPools[roomConfigID]; exists {
                delete(pool, playerID)
        }
}

// =============================================
// 广播相关方法
// =============================================

func (am *ArenaManager) broadcastSignupSuccess(sessionID, playerID uint64, nickname string) {
        log.Printf("[Arena] 广播报名成功: 会话=%d, 玩家=%s(%d)", sessionID, nickname, playerID)
        // TODO: 实现WebSocket广播
}

func (am *ArenaManager) broadcastCancelSignup(sessionID, playerID uint64) {
        log.Printf("[Arena] 广播取消报名: 会话=%d, 玩家=%d", sessionID, playerID)
        // TODO: 实现WebSocket广播
}

func (am *ArenaManager) broadcastSessionStart(sessionID uint64, participations []*database.ArenaParticipation, tables []*database.ArenaTable) {
        log.Printf("[Arena] 广播比赛开始: 会话=%d, 玩家数=%d, 桌数=%d", sessionID, len(participations), len(tables))
        // TODO: 实现WebSocket广播
}

func (am *ArenaManager) broadcastNewRound(sessionID uint64, roundNum int, players []*database.ArenaParticipation, tables []*database.ArenaTable) {
        log.Printf("[Arena] 广播新一轮开始: 会话=%d, 轮次=%d, 玩家数=%d", sessionID, roundNum, len(players))
        // TODO: 实现WebSocket广播
}

func (am *ArenaManager) broadcastSessionEnd(sessionID uint64, rankings []*database.ArenaParticipation) {
        log.Printf("[Arena] 广播比赛结束: 会话=%d", sessionID)
        // TODO: 实现WebSocket广播
}

// =============================================
// 后台任务
// =============================================

// sessionRecoveryLoop 会话恢复循环
func (am *ArenaManager) sessionRecoveryLoop() {
        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()

        for range ticker.C {
                am.recoverSessions()
        }
}

// recoverSessions 恢复未完成的会话
func (am *ArenaManager) recoverSessions() {
        am.mu.Lock()
        defer am.mu.Unlock()

        // 查找进行中的会话
        var sessions []database.ArenaSession
        err := am.db.Where("status = ?", database.ArenaSessionStatusInProgress).
                Preload("RoomConfig").
                Find(&sessions).Error
        if err != nil {
                log.Printf("[Arena] 恢复会话失败: %v", err)
                return
        }

        for _, session := range sessions {
                if _, exists := am.sessions[session.ID]; !exists {
                        am.sessions[session.ID] = &session
                        log.Printf("[Arena] 恢复会话: ID=%d", session.ID)
                }
        }
}

// sessionTimeoutCheckLoop 会话超时检查循环
func (am *ArenaManager) sessionTimeoutCheckLoop() {
        ticker := time.NewTicker(1 * time.Minute)
        defer ticker.Stop()

        for range ticker.C {
                am.checkSessionTimeout()
        }
}

// checkSessionTimeout 检查会话超时
func (am *ArenaManager) checkSessionTimeout() {
        am.mu.Lock()
        defer am.mu.Unlock()

        now := time.Now()

        for _, session := range am.sessions {
                if session.Status != database.ArenaSessionStatusInProgress {
                        continue
                }

                // 检查是否超时（假设每轮最大时长为配置的轮次时长）
                if session.ActualStartTime != nil {
                        maxDuration := time.Duration(session.RoomConfig.MatchRoundDuration*session.TotalRounds) * time.Minute
                        if now.Sub(*session.ActualStartTime) > maxDuration {
                                log.Printf("[Arena] 会话 %d 超时，强制结束", session.ID)
                                // 强制结束会话
                                activePlayers, _ := am.getActivePlayersLocked(session.ID)
                                if len(activePlayers) > 0 {
                                        am.finalizeSessionLocked(session, activePlayers)
                                }
                        }
                }
        }
}

// =============================================
// 工具方法
// =============================================

// generateSessionCode 生成会话编码
func (am *ArenaManager) generateSessionCode() string {
        bytes := make([]byte, 4)
        rand.Read(bytes)
        return hex.EncodeToString(bytes)
}

// generateTableCode 生成桌编码
func (am *ArenaManager) generateTableCode() string {
        bytes := make([]byte, 3)
        rand.Read(bytes)
        return hex.EncodeToString(bytes)
}

// generateOrderNo 生成订单号
func (am *ArenaManager) generateOrderNo() string {
        return fmt.Sprintf("ORD%d%06d", time.Now().UnixNano()/1000000, time.Now().Nanosecond()/1000)
}

// shuffleParticipations 随机打乱参赛者顺序
func (am *ArenaManager) shuffleParticipations(participations []*database.ArenaParticipation) {
        n := len(participations)
        for i := n - 1; i > 0; i-- {
                j := int(time.Now().UnixNano()) % (i + 1)
                participations[i], participations[j] = participations[j], participations[i]
        }
}

// sortPlayersByMatchCoin 按比赛金币排序
func (am *ArenaManager) sortPlayersByMatchCoin(participations []*database.ArenaParticipation) {
        // 简单的冒泡排序（降序）
        n := len(participations)
        for i := 0; i < n-1; i++ {
                for j := 0; j < n-i-1; j++ {
                        if participations[j].MatchCoin < participations[j+1].MatchCoin {
                                participations[j], participations[j+1] = participations[j+1], participations[j]
                        }
                }
        }
}

// boolToUint8 布尔转uint8
func boolToUint8(b bool) uint8 {
        if b {
                return 1
        }
        return 0
}

// ptrTime 时间指针
func ptrTime(t time.Time) *time.Time {
        return &t
}
