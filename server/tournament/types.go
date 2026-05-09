// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
        "database/sql/driver"
        "encoding/json"
        "errors"
        "time"
)

// =============================================
// 赛事阶段状态
// =============================================

// TournamentStage 赛事阶段
type TournamentStage string

const (
        StageSignup      TournamentStage = "SIGNUP"      // 报名阶段
        StagePrepare     TournamentStage = "PREPARE"     // 准备阶段（分桌）
        StagePlaying     TournamentStage = "PLAYING"     // 游戏进行中
        StageRanking     TournamentStage = "RANKING"     // 排行榜阶段（等待淘汰）
        StageEliminating TournamentStage = "ELIMINATING" // 淘汰阶段
        StageFinal       TournamentStage = "FINAL"       // 决赛阶段
        StageFinished    TournamentStage = "FINISHED"    // 已结束
)

// IsTransitionValid 检查阶段转换是否有效
func (s TournamentStage) IsTransitionValid(next TournamentStage) bool {
        transitions := map[TournamentStage][]TournamentStage{
                StageSignup:      {StagePrepare, StageFinal, StageFinished}, // 只有1人报名时直接决赛
                StagePrepare:     {StagePlaying},
                StagePlaying:     {StageRanking, StageFinal, StageFinished}, // 决出最后3人进入决赛
                StageRanking:     {StageEliminating},
                StageEliminating: {StagePrepare, StageFinished}, // 淘汰后进入下一轮或结束
                StageFinal:       {StageFinished},
                StageFinished:    {},
        }

        allowed, exists := transitions[s]
        if !exists {
                return false
        }

        for _, stage := range allowed {
                if stage == next {
                        return true
                }
        }
        return false
}

// =============================================
// 淘汰规则
// =============================================

// EliminationRules 淘汰规则数组
// 例如 [60, 30, 18, 9, 3] 表示:
// - 第1轮结束保留60人
// - 第2轮结束保留30人
// - 第3轮结束保留18人
// - 第4轮结束保留9人
// - 第5轮（决赛）保留3人
type EliminationRules []int

// Value 实现driver.Valuer接口
func (e EliminationRules) Value() (driver.Value, error) {
        if e == nil {
                return nil, nil
        }
        return json.Marshal(e)
}

// Scan 实现sql.Scanner接口
func (e *EliminationRules) Scan(value interface{}) error {
        if value == nil {
                *e = nil
                return nil
        }
        bytes, ok := value.([]byte)
        if !ok {
                return errors.New("type assertion to []byte failed")
        }
        return json.Unmarshal(bytes, e)
}

// FindStartIndex 根据报名人数找到起始轮次索引
// 🔧【修复】动态淘汰轮次起点计算
// 规则：找到第一个小于报名人数的淘汰节点作为第一轮目标
// 如果报名人数等于某个节点，跳过该节点（无需筛到自身）
//
// 示例（规则 [60,30,18,9,3]）：
// - 报名102人 -> 返回索引0（60），路径：102->60->30->18->9->3
// - 报名60人 -> 返回索引1（30），跳过60，路径：60->30->18->9->3
// - 报名52人 -> 返回索引1（30），路径：52->30->18->9->3
// - 报名30人 -> 返回索引2（18），跳过30，路径：30->18->9->3
// - 报名17人 -> 返回索引3（9），路径：17->9->3
// - 报名8人 -> 补1机器人变9人，返回索引4（3），路径：9->3
// - 报名3人 -> 返回 len(e)（表示直接决赛），路径：3->final
func (e EliminationRules) FindStartIndex(playerCount int) int {
        if len(e) == 0 {
                return -1
        }

        // 遍历所有淘汰节点，找到第一个小于报名人数的节点
        // 注意：如果报名人数等于节点值，跳过该节点
        for i := 0; i < len(e); i++ {
                if e[i] < playerCount {
                        // 找到第一个小于报名人数的节点
                        return i
                }
                // 如果 e[i] >= playerCount，继续查找下一个
                // 当 e[i] == playerCount 时，意味着无需筛到该人数，跳过
        }

        // 如果报名人数小于等于最小档位（3人），直接决赛
        // 返回 len(e) 表示不需要淘汰轮次，直接进入决赛
        return len(e)
}

// GetActiveRules 获取当前报名人数对应的有效淘汰规则
// 🔧【修复】正确处理直接决赛情况
// 返回从起始轮开始的所有规则
// 如果 startIdx == len(e)，返回空切片表示直接决赛
func (e EliminationRules) GetActiveRules(playerCount int) EliminationRules {
        startIdx := e.FindStartIndex(playerCount)
        if startIdx < 0 {
                return e
        }
        // 如果 startIdx >= len(e)，表示直接决赛，返回空规则
        if startIdx >= len(e) {
                return EliminationRules{}
        }
        return e[startIdx:]
}

// GetTotalRounds 计算总淘汰轮次数（不含决赛）
// 🔧【新增】用于客户端等待页显示总轮次
// 返回值：淘汰轮次数 + 1（决赛轮）
// 例如：报名52人，路径30->18->9->3，返回4轮淘汰 + 1决赛 = 5轮
// 报名3人，直接决赛，返回1轮（决赛）
func (e EliminationRules) GetTotalRounds(playerCount int) int {
        activeRules := e.GetActiveRules(playerCount)
        // 淘汰轮次数 + 决赛轮
        return len(activeRules) + 1
}

// =============================================
// 玩家信息
// =============================================

// PlayerInfo 玩家信息
type PlayerInfo struct {
        PlayerID        uint64 `json:"player_id"`
        Nickname        string `json:"nickname"`
        MatchCoin       int64  `json:"match_coin"`       // 总比赛金币
        RoundMatchCoin  int64  `json:"round_match_coin"` // 本轮比赛金币
        IsRobot         bool   `json:"is_robot"`
        IsTournamentBot bool   `json:"is_tournament_bot"` // 是否为补位机器人（不可获奖）
        IsOnline        bool   `json:"is_online"`
        IsEliminated    bool   `json:"is_eliminated"`
        Rank            int    `json:"rank"`
        CurrentTableID  uint64 `json:"current_table_id"`
}

// PlayerList 玩家列表
type PlayerList []*PlayerInfo

// SortByMatchCoin 按比赛金币降序排序
func (p PlayerList) SortByMatchCoin() {
        for i := 0; i < len(p)-1; i++ {
                for j := i + 1; j < len(p); j++ {
                        if p[i].RoundMatchCoin < p[j].RoundMatchCoin {
                                p[i], p[j] = p[j], p[i]
                        }
                }
        }
}

// GetActivePlayers 获取活跃玩家（未淘汰且在线）
func (p PlayerList) GetActivePlayers() PlayerList {
        var active PlayerList
        for _, player := range p {
                if !player.IsEliminated && player.IsOnline {
                        active = append(active, player)
                }
        }
        return active
}

// GetRealPlayers 获取真人玩家
func (p PlayerList) GetRealPlayers() PlayerList {
        var real PlayerList
        for _, player := range p {
                if !player.IsRobot {
                        real = append(real, player)
                }
        }
        return real
}

// =============================================
// 桌信息
// =============================================

// TableInfo 桌信息
type TableInfo struct {
        TableID   uint64      `json:"table_id"`
        TableCode string      `json:"table_code"`
        RoundNum  int         `json:"round_num"`
        Status    TableStatus `json:"status"`
        Players   [3]*PlayerInfo `json:"players"`
        GameID    string      `json:"game_id"`
}

// TableStatus 桌状态
type TableStatus int

const (
        TableStatusWaiting TableStatus = iota // 等待玩家
        TableStatusPlaying                    // 游戏中
        TableStatusEnded                      // 已结束
)

// =============================================
// 轮次信息
// =============================================

// RoundInfo 轮次信息
type RoundInfo struct {
        SessionID         uint64        `json:"session_id"`
        RoundNum          int           `json:"round_num"`
        EliminationTarget int           `json:"elimination_target"` // 本轮保留人数
        TotalPlayers      int           `json:"total_players"`
        TablesCount       int           `json:"tables_count"`
        Stage             TournamentStage `json:"stage"`
        StartedAt         *time.Time    `json:"started_at"`
        EndedAt           *time.Time    `json:"ended_at"`
        RankWaitUntil     *time.Time    `json:"rank_wait_until"`
        TablesCompleted   int           `json:"tables_completed"`
}

// =============================================
// 排行榜信息
// =============================================

// RankingInfo 排行榜信息
type RankingInfo struct {
        SessionID     uint64            `json:"session_id"`
        RoundNum      int               `json:"round_num"`
        CurrentStage  TournamentStage   `json:"current_stage"`
        Remaining     int               `json:"remaining"`      // 剩余人数
        EliminationLine int             `json:"elimination_line"` // 晋级线
        Countdown     int               `json:"countdown"`      // 倒计时秒数
        Rankings      []RankingItem     `json:"rankings"`
        UpdatedAt     time.Time         `json:"updated_at"`
}

// RankingItem 排名项
type RankingItem struct {
        Rank       int    `json:"rank"`
        PlayerID   uint64 `json:"player_id"`
        Nickname   string `json:"nickname"`
        MatchCoin  int64  `json:"match_coin"`
        IsRobot    bool   `json:"is_robot"`
        IsSafe     bool   `json:"is_safe"` // 是否安全（已过晋级线）
}

// =============================================
// 淘汰结果
// =============================================

// EliminationResult 淘汰结果
type EliminationResult struct {
        SessionID       uint64            `json:"session_id"`
        RoundNum        int               `json:"round_num"`
        EliminatedCount int               `json:"eliminated_count"`
        RemainingCount  int               `json:"remaining_count"`
        Eliminated      []EliminatedPlayer `json:"eliminated"`
        IsFinalRound    bool              `json:"is_final_round"`
}

// EliminatedPlayer 被淘汰玩家
type EliminatedPlayer struct {
        PlayerID        uint64 `json:"player_id"`
        Nickname        string `json:"nickname"`
        Rank            int    `json:"rank"`
        MatchCoin       int64  `json:"match_coin"`
        EliminatedReason string `json:"eliminated_reason"`
}

// =============================================
// 决赛结果
// =============================================

// FinalResult 决赛结果
type FinalResult struct {
        SessionID  uint64       `json:"session_id"`
        Champion   *PlayerInfo  `json:"champion"`   // 冠军
        RunnerUp   *PlayerInfo  `json:"runner_up"`  // 亚军
        Third      *PlayerInfo  `json:"third"`      // 季军
        EndedAt    time.Time    `json:"ended_at"`
}

// =============================================
// 配置
// =============================================

// TournamentConfig 锦标赛配置
type TournamentConfig struct {
        EliminationRules  EliminationRules `json:"elimination_rules"`
        RankWaitSeconds   int              `json:"rank_wait_seconds"`   // 排行榜等待秒数
        MinMatchPlayers   int              `json:"min_match_players"`   // 最小匹配人数
        MatchRoundCount   int              `json:"match_round_count"`   // 每轮打几局
        MatchRoundDuration int             `json:"match_round_duration"` // 每局时长（分钟）
        MaxPlayers        int              `json:"max_players"`
        MinPlayers        int              `json:"min_players"`
        SignupFee         int64            `json:"signup_fee"`
}

// DefaultTournamentConfig 默认配置
func DefaultTournamentConfig() *TournamentConfig {
        return &TournamentConfig{
                EliminationRules:   EliminationRules{60, 30, 18, 9, 3},
                RankWaitSeconds:    30,
                MinMatchPlayers:    1,
                MatchRoundCount:    3,
                MatchRoundDuration: 5,
                MaxPlayers:         100,
                MinPlayers:         1,
                SignupFee:          100,
        }
}

// =============================================
// 错误定义
// =============================================

var (
        ErrSessionNotFound         = errors.New("比赛会话不存在")
        ErrInvalidStage            = errors.New("无效的赛事阶段")
        ErrInvalidTransition       = errors.New("无效的阶段转换")
        ErrNoPlayers               = errors.New("没有玩家")
        ErrRoundNotComplete        = errors.New("本轮未完成")
        ErrAlreadyEliminated       = errors.New("玩家已被淘汰")
        ErrPlayerNotInSession      = errors.New("玩家不在比赛中")
        ErrInsufficientPlayers     = errors.New("人数不足")
        ErrSessionAlreadyEnded     = errors.New("比赛已结束")
        ErrInvalidEliminationRules = errors.New("无效的淘汰规则")
)

// =============================================
// WebSocket消息类型
// =============================================

// TournamentMessageType 锦标赛消息类型
type TournamentMessageType string

const (
        MsgTypeTournamentSignup    TournamentMessageType = "TOURNAMENT_SIGNUP"    // 报名成功
        MsgTypeTournamentStart     TournamentMessageType = "TOURNAMENT_START"     // 比赛开始
        MsgTypeTournamentRanking   TournamentMessageType = "TOURNAMENT_RANKING"   // 排行榜阶段
        MsgTypeTournamentEliminate TournamentMessageType = "TOURNAMENT_ELIMINATE" // 淘汰通知
        MsgTypeTournamentFinal     TournamentMessageType = "TOURNAMENT_FINAL"     // 决赛通知
        MsgTypeTournamentEnd       TournamentMessageType = "TOURNAMENT_END"       // 比赛结束
        MsgTypeTournamentTable     TournamentMessageType = "TOURNAMENT_TABLE"     // 分桌通知
)

// TournamentMessage 锦标赛WebSocket消息
type TournamentMessage struct {
        Type      TournamentMessageType `json:"type"`
        SessionID uint64                `json:"session_id"`
        Data      interface{}           `json:"data"`
        Timestamp int64                 `json:"timestamp"`
}

// RankingBroadcastMessage 排行榜广播消息
type RankingBroadcastMessage struct {
        CurrentRound    int           `json:"current_round"`
        Remaining       int           `json:"remaining"`
        EliminationLine int           `json:"elimination_line"`
        Countdown       int           `json:"countdown"`
        Rankings        []RankingItem `json:"rankings"`
}

// EliminationBroadcastMessage 淘汰广播消息
type EliminationBroadcastMessage struct {
        RoundNum        int               `json:"round_num"`
        EliminatedCount int               `json:"eliminated_count"`
        RemainingCount  int               `json:"remaining_count"`
        Eliminated      []EliminatedPlayer `json:"eliminated"`
}

// FinalBroadcastMessage 决赛广播消息
type FinalBroadcastMessage struct {
        ChampionName string `json:"champion_name"`
        RunnerUpName string `json:"runner_up_name"`
        ThirdName    string `json:"third_name"`
}
