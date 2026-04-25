package api

import (
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
