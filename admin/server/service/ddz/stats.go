package ddz

import (
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZStatsService struct{}

var DDZStatsServiceApp = new(DDZStatsService)

// GetOverviewStats 获取概览统计
func (s *DDZStatsService) GetOverviewStats() (ddzRes.DDZOverviewStatsResponse, error) {
        db := GetDDZDB()
        var totalPlayers, activePlayers, totalGames int64
        var todayGames, todayNewPlayers, todayActivePlayers int64
        var totalGold int64
        var avgGameDuration float64

        now := time.Now()
        today := now.Format("2006-01-02")
        tomorrow := now.AddDate(0, 0, 1).Format("2006-01-02")

        // 总玩家数
        db.Model(&ddz.DDZPlayer{}).Count(&totalPlayers)

        // 活跃玩家数(最近7天登录过的玩家)
        sevenDaysAgo := now.AddDate(0, 0, -7)
        db.Model(&ddz.DDZPlayer{}).
                Where("last_login_at >= ?", sevenDaysAgo).
                Count(&activePlayers)

        // 今日活跃玩家（今日登录过的玩家）
        db.Model(&ddz.DDZPlayer{}).
                Where("last_login_at >= ? AND last_login_at < ?", today, tomorrow).
                Count(&todayActivePlayers)

        // 总游戏场次
        db.Model(&ddz.DDZGameRecord{}).Count(&totalGames)

        // 今日游戏场次
        db.Model(&ddz.DDZGameRecord{}).
                Where("started_at >= ? AND started_at < ?", today, tomorrow).Count(&todayGames)

        // 今日新增玩家
        db.Model(&ddz.DDZPlayer{}).
                Where("created_at >= ? AND created_at < ?", today, tomorrow).Count(&todayNewPlayers)

        // 总金币
        db.Model(&ddz.DDZPlayer{}).Select("COALESCE(SUM(gold), 0)").Scan(&totalGold)

        // 平均游戏时长（从游戏记录计算）
        db.Model(&ddz.DDZGameRecord{}).
                Where("duration_seconds > 0").
                Select("COALESCE(AVG(duration_seconds), 0)").
                Scan(&avgGameDuration)

        return ddzRes.DDZOverviewStatsResponse{
                TotalPlayers:     totalPlayers,
                ActivePlayers:    activePlayers,
                OnlinePlayers:    0, // 需要从游戏服务器获取
                TotalGames:       totalGames,
                TodayGames:       todayGames,
                TodayNewPlayers:  todayNewPlayers,
                TodayActivePlayers: todayActivePlayers,
                AvgOnlineTime:    0,
                AvgGameDuration:  avgGameDuration,
                TotalCoins:       totalGold,
        }, nil
}

// DailyStatsRow 每日统计行（从原始数据计算）
type DailyStatsRow struct {
        Date            string
        TotalPlayers    int64
        NewPlayers      int64
        ActivePlayers   int64
        TotalGames      int64
        AvgGameDuration float64
        MaxOnline       int64
        TotalOnlineTime int64
        PeakTime        string
}

// GetDailyStats 获取每日统计（优先从每日统计表读取，表为空则实时计算）
func (s *DDZStatsService) GetDailyStats(req ddzReq.DDZDailyStatsSearch) ([]ddzRes.DDZDailyStatsResponse, error) {
        // 解析日期范围
        startDate, err := time.Parse("2006-01-02", req.StartDate)
        if err != nil {
                startDate = time.Now().AddDate(0, 0, -7)
        }
        endDate, err := time.Parse("2006-01-02", req.EndDate)
        if err != nil {
                endDate = time.Now()
        }

        db := GetDDZDB()

        // 🔧【优化】优先从每日统计表读取
        var existingStats []ddz.DDZDailyStats
        db.Where("stat_date >= ? AND stat_date <= ?", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
                Order("stat_date asc").
                Find(&existingStats)

        // 如果统计表有数据，直接返回
        if len(existingStats) > 0 {
                result := make([]ddzRes.DDZDailyStatsResponse, 0, len(existingStats))
                for _, s := range existingStats {
                        peakTime := ""
                        if s.PeakTime != "" {
                                peakTime = s.PeakTime
                        }
                        result = append(result, ddzRes.DDZDailyStatsResponse{
                                Date:            s.Date,
                                TotalPlayers:    s.TotalPlayers,
                                NewPlayers:      s.NewPlayers,
                                ActivePlayers:   s.ActivePlayers,
                                TotalGames:      s.TotalGames,
                                AvgGameDuration: s.AvgGameDuration,
                                MaxOnline:       s.MaxOnline,
                                TotalOnlineTime: s.TotalOnlineTime,
                                PeakTime:        peakTime,
                        })
                }
                return result, nil
        }

        // 统计表为空，实时计算
        var result []ddzRes.DDZDailyStatsResponse

        // 遍历每一天
        for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
                dateStr := d.Format("2006-01-02")

                // 1. 截止当日的总玩家数
                var totalPlayers int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("DATE(created_at) <= ?", dateStr).
                        Count(&totalPlayers)

                // 2. 当日新增玩家
                var newPlayers int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("DATE(created_at) = ?", dateStr).
                        Count(&newPlayers)

                // 3. 当日活跃玩家（当天登录过的）
                var activePlayers int64
                nextDay := d.AddDate(0, 0, 1).Format("2006-01-02")
                db.Model(&ddz.DDZPlayer{}).
                        Where("last_login_at >= ? AND last_login_at < ?", dateStr, nextDay).
                        Count(&activePlayers)

                // 4. 当日游戏场次
                var totalGames int64
                db.Model(&ddz.DDZGameRecord{}).
                        Where("DATE(started_at) = ?", dateStr).
                        Count(&totalGames)

                // 5. 平均游戏时长（从游戏记录计算）
                var avgDuration float64
                db.Model(&ddz.DDZGameRecord{}).
                        Where("DATE(started_at) = ? AND duration_seconds > 0", dateStr).
                        Select("COALESCE(AVG(duration_seconds), 0)").
                        Scan(&avgDuration)

                result = append(result, ddzRes.DDZDailyStatsResponse{
                        Date:            dateStr,
                        TotalPlayers:    totalPlayers,
                        NewPlayers:      newPlayers,
                        ActivePlayers:   activePlayers,
                        TotalGames:      totalGames,
                        AvgGameDuration: avgDuration,
                        MaxOnline:       0, // 需要从在线记录计算
                        TotalOnlineTime: 0,
                        PeakTime:        "",
                })
        }

        return result, nil
}

// GetLeaderboard 获取排行榜
func (s *DDZStatsService) GetLeaderboard(req ddzReq.DDZLeaderboardSearch) (ddzRes.DDZLeaderboardListResponse, error) {
        db := GetDDZDB()
        if req.Limit <= 0 {
                req.Limit = 10
        }

        var players []ddz.DDZPlayer
        var result []ddzRes.DDZLeaderboardResponse

        switch req.RankType {
        case "coins":
                db.Order("gold desc").Limit(req.Limit).Find(&players)
                for i, p := range players {
                        result = append(result, ddzRes.DDZLeaderboardResponse{
                                Rank:     i + 1,
                                PlayerID: p.Username,
                                Nickname: p.Nickname,
                                Avatar:   p.Avatar,
                                Score:    p.Gold,
                                Level:    p.Level,
                                VipLevel: p.VIPLevel,
                        })
                }
        case "level":
                db.Order("level desc, experience desc").Limit(req.Limit).Find(&players)
                for i, p := range players {
                        result = append(result, ddzRes.DDZLeaderboardResponse{
                                Rank:     i + 1,
                                PlayerID: p.Username,
                                Nickname: p.Nickname,
                                Avatar:   p.Avatar,
                                Score:    int64(p.Level),
                                Level:    p.Level,
                                VipLevel: p.VIPLevel,
                        })
                }
        case "wins":
                db.Order("win_count desc").Limit(req.Limit).Find(&players)
                for i, p := range players {
                        result = append(result, ddzRes.DDZLeaderboardResponse{
                                Rank:     i + 1,
                                PlayerID: p.Username,
                                Nickname: p.Nickname,
                                Avatar:   p.Avatar,
                                Score:    int64(p.WinCount),
                                Level:    p.Level,
                                VipLevel: p.VIPLevel,
                        })
                }
        case "winrate":
                // 计算胜率：需要至少玩过10场游戏
                db.Where("(win_count + lose_count) >= ?", 10).Order("CASE WHEN (win_count + lose_count) > 0 THEN win_count * 1.0 / (win_count + lose_count) ELSE 0 END desc").Limit(req.Limit).Find(&players)
                for i, p := range players {
                        totalGames := p.WinCount + p.LoseCount
                        winRate := float64(0)
                        if totalGames > 0 {
                                winRate = float64(p.WinCount) / float64(totalGames) * 100
                        }
                        result = append(result, ddzRes.DDZLeaderboardResponse{
                                Rank:     i + 1,
                                PlayerID: p.Username,
                                Nickname: p.Nickname,
                                Avatar:   p.Avatar,
                                Score:    int64(winRate),
                                WinRate:  winRate,
                                Level:    p.Level,
                                VipLevel: p.VIPLevel,
                        })
                }
        }

        return ddzRes.DDZLeaderboardListResponse{
                List:     result,
                RankType: req.RankType,
        }, nil
}

// GetPlayerStats 获取玩家统计（直接从玩家表获取汇总数据）
func (s *DDZStatsService) GetPlayerStats(req ddzReq.DDZStatsSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 直接从玩家表获取统计数据
        query := db.Model(&ddz.DDZPlayer{})

        if req.PlayerID != "" {
                query = query.Where("username = ? OR nickname = ?", req.PlayerID, req.PlayerID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var players []ddz.DDZPlayer
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&players).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZPlayerStatsResponse, 0, len(players))
        for _, p := range players {
                // 计算胜率
                totalGames := p.WinCount + p.LoseCount
                winRate := float64(0)
                if totalGames > 0 {
                        winRate = float64(p.WinCount) / float64(totalGames) * 100
                }

                // 从玩家表直接获取统计数据
                result = append(result, ddzRes.DDZPlayerStatsResponse{
                        PlayerID:      p.Username,
                        PlayerName:    p.Nickname,
                        PlayerAvatar:  p.Avatar,
                        VIPLevel:      p.VIPLevel,
                        StatDate:      p.CreatedAt.Format("2006-01-02"),
                        TotalGames:    totalGames,
                        WinGames:      p.WinCount,
                        LoseGames:     p.LoseCount,
                        DrawGames:     0,
                        WinRate:       winRate,
                        CurrentGold:   p.Gold,
                        OnlineTime:    0,
                })
        }

        return result, total, nil
}

// GetDailyActiveChart 获取每日活跃图表数据（从玩家登录记录计算）
func (s *DDZStatsService) GetDailyActiveChart(startDate, endDate string) (ddzRes.DDZChartResponse, error) {
        // 解析日期范围
        start, err := time.Parse("2006-01-02", startDate)
        if err != nil {
                start = time.Now().AddDate(0, 0, -7)
        }
        end, err := time.Parse("2006-01-02", endDate)
        if err != nil {
                end = time.Now()
        }

        db := GetDDZDB()
        labels := make([]string, 0)
        data := make([]float64, 0)

        // 遍历每一天
        for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
                dateStr := d.Format("2006-01-02")
                nextDay := d.AddDate(0, 0, 1).Format("2006-01-02")

                // 统计当天登录过的玩家数
                var count int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("last_login_at >= ? AND last_login_at < ?", dateStr, nextDay).
                        Count(&count)

                labels = append(labels, dateStr)
                data = append(data, float64(count))
        }

        return ddzRes.DDZChartResponse{
                Labels: labels,
                Data:   data,
                Title:  "每日活跃玩家",
        }, nil
}

// GetDailyGamesChart 获取每日游戏场次图表数据（从游戏记录计算）
func (s *DDZStatsService) GetDailyGamesChart(startDate, endDate string) (ddzRes.DDZChartResponse, error) {
        // 解析日期范围
        start, err := time.Parse("2006-01-02", startDate)
        if err != nil {
                start = time.Now().AddDate(0, 0, -7)
        }
        end, err := time.Parse("2006-01-02", endDate)
        if err != nil {
                end = time.Now()
        }

        db := GetDDZDB()
        labels := make([]string, 0)
        data := make([]float64, 0)

        // 遍历每一天
        for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
                dateStr := d.Format("2006-01-02")

                // 统计当天的游戏场次
                var count int64
                db.Model(&ddz.DDZGameRecord{}).
                        Where("DATE(started_at) = ?", dateStr).
                        Count(&count)

                labels = append(labels, dateStr)
                data = append(data, float64(count))
        }

        return ddzRes.DDZChartResponse{
                Labels: labels,
                Data:   data,
                Title:  "每日游戏场次",
        }, nil
}

// GetDailyStatsList 获取每日统计列表（从原始数据实时计算）
func (s *DDZStatsService) GetDailyStatsList(req ddzReq.DDZDailyStatsSearch) (list []ddz.DDZDailyStats, total int64, err error) {
        // 解析日期范围
        startDate, err := time.Parse("2006-01-02", req.StartDate)
        if err != nil {
                startDate = time.Now().AddDate(0, 0, -7)
        }
        endDate, err := time.Parse("2006-01-02", req.EndDate)
        if err != nil {
                endDate = time.Now()
        }

        db := GetDDZDB()
        var allStats []ddz.DDZDailyStats

        // 遍历每一天，从原始数据计算统计
        for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
                dateStr := d.Format("2006-01-02")
                nextDay := d.AddDate(0, 0, 1).Format("2006-01-02")

                // 1. 截止当日的总玩家数
                var totalPlayers int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("DATE(created_at) <= ?", dateStr).
                        Count(&totalPlayers)

                // 2. 当日新增玩家
                var newPlayers int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("DATE(created_at) = ?", dateStr).
                        Count(&newPlayers)

                // 3. 当日活跃玩家
                var activePlayers int64
                db.Model(&ddz.DDZPlayer{}).
                        Where("last_login_at >= ? AND last_login_at < ?", dateStr, nextDay).
                        Count(&activePlayers)

                // 4. 当日游戏场次
                var totalGames int64
                db.Model(&ddz.DDZGameRecord{}).
                        Where("DATE(started_at) = ?", dateStr).
                        Count(&totalGames)

                // 5. 平均游戏时长
                var avgDuration float64
                db.Model(&ddz.DDZGameRecord{}).
                        Where("DATE(started_at) = ? AND duration_seconds > 0", dateStr).
                        Select("COALESCE(AVG(duration_seconds), 0)").
                        Scan(&avgDuration)

                allStats = append(allStats, ddz.DDZDailyStats{
                        Date:            dateStr,
                        TotalPlayers:    totalPlayers,
                        NewPlayers:      newPlayers,
                        ActivePlayers:   activePlayers,
                        TotalGames:      totalGames,
                        AvgGameDuration: avgDuration,
                })
        }

        // 计算总数和分页
        total = int64(len(allStats))

        // 分页
        offset := req.PageSize * (req.Page - 1)
        if offset >= len(allStats) {
                return []ddz.DDZDailyStats{}, total, nil
        }
        end := offset + req.PageSize
        if end > len(allStats) {
                end = len(allStats)
        }

        // 按日期倒序排列
        for i := 0; i < len(allStats); i++ {
                for j := i + 1; j < len(allStats); j++ {
                        if allStats[i].Date < allStats[j].Date {
                                allStats[i], allStats[j] = allStats[j], allStats[i]
                        }
                }
        }

        list = allStats[offset:end]
        return list, total, nil
}

// GetLeaderboardList 获取排行榜列表
func (s *DDZStatsService) GetLeaderboardList(req ddzReq.DDZLeaderboardSearch) (list []ddz.DDZLeaderboard, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Model(&ddz.DDZLeaderboard{})
        if req.PlayerName != "" {
                db = db.Where("player_name LIKE ?", "%"+req.PlayerName+"%")
        }

        // 默认按积分排序
        orderBy := "rank_score DESC"
        if req.OrderBy != "" {
                switch req.OrderBy {
                case "winCount":
                        orderBy = "win_count DESC"
                case "gold":
                        orderBy = "gold DESC"
                case "arenaCoin":
                        orderBy = "arena_coin DESC"
                case "rankScore":
                        orderBy = "rank_score DESC"
                }
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order(orderBy).Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}

// GetPlayerOnlineList 获取在线玩家列表
func (s *DDZStatsService) GetPlayerOnlineList(req ddzReq.DDZPlayerOnlineSearch) (list []ddz.DDZPlayerOnline, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Model(&ddz.DDZPlayerOnline{})
        if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                db = db.Where("player_id = ?", req.PlayerID.Value)
        }
        if req.LoginIP != "" {
                db = db.Where("login_ip LIKE ?", "%"+req.LoginIP+"%")
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}

// GetRoomPlayerList 获取房间玩家列表
func (s *DDZStatsService) GetRoomPlayerList(req ddzReq.DDZRoomPlayerSearch) (list []ddz.DDZRoomPlayer, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 解析时间范围，默认查询最近3个月
        now := time.Now()
        startDate := now.AddDate(0, -3, 0)
        endDate := now

        if req.StartDate != "" {
                if t, err := time.Parse("2006-01-02", req.StartDate); err == nil {
                        startDate = t
                }
        }
        if req.EndDate != "" {
                if t, err := time.Parse("2006-01-02", req.EndDate); err == nil {
                        endDate = t
                }
        }

        // 收集需要查询的所有分表
        db := GetDDZDB()
        var allResults []ddz.DDZRoomPlayer

        startMonth := time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, startDate.Location())
        endMonth := time.Date(endDate.Year(), endDate.Month(), 1, 0, 0, 0, 0, endDate.Location())

        for m := startMonth; !m.After(endMonth); m = m.AddDate(0, 1, 0) {
                suffix := m.Format("200601")
                tableName := "ddz_room_players_" + suffix

                // 检查表是否存在
                var count int64
                db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)
                if count == 0 {
                        continue
                }

                // 构建查询条件
                query := db.Table(tableName)
                if req.RoomID.Valid && req.RoomID.Value > 0 {
                        query = query.Where("room_id = ?", req.RoomID.Value)
                }
                if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                        query = query.Where("player_id = ?", req.PlayerID.Value)
                }
                if req.RoomCode != "" {
                        query = query.Where("room_code = ?", req.RoomCode)
                }

                var results []ddz.DDZRoomPlayer
                if err := query.Find(&results).Error; err != nil {
                        continue
                }
                allResults = append(allResults, results...)
        }

        // 计算总数
        total = int64(len(allResults))

        // 按 ID 倒序排序（使用 joined_at 时间）
        // 由于是跨表查询，需要手动排序和分页
        // 简化版本：按 joined_at 降序排序
        for i := 0; i < len(allResults); i++ {
                for j := i + 1; j < len(allResults); j++ {
                        if allResults[i].JoinedAt.Before(allResults[j].JoinedAt) {
                                allResults[i], allResults[j] = allResults[j], allResults[i]
                        }
                }
        }

        // 分页
        if offset >= len(allResults) {
                return []ddz.DDZRoomPlayer{}, total, nil
        }
        end := offset + limit
        if end > len(allResults) {
                end = len(allResults)
        }

        list = allResults[offset:end]
        return list, total, nil
}
