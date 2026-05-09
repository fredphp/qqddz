// Package database 提供竞技场期号相关的数据库模型
package database

import (
        "fmt"
        "log"
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
// 职责：报名管理 + 历史记录查询（按月分表）
// 与 ArenaParticipation 的区别：
// - ArenaPeriodPlayer: 报名专用（分表，便于历史查询）
// - ArenaParticipation: 比赛过程数据（主表，支持事务操作）
//
// 注意：比赛过程数据（金币、淘汰、排名）存储在本表的 arena_gold 等字段
type ArenaPeriodPlayer struct {
        ID              uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PeriodNo        string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        PeriodID        uint64    `gorm:"type:bigint unsigned;not null;index;comment:期号记录ID" json:"period_id"`
        RoomID          uint64    `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID        uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        SignupTime      time.Time `gorm:"type:datetime;not null;comment:报名时间" json:"signup_time"`
        SignupOrder     int       `gorm:"type:int;not null;default:0;comment:报名顺序" json:"signup_order"`
        SignupFee       int64     `gorm:"type:bigint;not null;default:0;comment:报名费" json:"signup_fee"`
        Status          uint8     `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态:1-正常,2-取消,3-超时未进入" json:"status"`

        // 🔧【恢复】竞技场赛事金币字段（从报名开始就有数据）
        ArenaGold       int64     `gorm:"type:bigint;not null;default:0;comment:当期赛事金币" json:"arena_gold"`
        IsEliminated    uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:是否淘汰:0-否,1-是" json:"is_eliminated"`
        EliminatedRound *int      `gorm:"type:int;comment:淘汰轮次" json:"eliminated_round"`
        RankNo          *int      `gorm:"type:int;comment:最终排名" json:"rank_no"`
        PlayerStatus    uint8     `gorm:"type:tinyint unsigned;not null;default:0;index;comment:玩家状态:0-报名,1-比赛中,2-淘汰,3-晋级,4-结束" json:"player_status"`

        CreatedAt       time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`

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

// ArenaPlayerStatus 玩家比赛状态常量（player_status 字段）
const (
        ArenaPlayerStatusSignup   uint8 = 0 // 报名
        ArenaPlayerStatusPlaying  uint8 = 1 // 比赛中
        ArenaPlayerStatusEliminated uint8 = 2 // 淘汰
        ArenaPlayerStatusAdvanced uint8 = 3 // 晋级
        ArenaPlayerStatusFinished uint8 = 4 // 结束
)

// =============================================
// 竞技场金币流水表（月分表）
// =============================================

// ArenaGoldLog 竞技场金币流水表模型
type ArenaGoldLog struct {
        ID         uint64    `gorm:"primaryKey;autoIncrement;comment:流水ID" json:"id"`
        PeriodNo   string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        RoomID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID   uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        MatchID    string    `gorm:"type:varchar(64);index;comment:对局ID" json:"match_id"`
        BeforeGold int64     `gorm:"type:bigint;not null;default:0;comment:变动前金币" json:"before_gold"`
        ChangeGold int64     `gorm:"type:bigint;not null;default:0;comment:变动金币(正=赢,负=输)" json:"change_gold"`
        AfterGold  int64     `gorm:"type:bigint;not null;default:0;comment:变动后金币" json:"after_gold"`
        Reason     string    `gorm:"type:varchar(32);not null;comment:变动原因" json:"reason"`
        CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`
}

// TableName 指定竞技场金币流水表名
func (ArenaGoldLog) TableName() string {
        return "ddz_arena_gold_logs"
}

// ArenaGoldChangeReason 金币变动原因常量
const (
        ArenaGoldReasonInit      = "INIT"      // 初始化（报名时发放）
        ArenaGoldReasonWin       = "WIN"       // 赢得金币
        ArenaGoldReasonLose      = "LOSE"      // 输掉金币
        ArenaGoldReasonSettlement = "SETTLEMENT" // 结算
        ArenaGoldReasonEliminate = "ELIMINATE" // 淘汰
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
        // 报名时只写入报名相关字段，比赛数据由 participations 表管理
        if err := DB().Table(tableName).Create(map[string]interface{}{
                "period_no":     player.PeriodNo,
                "period_id":     player.PeriodID,
                "room_id":       player.RoomID,
                "player_id":     player.PlayerID,
                "signup_time":   player.SignupTime,
                "signup_order":  player.SignupOrder,
                "signup_fee":    player.SignupFee,
                "status":        player.Status,
                "player_status": ArenaPlayerStatusSignup,
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

// =============================================
// 🔧【新增】竞技场赛事金币操作函数
// =============================================

// getArenaGoldLogTableNameByTime 根据时间获取竞技场金币流水分表名
func getArenaGoldLogTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetArenaGoldLogTableName(t)
}

// ensureArenaGoldLogTableExists 确保竞技场金币流水分表存在
func ensureArenaGoldLogTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeArenaGoldLog, suffix)
}

// InitArenaGold 初始化玩家当期赛事金币（报名时调用）
// 从 room_config.min_gold 读取初始金币值
// 🔧【关键修复】如果记录不存在，先创建记录再更新金币
func InitArenaGold(periodNo string, playerID uint64, initialGold int64) error {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 🔧【关键修复】先检查记录是否存在
        var existingPlayer ArenaPeriodPlayer
        err = DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                First(&existingPlayer).Error

        if err == gorm.ErrRecordNotFound {
                // 记录不存在，创建新记录
                log.Printf("🔍 [InitArenaGold] 记录不存在，创建新记录: period_no=%s, player_id=%d", periodNo, playerID)

                // 解析 periodNo 获取 period_id 和 room_id
                // periodNo 格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
                var periodID, roomID uint64
                if len(periodNo) >= 12 {
                        // 提取房间ID（第7-8位）
                        roomID = uint64(periodNo[6]-'0')*10 + uint64(periodNo[7]-'0')
                        // 提取期序号（第9-12位）
                        periodID = uint64(periodNo[8]-'0')*1000 + uint64(periodNo[9]-'0')*100 +
                                uint64(periodNo[10]-'0')*10 + uint64(periodNo[11]-'0')
                }

                // 创建新记录
                newPlayer := map[string]interface{}{
                        "period_no":    periodNo,
                        "period_id":    periodID,
                        "room_id":      roomID,
                        "player_id":    playerID,
                        "signup_time":  time.Now(),
                        "signup_order": 0, // 机器人报名顺序为0
                        "status":       ArenaPeriodPlayerStatusNormal,
                        "arena_gold":   initialGold,
                        "player_status": ArenaPlayerStatusSignup,
                        "created_at":   time.Now(),
                        "updated_at":   time.Now(),
                }

                if err := DB().Table(tableName).Create(newPlayer).Error; err != nil {
                        log.Printf("❌ [InitArenaGold] 创建记录失败: period_no=%s, player_id=%d, err=%v", periodNo, playerID, err)
                        return fmt.Errorf("创建赛事金币记录失败: %w", err)
                }

                // 写入金币流水
                if err := CreateArenaGoldLog(&ArenaGoldLog{
                        PeriodNo:   periodNo,
                        PlayerID:   playerID,
                        BeforeGold: 0,
                        ChangeGold: initialGold,
                        AfterGold:  initialGold,
                        Reason:     ArenaGoldReasonInit,
                }); err != nil {
                        log.Printf("⚠️ [InitArenaGold] 写入金币流水失败: %v", err)
                }

                log.Printf("✅ [InitArenaGold] 创建并初始化金币成功: period_no=%s, player_id=%d, arena_gold=%d", periodNo, playerID, initialGold)
                return nil
        } else if err != nil {
                log.Printf("❌ [InitArenaGold] 查询记录失败: period_no=%s, player_id=%d, err=%v", periodNo, playerID, err)
                return fmt.Errorf("查询赛事金币记录失败: %w", err)
        }

        // 记录已存在，更新金币
        result := DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                Updates(map[string]interface{}{
                        "arena_gold":    initialGold,
                        "player_status": ArenaPlayerStatusSignup,
                        "updated_at":    time.Now(),
                })

        if result.Error != nil {
                return fmt.Errorf("初始化赛事金币失败: %w", result.Error)
        }

        // 写入金币流水
        if err := CreateArenaGoldLog(&ArenaGoldLog{
                PeriodNo:   periodNo,
                PlayerID:   playerID,
                BeforeGold: 0,
                ChangeGold: initialGold,
                AfterGold:  initialGold,
                Reason:     ArenaGoldReasonInit,
        }); err != nil {
                log.Printf("⚠️ [InitArenaGold] 写入金币流水失败: %v", err)
        }

        log.Printf("🏟️ [InitArenaGold] 期号=%s, 玩家=%d, 初始金币=%d", periodNo, playerID, initialGold)
        return nil
}

// UpdateArenaGold 更新玩家当期赛事金币（对局结算时调用）
// 只更新 arena_gold，不影响 player.gold
func UpdateArenaGold(periodNo string, playerID uint64, changeGold int64, matchID string, reason string) (int64, error) {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 先查询当前金币
        var player ArenaPeriodPlayer
        if err := DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                First(&player).Error; err != nil {
                return 0, fmt.Errorf("查询玩家赛事金币失败: %w", err)
        }

        beforeGold := player.ArenaGold
        afterGold := beforeGold + changeGold
        if afterGold < 0 {
                afterGold = 0 // 金币不能为负
        }

        // 更新金币
        if err := DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                Updates(map[string]interface{}{
                        "arena_gold": afterGold,
                        "updated_at": time.Now(),
                }).Error; err != nil {
                return afterGold, fmt.Errorf("更新赛事金币失败: %w", err)
        }

        // 写入金币流水
        if err := CreateArenaGoldLog(&ArenaGoldLog{
                PeriodNo:   periodNo,
                PlayerID:   playerID,
                MatchID:    matchID,
                BeforeGold: beforeGold,
                ChangeGold: changeGold,
                AfterGold:  afterGold,
                Reason:     reason,
        }); err != nil {
                log.Printf("⚠️ [UpdateArenaGold] 写入金币流水失败: %v", err)
        }

        log.Printf("🏟️ [UpdateArenaGold] 期号=%s, 玩家=%d, 变动=%d, 前=%d, 后=%d",
                periodNo, playerID, changeGold, beforeGold, afterGold)

        return afterGold, nil
}

// GetArenaGold 查询玩家当期赛事金币
// 🔧【修复】如果记录不存在，自动创建并初始化金币
func GetArenaGold(periodNo string, playerID uint64) (int64, error) {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                log.Printf("⚠️ [GetArenaGold] 解析期号失败: periodNo=%s, err=%v, 使用当前时间", periodNo, err)
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)
        log.Printf("🔍 [GetArenaGold] 查询表: %s, period_no=%s, player_id=%d", tableName, periodNo, playerID)

        var player ArenaPeriodPlayer
        if err := DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                First(&player).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        log.Printf("⚠️ [GetArenaGold] 记录不存在，自动创建: table=%s, period_no=%s, player_id=%d", tableName, periodNo, playerID)
                        // 🔧【修复】记录不存在时，调用 InitArenaGold 创建记录并初始化金币
                        // 需要获取房间配置来确定初始金币值
                        // 从 periodNo 解析 roomID
                        var roomID uint64
                        if len(periodNo) >= 8 {
                                roomID = uint64(periodNo[6]-'0')*10 + uint64(periodNo[7]-'0')
                        }
                        // 获取房间配置中的初始金币
                        var initialGold int64 = 10000 // 默认值
                        if roomID > 0 {
                                var roomConfig RoomConfig
                                if err := DB().First(&roomConfig, roomID).Error; err == nil {
                                        initialGold = roomConfig.MinGold
                                }
                        }
                        if initialGold <= 0 {
                                initialGold = 10000
                        }
                        // 创建记录
                        if err := InitArenaGold(periodNo, playerID, initialGold); err != nil {
                                log.Printf("❌ [GetArenaGold] 创建记录失败: %v", err)
                                return 0, nil
                        }
                        return initialGold, nil
                }
                log.Printf("❌ [GetArenaGold] 查询失败: table=%s, err=%v", tableName, err)
                return 0, err
        }

        log.Printf("✅ [GetArenaGold] 查询成功: table=%s, period_no=%s, player_id=%d, arena_gold=%d", tableName, periodNo, playerID, player.ArenaGold)
        return player.ArenaGold, nil
}

// GetArenaPeriodPlayer 查询玩家期号记录
func GetArenaPeriodPlayer(periodNo string, playerID uint64) (*ArenaPeriodPlayer, error) {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        var player ArenaPeriodPlayer
        if err := DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                First(&player).Error; err != nil {
                return nil, err
        }

        return &player, nil
}

// GetArenaPeriodPlayersByPeriodNoForGame 获取期号的所有参赛玩家（用于游戏结算）
// 注意：此函数已废弃，请使用 arena_participation_models.go 中的 GetActiveParticipations
// 保留此函数仅用于查询报名状态，不再包含淘汰状态判断
func GetArenaPeriodPlayersByPeriodNoForGame(periodNo string) ([]ArenaPeriodPlayer, error) {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        var players []ArenaPeriodPlayer
        err = DB().Table(tableName).
                Where("period_no = ? AND status = ?", periodNo, ArenaPeriodPlayerStatusNormal).
                Order("signup_order ASC").
                Find(&players).Error
        return players, err
}

// CreateArenaGoldLog 创建金币流水记录
func CreateArenaGoldLog(log *ArenaGoldLog) error {
        t := time.Now()

        // 确保分表存在
        if err := ensureArenaGoldLogTableExists(t); err != nil {
                return fmt.Errorf("确保金币流水分表存在失败: %w", err)
        }

        tableName := getArenaGoldLogTableNameByTime(t)

        // 如果没有指定 RoomID，从 period_players 表查询
        if log.RoomID == 0 {
                var player ArenaPeriodPlayer
                playerTable := getArenaPeriodPlayerTableNameByTime(t)
                if err := DB().Table(playerTable).
                        Where("period_no = ? AND player_id = ?", log.PeriodNo, log.PlayerID).
                        First(&player).Error; err == nil {
                        log.RoomID = player.RoomID
                }
        }

        return DB().Table(tableName).Create(map[string]interface{}{
                "period_no":   log.PeriodNo,
                "room_id":     log.RoomID,
                "player_id":   log.PlayerID,
                "match_id":    log.MatchID,
                "before_gold": log.BeforeGold,
                "change_gold": log.ChangeGold,
                "after_gold":  log.AfterGold,
                "reason":      log.Reason,
        }).Error
}

// UpdateArenaPeriodPlayerMatchStatus 更新玩家比赛状态
// 注意：is_eliminated 和 eliminated_round 已移至 participations 表
// 此函数仅更新 period_players 表的 player_status 字段
func UpdateArenaPeriodPlayerMatchStatus(periodNo string, playerID uint64, playerStatus uint8) error {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        return DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                Updates(map[string]interface{}{
                        "player_status": playerStatus,
                        "updated_at":    time.Now(),
                }).Error
}

// SetPlayerEliminated 设置玩家淘汰状态（已废弃）
// 注意：淘汰状态现在在 participations 表中管理
// 请使用 arena_participation_models.go 中的 UpdateParticipationElimination
// 此函数仅更新 period_players 表的 player_status 字段用于历史查询
func SetPlayerEliminated(periodNo string, playerID uint64, eliminatedRound int, rankNo int) error {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaPeriodPlayerTableNameByTime(t)

        // 只更新 player_status，淘汰详情在 participations 表
        return DB().Table(tableName).
                Where("period_no = ? AND player_id = ?", periodNo, playerID).
                Updates(map[string]interface{}{
                        "player_status": ArenaPlayerStatusEliminated,
                        "final_rank":    &rankNo,
                        "updated_at":    time.Now(),
                }).Error
}

// GetLowestGoldPlayers 获取金币最低的玩家（用于淘汰）
// 注意：此函数已废弃，请使用 participations 表查询
// 金币数据现在存储在 ddz_arena_participations.match_coin
func GetLowestGoldPlayers(periodNo string, count int) ([]ArenaPeriodPlayer, error) {
        // 此功能已迁移至 participations 表
        // 保留空实现以保持接口兼容
        return []ArenaPeriodPlayer{}, nil
}

// GetArenaGoldLogs 查询金币流水
func GetArenaGoldLogs(periodNo string, playerID uint64, limit int) ([]ArenaGoldLog, error) {
        t, err := parsePeriodNoToTime(periodNo)
        if err != nil {
                t = time.Now()
        }

        tableName := getArenaGoldLogTableNameByTime(t)

        var logs []ArenaGoldLog
        query := DB().Table(tableName).Where("period_no = ?", periodNo)
        if playerID > 0 {
                query = query.Where("player_id = ?", playerID)
        }
        if limit > 0 {
                query = query.Limit(limit)
        }

        err = query.Order("created_at DESC").Find(&logs).Error
        return logs, err
}
