package room

import (
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/config"
        "github.com/palemoky/fight-the-landlord/internal/server/storage"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

const (
        roomCodeLength = 6            // 房间号长度
        roomCodeChars  = "0123456789" // 房间号字符集
)

// RoomPlayer 房间中的玩家
type RoomPlayer struct {
        Client     types.ClientInterface
        Seat       int         // 座位号 0-2
        Ready      bool        // 是否准备
        IsLandlord bool        // 是否是地主
        State      PlayerState // 玩家状态：online/offline/robot
}

// NewRoomPlayer 创建房间玩家
func NewRoomPlayer(client types.ClientInterface, seat int) *RoomPlayer {
        // 🔧【修复】检查客户端是否是机器人，如果是则设置正确的状态
        initialState := PlayerStateOnline
        if client.IsRobot() {
                initialState = PlayerStateRobot
        }
        
        return &RoomPlayer{
                Client: client,
                Seat:   seat,
                Ready:  false,
                State:  initialState,
        }
}

// IsOnline 检查玩家是否在线
func (p *RoomPlayer) IsOnline() bool {
        return p.State == PlayerStateOnline && p.Client != nil
}

// IsRobot 检查玩家是否机器人托管
func (p *RoomPlayer) IsRobot() bool {
        return p.State == PlayerStateRobot
}

// SetOffline 设置玩家离线
func (p *RoomPlayer) SetOffline() {
        p.State = PlayerStateOffline
}

// SetRobot 设置玩家机器人托管
func (p *RoomPlayer) SetRobot() {
        p.State = PlayerStateRobot
}

// SetOnline 设置玩家在线
func (p *RoomPlayer) SetOnline(client types.ClientInterface) {
        p.Client = client
        p.State = PlayerStateOnline
}

// Room 游戏房间
type Room struct {
        Code        string                 // 房间号
        State       RoomState              // 房间状态
        Players     map[string]*RoomPlayer // 玩家列表
        PlayerOrder []string               // 玩家顺序（按座位）
        CreatorID   string                 // 房主ID
        CreatedAt   time.Time              // 创建时间

        // 🔧【新增】起叫人逻辑相关字段
        LastLandlordIdx int // 上一局地主的座位索引（-1表示首局）
        GameCount       int // 游戏局数计数

        // 🔧【新增】房间分类字段
        RoomCategory uint8 // 房间分类: 1-普通场, 2-竞技场

        // 🔧【新增】竞技场专用字段
        ArenaSessionID uint64            // 竞技场会话ID（竞技场模式下使用）
        PeriodNo       string            // 期号（竞技场模式下使用）
        RoomConfigID   uint64            // 房间配置ID（竞技场模式下使用）
        ArenaGoldCache map[uint64]int64  // 🔧【优化】竞技场金币缓存，避免重复查询数据库

        mu sync.RWMutex
}

// SetPeriodNo 设置竞技场期号
func (r *Room) SetPeriodNo(periodNo string) {
        r.mu.Lock()
        defer r.mu.Unlock()
        r.PeriodNo = periodNo
}

// RoomManager 房间管理器
type RoomManager struct {
        store            storage.Storage
        roomTimeout      time.Duration
        gameConfig       config.GameConfig
        onGameStart      func(*Room)
        onGameEnd        func(*Room)                      // 游戏结束回调
        onRoomListUpdate func(actionType string, room *RoomListItem) // 房间列表更新回调
        rooms            map[string]*Room
        mu               sync.RWMutex
}

// RoomListItem 房间列表项（用于广播）
type RoomListItem struct {
        RoomCode    string
        PlayerCount int
        MaxPlayers  int
}

// NewRoomManager 创建房间管理器
func NewRoomManager(store storage.Storage, gameConfig config.GameConfig) *RoomManager {
        rm := &RoomManager{
                store:       store,
                roomTimeout: gameConfig.RoomTimeoutDuration(),
                gameConfig:  gameConfig,
                rooms:       make(map[string]*Room),
        }

        // 启动房间清理协程
        go rm.cleanupLoop()

        return rm
}

// SetOnRoomListUpdate 设置房间列表更新回调
func (rm *RoomManager) SetOnRoomListUpdate(callback func(actionType string, room *RoomListItem)) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        rm.onRoomListUpdate = callback
}

// SetOnGameEnd 设置游戏结束回调
func (rm *RoomManager) SetOnGameEnd(callback func(*Room)) {
        rm.mu.Lock()
        defer rm.mu.Unlock()
        rm.onGameEnd = callback
}
