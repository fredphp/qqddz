package ddz

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZGameLogService struct{}

var DDZGameLogServiceApp = new(DDZGameLogService)

// GetGameRecordList 获取游戏记录列表
func (s *DDZGameLogService) GetGameRecordList(req ddzReq.DDZGameRecordSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZGameRecord{})

	if req.GameID != "" {
		query = query.Where("game_id = ?", req.GameID)
	}
	if req.RoomID != "" {
		query = query.Where("room_id = ?", req.RoomID)
	}
	if req.RoomType != nil {
		query = query.Where("room_type = ?", *req.RoomType)
	}
	if req.Result != nil {
		query = query.Where("result = ?", *req.Result)
	}
	if req.Spring != nil {
		query = query.Where("spring = ?", *req.Spring)
	}
	if req.StartDate != "" {
		query = query.Where("started_at >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("started_at <= ?", req.EndDate+" 23:59:59")
	}
	if req.PlayerID != "" {
		query = query.Where("landlord_id = ? OR farmer1_id = ? OR farmer2_id = ?", req.PlayerID, req.PlayerID, req.PlayerID)
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
		resp := s.toGameRecordResponse(r)
		// 获取玩家昵称
		resp.LandlordName = s.getPlayerNickname(r.LandlordID)
		resp.Farmer1Name = s.getPlayerNickname(r.Farmer1ID)
		resp.Farmer2Name = s.getPlayerNickname(r.Farmer2ID)
		recordList = append(recordList, resp)
	}

	return recordList, total, nil
}

// GetGameRecordDetail 获取游戏记录详情
func (s *DDZGameLogService) GetGameRecordDetail(id uint) (ddzRes.DDZGameRecordDetailResponse, error) {
	db := GetDDZDB()
	var record ddz.DDZGameRecord
	err := db.First(&record, id).Error
	if err != nil {
		return ddzRes.DDZGameRecordDetailResponse{}, err
	}

	resp := ddzRes.DDZGameRecordDetailResponse{
		GameRecord: s.toGameRecordResponse(record),
	}
	resp.GameRecord.LandlordName = s.getPlayerNickname(record.LandlordID)
	resp.GameRecord.Farmer1Name = s.getPlayerNickname(record.Farmer1ID)
	resp.GameRecord.Farmer2Name = s.getPlayerNickname(record.Farmer2ID)

	// 获取叫地主日志
	var bidLogs []ddz.DDZBidLog
	db.Where("game_id = ?", record.GameID).Order("bid_order asc").Find(&bidLogs)
	resp.BidLogs = make([]ddzRes.DDZBidLogResponse, 0, len(bidLogs))
	for _, bl := range bidLogs {
		resp.BidLogs = append(resp.BidLogs, s.toBidLogResponse(bl))
	}

	// 获取发牌日志
	var dealLogs []ddz.DDZDealLog
	db.Where("game_id = ?", record.GameID).Find(&dealLogs)
	resp.DealLogs = make([]ddzRes.DDZDealLogResponse, 0, len(dealLogs))
	for _, dl := range dealLogs {
		resp.DealLogs = append(resp.DealLogs, s.toDealLogResponse(dl))
	}

	// 获取出牌日志
	var playLogs []ddz.DDZPlayLog
	db.Where("game_id = ?", record.GameID).Order("round_num asc, play_order asc").Find(&playLogs)
	resp.PlayLogs = make([]ddzRes.DDZPlayLogResponse, 0, len(playLogs))
	for _, pl := range playLogs {
		resp.PlayLogs = append(resp.PlayLogs, s.toPlayLogResponse(pl))
	}

	return resp, nil
}

// DeleteGameRecord 删除游戏记录
func (s *DDZGameLogService) DeleteGameRecord(id uint) error {
	db := GetDDZDB()
	return db.Delete(&ddz.DDZGameRecord{}, id).Error
}

// GetBidLogList 获取叫地主日志列表
func (s *DDZGameLogService) GetBidLogList(req ddzReq.DDZBidLogSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZBidLog{})

	if req.GameID != "" {
		query = query.Where("game_id = ?", req.GameID)
	}
	if req.PlayerID != "" {
		query = query.Where("player_id = ?", req.PlayerID)
	}
	if req.BidType != nil {
		query = query.Where("bid_type = ?", *req.BidType)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var logs []ddz.DDZBidLog
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	logList := make([]ddzRes.DDZBidLogResponse, 0, len(logs))
	for _, l := range logs {
		logList = append(logList, s.toBidLogResponse(l))
	}

	return logList, total, nil
}

// GetDealLogList 获取发牌日志列表
func (s *DDZGameLogService) GetDealLogList(req ddzReq.DDZDealLogSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZDealLog{})

	if req.GameID != "" {
		query = query.Where("game_id = ?", req.GameID)
	}
	if req.PlayerID != "" {
		query = query.Where("player_id = ?", req.PlayerID)
	}
	if req.PlayerRole != nil {
		query = query.Where("player_role = ?", *req.PlayerRole)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var logs []ddz.DDZDealLog
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	logList := make([]ddzRes.DDZDealLogResponse, 0, len(logs))
	for _, l := range logs {
		logList = append(logList, s.toDealLogResponse(l))
	}

	return logList, total, nil
}

// GetPlayLogList 获取出牌日志列表
func (s *DDZGameLogService) GetPlayLogList(req ddzReq.DDZPlayLogSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZPlayLog{})

	if req.GameID != "" {
		query = query.Where("game_id = ?", req.GameID)
	}
	if req.PlayerID != "" {
		query = query.Where("player_id = ?", req.PlayerID)
	}
	if req.PlayType != nil {
		query = query.Where("play_type = ?", *req.PlayType)
	}
	if req.IsBomb != nil {
		query = query.Where("is_bomb = ? OR is_rocket = ?", *req.IsBomb, *req.IsBomb)
	}
	if req.CardPattern != "" {
		query = query.Where("card_pattern = ?", req.CardPattern)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var logs []ddz.DDZPlayLog
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	logList := make([]ddzRes.DDZPlayLogResponse, 0, len(logs))
	for _, l := range logs {
		logList = append(logList, s.toPlayLogResponse(l))
	}

	return logList, total, nil
}

// GetPlayerStatList 获取玩家统计列表
func (s *DDZGameLogService) GetPlayerStatList(req ddzReq.DDZPlayerStatSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZPlayerStat{})

	if req.PlayerID != "" {
		query = query.Where("player_id = ?", req.PlayerID)
	}
	if req.StartDate != "" {
		query = query.Where("stat_date >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("stat_date <= ?", req.EndDate)
	}

	// 排序
	orderBy := "id desc"
	if req.OrderBy != "" {
		switch req.OrderBy {
		case "winRate":
			orderBy = "win_rate desc"
		case "totalGames":
			orderBy = "total_games desc"
		case "winGames":
			orderBy = "win_games desc"
		}
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var stats []ddz.DDZPlayerStat
	err = query.Limit(limit).Offset(offset).Order(orderBy).Find(&stats).Error
	if err != nil {
		return nil, 0, err
	}

	statList := make([]ddzRes.DDZPlayerStatResponse, 0, len(stats))
	for _, st := range stats {
		resp := s.toPlayerStatResponse(st)
		// 获取玩家信息
		var player ddz.DDZPlayer
		if err := db.Where("id = ?", st.PlayerID).First(&player).Error; err == nil {
			resp.PlayerName = player.Nickname
			resp.PlayerAvatar = player.Avatar
		}
		statList = append(statList, resp)
	}

	return statList, total, nil
}

// GetRoomConfigList 获取房间配置列表
func (s *DDZGameLogService) GetRoomConfigList(req ddzReq.DDZRoomConfigSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZRoomConfig{})

	if req.RoomType != nil {
		query = query.Where("room_type = ?", *req.RoomType)
	}
	if req.Status != nil {
		query = query.Where("status = ?", *req.Status)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var configs []ddz.DDZRoomConfig
	err = query.Limit(limit).Offset(offset).Order("sort_order asc, id asc").Find(&configs).Error
	if err != nil {
		return nil, 0, err
	}

	configList := make([]ddzRes.DDZRoomConfigResponse, 0, len(configs))
	for _, c := range configs {
		configList = append(configList, s.toRoomConfigResponse(c))
	}

	return configList, total, nil
}

// CreateRoomConfig 创建房间配置
func (s *DDZGameLogService) CreateRoomConfig(req ddzReq.DDZRoomConfigCreate) error {
	db := GetDDZDB()
	// 检查房间类型是否已存在
	var count int64
	db.Model(&ddz.DDZRoomConfig{}).Where("room_type = ?", req.RoomType).Count(&count)
	if count > 0 {
		return errors.New("该房间类型已存在")
	}

	config := ddz.DDZRoomConfig{
		RoomName:       req.RoomName,
		RoomType:       req.RoomType,
		BaseScore:      req.BaseScore,
		Multiplier:     req.Multiplier,
		MinGold:        req.MinGold,
		MaxGold:        req.MaxGold,
		BotEnabled:     req.BotEnabled,
		BotCount:       req.BotCount,
		FeeRate:        req.FeeRate,
		MaxRound:       req.MaxRound,
		TimeoutSeconds: req.TimeoutSeconds,
		Status:         req.Status,
		SortOrder:      req.SortOrder,
		Description:    req.Description,
	}

	return db.Create(&config).Error
}

// UpdateRoomConfig 更新房间配置
func (s *DDZGameLogService) UpdateRoomConfig(req ddzReq.DDZRoomConfigUpdate) error {
	db := GetDDZDB()
	var config ddz.DDZRoomConfig
	err := db.First(&config, req.ID).Error
	if err != nil {
		return errors.New("房间配置不存在")
	}

	updates := map[string]interface{}{}
	if req.RoomName != "" {
		updates["room_name"] = req.RoomName
	}
	if req.BaseScore > 0 {
		updates["base_score"] = req.BaseScore
	}
	if req.Multiplier > 0 {
		updates["multiplier"] = req.Multiplier
	}
	updates["min_gold"] = req.MinGold
	updates["max_gold"] = req.MaxGold
	updates["bot_enabled"] = req.BotEnabled
	updates["bot_count"] = req.BotCount
	updates["fee_rate"] = req.FeeRate
	if req.MaxRound > 0 {
		updates["max_round"] = req.MaxRound
	}
	if req.TimeoutSeconds > 0 {
		updates["timeout_seconds"] = req.TimeoutSeconds
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	updates["sort_order"] = req.SortOrder
	updates["description"] = req.Description

	return db.Model(&config).Updates(updates).Error
}

// DeleteRoomConfig 删除房间配置
func (s *DDZGameLogService) DeleteRoomConfig(id uint) error {
	db := GetDDZDB()
	return db.Delete(&ddz.DDZRoomConfig{}, id).Error
}

// GetSmsCodeList 获取短信验证码列表
func (s *DDZGameLogService) GetSmsCodeList(req ddzReq.DDZSmsCodeSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZSmsCode{})

	if req.Phone != "" {
		query = query.Where("phone LIKE ?", "%"+req.Phone+"%")
	}
	if req.Type != nil {
		query = query.Where("type = ?", *req.Type)
	}
	if req.IsUsed != nil {
		query = query.Where("is_used = ?", *req.IsUsed)
	}
	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var codes []ddz.DDZSmsCode
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&codes).Error
	if err != nil {
		return nil, 0, err
	}

	codeList := make([]ddzRes.DDZSmsCodeResponse, 0, len(codes))
	for _, c := range codes {
		codeList = append(codeList, s.toSmsCodeResponse(c))
	}

	return codeList, total, nil
}

// DeleteSmsCode 删除短信验证码
func (s *DDZGameLogService) DeleteSmsCode(id uint) error {
	db := GetDDZDB()
	return db.Delete(&ddz.DDZSmsCode{}, id).Error
}

// 转换方法

func (s *DDZGameLogService) toGameRecordResponse(r ddz.DDZGameRecord) ddzRes.DDZGameRecordResponse {
	roomTypeName := "普通场"
	switch r.RoomType {
	case 2:
		roomTypeName = "高级场"
	case 3:
		roomTypeName = "富豪场"
	case 4:
		roomTypeName = "至尊场"
	case 5:
		roomTypeName = "至尊场"
	}

	resultText := "地主胜"
	if r.Result == 2 {
		resultText = "农民胜"
	}

	springText := "无"
	switch r.Spring {
	case 1:
		springText = "地主春天"
	case 2:
		springText = "反春天"
	}

	durationText := formatDuration(r.DurationSeconds)

	var endedAt string
	if r.EndedAt != nil {
		endedAt = *r.EndedAt
	}

	return ddzRes.DDZGameRecordResponse{
		ID:              r.ID,
		GameID:          r.GameID,
		RoomID:          r.RoomID,
		RoomType:        r.RoomType,
		RoomTypeName:    roomTypeName,
		LandlordID:      r.LandlordID,
		Farmer1ID:       r.Farmer1ID,
		Farmer2ID:       r.Farmer2ID,
		BaseScore:       r.BaseScore,
		Multiplier:      r.Multiplier,
		BombCount:       r.BombCount,
		Spring:          r.Spring,
		SpringText:      springText,
		Result:          r.Result,
		ResultText:      resultText,
		LandlordWinGold: r.LandlordWinGold,
		Farmer1WinGold:  r.Farmer1WinGold,
		Farmer2WinGold:  r.Farmer2WinGold,
		StartedAt:       r.StartedAt,
		EndedAt:         endedAt,
		DurationSeconds: r.DurationSeconds,
		DurationText:    durationText,
		CreatedAt:       r.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toBidLogResponse(l ddz.DDZBidLog) ddzRes.DDZBidLogResponse {
	bidTypeText := "不叫"
	switch l.BidType {
	case 1:
		bidTypeText = "叫地主"
	case 2:
		bidTypeText = "抢地主"
	}

	successText := "否"
	if l.IsSuccess == 1 {
		successText = "是"
	}

	return ddzRes.DDZBidLogResponse{
		ID:          l.ID,
		GameID:      l.GameID,
		PlayerID:    l.PlayerID,
		PlayerName:  s.getPlayerNickname(l.PlayerID),
		BidOrder:    l.BidOrder,
		BidType:     l.BidType,
		BidTypeText: bidTypeText,
		BidScore:    l.BidScore,
		IsSuccess:   l.IsSuccess,
		SuccessText: successText,
		CreatedAt:   l.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toDealLogResponse(l ddz.DDZDealLog) ddzRes.DDZDealLogResponse {
	playerRoleText := "地主"
	if l.PlayerRole == 2 {
		playerRoleText = "农民"
	}

	return ddzRes.DDZDealLogResponse{
		ID:             l.ID,
		GameID:         l.GameID,
		PlayerID:       l.PlayerID,
		PlayerName:     s.getPlayerNickname(l.PlayerID),
		PlayerRole:     l.PlayerRole,
		PlayerRoleText: playerRoleText,
		HandCards:      l.HandCards,
		CardsCount:     l.CardsCount,
		LandlordCards:  l.LandlordCards,
		CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toPlayLogResponse(l ddz.DDZPlayLog) ddzRes.DDZPlayLogResponse {
	playerRoleText := "地主"
	if l.PlayerRole == 2 {
		playerRoleText = "农民"
	}

	playTypeText := "出牌"
	switch l.PlayType {
	case 2:
		playTypeText = "不出"
	case 3:
		playTypeText = "超时自动出牌"
	}

	return ddzRes.DDZPlayLogResponse{
		ID:             l.ID,
		GameID:         l.GameID,
		PlayerID:       l.PlayerID,
		PlayerName:     s.getPlayerNickname(l.PlayerID),
		PlayerRole:     l.PlayerRole,
		PlayerRoleText: playerRoleText,
		RoundNum:       l.RoundNum,
		PlayOrder:      l.PlayOrder,
		PlayType:       l.PlayType,
		PlayTypeText:   playTypeText,
		Cards:          l.Cards,
		CardsCount:     l.CardsCount,
		CardPattern:    l.CardPattern,
		IsBomb:         l.IsBomb,
		IsRocket:       l.IsRocket,
		CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toPlayerStatResponse(st ddz.DDZPlayerStat) ddzRes.DDZPlayerStatResponse {
	landlordWinRate := float64(0)
	if st.LandlordGames > 0 {
		landlordWinRate = float64(st.LandlordWins) * 100 / float64(st.LandlordGames)
	}
	farmerWinRate := float64(0)
	if st.FarmerGames > 0 {
		farmerWinRate = float64(st.FarmerWins) * 100 / float64(st.FarmerGames)
	}

	return ddzRes.DDZPlayerStatResponse{
		ID:              st.ID,
		PlayerID:        st.PlayerID,
		StatDate:        st.StatDate,
		TotalGames:      st.TotalGames,
		WinGames:        st.WinGames,
		LoseGames:       st.LoseGames,
		WinRate:         st.WinRate,
		LandlordGames:   st.LandlordGames,
		LandlordWins:    st.LandlordWins,
		LandlordWinRate: landlordWinRate,
		FarmerGames:     st.FarmerGames,
		FarmerWins:      st.FarmerWins,
		FarmerWinRate:   farmerWinRate,
		TotalGoldChange: st.TotalGoldChange,
		MaxWinGold:      st.MaxWinGold,
		MaxLoseGold:     st.MaxLoseGold,
		TotalBombs:      st.TotalBombs,
		TotalRockets:    st.TotalRockets,
		SpringCount:     st.SpringCount,
		AntiSpringCount: st.AntiSpringCount,
		AvgGameDuration: st.AvgGameDuration,
		CreatedAt:       st.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toRoomConfigResponse(c ddz.DDZRoomConfig) ddzRes.DDZRoomConfigResponse {
	roomTypeName := "普通场"
	switch c.RoomType {
	case 2:
		roomTypeName = "高级场"
	case 3:
		roomTypeName = "富豪场"
	case 4:
		roomTypeName = "至尊场"
	case 5:
		roomTypeName = "至尊场"
	}

	statusText := "关闭"
	if c.Status == 1 {
		statusText = "开启"
	}

	return ddzRes.DDZRoomConfigResponse{
		ID:             c.ID,
		RoomName:       c.RoomName,
		RoomType:       c.RoomType,
		RoomTypeName:   roomTypeName,
		BaseScore:      c.BaseScore,
		Multiplier:     c.Multiplier,
		MinGold:        c.MinGold,
		MaxGold:        c.MaxGold,
		BotEnabled:     c.BotEnabled,
		BotCount:       c.BotCount,
		FeeRate:        c.FeeRate,
		MaxRound:       c.MaxRound,
		TimeoutSeconds: c.TimeoutSeconds,
		Status:         c.Status,
		StatusText:     statusText,
		SortOrder:      c.SortOrder,
		Description:    c.Description,
		CreatedAt:      c.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:      c.UpdatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) toSmsCodeResponse(c ddz.DDZSmsCode) ddzRes.DDZSmsCodeResponse {
	typeText := "登录"
	switch c.Type {
	case 2:
		typeText = "注册"
	case 3:
		typeText = "绑定手机"
	case 4:
		typeText = "修改密码"
	}

	isUsedText := "未使用"
	if c.IsUsed == 1 {
		isUsedText = "已使用"
	}

	return ddzRes.DDZSmsCodeResponse{
		ID:         c.ID,
		Phone:      c.Phone,
		Code:       c.Code,
		Type:       c.Type,
		TypeText:   typeText,
		IsUsed:     c.IsUsed,
		IsUsedText: isUsedText,
		ExpireAt:   c.ExpireAt,
		UsedAt:     c.UsedAt,
		IP:         c.IP,
		CreatedAt:  c.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func (s *DDZGameLogService) getPlayerNickname(playerID uint64) string {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	if err := db.Where("id = ?", playerID).First(&player).Error; err != nil {
		return ""
	}
	return player.Nickname
}

func formatDuration(seconds int) string {
	if seconds < 60 {
		return string(rune(seconds)) + "秒"
	}
	minutes := seconds / 60
	secs := seconds % 60
	if minutes < 60 {
		return string(rune(minutes)) + "分" + string(rune(secs)) + "秒"
	}
	hours := minutes / 60
	mins := minutes % 60
	return string(rune(hours)) + "时" + string(rune(mins)) + "分"
}
