package protocol

import "encoding/json"

// Message 基础消息结构
type Message struct {
        Type    MessageType     `json:"type"`
        Payload json.RawMessage `json:"payload,omitempty"`
}

// MessageType 消息类型
type MessageType string

// 客户端 → 服务端 消息类型
const (
        // 连接操作
        MsgReconnect MessageType = "reconnect" // 断线重连
        MsgPing      MessageType = "ping"      // 心跳 ping

        // 房间操作
        MsgCreateRoom  MessageType = "create_room"  // 创建房间
        MsgJoinRoom    MessageType = "join_room"    // 加入房间
        MsgLeaveRoom   MessageType = "leave_room"   // 离开房间
        MsgQuickMatch  MessageType = "quick_match"  // 快速匹配
        MsgReady       MessageType = "ready"        // 准备就绪
        MsgCancelReady MessageType = "cancel_ready" // 取消准备

        // 游戏操作
        MsgBid          MessageType = "bid"           // 叫地主（旧版）
        MsgRob          MessageType = "rob"           // 抢地主（旧版）
        MsgCallLandlord MessageType = "call_landlord" // 抢地主（新版统一接口）
        MsgPlayCards    MessageType = "play_cards"    // 出牌
        MsgPass         MessageType = "pass"          // 不出
        MsgHintRequest  MessageType = "hint_request"  // 提示请求

        // 排行榜
        MsgGetStats             MessageType = "get_stats"              // 获取个人统计
        MsgGetLeaderboard       MessageType = "get_leaderboard"        // 获取排行榜
        MsgGetRoomList          MessageType = "get_room_list"          // 获取房间列表
        MsgGetOnlineCount       MessageType = "get_online_count"       // 获取在线人数
        MsgGetMaintenanceStatus MessageType = "get_maintenance_status" // 获取维护状态
        MsgChat                 MessageType = "chat"                   // 聊天消息

        // 🔧【新增】竞技场操作
        MsgArenaSignup       MessageType = "arena_signup"        // 竞技场报名
        MsgArenaCancelSignup MessageType = "arena_cancel_signup" // 取消报名
        MsgArenaEnter        MessageType = "arena_enter"         // 进入游戏
        MsgArenaCancelEnter  MessageType = "arena_cancel_enter"  // 取消进入
        MsgGetArenaStatus    MessageType = "get_arena_status"    // 🔧【新增】请求竞技场状态
)

// 服务端 → 客户端 消息类型
const (
        // 连接相关
        MsgConnected     MessageType = "connected"      // 连接成功
        MsgReconnected   MessageType = "reconnected"    // 重连成功
        MsgPong          MessageType = "pong"           // 心跳 pong
        MsgPlayerOffline MessageType = "player_offline" // 玩家掉线通知
        MsgPlayerOnline  MessageType = "player_online"  // 玩家上线通知
        MsgOnlineCount   MessageType = "online_count"   // 在线人数更新

        // 房间相关
        MsgRoomCreated  MessageType = "room_created"  // 房间创建成功
        MsgRoomJoined   MessageType = "room_joined"   // 加入房间成功
        MsgPlayerJoined MessageType = "player_joined" // 其他玩家加入
        MsgPlayerLeft   MessageType = "player_left"   // 玩家离开
        MsgPlayerReady  MessageType = "player_ready"  // 玩家准备
        MsgMatchFound   MessageType = "match_found"   // 匹配成功

        // 房间列表实时推送
        MsgRoomListUpdate MessageType = "room_list_update" // 房间列表实时更新

        // ============================================================
        // 【核心】游戏阶段控制消息（服务端权威驱动）
        // ============================================================

        // 准备阶段
        MsgReadyStart MessageType = "ready_start" // 准备阶段开始
        MsgReadyEnd   MessageType = "ready_end"   // 准备阶段结束

        // 发牌阶段
        MsgDealStart MessageType = "deal_start" // 发牌阶段开始
        MsgDealCards MessageType = "deal_cards" // 发牌
        MsgDealEnd   MessageType = "deal_end"   // 发牌阶段结束

        // 抢地主阶段（合并叫地主和抢地主）
        MsgCallLandlordStart MessageType = "call_landlord_start" // 抢地主阶段开始
        MsgCallLandlordTurn  MessageType = "call_landlord_turn"  // 轮到玩家抢地主
        MsgCallLandlordResult MessageType = "call_landlord_result" // 抢地主结果
        MsgCallLandlordEnd   MessageType = "call_landlord_end"   // 抢地主阶段结束

        // 出牌阶段
        MsgPlayStart   MessageType = "play_start"   // 出牌阶段开始
        MsgPlayTurn    MessageType = "play_turn"    // 轮到出牌
        MsgCardPlayed  MessageType = "card_played"  // 有人出牌
        MsgPlayerPass  MessageType = "player_pass"  // 有人不出
        MsgPlayEnd     MessageType = "play_end"     // 出牌阶段结束
        MsgHintResult  MessageType = "hint_result"  // 提示结果

        // 结算阶段
        MsgSettlementStart MessageType = "settlement_start" // 结算阶段开始
        MsgGameOver        MessageType = "game_over"        // 游戏结束
        MsgSettlementEnd   MessageType = "settlement_end"   // 结算阶段结束

        // 重新发牌
        MsgRestartGame MessageType = "restart_game" // 重新发牌通知（所有人都不叫地主）

        // 地主确认（兼容旧客户端）
        MsgLandlord      MessageType = "landlord"       // 地主确定
        MsgLandlordCards MessageType = "landlord_cards" // 🔧【新增】给地主发送新手牌（包含底牌）

        // ============================================================
        // 旧版消息（兼容）
        // ============================================================
        MsgGameStart   MessageType = "game_start"   // 游戏开始
        MsgBidTurn     MessageType = "bid_turn"     // 轮到叫地主（旧）
        MsgBidResult   MessageType = "bid_result"   // 叫地主结果（旧）
        MsgRobTurn     MessageType = "rob_turn"     // 轮到抢地主（旧）
        MsgRobResult   MessageType = "rob_result"   // 抢地主结果（旧）
        MsgRoundResult MessageType = "round_result" // 本轮结果

        // 排行榜
        MsgStatsResult       MessageType = "stats_result"       // 个人统计结果
        MsgLeaderboardResult MessageType = "leaderboard_result" // 排行榜结果
        MsgRoomListResult    MessageType = "room_list_result"   // 房间列表结果

        // 系统通知
        MsgMaintenancePush MessageType = "maintenance_push" // 主动推送
        MsgMaintenancePull MessageType = "maintenance_pull" // 被动拉取

        // 强制下线
        MsgForceLogout MessageType = "force_logout" // 强制下线通知

        // 🔧【托管】托管状态变化
        MsgTrusteeState MessageType = "trustee_state" // 托管状态变化通知

        // 🔧【资产】资产更新推送
        MsgAssetUpdate MessageType = "asset_update" // 资产更新推送

        // ============================================================
        // 【竞技场】比赛相关消息
        // ============================================================

        // 竞技场大厅状态推送（期号、倒计时）
        MsgArenaStatus MessageType = "arena_status" // 竞技场状态推送

        // 比赛状态同步
        MsgCompetitionStatus    MessageType = "competition_status"    // 比赛状态同步
        MsgCompetitionCountdown MessageType = "competition_countdown" // 倒计时同步
        MsgMatchCoinUpdate      MessageType = "match_coin_update"     // 比赛金币更新
        MsgCompetitionEliminated MessageType = "competition_eliminated" // 淘汰通知
        MsgCompetitionAdvance   MessageType = "competition_advance"   // 晋级通知
        MsgCompetitionChampion  MessageType = "competition_champion"  // 冠军通知
        MsgSignupSuccess        MessageType = "signup_success"        // 报名成功通知
        MsgCompetitionStart     MessageType = "competition_start"     // 比赛开始广播

        // 🔧【新增】竞技场比赛开始通知（给已报名玩家发送进入游戏弹窗）
        MsgArenaMatchStart MessageType = "arena_match_start" // 竞技场比赛开始通知

        // 🔧【新增】竞技场关闭弹窗通知（新期号开始时关闭上一轮弹窗）
        MsgArenaCloseDialog MessageType = "arena_close_dialog" // 竞技场关闭弹窗通知

        // 🔧【新增】竞技场轮次倒计时（服务端控制30秒倒计时）
        MsgArenaRoundCountdown MessageType = "arena_round_countdown" // 竞技场轮次倒计时
        MsgArenaCountdownTick  MessageType = "arena_countdown_tick"   // 竞技场倒计时每秒更新
        MsgArenaAutoReady      MessageType = "arena_auto_ready"      // 竞技场自动准备通知
        MsgArenaReconnectState MessageType = "arena_reconnect_state" // 竞技场断线重连状态恢复
        MsgArenaMatchEnd       MessageType = "arena_match_end"       // 竞技场比赛结束通知

        // 🔧【新增】竞技场多桌等待和决赛排行榜
        MsgTournamentWaitProgress MessageType = "tournament_wait_progress" // 等待进度广播
        MsgTournamentRoundAdvance MessageType = "tournament_round_advance" // 下一轮通知
        MsgTournamentFinalRank    MessageType = "tournament_final_rank"    // 最终榜单

        // 🔧【新增】竞技场等待阶段（玩家点击进入后的等待界面）
        MsgArenaWaitingStatus MessageType = "arena_waiting_status" // 等待阶段状态推送
        MsgArenaWaitingTick   MessageType = "arena_waiting_tick"   // 等待阶段倒计时更新
        MsgArenaAssignStart   MessageType = "arena_assign_start"   // 分配阶段开始（10秒倒计时）

        // 错误
        MsgError MessageType = "error" // 错误消息
)
