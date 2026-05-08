package match

import (
        "context"
        "log"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/config"
        "github.com/palemoky/fight-the-landlord/internal/game/room"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/server/session"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

// SessionRegistrationFunc 游戏会话注册回调
type SessionRegistrationFunc func(roomCode string, gs *session.GameSession)

// Matcher 匹配系统
type Matcher struct {
        roomManager     *room.RoomManager
        store           storage.Storage
        leaderboard     LeaderboardInterface
        gameConfig      config.GameConfig
        registerSession SessionRegistrationFunc
        onGameEnd       func(*room.Room) // 游戏结束回调
        queue           []types.ClientInterface
        mu              sync.Mutex
}

// LeaderboardInterface 排行榜接口
 type LeaderboardInterface interface {
        RecordGameResult(ctx context.Context, playerID, playerName string, isWinner, isLandlord bool) error
        GetPlayerStats(ctx context.Context, playerID string) (*storage.PlayerStats, error)
        GetPlayerRank(ctx context.Context, playerID string) (int64, error)
        GetLeaderboard(ctx context.Context, limit int) ([]*storage.LeaderboardEntry, error)
}

// MatcherDeps 匹配器依赖
type MatcherDeps struct {
        RoomManager     *room.RoomManager
        RedisStore      storage.Storage
        Leaderboard     LeaderboardInterface
        GameConfig      config.GameConfig
        RegisterSession SessionRegistrationFunc
        OnGameEnd       func(*room.Room) // 游戏结束回调
}

// NewMatcher 创建匹配器
func NewMatcher(deps MatcherDeps) *Matcher {
        return &Matcher{
                roomManager:     deps.RoomManager,
                store:           deps.RedisStore,
                leaderboard:     deps.Leaderboard,
                gameConfig:      deps.GameConfig,
                registerSession: deps.RegisterSession,
                onGameEnd:       deps.OnGameEnd,
                queue:           make([]types.ClientInterface, 0),
        }
}

// AddToQueue 加入匹配队列
func (m *Matcher) AddToQueue(client types.ClientInterface) {
        m.mu.Lock()
        defer m.mu.Unlock()

        // 检查是否已在队列中
        for _, c := range m.queue {
                if c.GetID() == client.GetID() {
                        return
                }
        }

        // ✅ 优先检查是否有可补位的房间（未满且状态为等待中）
        availableRoom := m.findAvailableRoomLocked()
        if availableRoom != nil {
                // 直接加入该房间
                log.Printf("🎯 玩家 %s 补位到房间 %s", client.GetName(), availableRoom.Code)
                m.joinExistingRoomLocked(client, availableRoom)
                return
        }

        m.queue = append(m.queue, client)
        log.Printf("🔍 玩家 %s 加入匹配队列，当前队列长度: %d", client.GetName(), len(m.queue))

        // 检查是否可以匹配
        m.tryMatchLocked()
}

// RemoveFromQueue 从匹配队列移除
func (m *Matcher) RemoveFromQueue(client types.ClientInterface) {
        m.mu.Lock()
        defer m.mu.Unlock()

        for i, c := range m.queue {
                if c.GetID() == client.GetID() {
                        m.queue = append(m.queue[:i], m.queue[i+1:]...)
                        log.Printf("🔍 玩家 %s 离开匹配队列", client.GetName())
                        return
                }
        }
}

// findAvailableRoomLocked 查找可补位的房间（调用时已持有锁）
// 条件：状态为等待中 且 玩家数 < 3
func (m *Matcher) findAvailableRoomLocked() *room.Room {
        // 通过 RoomManager 获取可加入的房间列表
        roomList := m.roomManager.GetRoomList()
        if len(roomList) == 0 {
                return nil
        }

        // 返回第一个可加入的房间
        for _, item := range roomList {
                if r := m.roomManager.GetRoom(item.RoomCode); r != nil {
                        return r
                }
        }
        return nil
}

// joinExistingRoomLocked 加入现有房间（调用时已持有锁）
func (m *Matcher) joinExistingRoomLocked(client types.ClientInterface, r *room.Room) {
        // 加入房间
        _, err := m.roomManager.JoinRoom(client, r.Code)
        if err != nil {
                log.Printf("⚠️ 补位失败: %v，将玩家加入队列", err)
                m.queue = append(m.queue, client)
                return
        }

        // 发送加入房间成功消息
        client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, &protocol.RoomJoinedPayload{
                RoomCode:     r.Code,
                Player:       r.GetPlayerInfo(client.GetID()),
                Players:      r.GetAllPlayersInfo(),
                RoomCategory: r.RoomCategory, // 🔧【新增】房间分类
                PeriodNo:     r.PeriodNo,     // 🔧【新增】期号
        }))

        log.Printf("✅ 玩家 %s 成功补位到房间 %s，当前人数: %d", client.GetName(), r.Code, len(r.Players))

        // 检查房间是否满了，如果满了且所有人准备则开始游戏
        if len(r.Players) >= 3 {
                // 检查是否所有人都准备好
                allReady := true
                for _, p := range r.Players {
                        if !p.Ready {
                                allReady = false
                                break
                        }
                }

                if allReady {
                        log.Printf("🎮 房间 %s 已满且所有人准备，开始游戏", r.Code)
                        m.startGameForRoom(r)
                }
        }
}

// startGameForRoom 为房间开始游戏
func (m *Matcher) startGameForRoom(r *room.Room) {
        // 开始游戏
        if err := r.StartGame(); err != nil {
                log.Printf("❌ 开始游戏失败: %v", err)
                return
        }

        // 创建游戏会话并开始
        gs := session.NewGameSession(r, m.leaderboard, m.gameConfig, m.onGameEnd)

        // 注册游戏会话
        if m.registerSession != nil {
                m.registerSession(r.Code, gs)
        }

        gs.Start()

        // 保存房间状态
        if m.store != nil && m.store.IsReady() {
                go func() { _ = m.store.SaveRoom(context.Background(), r.Code, r.ToRoomData()) }()
        }
}

// tryMatchLocked 尝试匹配（调用时已持有锁）
func (m *Matcher) tryMatchLocked() {
        // ✅ 优先处理补位：如果队列有玩家且有空位房间
        if len(m.queue) > 0 {
                availableRoom := m.findAvailableRoomLocked()
                if availableRoom != nil {
                        // 取出第一个玩家补位
                        client := m.queue[0]
                        m.queue = m.queue[1:]
                        log.Printf("🎯 玩家 %s 从队列补位到房间 %s", client.GetName(), availableRoom.Code)
                        m.joinExistingRoomLocked(client, availableRoom)
                        return
                }
        }

        // 检查是否有足够的玩家创建新房间
        if len(m.queue) < 3 {
                return
        }

        // 取出前 3 个玩家
        players := m.queue[:3]
        m.queue = m.queue[3:]

        // 创建房间
        go m.createMatchRoom(players)
}

// createMatchRoom 创建匹配房间
func (m *Matcher) createMatchRoom(players []types.ClientInterface) {
        // 创建房间（使用第一个玩家，默认房间配置ID为0）
        room, err := m.roomManager.CreateRoom(players[0], 0)
        if err != nil {
                log.Printf("匹配创建房间失败: %v", err)
                // 将玩家放回队列
                m.mu.Lock()
                m.queue = append(players, m.queue...) // 先到先匹配
                m.mu.Unlock()
                return
        }

        // 其他玩家加入房间
        for _, client := range players[1:] {
                if _, err := m.roomManager.JoinRoom(client, room.Code); err != nil {
                        log.Printf("匹配加入房间失败: %v", err)
                }
        }

        log.Printf("🎮 匹配成功！房间 %s，玩家: %s, %s, %s",
                room.Code, players[0].GetName(), players[1].GetName(), players[2].GetName())

        // 给所有玩家发送匹配成功消息和房间信息
        time.Sleep(100 * time.Millisecond) // 短暂延迟确保房间状态同步

        for _, client := range players {
                // 发送加入房间成功消息
                client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, &protocol.RoomJoinedPayload{
                        RoomCode:     room.Code,
                        Player:       room.GetPlayerInfo(client.GetID()),
                        Players:      room.GetAllPlayersInfo(),
                        RoomCategory: room.RoomCategory, // 🔧【新增】房间分类
                        PeriodNo:     room.PeriodNo,     // 🔧【新增】期号
                }))
        }

        // 自动准备所有玩家
        room.SetAllPlayersReady()

        // 广播所有玩家准备状态
        for _, player := range room.Players {
                if player.Client != nil {
                        room.Broadcast(codec.MustNewMessage(protocol.MsgPlayerReady, &protocol.PlayerReadyPayload{
                                PlayerID: player.Client.GetID(),
                                Ready:    true,
                        }))
                }
        }

        // 开始游戏
        if err := room.StartGame(); err != nil {
                log.Printf("匹配开始游戏失败: %v", err)
                return
        }

        // 创建游戏会话并开始
        gs := session.NewGameSession(room, m.leaderboard, m.gameConfig, m.onGameEnd)

        // 注册游戏会话
        if m.registerSession != nil {
                m.registerSession(room.Code, gs)
        }

        gs.Start()

        // 保存房间状态
        if m.store != nil && m.store.IsReady() {
                go func() { _ = m.store.SaveRoom(context.Background(), room.Code, room.ToRoomData()) }()
        }
}

// GetQueueLength 获取队列长度
func (m *Matcher) GetQueueLength() int {
        m.mu.Lock()
        defer m.mu.Unlock()
        return len(m.queue)
}
