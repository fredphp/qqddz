package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZGameDetailService struct{}

// GetGamePlayerRecordList 获取游戏玩家记录列表
func (s *DDZGameDetailService) GetGamePlayerRecordList(req ddzReq.DDZGamePlayerRecordSearch) (list []ddz.DDZGamePlayerRecord, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_game_player_records")
	if req.GameID != "" {
		db = db.Where("game_id = ?", req.GameID)
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

// GetGamePlayRecordList 获取出牌记录列表
func (s *DDZGameDetailService) GetGamePlayRecordList(req ddzReq.DDZGamePlayRecordSearch) (list []ddz.DDZGamePlayRecord, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_game_play_records")
	if req.GameID != "" {
		db = db.Where("game_id = ?", req.GameID)
	}
	if req.PlayerID > 0 {
		db = db.Where("player_id = ?", req.PlayerID)
	}
	if req.PlayType != nil {
		db = db.Where("play_type = ?", *req.PlayType)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

// GetDealRecordList 获取发牌记录列表
func (s *DDZGameDetailService) GetDealRecordList(req ddzReq.DDZDealRecordSearch) (list []ddz.DDZDealRecord, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_deal_records")
	if req.GameID != "" {
		db = db.Where("game_id = ?", req.GameID)
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
