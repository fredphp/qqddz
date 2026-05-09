// Package database 提供竞技场系统的数据库模型
package database

import (
        "database/sql/driver"
        "encoding/json"
        "errors"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 竞技场比赛配置表
// =============================================

// ArenaMatchConfig 竞技场比赛配置表模型
type ArenaMatchConfig struct {
        ID                uint64         `gorm:"primaryKey;autoIncrement;comment:配置ID" json:"id"`
        RoomConfigID      uint64         `gorm:"type:bigint unsigned;not null;index;comment:关联房间配置ID" json:"room_config_id"`
        MatchTimeRanges   MatchTimeRanges `gorm:"type:json;comment:开赛时间段" json:"match_time_ranges"`
        MatchRoundDuration int           `gorm:"type:int;not null;default:5;comment:每场时长(分钟)" json:"match_round_duration"`
        MatchRoundCount   int           `gorm:"type:int;not null;default:3;comment:比赛轮次" json:"match_round_count"`
        SignupFee         int64         `gorm:"type:bigint;not null;default:0;comment:报名费(竞技币)" json:"signup_fee"`
        MaxPlayers        int           `gorm:"type:int;not null;default:9;comment:最大参赛人数" json:"max_players"`
        MinPlayers        int           `gorm:"type:int;not null;default:3;comment:最小开赛人数" json:"min_players"`
        ChampionRewardID  *uint64       `gorm:"type:bigint unsigned;comment:冠军奖励ID" json:"champion_reward_id"`
        RunnerUpRewardID  *uint64       `gorm:"type:bigint unsigned;comment:亚军奖励ID" json:"runner_up_reward_id"`
        ThirdRewardID     *uint64       `gorm:"type:bigint unsigned;comment:季军奖励ID" json:"third_reward_id"`
        SignupStartTime   string        `gorm:"type:varchar(8);default:'00:00';comment:报名开始时间" json:"signup_start_time"`
        SignupEndTime     string        `gorm:"type:varchar(8);default:'23:59';comment:报名结束时间" json:"signup_end_time"`
        AutoStart         uint8         `gorm:"type:tinyint unsigned;not null;default:1;comment:是否自动开赛:0-否,1-是" json:"auto_start"`
        Status            uint8         `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态:0-关闭,1-开启" json:"status"`
        Description       string        `gorm:"type:varchar(512);default:'';comment:比赛描述" json:"description"`
        CreatedAt         time.Time     `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt         time.Time     `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt         gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`

        // 关联关系
        RoomConfig      RoomConfig   `gorm:"foreignKey:RoomConfigID" json:"room_config"`
        ChampionReward  *RewardGoods `gorm:"foreignKey:ChampionRewardID" json:"champion_reward"`
        RunnerUpReward  *RewardGoods `gorm:"foreignKey:RunnerUpRewardID" json:"runner_up_reward"`
        ThirdReward     *RewardGoods `gorm:"foreignKey:ThirdRewardID" json:"third_reward"`
}

// TableName 指定竞技场比赛配置表名
func (ArenaMatchConfig) TableName() string {
        return "ddz_arena_match_config"
}

// MatchTimeRange 开赛时间段
type MatchTimeRange struct {
        Start string `json:"start"` // 开始时间，格式：HH:MM
        End   string `json:"end"`   // 结束时间，格式：HH:MM
}

// MatchTimeRanges 开赛时间段列表
type MatchTimeRanges []MatchTimeRange

// Value 实现driver.Valuer接口
func (m MatchTimeRanges) Value() (driver.Value, error) {
        if m == nil {
                return nil, nil
        }
        return json.Marshal(m)
}

// Scan 实现sql.Scanner接口
func (m *MatchTimeRanges) Scan(value interface{}) error {
        if value == nil {
                *m = nil
                return nil
        }
        bytes, ok := value.([]byte)
        if !ok {
                return errors.New("type assertion to []byte failed")
        }
        return json.Unmarshal(bytes, m)
}

// IsTimeInRange 检查指定时间是否在开赛时间范围内
func (m MatchTimeRanges) IsTimeInRange(t time.Time) bool {
        if len(m) == 0 {
                return true // 没有配置时间段，默认全天可开赛
        }
        currentTime := t.Format("15:04")
        for _, tr := range m {
                if currentTime >= tr.Start && currentTime <= tr.End {
                        return true
                }
        }
        return false
}

// =============================================
// 比赛会话表
// =============================================

// ArenaSession 比赛会话表模型
type ArenaSession struct {
        ID                 uint64     `gorm:"primaryKey;autoIncrement;comment:会话ID" json:"id"`
        SessionCode        string     `gorm:"type:varchar(32);uniqueIndex;not null;comment:会话编码" json:"session_code"`
        PeriodNo           string     `gorm:"type:varchar(20);index;comment:期号(格式J202605060001)" json:"period_no"`
        RoomConfigID       uint64     `gorm:"type:bigint unsigned;not null;index;comment:关联房间配置ID" json:"room_config_id"`
        MatchConfigID      uint64     `gorm:"type:bigint unsigned;not null;index;comment:关联比赛配置ID" json:"match_config_id"`
        ScheduledStartTime time.Time  `gorm:"type:datetime;not null;comment:计划开始时间" json:"scheduled_start_time"`
        ActualStartTime    *time.Time `gorm:"type:datetime;comment:实际开始时间" json:"actual_start_time"`
        EndTime            *time.Time `gorm:"type:datetime;comment:结束时间" json:"end_time"`
        SignupDeadline     *time.Time `gorm:"type:datetime;comment:报名截止时间" json:"signup_deadline"`
        Status             uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
        CurrentRound       int        `gorm:"type:int;not null;default:0;comment:当前轮次" json:"current_round"`
        TotalRounds        int        `gorm:"type:int;not null;default:3;comment:总轮次" json:"total_rounds"`
        // 动态淘汰赛新增字段
        EliminationRules     string     `gorm:"type:varchar(255);default:'[60,30,18,9,3]';comment:淘汰规则JSON数组" json:"elimination_rules"`
        CurrentEliminationIdx int       `gorm:"type:int;not null;default:0;comment:当前淘汰规则索引" json:"current_elimination_idx"`
        TournamentStage      string     `gorm:"type:varchar(32);default:'SIGNUP';comment:赛事阶段" json:"tournament_stage"`
        RankWaitUntil        *time.Time `gorm:"type:datetime;comment:排行榜阶段等待截止时间" json:"rank_wait_until"`
        TablesCompleted      int        `gorm:"type:int;not null;default:0;comment:本轮已完成的桌数" json:"tables_completed"`
        TotalPlayers       int        `gorm:"type:int;not null;default:0;comment:参赛人数" json:"total_players"`
        ActivePlayers      int        `gorm:"type:int;not null;default:0;comment:剩余人数" json:"active_players"`
        SignupFee          int64      `gorm:"type:bigint;not null;default:0;comment:报名费(竞技币)" json:"signup_fee"`
        ChampionID         *uint64    `gorm:"type:bigint unsigned;comment:冠军玩家ID" json:"champion_id"`
        RunnerUpID         *uint64    `gorm:"type:bigint unsigned;comment:亚军玩家ID" json:"runner_up_id"`
        ThirdID            *uint64    `gorm:"type:bigint unsigned;comment:季军玩家ID" json:"third_id"`
        CreatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        RoomConfig  RoomConfig `gorm:"foreignKey:RoomConfigID" json:"room_config"`
        MatchConfig ArenaMatchConfig `gorm:"foreignKey:MatchConfigID" json:"match_config"`
        Champion    *Player    `gorm:"foreignKey:ChampionID" json:"champion"`
        RunnerUp    *Player    `gorm:"foreignKey:RunnerUpID" json:"runner_up"`
        Third       *Player    `gorm:"foreignKey:ThirdID" json:"third"`
}

// TableName 指定比赛会话表名
func (ArenaSession) TableName() string {
        return "ddz_arena_sessions"
}

// ArenaSessionStatus 比赛会话状态常量
const (
        ArenaSessionStatusWaitingSignup   uint8 = 0 // 等待报名
        ArenaSessionStatusSigningUp       uint8 = 1 // 报名中
        ArenaSessionStatusWaitingStart    uint8 = 2 // 等待开赛
        ArenaSessionStatusInProgress      uint8 = 3 // 进行中
        ArenaSessionStatusEnded           uint8 = 4 // 已结束
        ArenaSessionStatusCancelled       uint8 = 5 // 已取消
)

// IsInProgress 是否进行中
func (s *ArenaSession) IsInProgress() bool {
        return s.Status == ArenaSessionStatusInProgress
}

// IsEnded 是否已结束
func (s *ArenaSession) IsEnded() bool {
        return s.Status == ArenaSessionStatusEnded
}

// CanSignup 是否可以报名
func (s *ArenaSession) CanSignup() bool {
        return s.Status == ArenaSessionStatusWaitingSignup || s.Status == ArenaSessionStatusSigningUp
}

// =============================================
// 参赛记录表
// =============================================

// ArenaParticipation 参赛记录表模型
// 职责：比赛过程数据 + 实时排名 + 淘汰状态
// 与 ArenaPeriodPlayer 的区别：
// - ArenaPeriodPlayer: 报名管理 + 历史记录查询（按月分表）- 存储 signup_time, signup_fee
// - ArenaParticipation: 比赛过程数据（主表，支持事务操作）- 存储 match_coin, 淘汰信息
type ArenaParticipation struct {
        ID              uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        SessionID       uint64     `gorm:"type:bigint unsigned;uniqueIndex:uk_session_player;not null;index;comment:比赛会话ID" json:"session_id"`
        PlayerID        uint64     `gorm:"type:bigint unsigned;uniqueIndex:uk_session_player;not null;index;comment:玩家ID" json:"player_id"`
        PeriodNo        string     `gorm:"type:varchar(20);index;comment:期号(关联报名记录)" json:"period_no"` // 关联期号
        RobotID         uint64     `gorm:"type:bigint unsigned;not null;default:0;comment:机器人ID(当is_robot=1时等于player_id)" json:"robot_id"`
        IsRobot         uint8      `gorm:"type:tinyint;not null;default:0;comment:是否机器人:0-否,1-是" json:"is_robot"`
        // 动态淘汰赛新增字段
        IsTournamentBot uint8      `gorm:"type:tinyint;not null;default:0;comment:是否为锦标赛补位机器人(不可获奖)" json:"is_tournament_bot"`
        LetWinEnabled   uint8      `gorm:"type:tinyint;not null;default:0;comment:是否启用让牌策略" json:"let_win_enabled"`
        // 比赛过程数据（开赛时初始化）
        MatchCoin       int64      `gorm:"type:bigint;not null;default:0;comment:比赛金币(用于排名，开赛时初始化)" json:"match_coin"`
        RoundMatchCoin  int64      `gorm:"type:bigint;not null;default:0;comment:本轮比赛金币(每轮重置)" json:"round_match_coin"`
        CurrentRound    int        `gorm:"type:int;not null;default:0;comment:当前所在轮次" json:"current_round"`
        Rank            *int       `gorm:"type:int;comment:最终排名" json:"rank"`
        IsEliminated    uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:是否淘汰" json:"is_eliminated"`
        EliminatedRound *int       `gorm:"type:int;comment:淘汰轮次" json:"eliminated_round"`
        EliminatedReason string    `gorm:"type:varchar(32);comment:淘汰原因" json:"eliminated_reason"`
        IsChampion      uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:是否冠军" json:"is_champion"`
        IsOnline        uint8      `gorm:"type:tinyint unsigned;not null;default:1;comment:是否在线" json:"is_online"`
        LastTableID     *string    `gorm:"type:varchar(32);comment:最后所在桌号" json:"last_table_id"`
        CurrentTableID  *uint64    `gorm:"type:bigint unsigned;comment:当前所在桌ID" json:"current_table_id"`
        RewardClaimed   uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:奖励是否已领取" json:"reward_claimed"`
        CreatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        Session ArenaSession `gorm:"foreignKey:SessionID" json:"session"`
        Player  Player       `gorm:"foreignKey:PlayerID" json:"player"`
}

// TableName 指定参赛记录表名
func (ArenaParticipation) TableName() string {
        return "ddz_arena_participations"
}

// EliminatedReason 淘汰原因常量
const (
        EliminatedReasonLose       = "lose"       // 输掉比赛
        EliminatedReasonDisconnect = "disconnect" // 掉线
        EliminatedReasonForfeit    = "forfeit"    // 弃权
)

// IsActive 是否仍在比赛中
func (p *ArenaParticipation) IsActive() bool {
        return p.IsEliminated == 0 && p.IsOnline == 1
}

// =============================================
// 比赛桌表
// =============================================

// ArenaTable 比赛桌表模型
type ArenaTable struct {
        ID         uint64     `gorm:"primaryKey;autoIncrement;comment:桌ID" json:"id"`
        TableCode  string     `gorm:"type:varchar(32);uniqueIndex;not null;comment:桌编码" json:"table_code"`
        SessionID  uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛会话ID" json:"session_id"`
        RoundNum   int        `gorm:"type:int;not null;default:1;index;comment:轮次" json:"round_num"`
        Player1ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家1 ID" json:"player1_id"`
        Player2ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家2 ID" json:"player2_id"`
        Player3ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家3 ID" json:"player3_id"`
        Status     uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
        GameID     *string    `gorm:"type:varchar(64);comment:当前游戏ID" json:"game_id"`
        CreatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        Session ArenaSession `gorm:"foreignKey:SessionID" json:"session"`
        Player1 *Player      `gorm:"foreignKey:Player1ID" json:"player1"`
        Player2 *Player      `gorm:"foreignKey:Player2ID" json:"player2"`
        Player3 *Player      `gorm:"foreignKey:Player3ID" json:"player3"`
}

// TableName 指定比赛桌表名
func (ArenaTable) TableName() string {
        return "ddz_arena_tables"
}

// ArenaTableStatus 比赛桌状态常量
const (
        ArenaTableStatusWaiting uint8 = 0 // 等待玩家
        ArenaTableStatusPlaying uint8 = 1 // 游戏中
        ArenaTableStatusEnded   uint8 = 2 // 已结束
)

// GetPlayers 获取所有玩家ID
func (t *ArenaTable) GetPlayers() []uint64 {
        players := make([]uint64, 0, 3)
        if t.Player1ID != nil {
                players = append(players, *t.Player1ID)
        }
        if t.Player2ID != nil {
                players = append(players, *t.Player2ID)
        }
        if t.Player3ID != nil {
                players = append(players, *t.Player3ID)
        }
        return players
}

// IsFull 是否已满
func (t *ArenaTable) IsFull() bool {
        return t.Player1ID != nil && t.Player2ID != nil && t.Player3ID != nil
}

// PlayerCount 获取玩家数量
func (t *ArenaTable) PlayerCount() int {
        count := 0
        if t.Player1ID != nil {
                count++
        }
        if t.Player2ID != nil {
                count++
        }
        if t.Player3ID != nil {
                count++
        }
        return count
}

// =============================================
// 奖励商品表
// =============================================

// RewardGoods 奖励商品表模型
type RewardGoods struct {
        ID              uint64         `gorm:"primaryKey;autoIncrement;comment:商品ID" json:"id"`
        Name            string         `gorm:"type:varchar(128);not null;comment:商品名称" json:"name"`
        Image           string         `gorm:"type:varchar(512);default:'';comment:商品图片URL" json:"image"`
        RoomConfigID    *uint64        `gorm:"type:bigint unsigned;index;comment:绑定房间配置ID" json:"room_config_id"`
        DetailRichtext  string         `gorm:"type:text;comment:富文本详情" json:"detail_richtext"`
        RewardType      uint8          `gorm:"type:tinyint unsigned;not null;default:1;comment:奖励类型" json:"reward_type"`
        RewardValue     int64          `gorm:"type:bigint;not null;default:0;comment:奖励价值" json:"reward_value"`
        Stock           int            `gorm:"type:int;not null;default:-1;comment:库存(-1表示无限制)" json:"stock"`
        Status          uint8          `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态" json:"status"`
        SortOrder       int            `gorm:"type:int;not null;default:0;comment:排序权重" json:"sort_order"`
        CreatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt       gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`

        // 关联关系
        RoomConfig *RoomConfig `gorm:"foreignKey:RoomConfigID" json:"room_config"`
}

// TableName 指定奖励商品表名
func (RewardGoods) TableName() string {
        return "ddz_reward_goods"
}

// RewardType 奖励类型常量
const (
        RewardTypePhysical uint8 = 1 // 实物
        RewardTypeCurrency uint8 = 2 // 虚拟货币
        RewardTypeItem     uint8 = 3 // 虚拟道具
)

// RewardGoodsStatus 奖励商品状态常量
const (
        RewardGoodsStatusOffline uint8 = 0 // 下架
        RewardGoodsStatusOnline  uint8 = 1 // 上架
)

// HasStock 是否有库存
func (r *RewardGoods) HasStock() bool {
        return r.Stock < 0 || r.Stock > 0
}

// IsVirtual 是否虚拟奖励
func (r *RewardGoods) IsVirtual() bool {
        return r.RewardType == RewardTypeCurrency || r.RewardType == RewardTypeItem
}

// =============================================
// 奖励订单表
// =============================================

// RewardOrder 奖励订单表模型
type RewardOrder struct {
        ID              uint64     `gorm:"primaryKey;autoIncrement;comment:订单ID" json:"id"`
        OrderNo         string     `gorm:"type:varchar(32);uniqueIndex;not null;comment:订单编号" json:"order_no"`
        PlayerID        uint64     `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        RewardID        uint64     `gorm:"type:bigint unsigned;not null;index;comment:奖励商品ID" json:"reward_id"`
        RoomConfigID    *uint64    `gorm:"type:bigint unsigned;comment:房间配置ID" json:"room_config_id"`
        SessionID       *uint64    `gorm:"type:bigint unsigned;comment:比赛会话ID" json:"session_id"`
        Rank            *int       `gorm:"type:int;comment:获得排名" json:"rank"`
        Status          uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
        ReceiverName    string     `gorm:"type:varchar(64);comment:收货人姓名" json:"receiver_name"`
        ReceiverPhone   string     `gorm:"type:varchar(20);comment:收货人手机" json:"receiver_phone"`
        ReceiverAddress string     `gorm:"type:varchar(512);comment:收货地址" json:"receiver_address"`
        ExpressCompany  string     `gorm:"type:varchar(64);comment:快递公司" json:"express_company"`
        ExpressNo       string     `gorm:"type:varchar(64);comment:快递单号" json:"express_no"`
        ShippedAt       *time.Time `gorm:"type:datetime;comment:发货时间" json:"shipped_at"`
        CompletedAt     *time.Time `gorm:"type:datetime;comment:完成时间" json:"completed_at"`
        Remark          string     `gorm:"type:varchar(256);comment:备注" json:"remark"`
        CreatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        Player     Player       `gorm:"foreignKey:PlayerID" json:"player"`
        Reward     RewardGoods  `gorm:"foreignKey:RewardID" json:"reward"`
        RoomConfig *RoomConfig  `gorm:"foreignKey:RoomConfigID" json:"room_config"`
        Session    *ArenaSession `gorm:"foreignKey:SessionID" json:"session"`
}

// TableName 指定奖励订单表名
func (RewardOrder) TableName() string {
        return "ddz_reward_orders"
}

// RewardOrderStatus 奖励订单状态常量
const (
        RewardOrderStatusPendingInfo   uint8 = 0 // 待填写
        RewardOrderStatusPendingShip   uint8 = 1 // 待发货
        RewardOrderStatusShipped       uint8 = 2 // 已发货
        RewardOrderStatusCompleted     uint8 = 3 // 已完成
        RewardOrderStatusCancelled     uint8 = 4 // 已取消
)

// NeedsShipping 是否需要发货
func (o *RewardOrder) NeedsShipping() bool {
        return o.Status == RewardOrderStatusPendingShip || o.Status == RewardOrderStatusShipped
}

// IsPendingInfo 是否待填写收货信息
func (o *RewardOrder) IsPendingInfo() bool {
        return o.Status == RewardOrderStatusPendingInfo
}

// =============================================
// 比赛轮次记录表
// =============================================

// ArenaRoundRecord 比赛轮次记录表模型
type ArenaRoundRecord struct {
        ID                 uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        SessionID          uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛会话ID" json:"session_id"`
        TableID            uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛桌ID" json:"table_id"`
        GameID             string     `gorm:"type:varchar(64);not null;index;comment:游戏ID" json:"game_id"`
        RoundNum           int        `gorm:"type:int;not null;index;comment:轮次" json:"round_num"`
        LandlordID         uint64     `gorm:"type:bigint unsigned;not null;comment:地主玩家ID" json:"landlord_id"`
        Farmer1ID          uint64     `gorm:"type:bigint unsigned;not null;comment:农民1玩家ID" json:"farmer1_id"`
        Farmer2ID          uint64     `gorm:"type:bigint unsigned;not null;comment:农民2玩家ID" json:"farmer2_id"`
        LandlordWin        uint8      `gorm:"type:tinyint unsigned;not null;comment:地主是否获胜" json:"landlord_win"`
        LandlordCoinChange int64      `gorm:"type:bigint;not null;default:0;comment:地主比赛金币变化" json:"landlord_coin_change"`
        Farmer1CoinChange  int64      `gorm:"type:bigint;not null;default:0;comment:农民1比赛金币变化" json:"farmer1_coin_change"`
        Farmer2CoinChange  int64      `gorm:"type:bigint;not null;default:0;comment:农民2比赛金币变化" json:"farmer2_coin_change"`
        Multiplier         int        `gorm:"type:int;not null;default:1;comment:倍数" json:"multiplier"`
        StartedAt          time.Time  `gorm:"type:datetime;not null;comment:开始时间" json:"started_at"`
        EndedAt            *time.Time `gorm:"type:datetime;comment:结束时间" json:"ended_at"`
        CreatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`

        // 关联关系
        Session  ArenaSession `gorm:"foreignKey:SessionID" json:"session"`
        Table    ArenaTable   `gorm:"foreignKey:TableID" json:"table"`
        Landlord Player       `gorm:"foreignKey:LandlordID" json:"landlord"`
        Farmer1  Player       `gorm:"foreignKey:Farmer1ID" json:"farmer1"`
        Farmer2  Player       `gorm:"foreignKey:Farmer2ID" json:"farmer2"`
}

// TableName 指定比赛轮次记录表名
func (ArenaRoundRecord) TableName() string {
        return "ddz_arena_round_records"
}

// =============================================
// 广告奖励记录表
// =============================================

// AdReward 广告奖励记录表模型
type AdReward struct {
        ID            uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PlayerID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        AdType        string    `gorm:"type:varchar(32);not null;index;comment:广告类型" json:"ad_type"`
        RewardAmount  int64     `gorm:"type:bigint;not null;default:0;comment:奖励数量" json:"reward_amount"`
        BalanceBefore int64     `gorm:"type:bigint;not null;default:0;comment:奖励前余额" json:"balance_before"`
        BalanceAfter  int64     `gorm:"type:bigint;not null;default:0;comment:奖励后余额" json:"balance_after"`
        AdPlatform    string    `gorm:"type:varchar(32);default:'';comment:广告平台" json:"ad_platform"`
        AdID         string    `gorm:"type:varchar(64);default:'';comment:广告ID" json:"ad_id"`
        Status        uint8     `gorm:"type:tinyint unsigned;not null;default:1;comment:状态" json:"status"`
        CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player"`
}

// TableName 指定广告奖励记录表名
func (AdReward) TableName() string {
        return "ddz_ad_rewards"
}

// AdType 广告类型常量
const (
        AdTypeBean      = "bean"       // 欢乐豆
        AdTypeArenaCoin = "arena_coin" // 竞技币
)

// AdRewardStatus 广告奖励状态常量
const (
        AdRewardStatusFail    uint8 = 0 // 失败
        AdRewardStatusSuccess uint8 = 1 // 成功
)
