// Package database 提供斗地主游戏的数据库模型和连接管理
package database

import (
        "time"

        "gorm.io/gorm"
)

// =============================================
// 机器人AI配置表
// =============================================

// RobotConfig 机器人AI配置表
// 对应 ddz_robot_config 表，存储机器人的AI策略配置
type RobotConfig struct {
        ID                  uint64         `gorm:"primaryKey;autoIncrement;comment:配置ID" json:"id"`
        ConfigName          string         `gorm:"type:varchar(64);not null;comment:配置名称" json:"config_name"`
        
        // 思考时间参数（模拟真人思考）
        MinThinkTime        int            `gorm:"type:int;not null;default:1500;comment:最小思考时间(毫秒)" json:"min_think_time"`
        MaxThinkTime        int            `gorm:"type:int;not null;default:3000;comment:最大思考时间(毫秒)" json:"max_think_time"`
        BombThinkTime       int            `gorm:"type:int;not null;default:4000;comment:炸弹思考时间(毫秒)" json:"bomb_think_time"`
        
        // 出牌行为参数
        BombProbability     float64        `gorm:"type:decimal(5,2);not null;default:0.60;comment:炸弹使用概率(0-1)" json:"bomb_probability"`
        LandlordBidProb     float64        `gorm:"type:decimal(5,2);not null;default:0.50;comment:抢地主概率(0-1)" json:"landlord_bid_probability"`
        
        // 决赛让牌参数
        LetWinProbability   float64        `gorm:"type:decimal(5,2);not null;default:0.85;comment:决赛让牌概率(0-1)" json:"let_win_probability"`
        LetWinMinRank       int            `gorm:"type:int;not null;default:3;comment:触发让牌的最小排名" json:"let_win_min_rank"`
        
        // 其他
        IsDefault           uint8          `gorm:"type:tinyint;not null;default:1;comment:是否默认配置" json:"is_default"`
        CreatedAt           time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt           time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        DeletedAt           gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"deleted_at"`
}

// TableName 指定机器人配置表名
func (RobotConfig) TableName() string {
        return "ddz_robot_config"
}

// =============================================
// 机器人运行时状态（内存结构，不存数据库）
// =============================================

// RobotRuntime 机器人运行时状态
// 存储在内存中，不创建数据库表
type RobotRuntime struct {
        RobotID            uint64    `json:"robot_id"`             // 机器人ID
        PlayerID           string    `json:"player_id"`            // PlayerID
        SessionID          uint64    `json:"session_id"`           // 当前竞技场会话ID
        PeriodID           uint64    `json:"period_id"`            // 期号ID
        RoomConfigID       uint64    `json:"room_config_id"`       // 房间配置ID
        
        // AI状态
        LetWinEnabled      bool      `json:"let_win_enabled"`      // 是否启用让牌
        LetWinTargetID     uint64    `json:"let_win_target_id"`    // 让牌目标玩家ID
        ThinkTimeMin       int       `json:"think_time_min"`       // 最小思考时间
        ThinkTimeMax       int       `json:"think_time_max"`       // 最大思考时间
        
        // 游戏状态
        CurrentTableID     uint64    `json:"current_table_id"`     // 当前比赛桌ID
        HandCards          []int     `json:"hand_cards"`           // 手牌
        
        // 时间
        LockedAt           time.Time `json:"locked_at"`            // 锁定时间
        LastActiveAt       time.Time `json:"last_active_at"`       // 最后活跃时间
}

// IsLetWinEnabled 检查是否启用让牌策略
func (r *RobotRuntime) IsLetWinEnabled() bool {
        return r.LetWinEnabled
}

// =============================================
// 机器人AI配置（内存结构，用于AI决策）
// =============================================

// RobotAIConfig 机器人AI配置
// 用于AI决策时的参数配置
type RobotAIConfig struct {
        // 叫地主参数
        BidThreshold       float64 `json:"bid_threshold"`        // 叫地主阈值
        GrabThreshold      float64 `json:"grab_threshold"`       // 抢地主阈值
        BidAggressiveness  float64 `json:"bid_aggressiveness"`   // 叫地主激进程度(0-1)

        // 出牌参数
        PlayAggressiveness float64 `json:"play_aggressiveness"`  // 出牌激进程度(0-1)
        PlayStrength       int     `json:"play_strength"`        // 出牌强度(0-100)
        MistakeProbability int     `json:"mistake_probability"`  // 失误概率(0-100)

        // 让牌参数
        LetWinThreshold    float64 `json:"let_win_threshold"`    // 让牌阈值
        LetWinCardCount    int     `json:"let_win_card_count"`   // 让牌触发牌数
        LetWinAllowed      bool    `json:"let_win_allowed"`      // 是否允许让牌

        // 思考时间
        BaseThinkTime      int     `json:"base_think_time"`      // 基础思考时间(ms)
        MinThinkTime       int     `json:"min_think_time"`       // 最小思考时间(ms)
        MaxThinkTime       int     `json:"max_think_time"`       // 最大思考时间(ms)
        BombThinkTime      int     `json:"bomb_think_time"`      // 炸弹思考时间(ms)

        // 炸弹使用参数
        BombProbability    float64 `json:"bomb_probability"`     // 炸弹使用概率(0-1)
        BombThreshold      float64 `json:"bomb_threshold"`       // 炸弹使用阈值
        RocketThreshold    float64 `json:"rocket_threshold"`     // 王炸使用阈值

        // 策略模式
        StrategyMode       uint8   `json:"strategy_mode"`        // 策略模式: 1-进攻, 2-防守, 3-平衡

        // 记牌器
        MemoryEnabled      bool    `json:"memory_enabled"`       // 是否启用记牌器
}

// IsLetWinAllowed 检查是否允许让牌
func (c *RobotAIConfig) IsLetWinAllowed() bool {
        return c.LetWinAllowed
}

// IsMemoryEnabled 检查是否启用记牌器
func (c *RobotAIConfig) IsMemoryEnabled() bool {
        return c.MemoryEnabled
}

// RobotAIConfigDefault 默认AI配置
func RobotAIConfigDefault() *RobotAIConfig {
        return &RobotAIConfig{
                BidThreshold:       0.6,
                GrabThreshold:      0.7,
                BidAggressiveness:  0.5,
                PlayAggressiveness: 0.5,
                PlayStrength:       50,
                MistakeProbability: 10,
                LetWinThreshold:    0.8,
                LetWinCardCount:    3,
                LetWinAllowed:      true,
                BaseThinkTime:      2000,
                MinThinkTime:       1500,
                MaxThinkTime:       3000,
                BombThinkTime:      4000,
                BombProbability:    0.6,
                BombThreshold:      0.5,
                RocketThreshold:    0.3,
                StrategyMode:       StrategyModeBalanced,
                MemoryEnabled:      true,
        }
}

// =============================================
// 机器人等级常量
// =============================================

const (
        RobotLevelBeginner uint8 = 1 // 初级机器人
        RobotLevelNormal   uint8 = 2 // 普通机器人
        RobotLevelAdvanced uint8 = 3 // 高级机器人
)

// =============================================
// 策略模式常量
// =============================================

const (
        StrategyModeAttack   uint8 = 1 // 进攻模式
        StrategyModeDefense  uint8 = 2 // 防守模式
        StrategyModeBalanced uint8 = 3 // 平衡模式
)

// =============================================
// 辅助方法
// =============================================

// GetRobotStatusText 获取机器人状态文本
func GetRobotStatusText(status uint8) string {
        switch status {
        case RobotStatusIdle:
                return "空闲"
        case RobotStatusInArena:
                return "竞技场中"
        default:
                return "未知"
        }
}

// GetRobotLevelText 获取机器人等级文本
func GetRobotLevelText(level uint8) string {
        switch level {
        case RobotLevelBeginner:
                return "初级"
        case RobotLevelNormal:
                return "普通"
        case RobotLevelAdvanced:
                return "高级"
        default:
                return "未知"
        }
}

// IsRobotAvailable 检查玩家是否为可用机器人
// 需要满足: player_type=2 且 robot_status=0
func IsRobotAvailable(player *Player) bool {
        return player.PlayerType == PlayerTypeRobot && player.RobotStatus == RobotStatusIdle
}

// RobotConfigDefault 默认配置
func RobotConfigDefault() *RobotConfig {
        return &RobotConfig{
                ConfigName:       "默认配置",
                MinThinkTime:     1500,
                MaxThinkTime:     3000,
                BombThinkTime:    4000,
                BombProbability:  0.60,
                LandlordBidProb:  0.50,
                LetWinProbability: 0.85,
                LetWinMinRank:    3,
                IsDefault:        1,
        }
}

// IsIdle 检查机器人是否空闲
func (r *RobotRuntime) IsIdle() bool {
        return r.SessionID == 0
}

// IsInSession 检查机器人是否在指定会话中
func (r *RobotRuntime) IsInSession(sessionID uint64) bool {
        return r.SessionID == sessionID
}
