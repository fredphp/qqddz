package protocol

// --- 客户端请求 Payloads ---

// ReconnectPayload 断线重连请求
type ReconnectPayload struct {
        Token    string `json:"token"`     // 重连令牌
        PlayerID string `json:"player_id"` // 玩家 ID
}

// PingPayload 心跳请求
type PingPayload struct {
        Timestamp int64 `json:"timestamp"` // 客户端时间戳（毫秒）
}

// JoinRoomPayload 加入房间请求
type JoinRoomPayload struct {
        RoomCode string `json:"room_code"`
}

// CreateRoomPayload 创建房间请求
type CreateRoomPayload struct {
        RoomConfigID uint64 `json:"room_config_id"` // 房间配置ID
}

// BidPayload 叫地主请求
type BidPayload struct {
        Bid bool `json:"bid"` // true = 叫地主, false = 不叫
}

// RobPayload 抢地主请求
type RobPayload struct {
        Rob bool `json:"rob"` // true = 抢地主, false = 不抢
}

// CallLandlordActionPayload 抢地主请求（新版统一接口）
type CallLandlordActionPayload struct {
        Action string `json:"action"` // "call" = 抢, "pass" = 不抢
}

// ============================================================
// 【核心】游戏阶段控制 Payloads（服务端权威驱动）
// ============================================================

// PhaseStartPayload 阶段开始通知
type PhaseStartPayload struct {
        Phase string `json:"phase"` // ready/deal/call_landlord/play/settlement
}

// PhaseEndPayload 阶段结束通知
type PhaseEndPayload struct {
        Phase string `json:"phase"` // ready/deal/call_landlord/play/settlement
}

// DealStartPayload 发牌开始通知
type DealStartPayload struct {
        RoomCode string `json:"room_code"`
}

// DealEndPayload 发牌结束通知
type DealEndPayload struct {
        RoomCode string `json:"room_code"`
}

// CallLandlordStartPayload 抢地主阶段开始通知
type CallLandlordStartPayload struct {
        FirstCallerID   string `json:"first_caller_id"`   // 第一个抢的玩家ID（随机选择）
        FirstCallerName string `json:"first_caller_name"` // 第一个抢的玩家名字
        TotalRounds     int    `json:"total_rounds"`      // 最大轮次数（4轮）
}

// CallLandlordTurnPayload 轮到玩家抢地主通知
type CallLandlordTurnPayload struct {
        PlayerID   string `json:"player_id"`   // 当前玩家ID
        PlayerName string `json:"player_name"` // 当前玩家名字
        Timeout    int    `json:"timeout"`     // 超时时间（秒）
        Round      int    `json:"round"`       // 当前轮次（1或2）
        TurnIndex  int    `json:"turn_index"`  // 当前是第几次操作（1-4）
        ExpiresAt  int64  `json:"expires_at"`  // 🔧【新增】过期时间戳（毫秒），客户端据此计算剩余时间
}

// CallLandlordResultPayload 抢地主结果通知
type CallLandlordResultPayload struct {
        PlayerID   string `json:"player_id"`   // 玩家ID
        PlayerName string `json:"player_name"` // 玩家名字
        Action     string `json:"action"`      // "call" = 抢, "pass" = 不抢
        Round      int    `json:"round"`       // 当前轮次（1或2）
        TurnIndex  int    `json:"turn_index"`  // 当前是第几次操作（1-4）
        Gender     string `json:"gender"`      // 玩家性别: male/female/unknown（用于音效）
        Order      int    `json:"order"`       // 当前轮次内的操作顺序（1-3）
}

// CallLandlordEndPayload 抢地主阶段结束通知
type CallLandlordEndPayload struct {
        LandlordID   string     `json:"landlord_id"`   // 地主ID
        LandlordName string     `json:"landlord_name"` // 地主名字
        BottomCards  []CardInfo `json:"bottom_cards"`  // 底牌
}

// RestartGamePayload 重新发牌通知（所有人都不叫地主时）
type RestartGamePayload struct {
        Reason      string `json:"reason"`       // 重新发牌原因
        ReDealCount int    `json:"re_deal_count"` // 🔧【新增】当前重发次数（1或2，第3次不再重发）
}

// PlayStartPayload 出牌阶段开始通知
type PlayStartPayload struct {
        LandlordID string `json:"landlord_id"` // 地主ID
}

// SettlementStartPayload 结算阶段开始通知
type SettlementStartPayload struct {
        WinnerID   string `json:"winner_id"`   // 获胜者ID
        WinnerName string `json:"winner_name"` // 获胜者名字
        IsLandlord bool   `json:"is_landlord"` // 获胜者是否是地主
}

// PlayCardsPayload 出牌请求
type PlayCardsPayload struct {
        Cards []CardInfo `json:"cards"`
}

// HintRequestPayload 提示请求
type HintRequestPayload struct{}

// HintResultPayload 提示结果
type HintResultPayload struct {
        Cards []CardInfo `json:"cards"` // 提示的牌
        Index int        `json:"index"` // 当前提示索引（用于循环提示）
        Total int        `json:"total"` // 可提示的总数
}

// GetLeaderboardPayload 获取排行榜请求
type GetLeaderboardPayload struct {
        Type   string `json:"type"`   // total/daily/weekly
        Offset int    `json:"offset"` // 偏移量
        Limit  int    `json:"limit"`  // 数量
}

// --- 服务端响应 Payloads ---

// ConnectedPayload 连接成功响应
type ConnectedPayload struct {
        PlayerID       string `json:"player_id"`
        PlayerName     string `json:"player_name"`
        ReconnectToken string `json:"reconnect_token"` // 重连令牌
}

// ReconnectedPayload 重连成功响应
type ReconnectedPayload struct {
        PlayerID   string        `json:"player_id"`
        PlayerName string        `json:"player_name"`
        RoomCode   string        `json:"room_code,omitempty"`  // 如果在房间中
        GameState  *GameStateDTO `json:"game_state,omitempty"` // 如果在游戏中
}

// GameStateDTO 游戏状态数据传输对象（用于重连恢复）
type GameStateDTO struct {
        Phase        string       `json:"phase"`          // bidding/playing
        Players      []PlayerInfo `json:"players"`        // 所有玩家信息
        Hand         []CardInfo   `json:"hand"`           // 自己的手牌
        BottomCards  []CardInfo   `json:"bottom_cards"`   // 底牌
        CurrentTurn  string       `json:"current_turn"`   // 当前回合玩家 ID
        LastPlayed   []CardInfo   `json:"last_played"`    // 上家出的牌
        LastPlayerID string       `json:"last_player_id"` // 上家 ID
        MustPlay     bool         `json:"must_play"`      // 是否必须出牌
        CanBeat      bool         `json:"can_beat"`       // 是否能打过
}

// PongPayload 心跳响应
type PongPayload struct {
        ClientTimestamp int64 `json:"client_timestamp"` // 客户端发送的时间戳
        ServerTimestamp int64 `json:"server_timestamp"` // 服务器时间戳（毫秒）
}

// PlayerOfflinePayload 玩家掉线通知
type PlayerOfflinePayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Timeout    int    `json:"timeout"` // 等待重连超时（秒）
}

// PlayerOnlinePayload 玩家上线通知
type PlayerOnlinePayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
}

// OnlineCountPayload 在线人数更新
type OnlineCountPayload struct {
        Count int `json:"count"` // 当前在线人数
}

// RoomCreatedPayload 房间创建成功响应
type RoomCreatedPayload struct {
        RoomCode string     `json:"room_code"`
        Player   PlayerInfo `json:"player"`
}

// RoomJoinedPayload 加入房间成功响应
type RoomJoinedPayload struct {
        RoomCode     string       `json:"room_code"`
        Player       PlayerInfo   `json:"player"`
        Players      []PlayerInfo `json:"players"`      // 房间内所有玩家
        CreatorID    string       `json:"creator_id"`   // 房主ID
        RoomCategory uint8        `json:"room_category"` // 🔧【新增】房间分类: 1-普通场, 2-竞技场
        PeriodNo     string       `json:"period_no"`     // 🔧【新增】期号（竞技场模式下使用）
}

// PlayerJoinedPayload 其他玩家加入通知
type PlayerJoinedPayload struct {
        Player PlayerInfo `json:"player"`
}

// PlayerLeftPayload 玩家离开通知
type PlayerLeftPayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
}

// PlayerReadyPayload 玩家准备通知
type PlayerReadyPayload struct {
        PlayerID string `json:"player_id"`
        Ready    bool   `json:"ready"`
}

// GameStartPayload 游戏开始通知
type GameStartPayload struct {
        Players      []PlayerInfo `json:"players"`       // 按座位顺序排列
        RoomCategory uint8        `json:"room_category"` // 🔧【新增】房间分类: 1-普通场, 2-竞技场
        PeriodNo     string       `json:"period_no"`     // 🔧【新增】期号（竞技场模式下使用）
}

// DealCardsPayload 发牌通知
type DealCardsPayload struct {
        Cards       []CardInfo `json:"cards"`        // 玩家自己的手牌
        BottomCards []CardInfo `json:"bottom_cards"` // 底牌（地主确定后才显示具体内容）
}

// BidTurnPayload 轮到叫地主通知
type BidTurnPayload struct {
        PlayerID string `json:"player_id"`
        Timeout  int    `json:"timeout"` // 超时时间（秒）
}

// BidResultPayload 叫地主结果通知
type BidResultPayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Bid        bool   `json:"bid"`
}

// RobTurnPayload 轮到抢地主通知
type RobTurnPayload struct {
        PlayerID string `json:"player_id"`
        Timeout  int    `json:"timeout"` // 超时时间（秒）
}

// RobResultPayload 抢地主结果通知
type RobResultPayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Rob        bool   `json:"rob"`
}

// LandlordPayload 地主确定通知
type LandlordPayload struct {
        PlayerID    string     `json:"player_id"`
        PlayerName  string     `json:"player_name"`
        BottomCards []CardInfo `json:"bottom_cards"` // 底牌
}

// LandlordCardsPayload 🔧【新增】地主新手牌通知（只发送给地主）
// 包含地主ID，让客户端能够验证自己是否是地主
type LandlordCardsPayload struct {
        LandlordID  string     `json:"landlord_id"`  // 🔧【关键】地主ID，客户端用于验证
        LandlordName string    `json:"landlord_name"`
        Cards       []CardInfo `json:"cards"`        // 地主的完整手牌（含底牌）
        BottomCards []CardInfo `json:"bottom_cards"` // 底牌
}

// PlayTurnPayload 轮到出牌通知
type PlayTurnPayload struct {
        PlayerID string `json:"player_id"`
        Timeout  int    `json:"timeout"`   // 超时时间（秒）
        MustPlay bool   `json:"must_play"` // 是否必须出牌（新一轮开始时为 true）
        CanBeat  bool   `json:"can_beat"`  // 是否有牌能打过上家
}

// CardPlayedPayload 出牌通知
type CardPlayedPayload struct {
        PlayerID    string     `json:"player_id"`
        PlayerName  string     `json:"player_name"`
        Cards       []CardInfo `json:"cards"`
        CardsLeft   int        `json:"cards_left"`    // 剩余手牌数
        HandType    string     `json:"hand_type"`     // 牌型名称
        Rank        int        `json:"rank"`          // 主牌点数（用于音效播放单张/对子/三张）
        Gender      string     `json:"gender"`        // 性别：male/female
        IsNewRound  bool       `json:"is_new_round"`  // 🔧【新增】是否是新回合（首出）
        CanBeat     bool       `json:"can_beat"`      // 🔧【新增】是否能压过上家（用于"大你"音效）
}

// PlayerPassPayload 不出通知
type PlayerPassPayload struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Gender     string `json:"gender"` // 性别：male/female
}

// GameOverPayload 游戏结束通知
type GameOverPayload struct {
        WinnerID    string       `json:"winner_id"`
        WinnerName  string       `json:"winner_name"`
        IsLandlord  bool         `json:"is_landlord"`  // 获胜者是否是地主
        PlayerHands []PlayerHand `json:"player_hands"` // 所有玩家剩余手牌

        // 🔧【新增】结算详情
        BaseScore  int               `json:"base_score"`   // 底分
        Multiple   int               `json:"multiple"`     // 总倍数
        MultiDetail MultiplierDetail `json:"multi_detail"` // 倍数详情
        Players    []PlayerResult   `json:"players"`      // 玩家结算结果

        // 🔧【新增】房间分类（用于区分普通场和竞技场）
        RoomCategory uint8 `json:"room_category"` // 房间分类: 1-普通场, 2-竞技场

        // 🔧【新增】竞技场专用字段
        ArenaCountdown int   `json:"arena_countdown"` // 竞技场倒计时初始值（秒）
        ArenaRound     int   `json:"arena_round"`     // 竞技场下一轮轮次
        MatchCoin      int64 `json:"match_coin"`      // 比赛金币/竞技币

        // 🔧【新增】竞技场最终结算标识
        TotalPlayers  int  `json:"total_players"`  // 当期报名总人数
        IsFinalRound  bool `json:"is_final_round"` // 是否是最终结算（只有3人时为true）
}

// MultiplierDetail 倍数详情
type MultiplierDetail struct {
        QiangCount  int `json:"qiang_count"`   // 抢地主次数
        QiangMulti  int `json:"qiang_multi"`   // 抢地主倍数 (2^n)
        BombCount   int `json:"bomb_count"`    // 炸弹数量
        BombMulti   int `json:"bomb_multi"`    // 炸弹倍数 (2^n)
        RocketCount int `json:"rocket_count"`  // 王炸数量
        RocketMulti int `json:"rocket_multi"`  // 王炸倍数 (2^n)
        SpringType  int `json:"spring_type"`   // 春天类型: 0=无, 1=春天, 2=反春
        SpringMulti int `json:"spring_multi"`  // 春天倍数
}

// PlayerResult 玩家结算结果
type PlayerResult struct {
        PlayerID   string `json:"player_id"`
        PlayerName string `json:"player_name"`
        Seat       int    `json:"seat"`        // 座位号
        Role       string `json:"role"`        // 身份: landlord/farmer
        IsWinner   bool   `json:"is_winner"`   // 是否获胜
        WinGold    int64  `json:"win_gold"`    // 输赢豆子（正=赢，负=输）
        GoldAfter  int64  `json:"gold_after"`  // 结算后豆子（如果有的话）
        MatchCoin  int64  `json:"match_coin"`  // 🔧【新增】竞技场模式下的竞技币
}

// PlayerHand 玩家手牌信息（用于游戏结束展示）
type PlayerHand struct {
        PlayerID   string     `json:"player_id"`
        PlayerName string     `json:"player_name"`
        Cards      []CardInfo `json:"cards"`
}

// MaintenancePayload 维护模式通知
type MaintenancePayload struct {
        Maintenance bool `json:"maintenance"` // 是否在维护模式
}

// MaintenanceStatusPayload 维护状态响应
type MaintenanceStatusPayload struct {
        Maintenance bool `json:"maintenance"` // 是否在维护模式
}

// ErrorPayload 错误响应
type ErrorPayload struct {
        Code    int    `json:"code"`
        Message string `json:"message"`
}

// StatsResultPayload 个人统计结果
type StatsResultPayload struct {
        PlayerID      string  `json:"player_id"`
        PlayerName    string  `json:"player_name"`
        TotalGames    int     `json:"total_games"`
        Wins          int     `json:"wins"`
        Losses        int     `json:"losses"`
        WinRate       float64 `json:"win_rate"`
        LandlordGames int     `json:"landlord_games"`
        LandlordWins  int     `json:"landlord_wins"`
        FarmerGames   int     `json:"farmer_games"`
        FarmerWins    int     `json:"farmer_wins"`
        Score         int     `json:"score"`
        Rank          int     `json:"rank"`
        CurrentStreak int     `json:"current_streak"`
        MaxWinStreak  int     `json:"max_win_streak"`
}

// LeaderboardResultPayload 排行榜结果
type LeaderboardResultPayload struct {
        Type    string             `json:"type"` // total/daily/weekly
        Entries []LeaderboardEntry `json:"entries"`
}

// LeaderboardEntry 排行榜条目
type LeaderboardEntry struct {
        Rank       int     `json:"rank"`
        PlayerID   string  `json:"player_id"`
        PlayerName string  `json:"player_name"`
        Score      int     `json:"score"`
        Wins       int     `json:"wins"`
        WinRate    float64 `json:"win_rate"`
}

// RoomListResultPayload 房间列表结果
type RoomListResultPayload struct {
        Rooms []RoomListItem `json:"rooms"`
}

// RoomListItem 房间列表项
type RoomListItem struct {
        RoomCode    string `json:"room_code"`
        PlayerCount int    `json:"player_count"`
        MaxPlayers  int    `json:"max_players"`
}

// RoomListUpdatePayload 房间列表实时更新推送
type RoomListUpdatePayload struct {
        ActionType   string       `json:"action_type"`    // add/update/remove
        Room         *RoomListItem `json:"room,omitempty"` // 房间信息（add/update时）
        RoomCode     string       `json:"room_code,omitempty"` // 房间号（remove时）
        Reason       string       `json:"reason,omitempty"`    // 原因说明
}

// 房间列表更新动作类型
const (
        RoomActionAdd    = "add"    // 新房间
        RoomActionUpdate = "update" // 更新房间信息
        RoomActionRemove = "remove" // 移除房间
)

// ChatPayload 聊天消息
type ChatPayload struct {
        SenderID   string `json:"sender_id,omitempty"`   // 发送者 ID (服务端填充)
        SenderName string `json:"sender_name,omitempty"` // 发送者名字 (服务端填充)
        Content    string `json:"content"`               // 消息内容
        Scope      string `json:"scope"`                 // "lobby" or "room"
        Time       int64  `json:"time,omitempty"`        // 发送时间 (服务端填充)
        IsSystem   bool   `json:"is_system,omitempty"`   // 是否是系统消息
}

// ForceLogoutPayload 强制下线通知
type ForceLogoutPayload struct {
        PlayerID string `json:"player_id"` // 玩家 ID
        Reason   string `json:"reason"`    // 下线原因
        Time     int64  `json:"time"`      // 下线时间戳
}

// 🔧【托管】TrusteeStatePayload 托管状态变化通知
type TrusteeStatePayload struct {
        PlayerID   string `json:"player_id"`   // 玩家ID
        PlayerName string `json:"player_name"` // 玩家名字
        IsTrustee  bool   `json:"is_trustee"`  // 是否托管
        Reason     string `json:"reason"`      // 原因: timeout/disconnect/reconnect
}

// 🔧【资产】AssetUpdatePayload 资产更新推送
type AssetUpdatePayload struct {
        Gold       int64  `json:"gold"`        // 更新后金币数量
        ArenaCoin  int64  `json:"arena_coin"`  // 更新后竞技币数量
        UpdateType string `json:"update_type"` // 更新类型
        Timestamp  int64  `json:"timestamp"`   // 时间戳
}

// --- 通用数据结构 ---

// PlayerInfo 玩家信息
type PlayerInfo struct {
        ID         string `json:"id"`
        Name       string `json:"name"`
        Avatar     string `json:"avatar"`      // 🔧【新增】玩家头像URL
        Seat       int    `json:"seat"`        // 座位号 0-2
        Ready      bool   `json:"ready"`       // 是否准备
        IsLandlord bool   `json:"is_landlord"` // 是否是地主
        CardsCount int    `json:"cards_count"` // 手牌数量
        Online     bool   `json:"online"`      // 是否在线（兼容旧客户端）
        State      string `json:"state"`       // 玩家状态: online/offline/robot
        GoldCount  int64  `json:"gold_count"`  // 玩家金币数量
        // 🔧【新增】竞技场专用字段
        MatchCoin  int64  `json:"match_coin"`  // 竞技币（竞技场模式下显示）
        ArenaGold  int64  `json:"arena_gold"`  // 🔧【新增】当期赛事金币
        PeriodNo   string `json:"period_no"`   // 🔧【新增】期号
}

// CardInfo 牌信息
type CardInfo struct {
        Suit  int    `json:"suit"`           // 花色: 0=黑桃, 1=红心, 2=梅花, 3=方块, 4=王
        Rank  int    `json:"rank"`           // 点数: 3-17 (3-2, 小王=16, 大王=17)
        Value int    `json:"value"`          // 【核心】牌力值（用于排序）: 大王=16, 小王=15, 2=13, A=12, K=11, ..., 3=1
        Color int    `json:"color"`          // 颜色: 0=黑, 1=红
        King  string `json:"king,omitempty"` // 大小王标识: "14"=小王, "15"=大王 (用于客户端渲染)
}

// ============================================================
// 【竞技场】比赛相关 Payloads
// ============================================================

// CompetitionStatusPayload 比赛状态同步
// 用于向客户端推送当前比赛的整体状态信息
type CompetitionStatusPayload struct {
        SessionID     uint64 `json:"session_id"`      // 比赛会话ID
        RoomConfigID  uint64 `json:"room_config_id"`  // 房间配置ID
        Status        uint8  `json:"status"`          // 比赛状态: 0-等待报名, 1-报名中, 2-等待开赛, 3-进行中, 4-已结束
        TotalPlayers  int    `json:"total_players"`   // 总报名人数
        ActivePlayers int    `json:"active_players"`  // 当前活跃人数（未淘汰）
        CurrentRound  int    `json:"current_round"`   // 当前轮次
        TotalRounds   int    `json:"total_rounds"`    // 总轮次数
        Countdown     int    `json:"countdown"`       // 倒计时秒数
}

// CompetitionCountdownPayload 倒计时同步
// 用于推送各类倒计时状态
type CompetitionCountdownPayload struct {
        SessionID     uint64 `json:"session_id"`      // 比赛会话ID
        CountdownType string `json:"countdown_type"`  // 倒计时类型: "signup"-报名倒计时, "start"-开赛倒计时, "round"-轮次倒计时
        Seconds       int    `json:"seconds"`         // 剩余秒数
}

// MatchCoinUpdatePayload 比赛金币更新
// 用于推送玩家在比赛中的金币（积分）变化
type MatchCoinUpdatePayload struct {
        SessionID    uint64 `json:"session_id"`     // 比赛会话ID
        PlayerID     uint64 `json:"player_id"`      // 玩家ID
        MatchCoin    int64  `json:"match_coin"`     // 当前比赛金币
        ChangeAmount int64  `json:"change_amount"`  // 变化数量（正数增加，负数减少）
}

// CompetitionEliminatedPayload 淘汰通知
// 当玩家被淘汰时推送
type CompetitionEliminatedPayload struct {
        SessionID       uint64 `json:"session_id"`       // 比赛会话ID
        PlayerID        uint64 `json:"player_id"`        // 被淘汰玩家ID
        Rank            int    `json:"rank"`             // 最终排名
        Reason          string `json:"reason"`           // 淘汰原因: lose-输掉比赛, disconnect-掉线, forfeit-弃权
        EliminatedRound int    `json:"eliminated_round"` // 被淘汰的轮次
}

// CompetitionAdvancePayload 晋级通知
// 当玩家成功晋级下一轮时推送
type CompetitionAdvancePayload struct {
        SessionID uint64 `json:"session_id"` // 比赛会话ID
        PlayerID  uint64 `json:"player_id"`  // 晋级玩家ID
        NewRound  int    `json:"new_round"`  // 新轮次
        MatchCoin int64  `json:"match_coin"` // 当前比赛金币
}

// CompetitionChampionPayload 冠军通知
// 比赛结束时推送冠军信息和最终排名
type CompetitionChampionPayload struct {
        SessionID    uint64              `json:"session_id"`    // 比赛会话ID
        ChampionID   uint64              `json:"champion_id"`   // 冠军玩家ID
        ChampionName string              `json:"champion_name"` // 冠军玩家名字
        Reward       *RewardInfo         `json:"reward"`        // 冠军奖励信息
        Rankings     []PlayerRankingInfo `json:"rankings"`      // 最终排名列表
}

// RewardInfo 奖励信息
// 用于描述比赛奖励详情
type RewardInfo struct {
        ID    uint64 `json:"id"`    // 奖励ID
        Name  string `json:"name"`  // 奖励名称
        Image string `json:"image"` // 奖励图片URL
}

// PlayerRankingInfo 玩家排名信息
// 用于比赛结束时的排名展示
type PlayerRankingInfo struct {
        Rank       int    `json:"rank"`        // 排名
        PlayerID   uint64 `json:"player_id"`   // 玩家ID
        PlayerName string `json:"player_name"` // 玩家名字
        MatchCoin  int64  `json:"match_coin"`  // 比赛金币
}

// SignupSuccessPayload 报名成功通知
// 玩家成功报名比赛后推送
type SignupSuccessPayload struct {
        SessionID      uint64 `json:"session_id"`      // 比赛会话ID
        PlayerID       uint64 `json:"player_id"`       // 玩家ID
        SignupFee      int64  `json:"signup_fee"`      // 报名费用
        ArenaCoinAfter int64  `json:"arena_coin_after"` // 报名后竞技币余额
        ScheduledStart string `json:"scheduled_start"` // 预计开始时间（ISO 8601格式）
}

// CompetitionStartPayload 比赛开始广播
// 比赛正式开始时向所有参赛玩家广播
type CompetitionStartPayload struct {
        SessionID    uint64 `json:"session_id"`    // 比赛会话ID
        RoomConfigID uint64 `json:"room_config_id"` // 房间配置ID
        Countdown    int    `json:"countdown"`     // 进入比赛倒计时（秒）
}

// ============================================================
// 【竞技场】大厅状态推送 Payload
// ============================================================

// ArenaStatusPayload 竞技场大厅状态推送
// 服务端定期推送每个竞技场的期号和倒计时
type ArenaStatusPayload struct {
        Arenas []ArenaRoomStatus `json:"arenas"` // 所有竞技场状态
        Time   int64             `json:"time"`   // 服务器时间戳（毫秒）
}

// ArenaRoomStatus 单个竞技场房间状态
type ArenaRoomStatus struct {
        RoomID       uint64 `json:"room_id"`       // 房间配置ID
        RoomName     string `json:"room_name"`     // 房间名称
        PeriodNo     int    `json:"period_no"`     // 当前期号（数字，兼容旧版）
        PeriodNoStr  string `json:"period_no_str"` // 当前期号（字符串格式，如 C2605050001）
        Phase        int    `json:"phase"`         // 当前阶段: 0=不可用, 1=准备中, 2=报名中
        CanSignup    bool   `json:"can_signup"`    // 是否可以报名
        Countdown    int    `json:"countdown"`     // 倒计时（秒），-1表示不可报名
        StatusText   string `json:"status_text"`   // 状态文本："报名中"/"暂未开放"/"准备中"/"即将开始"
        TotalPlayers int    `json:"total_players"` // 当前报名人数
        SignedUp     bool   `json:"signed_up"`     // 当前玩家是否已报名
}

// ArenaSignupPayload 竞技场报名请求
type ArenaSignupPayload struct {
        RoomID uint64 `json:"room_id"` // 房间配置ID
}

// ArenaCancelSignupPayload 竞技场取消报名请求
type ArenaCancelSignupPayload struct {
        RoomID uint64 `json:"room_id"` // 房间配置ID
}

// 🔧【新增】进入阶段相关 Payload

// ArenaEnterPayload 玩家点击"进入"按钮请求
type ArenaEnterPayload struct {
        PeriodNo string `json:"period_no"` // 期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
}

// ArenaCancelEnterPayload 玩家点击"取消"按钮请求
type ArenaCancelEnterPayload struct {
        PeriodNo string `json:"period_no"` // 期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
}

// ArenaEnterSuccessPayload 进入成功响应
type ArenaEnterSuccessPayload struct {
        PeriodNo string `json:"period_no"` // 期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
        Message  string `json:"message"`   // 提示消息
}

// ArenaCancelEnterSuccessPayload 取消进入成功响应
type ArenaCancelEnterSuccessPayload struct {
        PeriodNo     string `json:"period_no"`     // 期号
        RoomID       uint64 `json:"room_id"`       // 房间配置ID
        RefundAmount int64  `json:"refund_amount"` // 退还的竞技币
        BalanceAfter int64  `json:"balance_after"` // 退还后余额
        Message      string `json:"message"`       // 提示消息
}

// ============================================================
// 【新增】竞技场比赛开始通知 Payload
// ============================================================

// ArenaMatchStartPayload 竞技场比赛开始通知
// 当报名阶段结束时，向所有已报名玩家发送此通知，提示玩家进入游戏
type ArenaMatchStartPayload struct {
        PeriodNo      string `json:"period_no"`       // 期号（字符串格式，如 260507010181）
        RoomID        uint64 `json:"room_id"`         // 房间配置ID
        RoomName      string `json:"room_name"`       // 房间名称
        RoomConfigID  uint64 `json:"room_config_id"`  // 房间配置ID（用于获取房间配置信息）
        SignupFee     int64  `json:"signup_fee"`      // 报名费（竞技币）
        TotalPlayers  int    `json:"total_players"`   // 总报名人数
        MatchDuration int    `json:"match_duration"`  // 每轮时长（分钟）
        MatchRounds   int    `json:"match_rounds"`    // 需要打的轮次数
        Countdown     int    `json:"countdown"`       // 进入比赛倒计时（秒）
        StartTime     int64  `json:"start_time"`      // 准备阶段开始时间（Unix毫秒时间戳）
        Message       string `json:"message"`         // 提示消息
}

// ============================================================
// 【新增】竞技场关闭弹窗通知 Payload
// ============================================================

// ArenaCloseDialogPayload 竞技场关闭弹窗通知
// 新期号开始时，通知客户端关闭上一轮的进入游戏弹窗
type ArenaCloseDialogPayload struct {
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
        PeriodNo string `json:"period_no"` // 上一期的期号
        Reason   string `json:"reason"`    // 关闭原因: "new_period_started", "match_cancelled", etc.
        Message  string `json:"message"`   // 提示消息
}

// ============================================================
// 【新增】竞技场轮次倒计时 Payload（服务端控制）
// ============================================================

// ArenaRoundCountdownPayload 竞技场轮次倒计时开始
// 游戏结束后，服务端广播此消息告知客户端开始30秒倒计时
type ArenaRoundCountdownPayload struct {
        Seconds     int    `json:"seconds"`      // 倒计时总秒数（30）
        Round       int    `json:"round"`        // 下一轮轮次
        PeriodNo    string `json:"period_no"`    // 当前期号
        RoomID      uint64 `json:"room_id"`      // 房间配置ID
        Message     string `json:"message"`      // 提示消息："下一轮将在 30 秒后开始"
}

// ArenaCountdownTickPayload 竞技场倒计时每秒更新
// 服务端每秒广播此消息，客户端据此更新UI
type ArenaCountdownTickPayload struct {
        Seconds  int    `json:"seconds"`  // 剩余秒数
        PeriodNo string `json:"period_no"` // 当前期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
}

// ArenaAutoReadyPayload 竞技场自动准备通知
// 倒计时结束后，服务端自动为所有玩家准备，广播此消息
type ArenaAutoReadyPayload struct {
        PeriodNo string `json:"period_no"` // 当前期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
        Message  string `json:"message"`   // 提示消息："系统已自动准备"
}

// ArenaReconnectStatePayload 竞技场断线重连状态恢复
// 玩家断线重连时，服务端发送此消息恢复当前状态
// [Enhanced] Added more fields for complete state recovery
type ArenaReconnectStatePayload struct {
        Phase          string `json:"phase"`           // Current phase
        PeriodNo       string `json:"period_no"`       // Period number
        RoomID         uint64 `json:"room_id"`         // Room config ID
        RoomName       string `json:"room_name"`       // Room name
        Round          int    `json:"round"`           // Current round
        TotalRounds    int    `json:"total_rounds"`    // Total rounds
        Countdown      int    `json:"countdown"`       // Remaining countdown
        ArenaGold      int64  `json:"arena_gold"`      // Arena gold
        TableID        int    `json:"table_id"`        // Table number
        RoomCode       string `json:"room_code"`       // Room code
        TotalPlayers   int    `json:"total_players"`   // Total players
        MyRank         int    `json:"my_rank"`         // My rank
        IsEliminated   bool   `json:"is_eliminated"`   // Is eliminated
        Message        string `json:"message"`         // Message
}

// ArenaMatchEndPayload 竞技场比赛结束通知
// 当所有轮次打完后，服务端广播此消息通知玩家比赛结束
type ArenaMatchEndPayload struct {
        PeriodNo string `json:"period_no"` // 当前期号
        RoomID   uint64 `json:"room_id"`   // 房间配置ID
        Message  string `json:"message"`   // 提示消息："比赛结束"
}

// ============================================================
// 【新增】竞技场多桌等待和决赛排行榜 Payloads
// ============================================================

// TournamentWaitProgressPayload 等待进度广播
// 当玩家完成当前轮次后，显示等待其他桌完成的进度
type TournamentWaitProgressPayload struct {
        PeriodNo        string `json:"period_no"`         // 期号
        Round           int    `json:"round"`             // 当前轮次
        TotalRounds     int    `json:"total_rounds"`      // 总轮次
        FinishedTables  int    `json:"finished_tables"`   // 已完成桌数
        TotalTables     int    `json:"total_tables"`      // 总桌数
        PlayerTableDone bool   `json:"player_table_done"` // 当前玩家所在桌是否已完成
        Status          string `json:"status"`            // 状态: WAITING, CALCULATING, MATCHING
        Message         string `json:"message"`           // 提示消息
}

// TournamentRoundAdvancePayload 下一轮通知
// 当所有桌完成当前轮次后，广播此消息通知进入下一轮
type TournamentRoundAdvancePayload struct {
        PeriodNo    string `json:"period_no"`    // 期号
        NewRound    int    `json:"new_round"`    // 新轮次
        TotalRounds int    `json:"total_rounds"` // 总轮次
        Message     string `json:"message"`      // 提示消息
}

// TournamentFinalRankPayload 最终榜单
// 比赛结束时推送最终排名
type TournamentFinalRankPayload struct {
        PeriodNo     string                `json:"period_no"`     // 期号
        TotalPlayers int                   `json:"total_players"` // 总参赛人数
        Top3         []TournamentRankEntry `json:"top3"`          // 前三名（领奖台展示）
        Top20        []TournamentRankEntry `json:"top20"`         // 前20名（列表展示）
        MyRank       int                   `json:"my_rank"`       // 我的排名（0表示未上榜）
        MyMatchCoin  int64                 `json:"my_match_coin"` // 我的最终金币
        Message      string                `json:"message"`       // 提示消息
}

// TournamentRankEntry 淘汰赛排名条目
type TournamentRankEntry struct {
        Rank       int    `json:"rank"`        // 排名
        PlayerID   string `json:"player_id"`   // 玩家ID
        PlayerName string `json:"player_name"` // 玩家昵称
        Avatar     string `json:"avatar"`      // 头像URL
        MatchCoin  int64  `json:"match_coin"`  // 最终金币
        IsRobot    bool   `json:"is_robot"`    // 是否是机器人
}

// ============================================================
// 【新增】竞技场等待阶段 Payloads（玩家点击进入后的等待界面）
// ============================================================

// ArenaWaitingStatusPayload 等待阶段状态推送
// 玩家点击"进入"后，服务端推送此消息，客户端显示等待界面
type ArenaWaitingStatusPayload struct {
        PeriodNo       string                  `json:"period_no"`       // 期号
        RoomID         uint64                  `json:"room_id"`         // 房间配置ID
        RoomName       string                  `json:"room_name"`       // 房间名称
        Phase          string                  `json:"phase"`           // 当前阶段: "waiting"-等待阶段, "assigning"-分配阶段, "entering"-进入游戏
        Countdown      int                     `json:"countdown"`       // 倒计时秒数
        StartTime      int64                   `json:"start_time"`      // 阶段开始时间（Unix毫秒时间戳）
        TotalPlayers   int                     `json:"total_players"`   // 总报名人数
        EnteredPlayers int                     `json:"entered_players"` // 已点击进入的人数
        Players        []WaitingPlayerInfo     `json:"players"`         // 已进入玩家列表
        Message        string                  `json:"message"`         // 提示消息
}

// WaitingPlayerInfo 等待玩家信息
type WaitingPlayerInfo struct {
        PlayerID   string `json:"player_id"`   // 玩家ID
        PlayerName string `json:"player_name"` // 玩家昵称
        Avatar     string `json:"avatar"`      // 头像URL
        IsRobot    bool   `json:"is_robot"`    // 是否是机器人
        EnteredAt  int64  `json:"entered_at"`  // 进入时间戳
}

// ArenaWaitingTickPayload 等待阶段倒计时更新
// 服务端每秒推送一次
type ArenaWaitingTickPayload struct {
        PeriodNo       string `json:"period_no"`       // 期号
        RoomID         uint64 `json:"room_id"`         // 房间配置ID
        Countdown      int    `json:"countdown"`       // 剩余秒数
        EnteredPlayers int    `json:"entered_players"` // 已点击进入的人数
}

// ArenaAssignStartPayload 分配阶段开始
// 等待阶段结束后，服务端开始分配玩家到桌子，推送此消息
type ArenaAssignStartPayload struct {
        PeriodNo     string `json:"period_no"`     // 期号
        RoomID       uint64 `json:"room_id"`       // 房间配置ID
        TotalPlayers int    `json:"total_players"` // 总人数
        TotalTables  int    `json:"total_tables"`  // 总桌数
        Countdown    int    `json:"countdown"`     // 10秒倒计时
        Message      string `json:"message"`       // 提示消息："正在分配玩家，10秒后进入游戏"
}


// ============================================================
// 【新增】冠军跑马灯广播 Payload
// ============================================================

// ArenaChampionBroadcastPayload 冠军跑马灯广播
// 比赛结束时向所有在线玩家广播冠军信息，用于大厅跑马灯显示
type ArenaChampionBroadcastPayload struct {
        PeriodNo     string `json:"period_no"`      // 期号
        RoomID       uint64 `json:"room_id"`        // 房间配置ID
        RoomName     string `json:"room_name"`      // 房间名称（如"初级竞技场"）
        ChampionID   uint64 `json:"champion_id"`    // 冠军玩家ID
        ChampionName string `json:"champion_name"`  // 冠军昵称
        ChampionAvatar string `json:"champion_avatar"` // 冠军头像URL
        RunnerUpName   string `json:"runner_up_name"`   // 亚军昵称
        ThirdName      string `json:"third_name"`       // 季军昵称
        TotalPlayers   int    `json:"total_players"`    // 总参赛人数
        MatchCoin      int64  `json:"match_coin"`       // 冠军最终金币
        Message        string `json:"message"`          // 格式化消息："恭喜 玩家昵称 在期号 XXXXXX 夺得初级竞技场冠军！"
        Timestamp      int64  `json:"timestamp"`        // 时间戳（毫秒）
}
