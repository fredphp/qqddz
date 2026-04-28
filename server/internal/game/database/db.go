// Package database 提供斗地主游戏的数据库模型和连接管理
package database

import (
        "fmt"
        "log"
        "sync"
        "time"

        "gorm.io/driver/mysql"
        "gorm.io/gorm"
        "gorm.io/gorm/logger"
)

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
        Host            string        `yaml:"host" json:"host"`                         // 数据库主机
        Port            int           `yaml:"port" json:"port"`                         // 数据库端口
        Username        string        `yaml:"username" json:"username"`                 // 用户名
        Password        string        `yaml:"password" json:"password"`                 // 密码
        Database        string        `yaml:"database" json:"database"`                 // 数据库名
        Charset         string        `yaml:"charset" json:"charset"`                   // 字符集
        Collation       string        `yaml:"collation" json:"collation"`               // 排序规则
        MaxIdleConns    int           `yaml:"max_idle_conns" json:"max_idle_conns"`     // 最大空闲连接数
        MaxOpenConns    int           `yaml:"max_open_conns" json:"max_open_conns"`     // 最大打开连接数
        ConnMaxLifetime time.Duration `yaml:"conn_max_lifetime" json:"conn_max_lifetime"` // 连接最大生命周期
        LogLevel        string        `yaml:"log_level" json:"log_level"`               // 日志级别: silent, error, warn, info
}

// DefaultConfig 返回默认数据库配置
func DefaultConfig() *DatabaseConfig {
        return &DatabaseConfig{
                Host:            "localhost",
                Port:            3306,
                Username:        "root",
                Password:        "",
                Database:        "ddz_game",
                Charset:         "utf8mb4",
                Collation:       "utf8mb4_unicode_ci",
                MaxIdleConns:    10,
                MaxOpenConns:    100,
                ConnMaxLifetime: time.Hour,
                LogLevel:        "warn",
        }
}

// Database 数据库连接管理器
type Database struct {
        db     *gorm.DB
        config *DatabaseConfig
        mu     sync.RWMutex
}

var (
        instance *Database
        once     sync.Once
)

// GetInstance 获取数据库单例实例
func GetInstance() *Database {
        once.Do(func() {
                instance = &Database{
                        config: DefaultConfig(),
                }
        })
        return instance
}

// Init 使用配置初始化数据库连接
func (d *Database) Init(config *DatabaseConfig) error {
        d.mu.Lock()
        defer d.mu.Unlock()

        if config != nil {
                d.config = config
        }

        dsn := d.buildDSN()
        
        // 配置GORM日志级别
        logLevel := d.getLogLevel()
        
        gormConfig := &gorm.Config{
                Logger: logger.Default.LogMode(logLevel),
        }

        db, err := gorm.Open(mysql.Open(dsn), gormConfig)
        if err != nil {
                return fmt.Errorf("failed to connect database: %w", err)
        }

        // 获取底层sql.DB以配置连接池
        sqlDB, err := db.DB()
        if err != nil {
                return fmt.Errorf("failed to get sql.DB: %w", err)
        }

        // 配置连接池
        sqlDB.SetMaxIdleConns(d.config.MaxIdleConns)
        sqlDB.SetMaxOpenConns(d.config.MaxOpenConns)
        sqlDB.SetConnMaxLifetime(d.config.ConnMaxLifetime)

        // 测试连接
        if err := sqlDB.Ping(); err != nil {
                return fmt.Errorf("failed to ping database: %w", err)
        }

        d.db = db
        log.Println("Database connected successfully")
        return nil
}

// buildDSN 构建数据库连接字符串
func (d *Database) buildDSN() string {
        return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&collation=%s&parseTime=True&loc=Local",
                d.config.Username,
                d.config.Password,
                d.config.Host,
                d.config.Port,
                d.config.Database,
                d.config.Charset,
                d.config.Collation,
        )
}

// getLogLevel 获取日志级别
func (d *Database) getLogLevel() logger.LogLevel {
        switch d.config.LogLevel {
        case "silent":
                return logger.Silent
        case "error":
                return logger.Error
        case "info":
                return logger.Info
        default:
                return logger.Warn
        }
}

// GetDB 获取GORM数据库实例
func (d *Database) GetDB() *gorm.DB {
        d.mu.RLock()
        defer d.mu.RUnlock()
        return d.db
}

// Close 关闭数据库连接
func (d *Database) Close() error {
        d.mu.Lock()
        defer d.mu.Unlock()

        if d.db != nil {
                sqlDB, err := d.db.DB()
                if err != nil {
                        return err
                }
                return sqlDB.Close()
        }
        return nil
}

// IsConnected 检查数据库是否已连接
func (d *Database) IsConnected() bool {
        d.mu.RLock()
        defer d.mu.RUnlock()

        if d.db == nil {
                return false
        }

        sqlDB, err := d.db.DB()
        if err != nil {
                return false
        }

        return sqlDB.Ping() == nil
}

// AutoMigrate 自动迁移数据库表结构
func (d *Database) AutoMigrate() error {
        d.mu.RLock()
        defer d.mu.RUnlock()

        if d.db == nil {
                return fmt.Errorf("database not initialized")
        }

        return d.db.AutoMigrate(
                &Player{},
                &RoomConfig{},
                &Room{},
                &RoomPlayer{},
                &GameRecord{},
                &DealLog{},
                &BidLog{},
                &PlayLog{},
                &PlayerStats{},
                &UserAccount{},
                &SmsCode{},
                &LoginLog{},
        )
}

// =============================================
// 便捷的全局函数
// =============================================

// DB 获取数据库实例
func DB() *gorm.DB {
        return GetInstance().GetDB()
}

// InitDB 初始化数据库连接
func InitDB(config *DatabaseConfig) error {
        return GetInstance().Init(config)
}

// CloseDB 关闭数据库连接
func CloseDB() error {
        return GetInstance().Close()
}

// =============================================
// 玩家相关操作
// =============================================

// CreatePlayer 创建玩家
func CreatePlayer(player *Player) error {
        return DB().Create(player).Error
}

// GetPlayerByID 根据ID获取玩家
func GetPlayerByID(id uint64) (*Player, error) {
        var player Player
        err := DB().First(&player, id).Error
        if err != nil {
                return nil, err
        }
        return &player, nil
}

// GetPlayerByNickname 根据昵称获取玩家
func GetPlayerByNickname(nickname string) (*Player, error) {
        var player Player
        err := DB().Where("nickname = ?", nickname).First(&player).Error
        if err != nil {
                return nil, err
        }
        return &player, nil
}

// GetOrCreatePlayerByNickname 根据昵称获取或创建玩家
// 返回玩家ID，如果出错则返回0
func GetOrCreatePlayerByNickname(nickname string) uint64 {
        var player Player
        
        // 先尝试查找
        err := DB().Where("nickname = ?", nickname).First(&player).Error
        if err == nil {
                return player.ID
        }
        
        // 不存在则创建
        player = Player{
                Nickname: nickname,
                Gold:     10000, // 初始金币
                Status:   PlayerStatusNormal,
        }
        if err := DB().Create(&player).Error; err != nil {
                log.Printf("⚠️ 创建玩家失败: %v", err)
                return 0
        }
        
        log.Printf("✅ 创建新玩家: %s (ID: %d)", nickname, player.ID)
        return player.ID
}

// UpdatePlayerGold 更新玩家金币
func UpdatePlayerGold(playerID uint64, goldChange int64) error {
        return DB().Model(&Player{}).
                Where("id = ?", playerID).
                Update("gold", gorm.Expr("gold + ?", goldChange)).Error
}

// UpdatePlayerStats 更新玩家统计数据
func UpdatePlayerStats(playerID uint64, win bool, isLandlord bool) error {
        updates := make(map[string]interface{})
        
        if win {
                updates["win_count"] = gorm.Expr("win_count + 1")
        } else {
                updates["lose_count"] = gorm.Expr("lose_count + 1")
        }
        
        if isLandlord {
                updates["landlord_count"] = gorm.Expr("landlord_count + 1")
        } else {
                updates["farmer_count"] = gorm.Expr("farmer_count + 1")
        }
        
        return DB().Model(&Player{}).
                Where("id = ?", playerID).
                Updates(updates).Error
}

// GetPlayerList 获取玩家列表
func GetPlayerList(page, pageSize int, orderBy string) ([]Player, int64, error) {
        var players []Player
        var total int64

        db := DB().Model(&Player{})
        
        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        if orderBy == "" {
                orderBy = "id DESC"
        }

        offset := (page - 1) * pageSize
        if err := db.Order(orderBy).Offset(offset).Limit(pageSize).Find(&players).Error; err != nil {
                return nil, 0, err
        }

        return players, total, nil
}

// =============================================
// 房间配置相关操作
// =============================================

// CreateRoomConfig 创建房间配置
func CreateRoomConfig(config *RoomConfig) error {
        return DB().Create(config).Error
}

// GetRoomConfigByID 根据ID获取房间配置
func GetRoomConfigByID(id uint64) (*RoomConfig, error) {
        var config RoomConfig
        err := DB().First(&config, id).Error
        if err != nil {
                return nil, err
        }
        return &config, nil
}

// GetRoomConfigByType 根据类型获取房间配置
func GetRoomConfigByType(roomType uint8) (*RoomConfig, error) {
        var config RoomConfig
        err := DB().Where("room_type = ? AND status = ?", roomType, RoomConfigStatusOpen).
                First(&config).Error
        if err != nil {
                return nil, err
        }
        return &config, nil
}

// GetActiveRoomConfigs 获取所有启用的房间配置
func GetActiveRoomConfigs() ([]RoomConfig, error) {
        var configs []RoomConfig
        err := DB().Where("status = ?", RoomConfigStatusOpen).
                Order("sort_order ASC").
                Find(&configs).Error
        if err != nil {
                return nil, err
        }
        return configs, nil
}

// =============================================
// 房间相关操作
// =============================================

// CreateRoom 创建房间
func CreateRoom(room *Room) error {
        return DB().Create(room).Error
}

// GetRoomByCode 根据房间号获取房间
func GetRoomByCode(roomCode string) (*Room, error) {
        var room Room
        err := DB().Where("room_code = ?", roomCode).First(&room).Error
        if err != nil {
                return nil, err
        }
        return &room, nil
}

// GetRoomByID 根据ID获取房间
func GetRoomByID(id uint64) (*Room, error) {
        var room Room
        err := DB().First(&room, id).Error
        if err != nil {
                return nil, err
        }
        return &room, nil
}

// UpdateRoom 更新房间
func UpdateRoom(room *Room) error {
        return DB().Save(room).Error
}

// UpdateRoomStatus 更新房间状态
func UpdateRoomStatus(roomCode string, status uint8) error {
        updates := map[string]interface{}{
                "status": status,
        }
        if status == RoomStatusFinished || status == RoomStatusClosed {
                now := time.Now()
                updates["ended_at"] = &now
        }
        return DB().Model(&Room{}).Where("room_code = ?", roomCode).Updates(updates).Error
}

// AddPlayerToRoom 添加玩家到房间
func AddPlayerToRoom(roomCode string, playerID uint64, seatIndex int) error {
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

        return DB().Model(&Room{}).Where("room_code = ?", roomCode).
                Updates(map[string]interface{}{
                        field:         playerID,
                        "player_count": gorm.Expr("player_count + 1"),
                }).Error
}

// RemovePlayerFromRoom 从房间移除玩家
func RemovePlayerFromRoom(roomCode string, seatIndex int) error {
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

        return DB().Model(&Room{}).Where("room_code = ?", roomCode).
                Updates(map[string]interface{}{
                        field:         nil,
                        "player_count": gorm.Expr("GREATEST(player_count - 1, 0)"),
                }).Error
}

// GetWaitingRooms 获取等待中的房间列表
func GetWaitingRooms(limit int) ([]Room, error) {
        var rooms []Room
        err := DB().Where("status = ?", RoomStatusWaiting).
                Order("created_at DESC").
                Limit(limit).
                Find(&rooms).Error
        if err != nil {
                return nil, err
        }
        return rooms, nil
}

// DeleteRoom 删除房间
func DeleteRoom(roomCode string) error {
        return DB().Where("room_code = ?", roomCode).Delete(&Room{}).Error
}

// =============================================
// 房间玩家关联表操作
// =============================================

// CreateRoomPlayer 创建房间玩家关联
func CreateRoomPlayer(roomPlayer *RoomPlayer) error {
        return DB().Create(roomPlayer).Error
}

// GetRoomPlayers 获取房间所有玩家
func GetRoomPlayers(roomCode string) ([]RoomPlayer, error) {
        var players []RoomPlayer
        err := DB().Where("room_code = ? AND left_at IS NULL", roomCode).
                Order("seat_index ASC").
                Find(&players).Error
        if err != nil {
                return nil, err
        }
        return players, nil
}

// GetRoomPlayerByPlayerID 根据玩家ID获取房间玩家关联
func GetRoomPlayerByPlayerID(roomCode string, playerID uint64) (*RoomPlayer, error) {
        var roomPlayer RoomPlayer
        err := DB().Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                First(&roomPlayer).Error
        if err != nil {
                return nil, err
        }
        return &roomPlayer, nil
}

// UpdateRoomPlayerSeat 更新玩家座位
func UpdateRoomPlayerSeat(roomCode string, playerID uint64, seatIndex uint8) error {
        return DB().Model(&RoomPlayer{}).
                Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                Update("seat_index", seatIndex).Error
}

// UpdateRoomPlayerReady 更新玩家准备状态
func UpdateRoomPlayerReady(roomCode string, playerID uint64, isReady bool) error {
        readyVal := uint8(0)
        if isReady {
                readyVal = 1
        }
        return DB().Model(&RoomPlayer{}).
                Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                Update("is_ready", readyVal).Error
}

// UpdateRoomPlayerOffline 更新玩家离线状态
func UpdateRoomPlayerOffline(roomCode string, playerID uint64, isOffline bool) error {
        offlineVal := uint8(0)
        if isOffline {
                offlineVal = 1
        }
        return DB().Model(&RoomPlayer{}).
                Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                Update("is_offline", offlineVal).Error
}

// RemoveRoomPlayer 移除房间玩家（设置离开时间）
func RemoveRoomPlayer(roomCode string, playerID uint64) error {
        now := time.Now()
        return DB().Model(&RoomPlayer{}).
                Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                Update("left_at", &now).Error
}

// GetNextSeatIndex 获取房间下一个可用座位号
func GetNextSeatIndex(roomCode string) (uint8, error) {
        var players []RoomPlayer
        err := DB().Where("room_code = ? AND left_at IS NULL", roomCode).
                Order("seat_index ASC").
                Find(&players).Error
        if err != nil {
                return 0, err
        }

        // 找到第一个空座位
        usedSeats := make(map[uint8]bool)
        for _, p := range players {
                usedSeats[p.SeatIndex] = true
        }

        for i := uint8(0); i < 3; i++ {
                if !usedSeats[i] {
                        return i, nil
                }
        }

        return 0, fmt.Errorf("room is full")
}

// IsPlayerInRoom 检查玩家是否在房间中
func IsPlayerInRoom(roomCode string, playerID uint64) (bool, error) {
        var count int64
        err := DB().Model(&RoomPlayer{}).
                Where("room_code = ? AND player_id = ? AND left_at IS NULL", roomCode, playerID).
                Count(&count).Error
        if err != nil {
                return false, err
        }
        return count > 0, nil
}

// GetActiveRoomCount 获取活跃房间数量（玩家数大于0）
func GetActiveRoomCount() (int64, error) {
        var count int64
        err := DB().Model(&Room{}).
                Where("status IN ?", []uint8{RoomStatusWaiting, RoomStatusPlaying}).
                Count(&count).Error
        return count, err
}

// GetRoomListWithPlayers 获取房间列表（包含玩家信息）
func GetRoomListWithPlayers(page, pageSize int, status uint8) ([]Room, int64, error) {
        var rooms []Room
        var total int64

        db := DB().Model(&Room{})
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
// 游戏记录相关操作
// =============================================

// CreateGameRecord 创建游戏记录
func CreateGameRecord(record *GameRecord) error {
        return DB().Create(record).Error
}

// GetGameRecordByID 根据ID获取游戏记录
func GetGameRecordByID(id uint64) (*GameRecord, error) {
        var record GameRecord
        err := DB().First(&record, id).Error
        if err != nil {
                return nil, err
        }
        return &record, nil
}

// GetGameRecordByGameID 根据游戏ID获取游戏记录
func GetGameRecordByGameID(gameID string) (*GameRecord, error) {
        var record GameRecord
        err := DB().Where("game_id = ?", gameID).First(&record).Error
        if err != nil {
                return nil, err
        }
        return &record, nil
}

// GetPlayerGameRecords 获取玩家游戏记录
func GetPlayerGameRecords(playerID uint64, page, pageSize int) ([]GameRecord, int64, error) {
        var records []GameRecord
        var total int64

        db := DB().Model(&GameRecord{}).
                Where("landlord_id = ? OR farmer1_id = ? OR farmer2_id = ?", playerID, playerID, playerID)

        if err := db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        offset := (page - 1) * pageSize
        if err := db.Order("started_at DESC").
                Offset(offset).Limit(pageSize).
                Find(&records).Error; err != nil {
                return nil, 0, err
        }

        return records, total, nil
}

// =============================================
// 出牌日志相关操作
// =============================================

// CreatePlayLog 创建出牌日志
func CreatePlayLog(log *PlayLog) error {
        return DB().Create(log).Error
}

// BatchCreatePlayLogs 批量创建出牌日志
func BatchCreatePlayLogs(logs []PlayLog) error {
        return DB().Create(&logs).Error
}

// GetPlayLogsByGameID 根据游戏ID获取出牌日志
func GetPlayLogsByGameID(gameID string) ([]PlayLog, error) {
        var logs []PlayLog
        err := DB().Where("game_id = ?", gameID).
                Order("round_num ASC, play_order ASC").
                Find(&logs).Error
        if err != nil {
                return nil, err
        }
        return logs, nil
}

// =============================================
// 发牌日志相关操作
// =============================================

// CreateDealLog 创建发牌日志
func CreateDealLog(log *DealLog) error {
        return DB().Create(log).Error
}

// BatchCreateDealLogs 批量创建发牌日志
func BatchCreateDealLogs(logs []DealLog) error {
        return DB().Create(&logs).Error
}

// GetDealLogsByGameID 根据游戏ID获取发牌日志
func GetDealLogsByGameID(gameID string) ([]DealLog, error) {
        var logs []DealLog
        err := DB().Where("game_id = ?", gameID).Find(&logs).Error
        if err != nil {
                return nil, err
        }
        return logs, nil
}

// =============================================
// 叫地主日志相关操作
// =============================================

// CreateBidLog 创建叫地主日志
func CreateBidLog(log *BidLog) error {
        return DB().Create(log).Error
}

// BatchCreateBidLogs 批量创建叫地主日志
func BatchCreateBidLogs(logs []BidLog) error {
        return DB().Create(&logs).Error
}

// GetBidLogsByGameID 根据游戏ID获取叫地主日志
func GetBidLogsByGameID(gameID string) ([]BidLog, error) {
        var logs []BidLog
        err := DB().Where("game_id = ?", gameID).
                Order("bid_order ASC").
                Find(&logs).Error
        if err != nil {
                return nil, err
        }
        return logs, nil
}

// =============================================
// 玩家统计相关操作
// =============================================

// CreatePlayerStats 创建玩家统计
func CreatePlayerStats(stats *PlayerStats) error {
        return DB().Create(stats).Error
}

// GetPlayerStatsByDate 根据玩家ID和日期获取统计
func GetPlayerStatsByDate(playerID uint64, date time.Time) (*PlayerStats, error) {
        var stats PlayerStats
        err := DB().Where("player_id = ? AND stat_date = ?", playerID, date.Format("2006-01-02")).
                First(&stats).Error
        if err != nil {
                return nil, err
        }
        return &stats, nil
}

// GetPlayerStatsHistory 获取玩家统计历史
func GetPlayerStatsHistory(playerID uint64, days int) ([]PlayerStats, error) {
        var stats []PlayerStats
        startDate := time.Now().AddDate(0, 0, -days).Format("2006-01-02")
        
        err := DB().Where("player_id = ? AND stat_date >= ?", playerID, startDate).
                Order("stat_date DESC").
                Find(&stats).Error
        if err != nil {
                return nil, err
        }
        return stats, nil
}

// UpsertPlayerStats 创建或更新玩家统计
func UpsertPlayerStats(stats *PlayerStats) error {
        return DB().Save(stats).Error
}

// =============================================
// 排行榜相关操作
// =============================================

// GetGoldRankList 获取金币排行榜
func GetGoldRankList(limit int) ([]Player, error) {
        var players []Player
        err := DB().Where("status = ?", PlayerStatusNormal).
                Order("gold DESC").
                Limit(limit).
                Find(&players).Error
        if err != nil {
                return nil, err
        }
        return players, nil
}

// GetWinRateRankList 获取胜率排行榜
func GetWinRateRankList(minGames, limit int) ([]Player, error) {
        var players []Player
        err := DB().Where("status = ? AND (win_count + lose_count) >= ?", PlayerStatusNormal, minGames).
                Order("(win_count * 100.0 / (win_count + lose_count)) DESC").
                Limit(limit).
                Find(&players).Error
        if err != nil {
                return nil, err
        }
        return players, nil
}

// GetLevelRankList 获取等级排行榜
func GetLevelRankList(limit int) ([]Player, error) {
        var players []Player
        err := DB().Where("status = ?", PlayerStatusNormal).
                Order("level DESC, experience DESC").
                Limit(limit).
                Find(&players).Error
        if err != nil {
                return nil, err
        }
        return players, nil
}

// =============================================
// 事务相关操作
// =============================================

// Transaction 执行事务
func Transaction(fn func(tx *gorm.DB) error) error {
        return DB().Transaction(fn)
}

// SaveGameResult 保存游戏结果(事务操作)
func SaveGameResult(record *GameRecord, dealLogs []DealLog, bidLogs []BidLog, playLogs []PlayLog) error {
        return Transaction(func(tx *gorm.DB) error {
                // 保存游戏记录
                if err := tx.Create(record).Error; err != nil {
                        return err
                }
                
                // 保存发牌日志
                if len(dealLogs) > 0 {
                        if err := tx.Create(&dealLogs).Error; err != nil {
                                return err
                        }
                }
                
                // 保存叫地主日志
                if len(bidLogs) > 0 {
                        if err := tx.Create(&bidLogs).Error; err != nil {
                                return err
                        }
                }
                
                // 保存出牌日志
                if len(playLogs) > 0 {
                        if err := tx.Create(&playLogs).Error; err != nil {
                                return err
                        }
                }
                
                // 更新玩家金币
                if err := UpdatePlayerGold(record.LandlordID, record.LandlordWinGold); err != nil {
                        return err
                }
                if err := UpdatePlayerGold(record.Farmer1ID, record.Farmer1WinGold); err != nil {
                        return err
                }
                if err := UpdatePlayerGold(record.Farmer2ID, record.Farmer2WinGold); err != nil {
                        return err
                }
                
                // 更新玩家统计数据
                landlordWin := record.Result == GameResultLandlordWin
                if err := UpdatePlayerStats(record.LandlordID, landlordWin, true); err != nil {
                        return err
                }
                if err := UpdatePlayerStats(record.Farmer1ID, !landlordWin, false); err != nil {
                        return err
                }
                if err := UpdatePlayerStats(record.Farmer2ID, !landlordWin, false); err != nil {
                        return err
                }
                
                return nil
        })
}
