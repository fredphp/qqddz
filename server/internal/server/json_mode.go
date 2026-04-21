package server

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"

	"github.com/palemoky/fight-the-landlord/internal/game/card"
	"github.com/palemoky/fight-the-landlord/internal/protocol"
	"github.com/palemoky/fight-the-landlord/internal/protocol/codec"
)

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

// JSONMessage JSON消息结构
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
	// 调用原有处理器
	protoMsg := codec.NewMessage(protocol.MsgTypeCreateRoom, nil)
	j.client.server.handler.Handle(j.client, protoMsg)

	// 发送JSON响应
	// 实际响应由原处理器发送，这里我们拦截并转换为JSON
}

// handleJoinRoom 加入房间
func (j *JSONMode) handleJoinRoom(msg *JSONMessage) {
	var data struct {
		RoomCode string `json:"room_code"`
	}
	if len(msg.Data) > 0 {
		_ = json.Unmarshal(msg.Data, &data)
	}

	// 调用原有处理器
	protoMsg := codec.NewMessage(protocol.MsgTypeJoinRoom, &protocol.JoinRoomPayload{
		RoomCode: data.RoomCode,
	})
	j.client.server.handler.Handle(j.client, protoMsg)
}

// handleLeaveRoom 离开房间
func (j *JSONMode) handleLeaveRoom(msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeLeaveRoom, nil)
	j.client.server.handler.Handle(j.client, protoMsg)
}

// handleQuickMatch 快速匹配
func (j *JSONMode) handleQuickMatch(msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeQuickMatch, nil)
	j.client.server.handler.Handle(j.client, protoMsg)
}

// handleReady 准备
func (j *JSONMode) handleReady(msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeReady, nil)
	j.client.server.handler.Handle(j.client, protoMsg)
}

// handleCancelReady 取消准备
func (j *JSONMode) handleCancelReady(msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeCancelReady, nil)
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

	protoMsg := codec.NewMessage(protocol.MsgTypeBid, &protocol.BidPayload{
		Bid: data.Bid,
	})
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
	cardInfos := make([]*protocol.CardInfo, len(cards))
	for i, c := range cards {
		cardInfos[i] = &protocol.CardInfo{
			Suit:  int64(c.Suit),
			Rank:  int64(c.Rank),
			Color: int64(c.Color),
		}
	}

	protoMsg := codec.NewMessage(protocol.MsgTypePlayCards, &protocol.PlayCardsPayload{
		Cards: cardInfos,
	})
	j.client.server.handler.Handle(j.client, protoMsg)
}

// handlePass 不出
func (j *JSONMode) handlePass(msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypePass, nil)
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

	protoMsg := codec.NewMessage(protocol.MsgTypeChat, &protocol.ChatPayload{
		Message: data.Message,
	})
	j.client.server.handler.Handle(j.client, protoMsg)
}

// SendJSON 发送JSON消息
func (j *JSONMode) SendJSON(msgType string, data interface{}, callIndex int64) {
	dataBytes, _ := json.Marshal(data)
	msg := JSONMessage{
		Type:      msgType,
		Data:      dataBytes,
		CallIndex: callIndex,
	}
	msgBytes, _ := json.Marshal(msg)

	j.client.mu.RLock()
	if !j.client.closed {
		_ = j.client.conn.SetWriteDeadline(writeWait)
		_ = j.client.conn.WriteMessage(websocket.TextMessage, msgBytes)
	}
	j.client.mu.RUnlock()
}

// SendJSONResult 发送带结果的JSON消息
func (j *JSONMode) SendJSONResult(msgType string, result int64, data interface{}, callIndex int64) {
	dataBytes, _ := json.Marshal(data)
	msg := JSONMessage{
		Type:      msgType,
		Result:    result,
		Data:      dataBytes,
		CallIndex: callIndex,
	}
	msgBytes, _ := json.Marshal(msg)

	j.client.mu.RLock()
	if !j.client.closed {
		_ = j.client.conn.SetWriteDeadline(writeWait)
		_ = j.client.conn.WriteMessage(websocket.TextMessage, msgBytes)
	}
	j.client.mu.RUnlock()
}
