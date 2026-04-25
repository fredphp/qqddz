// Package database 提供斗地主游戏的数据库模型和连接管理
package database

import (
        "time"

        "gorm.io/gorm"
)

// Player 玩家表模型
type Player struct {
        ID           uint64         `gorm:"primaryKey;autoIncrement;comment:玩家ID" json:"id"`
        Username     string         `gorm:"type:varchar(64);uniqueIndex;comment:用户名" json:"username"`
        Nickname     string         `gorm:"type:varchar(64);uniqueIndex;not null;comment:昵称" json:"nickname"`
        Avatar       string         `gorm:"type:varchar(256);default:'';comment:头像URL" json:"avatar"`
        Gender       uint8          `gorm:"type:tinyint unsigned;default:0;comment:性别:0-未知,1-男,2-女" json:"gender"`
        Gold         int64          `gorm:"type:bigint;not null;default:0;comment:金币余额" json:"gold"`
        Diamond      int            `gorm:"type:int;not null;default:0;comment:钻石余额" json:"diamond"`
        Experience   int            `gorm:"type:int;not null;default:0;comment:经验值" json:"experience"`
        Level        int            `gorm:"type:int;not null;default:1;comment:等级" json:"level"`
        VIPLevel     int            `gorm:"type:int;not null;default:0;comment:VIP等级" json:"vip_level"`
        WinCount     int            `gorm:"type:int;not null;default:0;comment:胜场数" json:"win_count"`
        LoseCount    int            `gorm:"type:int;not null;default:0;comment:负场数" json:"lose_count"`
        LandlordCount int           `gorm:"type:int;not null;default:0;comment:当地主次数" json:"landlord_count"`
        FarmerCount  int            `gorm:"type:int;not null;default:0;comment:当农民次数" json:"farmer_count"`
        Status       uint8          `gorm:"type:tinyint;not null;default:1;index;comment:状态:0-禁用,1-正常,2-封禁" json:"status"`
        LastLoginAt  *time.Time     `gorm:"type:datetime;comment:最后登录时间" json:"last_login_at"`
        LastLoginIP  string         `gorm:"type:varchar(64);default:'';comment:最后登录IP" json:"last_login_ip"`
        CreatedAt    time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt    time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt    gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`
}

// TableName 指定玩家表名
func (Player) TableName() string {
        return "ddz_players"
}

// RoomConfig 房间配置表模型
type RoomConfig struct {
        ID             uint64         `gorm:"primaryKey;autoIncrement;comment:配置ID" json:"id"`
        RoomName       string         `gorm:"type:varchar(64);not null;comment:房间名称" json:"room_name"`
        RoomType       uint8          `gorm:"type:tinyint;uniqueIndex;not null;default:1;comment:房间类型:1-普通场,2-高级场,3-富豪场,4-至尊场" json:"room_type"`
        BaseScore      int            `gorm:"type:int;not null;default:1;comment:底分" json:"base_score"`
        Multiplier     int            `gorm:"type:int;not null;default:1;comment:初始倍数" json:"multiplier"`
        MinGold        int64          `gorm:"type:bigint;not null;default:0;comment:最低入场金币" json:"min_gold"`
        MaxGold        int64          `gorm:"type:bigint;not null;default:0;comment:最高入场金币(0表示无限制)" json:"max_gold"`
        BotEnabled     uint8          `gorm:"type:tinyint;not null;default:1;comment:是否允许机器人:0-否,1-是" json:"bot_enabled"`
        BotCount       int            `gorm:"type:int;not null;default:0;comment:房间机器人数量" json:"bot_count"`
        FeeRate        float64        `gorm:"type:decimal(5,4);not null;default:0;comment:手续费率" json:"fee_rate"`
        MaxRound       int            `gorm:"type:int;not null;default:20;comment:最大回合数" json:"max_round"`
        TimeoutSeconds int            `gorm:"type:int;not null;default:30;comment:操作超时时间(秒)" json:"timeout_seconds"`
        Status         uint8          `gorm:"type:tinyint;not null;default:1;index;comment:状态:0-关闭,1-开启" json:"status"`
        SortOrder      int            `gorm:"type:int;not null;default:0;comment:排序权重" json:"sort_order"`
        Description    string         `gorm:"type:varchar(256);default:'';comment:房间描述" json:"description"`
        CreatedAt      time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt      time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt      gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`
}

// TableName 指定房间配置表名
func (RoomConfig) TableName() string {
        return "ddz_room_config"
}

// GameRecord 游戏记录表模型
type GameRecord struct {
        ID               uint64     `gorm:"primaryKey;autoIncrement;comment:游戏记录ID" json:"id"`
        GameID           string     `gorm:"type:varchar(64);uniqueIndex;not null;comment:游戏唯一标识" json:"game_id"`
        RoomID           string     `gorm:"type:varchar(64);index;not null;comment:房间ID" json:"room_id"`
        RoomType         uint8      `gorm:"type:tinyint;not null;default:1;comment:房间类型" json:"room_type"`
        LandlordID       uint64     `gorm:"type:bigint unsigned;index;not null;comment:地主玩家ID" json:"landlord_id"`
        Farmer1ID        uint64     `gorm:"type:bigint unsigned;index;not null;comment:农民1玩家ID" json:"farmer1_id"`
        Farmer2ID        uint64     `gorm:"type:bigint unsigned;index;not null;comment:农民2玩家ID" json:"farmer2_id"`
        BaseScore        int        `gorm:"type:int;not null;default:1;comment:底分" json:"base_score"`
        Multiplier       int        `gorm:"type:int;not null;default:1;comment:最终倍数" json:"multiplier"`
        BombCount        int        `gorm:"type:int;not null;default:0;comment:炸弹数量" json:"bomb_count"`
        Spring           uint8      `gorm:"type:tinyint;not null;default:0;comment:是否春天:0-否,1-地主春天,2-反春天" json:"spring"`
        Result           uint8      `gorm:"type:tinyint;not null;index;comment:结果:1-地主胜,2-农民胜" json:"result"`
        LandlordWinGold  int64      `gorm:"type:bigint;not null;default:0;comment:地主输赢金币" json:"landlord_win_gold"`
        Farmer1WinGold   int64      `gorm:"type:bigint;not null;default:0;comment:农民1输赢金币" json:"farmer1_win_gold"`
        Farmer2WinGold   int64      `gorm:"type:bigint;not null;default:0;comment:农民2输赢金币" json:"farmer2_win_gold"`
        StartedAt        time.Time  `gorm:"type:datetime;not null;index;comment:开始时间" json:"started_at"`
        EndedAt          *time.Time `gorm:"type:datetime;comment:结束时间" json:"ended_at"`
        DurationSeconds  int        `gorm:"type:int;not null;default:0;comment:游戏时长(秒)" json:"duration_seconds"`
        CreatedAt        time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`

        // 关联关系
        Landlord Player `gorm:"foreignKey:LandlordID" json:"landlord_info"`
        Farmer1  Player `gorm:"foreignKey:Farmer1ID" json:"farmer1_info"`
        Farmer2  Player `gorm:"foreignKey:Farmer2ID" json:"farmer2_info"`
}

// TableName 指定游戏记录表名
func (GameRecord) TableName() string {
        return "ddz_game_records"
}

// DealLog 发牌日志表模型
type DealLog struct {
        ID            uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID        string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID      uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        PlayerRole    uint8     `gorm:"type:tinyint;not null;comment:玩家角色:1-地主,2-农民" json:"player_role"`
        HandCards     string    `gorm:"type:varchar(64);not null;comment:手牌(逗号分隔)" json:"hand_cards"`
        CardsCount    int       `gorm:"type:int;not null;default:0;comment:手牌数量" json:"cards_count"`
        LandlordCards string    `gorm:"type:varchar(32);comment:底牌(仅地主有)" json:"landlord_cards"`
        CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player_info"`
}

// TableName 指定发牌日志表名
func (DealLog) TableName() string {
        return "ddz_deal_logs"
}

// BidLog 叫地主日志表模型
type BidLog struct {
        ID         uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID     string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID   uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        BidOrder   int       `gorm:"type:int;index;not null;comment:叫地主顺序(1-3)" json:"bid_order"`
        BidType    uint8     `gorm:"type:tinyint;not null;comment:叫地主类型:0-不叫,1-叫地主,2-抢地主" json:"bid_type"`
        BidScore   int       `gorm:"type:int;not null;default:0;comment:叫分(1-3分)" json:"bid_score"`
        IsSuccess  uint8     `gorm:"type:tinyint;not null;default:0;comment:是否成功成为地主" json:"is_success"`
        CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player_info"`
}

// TableName 指定叫地主日志表名
func (BidLog) TableName() string {
        return "ddz_bid_logs"
}

// PlayLog 出牌日志表模型
type PlayLog struct {
        ID          uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID      string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID    uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        PlayerRole  uint8     `gorm:"type:tinyint;not null;comment:玩家角色:1-地主,2-农民" json:"player_role"`
        RoundNum    int       `gorm:"type:int;index;not null;comment:回合数" json:"round_num"`
        PlayOrder   int       `gorm:"type:int;not null;comment:本回合出牌顺序" json:"play_order"`
        PlayType    uint8     `gorm:"type:tinyint;not null;comment:出牌类型:1-出牌,2-不出/过,3-超时自动出牌" json:"play_type"`
        Cards       string    `gorm:"type:varchar(64);default:'';comment:出的牌" json:"cards"`
        CardsCount  int       `gorm:"type:int;not null;default:0;comment:出牌数量" json:"cards_count"`
        CardPattern string    `gorm:"type:varchar(32);default:'';comment:牌型" json:"card_pattern"`
        IsBomb      uint8     `gorm:"type:tinyint;not null;default:0;comment:是否炸弹" json:"is_bomb"`
        IsRocket    uint8     `gorm:"type:tinyint;not null;default:0;comment:是否火箭" json:"is_rocket"`
        CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player_info"`
}

// TableName 指定出牌日志表名
func (PlayLog) TableName() string {
        return "ddz_play_logs"
}

// PlayerStats 玩家统计表模型
type PlayerStats struct {
        ID               uint64     `gorm:"primaryKey;autoIncrement;comment:统计ID" json:"id"`
        PlayerID         uint64     `gorm:"type:bigint unsigned;uniqueIndex:idx_player_date;not null;index;comment:玩家ID" json:"player_id"`
        StatDate         time.Time  `gorm:"type:date;uniqueIndex:idx_player_date;not null;index;comment:统计日期" json:"stat_date"`
        TotalGames       int        `gorm:"type:int;not null;default:0;comment:总场次" json:"total_games"`
        WinGames         int        `gorm:"type:int;not null;default:0;comment:胜场" json:"win_games"`
        LoseGames        int        `gorm:"type:int;not null;default:0;comment:负场" json:"lose_games"`
        WinRate          float64    `gorm:"type:decimal(5,2);not null;default:0;index;comment:胜率(%)" json:"win_rate"`
        LandlordGames    int        `gorm:"type:int;not null;default:0;comment:当地主场次" json:"landlord_games"`
        LandlordWins     int        `gorm:"type:int;not null;default:0;comment:当地主胜场" json:"landlord_wins"`
        FarmerGames      int        `gorm:"type:int;not null;default:0;comment:当农民场次" json:"farmer_games"`
        FarmerWins       int        `gorm:"type:int;not null;default:0;comment:当农民胜场" json:"farmer_wins"`
        TotalGoldChange  int64      `gorm:"type:bigint;not null;default:0;comment:总金币变化" json:"total_gold_change"`
        MaxWinGold       int64      `gorm:"type:bigint;not null;default:0;comment:单局最大赢金" json:"max_win_gold"`
        MaxLoseGold      int64      `gorm:"type:bigint;not null;default:0;comment:单局最大输金" json:"max_lose_gold"`
        TotalBombs       int        `gorm:"type:int;not null;default:0;comment:炸弹总数" json:"total_bombs"`
        TotalRockets     int        `gorm:"type:int;not null;default:0;comment:火箭总数" json:"total_rockets"`
        SpringCount      int        `gorm:"type:int;not null;default:0;comment:春天次数" json:"spring_count"`
        AntiSpringCount  int        `gorm:"type:int;not null;default:0;comment:反春天次数" json:"anti_spring_count"`
        AvgGameDuration  int        `gorm:"type:int;not null;default:0;comment:平均游戏时长(秒)" json:"avg_game_duration"`
        CreatedAt        time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt        time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player_info"`
}

// TableName 指定玩家统计表名
func (PlayerStats) TableName() string {
        return "ddz_player_stats"
}

// =============================================
// 常量定义
// =============================================

// PlayerStatus 玩家状态
const (
        PlayerStatusDisabled uint8 = 0 // 禁用
        PlayerStatusNormal   uint8 = 1 // 正常
        PlayerStatusBanned   uint8 = 2 // 封禁
)

// PlayerGender 玩家性别
const (
        PlayerGenderUnknown uint8 = 0 // 未知
        PlayerGenderMale    uint8 = 1 // 男
        PlayerGenderFemale  uint8 = 2 // 女
)

// RoomStatus 房间状态
const (
        RoomStatusClosed uint8 = 0 // 关闭
        RoomStatusOpen   uint8 = 1 // 开启
)

// RoomType 房间类型
const (
        RoomTypeNormal   uint8 = 1 // 普通场
        RoomTypeAdvanced uint8 = 2 // 高级场
        RoomTypeRich     uint8 = 3 // 富豪场
        RoomTypeVIP      uint8 = 4 // 至尊场
)

// PlayerRole 玩家角色
const (
        PlayerRoleLandlord uint8 = 1 // 地主
        PlayerRoleFarmer   uint8 = 2 // 农民
)

// GameResult 游戏结果
const (
        GameResultLandlordWin uint8 = 1 // 地主胜
        GameResultFarmerWin   uint8 = 2 // 农民胜
)

// SpringType 春天类型
const (
        SpringNone      uint8 = 0 // 无
        SpringLandlord  uint8 = 1 // 地主春天
        SpringAnti      uint8 = 2 // 反春天
)

// BidType 叫地主类型
const (
        BidTypePass   uint8 = 0 // 不叫
        BidTypeCall   uint8 = 1 // 叫地主
        BidTypeGrab   uint8 = 2 // 抢地主
)

// PlayType 出牌类型
const (
        PlayTypePlay    uint8 = 1 // 出牌
        PlayTypePass    uint8 = 2 // 不出/过
        PlayTypeTimeout uint8 = 3 // 超时自动出牌
)

// CardPattern 牌型常量
const (
        PatternSingle       = "单牌"
        PatternPair         = "对子"
        PatternTriple       = "三条"
        PatternTripleOne    = "三带一"
        PatternTripleTwo    = "三带二"
        PatternStraight     = "顺子"
        PatternStraightPair = "连对"
        PatternAirplane     = "飞机"
        PatternAirplaneSingle = "飞机带单"
        PatternAirplanePair   = "飞机带对"
        PatternFourTwo        = "四带二"
        PatternFourTwoPair    = "四带两对"
        PatternBomb           = "炸弹"
        PatternRocket         = "火箭"
)

// =============================================
// 辅助方法
// =============================================

// GetWinRate 计算胜率
func (p *Player) GetWinRate() float64 {
        total := p.WinCount + p.LoseCount
        if total == 0 {
                return 0
        }
        return float64(p.WinCount) * 100 / float64(total)
}

// GetTotalGames 获取总场次
func (p *Player) GetTotalGames() int {
        return p.WinCount + p.LoseCount
}

// CanEnterRoom 检查玩家是否可以进入指定房间
func (p *Player) CanEnterRoom(room *RoomConfig) (bool, string) {
        // 检查玩家状态
        if p.Status != PlayerStatusNormal {
                return false, "玩家状态异常"
        }
        
        // 检查金币是否足够
        if p.Gold < room.MinGold {
                return false, "金币不足"
        }
        
        // 检查金币是否超过上限
        if room.MaxGold > 0 && p.Gold > room.MaxGold {
                return false, "金币超过上限"
        }
        
        return true, ""
}

// IsLandlordWin 判断地主是否获胜
func (g *GameRecord) IsLandlordWin() bool {
        return g.Result == GameResultLandlordWin
}

// IsSpring 判断是否春天
func (g *GameRecord) IsSpring() bool {
        return g.Spring == SpringLandlord
}

// IsAntiSpring 判断是否反春天
func (g *GameRecord) IsAntiSpring() bool {
        return g.Spring == SpringAnti
}

// GetPlayerWinGold 获取指定玩家的输赢金币
func (g *GameRecord) GetPlayerWinGold(playerID uint64) int64 {
        if playerID == g.LandlordID {
                return g.LandlordWinGold
        }
        if playerID == g.Farmer1ID {
                return g.Farmer1WinGold
        }
        if playerID == g.Farmer2ID {
                return g.Farmer2WinGold
        }
        return 0
}

// IsBomb 判断出牌是否为炸弹
func (p *PlayLog) IsBombCard() bool {
        return p.IsBomb == 1 || p.IsRocket == 1
}

// GetWinRate 获取胜率
func (s *PlayerStats) GetWinRatePercent() float64 {
        return s.WinRate
}

// GetLandlordWinRate 获取地主胜率
func (s *PlayerStats) GetLandlordWinRate() float64 {
        if s.LandlordGames == 0 {
                return 0
        }
        return float64(s.LandlordWins) * 100 / float64(s.LandlordGames)
}

// GetFarmerWinRate 获取农民胜率
func (s *PlayerStats) GetFarmerWinRate() float64 {
        if s.FarmerGames == 0 {
                return 0
        }
        return float64(s.FarmerWins) * 100 / float64(s.FarmerGames)
}

// =============================================
// 用户账户相关模型
// =============================================

// UserAccount 用户账户表模型
type UserAccount struct {
        ID                   uint64         `gorm:"primaryKey;autoIncrement;comment:账户ID" json:"id"`
        PlayerID             uint64         `gorm:"uniqueIndex;not null;comment:关联玩家ID" json:"player_id"`
        Phone                string         `gorm:"type:varchar(20);uniqueIndex;comment:手机号" json:"phone"`
        Password             string         `gorm:"type:varchar(128);comment:密码(加密存储)" json:"-"`
        WxOpenID             string         `gorm:"type:varchar(64);index;comment:微信OpenID" json:"wx_openid"`
        WxUnionID            string         `gorm:"type:varchar(64);index;comment:微信UnionID" json:"wx_unionid"`
        WxSessionKey         string         `gorm:"type:varchar(64);comment:微信会话密钥" json:"-"`
        WxNickname           string         `gorm:"type:varchar(64);comment:微信昵称" json:"wx_nickname"`
        WxAvatar             string         `gorm:"type:varchar(256);comment:微信头像URL" json:"wx_avatar"`
        LoginType            uint8          `gorm:"type:tinyint;not null;default:1;comment:登录类型:1-手机号,2-微信,3-游客" json:"login_type"`
        Token                string         `gorm:"type:varchar(128);index;comment:登录Token" json:"-"`
        TokenExpireAt        *time.Time     `gorm:"type:datetime;comment:Token过期时间" json:"token_expire_at"`
        RefreshToken         string         `gorm:"type:varchar(128);comment:刷新Token" json:"-"`
        RefreshTokenExpireAt *time.Time     `gorm:"type:datetime;comment:刷新Token过期时间" json:"refresh_token_expire_at"`
        DeviceID             string         `gorm:"type:varchar(64);comment:设备ID" json:"device_id"`
        DeviceType           string         `gorm:"type:varchar(32);comment:设备类型" json:"device_type"`
        LastLoginAt          *time.Time     `gorm:"type:datetime;comment:最后登录时间" json:"last_login_at"`
        LastLoginIP          string         `gorm:"type:varchar(64);comment:最后登录IP" json:"last_login_ip"`
        LoginCount           int            `gorm:"type:int;not null;default:0;comment:登录次数" json:"login_count"`
        Status               uint8          `gorm:"type:tinyint;not null;default:1;index;comment:状态:0-禁用,1-正常,2-封禁" json:"status"`
        CreatedAt            time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt            time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt            gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`

        // 关联关系
        Player Player `gorm:"foreignKey:PlayerID" json:"player"`
}

// TableName 指定用户账户表名
func (UserAccount) TableName() string {
        return "ddz_user_accounts"
}

// SmsCode 短信验证码记录表模型
type SmsCode struct {
        ID        uint64     `gorm:"primaryKey;autoIncrement;comment:ID" json:"id"`
        Phone     string     `gorm:"type:varchar(20);index;not null;comment:手机号" json:"phone"`
        Code      string     `gorm:"type:varchar(10);not null;comment:验证码" json:"code"`
        Type      uint8      `gorm:"type:tinyint;not null;default:1;comment:类型:1-登录,2-注册,3-绑定手机,4-修改密码" json:"type"`
        IsUsed    uint8      `gorm:"type:tinyint;not null;default:0;comment:是否已使用:0-否,1-是" json:"is_used"`
        ExpireAt  time.Time  `gorm:"type:datetime;not null;comment:过期时间" json:"expire_at"`
        UsedAt    *time.Time `gorm:"type:datetime;comment:使用时间" json:"used_at"`
        IP        string     `gorm:"type:varchar(64);comment:请求IP" json:"ip"`
        CreatedAt time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// TableName 指定短信验证码表名
func (SmsCode) TableName() string {
        return "ddz_sms_codes"
}

// LoginLog 登录日志表模型
type LoginLog struct {
        ID          uint64     `gorm:"primaryKey;autoIncrement;comment:ID" json:"id"`
        PlayerID    uint64     `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        AccountID   uint64     `gorm:"type:bigint unsigned;index;comment:账户ID" json:"account_id"`
        LoginType   uint8      `gorm:"type:tinyint;not null;comment:登录类型:1-手机号,2-微信,3-游客" json:"login_type"`
        LoginResult uint8      `gorm:"type:tinyint;not null;comment:登录结果:0-失败,1-成功" json:"login_result"`
        FailReason  string     `gorm:"type:varchar(128);comment:失败原因" json:"fail_reason"`
        IP          string     `gorm:"type:varchar(64);comment:登录IP" json:"ip"`
        DeviceID    string     `gorm:"type:varchar(64);comment:设备ID" json:"device_id"`
        DeviceType  string     `gorm:"type:varchar(32);comment:设备类型" json:"device_type"`
        UserAgent   string     `gorm:"type:varchar(256);comment:User-Agent" json:"user_agent"`
        Location    string     `gorm:"type:varchar(64);comment:登录地点" json:"location"`
        CreatedAt   time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Player  Player      `gorm:"foreignKey:PlayerID" json:"player"`
        Account UserAccount `gorm:"foreignKey:AccountID" json:"account"`
}

// TableName 指定登录日志表名
func (LoginLog) TableName() string {
        return "ddz_login_logs"
}

// =============================================
// 登录类型常量
// =============================================

const (
        LoginTypePhone   uint8 = 1 // 手机号登录
        LoginTypeWechat  uint8 = 2 // 微信登录
        LoginTypeGuest   uint8 = 3 // 游客登录
)

const (
        LoginResultFail    uint8 = 0 // 登录失败
        LoginResultSuccess uint8 = 1 // 登录成功
)

const (
        SmsTypeLogin       uint8 = 1 // 登录
        SmsTypeRegister    uint8 = 2 // 注册
        SmsTypeBindPhone   uint8 = 3 // 绑定手机
        SmsTypeResetPwd    uint8 = 4 // 修改密码
)

// =============================================
// 用户账户辅助方法
// =============================================

// IsPhoneLogin 是否手机号登录
func (u *UserAccount) IsPhoneLogin() bool {
        return u.LoginType == LoginTypePhone
}

// IsWechatLogin 是否微信登录
func (u *UserAccount) IsWechatLogin() bool {
        return u.LoginType == LoginTypeWechat
}

// IsTokenValid 检查Token是否有效
func (u *UserAccount) IsTokenValid() bool {
        if u.Token == "" || u.TokenExpireAt == nil {
                return false
        }
        return u.TokenExpireAt.After(time.Now())
}

// IsRefreshTokenValid 检查刷新Token是否有效
func (u *UserAccount) IsRefreshTokenValid() bool {
        if u.RefreshToken == "" || u.RefreshTokenExpireAt == nil {
                return false
        }
        return u.RefreshTokenExpireAt.After(time.Now())
}

// IsNormal 是否正常状态
func (u *UserAccount) IsNormal() bool {
        return u.Status == PlayerStatusNormal
}
