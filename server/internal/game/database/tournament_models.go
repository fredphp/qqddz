// Package database 提供锦标赛相关的数据库操作函数
package database

import (
        "fmt"
        "log"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 锦标赛轮次表操作函数
// 🔧【新增】使用按月分表
// =============================================

// getTournamentRoundTableNameByTime 根据时间获取锦标赛轮次分表名
func getTournamentRoundTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetTournamentRoundTableName(t)
}

// ensureTournamentRoundTableExists 确保锦标赛轮次分表存在
func ensureTournamentRoundTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeTournamentRound, suffix)
}

// CreateTournamentRound 创建锦标赛轮次记录
func CreateTournamentRound(sessionID uint64, roundNum, eliminationTarget, totalPlayers, tablesCount int) error {
        now := time.Now()
        tableName := getTournamentRoundTableNameByTime(now)

        if err := ensureTournamentRoundTableExists(now); err != nil {
                return fmt.Errorf("确保锦标赛轮次分表存在失败: %w", err)
        }

        round := map[string]interface{}{
                "session_id":        sessionID,
                "round_num":         roundNum,
                "elimination_target": eliminationTarget,
                "total_players":     totalPlayers,
                "tables_count":      tablesCount,
                "stage":             "PREPARE",
                "started_at":        now,
                "created_at":        now,
                "updated_at":        now,
        }

        return DB().Table(tableName).Create(round).Error
}

// UpdateTournamentRoundStage 更新锦标赛轮次阶段
func UpdateTournamentRoundStage(sessionID uint64, roundNum int, stage string) error {
        tableName := getTournamentRoundTableNameByTime(time.Now())

        return DB().Table(tableName).
                Where("session_id = ? AND round_num = ?", sessionID, roundNum).
                Updates(map[string]interface{}{
                        "stage":      stage,
                        "updated_at": time.Now(),
                }).Error
}

// CompleteTournamentRound 完成锦标赛轮次
func CompleteTournamentRound(sessionID uint64, roundNum int) error {
        now := time.Now()
        tableName := getTournamentRoundTableNameByTime(now)

        return DB().Table(tableName).
                Where("session_id = ? AND round_num = ?", sessionID, roundNum).
                Updates(map[string]interface{}{
                        "stage":      "COMPLETED",
                        "ended_at":   now,
                        "updated_at": now,
                }).Error
}

// GetTournamentRoundsBySessionID 获取会话的所有轮次记录
func GetTournamentRoundsBySessionID(sessionID uint64) ([]map[string]interface{}, error) {
        // 尝试最近3个月的分表
        now := time.Now()
        var rounds []map[string]interface{}

        for i := 0; i < 3; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getTournamentRoundTableNameByTime(t)

                var count int64
                DB().Table(tableName).Where("session_id = ?", sessionID).Count(&count)
                if count > 0 {
                        err := DB().Table(tableName).
                                Where("session_id = ?", sessionID).
                                Order("round_num ASC").
                                Find(&rounds).Error
                        return rounds, err
                }
        }

        return rounds, nil
}

// =============================================
// 锦标赛淘汰记录表操作函数
// 🔧【新增】使用按月分表
// =============================================

// getTournamentEliminationTableNameByTime 根据时间获取锦标赛淘汰记录分表名
func getTournamentEliminationTableNameByTime(t time.Time) string {
        return GetPartitionManager().GetTournamentEliminationTableName(t)
}

// ensureTournamentEliminationTableExists 确保锦标赛淘汰记录分表存在
func ensureTournamentEliminationTableExists(t time.Time) error {
        suffix := t.Format("200601")
        return EnsurePartitionTableExists(PartitionTypeTournamentElimination, suffix)
}

// TournamentEliminationRecord 淘汰记录
type TournamentEliminationRecord struct {
        ID              uint64 `gorm:"column:id" json:"id"`
        SessionID       uint64 `gorm:"column:session_id" json:"session_id"`
        RoundNum        int    `gorm:"column:round_num" json:"round_num"`
        PlayerID        uint64 `gorm:"column:player_id" json:"player_id"`
        RankBefore      int    `gorm:"column:rank_before" json:"rank_before"`
        MatchCoin       int64  `gorm:"column:match_coin" json:"match_coin"`
        EliminatedReason string `gorm:"column:eliminated_reason" json:"eliminated_reason"`
        CreatedAt       time.Time `gorm:"column:created_at" json:"created_at"`
}

// CreateTournamentElimination 创建淘汰记录
func CreateTournamentElimination(sessionID uint64, roundNum int, playerID uint64, rankBefore int, matchCoin int64, reason string) error {
        now := time.Now()
        tableName := getTournamentEliminationTableNameByTime(now)

        if err := ensureTournamentEliminationTableExists(now); err != nil {
                return fmt.Errorf("确保锦标赛淘汰记录分表存在失败: %w", err)
        }

        record := map[string]interface{}{
                "session_id":        sessionID,
                "round_num":         roundNum,
                "player_id":         playerID,
                "rank_before":       rankBefore,
                "match_coin":        matchCoin,
                "eliminated_reason": reason,
                "created_at":        now,
        }

        return DB().Table(tableName).Create(record).Error
}

// BatchCreateTournamentEliminations 批量创建淘汰记录
func BatchCreateTournamentEliminations(sessionID uint64, roundNum int, players []*TournamentEliminationRecord) error {
        if len(players) == 0 {
                return nil
        }

        now := time.Now()
        tableName := getTournamentEliminationTableNameByTime(now)

        if err := ensureTournamentEliminationTableExists(now); err != nil {
                return fmt.Errorf("确保锦标赛淘汰记录分表存在失败: %w", err)
        }

        return DB().Transaction(func(tx *gorm.DB) error {
                for _, p := range players {
                        record := map[string]interface{}{
                                "session_id":        sessionID,
                                "round_num":         roundNum,
                                "player_id":         p.PlayerID,
                                "rank_before":       p.RankBefore,
                                "match_coin":        p.MatchCoin,
                                "eliminated_reason": p.EliminatedReason,
                                "created_at":        now,
                        }

                        if err := tx.Table(tableName).Create(record).Error; err != nil {
                                log.Printf("[BatchCreateEliminations] 创建淘汰记录失败: player_id=%d, err=%v", p.PlayerID, err)
                        }
                }
                return nil
        })
}

// GetTournamentEliminationsBySessionID 获取会话的所有淘汰记录
func GetTournamentEliminationsBySessionID(sessionID uint64) ([]TournamentEliminationRecord, error) {
        // 尝试最近3个月的分表
        now := time.Now()
        var records []TournamentEliminationRecord

        for i := 0; i < 3; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getTournamentEliminationTableNameByTime(t)

                var count int64
                DB().Table(tableName).Where("session_id = ?", sessionID).Count(&count)
                if count > 0 {
                        err := DB().Table(tableName).
                                Where("session_id = ?", sessionID).
                                Order("created_at DESC").
                                Find(&records).Error
                        return records, err
                }
        }

        return records, nil
}

// GetTournamentEliminationsByRound 获取指定轮次的淘汰记录
func GetTournamentEliminationsByRound(sessionID uint64, roundNum int) ([]TournamentEliminationRecord, error) {
        // 尝试最近3个月的分表
        now := time.Now()
        var records []TournamentEliminationRecord

        for i := 0; i < 3; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getTournamentEliminationTableNameByTime(t)

                var count int64
                DB().Table(tableName).Where("session_id = ? AND round_num = ?", sessionID, roundNum).Count(&count)
                if count > 0 {
                        err := DB().Table(tableName).
                                Where("session_id = ? AND round_num = ?", sessionID, roundNum).
                                Order("created_at DESC").
                                Find(&records).Error
                        return records, err
                }
        }

        return records, nil
}

// CountTournamentEliminations 统计会话的淘汰人数
func CountTournamentEliminations(sessionID uint64) (int64, error) {
        now := time.Now()
        tableName := getTournamentEliminationTableNameByTime(now)

        var count int64
        err := DB().Table(tableName).
                Where("session_id = ?", sessionID).
                Count(&count).Error
        return count, err
}
