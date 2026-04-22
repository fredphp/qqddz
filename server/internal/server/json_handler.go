package server

import (
        "encoding/json"
        "log"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        payloadconv "github.com/palemoky/fight-the-landlord/internal/protocol/convert/payload"
)

// EncodeToJSON 将 Protobuf 消息编码为 JSON 格式
func EncodeToJSON(msg *protocol.Message) ([]byte, error) {
        jsonData := JSONMessage{
                Type: string(msg.Type),
        }

        // 根据消息类型解析 payload
        if len(msg.Payload) > 0 {
                data, err := decodePayloadToJSON(msg.Type, msg.Payload)
                if err != nil {
                        log.Printf("[JSON] 解码 payload 失败: %v", err)
                        // 失败时直接使用原始 payload
                        jsonData.Data = msg.Payload
                } else {
                        jsonData.Data = data
                }
        }

        return json.Marshal(jsonData)
}

// decodePayloadToJSON 将 Protobuf payload 解码为 JSON 格式
func decodePayloadToJSON(msgType protocol.MessageType, payload []byte) (json.RawMessage, error) {
        switch msgType {
        // 连接相关
        case protocol.MsgConnected:
                var p protocol.ConnectedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgReconnected:
                var p protocol.ReconnectedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgError:
                var p protocol.ErrorPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPong:
                var p protocol.PongPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        // 玩家状态
        case protocol.MsgPlayerOffline:
                var p protocol.PlayerOfflinePayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayerOnline:
                var p protocol.PlayerOnlinePayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        // 房间相关
        case protocol.MsgRoomCreated:
                var p protocol.RoomCreatedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgRoomJoined:
                var p protocol.RoomJoinedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayerJoined:
                var p protocol.PlayerJoinedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayerLeft:
                var p protocol.PlayerLeftPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayerReady:
                var p protocol.PlayerReadyPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        // 游戏相关
        case protocol.MsgGameStart:
                var p protocol.GameStartPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgDealCards:
                var p protocol.DealCardsPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgBidTurn:
                var p protocol.BidTurnPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgBidResult:
                var p protocol.BidResultPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgLandlord:
                var p protocol.LandlordPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayTurn:
                var p protocol.PlayTurnPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgCardPlayed:
                var p protocol.CardPlayedPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgPlayerPass:
                var p protocol.PlayerPassPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgGameOver:
                var p protocol.GameOverPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgOnlineCount:
                var p protocol.OnlineCountPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        case protocol.MsgChat:
                var p protocol.ChatPayload
                if err := payloadconv.DecodePayload(msgType, payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)

        default:
                // 未知类型，尝试解码为通用 map
                var p map[string]interface{}
                if err := json.Unmarshal(payload, &p); err != nil {
                        return nil, err
                }
                return json.Marshal(p)
        }
}

// JSONMessage JSON 消息格式（兼容客户端）
type JSONMessage struct {
        Type      string          `json:"type"`
        Data      json.RawMessage `json:"data,omitempty"`
        CallIndex int64           `json:"callIndex,omitempty"`
        Result    int64           `json:"result,omitempty"`
}

// CardData 卡牌数据
type CardData struct {
        Suit  int64 `json:"suit"`
        Rank  int64 `json:"rank"`
        Color int64 `json:"color"`
}

// JSONMode 支持JSON模式的客户端
type JSONMode struct {
        client *Client
}

// NewJSONMode 创建JSON模式处理器
func NewJSONMode(client *Client) *JSONMode {
        return &JSONMode{client: client}
}

// TryHandleJSON 尝试处理JSON消息，返回是否为JSON消息
func (j *JSONMode) TryHandleJSON(message []byte) bool {
        // 检查是否为JSON格式（以 { 开头）
        if len(message) > 0 && message[0] == '{' {
                var msg JSONMessage
                if err := json.Unmarshal(message, &msg); err != nil {
                        return false
                }
                j.handleJSONMessage(&msg)
                return true
        }
        return false
}

func (j *JSONMode) handleJSONMessage(msg *JSONMessage) {
        log.Printf("[JSON] 收到消息: type=%s, callIndex=%d", msg.Type, msg.CallIndex)

        switch msg.Type {
        case "create_room":
                j.handleCreateRoom(msg)
        case "join_room":
                j.handleJoinRoom(msg)
        case "leave_room":
                j.handleLeaveRoom(msg)
        case "quick_match":
                j.handleQuickMatch(msg)
        case "ready":
                j.handleReady(msg)
        case "cancel_ready":
                j.handleCancelReady(msg)
        case "bid":
                j.handleBid(msg)
        case "play_cards":
                j.handlePlayCards(msg)
        case "pass":
                j.handlePass(msg)
        case "chat":
                j.handleChat(msg)
        default:
                log.Printf("[JSON] 未知消息类型: %s", msg.Type)
        }
}

// handleCreateRoom 创建房间
func (j *JSONMode) handleCreateRoom(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgCreateRoom, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleJoinRoom 加入房间
func (j *JSONMode) handleJoinRoom(msg *JSONMessage) {
        var data struct {
                RoomCode string `json:"room_code"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgJoinRoom, &protocol.JoinRoomPayload{
                RoomCode: data.RoomCode,
        })
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleLeaveRoom 离开房间
func (j *JSONMode) handleLeaveRoom(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgLeaveRoom, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleQuickMatch 快速匹配
func (j *JSONMode) handleQuickMatch(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgQuickMatch, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleReady 准备
func (j *JSONMode) handleReady(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgReady, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleCancelReady 取消准备
func (j *JSONMode) handleCancelReady(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgCancelReady, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleBid 叫地主
func (j *JSONMode) handleBid(msg *JSONMessage) {
        var data struct {
                Bid bool `json:"bid"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgBid, &protocol.BidPayload{
                Bid: data.Bid,
        })
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handlePlayCards 出牌
func (j *JSONMode) handlePlayCards(msg *JSONMessage) {
        var data struct {
                Cards []CardData `json:"cards"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        // 转换卡牌格式
        cards := make([]card.Card, len(data.Cards))
        for i, c := range data.Cards {
                cards[i] = card.Card{
                        Suit:  card.Suit(c.Suit),
                        Rank:  card.Rank(c.Rank),
                        Color: card.CardColor(c.Color),
                }
        }

        // 转换为proto格式
        cardInfos := make([]protocol.CardInfo, len(cards))
        for i, c := range cards {
                cardInfos[i] = protocol.CardInfo{
                        Suit:  int(c.Suit),
                        Rank:  int(c.Rank),
                        Color: int(c.Color),
                }
        }

        protoMsg, err := codec.NewMessage(protocol.MsgPlayCards, &protocol.PlayCardsPayload{
                Cards: cardInfos,
        })
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handlePass 不出
func (j *JSONMode) handlePass(msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgPass, nil)
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// handleChat 聊天
func (j *JSONMode) handleChat(msg *JSONMessage) {
        var data struct {
                Message string `json:"message"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgChat, &protocol.ChatPayload{
                Content: data.Message,
        })
        if err != nil {
                log.Printf("[JSON] 创建消息失败: %v", err)
                return
        }
        j.client.server.handler.Handle(j.client, protoMsg)
}

// JSONHandler JSON 消息处理器
type JSONHandler struct {
        server *Server
}

// NewJSONHandler 创建 JSON 处理器
func NewJSONHandler(server *Server) *JSONHandler {
        return &JSONHandler{server: server}
}

// HandleJSONMessage 处理 JSON 格式消息
func (h *JSONHandler) HandleJSONMessage(client *Client, data []byte) error {
        var msg JSONMessage
        if err := json.Unmarshal(data, &msg); err != nil {
                log.Printf("JSON 解析失败: %v", err)
                return err
        }

        log.Printf("收到 JSON 消息: type=%s, callIndex=%d", msg.Type, msg.CallIndex)

        // 根据消息类型分发处理
        switch msg.Type {
        case "create_room":
                h.handleCreateRoom(client, &msg)
        case "join_room":
                h.handleJoinRoom(client, &msg)
        case "leave_room":
                h.handleLeaveRoom(client, &msg)
        case "quick_match":
                h.handleQuickMatch(client, &msg)
        case "ready":
                h.handleReady(client, &msg)
        case "cancel_ready":
                h.handleCancelReady(client, &msg)
        case "bid":
                h.handleBid(client, &msg)
        case "play_cards":
                h.handlePlayCards(client, &msg)
        case "pass":
                h.handlePass(client, &msg)
        case "chat":
                h.handleChat(client, &msg)
        default:
                log.Printf("未知的消息类型: %s", msg.Type)
        }

        return nil
}

// handleCreateRoom 创建房间
func (h *JSONHandler) handleCreateRoom(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgCreateRoom, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleJoinRoom 加入房间
func (h *JSONHandler) handleJoinRoom(client *Client, msg *JSONMessage) {
        var data struct {
                RoomCode string `json:"room_code"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgJoinRoom, &protocol.JoinRoomPayload{
                RoomCode: data.RoomCode,
        })
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleLeaveRoom 离开房间
func (h *JSONHandler) handleLeaveRoom(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgLeaveRoom, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleQuickMatch 快速匹配
func (h *JSONHandler) handleQuickMatch(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgQuickMatch, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleReady 准备
func (h *JSONHandler) handleReady(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgReady, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleCancelReady 取消准备
func (h *JSONHandler) handleCancelReady(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgCancelReady, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleBid 叫地主
func (h *JSONHandler) handleBid(client *Client, msg *JSONMessage) {
        var data struct {
                Bid bool `json:"bid"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgBid, &protocol.BidPayload{
                Bid: data.Bid,
        })
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handlePlayCards 出牌
func (h *JSONHandler) handlePlayCards(client *Client, msg *JSONMessage) {
        var data struct {
                Cards []CardData `json:"cards"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        // 转换卡牌格式
        cardInfos := make([]protocol.CardInfo, len(data.Cards))
        for i, c := range data.Cards {
                cardInfos[i] = protocol.CardInfo{
                        Suit:  int(c.Suit),
                        Rank:  int(c.Rank),
                        Color: int(c.Color),
                }
        }

        protoMsg, err := codec.NewMessage(protocol.MsgPlayCards, &protocol.PlayCardsPayload{
                Cards: cardInfos,
        })
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handlePass 不出
func (h *JSONHandler) handlePass(client *Client, msg *JSONMessage) {
        protoMsg, err := codec.NewMessage(protocol.MsgPass, nil)
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// handleChat 聊天
func (h *JSONHandler) handleChat(client *Client, msg *JSONMessage) {
        var data struct {
                Message string `json:"message"`
        }
        if len(msg.Data) > 0 {
                _ = json.Unmarshal(msg.Data, &data)
        }

        protoMsg, err := codec.NewMessage(protocol.MsgChat, &protocol.ChatPayload{
                Content: data.Message,
        })
        if err != nil {
                log.Printf("创建消息失败: %v", err)
                return
        }
        h.server.handler.Handle(client, protoMsg)
}

// SendJSON 发送 JSON 消息
func (h *JSONHandler) SendJSON(client *Client, msgType string, data interface{}, callIndex int64) {
        dataBytes, err := json.Marshal(data)
        if err != nil {
                log.Printf("JSON 序列化失败: %v", err)
                return
        }

        msg := JSONMessage{
                Type:      msgType,
                Data:      dataBytes,
                CallIndex: callIndex,
        }

        msgBytes, err := json.Marshal(msg)
        if err != nil {
                log.Printf("JSON 消息序列化失败: %v", err)
                return
        }

        client.send <- outgoingMessage{data: msgBytes, isJSON: true}
}

// SendJSONResult 发送带结果的 JSON 消息
func (h *JSONHandler) SendJSONResult(client *Client, msgType string, result int64, data interface{}, callIndex int64) {
        dataBytes, err := json.Marshal(data)
        if err != nil {
                log.Printf("JSON 序列化失败: %v", err)
                return
        }

        msg := JSONMessage{
                Type:      msgType,
                Result:    result,
                Data:      dataBytes,
                CallIndex: callIndex,
        }

        msgBytes, err := json.Marshal(msg)
        if err != nil {
                log.Printf("JSON 消息序列化失败: %v", err)
                return
        }

        client.send <- outgoingMessage{data: msgBytes, isJSON: true}
}
