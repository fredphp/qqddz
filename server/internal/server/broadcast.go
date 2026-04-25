package server

import (
        "log"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
)

// GetOnlineCount 获取在线人数（按需调用）
func (s *Server) GetOnlineCount() int {
        s.clientsMu.RLock()
        defer s.clientsMu.RUnlock()
        return len(s.clients)
}

// Broadcast 广播消息给所有客户端
func (s *Server) Broadcast(msg *protocol.Message) {
        s.clientsMu.RLock()
        defer s.clientsMu.RUnlock()

        for _, client := range s.clients {
                client.SendMessage(msg)
        }
}

// BroadcastToLobby 广播消息给大厅玩家（未在房间内的玩家）
func (s *Server) BroadcastToLobby(msg *protocol.Message) {
        s.clientsMu.RLock()
        defer s.clientsMu.RUnlock()

        for _, client := range s.clients {
                if client.GetRoom() == "" {
                        client.SendMessage(msg)
                }
        }
}

// GetClientByPlayerID 根据玩家ID获取客户端连接
func (s *Server) GetClientByPlayerID(playerID string) *Client {
        s.clientsMu.RLock()
        defer s.clientsMu.RUnlock()
        return s.clients[playerID]
}

// ForceLogoutPlayer 强制玩家下线
// playerID: 玩家ID
// reason: 下线原因
func (s *Server) ForceLogoutPlayer(playerID, reason string) bool {
        log.Printf("🚫 强制下线请求 - PlayerID: %s, Reason: %s", playerID, reason)

        client := s.GetClientByPlayerID(playerID)
        if client == nil {
                log.Printf("⚠️ 玩家不在线 - PlayerID: %s", playerID)
                return false
        }

        // 发送强制下线消息
        msg, err := codec.NewMessage(protocol.MsgForceLogout, &protocol.ForceLogoutPayload{
                PlayerID: playerID,
                Reason:   reason,
                Time:     time.Now().UnixMilli(),
        })
        if err != nil {
                log.Printf("❌ 创建强制下线消息失败: %v", err)
                return false
        }

        client.SendMessage(msg)
        log.Printf("✅ 强制下线消息已发送 - PlayerID: %s", playerID)

        // 延迟关闭连接（给客户端时间处理消息）
        go func() {
                time.Sleep(500 * time.Millisecond)
                client.Close()
        }()

        return true
}

// ForceLogoutAllPlayers 强制所有玩家下线（维护模式用）
func (s *Server) ForceLogoutAllPlayers(reason string) {
        s.clientsMu.RLock()
        defer s.clientsMu.RUnlock()

        log.Printf("🚫 强制所有玩家下线 - Reason: %s, 在线人数: %d", reason, len(s.clients))

        for _, client := range s.clients {
                msg, _ := codec.NewMessage(protocol.MsgForceLogout, &protocol.ForceLogoutPayload{
                        PlayerID: client.ID,
                        Reason:   reason,
                        Time:     time.Now().UnixMilli(),
                })
                client.SendMessage(msg)

                go func(c *Client) {
                        time.Sleep(500 * time.Millisecond)
                        c.Close()
                }(client)
        }
}
