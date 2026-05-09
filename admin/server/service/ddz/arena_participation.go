package ddz

import (
        "fmt"
        "time"

        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "gorm.io/gorm"
)

type DDZArenaParticipationService struct{}

// getArenaParticipationTableName 获取参赛记录分表名（根据时间）
func getArenaParticipationTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_arena_participations_%s", suffix)
}

// getTournamentRoundTableName 获取锦标赛轮次分表名（根据时间）
func getTournamentRoundTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_tournament_rounds_%s", suffix)
}

// getTournamentEliminationTableName 获取锦标赛淘汰记录分表名（根据时间）
func getTournamentEliminationTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_tournament_eliminations_%s", suffix)
}

// GetArenaParticipationList 获取参赛记录列表（支持分表查询）
func (s *DDZArenaParticipationService) GetArenaParticipationList(req ddzReq.ArenaParticipationSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 解析日期范围
        var startTime, endTime time.Time
        if req.StartDate != "" {
                startTime, _ = time.Parse("2006-01-02", req.StartDate)
        }
        if req.EndDate != "" {
                endTime, _ = time.Parse("2006-01-02", req.EndDate)
        }

        // 如果没有指定日期范围，默认查询当前月
        if startTime.IsZero() {
                startTime = time.Now()
        }
        if endTime.IsZero() {
                endTime = time.Now()
        }
        endTime = time.Date(endTime.Year(), endTime.Month(), endTime.Day(), 23, 59, 59, 0, endTime.Location())

        // 收集需要查询的分表
        var tables []string
        startMonth := time.Date(startTime.Year(), startTime.Month(), 1, 0, 0, 0, 0, startTime.Location())
        endMonth := time.Date(endTime.Year(), endTime.Month(), 1, 0, 0, 0, 0, endTime.Location())

        for m := startMonth; !m.After(endMonth); m = m.AddDate(0, 1, 0) {
                tableName := getArenaParticipationTableName(m)
                if ensureTableExists(db, tableName) {
                        tables = append(tables, tableName)
                }
        }

        if len(tables) == 0 {
                return []ddzRes.ArenaParticipationResponse{}, 0, nil
        }

        // 构建 UNION ALL 查询
        var unionQuery string
        var args []interface{}
        for i, table := range tables {
                if i > 0 {
                        unionQuery += " UNION ALL "
                }
                subQuery := fmt.Sprintf(`
                        SELECT p.id, p.session_id, p.player_id, p.period_no, p.match_coin,
                                p.round_match_coin, p.is_eliminated, p.eliminated_round, p.rank,
                                p.is_champion, p.is_online, p.created_at, p.updated_at,
                                COALESCE(pl.nickname, '') as player_name
                        FROM %s p
                        LEFT JOIN ddz_players pl ON p.player_id = pl.id
                `, table)
                unionQuery += subQuery
        }

        // 构建条件
        whereClause := " WHERE 1=1"
        if req.SessionID > 0 {
                whereClause += " AND session_id = ?"
                args = append(args, req.SessionID)
        }
        if req.PeriodNo != "" {
                whereClause += " AND period_no LIKE ?"
                args = append(args, "%"+req.PeriodNo+"%")
        }
        if req.PlayerID > 0 {
                whereClause += " AND player_id = ?"
                args = append(args, req.PlayerID)
        }
        if req.IsEliminated != nil {
                whereClause += " AND is_eliminated = ?"
                args = append(args, *req.IsEliminated)
        }

        // 统计总数
        countQuery := "SELECT COUNT(*) FROM (" + unionQuery + ") AS combined" + whereClause
        if err = db.Raw(countQuery, args...).Scan(&total).Error; err != nil {
                return nil, 0, err
        }

        // 查询列表
        listQuery := "SELECT * FROM (" + unionQuery + ") AS combined" + whereClause + " ORDER BY id DESC LIMIT ? OFFSET ?"
        listArgs := append(args, limit, offset)

        var participations []struct {
                ID              uint64    `gorm:"column:id"`
                SessionID       uint64    `gorm:"column:session_id"`
                PlayerID        uint64    `gorm:"column:player_id"`
                PlayerName      string    `gorm:"column:player_name"`
                PeriodNo        string    `gorm:"column:period_no"`
                MatchCoin       int64     `gorm:"column:match_coin"`
                RoundMatchCoin  int64     `gorm:"column:round_match_coin"`
                IsEliminated    uint8     `gorm:"column:is_eliminated"`
                EliminatedRound *int      `gorm:"column:eliminated_round"`
                Rank            *int      `gorm:"column:rank"`
                IsChampion      uint8     `gorm:"column:is_champion"`
                IsOnline        uint8     `gorm:"column:is_online"`
                CreatedAt       time.Time `gorm:"column:created_at"`
                UpdatedAt       time.Time `gorm:"column:updated_at"`
        }

        if err = db.Raw(listQuery, listArgs...).Scan(&participations).Error; err != nil {
                return nil, 0, err
        }

        // 转换为响应格式
        result := make([]ddzRes.ArenaParticipationResponse, 0, len(participations))
        for _, p := range participations {
                eliminatedRound := 0
                if p.EliminatedRound != nil {
                        eliminatedRound = *p.EliminatedRound
                }
                rank := 0
                if p.Rank != nil {
                        rank = *p.Rank
                }

                result = append(result, ddzRes.ArenaParticipationResponse{
                        ID:             p.ID,
                        SessionID:      p.SessionID,
                        PlayerID:       p.PlayerID,
                        PlayerName:     p.PlayerName,
                        PeriodNo:       p.PeriodNo,
                        MatchCoin:      p.MatchCoin,
                        RoundMatchCoin: p.RoundMatchCoin,
                        IsEliminated:   p.IsEliminated == 1,
                        EliminatedRound: eliminatedRound,
                        Rank:           rank,
                        IsChampion:     p.IsChampion == 1,
                        IsOnline:       p.IsOnline == 1,
                        CreatedAt:      p.CreatedAt.Format("2006-01-02 15:04:05"),
                        UpdatedAt:      p.UpdatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// GetTournamentRoundList 获取锦标赛轮次列表（支持分表查询）
func (s *DDZArenaParticipationService) GetTournamentRoundList(req ddzReq.TournamentRoundSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 尝试最近3个月的分表
        now := time.Now()
        var tableName string
        for i := 0; i < 3; i++ {
                t := now.AddDate(0, -i, 0)
                tName := getTournamentRoundTableName(t)
                if ensureTableExists(db, tName) {
                        // 检查是否有该session_id的数据
                        var count int64
                        db.Table(tName).Where("session_id = ?", req.SessionID).Count(&count)
                        if count > 0 {
                                tableName = tName
                                break
                        }
                }
        }

        if tableName == "" {
                return []ddzRes.TournamentRoundResponse{}, 0, nil
        }

        query := db.Table(tableName).
                Where("session_id = ?", req.SessionID)

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var rounds []struct {
                ID               uint64     `gorm:"column:id"`
                SessionID        uint64     `gorm:"column:session_id"`
                RoundNum         int        `gorm:"column:round_num"`
                EliminationTarget int       `gorm:"column:elimination_target"`
                TotalPlayers     int        `gorm:"column:total_players"`
                TablesCount      int        `gorm:"column:tables_count"`
                Stage            string     `gorm:"column:stage"`
                StartedAt        *time.Time `gorm:"column:started_at"`
                EndedAt          *time.Time `gorm:"column:ended_at"`
                CreatedAt        time.Time  `gorm:"column:created_at"`
        }

        err = query.Limit(limit).Offset(offset).Order("round_num ASC").Find(&rounds).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.TournamentRoundResponse, 0, len(rounds))
        for _, r := range rounds {
                startedAt := ""
                if r.StartedAt != nil {
                        startedAt = r.StartedAt.Format("2006-01-02 15:04:05")
                }
                endedAt := ""
                if r.EndedAt != nil {
                        endedAt = r.EndedAt.Format("2006-01-02 15:04:05")
                }

                result = append(result, ddzRes.TournamentRoundResponse{
                        ID:                r.ID,
                        SessionID:         r.SessionID,
                        RoundNum:          r.RoundNum,
                        EliminationTarget: r.EliminationTarget,
                        TotalPlayers:      r.TotalPlayers,
                        TablesCount:       r.TablesCount,
                        Stage:             r.Stage,
                        StageText:         getStageText(r.Stage),
                        StartedAt:         startedAt,
                        EndedAt:           endedAt,
                        CreatedAt:         r.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// GetTournamentEliminationList 获取锦标赛淘汰记录列表（支持分表查询）
func (s *DDZArenaParticipationService) GetTournamentEliminationList(req ddzReq.TournamentEliminationSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 尝试最近3个月的分表
        now := time.Now()
        var tableName string
        for i := 0; i < 3; i++ {
                t := now.AddDate(0, -i, 0)
                tName := getTournamentEliminationTableName(t)
                if ensureTableExists(db, tName) {
                        // 检查是否有该session_id的数据
                        var count int64
                        db.Table(tName).Where("session_id = ?", req.SessionID).Count(&count)
                        if count > 0 {
                                tableName = tName
                                break
                        }
                }
        }

        if tableName == "" {
                return []ddzRes.TournamentEliminationResponse{}, 0, nil
        }

        query := db.Table(tableName+" e").
                Select(`e.id, e.session_id, e.round_num, e.player_id, e.rank_before,
                        e.match_coin, e.eliminated_reason, e.created_at,
                        COALESCE(p.nickname, '') as player_name`).
                Joins("LEFT JOIN ddz_players p ON e.player_id = p.id").
                Where("e.session_id = ?", req.SessionID)

        if req.RoundNum > 0 {
                query = query.Where("e.round_num = ?", req.RoundNum)
        }
        if req.PlayerID > 0 {
                query = query.Where("e.player_id = ?", req.PlayerID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var eliminations []struct {
                ID               uint64    `gorm:"column:id"`
                SessionID        uint64    `gorm:"column:session_id"`
                RoundNum         int       `gorm:"column:round_num"`
                PlayerID         uint64    `gorm:"column:player_id"`
                PlayerName       string    `gorm:"column:player_name"`
                RankBefore       int       `gorm:"column:rank_before"`
                MatchCoin        int64     `gorm:"column:match_coin"`
                EliminatedReason string    `gorm:"column:eliminated_reason"`
                CreatedAt        time.Time `gorm:"column:created_at"`
        }

        err = query.Limit(limit).Offset(offset).Order("e.id DESC").Find(&eliminations).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.TournamentEliminationResponse, 0, len(eliminations))
        for _, e := range eliminations {
                result = append(result, ddzRes.TournamentEliminationResponse{
                        ID:               e.ID,
                        SessionID:        e.SessionID,
                        RoundNum:         e.RoundNum,
                        PlayerID:         e.PlayerID,
                        PlayerName:       e.PlayerName,
                        RankBefore:       e.RankBefore,
                        MatchCoin:        e.MatchCoin,
                        EliminatedReason: e.EliminatedReason,
                        CreatedAt:        e.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// 辅助函数
func getStageText(stage string) string {
        switch stage {
        case "PREPARE":
                return "准备中"
        case "PLAYING":
                return "进行中"
        case "RANKING":
                return "排名中"
        case "COMPLETED":
                return "已完成"
        default:
                return stage
        }
}
