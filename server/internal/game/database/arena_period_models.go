// Package database 提供竞技场期号相关的数据库模型
package database

import (
        "fmt"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 分表辅助函数
// =============================================

// parsePeriodNoToTime 从期号解析日期
// 新格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
// 例如: 260506010034 = 2026年5月6日，房间ID=01，第0034期
func parsePeriodNoToTime(periodNo string) (time.Time, error) {
        if len(periodNo) < 6 {
                return time.Time{}, fmt.Errorf("无效的期号格式: %s", periodNo)
        }
        
        // 新格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
        // 日期部分: 前6位 YYMMDD
        dateStr := periodNo[:6] // 提取日期部分 YYMMDD
        
        // 解析两位年份
        year := 2000 + int(dateStr[0]-'0')*10 + int(dateStr[1]-'0')
        month := int(dateStr[2]-'0')*10 + int(dateStr[3]-'0')
        day := int(dateStr[4]-'0')*10 + int(dateStr[5]-'0')
        
        t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.Local)
        return t, nil
}

// getArenaPeriodTableNameByTime 根据时间获取竞技场期号分表名
func getArenaPeriodTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetArenaPeriodTableName(t)
}

// getArenaSignupLogTableNameByTime 根据时间获取竞技场报名日志分表名
func getArenaSignupLogTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetArenaSignupLogTableName(t)
}

// getArenaPeriodPlayerTableNameByTime 根据时间获取竞技场期号玩家分表名
func getArenaPeriodPlayerTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetArenaPeriodPlayerTableName(t)
}

// ensureArenaPeriodTableExists 确保竞技场期号分表存在
func ensureArenaPeriodTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeArenaPeriod, suffix)
}

// ensureArenaSignupLogTableExists 确保竞技场报名日志分表存在
func ensureArenaSignupLogTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeArenaSignupLog, suffix)
}

// ensureArenaPeriodPlayerTableExists 确保竞技场期号玩家分表存在
func ensureArenaPeriodPlayerTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeArenaPeriodPlayer, suffix)
}

// =============================================
// 竞技场期号表
// =============================================

// ArenaPeriod 竞技场期号表模型
type ArenaPeriod struct {
        ID              uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PeriodNo        string     `gorm:"type:varchar(20);uniqueIndex;not null;comment:期号(格式J202605060001,14位)" json:"period_no"`
        RoomID          uint64     `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        RoomConfigID    uint64     `gorm:"type:bigint unsigned;not null;index;comment:房间配置ID" json:"room_config_id"`
        PeriodIndex     int        `gorm:"type:int;not null;default:1;comment:当日场次号(1-9999)" json:"period_index"`
        StartTime       time.Time  `gorm:"type:datetime;not null;comment:期号开始时间" json:"start_time"`
        SignupStartTime time.Time  `gorm:"type:datetime;not null;comment:报名开始时间" json:"signup_start_time"`
        SignupEndTime   time.Time  `gorm:"type:datetime;not null;comment:报名截止时间" json:"signup_end_time"`
        EndTime         time.Time  `gorm:"type:datetime;not null;comment:期号结束时间" json:"end_time"`
        TotalSignup     int        `gorm:"type:int;not null;default:0;comment:报名总人数" json:"total_signup"`
        TotalCancel     int        `gorm:"type:int;not null;default:0;comment:取消报名人数" json:"total_cancel"`
        FinalPlayers    int        `gorm:"type:int;not null;default:0;comment:最终参赛人数" json:"final_players"`
        Status          uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
        SessionID       *uint64    `gorm:"type:bigint unsigned;comment:关联会话ID(开赛后填写)" json:"session_id"`
        ProcessedAt     *time.Time `gorm:"type:datetime;comment:数据处理完成时间" json:"processed_at"`
        CreatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

        // 关联关系
        RoomConfig *RoomConfig `gorm:"foreignKey:RoomConfigID" json:"room_config"`
        Session    *ArenaSession `gorm:"foreignKey:SessionID" json:"session"`
}

// TableName 指定竞技场期号表名
func (ArenaPeriod) TableName() string {
        return "ddz_arena_periods"
}

// ArenaPeriodStatus 期号状态常量
const (
        ArenaPeriodStatusPreparing   uint8 = 0 // 准备中
        ArenaPeriodStatusSigningUp   uint8 = 1 // 报名中
        ArenaPeriodStatusWaitingGame uint8 = 2 // 等待开赛
        ArenaPeriodStatusInProgress  uint8 = 3 // 比赛进行中
        ArenaPeriodStatusEnded       uint8 = 4 // 已结束
        ArenaPeriodStatusCancelled   uint8 = 5 // 已取消(人数不足等)
)

// CanSignup 是否可以报名
func (p *ArenaPeriod) CanSignup() bool {
        return p.Status == ArenaPeriodStatusSigningUp
}

// IsInSignupTime 是否在报名时间内
func (p *ArenaPeriod) IsInSignupTime() bool {
        now := time.Now()
        return now.After(p.SignupStartTime) && now.Before(p.SignupEndTime)
}

// =============================================
// 竞技场报名日志表
// =============================================

// ArenaSignupLog 竞技场报名日志表模型
type ArenaSignupLog struct {
        ID           uint64     `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        PeriodNo     string     `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        PeriodID     uint64     `gorm:"type:bigint unsigned;not null;index;comment:期号记录ID" json:"period_id"`
        RoomID       uint64     `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID     uint64     `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        ActionType   uint8      `gorm:"type:tinyint unsigned;not null;index;comment:操作类型:1-报名,2-取消" json:"action_type"`
        SignupFee    int64      `gorm:"type:bigint;not null;default:0;comment:报名费" json:"signup_fee"`
        BalanceBefore int64     `gorm:"type:bigint;not null;default:0;comment:操作前竞技币余额" json:"balance_before"`
        BalanceAfter  int64     `gorm:"type:bigint;not null;default:0;comment:操作后竞技币余额" json:"balance_after"`
        Remark       string     `gorm:"type:varchar(256);comment:备注" json:"remark"`
        CreatedAt    time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`

        // 关联关系
        Period  ArenaPeriod `gorm:"foreignKey:PeriodID" json:"period"`
        Player  Player      `gorm:"foreignKey:PlayerID" json:"player"`
}

// TableName 指定竞技场报名日志表名
func (ArenaSignupLog) TableName() string {
        return "ddz_arena_signup_logs"
}

// ArenaSignupActionType 报名操作类型常量
const (
        ArenaSignupActionSignup uint8 = 1 // 报名
        ArenaSignupActionCancel uint8 = 2 // 取消报名
)

// =============================================
// 竞技场期号报名玩家快照表
// =============================================

// ArenaPeriodPlayer 竞技场期号报名玩家快照表模型
// 用于记录每个期号的最终报名玩家列表
type ArenaPeriodPlayer struct {
        ID           uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PeriodNo     string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        PeriodID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:期号记录ID" json:"period_id"`
        RoomID       uint64    `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        SignupTime   time.Time `gorm:"type:datetime;not null;comment:报名时间" json:"signup_time"`
        SignupOrder  int       `gorm:"type:int;not null;default:0;comment:报名顺序" json:"signup_order"`
        SignupFee    int64     `gorm:"type:bigint;not null;default:0;comment:报名费" json:"signup_fee"`
        Status       uint8     `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态:1-正常,2-取消,3-超时未进入" json:"status"`
        CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`

        // 关联关系
        Period  ArenaPeriod `gorm:"foreignKey:PeriodID" json:"period"`
        Player  Player      `gorm:"foreignKey:PlayerID" json:"player"`
}

// TableName 指定竞技场期号报名玩家快照表名
func (ArenaPeriodPlayer) TableName() string {
        return "ddz_arena_period_players"
}

// ArenaPeriodPlayerStatus 报名玩家状态常量
const (
        ArenaPeriodPlayerStatusNormal   uint8 = 1 // 正常
        ArenaPeriodPlayerStatusCanceled uint8 = 2 // 已取消
        ArenaPeriodPlayerStatusTimeout  uint8 = 3 // 超时未进入
)

// =============================================
// 数据库操作函数（使用分表）
// =============================================

// CreateArenaPeriod 创建期号记录（写入分表）
func CreateArenaPeriod(period *ArenaPeriod) error {
        // 根据 StartTime 确定分表
        t := period.StartTime
        if t.IsZero() {
                t = time.Now()
        }

        // 确保分表存在
        if err := ensureArenaPeriodTableExists(t); err != nil {
                return fmt.Errorf("确保期号分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodTableNameByTime(t)

        // 注意：GORM 的 Table().Create() 对于结构体会使用模型的 TableName() 方法
        // 需要使用 Exec() 或传入 map 来确保使用指定的表名
        result := DB().Table(tableName).Create(map[string]interface{}{
                "period_no":         period.PeriodNo,
                "room_id":           period.RoomID,
                "room_config_id":    period.RoomConfigID,
                "period_index":      period.PeriodIndex,
                "start_time":        period.StartTime,
                "signup_start_time": period.SignupStartTime,
                "signup_end_time":   period.SignupEndTime,
                "end_time":          period.EndTime,
                "status":            period.Status,
                "total_signup":      0,
                "total_cancel":      0,
                "final_players":     0,
        })

        if result.Error != nil {
                return result.Error
        }

        // 重新查询获取自增ID
        var createdPeriod ArenaPeriod
        if err := DB().Table(tableName).Where("period_no = ?", period.PeriodNo).First(&createdPeriod).Error; err == nil {
                period.ID = createdPeriod.ID
        }

        return nil
}

// GetArenaPeriodByPeriodNo 根据期号获取记录（从分表查询）
func GetArenaPeriodByPeriodNo(periodNo string) (*ArenaPeriod, error) {
        // 从期号解析日期
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                return nil, err
        }

        // 获取分表名
        tableName := getArenaPeriodTableNameByTime(t)

        var period ArenaPeriod
        err = DB().Table(tableName).Where("period_no = ?", periodNo).First(&period).Error
        if err != nil {
                return nil, err
        }
        return &period, nil
}

// GetLatestArenaPeriodByRoomID 获取房间最新的期号记录（从当前月分表查询）
func GetLatestArenaPeriodByRoomID(roomID uint64) (*ArenaPeriod, error) {
        // 使用当前月份的分表
        tableName := getArenaPeriodTableNameByTime(time.Now())

        var period ArenaPeriod
        err := DB().Table(tableName).Where("room_id = ?", roomID).Order("id DESC").First(&period).Error
        if err != nil {
                return nil, err
        }
        return &period, nil
}

// UpdateArenaPeriodSignupCount 更新期号报名人数（使用分表）
func UpdateArenaPeriodSignupCount(periodID uint64, signupDelta, cancelDelta int) error {
        // 使用当前月份的分表
        tableName := getArenaPeriodTableNameByTime(time.Now())

        return DB().Table(tableName).
                Where("id = ?", periodID).
                Updates(map[string]interface{}{
                        "total_signup": gorm.Expr("total_signup + ?", signupDelta),
                        "total_cancel": gorm.Expr("total_cancel + ?", cancelDelta),
                }).Error
}

// UpdateArenaPeriodStatus 更新期号状态（使用分表）
func UpdateArenaPeriodStatus(periodID uint64, status uint8) error {
        // 使用当前月份的分表
        tableName := getArenaPeriodTableNameByTime(time.Now())

        return DB().Table(tableName).
                Where("id = ?", periodID).
                Update("status", status).Error
}

// UpdateArenaPeriodByPeriodNo 根据期号更新记录（使用分表）
func UpdateArenaPeriodByPeriodNo(periodNo string, updates map[string]interface{}) error {
        // 从期号解析日期
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                return err
        }

        // 获取分表名
        tableName := getArenaPeriodTableNameByTime(t)

        return DB().Table(tableName).
                Where("period_no = ?", periodNo).
                Updates(updates).Error
}

// CreateArenaSignupLog 创建报名日志（写入分表）
func CreateArenaSignupLog(signupLog *ArenaSignupLog) error {
        // 使用当前时间确定分表
        t := time.Now()

        // 确保分表存在
        if err := ensureArenaSignupLogTableExists(t); err != nil {
                return fmt.Errorf("确保报名日志分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaSignupLogTableNameByTime(t)

        // 使用 map 避免模型 TableName() 方法覆盖表名
        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":      signupLog.PeriodNo,
                "period_id":      signupLog.PeriodID,
                "room_id":        signupLog.RoomID,
                "player_id":      signupLog.PlayerID,
                "action_type":    signupLog.ActionType,
                "signup_fee":     signupLog.SignupFee,
                "balance_before": signupLog.BalanceBefore,
                "balance_after":  signupLog.BalanceAfter,
                "remark":         signupLog.Remark,
        }).Error
}

// CreateArenaPeriodPlayer 创建期号玩家记录（写入分表）
func CreateArenaPeriodPlayer(player *ArenaPeriodPlayer) error {
        // 使用当前时间确定分表
        t := time.Now()

        // 确保分表存在
        if err := ensureArenaPeriodPlayerTableExists(t); err != nil {
                return fmt.Errorf("确保期号玩家分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 使用 map 避免模型 TableName() 方法覆盖表名
        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":    player.PeriodNo,
                "period_id":    player.PeriodID,
                "room_id":      player.RoomID,
                "player_id":    player.PlayerID,
                "signup_time":  player.SignupTime,
                "signup_order": player.SignupOrder,
                "signup_fee":   player.SignupFee,
                "status":       player.Status,
        }).Error
}

// UpsertResult 表示 Upsert 操作的结果
type UpsertResult int

const (
        UpsertResultCreated UpsertResult = iota // 新建记录
        UpsertResultRestored                     // 恢复记录（从 canceled 状态）
        UpsertResultExists                       // 已存在（正常状态）
)

// UpsertArenaPeriodPlayer 查找或创建/恢复期号玩家记录（防止重复报名）
// 使用 period_no + player_id 来检查重复
// 返回值：操作结果、错误
// - UpsertResultCreated: 新建记录，应该增加报名计数
// - UpsertResultRestored: 恢复记录，不应该增加报名计数（因为之前取消时已减少）
// - UpsertResultExists: 已存在正常状态，返回错误
func UpsertArenaPeriodPlayer(player *ArenaPeriodPlayer) (UpsertResult, error) {
        // 从期号解析日期确定分表
        t, err := parsePeriodNoToTime(player.PeriodNo)
        if err != nil {
                t = time.Now()
        }

        // 确保分表存在
        if err := ensureArenaPeriodPlayerTableExists(t); err != nil {
                return UpsertResultCreated, fmt.Errorf("确保期号玩家分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 先查询是否存在（使用 period_no + player_id）
        var existingPlayer ArenaPeriodPlayer
        err = DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", player.PeriodNo, player.PlayerID).
                First(&existingPlayer).Error

        if err == nil {
                // 记录已存在
                if existingPlayer.Status == ArenaPeriodPlayerStatusNormal {
                        // 已经是正常报名状态，返回错误
                        return UpsertResultExists, fmt.Errorf("玩家已报名")
                }
                // 状态是 canceled，更新为 normal（重新报名）
                if err := DB().Table(tableName).
                        Where("id = ?", existingPlayer.ID).
                        Updates(map[string]interface{}{
                                "status":      ArenaPeriodPlayerStatusNormal,
                                "signup_time": time.Now(),
                                "signup_fee":  player.SignupFee,
                                "period_id":   player.PeriodID,
                        }).Error; err != nil {
                        return UpsertResultRestored, err
                }
                return UpsertResultRestored, nil
        }

        if err != gorm.ErrRecordNotFound {
                return UpsertResultCreated, err
        }

        // 记录不存在，创建新记录（使用 map 避免 TableName 覆盖）
        if err := DB().Table(tableName).Create(map[string]interface{}{
                "period_no":    player.PeriodNo,
                "period_id":    player.PeriodID,
                "room_id":      player.RoomID,
                "player_id":    player.PlayerID,
                "signup_time":  player.SignupTime,
                "signup_order": player.SignupOrder,
                "signup_fee":   player.SignupFee,
                "status":       player.Status,
        }).Error; err != nil {
                return UpsertResultCreated, err
        }
        return UpsertResultCreated, nil
}

// GetArenaPeriodPlayersByPeriodNo 获取期号的所有报名玩家（从分表查询）
func GetArenaPeriodPlayersByPeriodNo(periodNo string) ([]ArenaPeriodPlayer, error) {
        // 从期号解析日期
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                return nil, err
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        var players []ArenaPeriodPlayer
        err = DB().Table(tableName).Where("period_no = ? AND status = ?", periodNo, ArenaPeriodPlayerStatusNormal).
                Order("signup_order ASC").
                Find(&players).Error
        return players, err
}

// CountArenaPeriodPlayersByPeriodNo 统计期号的报名人数（从分表查询）
func CountArenaPeriodPlayersByPeriodNo(periodNo string) (int64, error) {
        // 从期号解析日期
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                return 0, err
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        var count int64
        err = DB().Table(tableName).Where("period_no = ? AND status = ?", periodNo, ArenaPeriodPlayerStatusNormal).
                Count(&count).Error
        return count, err
}

// UpdateArenaPeriodPlayerStatus 更新玩家报名状态（使用分表）
func UpdateArenaPeriodPlayerStatus(periodID, playerID uint64, status uint8) error {
        // 使用当前月份的分表
        tableName := getArenaPeriodPlayerTableNameByTime(time.Now())

        return DB().Table(tableName).
                Where("period_id = ? AND player_id = ?", periodID, playerID).
                Update("status", status).Error
}

// CreateArenaPeriodPlayerWithTime 创建期号玩家记录（指定时间分表）
func CreateArenaPeriodPlayerWithTime(player *ArenaPeriodPlayer, t time.Time) error {
        // 确保分表存在
        if err := ensureArenaPeriodPlayerTableExists(t); err != nil {
                return fmt.Errorf("确保期号玩家分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 使用 map 避免模型 TableName() 方法覆盖表名
        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":    player.PeriodNo,
                "period_id":    player.PeriodID,
                "room_id":      player.RoomID,
                "player_id":    player.PlayerID,
                "signup_time":  player.SignupTime,
                "signup_order": player.SignupOrder,
                "signup_fee":   player.SignupFee,
                "status":       player.Status,
        }).Error
}

// FirstOrCreateArenaPeriodPlayer 查找或创建期号玩家记录（使用分表）
func FirstOrCreateArenaPeriodPlayer(periodID, playerID uint64, player *ArenaPeriodPlayer) error {
        // 使用当前时间确定分表
        t := time.Now()

        // 确保分表存在
        if err := ensureArenaPeriodPlayerTableExists(t); err != nil {
                return fmt.Errorf("确保期号玩家分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 先查询是否存在
        var existingPlayer ArenaPeriodPlayer
        err := DB().Table(tableName).
                Where("period_id = ? AND player_id = ?", periodID, playerID).
                First(&existingPlayer).Error

        if err == nil {
                // 记录已存在，填充 player
                *player = existingPlayer
                return nil
        }

        if err != gorm.ErrRecordNotFound {
                return err
        }

        // 记录不存在，创建新记录（使用 map 避免 TableName 覆盖）
        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":    player.PeriodNo,
                "period_id":    player.PeriodID,
                "room_id":      player.RoomID,
                "player_id":    player.PlayerID,
                "signup_time":  player.SignupTime,
                "signup_order": player.SignupOrder,
                "signup_fee":   player.SignupFee,
                "status":       player.Status,
        }).Error
}

// FirstOrCreateArenaPeriodPlayerWithTime 查找或创建期号玩家记录（指定时间分表）
func FirstOrCreateArenaPeriodPlayerWithTime(periodID, playerID uint64, player *ArenaPeriodPlayer, t time.Time) error {
        // 确保分表存在
        if err := ensureArenaPeriodPlayerTableExists(t); err != nil {
                return fmt.Errorf("确保期号玩家分表存在失败: %w", err)
        }

        // 获取分表名
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 先查询是否存在
        var existingPlayer ArenaPeriodPlayer
        err := DB().Table(tableName).
                Where("period_id = ? AND player_id = ?", periodID, playerID).
                First(&existingPlayer).Error

        if err == nil {
                // 记录已存在，填充 player
                *player = existingPlayer
                return nil
        }

        if err != gorm.ErrRecordNotFound {
                return err
        }

        // 记录不存在，创建新记录（使用 map 避免 TableName 覆盖）
        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":    player.PeriodNo,
                "period_id":    player.PeriodID,
                "room_id":      player.RoomID,
                "player_id":    player.PlayerID,
                "signup_time":  player.SignupTime,
                "signup_order": player.SignupOrder,
                "signup_fee":   player.SignupFee,
                "status":       player.Status,
        }).Error
}

// =============================================
// 竞技场比赛配置操作
// =============================================

// GetArenaMatchConfigByRoomConfigID 根据房间配置ID获取竞技场比赛配置
func GetArenaMatchConfigByRoomConfigID(roomConfigID uint64) (*ArenaMatchConfig, error) {
        var config ArenaMatchConfig
        err := DB().Where("room_config_id = ? AND status = 1", roomConfigID).First(&config).Error
        if err != nil {
                return nil, err
        }
        return &config, nil
}
