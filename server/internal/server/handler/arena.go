package handler

import (
        "fmt"
        "log"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/types"
)

// =============================================
// 竞技场报名消息类型
// =============================================

const (
        MsgArenaSignup       protocol.MessageType = "arena_signup"
        MsgArenaCancelSignup protocol.MessageType = "arena_cancel_signup"
)

// =============================================
// 竞技场报名处理器
// =============================================

// handleArenaSignup 处理竞技场报名
func (h *Handler) handleArenaSignup(client types.ClientInterface, msg *protocol.Message) {
        // 解析请求
        payload, err := codec.ParsePayload[protocol.ArenaSignupPayload](msg)
        if err != nil || payload == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        playerID := client.GetPlayerID()
        if playerID == 0 {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotLogin))
                return
        }

        // 获取服务器实例（通过接口）
        arenaSrv, ok := h.server.(types.ArenaServer)
        if !ok {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取竞技场广播器
        arena := arenaSrv.GetArenaBroadcaster()
        if arena == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取当前期号信息
        periodInfo := arena.GetCurrentPeriodInfo(payload.RoomID)
        if periodInfo == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 检查是否在报名阶段
        if periodInfo.Phase != types.PhaseSignup {
                client.SendMessage(codec.MustNewMessage("arena_signup_failed", map[string]interface{}{
                        "code":    1,
                        "message": "当前不在报名时间内",
                }))
                return
        }

        // 检查是否已在报名列表
        signupList := arena.GetSignupList(periodInfo.PeriodNo)
        for _, pid := range signupList {
                if pid == playerID {
                        client.SendMessage(codec.MustNewMessage("arena_signup_failed", map[string]interface{}{
                                "code":    2,
                                "message": "您已报名，请勿重复报名",
                        }))
                        return
                }
        }

        // 获取玩家信息
        player, err := database.GetPlayerByID(playerID)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(periodInfo.RoomConfigID)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 检查竞技币是否足够
        if player.ArenaCoin < roomConfig.MinArenaCoin {
                client.SendMessage(codec.MustNewMessage("arena_signup_failed", map[string]interface{}{
                        "code":    3,
                        "message": fmt.Sprintf("竞技币不足，需要%d，当前%d", roomConfig.MinArenaCoin, player.ArenaCoin),
                }))
                return
        }

        // 使用房间配置中的 MinArenaCoin 作为报名费
        // 注意：管理后台将报名费配置在 ddz_room_config.min_arena_coin 字段
        signupFee := roomConfig.MinArenaCoin

        // 检查报名费是否足够
        if signupFee > 0 && player.ArenaCoin < signupFee {
                client.SendMessage(codec.MustNewMessage("arena_signup_failed", map[string]interface{}{
                        "code":    4,
                        "message": fmt.Sprintf("报名费不足，需要%d竞技币", signupFee),
                }))
                return
        }

        // 记录报名前余额
        balanceBefore := player.ArenaCoin

        // 扣除报名费（如果有）
        if signupFee > 0 {
                if err := database.UpdatePlayerArenaCoin(playerID, -signupFee); err != nil {
                        client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                        return
                }
        }

        // 添加到报名列表
        if err := arena.AddPlayerToSignupList(periodInfo.PeriodNo, playerID); err != nil {
                // 回滚报名费
                if signupFee > 0 {
                        database.UpdatePlayerArenaCoin(playerID, signupFee)
                }
                client.SendMessage(codec.MustNewMessage("arena_signup_failed", map[string]interface{}{
                        "code":    5,
                        "message": "报名失败，请重试",
                }))
                return
        }

        // 异步记录报名日志（通过队列接口）
        queue, ok := arena.(types.ArenaQueueProvider)
        if ok {
                balanceAfter := balanceBefore - signupFee
                queue.PushSignupLog(periodInfo.PeriodNo, payload.RoomID, playerID, signupFee, balanceBefore, balanceAfter)
        }

        // 发送报名成功消息
        balanceAfter := balanceBefore - signupFee
        client.SendMessage(codec.MustNewMessage("arena_signup_success", map[string]interface{}{
                "period_no":     periodInfo.PeriodNo,
                "room_id":       payload.RoomID,
                "signup_fee":    signupFee,
                "balance_after": balanceAfter,
                "signup_time":   time.Now().UnixMilli(),
        }))

        log.Printf("[ArenaSignup] 玩家 %d 报名成功，期号=%s，报名费=%d", playerID, periodInfo.PeriodNo, signupFee)

        // 🔧【新增】立即广播报名人数给所有客户端
        h.triggerArenaBroadcast(payload.RoomID)
}

// handleArenaCancelSignup 处理取消报名
func (h *Handler) handleArenaCancelSignup(client types.ClientInterface, msg *protocol.Message) {
        // 解析请求
        payload, err := codec.ParsePayload[protocol.ArenaCancelSignupPayload](msg)
        if err != nil || payload == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInvalidMsg))
                return
        }

        playerID := client.GetPlayerID()
        if playerID == 0 {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeNotLogin))
                return
        }

        // 获取服务器实例（通过接口）
        arenaSrv, ok := h.server.(types.ArenaServer)
        if !ok {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取竞技场广播器
        arena := arenaSrv.GetArenaBroadcaster()
        if arena == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取当前期号信息
        periodInfo := arena.GetCurrentPeriodInfo(payload.RoomID)
        if periodInfo == nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 检查是否在报名阶段
        if periodInfo.Phase != types.PhaseSignup {
                client.SendMessage(codec.MustNewMessage("arena_cancel_failed", map[string]interface{}{
                        "code":    1,
                        "message": "当前不在报名时间，无法取消报名",
                }))
                return
        }

        // 从报名列表移除
        if err := arena.RemovePlayerFromSignupList(periodInfo.PeriodNo, playerID); err != nil {
                client.SendMessage(codec.MustNewMessage("arena_cancel_failed", map[string]interface{}{
                        "code":    2,
                        "message": "取消报名失败，您可能未报名",
                }))
                return
        }

        // 获取玩家信息
        player, err := database.GetPlayerByID(playerID)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 获取房间配置
        roomConfig, err := database.GetRoomConfigByID(periodInfo.RoomConfigID)
        if err != nil {
                client.SendMessage(codec.NewErrorMessage(protocol.ErrCodeInternal))
                return
        }

        // 使用房间配置中的 MinArenaCoin 作为报名费
        // 注意：管理后台将报名费配置在 ddz_room_config.min_arena_coin 字段
        signupFee := roomConfig.MinArenaCoin

        // 退还报名费（如果有）
        if signupFee > 0 {
                database.UpdatePlayerArenaCoin(playerID, signupFee)
        }

        // 记录取消前余额
        balanceBefore := player.ArenaCoin
        balanceAfter := balanceBefore + signupFee

        // 异步记录取消日志（通过队列接口）
        queue, ok := arena.(types.ArenaQueueProvider)
        if ok {
                queue.PushCancelLog(periodInfo.PeriodNo, payload.RoomID, playerID, signupFee, balanceBefore, balanceAfter)
        }

        // 发送取消成功消息
        client.SendMessage(codec.MustNewMessage("arena_cancel_success", map[string]interface{}{
                "period_no":     periodInfo.PeriodNo,
                "room_id":       payload.RoomID,
                "refund_amount": signupFee,
                "balance_after": balanceAfter,
        }))

        log.Printf("[ArenaSignup] 玩家 %d 取消报名，期号=%s，退还报名费=%d", playerID, periodInfo.PeriodNo, signupFee)

        // 🔧【新增】立即广播报名人数给所有客户端
        h.triggerArenaBroadcast(payload.RoomID)
}

// =============================================
// 辅助方法
// =============================================

// triggerArenaBroadcast 触发竞技场状态广播
func (h *Handler) triggerArenaBroadcast(roomID uint64) {
        // 获取服务器实例来触发广播
        type ArenaBroadcaster interface {
                TriggerArenaBroadcast(roomID uint64)
        }

        if broadcaster, ok := h.server.(ArenaBroadcaster); ok {
                broadcaster.TriggerArenaBroadcast(roomID)
        }
}
