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

        if req.RoomID != "" {
                query = query.Where("room_id = ?", req.RoomID)
        }
        if req.RoomType != nil {
                query = query.Where("room_type = ?", *req.RoomType)
        }
        if req.Winner != nil {
                query = query.Where("winner = ?", *req.Winner)
        }
        if req.Spring != nil {
                query = query.Where("spring = ?", *req.Spring)
        }
        if req.StartTime != "" {
                query = query.Where("game_time >= ?", req.StartTime)
        }
        if req.EndTime != "" {
                query = query.Where("game_time <= ?", req.EndTime+" 23:59:59")
        }
        if req.MinDuration > 0 {
                query = query.Where("game_duration >= ?", req.MinDuration)
        }
        if req.MaxDuration > 0 {
                query = query.Where("game_duration <= ?", req.MaxDuration)
        }
        if req.PlayerID != "" {
                // 通过游戏玩家记录查找
                var gameIDs []string
                db.Model(&ddz.DDZGamePlayerRecord{}).Where("player_id = ?", req.PlayerID).Pluck("game_id", &gameIDs)
                if len(gameIDs) > 0 {
                        query = query.Where("id IN ?", gameIDs)
                } else {
                        return []ddzRes.DDZGameRecordResponse{}, 0, nil
                }
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

        // 获取发牌记录
        var dealRecord ddz.DDZDealRecord
        if err := db.Where("game_id = ?", record.ID).First(&dealRecord).Error; err == nil {
                resp.DealRecord = s.toDealRecordResponse(dealRecord)
        }

        // 获取出牌记录
        var playRecords []ddz.DDZGamePlayRecord
        db.Where("game_id = ?", record.ID).Order("turn_index asc").Find(&playRecords)
        resp.PlayRecords = make([]ddzRes.DDZPlayRecordResponse, 0, len(playRecords))
        for _, pr := range playRecords {
                resp.PlayRecords = append(resp.PlayRecords, s.toPlayRecordResponse(pr))
        }

        return resp, nil
}

// DeleteGameRecord 删除游戏记录
func (s *DDZGameLogService) DeleteGameRecord(id uint) error {
        db := GetDDZDB()
        return db.Delete(&ddz.DDZGameRecord{}, id).Error
}

// GetBidLogList 获取叫地主日志列表（暂不实现，当前模型没有叫地主日志表）
func (s *DDZGameLogService) GetBidLogList(req ddzReq.DDZBidLogSearch) (list interface{}, total int64, err error) {
        // 当前数据库模型没有单独的叫地主日志表
        return []interface{}{}, 0, nil
}

// GetDealLogList 获取发牌日志列表
func (s *DDZGameLogService) GetDealLogList(req ddzReq.DDZDealLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZDealRecord{})

        if req.GameID != "" {
                query = query.Where("game_id = ?", req.GameID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZDealRecord
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        logList := make([]ddzRes.DDZDealRecordResponse, 0, len(logs))
        for _, l := range logs {
                logList = append(logList, s.toDealRecordResponse(l))
        }

        return logList, total, nil
}

// GetPlayLogList 获取出牌日志列表
func (s *DDZGameLogService) GetPlayLogList(req ddzReq.DDZPlayLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZGamePlayRecord{})

        if req.GameID != "" {
                query = query.Where("game_id = ?", req.GameID)
        }
        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.PlayType != nil {
                query = query.Where("action_type = ?", *req.PlayType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZGamePlayRecord
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        logList := make([]ddzRes.DDZPlayRecordResponse, 0, len(logs))
        for _, l := range logs {
                logList = append(logList, s.toPlayRecordResponse(l))
        }

        return logList, total, nil
}

// GetPlayerStatList 获取玩家统计列表（暂不实现，当前模型没有玩家统计表）
func (s *DDZGameLogService) GetPlayerStatList(req ddzReq.DDZPlayerStatSearch) (list interface{}, total int64, err error) {
        // 当前数据库模型没有单独的玩家统计表
        return []interface{}{}, 0, nil
}

// GetRoomConfigList 获取游戏房间配置列表（ddz_room_config 表）
func (s *DDZGameLogService) GetRoomConfigList(req ddzReq.DDZGameRoomConfigSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZRoomConfig{})

        if req.RoomName != "" {
                query = query.Where("room_name LIKE ?", "%"+req.RoomName+"%")
        }
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

// CreateRoomConfig 创建游戏房间配置（ddz_room_config 表）
func (s *DDZGameLogService) CreateRoomConfig(req ddzReq.DDZGameRoomConfigCreate) error {
        db := GetDDZDB()
        // 检查房间类型是否已存在
        var count int64
        db.Model(&ddz.DDZRoomConfig{}).Where("room_type = ?", req.RoomType).Count(&count)
        if count > 0 {
                return errors.New("该房间类型已存在")
        }

        // 设置默认背景图编号
        bgImageNum := req.BgImageNum
        if bgImageNum < ddz.BgImageNumMin || bgImageNum > ddz.BgImageNumMax {
                bgImageNum = ddz.BgImageNumMin // 默认使用编号2
        }

        config := ddz.DDZRoomConfig{
                RoomName:       req.RoomName,
                RoomType:       req.RoomType,
                BaseScore:      req.BaseScore,
                Multiplier:     req.Multiplier,
                MinGold:        req.MinGold,
                MaxGold:        req.MaxGold,
                BgImageNum:     bgImageNum,
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

// UpdateRoomConfig 更新游戏房间配置（ddz_room_config 表）
func (s *DDZGameLogService) UpdateRoomConfig(req ddzReq.DDZGameRoomConfigUpdate) error {
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

        // 更新背景图编号
        if req.BgImageNum >= ddz.BgImageNumMin && req.BgImageNum <= ddz.BgImageNumMax {
                updates["bg_image_num"] = req.BgImageNum
        }

        updates["bot_enabled"] = req.BotEnabled
        updates["bot_count"] = req.BotCount
        updates["fee_rate"] = req.FeeRate
        if req.MaxRound > 0 {
                updates["max_round"] = req.MaxRound
        }
        if req.TimeoutSeconds > 0 {
                updates["timeout_seconds"] = req.TimeoutSeconds
        }
        updates["status"] = req.Status
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
        // 获取玩家信息
        var players []ddzRes.DDZGamePlayerInfo
        db := GetDDZDB()
        var playerRecords []ddz.DDZGamePlayerRecord
        db.Where("game_id = ?", r.ID).Order("player_index asc").Find(&playerRecords)
        for _, pr := range playerRecords {
                playerInfo := ddzRes.DDZGamePlayerInfo{
                        PlayerID:    pr.PlayerID,
                        PlayerIndex: pr.PlayerIndex,
                        IsLandlord:  pr.IsLandlord,
                        IsWinner:    pr.IsWinner,
                        Score:       pr.Score,
                        Cards:       pr.Cards,
                }
                // 获取玩家昵称
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", pr.PlayerID).First(&player).Error; err == nil {
                        playerInfo.Nickname = player.Nickname
                }
                players = append(players, playerInfo)
        }

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
                Players:      players,
                CreatedAt:    r.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

func (s *DDZGameLogService) toDealRecordResponse(r ddz.DDZDealRecord) ddzRes.DDZDealRecordResponse {
        return ddzRes.DDZDealRecordResponse{
                ID:           r.ID,
                GameID:       r.GameID,
                Player0Cards: r.Player0Cards,
                Player1Cards: r.Player1Cards,
                Player2Cards: r.Player2Cards,
                DizhuCards:   r.DizhuCards,
                FirstPlayer:  r.FirstPlayer,
        }
}

func (s *DDZGameLogService) toPlayRecordResponse(r ddz.DDZGamePlayRecord) ddzRes.DDZPlayRecordResponse {
        return ddzRes.DDZPlayRecordResponse{
                ID:          r.ID,
                GameID:      r.GameID,
                PlayerID:    r.PlayerID,
                PlayerIndex: r.PlayerIndex,
                TurnIndex:   r.TurnIndex,
                ActionType:  r.ActionType,
                Cards:       r.Cards,
                Timestamp:   r.Timestamp,
        }
}

func (s *DDZGameLogService) toRoomConfigResponse(c ddz.DDZRoomConfig) ddzRes.DDZRoomConfigResponse {
        roomTypeName := "新手场"
        switch c.RoomType {
        case 2:
                roomTypeName = "普通场"
        case 3:
                roomTypeName = "高级场"
        case 4:
                roomTypeName = "富豪场"
        case 5:
                roomTypeName = "至尊场"
        }

        statusText := "关闭"
        if c.Status == 1 {
                statusText = "开启"
        }

        // 设置默认背景图编号
        bgImageNum := c.BgImageNum
        if bgImageNum < ddz.BgImageNumMin || bgImageNum > ddz.BgImageNumMax {
                bgImageNum = ddz.BgImageNumMin
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
                EntryGold:      c.MinGold, // 入场金币 = 最低入场金币
                BgImageNum:     bgImageNum,
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
