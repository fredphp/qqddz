package ddz

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZStatsService struct{}

var DDZStatsServiceApp = new(DDZStatsService)

// GetOverviewStats 获取概览统计
func (s *DDZStatsService) GetOverviewStats() (ddzRes.DDZOverviewStatsResponse, error) {
	var totalPlayers, activePlayers, totalGames int64
	var todayGames, todayNewPlayers int64
	var totalCoins int64

	today := time.Now().Format("2006-01-02")

	// 总玩家数
	global.GVA_DB.Model(&ddz.DDZPlayer{}).Count(&totalPlayers)

	// 活跃玩家数(最近7天)
	sevenDaysAgo := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	global.GVA_DB.Model(&ddz.DDZPlayerStats{}).
		Where("date >= ?", sevenDaysAgo).
		Distinct("player_id").Count(&activePlayers)

	// 总游戏场次
	global.GVA_DB.Model(&ddz.DDZGameRecord{}).Count(&totalGames)

	// 今日游戏场次
	global.GVA_DB.Model(&ddz.DDZGameRecord{}).
		Where("DATE(game_time) = ?", today).Count(&todayGames)

	// 今日新增玩家
	global.GVA_DB.Model(&ddz.DDZPlayer{}).
		Where("DATE(created_at) = ?", today).Count(&todayNewPlayers)

	// 总金币
	global.GVA_DB.Model(&ddz.DDZPlayer{}).Select("COALESCE(SUM(coins), 0)").Scan(&totalCoins)

	return ddzRes.DDZOverviewStatsResponse{
		TotalPlayers:    totalPlayers,
		ActivePlayers:   activePlayers,
		OnlinePlayers:   0, // 需要从游戏服务器获取
		TotalGames:      totalGames,
		TodayGames:      todayGames,
		TodayNewPlayers: todayNewPlayers,
		AvgOnlineTime:   0,
		AvgGameDuration: 0,
		TotalCoins:      totalCoins,
	}, nil
}

// GetDailyStats 获取每日统计
func (s *DDZStatsService) GetDailyStats(req ddzReq.DDZDailyStatsSearch) ([]ddzRes.DDZDailyStatsResponse, error) {
	var stats []ddz.DDZDailyStats
	err := global.GVA_DB.Where("date >= ? AND date <= ?", req.StartDate, req.EndDate).
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
	if req.Limit <= 0 {
		req.Limit = 10
	}

	var players []ddz.DDZPlayer
	var result []ddzRes.DDZLeaderboardResponse

	switch req.RankType {
	case "coins":
		global.GVA_DB.Order("coins desc").Limit(req.Limit).Find(&players)
		for i, p := range players {
			result = append(result, ddzRes.DDZLeaderboardResponse{
				Rank:     i + 1,
				PlayerID: p.PlayerID,
				Nickname: p.Nickname,
				Avatar:   p.Avatar,
				Score:    p.Coins,
				Level:    p.Level,
				VipLevel: p.VipLevel,
			})
		}
	case "level":
		global.GVA_DB.Order("level desc, experience desc").Limit(req.Limit).Find(&players)
		for i, p := range players {
			result = append(result, ddzRes.DDZLeaderboardResponse{
				Rank:     i + 1,
				PlayerID: p.PlayerID,
				Nickname: p.Nickname,
				Avatar:   p.Avatar,
				Score:    int64(p.Level),
				Level:    p.Level,
				VipLevel: p.VipLevel,
			})
		}
	case "wins":
		global.GVA_DB.Order("win_count desc").Limit(req.Limit).Find(&players)
		for i, p := range players {
			result = append(result, ddzRes.DDZLeaderboardResponse{
				Rank:     i + 1,
				PlayerID: p.PlayerID,
				Nickname: p.Nickname,
				Avatar:   p.Avatar,
				Score:    int64(p.WinCount),
				Level:    p.Level,
				VipLevel: p.VipLevel,
			})
		}
	case "winrate":
		global.GVA_DB.Where("total_games >= ?", 10).Order("win_count * 1.0 / total_games desc").Limit(req.Limit).Find(&players)
		for i, p := range players {
			winRate := float64(0)
			if p.TotalGames > 0 {
				winRate = float64(p.WinCount) / float64(p.TotalGames) * 100
			}
			result = append(result, ddzRes.DDZLeaderboardResponse{
				Rank:     i + 1,
				PlayerID: p.PlayerID,
				Nickname: p.Nickname,
				Avatar:   p.Avatar,
				Score:    int64(winRate),
				WinRate:  winRate,
				Level:    p.Level,
				VipLevel: p.VipLevel,
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
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	db := global.GVA_DB.Model(&ddz.DDZPlayerStats{})

	if req.PlayerID != "" {
		db = db.Where("player_id = ?", req.PlayerID)
	}
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

	var stats []ddz.DDZPlayerStats
	err = db.Limit(limit).Offset(offset).Order("date desc").Find(&stats).Error
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
	var stats []ddz.DDZDailyStats
	err := global.GVA_DB.Where("date >= ? AND date <= ?", startDate, endDate).
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
	var stats []ddz.DDZDailyStats
	err := global.GVA_DB.Where("date >= ? AND date <= ?", startDate, endDate).
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
