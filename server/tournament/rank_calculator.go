// Package tournament 提供动态淘汰赛竞技系统的核心实现
package tournament

import (
        "log"
        "sort"

        "gorm.io/gorm"
)

// =============================================
// RankCalculator - 排名计算器
// =============================================

// RankCalculator 排名计算器
type RankCalculator struct {
        db *gorm.DB
}

// NewRankCalculator 创建排名计算器
func NewRankCalculator(db *gorm.DB) *RankCalculator {
        return &RankCalculator{
                db: db,
        }
}

// CalculateRankings 计算本轮排名
// 参数:
// - sessionID: 会话ID
// - roundNum: 轮次号
// - eliminationTarget: 本轮保留人数
// 返回:
// - rankingInfo: 排行榜信息
// - error: 错误
func (rc *RankCalculator) CalculateRankings(sessionID uint64, roundNum int, eliminationTarget int) (*RankingInfo, error) {
        // 获取所有活跃玩家
        var participations []struct {
                PlayerID        uint64
                Nickname        string
                MatchCoin       int64
                RoundMatchCoin  int64
                IsRobot         uint8
                IsTournamentBot uint8
                IsEliminated    uint8
        }

        err := rc.db.Table("ddz_arena_participations AS p").
                Select("p.player_id, pl.nickname, p.match_coin, p.round_match_coin, p.is_robot, p.is_tournament_bot, p.is_eliminated").
                Joins("LEFT JOIN ddz_players pl ON p.player_id = pl.id").
                Where("p.session_id = ? AND p.is_eliminated = 0", sessionID).
                Order("p.round_match_coin DESC, p.player_id ASC").
                Find(&participations).Error

        if err != nil {
                return nil, err
        }

        // 构建排名列表
        rankings := make([]RankingItem, len(participations))
        for i, p := range participations {
                rankings[i] = RankingItem{
                        Rank:      i + 1,
                        PlayerID:  p.PlayerID,
                        Nickname:  p.Nickname,
                        MatchCoin: p.RoundMatchCoin,
                        IsRobot:   p.IsRobot == 1,
                        IsSafe:    i < eliminationTarget, // 在晋级线内的玩家
                }
        }

        // 获取当前阶段
        var stage TournamentStage
        rc.db.Table("ddz_arena_sessions").
                Select("tournament_stage").
                Where("id = ?", sessionID).
                Scan(&stage)

        // 计算倒计时
        var countdown int
        rc.db.Table("ddz_arena_sessions").
                Select("TIMESTAMPDIFF(SECOND, NOW(), rank_wait_until)").
                Where("id = ?", sessionID).
                Scan(&countdown)

        if countdown < 0 {
                countdown = 0
        }

        return &RankingInfo{
                SessionID:       sessionID,
                RoundNum:        roundNum,
                CurrentStage:    stage,
                Remaining:       len(participations),
                EliminationLine: eliminationTarget,
                Countdown:       countdown,
                Rankings:        rankings,
        }, nil
}

// GetPlayersToEliminate 获取需要淘汰的玩家列表
// 参数:
// - sessionID: 会话ID
// - eliminationTarget: 本轮保留人数
// 返回:
// - players: 需要淘汰的玩家列表
// - error: 错误
func (rc *RankCalculator) GetPlayersToEliminate(sessionID uint64, eliminationTarget int) ([]*EliminatedPlayer, error) {
        // 获取所有活跃玩家，按本轮比赛金币降序
        var participations []struct {
                PlayerID       uint64
                Nickname       string
                RoundMatchCoin int64
                IsRobot        uint8
                IsOnline       uint8
        }

        err := rc.db.Table("ddz_arena_participations AS p").
                Select("p.player_id, pl.nickname, p.round_match_coin, p.is_robot, p.is_online").
                Joins("LEFT JOIN ddz_players pl ON p.player_id = pl.id").
                Where("p.session_id = ? AND p.is_eliminated = 0", sessionID).
                Order("p.round_match_coin DESC, p.player_id ASC").
                Find(&participations).Error

        if err != nil {
                return nil, err
        }

        // 如果玩家数量小于等于保留人数，不需要淘汰
        if len(participations) <= eliminationTarget {
                return []*EliminatedPlayer{}, nil
        }

        // 需要淘汰的玩家（排名在保留线之后的）
        toEliminate := make([]*EliminatedPlayer, 0)
        for i := eliminationTarget; i < len(participations); i++ {
                p := participations[i]
                reason := "lose"
                if p.IsOnline == 0 {
                        reason = "offline" // 掉线玩家
                }

                toEliminate = append(toEliminate, &EliminatedPlayer{
                        PlayerID:        p.PlayerID,
                        Nickname:        p.Nickname,
                        Rank:            i + 1,
                        MatchCoin:       p.RoundMatchCoin,
                        EliminatedReason: reason,
                })
        }

        return toEliminate, nil
}

// GetOfflinePlayers 获取掉线玩家列表
func (rc *RankCalculator) GetOfflinePlayers(sessionID uint64) ([]*EliminatedPlayer, error) {
        var players []struct {
                PlayerID uint64
                Nickname string
                IsRobot  uint8
        }

        err := rc.db.Table("ddz_arena_participations AS p").
                Select("p.player_id, pl.nickname, p.is_robot").
                Joins("LEFT JOIN ddz_players pl ON p.player_id = pl.id").
                Where("p.session_id = ? AND p.is_eliminated = 0 AND p.is_online = 0", sessionID).
                Find(&players).Error

        if err != nil {
                return nil, err
        }

        result := make([]*EliminatedPlayer, len(players))
        for i, p := range players {
                result[i] = &EliminatedPlayer{
                        PlayerID:         p.PlayerID,
                        Nickname:         p.Nickname,
                        EliminatedReason: "offline",
                }
        }

        return result, nil
}

// ResetRoundMatchCoin 重置所有玩家的本轮比赛金币
func (rc *RankCalculator) ResetRoundMatchCoin(sessionID uint64) error {
        return rc.db.Exec(`
                UPDATE ddz_arena_participations 
                SET round_match_coin = 0, updated_at = NOW()
                WHERE session_id = ?
        `, sessionID).Error
}

// UpdateMatchCoin 更新玩家比赛金币
func (rc *RankCalculator) UpdateMatchCoin(sessionID, playerID uint64, coinChange int64) error {
        return rc.db.Exec(`
                UPDATE ddz_arena_participations 
                SET match_coin = match_coin + ?,
                        round_match_coin = round_match_coin + ?,
                        updated_at = NOW()
                WHERE session_id = ? AND player_id = ?
        `, coinChange, coinChange, sessionID, playerID).Error
}

// GetTopPlayers 获取前N名玩家
func (rc *RankCalculator) GetTopPlayers(sessionID uint64, n int) (PlayerList, error) {
        var participations []struct {
                PlayerID        uint64
                Nickname        string
                MatchCoin       int64
                RoundMatchCoin  int64
                IsRobot         uint8
                IsTournamentBot uint8
        }

        err := rc.db.Table("ddz_arena_participations AS p").
                Select("p.player_id, pl.nickname, p.match_coin, p.round_match_coin, p.is_robot, p.is_tournament_bot").
                Joins("LEFT JOIN ddz_players pl ON p.player_id = pl.id").
                Where("p.session_id = ? AND p.is_eliminated = 0", sessionID).
                Order("p.round_match_coin DESC, p.match_coin DESC, p.player_id ASC").
                Limit(n).
                Find(&participations).Error

        if err != nil {
                return nil, err
        }

        result := make(PlayerList, len(participations))
        for i, p := range participations {
                result[i] = &PlayerInfo{
                        PlayerID:        p.PlayerID,
                        Nickname:        p.Nickname,
                        MatchCoin:       p.MatchCoin,
                        RoundMatchCoin:  p.RoundMatchCoin,
                        IsRobot:         p.IsRobot == 1,
                        IsTournamentBot: p.IsTournamentBot == 1,
                        Rank:            i + 1,
                }
        }

        return result, nil
}

// GetRemainingPlayers 获取剩余活跃玩家数量
func (rc *RankCalculator) GetRemainingPlayers(sessionID uint64) (int, error) {
        var count int64
        err := rc.db.Table("ddz_arena_participations").
                Where("session_id = ? AND is_eliminated = 0", sessionID).
                Count(&count).Error
        return int(count), err
}

// SortPlayersByCoin 按金币排序玩家列表
// 🔧【修复】当金币相同时，按玩家ID正序排序（ID小的排在前面）
func (rc *RankCalculator) SortPlayersByCoin(players PlayerList) {
        sort.Slice(players, func(i, j int) bool {
                // 先按本轮比赛金币排序
                if players[i].RoundMatchCoin != players[j].RoundMatchCoin {
                        return players[i].RoundMatchCoin > players[j].RoundMatchCoin
                }
                // 本轮金币相同，按总比赛金币排序
                if players[i].MatchCoin != players[j].MatchCoin {
                        return players[i].MatchCoin > players[j].MatchCoin
                }
                // 总金币也相同，按玩家ID正序排序（ID小的排在前面）
                return players[i].PlayerID < players[j].PlayerID
        })
}

// RecordRoundResults 记录本轮结果
func (rc *RankCalculator) RecordRoundResults(sessionID uint64, roundNum int, results map[uint64]int64) error {
        return rc.db.Transaction(func(tx *gorm.DB) error {
                for playerID, coinChange := range results {
                        err := tx.Exec(`
                                UPDATE ddz_arena_participations 
                                SET match_coin = match_coin + ?,
                                        round_match_coin = round_match_coin + ?,
                                        updated_at = NOW()
                                WHERE session_id = ? AND player_id = ?
                        `, coinChange, coinChange, sessionID, playerID).Error
                        if err != nil {
                                return err
                        }
                }
                return nil
        })
}

// CalculateEliminationLine 计算晋级线
// 返回需要保留的人数
func (rc *RankCalculator) CalculateEliminationLine(totalPlayers int, rules EliminationRules, currentIdx int) int {
        if currentIdx >= len(rules) {
                return 3 // 默认决赛保留3人
        }
        return rules[currentIdx]
}

// GetRankingBroadcast 构建排行榜广播数据
func (rc *RankCalculator) GetRankingBroadcast(sessionID uint64, roundNum, eliminationTarget int) (*RankingBroadcastMessage, error) {
        rankingInfo, err := rc.CalculateRankings(sessionID, roundNum, eliminationTarget)
        if err != nil {
                return nil, err
        }

        return &RankingBroadcastMessage{
                CurrentRound:    rankingInfo.RoundNum,
                Remaining:       rankingInfo.Remaining,
                EliminationLine: rankingInfo.EliminationLine,
                Countdown:       rankingInfo.Countdown,
                Rankings:        rankingInfo.Rankings,
        }, nil
}

// LogRanking 记录排名日志
func (rc *RankCalculator) LogRanking(sessionID uint64, roundNum int, rankings []RankingItem) {
        log.Printf("[RankCalculator] 排名统计: sessionID=%d, round=%d, players=%d", sessionID, roundNum, len(rankings))
        for i, r := range rankings {
                if i < 10 { // 只打印前10名
                        log.Printf("  排名%d: playerID=%d, nickname=%s, coin=%d, safe=%v",
                                r.Rank, r.PlayerID, r.Nickname, r.MatchCoin, r.IsSafe)
                }
        }
}
