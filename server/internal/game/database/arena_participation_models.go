// Package database 提供竞技场参赛记录的数据库操作函数
package database

import (
        "fmt"
        "log"
        "time"

        "gorm.io/gorm"
)

// =============================================
// 参赛记录操作函数
// 职责：比赛过程数据 + 实时排名 + 淘汰状态
// =============================================

// CreateParticipationsFromSignups 从报名记录批量创建参赛记录
// 在比赛开始时调用，将所有报名玩家复制到 participations 表
// 🔧【重构】不再复制 signup_time 和 signup_fee，这些字段保留在 period_players 表
func CreateParticipationsFromSignups(sessionID uint64, periodNo string, initialGold int64) error {
        // 1. 获取所有报名玩家
        players, err := GetArenaPeriodPlayersByPeriodNo(periodNo)
        if err != nil {
                return fmt.Errorf("获取报名玩家失败: %w", err)
        }

        if len(players) == 0 {
                return fmt.Errorf("没有报名玩家")
        }

        // 2. 批量创建参赛记录
        db := DB()
        return db.Transaction(func(tx *gorm.DB) error {
                for _, player := range players {
                        participation := &ArenaParticipation{
                                SessionID:   sessionID,
                                PlayerID:    player.PlayerID,
                                PeriodNo:    periodNo,
                                MatchCoin:   initialGold, // 初始化比赛金币
                                IsOnline:    1,
                                CreatedAt:   time.Now(),
                                UpdatedAt:   time.Now(),
                        }

                        if err := tx.Create(participation).Error; err != nil {
                                // 忽略重复记录错误（可能已经存在）
                                if err != gorm.ErrDuplicatedKey {
                                        return fmt.Errorf("创建参赛记录失败: player_id=%d, err=%w", player.PlayerID, err)
                                }
                        }
                }
                return nil
        })
}

// AddRobotParticipation 添加机器人参赛记录
// 用于锦标赛补位
// 🔧【重构】不再写入 signup_time 和 signup_fee
func AddRobotParticipation(sessionID uint64, periodNo string, robotID uint64, initialGold int64, isTournamentBot bool) error {
        participation := &ArenaParticipation{
                SessionID:       sessionID,
                PlayerID:        robotID,
                PeriodNo:        periodNo,
                IsRobot:         1,
                IsTournamentBot: boolToUint8(isTournamentBot),
                MatchCoin:       initialGold,
                IsOnline:        1,
                CreatedAt:       time.Now(),
                UpdatedAt:       time.Now(),
        }

        return DB().Create(participation).Error
}

// GetParticipationsBySessionID 获取会话的所有参赛记录
func GetParticipationsBySessionID(sessionID uint64) ([]*ArenaParticipation, error) {
        var participations []*ArenaParticipation
        err := DB().Where("session_id = ?", sessionID).
                Order("match_coin DESC").
                Find(&participations).Error
        return participations, err
}

// GetActiveParticipations 获取未淘汰的参赛玩家
func GetActiveParticipations(sessionID uint64) ([]*ArenaParticipation, error) {
        var participations []*ArenaParticipation
        err := DB().Where("session_id = ? AND is_eliminated = 0", sessionID).
                Order("match_coin DESC").
                Find(&participations).Error
        return participations, err
}

// GetParticipationBySessionPlayer 获取指定玩家在会话中的参赛记录
func GetParticipationBySessionPlayer(sessionID, playerID uint64) (*ArenaParticipation, error) {
        var participation ArenaParticipation
        err := DB().Where("session_id = ? AND player_id = ?", sessionID, playerID).
                First(&participation).Error
        if err != nil {
                return nil, err
        }
        return &participation, nil
}

// UpdateParticipationMatchCoin 更新玩家比赛金币
func UpdateParticipationMatchCoin(sessionID, playerID uint64, changeCoin int64) (int64, error) {
        // 获取当前记录
        participation, err := GetParticipationBySessionPlayer(sessionID, playerID)
        if err != nil {
                return 0, fmt.Errorf("获取参赛记录失败: %w", err)
        }

        beforeCoin := participation.MatchCoin
        afterCoin := beforeCoin + changeCoin
        if afterCoin < 0 {
                afterCoin = 0
        }

        // 更新金币
        err = DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Updates(map[string]interface{}{
                        "match_coin":  afterCoin,
                        "updated_at":  time.Now(),
                }).Error

        if err != nil {
                return afterCoin, fmt.Errorf("更新比赛金币失败: %w", err)
        }

        log.Printf("[UpdateParticipationMatchCoin] session=%d, player=%d, change=%d, before=%d, after=%d",
                sessionID, playerID, changeCoin, beforeCoin, afterCoin)

        return afterCoin, nil
}

// ResetRoundMatchCoin 重置所有玩家的本轮比赛金币
func ResetRoundMatchCoin(sessionID uint64) error {
        return DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND is_eliminated = 0", sessionID).
                Update("round_match_coin", 0).Error
}

// UpdateParticipationElimination 更新玩家淘汰状态
func UpdateParticipationElimination(sessionID, playerID uint64, isEliminated bool, eliminatedRound int, reason string) error {
        updates := map[string]interface{}{
                "is_eliminated":   boolToUint8(isEliminated),
                "eliminated_round": eliminatedRound,
                "updated_at":       time.Now(),
        }

        if reason != "" {
                updates["eliminated_reason"] = reason
        }

        return DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Updates(updates).Error
}

// UpdateParticipationRank 更新玩家排名
func UpdateParticipationRank(sessionID, playerID uint64, rank int, isChampion bool) error {
        return DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Updates(map[string]interface{}{
                        "rank":        rank,
                        "is_champion": boolToUint8(isChampion),
                        "updated_at":  time.Now(),
                }).Error
}

// UpdateParticipationOnlineStatus 更新玩家在线状态
func UpdateParticipationOnlineStatus(sessionID, playerID uint64, isOnline bool) error {
        return DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Update("is_online", boolToUint8(isOnline)).Error
}

// UpdateParticipationTable 更新玩家当前桌
func UpdateParticipationTable(sessionID, playerID uint64, tableID uint64) error {
        return DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Updates(map[string]interface{}{
                        "current_table_id": tableID,
                        "updated_at":       time.Now(),
                }).Error
}

// SyncFinalRankingsToPeriodPlayers 同步最终排名到 period_players 表
// 在比赛结束时调用
func SyncFinalRankingsToPeriodPlayers(sessionID uint64) error {
        // 1. 获取会话信息
        var session ArenaSession
        if err := DB().First(&session, sessionID).Error; err != nil {
                return fmt.Errorf("获取会话失败: %w", err)
        }

        // 2. 获取所有参赛记录
        participations, err := GetParticipationsBySessionID(sessionID)
        if err != nil {
                return fmt.Errorf("获取参赛记录失败: %w", err)
        }

        // 3. 同步到 period_players 表
        t, err := parsePeriodNoToTime(session.PeriodNo)
        if err != nil {
                t = time.Now()
        }
        tableName := getArenaPeriodPlayerTableNameByTime(t)

        return DB().Transaction(func(tx *gorm.DB) error {
                for _, p := range participations {
                        updates := map[string]interface{}{
                                "player_status": ArenaPlayerStatusFinished,
                                "updated_at":    time.Now(),
                        }

                        if p.Rank != nil {
                                updates["final_rank"] = *p.Rank
                        }

                        if err := tx.Table(tableName).
                                Where("period_no = ? AND player_id = ?", session.PeriodNo, p.PlayerID).
                                Updates(updates).Error; err != nil {
                                log.Printf("[SyncFinalRankings] 更新失败: player_id=%d, err=%v", p.PlayerID, err)
                        }
                }
                return nil
        })
}

// GetParticipationMatchCoin 获取玩家比赛金币
func GetParticipationMatchCoin(sessionID, playerID uint64) (int64, error) {
        participation, err := GetParticipationBySessionPlayer(sessionID, playerID)
        if err != nil {
                return 0, err
        }
        return participation.MatchCoin, nil
}

// GetRankingsBySessionID 获取会话排名（按金币降序）
func GetRankingsBySessionID(sessionID uint64, limit int) ([]*ArenaParticipation, error) {
        var participations []*ArenaParticipation
        query := DB().Where("session_id = ?", sessionID).
                Order("match_coin DESC")

        if limit > 0 {
                query = query.Limit(limit)
        }

        err := query.Find(&participations).Error
        return participations, err
}

// CountActiveParticipations 统计未淘汰的参赛人数
func CountActiveParticipations(sessionID uint64) (int64, error) {
        var count int64
        err := DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND is_eliminated = 0", sessionID).
                Count(&count).Error
        return count, err
}

// CountTotalParticipations 统计总参赛人数
func CountTotalParticipations(sessionID uint64) (int64, error) {
        var count int64
        err := DB().Model(&ArenaParticipation{}).
                Where("session_id = ?", sessionID).
                Count(&count).Error
        return count, err
}

// IsPlayerInSession 检查玩家是否在指定会话中
func IsPlayerInSession(sessionID, playerID uint64) (bool, error) {
        var count int64
        err := DB().Model(&ArenaParticipation{}).
                Where("session_id = ? AND player_id = ?", sessionID, playerID).
                Count(&count).Error
        return count > 0, err
}

// DeleteParticipationsBySessionID 删除会话的所有参赛记录（用于测试/清理）
func DeleteParticipationsBySessionID(sessionID uint64) error {
        return DB().Where("session_id = ?", sessionID).Delete(&ArenaParticipation{}).Error
}

// =============================================
// 辅助函数
// =============================================

func boolToUint8(b bool) uint8 {
        if b {
                return 1
        }
        return 0
}

// uint8ToBool 辅助函数
func uint8ToBool(v uint8) bool {
        return v == 1
}
