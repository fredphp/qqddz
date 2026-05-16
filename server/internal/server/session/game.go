package session

import (
        "context"
        "log"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/config"
        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/room"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
)

// GameState 游戏状态
type GameState int

const (
        GameStateInit GameState = iota
        GameStateReady        // 准备阶段
        GameStateDeal         // 发牌阶段
        GameStateCallLandlord // 抢地主阶段（合并叫地主和抢地主）
        GameStatePlaying      // 出牌阶段
        GameStateSettlement   // 结算阶段
        GameStateEnded
)

// String 返回游戏状态的字符串表示
func (s GameState) String() string {
        switch s {
        case GameStateInit:
                return "init"
        case GameStateReady:
                return "ready"
        case GameStateDeal:
                return "deal"
        case GameStateCallLandlord:
                return "call_landlord"
        case GameStatePlaying:
                return "playing"
        case GameStateSettlement:
                return "settlement"
        case GameStateEnded:
                return "ended"
        default:
                return "unknown"
        }
}

// PlayerState 类型别名已在 types.go 中定义，通过 room.PlayerState 重导出

// GamePlayer 游戏中的玩家
type GamePlayer struct {
        ID         string
        Name       string
        Seat       int
        Hand       []card.Card
        IsLandlord bool
        State      PlayerState // 玩家状态：online/offline/robot
        Gender     string      // 玩家性别: male/female/unknown（用于音效）
        DBID       uint64      // 🔧【新增】数据库玩家ID，用于结算时更新金币
        IsTrustee  bool        // 🔧【托管】是否处于托管状态（超时或掉线触发）
}

// IsOnline 检查玩家是否在线
func (p *GamePlayer) IsOnline() bool {
        return p.State == PlayerStateOnline
}

// IsRobot 检查玩家是否机器人托管
func (p *GamePlayer) IsRobot() bool {
        return p.State == PlayerStateRobot
}

// SetRobot 设置玩家为机器人托管
func (p *GamePlayer) SetRobot() {
        p.State = PlayerStateRobot
        log.Printf("🤖 机器人托管: %s", p.Name)
}

// SetOnline 设置玩家为在线
func (p *GamePlayer) SetOnline() {
        p.State = PlayerStateOnline
        log.Printf("📶 玩家上线: %s", p.Name)
}

// 🔧【托管】EnableTrustee 开启托管状态
func (p *GamePlayer) EnableTrustee() {
        p.IsTrustee = true
        log.Printf("[TRUSTEE] 玩家 %s 进入托管状态", p.Name)
}

// 🔧【托管】DisableTrustee 取消托管状态
func (p *GamePlayer) DisableTrustee() {
        p.IsTrustee = false
        log.Printf("[TRUSTEE] 玩家 %s 取消托管状态", p.Name)
}

// LeaderboardInterface 排行榜接口
type LeaderboardInterface interface {
        RecordGameResult(ctx context.Context, playerID, playerName string, isWinner, isLandlord bool) error
        GetPlayerStats(ctx context.Context, playerID string) (*storage.PlayerStats, error)
        GetPlayerRank(ctx context.Context, playerID string) (int64, error)
        GetLeaderboard(ctx context.Context, limit int) ([]*storage.LeaderboardEntry, error)
}

// GameSession 游戏会话
type GameSession struct {
        room        *room.Room
        leaderboard LeaderboardInterface
        gameConfig  config.GameConfig
        state       GameState
        players     []*GamePlayer // 按座位顺序
        onGameEnd   func(*room.Room) // 游戏结束回调（用于通知房间管理器销毁房间）

        deck        card.Deck
        bottomCards []card.Card

        // 🔧【修复】统一轮转管理器 - 解决机器人轮转卡死问题
        turnManager *TurnManager

        // ============================================================
        // 【核心】抢地主四轮规则（A→B→C→A）
        // ============================================================
        callIndex         int           // 当前操作的玩家索引（0-2）
        callRound         int           // 当前轮次（1或2）
        callTurnIndex     int           // 当前是第几次操作（1-4）
        callOrderInRound  int           // 🔧【新增】当前轮次内的操作顺序（1-3），用于音效播放
        callHistory       []CallRecord  // 抢地主历史记录
        firstCallerIdx    int           // 第一个抢地主的玩家索引（-1表示没人抢）
        lastCallerIdx     int           // 最后一个抢地主的玩家索引
        currentCallerID   string        // 当前应该操作的玩家ID
        pendingCallAction string        // 🔧【新增】当前玩家的待处理操作（提前操作时保存，等超时后执行）

        // 🔧【新增】重发牌计数器（用于限制重发次数）
        reDealCount int // 连续重新发牌次数（所有人都不抢时累计）

        // 🔧【新增】结算统计
        qiangCount   int // 成功抢地主次数
        rocketCount  int // 王炸次数

        // 🔧【关键修复】玩家出局状态（不抢后失去资格）
        playerOutStatus map[int]bool // key: 玩家索引(0-2), value: 是否出局

        // 出牌相关
        currentPlayer     int             // 当前出牌玩家索引
        lastPlayedHand    rule.ParsedHand // 上家出牌
        lastPlayerIdx     int             // 上家索引
        consecutivePasses int             // 连续 PASS 次数

        // 超时控制
        turnTimer        *time.Timer
        offlineWaitTimer *time.Timer   // 离线等待计时器
        timerExpiresAt   time.Time     // 🔧【修复】计时器到期时间（绝对时间）
        timerMu          sync.Mutex

        // 🔧【托管】机器人操作计时器（托管状态下使用）
        robotTimer *time.Timer

        // 🔧【新增】竞技场倒计时状态（防止重复启动）
        arenaCountdownActive bool
        arenaCountdownMu     sync.Mutex

        // 游戏日志记录
        gameLogger *GameLogger

        mu sync.RWMutex
}

// CallRecord 抢地主记录
type CallRecord struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Action     string `json:"action"` // "call" = 抢, "pass" = 不抢
        Round      int    `json:"round"`
        TurnIndex  int    `json:"turn_index"`
}

// NewGameSession 创建游戏会话
func NewGameSession(r *room.Room, lb LeaderboardInterface, gameCfg config.GameConfig, onGameEnd func(*room.Room)) *GameSession {
        playerOrder := r.PlayerOrder
        players := make([]*GamePlayer, len(playerOrder))
        for i, id := range playerOrder {
                rp := r.Players[id]
                playerName := "未知玩家"
                playerState := PlayerStateOnline
                var playerDBID uint64 = 0 // 🔧【新增】数据库玩家ID
                if rp != nil && rp.Client != nil {
                        playerName = rp.Client.GetName()
                        playerDBID = rp.Client.GetPlayerID() // 🔧【新增】获取数据库ID
                }
                // 检查房间中的玩家状态
                if rp != nil {
                        switch rp.State {
                        case room.PlayerStateOnline:
                                playerState = PlayerStateOnline
                        case room.PlayerStateOffline:
                                playerState = PlayerStateOffline
                        case room.PlayerStateRobot:
                                playerState = PlayerStateRobot
                        }
                }
                players[i] = &GamePlayer{
                        ID:    id,
                        Name:  playerName,
                        Seat:  i,
                        State: playerState,
                        DBID:  playerDBID, // 🔧【新增】设置数据库ID
                }
        }

        // 初始化游戏日志记录器
        gameLogger := NewGameLogger(r.Code, 1, 1) // 默认房间类型为普通场，房间分类为普通场

        gs := &GameSession{
                room:            r,
                leaderboard:     lb,
                gameConfig:      gameCfg,
                state:           GameStateInit,
                players:         players,
                onGameEnd:       onGameEnd,
                firstCallerIdx:  -1,
                lastCallerIdx:   -1,
                callHistory:     make([]CallRecord, 0),
                playerOutStatus: make(map[int]bool),
                gameLogger:      gameLogger,
        }

        // 🔧【修复】初始化统一轮转管理器
        gs.turnManager = NewTurnManager(gs)

        return gs
}

// GetPlayerByID 通过ID获取玩家
func (gs *GameSession) GetPlayerByID(playerID string) *GamePlayer {
        for _, p := range gs.players {
                if p.ID == playerID {
                        return p
                }
        }
        return nil
}

// GetRoomCode 获取房间号
func (gs *GameSession) GetRoomCode() string {
        return gs.room.Code
}

// IsPlayerRobot 检查玩家是否是机器人托管
func (gs *GameSession) IsPlayerRobot(playerID string) bool {
        player := gs.GetPlayerByID(playerID)
        if player == nil {
                return false
        }
        return player.IsRobot()
}

// SetPlayerRobot 设置玩家机器人托管
func (gs *GameSession) SetPlayerRobot(playerID string) {
        player := gs.GetPlayerByID(playerID)
        if player != nil {
                player.SetRobot()
        }
}

// SetPlayerOnline 设置玩家在线
func (gs *GameSession) SetPlayerOnline(playerID string) {
        player := gs.GetPlayerByID(playerID)
        if player != nil {
                player.SetOnline()
        }
}

// 🔧【托管】EnablePlayerTrustee 开启玩家托管
func (gs *GameSession) EnablePlayerTrustee(playerID string) {
        player := gs.GetPlayerByID(playerID)
        if player != nil {
                player.EnableTrustee()
        }
}

// 🔧【托管】DisablePlayerTrustee 取消玩家托管
func (gs *GameSession) DisablePlayerTrustee(playerID string) {
        player := gs.GetPlayerByID(playerID)
        if player != nil {
                player.DisableTrustee()
        }
}

// 🔧【托管】IsPlayerTrustee 检查玩家是否托管
func (gs *GameSession) IsPlayerTrustee(playerID string) bool {
        player := gs.GetPlayerByID(playerID)
        if player == nil {
                return false
        }
        return player.IsTrustee
}

// 🔧【托管】HandleCancelTrustee 处理取消托管请求
// 当用户在屏幕上活动时触发，停止机器人自动操作，让玩家恢复手动控制
func (gs *GameSession) HandleCancelTrustee(playerID string) {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        player := gs.GetPlayerByID(playerID)
        if player == nil {
                log.Printf("[TRUSTEE] HandleCancelTrustee: 玩家不存在 %s", playerID)
                return
        }

        // 如果玩家不处于托管状态，无需处理
        if !player.IsTrustee {
                log.Printf("[TRUSTEE] HandleCancelTrustee: 玩家 %s 不处于托管状态", player.Name)
                return
        }

        log.Printf("[TRUSTEE] HandleCancelTrustee: 玩家 %s 取消托管", player.Name)

        // 取消托管状态
        player.DisableTrustee()

        // 停止机器人计时器
        gs.StopRobotTimer()

        // 广播取消托管状态
        gs.BroadcastTrusteeState(playerID, player.Name, false, "user_activity")
}
