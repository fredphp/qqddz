// Package database 提供分表相关的数据库操作
package database

import (
        "fmt"
        "log"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 房间分表相关操作
// =============================================

// PartitionRoom 分表房间模型（不指定固定表名）
type PartitionRoom struct {
        ID           uint64     `gorm:"primaryKey;autoIncrement;comment:房间ID" json:"id"`
        RoomCode     string     `gorm:"type:varchar(10);uniqueIndex;not null;comment:房间号" json:"room_code"`
        RoomName     string     `gorm:"type:varchar(64);not null;default:'';comment:房间名称" json:"room_name"`
        RoomConfigID uint64     `gorm:"type:bigint unsigned;not null;default:0;index;comment:房间配置ID" json:"room_config_id"`
        RoomType     uint8      `gorm:"type:tinyint;not null;default:1;index;comment:房间类型" json:"room_type"`
        RoomCategory uint8      `gorm:"type:tinyint;not null;default:1;comment:房间分类" json:"room_category"`
        CreatorID    uint64     `gorm:"type:bigint unsigned;not null;index;comment:创建者玩家ID" json:"creator_id"`
        PlayerCount  int        `gorm:"type:int;not null;default:0;comment:当前玩家数量" json:"player_count"`
        MaxPlayers   int        `gorm:"type:int;not null;default:3;comment:最大玩家数量" json:"max_players"`
        Status       uint8      `gorm:"type:tinyint;not null;default:1;index;comment:状态" json:"status"`
        BaseScore    int        `gorm:"type:int;not null;default:1;comment:底分" json:"base_score"`
        Multiplier   int        `gorm:"type:int;not null;default:1;comment:倍数" json:"multiplier"`
        Player1ID    *uint64    `gorm:"type:bigint unsigned;comment:玩家1 ID" json:"player1_id"`
        Player2ID    *uint64    `gorm:"type:bigint unsigned;comment:玩家2 ID" json:"player2_id"`
        Player3ID    *uint64    `gorm:"type:bigint unsigned;comment:玩家3 ID" json:"player3_id"`
        CreatedAt    time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt    time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
        EndedAt      *time.Time `gorm:"type:datetime;comment:结束时间" json:"ended_at"`
}

// TableName 动态设置表名
func (PartitionRoom) TableName() string {
        return GetPartitionManager().GetCurrentRoomTableName()
}

// SetTableName 设置指定表名
func (r *PartitionRoom) SetTableName(tableName string) func(db *gorm.DB) *gorm.DB {
        return func(db *gorm.DB) *gorm.DB {
                return db.Table(tableName)
        }
}

// PartitionGameRecord 分表游戏记录模型
type PartitionGameRecord struct {
        ID                   uint64     `gorm:"primaryKey;autoIncrement;comment:游戏记录ID" json:"id"`
        GameID               string     `gorm:"type:varchar(64);uniqueIndex;not null;comment:游戏唯一标识" json:"game_id"`
        RoomID               string     `gorm:"type:varchar(64);index;not null;comment:房间ID" json:"room_id"`
        RoomCode             string     `gorm:"type:varchar(10);index;not null;comment:房间号" json:"room_code"`
        RoomType             uint8      `gorm:"type:tinyint;not null;default:1;comment:房间类型" json:"room_type"`
        RoomCategory         uint8      `gorm:"type:tinyint;not null;default:1;comment:房间分类" json:"room_category"`
        LandlordID           uint64     `gorm:"type:bigint unsigned;index;not null;comment:地主玩家ID" json:"landlord_id"`
        Farmer1ID            uint64     `gorm:"type:bigint unsigned;index;not null;comment:农民1玩家ID" json:"farmer1_id"`
        Farmer2ID            uint64     `gorm:"type:bigint unsigned;index;not null;comment:农民2玩家ID" json:"farmer2_id"`
        BaseScore            int        `gorm:"type:int;not null;default:1;comment:底分" json:"base_score"`
        Multiplier           int        `gorm:"type:int;not null;default:1;comment:最终倍数" json:"multiplier"`
        BombCount            int        `gorm:"type:int;not null;default:0;comment:炸弹数量" json:"bomb_count"`
        Spring               uint8      `gorm:"type:tinyint;not null;default:0;comment:是否春天" json:"spring"`
        Result               uint8      `gorm:"type:tinyint;not null;index;comment:结果" json:"result"`
        LandlordWinGold      int64      `gorm:"type:bigint;not null;default:0;comment:地主输赢金币" json:"landlord_win_gold"`
        Farmer1WinGold       int64      `gorm:"type:bigint;not null;default:0;comment:农民1输赢金币" json:"farmer1_win_gold"`
        Farmer2WinGold       int64      `gorm:"type:bigint;not null;default:0;comment:农民2输赢金币" json:"farmer2_win_gold"`
        LandlordWinArenaCoin int64      `gorm:"type:bigint;not null;default:0;comment:地主输赢竞技币" json:"landlord_win_arena_coin"`
        Farmer1WinArenaCoin  int64      `gorm:"type:bigint;not null;default:0;comment:农民1输赢竞技币" json:"farmer1_win_arena_coin"`
        Farmer2WinArenaCoin  int64      `gorm:"type:bigint;not null;default:0;comment:农民2输赢竞技币" json:"farmer2_win_arena_coin"`
        StartedAt            time.Time  `gorm:"type:datetime;not null;index;comment:开始时间" json:"started_at"`
        EndedAt              *time.Time `gorm:"type:datetime;comment:结束时间" json:"ended_at"`
        DurationSeconds      int        `gorm:"type:int;not null;default:0;comment:游戏时长(秒)" json:"duration_seconds"`
        CreatedAt            time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// TableName 动态设置表名
func (PartitionGameRecord) TableName() string {
        return GetPartitionManager().GetCurrentGameRecordTableName()
}

// =============================================
// 分表房间操作函数
// =============================================

// CreatePartitionRoom 创建房间到分表
func CreatePartitionRoom(room *PartitionRoom) error {
        now := time.Now()
        tableName := GetPartitionManager().GetRoomTableName(now)
        suffix := now.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeRoom, suffix); err != nil {
                return fmt.Errorf("确保房间分表存在失败: %w", err)
        }

        // 使用指定表名插入
        if err := DB().Table(tableName).Create(room).Error; err != nil {
                return err
        }

        log.Printf("💾 房间 %s 已保存到分表 %s", room.RoomCode, tableName)
        return nil
}

// GetPartitionRoomByCode 从分表获取房间
func GetPartitionRoomByCode(roomCode string, createdAt time.Time) (*PartitionRoom, error) {
        tableName := GetPartitionManager().GetRoomTableName(createdAt)
        suffix := createdAt.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeRoom, suffix); err != nil {
                return nil, fmt.Errorf("确保房间分表存在失败: %w", err)
        }

        var room PartitionRoom
        err := DB().Table(tableName).Where("room_code = ?", roomCode).First(&room).Error
        if err != nil {
                return nil, err
        }
        return &room, nil
}

// UpdatePartitionRoomStatus 更新分表房间状态
func UpdatePartitionRoomStatus(roomCode string, status uint8, createdAt time.Time) error {
        tableName := GetPartitionManager().GetRoomTableName(createdAt)
        suffix := createdAt.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeRoom, suffix); err != nil {
                return fmt.Errorf("确保房间分表存在失败: %w", err)
        }

        updates := map[string]interface{}{
                "status": status,
        }
        if status == RoomStatusFinished || status == RoomStatusClosed {
                now := time.Now()
                updates["ended_at"] = &now
        }

        return DB().Table(tableName).Where("room_code = ?", roomCode).Updates(updates).Error
}

// AddPlayerToPartitionRoom 添加玩家到分表房间
func AddPlayerToPartitionRoom(roomCode string, playerID uint64, seatIndex int, createdAt time.Time) error {
        tableName := GetPartitionManager().GetRoomTableName(createdAt)
        suffix := createdAt.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeRoom, suffix); err != nil {
                return fmt.Errorf("确保房间分表存在失败: %w", err)
        }

        var field string
        switch seatIndex {
        case 0:
                field = "player1_id"
        case 1:
                field = "player2_id"
        case 2:
                field = "player3_id"
        default:
                return fmt.Errorf("invalid seat index: %d", seatIndex)
        }

        return DB().Table(tableName).Where("room_code = ?", roomCode).
                Updates(map[string]interface{}{
                        field:         playerID,
                        "player_count": gorm.Expr("player_count + 1"),
                }).Error
}

// RemovePlayerFromPartitionRoom 从分表房间移除玩家
func RemovePlayerFromPartitionRoom(roomCode string, playerID uint64, createdAt time.Time) error {
        tableName := GetPartitionManager().GetRoomTableName(createdAt)
        suffix := createdAt.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeRoom, suffix); err != nil {
                return fmt.Errorf("确保房间分表存在失败: %w", err)
        }

        // 先查询该玩家在哪个座位
        var room PartitionRoom
        if err := DB().Table(tableName).Where("room_code = ?", roomCode).First(&room).Error; err != nil {
                return err
        }

        // 确定要清空的字段
        updates := map[string]interface{}{
                "player_count": gorm.Expr("GREATEST(player_count - 1, 0)"),
        }

        if room.Player1ID != nil && *room.Player1ID == playerID {
                updates["player1_id"] = nil
        } else if room.Player2ID != nil && *room.Player2ID == playerID {
                updates["player2_id"] = nil
        } else if room.Player3ID != nil && *room.Player3ID == playerID {
                updates["player3_id"] = nil
        } else {
                // 玩家不在房间中，只更新人数
                log.Printf("⚠️ 玩家 %d 不在房间 %s 的座位中，仅更新人数", playerID, roomCode)
        }

        return DB().Table(tableName).Where("room_code = ?", roomCode).Updates(updates).Error
}

// ClosePlayerOldRooms 关闭玩家的旧房间（用于创建新房间的场景）
// 当玩家刷新页面后重新创建房间，需要关闭之前的房间
func ClosePlayerOldRooms(playerID uint64) error {
        now := time.Now()

        // 获取当前月份和上个月的表名
        currentMonthTable := GetPartitionManager().GetRoomTableName(now)
        lastMonth := now.AddDate(0, -1, 0)
        lastMonthTable := GetPartitionManager().GetRoomTableName(lastMonth)

        // 更新当前月份的表
        if err := closePlayerRoomsInTable(currentMonthTable, playerID); err != nil {
                log.Printf("⚠️ 关闭当前月份房间失败: %v", err)
        }

        // 更新上个月的表
        if err := closePlayerRoomsInTable(lastMonthTable, playerID); err != nil {
                log.Printf("⚠️ 关闭上月份房间失败: %v", err)
        }

        return nil
}

// closePlayerRoomsInTable 在指定表中关闭玩家的等待中房间
func closePlayerRoomsInTable(tableName string, playerID uint64) error {
        // 检查表是否存在
        var count int64
        DB().Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)
        if count == 0 {
                return nil // 表不存在，跳过
        }

        now := time.Now()
        result := DB().Table(tableName).
                Where("creator_id = ? AND status = ?", playerID, RoomStatusWaiting).
                Updates(map[string]interface{}{
                        "status":   RoomStatusClosed,
                        "ended_at": &now,
                })

        if result.Error != nil {
                return result.Error
        }

        if result.RowsAffected > 0 {
                log.Printf("🏠 已关闭玩家 %d 的 %d 个等待中房间（表: %s）", playerID, result.RowsAffected, tableName)
        }

        return nil
}

// GetPartitionRoomListWithPlayers 获取分表房间列表
func GetPartitionRoomListWithPlayers(page, pageSize int, status uint8, startTime, endTime time.Time) ([]PartitionRoom, int64, error) {
        var rooms []PartitionRoom
        var total int64

        // 收集需要查询的所有表
        var tables []string
        startMonth := time.Date(startTime.Year(), startTime.Month(), 1, 0, 0, 0, 0, startTime.Location())
        endMonth := time.Date(endTime.Year(), endTime.Month(), 1, 0, 0, 0, 0, endTime.Location())

        for m := startMonth; !m.After(endMonth); m = m.AddDate(0, 1, 0) {
                tableName := GetPartitionManager().GetRoomTableName(m)
                // 检查表是否存在
                var count int64
                DB().Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)
                if count > 0 {
                        tables = append(tables, tableName)
                }
        }

        if len(tables) == 0 {
                return rooms, 0, nil
        }

        // 使用 UNION ALL 查询所有表（简化版本，仅查当前月）
        // 实际生产环境可能需要更复杂的分页逻辑
        tableName := GetPartitionManager().GetRoomTableName(time.Now())

        db := DB().Table(tableName)
        if status > 0 {
                db = db.Where("status = ?", status)
        }

        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&rooms).Error; err != nil {
                return nil, 0, err
        }

        return rooms, total, nil
}

// =============================================
// 分表游戏记录操作函数
// =============================================

// CreatePartitionGameRecord 创建游戏记录到分表
func CreatePartitionGameRecord(record *PartitionGameRecord) error {
        startedAt := record.StartedAt
        if startedAt.IsZero() {
                startedAt = time.Now()
        }

        tableName := GetPartitionManager().GetGameRecordTableName(startedAt)
        suffix := startedAt.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeGameRecord, suffix); err != nil {
                return fmt.Errorf("确保游戏记录分表存在失败: %w", err)
        }

        if err := DB().Table(tableName).Create(record).Error; err != nil {
                return err
        }

        log.Printf("💾 游戏记录 %s 已保存到分表 %s", record.GameID, tableName)
        return nil
}

// GetPartitionGameRecordsByPlayerID 获取玩家的游戏记录（跨月份查询）
func GetPartitionGameRecordsByPlayerID(playerID uint64, page, pageSize int, months int) ([]PartitionGameRecord, int64, error) {
        var records []PartitionGameRecord
        var total int64

        now := time.Now()

        // 查询最近N个月的记录
        for i := 0; i < months; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := GetPartitionManager().GetGameRecordTableName(t)
                suffix := t.Format("200601")

                // 确保分表存在
                if err := GetPartitionManager().EnsureTableExists(PartitionTypeGameRecord, suffix); err != nil {
                        continue
                }

                var monthRecords []PartitionGameRecord
                DB().Table(tableName).
                        Where("landlord_id = ? OR farmer1_id = ? OR farmer2_id = ?", playerID, playerID, playerID).
                        Order("started_at DESC").
                        Find(&monthRecords)

                records = append(records, monthRecords...)
        }

        // 计算总数并分页
        total = int64(len(records))
        start := (page - 1) * pageSize
        end := start + pageSize
        if start >= len(records) {
                return []PartitionGameRecord{}, total, nil
        }
        if end > len(records) {
                end = len(records)
        }

        return records[start:end], total, nil
}

// =============================================
// 分表出牌日志操作函数
// =============================================

// PartitionPlayLog 分表出牌日志模型
type PartitionPlayLog struct {
        ID          uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID      string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID    uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        PlayerRole  uint8     `gorm:"type:tinyint;not null;comment:玩家角色" json:"player_role"`
        RoundNum    int       `gorm:"type:int;index;not null;comment:回合数" json:"round_num"`
        PlayOrder   int       `gorm:"type:int;not null;comment:出牌顺序" json:"play_order"`
        PlayType    uint8     `gorm:"type:tinyint;not null;comment:出牌类型" json:"play_type"`
        Cards       string    `gorm:"type:varchar(64);default:'';comment:出的牌" json:"cards"`
        CardsCount  int       `gorm:"type:int;not null;default:0;comment:出牌数量" json:"cards_count"`
        CardPattern string    `gorm:"type:varchar(32);default:'';comment:牌型" json:"card_pattern"`
        IsBomb      uint8     `gorm:"type:tinyint;not null;default:0;comment:是否炸弹" json:"is_bomb"`
        IsRocket    uint8     `gorm:"type:tinyint;not null;default:0;comment:是否火箭" json:"is_rocket"`
        CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionPlayLogs 批量创建出牌日志到分表
func CreatePartitionPlayLogs(logs []PartitionPlayLog, gameStartTime time.Time) error {
        if len(logs) == 0 {
                return nil
        }

        tableName := GetPartitionManager().GetPlayLogTableName(gameStartTime)
        suffix := gameStartTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypePlayLog, suffix); err != nil {
                return fmt.Errorf("确保出牌日志分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(&logs).Error
}

// =============================================
// 分表发牌日志操作函数
// =============================================

// PartitionDealLog 分表发牌日志模型
type PartitionDealLog struct {
        ID            uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID        string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID      uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        PlayerRole    uint8     `gorm:"type:tinyint;not null;comment:玩家角色" json:"player_role"`
        HandCards     string    `gorm:"type:varchar(64);not null;comment:手牌" json:"hand_cards"`
        CardsCount    int       `gorm:"type:int;not null;default:0;comment:手牌数量" json:"cards_count"`
        LandlordCards string    `gorm:"type:varchar(32);comment:底牌" json:"landlord_cards"`
        CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionDealLogs 批量创建发牌日志到分表
func CreatePartitionDealLogs(logs []PartitionDealLog, gameStartTime time.Time) error {
        if len(logs) == 0 {
                return nil
        }

        tableName := GetPartitionManager().GetDealLogTableName(gameStartTime)
        suffix := gameStartTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeDealLog, suffix); err != nil {
                return fmt.Errorf("确保发牌日志分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(&logs).Error
}

// =============================================
// 分表叫地主日志操作函数
// =============================================

// PartitionBidLog 分表叫地主日志模型
type PartitionBidLog struct {
        ID         uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        GameID     string    `gorm:"type:varchar(64);index;not null;comment:游戏唯一标识" json:"game_id"`
        PlayerID   uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        BidOrder   int       `gorm:"type:int;index;not null;comment:叫地主顺序" json:"bid_order"`
        BidType    uint8     `gorm:"type:tinyint;not null;comment:叫地主类型" json:"bid_type"`
        BidScore   int       `gorm:"type:int;not null;default:0;comment:叫分" json:"bid_score"`
        IsSuccess  uint8     `gorm:"type:tinyint;not null;default:0;comment:是否成功" json:"is_success"`
        CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionBidLogs 批量创建叫地主日志到分表
func CreatePartitionBidLogs(logs []PartitionBidLog, gameStartTime time.Time) error {
        if len(logs) == 0 {
                return nil
        }

        tableName := GetPartitionManager().GetBidLogTableName(gameStartTime)
        suffix := gameStartTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeBidLog, suffix); err != nil {
                return fmt.Errorf("确保叫地主日志分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(&logs).Error
}

// =============================================
// 分表登录日志操作函数
// =============================================

// PartitionLoginLog 分表登录日志模型
type PartitionLoginLog struct {
        ID          uint64    `gorm:"primaryKey;autoIncrement;comment:ID" json:"id"`
        PlayerID    uint64    `gorm:"type:bigint unsigned;index;not null;comment:玩家ID" json:"player_id"`
        AccountID   uint64    `gorm:"type:bigint unsigned;index;comment:账户ID" json:"account_id"`
        LoginType   uint8     `gorm:"type:tinyint;not null;comment:登录类型" json:"login_type"`
        LoginResult uint8     `gorm:"type:tinyint;not null;comment:登录结果" json:"login_result"`
        FailReason  string    `gorm:"type:varchar(128);comment:失败原因" json:"fail_reason"`
        IP          string    `gorm:"type:varchar(64);comment:登录IP" json:"ip"`
        DeviceID    string    `gorm:"type:varchar(64);comment:设备ID" json:"device_id"`
        DeviceType  string    `gorm:"type:varchar(32);comment:设备类型" json:"device_type"`
        UserAgent   string    `gorm:"type:varchar(256);comment:User-Agent" json:"user_agent"`
        Location    string    `gorm:"type:varchar(64);comment:登录地点" json:"location"`
        CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionLoginLog 创建登录日志到分表
func CreatePartitionLoginLog(log *PartitionLoginLog) error {
        now := time.Now()
        tableName := GetPartitionManager().GetLoginLogTableName(now)
        suffix := now.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeLoginLog, suffix); err != nil {
                return fmt.Errorf("确保登录日志分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(log).Error
}

// =============================================
// 分表竞技币流水操作函数
// =============================================

// PartitionArenaCoinLog 分表竞技币流水模型
type PartitionArenaCoinLog struct {
        ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        PlayerID     uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        ChangeAmount int64     `gorm:"type:bigint;not null;comment:变化金额" json:"change_amount"`
        BalanceAfter int64     `gorm:"type:bigint;not null;comment:变化后余额" json:"balance_after"`
        ChangeType   uint8     `gorm:"type:tinyint;not null;comment:变化类型" json:"change_type"`
        RelatedID    string    `gorm:"type:varchar(64);default:'';comment:关联ID" json:"related_id"`
        Remark       string    `gorm:"type:varchar(256);default:'';comment:备注" json:"remark"`
        CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionArenaCoinLog 创建竞技币流水到分表
func CreatePartitionArenaCoinLog(log *PartitionArenaCoinLog) error {
        now := time.Now()
        tableName := GetPartitionManager().GetArenaCoinLogTableName(now)
        suffix := now.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaCoinLog, suffix); err != nil {
                return fmt.Errorf("确保竞技币流水分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(log).Error
}

// =============================================
// 分表竞技场期号操作函数
// =============================================

// PartitionArenaPeriod 分表竞技场期号模型
type PartitionArenaPeriod struct {
        ID              uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PeriodNo        string     `gorm:"type:varchar(20);uniqueIndex;not null;comment:期号" json:"period_no"`
        RoomID          uint64     `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        RoomConfigID    uint64     `gorm:"type:bigint unsigned;not null;index;comment:房间配置ID" json:"room_config_id"`
        PeriodIndex     int        `gorm:"type:int;not null;default:1;comment:当日场次号" json:"period_index"`
        StartTime       time.Time  `gorm:"type:datetime;not null;index;comment:期号开始时间" json:"start_time"`
        SignupStartTime time.Time  `gorm:"type:datetime;not null;comment:报名开始时间" json:"signup_start_time"`
        SignupEndTime   time.Time  `gorm:"type:datetime;not null;comment:报名截止时间" json:"signup_end_time"`
        EndTime         time.Time  `gorm:"type:datetime;not null;comment:期号结束时间" json:"end_time"`
        TotalSignup     int        `gorm:"type:int;not null;default:0;comment:报名总人数" json:"total_signup"`
        TotalCancel     int        `gorm:"type:int;not null;default:0;comment:取消报名人数" json:"total_cancel"`
        FinalPlayers    int        `gorm:"type:int;not null;default:0;comment:最终参赛人数" json:"final_players"`
        Status          uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
        SessionID       *uint64    `gorm:"type:bigint unsigned;comment:关联会话ID" json:"session_id"`
        ProcessedAt     *time.Time `gorm:"type:datetime;comment:数据处理完成时间" json:"processed_at"`
        CreatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
        UpdatedAt       time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
}

// CreatePartitionArenaPeriod 创建竞技场期号到分表
func CreatePartitionArenaPeriod(period *PartitionArenaPeriod) error {
        startTime := period.StartTime
        if startTime.IsZero() {
                startTime = time.Now()
        }

        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        if err := DB().Table(tableName).Create(period).Error; err != nil {
                return err
        }

        log.Printf("💾 竞技场期号 %s 已保存到分表 %s", period.PeriodNo, tableName)
        return nil
}

// GetPartitionArenaPeriodByPeriodNo 根据期号从分表获取记录
func GetPartitionArenaPeriodByPeriodNo(periodNo string, startTime time.Time) (*PartitionArenaPeriod, error) {
        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return nil, fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        var period PartitionArenaPeriod
        err := DB().Table(tableName).Where("period_no = ?", periodNo).First(&period).Error
        if err != nil {
                return nil, err
        }
        return &period, nil
}

// GetPartitionArenaPeriodByID 根据ID从分表获取记录
func GetPartitionArenaPeriodByID(id uint64, startTime time.Time) (*PartitionArenaPeriod, error) {
        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return nil, fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        var period PartitionArenaPeriod
        err := DB().Table(tableName).Where("id = ?", id).First(&period).Error
        if err != nil {
                return nil, err
        }
        return &period, nil
}

// UpdatePartitionArenaPeriod 更新竞技场期号分表记录
func UpdatePartitionArenaPeriod(period *PartitionArenaPeriod, startTime time.Time) error {
        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        return DB().Table(tableName).Save(period).Error
}

// UpdatePartitionArenaPeriodStatus 更新竞技场期号状态
func UpdatePartitionArenaPeriodStatus(id uint64, status uint8, startTime time.Time) error {
        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        return DB().Table(tableName).Where("id = ?", id).Update("status", status).Error
}

// UpdatePartitionArenaPeriodSignupCount 更新竞技场期号报名人数
func UpdatePartitionArenaPeriodSignupCount(id uint64, signupDelta, cancelDelta int, startTime time.Time) error {
        tableName := GetPartitionManager().GetArenaPeriodTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriod, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号分表存在失败: %w", err)
        }

        return DB().Table(tableName).Where("id = ?", id).
                Updates(map[string]interface{}{
                        "total_signup": gorm.Expr("total_signup + ?", signupDelta),
                        "total_cancel": gorm.Expr("total_cancel + ?", cancelDelta),
                }).Error
}

// GetPartitionArenaPeriodListWithPage 分页获取竞技场期号列表（跨月份查询）
func GetPartitionArenaPeriodListWithPage(page, pageSize int, startTime, endTime time.Time, status *uint8) ([]PartitionArenaPeriod, int64, error) {
        var periods []PartitionArenaPeriod
        var total int64

        // 收集需要查询的所有表
        var tables []string
        startMonth := time.Date(startTime.Year(), startTime.Month(), 1, 0, 0, 0, 0, startTime.Location())
        endMonth := time.Date(endTime.Year(), endTime.Month(), 1, 0, 0, 0, 0, endTime.Location())

        for m := startMonth; !m.After(endMonth); m = m.AddDate(0, 1, 0) {
                tableName := GetPartitionManager().GetArenaPeriodTableName(m)
                // 检查表是否存在
                var count int64
                DB().Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)
                if count > 0 {
                        tables = append(tables, tableName)
                }
        }

        if len(tables) == 0 {
                return periods, 0, nil
        }

        // 简化版本：只查询第一个表（当前月）
        // 实际生产环境需要更复杂的跨表分页逻辑
        tableName := tables[0]

        db := DB().Table(tableName)
        if status != nil {
                db = db.Where("status = ?", *status)
        }
        db = db.Where("start_time >= ? AND start_time <= ?", startTime, endTime)

        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&periods).Error; err != nil {
                return nil, 0, err
        }

        return periods, total, nil
}

// =============================================
// 分表竞技场报名日志操作函数
// =============================================

// PartitionArenaSignupLog 分表竞技场报名日志模型
type PartitionArenaSignupLog struct {
        ID            uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
        PeriodNo      string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        PeriodID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:期号记录ID" json:"period_id"`
        RoomID        uint64    `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        ActionType    uint8     `gorm:"type:tinyint unsigned;not null;index;comment:操作类型" json:"action_type"`
        SignupFee     int64     `gorm:"type:bigint;not null;default:0;comment:报名费" json:"signup_fee"`
        BalanceBefore int64     `gorm:"type:bigint;not null;default:0;comment:操作前余额" json:"balance_before"`
        BalanceAfter  int64     `gorm:"type:bigint;not null;default:0;comment:操作后余额" json:"balance_after"`
        Remark        string    `gorm:"type:varchar(256);comment:备注" json:"remark"`
        CreatedAt     time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`
}

// CreatePartitionArenaSignupLog 创建竞技场报名日志到分表
func CreatePartitionArenaSignupLog(log *PartitionArenaSignupLog) error {
        now := time.Now()
        tableName := GetPartitionManager().GetArenaSignupLogTableName(now)
        suffix := now.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaSignupLog, suffix); err != nil {
                return fmt.Errorf("确保竞技场报名日志分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(log).Error
}

// GetPartitionArenaSignupLogsByPeriodID 根据期号ID获取报名日志
func GetPartitionArenaSignupLogsByPeriodID(periodID uint64, startTime time.Time, page, pageSize int) ([]PartitionArenaSignupLog, int64, error) {
        tableName := GetPartitionManager().GetArenaSignupLogTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaSignupLog, suffix); err != nil {
                return nil, 0, fmt.Errorf("确保竞技场报名日志分表存在失败: %w", err)
        }

        var logs []PartitionArenaSignupLog
        var total int64

        db := DB().Table(tableName).Where("period_id = ?", periodID)
        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
                return nil, 0, err
        }

        return logs, total, nil
}

// =============================================
// 分表竞技场期号玩家操作函数
// =============================================

// PartitionArenaPeriodPlayer 分表竞技场期号玩家模型
type PartitionArenaPeriodPlayer struct {
        ID          uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
        PeriodNo    string    `gorm:"type:varchar(20);not null;index;comment:期号" json:"period_no"`
        PeriodID    uint64    `gorm:"type:bigint unsigned;not null;index;comment:期号记录ID" json:"period_id"`
        RoomID      uint64    `gorm:"type:bigint unsigned;not null;index;comment:房间ID" json:"room_id"`
        PlayerID    uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
        SignupTime  time.Time `gorm:"type:datetime;not null;comment:报名时间" json:"signup_time"`
        SignupOrder int       `gorm:"type:int;not null;default:0;comment:报名顺序" json:"signup_order"`
        SignupFee   int64     `gorm:"type:bigint;not null;default:0;comment:报名费" json:"signup_fee"`
        Status      uint8     `gorm:"type:tinyint unsigned;not null;default:1;index;comment:状态" json:"status"`
        CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// CreatePartitionArenaPeriodPlayer 创建竞技场期号玩家到分表
func CreatePartitionArenaPeriodPlayer(player *PartitionArenaPeriodPlayer) error {
        signupTime := player.SignupTime
        if signupTime.IsZero() {
                signupTime = time.Now()
        }

        tableName := GetPartitionManager().GetArenaPeriodPlayerTableName(signupTime)
        suffix := signupTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriodPlayer, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号玩家分表存在失败: %w", err)
        }

        return DB().Table(tableName).Create(player).Error
}

// GetPartitionArenaPeriodPlayersByPeriodID 根据期号ID获取报名玩家
func GetPartitionArenaPeriodPlayersByPeriodID(periodID uint64, startTime time.Time) ([]PartitionArenaPeriodPlayer, error) {
        tableName := GetPartitionManager().GetArenaPeriodPlayerTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriodPlayer, suffix); err != nil {
                return nil, fmt.Errorf("确保竞技场期号玩家分表存在失败: %w", err)
        }

        var players []PartitionArenaPeriodPlayer
        err := DB().Table(tableName).
                Where("period_id = ? AND status = ?", periodID, ArenaPeriodPlayerStatusNormal).
                Order("signup_order ASC").
                Find(&players).Error
        return players, err
}

// UpdatePartitionArenaPeriodPlayerStatus 更新竞技场期号玩家状态
func UpdatePartitionArenaPeriodPlayerStatus(periodID, playerID uint64, status uint8, startTime time.Time) error {
        tableName := GetPartitionManager().GetArenaPeriodPlayerTableName(startTime)
        suffix := startTime.Format("200601")

        // 确保分表存在
        if err := GetPartitionManager().EnsureTableExists(PartitionTypeArenaPeriodPlayer, suffix); err != nil {
                return fmt.Errorf("确保竞技场期号玩家分表存在失败: %w", err)
        }

        return DB().Table(tableName).
                Where("period_id = ? AND player_id = ?", periodID, playerID).
                Update("status", status).Error
}
