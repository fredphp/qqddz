package api

import (
        "log"
        "sync"

        "github.com/palemoky/fight-the-landlord/internal/server"
)

// WSManager WebSocket服务器管理器
// 用于在API服务和WebSocket服务之间共享服务器实例
var wsManager = &WSManager{}

// WSManager WebSocket服务器管理器
type WSManager struct {
        server *server.Server
        mu     sync.RWMutex
}

// SetWSServer 设置WebSocket服务器实例
func SetWSServer(s *server.Server) {
        wsManager.mu.Lock()
        defer wsManager.mu.Unlock()
        wsManager.server = s
}

// GetWSServer 获取WebSocket服务器实例
func GetWSServer() *server.Server {
        wsManager.mu.RLock()
        defer wsManager.mu.RUnlock()
        return wsManager.server
}

// ForceLogoutPlayer 强制玩家下线
// 返回: 是否成功发送下线消息（玩家可能不在线）
func ForceLogoutPlayer(playerID, reason string) bool {
        s := GetWSServer()
        if s == nil {
                return false
        }
        return s.ForceLogoutPlayer(playerID, reason)
}

// ForceLogoutAllPlayers 强制所有玩家下线
func ForceLogoutAllPlayers(reason string) {
        s := GetWSServer()
        if s == nil {
                return
        }
        s.ForceLogoutAllPlayers(reason)
}

// IsPlayerOnline 检查玩家是否在线
func IsPlayerOnline(playerID string) bool {
        s := GetWSServer()
        if s == nil {
                return false
        }
        return s.GetClientByPlayerID(playerID) != nil
}

// GetOnlineCount 获取在线人数
func GetOnlineCount() int {
        s := GetWSServer()
        if s == nil {
                return 0
        }
        return s.GetOnlineCount()
}

// TriggerArenaBroadcast 触发立即广播竞技场状态
// 用于报名/取消报名后立即通知所有客户端
// roomID: 指定要广播的房间ID，如果为0则广播所有房间
func TriggerArenaBroadcast(roomID uint64) {
        s := GetWSServer()
        if s == nil {
                log.Printf("⚠️ [TriggerArenaBroadcast] WebSocket服务器未初始化，无法广播 roomID=%d", roomID)
                return
        }
        log.Printf("🔔 [TriggerArenaBroadcast] 触发广播 roomID=%d", roomID)
        s.TriggerArenaBroadcast(roomID)
}
