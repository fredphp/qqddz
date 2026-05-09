package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZStatsService struct{}

// GetDailyStatsList 获取每日统计列表
func (s *DDZStatsService) GetDailyStatsList(req ddzReq.DDZDailyStatsSearch) (list []ddz.DDZDailyStats, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_daily_stats")
	if req.StartDate != "" {
		db = db.Where("stat_date >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		db = db.Where("stat_date <= ?", req.EndDate)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("stat_date DESC").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

// GetLeaderboardList 获取排行榜列表
func (s *DDZStatsService) GetLeaderboardList(req ddzReq.DDZLeaderboardSearch) (list []ddz.DDZLeaderboard, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_leaderboard")
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

	db := global.GVA_DB_GAME.Table("ddz_player_online")
	if req.PlayerID > 0 {
		db = db.Where("player_id = ?", req.PlayerID)
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

	db := global.GVA_DB_GAME.Table("ddz_room_players")
	if req.RoomID > 0 {
		db = db.Where("room_id = ?", req.RoomID)
	}
	if req.PlayerID > 0 {
		db = db.Where("player_id = ?", req.PlayerID)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}
