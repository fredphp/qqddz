package handler

import (
        "errors"
        "log"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/types"

        "github.com/palemoky/fight-the-landlord/internal/apperrors"
)

// sendGameError 统一处理游戏错误并发送给客户端
func sendGameError(client types.ClientInterface, err error) {
        if gameErr, ok := errors.AsType[*apperrors.GameError](err); ok {
                client.SendMessage(codec.NewErrorMessage(gameErr.Code))
        } else {
                client.SendMessage(codec.NewErrorMessageWithText(protocol.ErrCodeUnknown, err.Error()))
        }
}

// handleCallLandlord 处理抢地主（新版统一接口）
func (h *Handler) handleCallLandlord(client types.ClientInterface, msg *protocol.Message) {
        payload, err := codec.ParsePayload[protocol.CallLandlordActionPayload](msg)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        if h.roomManager == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        if err := gameSession.HandleCallLandlord(client.GetID(), payload.Action); err != nil {
                sendGameError(client, err)
        }
}

// handleBid 处理叫地主（兼容旧版客户端）
func (h *Handler) handleBid(client types.ClientInterface, msg *protocol.Message) {
        payload, err := codec.ParsePayload[protocol.BidPayload](msg)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        if h.roomManager == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        if err := gameSession.HandleBid(client.GetID(), payload.Bid); err != nil {
                sendGameError(client, err)
        }
}

// handleRob 处理抢地主（兼容旧版客户端）
func (h *Handler) handleRob(client types.ClientInterface, msg *protocol.Message) {
        payload, err := codec.ParsePayload[protocol.RobPayload](msg)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        if h.roomManager == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        if err := gameSession.HandleRob(client.GetID(), payload.Rob); err != nil {
                sendGameError(client, err)
        }
}

// handlePlayCards 处理出牌
func (h *Handler) handlePlayCards(client types.ClientInterface, msg *protocol.Message) {
        payload, err := codec.ParsePayload[protocol.PlayCardsPayload](msg)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        if h.roomManager == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        if err := gameSession.HandlePlayCards(client.GetID(), payload.Cards); err != nil {
                sendGameError(client, err)
        }
}

// handlePass 处理不出
func (h *Handler) handlePass(client types.ClientInterface) {
        if h.roomManager == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        if err := gameSession.HandlePass(client.GetID()); err != nil {
                sendGameError(client, err)
        }
}

// handleHint 处理提示请求
func (h *Handler) handleHint(client types.ClientInterface) {
        log.Printf("🎮 [handleHint] 收到提示请求，玩家: %s, 房间: %s", client.GetName(), client.GetRoom())

        if h.roomManager == nil {
                log.Printf("🎮 [handleHint] roomManager 为空")
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                log.Printf("🎮 [handleHint] 房间为空")
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotInRoom))
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                log.Printf("🎮 [handleHint] 游戏会话为空")
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeGameNotStart))
                return
        }

        hintCards, err := gameSession.HandleHint(client.GetID())
        if err != nil {
                log.Printf("🎮 [handleHint] HandleHint 错误: %v", err)
                sendGameError(client, err)
                return
        }

        log.Printf("🎮 [handleHint] 提示牌数量: %d", len(hintCards))

        // 转换为 CardInfo
        cardInfos := make([]protocol.CardInfo, len(hintCards))
        for i, c := range hintCards {
                cardInfos[i] = protocol.CardInfo{
                        Suit:  int(c.Suit),
                        Rank:  int(c.Rank),
                        Value: calculateCardValue(int(c.Rank)),
                        Color: int(c.Color),
                }
                // 为大小王设置 king 字段
                if c.Rank == 16 { // 小王
                        cardInfos[i].King = "14"
                }
                if c.Rank == 17 { // 大王
                        cardInfos[i].King = "15"
                }
        }

        log.Printf("🎮 [handleHint] 发送提示结果: %d 张牌", len(cardInfos))
        client.SendMessage(codec.MustNewMessage(protocol.MsgHintResult, &protocol.HintResultPayload{
                Cards: cardInfos,
                Index: 0,
                Total: 1,
        }))
}

// calculateCardValue 计算牌力值（用于排序）
// 斗地主标准排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
func calculateCardValue(rank int) int {
        switch rank {
        case 17: // 大王
                return 16
        case 16: // 小王
                return 15
        case 15: // 2
                return 13
        case 14: // A
                return 12
        case 13: // K
                return 11
        case 12: // Q
                return 10
        case 11: // J
                return 9
        case 10: // 10
                return 8
        case 9: // 9
                return 7
        case 8: // 8
                return 6
        case 7: // 7
                return 5
        case 6: // 6
                return 4
        case 5: // 5
                return 3
        case 4: // 4
                return 2
        case 3: // 3
                return 1
        default:
                return 0
        }
}

// handleCancelTrustee 处理取消托管请求
// 当用户在屏幕上活动时触发，停止机器人自动操作，让玩家恢复手动控制
func (h *Handler) handleCancelTrustee(client types.ClientInterface, _ *protocol.Message) {
        log.Printf("[TRUSTEE] 收到取消托管请求，玩家: %s, 房间: %s", client.GetName(), client.GetRoom())

        if h.roomManager == nil {
                log.Printf("[TRUSTEE] roomManager 为空")
                return
        }

        room := h.roomManager.GetRoom(client.GetRoom())
        if room == nil {
                log.Printf("[TRUSTEE] 房间为空")
                return
        }

        gameSession := h.GetGameSession(room.Code)
        if gameSession == nil {
                log.Printf("[TRUSTEE] 游戏会话为空")
                return
        }

        // 调用游戏会话的取消托管方法
        gameSession.HandleCancelTrustee(client.GetID())
}
