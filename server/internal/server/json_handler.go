package server

import (
	"encoding/json"
	"log"

	"github.com/palemoky/fight-the-landlord/internal/game/card"
	"github.com/palemoky/fight-the-landlord/internal/protocol"
	"github.com/palemoky/fight-the-landlord/internal/protocol/codec"
)

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
	protoMsg := codec.NewMessage(protocol.MsgTypeCreateRoom, nil)
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

	protoMsg := codec.NewMessage(protocol.MsgTypeJoinRoom, &protocol.JoinRoomPayload{
		RoomCode: data.RoomCode,
	})
	h.server.handler.Handle(client, protoMsg)
}

// handleLeaveRoom 离开房间
func (h *JSONHandler) handleLeaveRoom(client *Client, msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeLeaveRoom, nil)
	h.server.handler.Handle(client, protoMsg)
}

// handleQuickMatch 快速匹配
func (h *JSONHandler) handleQuickMatch(client *Client, msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeQuickMatch, nil)
	h.server.handler.Handle(client, protoMsg)
}

// handleReady 准备
func (h *JSONHandler) handleReady(client *Client, msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeReady, nil)
	h.server.handler.Handle(client, protoMsg)
}

// handleCancelReady 取消准备
func (h *JSONHandler) handleCancelReady(client *Client, msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypeCancelReady, nil)
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

	protoMsg := codec.NewMessage(protocol.MsgTypeBid, &protocol.BidPayload{
		Bid: data.Bid,
	})
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
	h.server.handler.Handle(client, protoMsg)
}

// handlePass 不出
func (h *JSONHandler) handlePass(client *Client, msg *JSONMessage) {
	protoMsg := codec.NewMessage(protocol.MsgTypePass, nil)
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

	protoMsg := codec.NewMessage(protocol.MsgTypeChat, &protocol.ChatPayload{
		Message: data.Message,
	})
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

	client.send <- msgBytes
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

	client.send <- msgBytes
}
