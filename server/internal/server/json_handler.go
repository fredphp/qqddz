package server

import (
	"encoding/json"
	"log"
)

// JSONMessage JSON 消息格式（兼容客户端）
type JSONMessage struct {
	Type      string          `json:"type"`
	Data      json.RawMessage `json:"data,omitempty"`
	CallIndex int64           `json:"callIndex,omitempty"`
	Result    int64           `json:"result,omitempty"`
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
