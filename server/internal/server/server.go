package server

import (
        "context"
        "fmt"
        "log"
        "net/http"
        "runtime"
        "sync"
        "time"

        "github.com/gorilla/websocket"
        "github.com/redis/go-redis/v9"

        "github.com/palemoky/fight-the-landlord/internal/config"
        "github.com/palemoky/fight-the-landlord/internal/game/match"
        "github.com/palemoky/fight-the-landlord/internal/game/room"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/server/handler"
        "github.com/palemoky/fight-the-landlord/internal/server/session"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

var upgrader = websocket.Upgrader{
        ReadBufferSize:  1024,
        WriteBufferSize: 1024,
        CheckOrigin: func(r *http.Request) bool {
                return true // 允许所有来源，生产环境需要限制
        },
        // 启用 permessage-deflate 压缩扩展
        // 可减少 40-70% 流量，gorilla/websocket 会自动协商压缩参数
        // 压缩会对CPU和内存造成压力，只有在大文件压缩才有收益，大量小文件反而是负优化
        EnableCompression: false,
}

// Server WebSocket 服务器
type Server struct {
        config         *config.Config
        redis          *redis.Client
        store          storage.Storage // 使用接口，支持 Redis 或内存存储
        leaderboard    LeaderboardInterface
        roomManager    *room.RoomManager
        matcher        *match.Matcher
        sessionManager *session.SessionManager
        clients        map[string]*Client
        clientsMu      sync.RWMutex
        handler        *handler.Handler

        // 安全组件
        rateLimiter    *RateLimiter
        originChecker  *OriginChecker
        messageLimiter *MessageRateLimiter
        chatLimiter    *ChatRateLimiter
        ipFilter       *IPFilter

        // 连接控制
        maxConnections int
        semaphore      chan struct{} // 信号量控制并发连接数

        // 维护模式
        maintenanceMode bool
        maintenanceMu   sync.RWMutex

        // 内存模式标志
        useMemoryStore bool

        // 竞技场状态广播器
        arenaBroadcaster *ArenaStatusBroadcaster
}

// LeaderboardInterface 排行榜接口
type LeaderboardInterface interface {
        RecordGameResult(ctx context.Context, playerID, playerName string, isWinner, isLandlord bool) error
        GetPlayerStats(ctx context.Context, playerID string) (*storage.PlayerStats, error)
        GetPlayerRank(ctx context.Context, playerID string) (int64, error)
        GetLeaderboard(ctx context.Context, limit int) ([]*storage.LeaderboardEntry, error)
}

// MemoryLeaderboard 内存排行榜（用于无 Redis 环境）
type MemoryLeaderboard struct {
        mu     sync.RWMutex
        stats  map[string]*storage.PlayerStats
        ranks  []*storage.LeaderboardEntry
}

// NewMemoryLeaderboard 创建内存排行榜
func NewMemoryLeaderboard() *MemoryLeaderboard {
        return &MemoryLeaderboard{
                stats: make(map[string]*storage.PlayerStats),
                ranks: make([]*storage.LeaderboardEntry, 0),
        }
}

func (m *MemoryLeaderboard) RecordGameResult(ctx context.Context, playerID, playerName string, isWinner, isLandlord bool) error {
        m.mu.Lock()
        defer m.mu.Unlock()

        stats, exists := m.stats[playerID]
        if !exists {
                stats = &storage.PlayerStats{
                        PlayerID:   playerID,
                        PlayerName: playerName,
                }
                m.stats[playerID] = stats
        }

        stats.TotalGames++
        if isWinner {
                stats.Wins++
                if isLandlord {
                        stats.LandlordWins++
                }
        }
        if isLandlord {
                stats.LandlordGames++
        }

        return nil
}

func (m *MemoryLeaderboard) GetPlayerStats(ctx context.Context, playerID string) (*storage.PlayerStats, error) {
        m.mu.RLock()
        defer m.mu.RUnlock()

        stats, exists := m.stats[playerID]
        if !exists {
                return &storage.PlayerStats{PlayerID: playerID}, nil
        }
        return stats, nil
}

func (m *MemoryLeaderboard) GetPlayerRank(ctx context.Context, playerID string) (int64, error) {
        m.mu.RLock()
        defer m.mu.RUnlock()

        for i, entry := range m.ranks {
                if entry.PlayerID == playerID {
                        return int64(i + 1), nil
                }
        }
        return 0, nil
}

func (m *MemoryLeaderboard) GetLeaderboard(ctx context.Context, limit int) ([]*storage.LeaderboardEntry, error) {
        m.mu.RLock()
        defer m.mu.RUnlock()

        if limit > len(m.ranks) {
                limit = len(m.ranks)
        }
        return m.ranks[:limit], nil
}

// NewServer 创建服务器实例
func NewServer(cfg *config.Config) (*Server, error) {
        var rdb *redis.Client
        var store storage.Storage
        var leaderboard LeaderboardInterface
        var useMemoryStore bool

        // 尝试连接 Redis
        rdb = redis.NewClient(&redis.Options{
                Addr:     cfg.Redis.Addr,
                Password: cfg.Redis.Password,
                DB:       cfg.Redis.DB,
        })

        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        if err := rdb.Ping(ctx).Err(); err != nil {
                log.Printf("⚠️ Redis 连接失败: %v，使用内存存储模式", err)
                rdb = nil
                store = storage.NewMemoryStore()
                leaderboard = NewMemoryLeaderboard()
                useMemoryStore = true
                log.Println("📝 已切换到内存存储模式（适用于开发/测试环境）")
        } else {
                log.Printf("✅ Redis 连接成功: %s", cfg.Redis.Addr)
                store = storage.NewRedisStore(rdb)
                leaderboard = storage.NewLeaderboardManager(rdb)
                useMemoryStore = false
        }

        s := &Server{
                config:         cfg,
                redis:          rdb,
                store:          store,
                leaderboard:    leaderboard,
                useMemoryStore: useMemoryStore,
                clients:        make(map[string]*Client),
                sessionManager: session.NewSessionManager(),
                // 初始化安全组件
                rateLimiter: NewRateLimiter(
                        cfg.Security.RateLimit.MaxPerSecond,
                        cfg.Security.RateLimit.MaxPerMinute,
                        cfg.Security.RateLimit.BanDurationTime(),
                ),
                originChecker:  NewOriginChecker(cfg.Security.AllowedOrigins),
                messageLimiter: NewMessageRateLimiter(cfg.Security.MessageLimit.MaxPerSecond),
                chatLimiter: NewChatRateLimiter(
                        cfg.Security.ChatLimit.MaxPerSecond,
                        cfg.Security.ChatLimit.MaxPerMinute,
                        cfg.Security.ChatLimit.CooldownDuration(),
                ),
                ipFilter: NewIPFilter(),
                // 初始化连接控制
                maxConnections: cfg.Server.MaxConnections,
                semaphore:      make(chan struct{}, cfg.Server.MaxConnections),
        }

        // 初始化房间管理器
        s.roomManager = room.NewRoomManager(store, cfg.Game)

        // 初始化匹配器
        s.matcher = match.NewMatcher(match.MatcherDeps{
                RoomManager: s.roomManager,
                RedisStore:  store,
                Leaderboard: leaderboard,
                GameConfig:  cfg.Game,
                RegisterSession: func(roomCode string, gs *session.GameSession) {
                        s.handler.SetGameSession(roomCode, gs)
                },
                OnGameEnd: s.roomManager.OnGameEnd,
        })

        // 初始化消息处理器
        s.handler = handler.NewHandler(handler.HandlerDeps{
                Server:         s,
                RoomManager:    s.roomManager,
                Matcher:        s.matcher,
                ChatLimiter:    s.chatLimiter,
                Leaderboard:    leaderboard,
                SessionManager: s.sessionManager,
        })

        // 设置房间游戏开始回调
        s.roomManager.SetOnGameStart(func(r *room.Room) {
                gs := session.NewGameSession(r, leaderboard, s.config.Game, s.roomManager.OnGameEnd)
                s.handler.SetGameSession(r.Code, gs)
                gs.Start()
        })

        // 🔧【新增】设置游戏结束回调（用于处理房间销毁）
        s.roomManager.SetOnGameEnd(func(r *room.Room) {
                s.roomManager.OnGameEnd(r)
        })

        // 设置房间列表更新回调 - 广播给所有在大厅的客户端
        s.roomManager.SetOnRoomListUpdate(func(actionType string, item *room.RoomListItem) {
                s.BroadcastRoomListUpdate(actionType, item)
        })

        // 🔧【修复】在 NewServer 中创建 arenaBroadcaster，确保在 SetWSServer 之前就已初始化
        // 这样 HTTP API 调用 TriggerArenaBroadcast 时不会因为 arenaBroadcaster 为 nil 而失败
        s.arenaBroadcaster = NewArenaStatusBroadcaster(s)
        log.Println("🏟️ 竞技场状态广播器已创建（将在 Start() 中启动）")

        log.Printf("🔒 安全配置: 连接限制=%d/s, 消息限制=%d/s, 聊天限制=%d/s, 最大连接数=%d",
                cfg.Security.RateLimit.MaxPerSecond, cfg.Security.MessageLimit.MaxPerSecond, cfg.Security.ChatLimit.MaxPerSecond, cfg.Server.MaxConnections)

        return s, nil
}

// GetRedis 获取Redis客户端
func (s *Server) GetRedis() *redis.Client {
        return s.redis
}

// GetArenaBroadcaster 获取竞技场广播器（返回接口类型）
func (s *Server) GetArenaBroadcaster() types.ArenaProvider {
        return s.arenaBroadcaster
}

// GetArenaBroadcasterRaw 获取竞技场广播器原始类型（供内部使用）
func (s *Server) GetArenaBroadcasterRaw() *ArenaStatusBroadcaster {
        return s.arenaBroadcaster
}

// Start 启动服务器
func (s *Server) Start() error {
        addr := fmt.Sprintf("%s:%d", s.config.Server.Host, s.config.Server.Port)

        http.HandleFunc("/ws", s.handleWebSocket)
        http.HandleFunc("/health", s.handleHealth)

        // 启动监控 goroutine
        go s.monitorStats()

        // 启动竞技场状态广播器（已在 NewServer 中创建）
        if s.arenaBroadcaster != nil {
                s.arenaBroadcaster.Start()
                log.Println("🏟️ 竞技场状态广播器已启动")
        }

        log.Printf("🚀 服务器启动在 ws://%s/ws (CPU核心数: %d)", addr, runtime.NumCPU())
        server := &http.Server{
                Addr:              addr,
                Handler:           nil,
                ReadHeaderTimeout: 10 * time.Second, // 防止 Slowloris 攻击
                ReadTimeout:       30 * time.Second,
                WriteTimeout:      30 * time.Second,
                IdleTimeout:       60 * time.Second,
        }
        return server.ListenAndServe()
}

// BroadcastRoomListUpdate 广播房间列表更新给所有在大厅的客户端
func (s *Server) BroadcastRoomListUpdate(actionType string, item *room.RoomListItem) {
        payload := protocol.RoomListUpdatePayload{
                ActionType: actionType,
        }

        switch actionType {
        case "add", "update":
                if item != nil {
                        payload.Room = &protocol.RoomListItem{
                                RoomCode:    item.RoomCode,
                                PlayerCount: item.PlayerCount,
                                MaxPlayers:  item.MaxPlayers,
                        }
                }
        case "remove":
                if item != nil {
                        payload.RoomCode = item.RoomCode
                }
        }

        msg := codec.MustNewMessage(protocol.MsgRoomListUpdate, payload)

        // 广播给所有不在房间内的客户端（在大厅的客户端）
        s.clientsMu.RLock()
        for _, client := range s.clients {
                // 只发送给不在房间的客户端
                if client.GetRoom() == "" {
                        client.SendMessage(msg)
                }
        }
        s.clientsMu.RUnlock()
}

// BroadcastArenaStatus 广播竞技场状态给所有在大厅的客户端
func (s *Server) BroadcastArenaStatus(arenas []protocol.ArenaRoomStatus) {
        payload := protocol.ArenaStatusPayload{
                Arenas: arenas,
                Time:   time.Now().UnixMilli(),
        }

        msg := codec.MustNewMessage(protocol.MsgArenaStatus, payload)

        // 广播给所有不在房间内的客户端（在大厅的客户端）
        s.clientsMu.RLock()
        for _, client := range s.clients {
                // 只发送给不在房间的客户端
                if client.GetRoom() == "" {
                        client.SendMessage(msg)
                }
        }
        s.clientsMu.RUnlock()
}

// TriggerArenaBroadcast 触发立即广播竞技场状态
// 用于报名/取消报名后立即通知所有客户端
// roomID: 指定要广播的房间ID，如果为0则广播所有房间
func (s *Server) TriggerArenaBroadcast(roomID uint64) {
        if s.arenaBroadcaster == nil {
                log.Printf("⚠️ [TriggerArenaBroadcast] arenaBroadcaster 未初始化，无法广播 roomID=%d", roomID)
                return
        }
        log.Printf("🔔 [TriggerArenaBroadcast] 开始触发广播 roomID=%d", roomID)
        s.arenaBroadcaster.ForceBroadcastRoomNow(roomID)
}
