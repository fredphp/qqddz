// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"math"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

// =============================================
// MatchScheduler - 分桌调度器
// =============================================

// MatchScheduler 分桌调度器
type MatchScheduler struct {
	db *gorm.DB
}

// NewMatchScheduler 创建分桌调度器
func NewMatchScheduler(db *gorm.DB) *MatchScheduler {
	return &MatchScheduler{
		db: db,
	}
}

// ScheduleTables 分桌
// 参数:
// - sessionID: 会话ID
// - players: 玩家列表
// - roundNum: 轮次号
// 返回:
// - tables: 分配好的桌列表
// - error: 错误
func (ms *MatchScheduler) ScheduleTables(sessionID uint64, players PlayerList, roundNum int) ([]*TableInfo, error) {
	if len(players) < 3 {
		return nil, ErrInsufficientPlayers
	}

	// 随机打乱玩家顺序
	shuffledPlayers := ms.shufflePlayers(players)

	// 计算需要的桌数
	tableCount := int(math.Ceil(float64(len(shuffledPlayers)) / 3.0))

	// 分配玩家到各桌
	tables := make([]*TableInfo, 0, tableCount)
	playerIdx := 0

	for i := 0; i < tableCount; i++ {
		table := &TableInfo{
			TableCode: ms.generateTableCode(),
			RoundNum:  roundNum,
			Status:    TableStatusWaiting,
			Players:   [3]*PlayerInfo{nil, nil, nil},
		}

		// 每桌分配最多3个玩家
		for j := 0; j < 3 && playerIdx < len(shuffledPlayers); j++ {
			table.Players[j] = shuffledPlayers[playerIdx]
			playerIdx++
		}

		tables = append(tables, table)
	}

	// 保存到数据库
	err := ms.saveTables(sessionID, tables)
	if err != nil {
		return nil, err
	}

	log.Printf("[MatchScheduler] 分桌完成: sessionID=%d, players=%d, tables=%d, round=%d",
		sessionID, len(players), tableCount, roundNum)

	return tables, nil
}

// ScheduleFinal 决赛分桌（只剩3人）
func (ms *MatchScheduler) ScheduleFinal(sessionID uint64, players PlayerList, roundNum int) (*TableInfo, error) {
	if len(players) != 3 {
		return nil, ErrInsufficientPlayers
	}

	table := &TableInfo{
		TableCode: ms.generateTableCode(),
		RoundNum:  roundNum,
		Status:    TableStatusWaiting,
		Players:   [3]*PlayerInfo{players[0], players[1], players[2]},
	}

	// 保存到数据库
	tables := []*TableInfo{table}
	err := ms.saveTables(sessionID, tables)
	if err != nil {
		return nil, err
	}

	log.Printf("[MatchScheduler] 决赛分桌完成: sessionID=%d, players=%v", sessionID, 
		[]uint64{players[0].PlayerID, players[1].PlayerID, players[2].PlayerID})

	return table, nil
}

// shufflePlayers 随机打乱玩家顺序
func (ms *MatchScheduler) shufflePlayers(players PlayerList) PlayerList {
	// 复制一份，避免修改原数组
	shuffled := make(PlayerList, len(players))
	copy(shuffled, players)

	// Fisher-Yates 洗牌算法
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := len(shuffled) - 1; i > 0; i-- {
		j := r.Intn(i + 1)
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	}

	return shuffled
}

// generateTableCode 生成桌编码
func (ms *MatchScheduler) generateTableCode() string {
	bytes := make([]byte, 4)
	rand.Read(bytes)
	return "T" + hex.EncodeToString(bytes)
}

// saveTables 保存桌信息到数据库
func (ms *MatchScheduler) saveTables(sessionID uint64, tables []*TableInfo) error {
	return ms.db.Transaction(func(tx *gorm.DB) error {
		for _, table := range tables {
			// 插入桌记录
			result := tx.Exec(`
				INSERT INTO ddz_arena_tables (table_code, session_id, round_num, player1_id, player2_id, player3_id, status, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
			`, table.TableCode, sessionID, table.RoundNum,
				ms.playerIDPtr(table.Players[0]),
				ms.playerIDPtr(table.Players[1]),
				ms.playerIDPtr(table.Players[2]))

			if result.Error != nil {
				return result.Error
			}

			// 获取插入的ID
			var tableID uint64
			if err := tx.Raw("SELECT LAST_INSERT_ID()").Scan(&tableID).Error; err != nil {
				return err
			}
			table.TableID = tableID

			// 更新玩家当前桌信息
			for _, player := range table.Players {
				if player != nil {
					err := tx.Exec(`
						UPDATE ddz_arena_participations 
						SET current_table_id = ?, last_table_id = ?, updated_at = NOW()
						WHERE session_id = ? AND player_id = ?
					`, tableID, table.TableCode, sessionID, player.PlayerID).Error
					if err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
}

func (ms *MatchScheduler) playerIDPtr(player *PlayerInfo) *uint64 {
	if player == nil {
		return nil
	}
	return &player.PlayerID
}

// GetPlayerTable 获取玩家当前桌
func (ms *MatchScheduler) GetPlayerTable(sessionID, playerID uint64) (*TableInfo, error) {
	var table struct {
		ID        uint64
		TableCode string
		SessionID uint64
		RoundNum  int
		Status    uint8
		Player1ID *uint64
		Player2ID *uint64
		Player3ID *uint64
		GameID    *string
	}

	err := ms.db.Table("ddz_arena_tables").
		Where("session_id = ? AND (player1_id = ? OR player2_id = ? OR player3_id = ?)",
			sessionID, playerID, playerID, playerID).
		Order("id DESC").
		First(&table).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &TableInfo{
		TableID:   table.ID,
		TableCode: table.TableCode,
		RoundNum:  table.RoundNum,
		Status:    TableStatus(table.Status),
		GameID:    ptrToStr(table.GameID),
	}, nil
}

// ClearTables 清除本轮桌信息（准备下一轮分桌）
func (ms *MatchScheduler) ClearTables(sessionID uint64, roundNum int) error {
	return ms.db.Transaction(func(tx *gorm.DB) error {
		// 清除玩家当前桌信息
		err := tx.Exec(`
			UPDATE ddz_arena_participations 
			SET current_table_id = NULL, updated_at = NOW()
			WHERE session_id = ?
		`, sessionID).Error
		if err != nil {
			return err
		}

		return nil
	})
}

// GetRoundTables 获取指定轮次的所有桌
func (ms *MatchScheduler) GetRoundTables(sessionID uint64, roundNum int) ([]*TableInfo, error) {
	var tables []struct {
		ID        uint64
		TableCode string
		RoundNum  int
		Status    uint8
		Player1ID *uint64
		Player2ID *uint64
		Player3ID *uint64
		GameID    *string
	}

	err := ms.db.Table("ddz_arena_tables").
		Where("session_id = ? AND round_num = ?", sessionID, roundNum).
		Order("id ASC").
		Find(&tables).Error

	if err != nil {
		return nil, err
	}

	result := make([]*TableInfo, len(tables))
	for i, t := range tables {
		result[i] = &TableInfo{
			TableID:   t.ID,
			TableCode: t.TableCode,
			RoundNum:  t.RoundNum,
			Status:    TableStatus(t.Status),
			GameID:    ptrToStr(t.GameID),
		}
		if t.Player1ID != nil {
			result[i].Players[0] = &PlayerInfo{PlayerID: *t.Player1ID}
		}
		if t.Player2ID != nil {
			result[i].Players[1] = &PlayerInfo{PlayerID: *t.Player2ID}
		}
		if t.Player3ID != nil {
			result[i].Players[2] = &PlayerInfo{PlayerID: *t.Player3ID}
		}
	}

	return result, nil
}
