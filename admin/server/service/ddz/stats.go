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
        var todayGames, todayNewPlayers int64
        var totalGold int64

        today := time.Now().Format("2006-01-02")

        // 总玩家数
        db.Model(&ddz.DDZPlayer{}).Count(&totalPlayers)

        // 活跃玩家数(最近7天)
        sevenDaysAgo := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
        db.Model(&ddz.DDZPlayerStats{}).
                Where("date >= ?", sevenDaysAgo).
                Distinct("player_id").Count(&activePlayers)

        // 总游戏场次
        db.Model(&ddz.DDZGameRecord{}).Count(&totalGames)

        // 今日游戏场次
        db.Model(&ddz.DDZGameRecord{}).
                Where("DATE(started_at) = ?", today).Count(&todayGames)

        // 今日新增玩家
        db.Model(&ddz.DDZPlayer{}).
                Where("DATE(created_at) = ?", today).Count(&todayNewPlayers)

        // 总金币
        db.Model(&ddz.DDZPlayer{}).Select("COALESCE(SUM(gold), 0)").Scan(&totalGold)

        return ddzRes.DDZOverviewStatsResponse{
                TotalPlayers:    totalPlayers,
                ActivePlayers:   activePlayers,
                OnlinePlayers:   0, // 需要从游戏服务器获取
                TotalGames:      totalGames,
                TodayGames:      todayGames,
                TodayNewPlayers: todayNewPlayers,
                AvgOnlineTime:   0,
                AvgGameDuration: 0,
                TotalCoins:      totalGold,
        }, nil
}

// GetDailyStats 获取每日统计
func (s *DDZStatsService) GetDailyStats(req ddzReq.DDZDailyStatsSearch) ([]ddzRes.DDZDailyStatsResponse, error) {
        db := GetDDZDB()
        var stats []ddz.DDZDailyStats
        err := db.Where("date >= ? AND date <= ?", req.StartDate, req.EndDate).
                Order("date asc").Find(&stats).Error
        if err != nil {
                return nil, err
        }

        result := make([]ddzRes.DDZDailyStatsResponse, 0, len(stats))
        for _, s := range stats {
                result = append(result, ddzRes.DDZDailyStatsResponse{
                        Date:            s.Date,
                        TotalPlayers:    s.TotalPlayers,
                        NewPlayers:      s.NewPlayers,
                        ActivePlayers:   s.ActivePlayers,
                        TotalGames:      s.TotalGames,
                        AvgGameDuration: s.AvgGameDuration,
                        MaxOnline:       s.MaxOnline,
                        TotalOnlineTime: s.TotalOnlineTime,
                        PeakTime:        s.PeakTime,
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

// GetPlayerStats 获取玩家统计
func (s *DDZStatsService) GetPlayerStats(req ddzReq.DDZStatsSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZPlayerStats{})

        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.StartDate != "" {
                query = query.Where("date >= ?", req.StartDate)
        }
        if req.EndDate != "" {
                query = query.Where("date <= ?", req.EndDate)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var stats []ddz.DDZPlayerStats
        err = query.Limit(limit).Offset(offset).Order("date desc").Find(&stats).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZPlayerStatsResponse, 0, len(stats))
        for _, s := range stats {
                result = append(result, ddzRes.DDZPlayerStatsResponse{
                        PlayerID:      s.PlayerID,
                        Date:          s.Date,
                        GamesPlayed:   s.GamesPlayed,
                        Wins:          s.Wins,
                        Losses:        s.Losses,
                        Draws:         s.Draws,
                        WinRate:       s.WinRate,
                        LandlordWins:  s.LandlordWins,
                        LandlordGames: s.LandlordGames,
                        FarmerWins:    s.FarmerWins,
                        FarmerGames:   s.FarmerGames,
                        TotalScore:    s.TotalScore,
                        MaxWinScore:   s.MaxWinScore,
                        MaxLoseScore:  s.MaxLoseScore,
                        OnlineTime:    s.OnlineTime,
                        SpringCount:   s.SpringCount,
                        BombCount:     s.BombCount,
                })
        }

        return result, total, nil
}

// GetDailyActiveChart 获取每日活跃图表数据
func (s *DDZStatsService) GetDailyActiveChart(startDate, endDate string) (ddzRes.DDZChartResponse, error) {
        db := GetDDZDB()
        var stats []ddz.DDZDailyStats
        err := db.Where("date >= ? AND date <= ?", startDate, endDate).
                Order("date asc").Find(&stats).Error
        if err != nil {
                return ddzRes.DDZChartResponse{}, err
        }

        labels := make([]string, 0, len(stats))
        data := make([]float64, 0, len(stats))
        for _, s := range stats {
                labels = append(labels, s.Date)
                data = append(data, float64(s.ActivePlayers))
        }

        return ddzRes.DDZChartResponse{
                Labels: labels,
                Data:   data,
                Title:  "每日活跃玩家",
        }, nil
}

// GetDailyGamesChart 获取每日游戏场次图表数据
func (s *DDZStatsService) GetDailyGamesChart(startDate, endDate string) (ddzRes.DDZChartResponse, error) {
        db := GetDDZDB()
        var stats []ddz.DDZDailyStats
        err := db.Where("date >= ? AND date <= ?", startDate, endDate).
                Order("date asc").Find(&stats).Error
        if err != nil {
                return ddzRes.DDZChartResponse{}, err
        }

        labels := make([]string, 0, len(stats))
        data := make([]float64, 0, len(stats))
        for _, s := range stats {
                labels = append(labels, s.Date)
                data = append(data, float64(s.TotalGames))
        }

        return ddzRes.DDZChartResponse{
                Labels: labels,
                Data:   data,
                Title:  "每日游戏场次",
        }, nil
}

// GetDailyStatsList 获取每日统计列表
func (s *DDZStatsService) GetDailyStatsList(req ddzReq.DDZDailyStatsSearch) (list []ddz.DDZDailyStats, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Model(&ddz.DDZDailyStats{})
        if req.StartDate != "" {
                db = db.Where("date >= ?", req.StartDate)
        }
        if req.EndDate != "" {
                db = db.Where("date <= ?", req.EndDate)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("date DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
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

        db := GetDDZDB().Table("ddz_room_players")
        if req.RoomID.Valid && req.RoomID.Value > 0 {
                db = db.Where("room_id = ?", req.RoomID.Value)
        }
        if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                db = db.Where("player_id = ?", req.PlayerID.Value)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}
