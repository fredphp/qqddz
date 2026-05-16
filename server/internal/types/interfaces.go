package types

import (
        "github.com/palemoky/fight-the-landlord/internal/protocol"
)

// ServerInterface 定义服务器接口（用于打破循环依赖）
type ServerInterface interface {
        IsMaintenanceMode() bool
        GetOnlineCount() int
        BroadcastToLobby(msg *protocol.Message)
        GetClientByID(id string) ClientInterface
        RegisterClient(id string, client ClientInterface)
        UnregisterClient(id string)
}

// ClientInterface 定义客户端接口
type ClientInterface interface {
        GetID() string
        GetName() string
        SetName(name string)        // 设置玩家昵称
        GetRoom() string
        SetRoom(code string)
        SendMessage(msg *protocol.Message)
        Close()
        GetCallIndex() int64
        SetCallIndex(index int64)
        GetPlayerID() uint64 // 获取数据库玩家ID
        SetPlayerID(id uint64) // 设置数据库玩家ID
        GetGold() int64      // 🔧【新增】获取玩家金币数量
        SetGold(gold int64)  // 🔧【新增】设置玩家金币数量
        IsRobot() bool       // 🔧【新增】判断是否是机器人客户端
        GetAvatar() string   // 🔧【新增】获取玩家头像URL
}

// ChatLimiter 聊天速率限制器接口
type ChatLimiter interface {
        AllowChat(clientID string) (allowed bool, reason string)
        ClearRateLimit(clientID string)
}

// =============================================
// 竞技场相关接口和类型（用于打破循环依赖）
// =============================================

// PhaseType 阶段类型
type PhaseType int

const (
        PhaseNone    PhaseType = iota // 不可用
        PhasePrepare                  // 准备阶段
        PhaseSignup                   // 报名阶段
)

// PeriodInfo 期号信息
type PeriodInfo struct {
        PeriodNo     string    // 期号，如 "C2605050001"
        Phase        PhaseType // 当前阶段
        StartTime    string    // 本期开始时间
        SignupEndTime string   // 报名截止时间
        TotalPlayers int       // 报名人数
        RoomConfigID uint64    // 房间配置ID
}

// ArenaProvider 竞技场提供者接口（用于打破循环依赖）
type ArenaProvider interface {
        // GetCurrentPeriodInfo 获取当前期号信息
        GetCurrentPeriodInfo(roomID uint64) *PeriodInfo
        // GetSignupList 获取报名列表
        GetSignupList(periodNo string) []uint64
        // AddPlayerToSignupList 添加玩家到报名列表
        AddPlayerToSignupList(periodNo string, playerID uint64) error
        // RemovePlayerFromSignupList 从报名列表移除玩家
        RemovePlayerFromSignupList(periodNo string, playerID uint64) error
        // 🔧【新增】进入阶段相关方法
        // HandlePlayerEnter 处理玩家点击"进入"按钮
        HandlePlayerEnter(periodNo string, playerID uint64) error
        // HandlePlayerCancelEnter 处理玩家点击"取消"按钮（返还竞技币）
        HandlePlayerCancelEnter(periodNo string, playerID uint64) (int64, error)
        // 🔧【新增】OnPlayerReconnect 处理玩家重连时恢复竞技场状态
        OnPlayerReconnect(playerID uint64, client ClientInterface)
        // 🔧【新增】OnNewClient 处理新客户端连接或主动请求竞技场状态
        OnNewClient(playerID uint64)
}

// ArenaQueueProvider 竞技场队列提供者接口
type ArenaQueueProvider interface {
        // PushSignupLog 推送报名日志
        PushSignupLog(periodNo string, roomID, playerID uint64, signupFee, balanceBefore, balanceAfter int64) bool
        // PushCancelLog 推送取消日志
        PushCancelLog(periodNo string, roomID, playerID uint64, signupFee, balanceBefore, balanceAfter int64) bool
}

// ArenaServer 竞技场服务器接口（组合接口）
type ArenaServer interface {
        ServerInterface
        // GetArenaBroadcaster 获取竞技场广播器
        GetArenaBroadcaster() ArenaProvider
}

// =============================================
// 赛事进度管理器接口（用于打破 session 和 server 包的循环依赖）
// =============================================

// TournamentProgressAccessor 赛事进度访问器接口
// 用于 session 包访问 TournamentProgressManager 的功能
type TournamentProgressAccessor interface {
        // UpdateTableFinished 更新桌完成状态
        // 返回值: (是否全部完成, 已完成桌数, 总桌数)
        UpdateTableFinished(periodNo string, round int, tableID uint64, playerIDs []string) (bool, int, int)
        // AdvanceRound 推进到下一轮
        // 返回值: 是否成功推进
        AdvanceRound(periodNo string, newTotalTables int, playerIDs []string) bool
}

// ArenaRoomCreator 竞技场房间创建器接口
// 用于 session 包访问 ArenaStatusBroadcaster 的房间创建功能
type ArenaRoomCreator interface {
        // CreateRoomsForNextRound 为下一轮创建房间
        CreateRoomsForNextRound(periodNo string, roomConfigID uint64, playerIDs []uint64, nextRound int)
}

// 全局赛事进度访问器
var globalTournamentProgress TournamentProgressAccessor

// 全局竞技场房间创建器
var globalArenaRoomCreator ArenaRoomCreator

// SetGlobalTournamentProgress 设置全局赛事进度访问器
func SetGlobalTournamentProgress(accessor TournamentProgressAccessor) {
        globalTournamentProgress = accessor
}

// GetGlobalTournamentProgress 获取全局赛事进度访问器
func GetGlobalTournamentProgress() TournamentProgressAccessor {
        return globalTournamentProgress
}

// SetGlobalArenaRoomCreator 设置全局竞技场房间创建器
func SetGlobalArenaRoomCreator(creator ArenaRoomCreator) {
        globalArenaRoomCreator = creator
}

// GetGlobalArenaRoomCreator 获取全局竞技场房间创建器
func GetGlobalArenaRoomCreator() ArenaRoomCreator {
        return globalArenaRoomCreator
}
