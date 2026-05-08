package server

import (
        "log"
        "math/rand/v2"
        "sync"
        "time"

        "github.com/google/uuid"
        "github.com/gorilla/websocket"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/server/session"
)

const (
        writeWait      = 10 * time.Second    // 写入超时
        pongWait       = 60 * time.Second    // 读取超时（pong 等待时间）
        pingPeriod     = (pongWait * 9) / 10 // ping 发送间隔（必须小于 pongWait）
        maxMessageSize = 4096                // 消息最大大小
)

// 昵称词库
var (
        adjectives = []string{
                "勇敢的", "聪明的", "快乐的", "神秘的", "酷炫的",
                "优雅的", "可爱的", "威武的", "沉稳的", "活泼的",
                "机智的", "潇洒的", "温柔的", "霸气的", "淡定的",
                "闪亮的", "迷人的", "傲娇的", "呆萌的", "高冷的",
        }

        nouns = []string{
                "小鸡", "熊猫", "老虎", "狮子", "猴子",
                "兔子", "狐狸", "海豚", "企鹅", "考拉",
                "柯基", "柴犬", "布偶", "龙猫", "仓鼠",
                "刺猬", "松鼠", "浣熊", "水獭", "羊驼",
        }
)

// GenerateNickname 生成随机昵称
func GenerateNickname() string {
        adj := adjectives[rand.IntN(len(adjectives))]
        noun := nouns[rand.IntN(len(nouns))]
        return adj + noun
}

// outgoingMessage 发送消息包装
type outgoingMessage struct {
        data     []byte
        isJSON   bool
}

// Client 代表一个连接的玩家
type Client struct {
        ID         string // 玩家唯一 ID
        Name       string // 玩家昵称
        RoomID     string // 当前所在房间 ID
        IP         string // 客户端 IP 地址
        PlayerID   uint64 // 数据库玩家ID
        Gold       int64  // 🔧【新增】玩家金币数量（从数据库缓存）

        server *Server
        conn   *websocket.Conn
        send   chan outgoingMessage

        mu               sync.RWMutex
        closed           bool
        jsonMode         *JSONMode                // JSON模式处理器
        useJSON          bool                     // 是否使用JSON模式
        pendingConnected bool                     // 是否需要发送 connected 消息
        playerSession    *session.PlayerSession   // 会话信息（延迟发送 connected 时使用）
        callIndex        int64                    // 当前请求的 callIndex（用于 JSON 模式响应）
}

// NewClient 创建新客户端
func NewClient(s *Server, conn *websocket.Conn) *Client {
        c := &Client{
                ID:     uuid.New().String(),
                Name:   GenerateNickname(),
                server: s,
                conn:   conn,
                send:   make(chan outgoingMessage, 256),
        }
        c.jsonMode = NewJSONMode(c)
        return c
}

// ReadPump 从 WebSocket 读取消息
func (c *Client) ReadPump() {
        defer func() {
                c.handleDisconnect()
                _ = c.conn.Close()
        }()

        c.conn.SetReadLimit(maxMessageSize)
        _ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
        c.conn.SetPongHandler(func(string) error {
                _ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
                return nil
        })

        for {
                messageType, message, err := c.conn.ReadMessage()
                if err != nil {
                        if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                                log.Printf("读取错误: %v", err)
                        }
                        break
                }

                // 【重要】先检测是否为 JSON 消息，在发送 connected 之前设置 useJSON
                // 这样 connected 消息就会使用正确的格式（JSON）发送
                if messageType == websocket.TextMessage {
                        if c.jsonMode.TryHandleJSON(message) {
                                c.useJSON = true
                        }
                }

                // 如果是第一条消息，发送 connected 消息
                // 此时 useJSON 已经被正确设置
                if c.pendingConnected {
                        c.sendConnectedMessage()
                        c.pendingConnected = false
                }

                // 如果是 JSON 消息，已经处理过了，继续下一条
                if c.useJSON && messageType == websocket.TextMessage {
                        continue
                }

                // 消息速率限制检查
                allowed, warning := c.server.messageLimiter.AllowMessage(c.ID)
                if !allowed {
                        log.Printf("⚠️ 客户端 %s (IP: %s) 消息过于频繁", c.Name, c.IP)
                        c.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeRateLimit, "消息发送过于频繁"))
                        if c.server.messageLimiter.GetWarningCount(c.ID) > 5 {
                                log.Printf("🚫 客户端 %s 因多次超速被断开连接", c.Name)
                                break
                        }
                        continue
                }
                if warning {
                        c.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeRateLimit, "请求过于频繁，请放慢速度"))
                }

                // 解析二进制消息
                msg, err := codec.Decode(message)
                if err != nil {
                        log.Printf("消息解析错误: %v", err)
                        c.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                        continue
                }

                // 交给处理器处理
                c.server.handler.Handle(c, msg)
                codec.PutMessage(msg)
        }
}

// sendConnectedMessage 发送连接成功消息
func (c *Client) sendConnectedMessage() {
        if c.playerSession == nil {
                return
        }
        c.SendMessage(codec.MustNewMessage(protocol.MsgConnected, &protocol.ConnectedPayload{
                PlayerID:       c.ID,
                PlayerName:     c.Name,
                ReconnectToken: c.playerSession.ReconnectToken,
        }))
}

// WritePump 向 WebSocket 写入消息
func (c *Client) WritePump() {
        ticker := time.NewTicker(pingPeriod)
        defer func() {
                ticker.Stop()
                _ = c.conn.Close()
        }()

        for {
                select {
                case msg, ok := <-c.send:
                        _ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
                        if !ok {
                                // 通道已关闭
                                _ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
                                return
                        }

                        // 根据消息类型选择发送方式
                        msgType := websocket.BinaryMessage
                        if msg.isJSON {
                                msgType = websocket.TextMessage
                        }

                        w, err := c.conn.NextWriter(msgType)
                        if err != nil {
                                return
                        }
                        _, _ = w.Write(msg.data)

                        if err := w.Close(); err != nil {
                                return
                        }

                case <-ticker.C:
                        _ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
                        if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                                return
                        }
                }
        }
}

// SendMessage 发送消息给客户端
// 注意：对于请求-响应模式的消息，callIndex 会在发送后清除
// 对于广播消息，callIndex 为 0
func (c *Client) SendMessage(msg *protocol.Message) {
        c.mu.RLock()
        if c.closed {
                c.mu.RUnlock()
                return
        }
        c.mu.RUnlock()

        var data []byte
        var err error
        isJSON := c.useJSON

        if isJSON {
                // JSON 模式：使用 JSON 编码
                // 获取当前 callIndex 并立即清除（避免广播消息使用错误的 callIndex）
                callIndex := c.getAndClearCallIndex()
                data, err = EncodeToJSONWithCallIndex(msg, callIndex)
                if err != nil {
                        log.Printf("JSON 编码错误: %v", err)
                        return
                }
        } else {
                // Protobuf 模式：使用 Protobuf 编码
                data, err = codec.Encode(msg)
                if err != nil {
                        log.Printf("消息编码错误: %v", err)
                        return
                }
        }

        select {
        case c.send <- outgoingMessage{data: data, isJSON: isJSON}:
        default:
                // 发送缓冲区已满，关闭连接
                log.Printf("客户端 %s 发送缓冲区已满", c.ID)
                c.Close()
        }
}

// getAndClearCallIndex 获取并清除 callIndex（线程安全）
func (c *Client) getAndClearCallIndex() int64 {
        c.mu.Lock()
        defer c.mu.Unlock()
        index := c.callIndex
        c.callIndex = 0  // 清除 callIndex，避免广播消息使用错误的值
        return index
}

// handleDisconnect 处理断开连接
func (c *Client) handleDisconnect() {
        // 标记会话为离线状态
        c.server.sessionManager.SetOffline(c.ID)

        // 如果在房间中，通知房间玩家掉线（但不移除）
        if c.RoomID != "" {
                c.server.roomManager.NotifyPlayerOffline(c)
        }

        // 如果在匹配队列中，移除
        c.server.matcher.RemoveFromQueue(c)

        // 从服务器注销连接（但保留会话）
        c.server.unregisterClient(c)
}

// Close 关闭客户端连接
func (c *Client) Close() {
        c.mu.Lock()
        defer c.mu.Unlock()

        if !c.closed {
                c.closed = true
                close(c.send)
        }
}

// SetRoom 设置客户端所在房间
func (c *Client) SetRoom(roomID string) {
        c.mu.Lock()
        defer c.mu.Unlock()
        c.RoomID = roomID
}

// GetRoom 获取客户端所在房间
func (c *Client) GetRoom() string {
        c.mu.RLock()
        defer c.mu.RUnlock()
        return c.RoomID
}

// Interface implementations for types.ClientInterface
func (c *Client) GetID() string       { return c.ID }
func (c *Client) GetName() string     { return c.Name }
func (c *Client) GetPlayerID() uint64 { return c.PlayerID }
func (c *Client) GetGold() int64      { return c.Gold } // 🔧【新增】获取玩家金币

// SetName 设置玩家昵称
func (c *Client) SetName(name string) {
        c.mu.Lock()
        defer c.mu.Unlock()
        c.Name = name
}

// SetPlayerID 设置数据库玩家ID
func (c *Client) SetPlayerID(id uint64) {
        c.mu.Lock()
        defer c.mu.Unlock()
        c.PlayerID = id
}

// SetGold 设置玩家金币数量
func (c *Client) SetGold(gold int64) {
        c.mu.Lock()
        defer c.mu.Unlock()
        c.Gold = gold
}

// SetCallIndex 设置当前请求的 callIndex（用于 JSON 模式响应）
func (c *Client) SetCallIndex(index int64) {
        c.mu.Lock()
        defer c.mu.Unlock()
        c.callIndex = index
}

// GetCallIndex 获取当前请求的 callIndex
func (c *Client) GetCallIndex() int64 {
        c.mu.RLock()
        defer c.mu.RUnlock()
        return c.callIndex
}

// IsRobot 判断是否是机器人客户端（普通客户端返回 false）
func (c *Client) IsRobot() bool {
        return false
}
