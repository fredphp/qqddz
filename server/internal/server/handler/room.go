package handler

import (
        "errors"
        "log"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/types"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
)

// handleCreateRoom 处理创建房间
func (h *Handler) handleCreateRoom(client types.ClientInterface, msg *protocol.Message) {
        // 维护模式检查
        if h.server.IsMaintenanceMode() {
                client.SendMessage(codec.NewErrorMessageWithText(
                        protocol.ErrCodeServerMaintenance, "服务器维护中，暂停创建房间"))
                return
        }

        // 🔧【调试】打印玩家信息
        log.Printf("🏠 [handleCreateRoom] 玩家信息: ID=%s, Name=%s, PlayerID=%d, Gold=%d",
                client.GetID(), client.GetName(), client.GetPlayerID(), client.GetGold())

        // 解析消息获取房间配置ID
        var roomConfigID uint64 = 0
        if msg != nil {
                payload, err := codec.ParsePayload[protocol.CreateRoomPayload](msg)
                if err == nil && payload != nil {
                        roomConfigID = payload.RoomConfigID
                }
        }

        // 如果已在房间中，先离开
        if client.GetRoom() != "" {
                h.roomManager.LeaveRoom(client)
        }

        room, err := h.roomManager.CreateRoom(client, roomConfigID)
        if err != nil {
                client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, err.Error()))
                return
        }

        if room == nil {
                client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, "创建房间失败"))
                return
        }

        // 🔧【调试】获取玩家信息并打印
        playerInfo := room.GetPlayerInfo(client.GetID())
        log.Printf("🏠 [handleCreateRoom] RoomCreatedPayload: RoomCode=%s, Player.ID=%s, Player.Name=%s, Player.GoldCount=%d",
                room.Code, playerInfo.ID, playerInfo.Name, playerInfo.GoldCount)

        client.SendMessage(codec.MustNewMessage(protocol.MsgRoomCreated, &protocol.RoomCreatedPayload{
                RoomCode: room.Code,
                Player:   playerInfo,
        }))
}

// handleJoinRoom 处理加入房间
func (h *Handler) handleJoinRoom(client types.ClientInterface, msg *protocol.Message) {
        // 维护模式检查
        if h.server.IsMaintenanceMode() {
                client.SendMessage(codec.NewErrorMessageWithText(
                        protocol.ErrCodeServerMaintenance, "服务器维护中，暂停加入房间"))
                return
        }

        payload, err := codec.ParsePayload[protocol.JoinRoomPayload](msg)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        log.Printf("📥 [JoinRoom] 玩家 %s (ID: %s) 请求加入房间 %s", client.GetName(), client.GetID(), payload.RoomCode)

        // 如果已在房间中，先离开
        if client.GetRoom() != "" {
                h.roomManager.LeaveRoom(client)
        }

        room, err := h.roomManager.JoinRoom(client, payload.RoomCode)
        if err != nil {
                var gameErr *apperrors.GameError
                if errors.As(err, &gameErr) {
                        client.SendMessage(codec.NewErrorMessage(gameErr.Code))
                } else {
                        client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, err.Error()))
                }
                return
        }

        if room == nil {
                client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, "加入房间失败"))
                return
        }

        // 获取所有玩家信息
        allPlayers := room.GetAllPlayersInfo()
        currentPlayer := room.GetPlayerInfo(client.GetID())

        log.Printf("📤 [JoinRoom] 发送 room_joined 给玩家 %s", client.GetName())
        log.Printf("📤 [JoinRoom] 房间号: %s", room.Code)
        log.Printf("📤 [JoinRoom] 房主ID (CreatorID): %s", room.CreatorID)
        log.Printf("📤 [JoinRoom] 当前玩家: ID=%s, Name=%s, Seat=%d, Gold=%d", currentPlayer.ID, currentPlayer.Name, currentPlayer.Seat, currentPlayer.GoldCount)
        log.Printf("📤 [JoinRoom] 房间内所有玩家 (%d 人):", len(allPlayers))
        for i, p := range allPlayers {
                log.Printf("   [%d] ID=%s, Name=%s, Seat=%d, Ready=%v, Gold=%d", i, p.ID, p.Name, p.Seat, p.Ready, p.GoldCount)
        }

        client.SendMessage(codec.MustNewMessage(protocol.MsgRoomJoined, &protocol.RoomJoinedPayload{
                RoomCode:     room.Code,
                Player:       currentPlayer,
                Players:      allPlayers,
                CreatorID:    room.CreatorID, // 返回房主ID
                RoomCategory: room.RoomCategory, // 🔧【新增】房间分类
                PeriodNo:     room.PeriodNo,     // 🔧【新增】期号
        }))
}

// handleLeaveRoom 处理离开房间
func (h *Handler) handleLeaveRoom(client types.ClientInterface) {
        h.roomManager.LeaveRoom(client)
}

// handleQuickMatch 处理快速匹配
func (h *Handler) handleQuickMatch(client types.ClientInterface) {
        // 维护模式检查
        if h.server.IsMaintenanceMode() {
                client.SendMessage(codec.NewErrorMessageWithText(
                        protocol.ErrCodeServerMaintenance, "服务器维护中，暂停快速匹配"))
                return
        }

        // 如果已在房间中，先离开
        if client.GetRoom() != "" {
                h.roomManager.LeaveRoom(client)
        }

        h.matcher.AddToQueue(client)
}

// handleReady 处理准备
func (h *Handler) handleReady(client types.ClientInterface, ready bool) {
        err := h.roomManager.SetPlayerReady(client, ready)
        if err != nil {
                var gameErr *apperrors.GameError
                if errors.As(err, &gameErr) {
                        client.SendMessage(codec.NewErrorMessage(gameErr.Code))
                } else {
                        client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, err.Error()))
                }
        }
}
