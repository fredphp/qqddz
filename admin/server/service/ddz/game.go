package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZGameService struct{}

var DDZGameServiceApp = new(DDZGameService)

// GetGameRecordList 获取游戏记录列表
func (s *DDZGameService) GetGameRecordList(req ddzReq.DDZGameRecordSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZGameRecord{})

	if req.RoomID != "" {
		query = query.Where("room_id = ?", req.RoomID)
	}
	if req.Winner != nil {
		query = query.Where("winner = ?", *req.Winner)
	}
	if req.RoomType != nil {
		query = query.Where("room_type = ?", *req.RoomType)
	}
	if req.StartTime != "" {
		query = query.Where("game_time >= ?", req.StartTime)
	}
	if req.EndTime != "" {
		query = query.Where("game_time <= ?", req.EndTime)
	}
	if req.Spring != nil {
		query = query.Where("spring = ?", *req.Spring)
	}
	if req.MinDuration > 0 {
		query = query.Where("game_duration >= ?", req.MinDuration)
	}
	if req.MaxDuration > 0 {
		query = query.Where("game_duration <= ?", req.MaxDuration)
	}

	// 如果指定了玩家ID，需要关联查询
	if req.PlayerID != "" {
		query = query.Joins("JOIN ddz_game_player_records ON ddz_game_player_records.game_id = ddz_game_records.room_id").
			Where("ddz_game_player_records.player_id = ?", req.PlayerID)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var records []ddz.DDZGameRecord
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&records).Error
	if err != nil {
		return nil, 0, err
	}

	// 转换为响应格式
	recordList := make([]ddzRes.DDZGameRecordResponse, 0, len(records))
	for _, r := range records {
		recordList = append(recordList, s.toGameRecordResponse(r))
	}

	return recordList, total, nil
}

// GetGameRecordDetail 获取游戏记录详情
func (s *DDZGameService) GetGameRecordDetail(id uint) (ddzRes.DDZGameRecordDetailResponse, error) {
	db := GetDDZDB()
	var record ddz.DDZGameRecord
	err := db.First(&record, id).Error
	if err != nil {
		return ddzRes.DDZGameRecordDetailResponse{}, err
	}

	// 获取玩家记录
	var playerRecords []ddz.DDZGamePlayerRecord
	err = db.Where("game_id = ?", record.RoomID).Find(&playerRecords).Error
	if err != nil {
		return ddzRes.DDZGameRecordDetailResponse{}, err
	}

	// 获取发牌记录
	var dealRecord ddz.DDZDealRecord
	db.Where("game_id = ?", record.RoomID).First(&dealRecord)

	// 获取出牌记录
	var playRecords []ddz.DDZGamePlayRecord
	db.Where("game_id = ?", record.RoomID).Order("turn_index asc").Find(&playRecords)

	// 转换玩家记录
	players := make([]ddzRes.DDZGamePlayerInfo, 0, len(playerRecords))
	for _, pr := range playerRecords {
		players = append(players, ddzRes.DDZGamePlayerInfo{
			PlayerID:    pr.PlayerID,
			Nickname:    s.getPlayerNickname(pr.PlayerID),
			PlayerIndex: pr.PlayerIndex,
			IsLandlord:  pr.IsLandlord,
			IsWinner:    pr.IsWinner,
			Score:       pr.Score,
			Cards:       pr.Cards,
		})
	}

	// 转换出牌记录
	playRecordResponses := make([]ddzRes.DDZPlayRecordResponse, 0, len(playRecords))
	for _, pr := range playRecords {
		playRecordResponses = append(playRecordResponses, ddzRes.DDZPlayRecordResponse{
			ID:          pr.ID,
			GameID:      pr.GameID,
			PlayerID:    pr.PlayerID,
			PlayerIndex: pr.PlayerIndex,
			TurnIndex:   pr.TurnIndex,
			ActionType:  pr.ActionType,
			Cards:       pr.Cards,
			Timestamp:   pr.Timestamp,
		})
	}

	return ddzRes.DDZGameRecordDetailResponse{
		GameRecord: s.toGameRecordResponse(record),
		DealRecord: ddzRes.DDZDealRecordResponse{
			ID:           dealRecord.ID,
			GameID:       dealRecord.GameID,
			Player0Cards: dealRecord.Player0Cards,
			Player1Cards: dealRecord.Player1Cards,
			Player2Cards: dealRecord.Player2Cards,
			DizhuCards:   dealRecord.DizhuCards,
			FirstPlayer:  dealRecord.FirstPlayer,
		},
		PlayRecords: playRecordResponses,
	}, nil
}

// toGameRecordResponse 转换为响应格式
func (s *DDZGameService) toGameRecordResponse(r ddz.DDZGameRecord) ddzRes.DDZGameRecordResponse {
	return ddzRes.DDZGameRecordResponse{
		ID:           r.ID,
		RoomID:       r.RoomID,
		RoomType:     r.RoomType,
		RoomLevel:    r.RoomLevel,
		BaseScore:    r.BaseScore,
		Multiple:     r.Multiple,
		LandlordID:   r.LandlordID,
		Winner:       r.Winner,
		GameDuration: r.GameDuration,
		GameTime:     r.GameTime,
		Spring:       r.Spring,
		BombCount:    r.BombCount,
		Players:      []ddzRes.DDZGamePlayerInfo{},
		CreatedAt:    r.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

// getPlayerNickname 获取玩家昵称
func (s *DDZGameService) getPlayerNickname(playerID string) string {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	if err := db.Where("player_id = ?", playerID).First(&player).Error; err != nil {
		return ""
	}
	return player.Nickname
}
