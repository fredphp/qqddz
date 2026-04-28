package ddz

import (
        "errors"
        "fmt"
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZGameLogService struct{}

var DDZGameLogServiceApp = new(DDZGameLogService)

// getCurrentMonth 获取当前月份字符串（格式: 202401）
func getCurrentMonth() string {
        return time.Now().Format("200601")
}

// getTableNameWithMonth 根据月份获取分表名称
func getTableNameWithMonth(baseTable, month string) string {
        if month == "" {
                month = getCurrentMonth()
        }
        return baseTable + "_" + month
}

// GetGameRecordList 获取游戏记录列表
func (s *DDZGameLogService) GetGameRecordList(req ddzReq.DDZGameRecordSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 确定查询的分表
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_game_records", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                // 分表不存在，返回空结果
                return []ddzRes.DDZGameRecordResponse{}, 0, nil
        }

        query := db.Table(tableName)

        if req.GameID != "" {
                query = query.Where("game_id LIKE ?", "%"+req.GameID+"%")
        }
        if req.RoomID != "" {
                query = query.Where("room_id = ?", req.RoomID)
        }
        if req.RoomType != nil {
                query = query.Where("room_type = ?", *req.RoomType)
        }
        if req.RoomCategory != nil {
                query = query.Where("room_category = ?", *req.RoomCategory)
        }
        if req.Result != nil {
                query = query.Where("result = ?", *req.Result)
        }
        if req.Winner != nil {
                query = query.Where("result = ?", *req.Winner)
        }
        if req.Spring != nil {
                query = query.Where("spring = ?", *req.Spring)
        }
        if req.StartTime != "" {
                query = query.Where("started_at >= ?", req.StartTime)
        }
        if req.EndTime != "" {
                query = query.Where("started_at <= ?", req.EndTime+" 23:59:59")
        }
        if req.MinDuration > 0 {
                query = query.Where("duration_seconds >= ?", req.MinDuration)
        }
        if req.MaxDuration > 0 {
                query = query.Where("duration_seconds <= ?", req.MaxDuration)
        }
        if req.PlayerID != "" {
                // 通过地主ID或农民ID查找
                query = query.Where("landlord_id = ? OR farmer1_id = ? OR farmer2_id = ?", req.PlayerID, req.PlayerID, req.PlayerID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var records []GameRecord
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&records).Error
        if err != nil {
                return nil, 0, err
        }

        // 转换为响应格式
        recordList := make([]ddzRes.DDZGameRecordResponse, 0, len(records))
        for _, r := range records {
                resp := s.gameRecordToResponse(r)
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
        if req.RoomCategory != nil {
                query = query.Where("room_category = ?", *req.RoomCategory)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var configs []ddz.DDZRoomConfig
        err = query.Limit(limit).Offset(offset).Order("room_category desc, sort_order asc, id asc").Find(&configs).Error
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

        // 默认房间分类为普通场
        roomCategory := req.RoomCategory
        if roomCategory == 0 {
                roomCategory = 1
        }

        config := ddz.DDZRoomConfig{
                RoomName:       req.RoomName,
                RoomType:       req.RoomType,
                RoomCategory:   roomCategory,
                BaseScore:      req.BaseScore,
                Multiplier:     req.Multiplier,
                MinGold:        req.MinGold,
                MaxGold:        req.MaxGold,
                MinArenaCoin:   req.MinArenaCoin,
                MaxArenaCoin:   req.MaxArenaCoin,
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

        // 房间名称
        if req.RoomName != "" {
                updates["room_name"] = req.RoomName
        }

        // 房间类型 - 始终更新
        if req.RoomType > 0 {
                updates["room_type"] = req.RoomType
        }

        // 房间分类
        if req.RoomCategory > 0 {
                updates["room_category"] = req.RoomCategory
        }

        // 底分
        if req.BaseScore > 0 {
                updates["base_score"] = req.BaseScore
        }

        // 倍数
        if req.Multiplier > 0 {
                updates["multiplier"] = req.Multiplier
        }

        // 金币范围
        updates["min_gold"] = req.MinGold
        updates["max_gold"] = req.MaxGold

        // 竞技币范围
        updates["min_arena_coin"] = req.MinArenaCoin
        updates["max_arena_coin"] = req.MaxArenaCoin

        // 更新背景图编号 - 始终更新，如果值无效则使用默认值
        bgImageNum := req.BgImageNum
        if bgImageNum < ddz.BgImageNumMin || bgImageNum > ddz.BgImageNumMax {
                bgImageNum = ddz.BgImageNumMin // 默认值 2
        }
        updates["bg_image_num"] = bgImageNum

        // 机器人配置
        updates["bot_enabled"] = req.BotEnabled
        updates["bot_count"] = req.BotCount

        // 手续费率
        updates["fee_rate"] = req.FeeRate

        // 最大回合数
        if req.MaxRound > 0 {
                updates["max_round"] = req.MaxRound
        }

        // 超时时间
        if req.TimeoutSeconds > 0 {
                updates["timeout_seconds"] = req.TimeoutSeconds
        }

        // 状态
        updates["status"] = req.Status

        // 排序
        updates["sort_order"] = req.SortOrder

        // 描述
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

// GetRoomList 获取游戏房间实例列表（ddz_rooms 分表）
func (s *DDZGameLogService) GetRoomList(req ddzReq.DDZRoomSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 确定查询的分表
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_rooms", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                // 分表不存在，返回空结果
                return []ddzRes.DDZRoomResponse{}, 0, nil
        }

        query := db.Table(tableName)

        if req.RoomID != "" {
                query = query.Where("room_code LIKE ?", "%"+req.RoomID+"%")
        }
        if req.RoomName != "" {
                query = query.Where("room_name LIKE ?", "%"+req.RoomName+"%")
        }
        if req.RoomType != nil {
                query = query.Where("room_type = ?", *req.RoomType)
        }
        if req.RoomCategory != nil {
                query = query.Where("room_category = ?", *req.RoomCategory)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }
        if req.CreatorID != "" {
                query = query.Where("creator_id = ?", req.CreatorID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var rooms []RoomRecord
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&rooms).Error
        if err != nil {
                return nil, 0, err
        }

        roomList := make([]ddzRes.DDZRoomResponse, 0, len(rooms))
        for _, r := range rooms {
                roomList = append(roomList, s.roomRecordToResponse(r))
        }

        return roomList, total, nil
}

// GetRoomDetail 获取房间详情
func (s *DDZGameLogService) GetRoomDetail(id uint) (ddzRes.DDZRoomResponse, error) {
        db := GetDDZDB()
        var room ddz.DDZRoom
        err := db.First(&room, id).Error
        if err != nil {
                return ddzRes.DDZRoomResponse{}, err
        }
        return s.toRoomResponse(room), nil
}

// DeleteRoom 删除房间
func (s *DDZGameLogService) DeleteRoom(id uint) error {
        db := GetDDZDB()
        return db.Delete(&ddz.DDZRoom{}, id).Error
}

// 转换方法

func (s *DDZGameLogService) toGameRecordResponse(r ddz.DDZGameRecord) ddzRes.DDZGameRecordResponse {
        db := GetDDZDB()

        // 房间类型名称
        roomTypeName := "未知"
        switch r.RoomType {
        case 2:
                roomTypeName = "初级场"
        case 3:
                roomTypeName = "中级场"
        case 4:
                roomTypeName = "高级场"
        case 5:
                roomTypeName = "大师场"
        case 6:
                roomTypeName = "至尊场"
        }

        // 结果文本
        resultText := "未知"
        if r.Result == 1 {
                resultText = "地主胜"
        } else if r.Result == 2 {
                resultText = "农民胜"
        }

        // 春天文本
        springText := ""
        if r.Spring == 1 {
                springText = "春天"
        } else if r.Spring == 2 {
                springText = "反春天"
        }

        // 游戏时长文本
        durationText := ""
        if r.DurationSeconds > 0 {
                minutes := r.DurationSeconds / 60
                seconds := r.DurationSeconds % 60
                if minutes > 0 {
                        durationText = string(rune(minutes)) + "分" + string(rune(seconds)) + "秒"
                } else {
                        durationText = string(rune(seconds)) + "秒"
                }
        }

        // 获取地主昵称
        landlordName := ""
        if r.LandlordID != "" {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.LandlordID).First(&player).Error; err == nil {
                        landlordName = player.Nickname
                }
        }

        // 获取农民1昵称
        farmer1Name := ""
        if r.Farmer1ID != "" {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer1ID).First(&player).Error; err == nil {
                        farmer1Name = player.Nickname
                }
        }

        // 获取农民2昵称
        farmer2Name := ""
        if r.Farmer2ID != "" {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer2ID).First(&player).Error; err == nil {
                        farmer2Name = player.Nickname
                }
        }

        // 获取玩家信息
        var players []ddzRes.DDZGamePlayerInfo
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
                ID:                   r.ID,
                RoomID:               r.RoomID,
                RoomType:             r.RoomType,
                RoomTypeName:         roomTypeName,
                RoomCategory:         r.RoomCategory,
                BaseScore:            r.BaseScore,
                Multiplier:           r.Multiplier,
                LandlordID:           r.LandlordID,
                LandlordName:         landlordName,
                Farmer1ID:            r.Farmer1ID,
                Farmer1Name:          farmer1Name,
                Farmer2ID:            r.Farmer2ID,
                Farmer2Name:          farmer2Name,
                Winner:               r.Result, // 兼容旧字段
                Result:               r.Result,
                ResultText:           resultText,
                Spring:               r.Spring,
                SpringText:           springText,
                BombCount:            r.BombCount,
                LandlordWinGold:      r.LandlordWinGold,
                Farmer1WinGold:       r.Farmer1WinGold,
                Farmer2WinGold:       r.Farmer2WinGold,
                LandlordWinArenaCoin: r.LandlordWinArenaCoin,
                Farmer1WinArenaCoin:  r.Farmer1WinArenaCoin,
                Farmer2WinArenaCoin:  r.Farmer2WinArenaCoin,
                GameDuration:         r.DurationSeconds,
                DurationText:         durationText,
                GameTime:             r.StartedAt,
                StartedAt:            r.StartedAt,
                EndedAt:              r.EndedAt,
                Players:              players,
                CreatedAt:            r.CreatedAt.Format("2006-01-02 15:04:05"),
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
        roomTypeName := "未知"
        switch c.RoomType {
        case 2:
                roomTypeName = "初级场"
        case 3:
                roomTypeName = "中级场"
        case 4:
                roomTypeName = "高级场"
        case 5:
                roomTypeName = "大师场"
        case 6:
                roomTypeName = "至尊场"
        }

        // 房间分类名称
        roomCategoryName := "普通场"
        if c.RoomCategory == 2 {
                roomCategoryName = "竞技场"
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
                ID:               c.ID,
                RoomName:         c.RoomName,
                RoomType:         c.RoomType,
                RoomTypeName:     roomTypeName,
                RoomCategory:     c.RoomCategory,
                RoomCategoryName: roomCategoryName,
                BaseScore:        c.BaseScore,
                Multiplier:       c.Multiplier,
                MinGold:          c.MinGold,
                MaxGold:          c.MaxGold,
                MinArenaCoin:     c.MinArenaCoin,
                MaxArenaCoin:     c.MaxArenaCoin,
                EntryGold:        c.MinGold, // 入场金币 = 最低入场金币
                BgImageNum:       bgImageNum,
                BotEnabled:       c.BotEnabled,
                BotCount:         c.BotCount,
                FeeRate:          c.FeeRate,
                MaxRound:         c.MaxRound,
                TimeoutSeconds:   c.TimeoutSeconds,
                Status:           c.Status,
                StatusText:       statusText,
                SortOrder:        c.SortOrder,
                Description:      c.Description,
                CreatedAt:        c.CreatedAt.Format("2006-01-02 15:04:05"),
                UpdatedAt:        c.UpdatedAt.Format("2006-01-02 15:04:05"),
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

        expireAt := c.ExpireAt.Format("2006-01-02 15:04:05")
        usedAt := ""
        if c.UsedAt != nil {
                usedAt = c.UsedAt.Format("2006-01-02 15:04:05")
        }

        return ddzRes.DDZSmsCodeResponse{
                ID:         c.ID,
                Phone:      c.Phone,
                Code:       c.Code,
                Type:       c.Type,
                TypeText:   typeText,
                IsUsed:     c.IsUsed,
                IsUsedText: isUsedText,
                ExpireAt:   expireAt,
                UsedAt:     usedAt,
                IP:         c.IP,
                CreatedAt:  c.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

func (s *DDZGameLogService) toRoomResponse(r ddz.DDZRoom) ddzRes.DDZRoomResponse {
        db := GetDDZDB()

        // 房间类型名称
        roomTypeName := "未知"
        switch r.RoomType {
        case 1:
                roomTypeName = "新手场"
        case 2:
                roomTypeName = "普通场"
        case 3:
                roomTypeName = "高级场"
        case 4:
                roomTypeName = "富豪场"
        case 5:
                roomTypeName = "至尊场"
        }

        // 房间分类名称
        roomCategoryName := "普通场"
        if r.RoomCategory == 2 {
                roomCategoryName = "竞技场"
        }

        // 房间状态文本
        statusText := "未知"
        switch r.Status {
        case 1:
                statusText = "等待中"
        case 2:
                statusText = "游戏中"
        case 3:
                statusText = "已结束"
        }

        // 获取创建者昵称
        creatorName := ""
        if r.CreatorID != "" {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.CreatorID).First(&player).Error; err == nil {
                        creatorName = player.Nickname
                }
        }

        // 解析玩家列表
        var players []ddzRes.DDZRoomPlayer
        if r.Players != "" {
                // 这里可以解析JSON格式的玩家列表
                // 暂时留空
        }

        return ddzRes.DDZRoomResponse{
                ID:               r.ID,
                RoomID:           r.RoomID,
                RoomConfigID:     r.RoomConfigID,
                RoomName:         r.RoomName,
                RoomType:         r.RoomType,
                RoomTypeName:     roomTypeName,
                RoomCategory:     r.RoomCategory,
                RoomCategoryName: roomCategoryName,
                Status:           r.Status,
                StatusText:       statusText,
                PlayerCount:      r.PlayerCount,
                MaxPlayers:       r.MaxPlayers,
                CreatorID:        r.CreatorID,
                CreatorName:      creatorName,
                Players:          players,
                BaseScore:        r.BaseScore,
                Multiplier:       r.Multiplier,
                CurrentGameID:    r.CurrentGameID,
                StartedAt:        r.StartedAt,
                EndedAt:          r.EndedAt,
                CreatedAt:        r.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// gameRecordToResponse 将分表游戏记录转换为响应格式
func (s *DDZGameLogService) gameRecordToResponse(r GameRecord) ddzRes.DDZGameRecordResponse {
        db := GetDDZDB()

        // 房间类型名称
        roomTypeName := "未知"
        switch r.RoomType {
        case 2:
                roomTypeName = "初级场"
        case 3:
                roomTypeName = "中级场"
        case 4:
                roomTypeName = "高级场"
        case 5:
                roomTypeName = "大师场"
        case 6:
                roomTypeName = "至尊场"
        }

        // 结果文本
        resultText := "未知"
        if r.Result == 1 {
                resultText = "地主胜"
        } else if r.Result == 2 {
                resultText = "农民胜"
        }

        // 春天文本
        springText := ""
        if r.Spring == 1 {
                springText = "春天"
        } else if r.Spring == 2 {
                springText = "反春天"
        }

        // 游戏时长文本
        durationText := ""
        if r.DurationSeconds > 0 {
                minutes := r.DurationSeconds / 60
                seconds := r.DurationSeconds % 60
                if minutes > 0 {
                        durationText = fmt.Sprintf("%d分%d秒", minutes, seconds)
                } else {
                        durationText = fmt.Sprintf("%d秒", seconds)
                }
        }

        // 获取地主昵称
        landlordName := ""
        if r.LandlordID > 0 {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.LandlordID).First(&player).Error; err == nil {
                        landlordName = player.Nickname
                }
        }

        // 获取农民昵称
        farmer1Name := ""
        if r.Farmer1ID > 0 {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer1ID).First(&player).Error; err == nil {
                        farmer1Name = player.Nickname
                }
        }

        farmer2Name := ""
        if r.Farmer2ID > 0 {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer2ID).First(&player).Error; err == nil {
                        farmer2Name = player.Nickname
                }
        }

        // 处理时间字段
        startedAtStr := r.StartedAt.Format("2006-01-02 15:04:05")
        endedAtStr := ""
        if r.EndedAt != nil {
                endedAtStr = r.EndedAt.Format("2006-01-02 15:04:05")
        }

        return ddzRes.DDZGameRecordResponse{
                ID:                   uint(r.ID),
                RoomID:               r.RoomID,
                RoomType:             int(r.RoomType),
                RoomTypeName:         roomTypeName,
                RoomCategory:         int(r.RoomCategory),
                BaseScore:            r.BaseScore,
                Multiplier:           r.Multiplier,
                LandlordID:           fmt.Sprintf("%d", r.LandlordID),
                LandlordName:         landlordName,
                Farmer1ID:            fmt.Sprintf("%d", r.Farmer1ID),
                Farmer1Name:          farmer1Name,
                Farmer2ID:            fmt.Sprintf("%d", r.Farmer2ID),
                Farmer2Name:          farmer2Name,
                Winner:               int(r.Result),
                Result:               int(r.Result),
                ResultText:           resultText,
                Spring:               int(r.Spring),
                SpringText:           springText,
                BombCount:            r.BombCount,
                LandlordWinGold:      r.LandlordWinGold,
                Farmer1WinGold:       r.Farmer1WinGold,
                Farmer2WinGold:       r.Farmer2WinGold,
                LandlordWinArenaCoin: r.LandlordWinArenaCoin,
                Farmer1WinArenaCoin:  r.Farmer1WinArenaCoin,
                Farmer2WinArenaCoin:  r.Farmer2WinArenaCoin,
                GameDuration:         r.DurationSeconds,
                DurationText:         durationText,
                GameTime:             startedAtStr,
                StartedAt:            startedAtStr,
                EndedAt:              endedAtStr,
                Players:              []ddzRes.DDZGamePlayerInfo{},
                CreatedAt:            r.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// GameRecord 分表游戏记录结构体
type GameRecord struct {
        ID                   uint64     `json:"id"`
        GameID               string     `json:"game_id"`
        RoomID               string     `json:"room_id"`
        RoomCode             string     `json:"room_code"`
        RoomType             uint8      `json:"room_type"`
        RoomCategory         uint8      `json:"room_category"`
        LandlordID           uint64     `json:"landlord_id"`
        Farmer1ID            uint64     `json:"farmer1_id"`
        Farmer2ID            uint64     `json:"farmer2_id"`
        BaseScore            int        `json:"base_score"`
        Multiplier           int        `json:"multiplier"`
        BombCount            int        `json:"bomb_count"`
        Spring               uint8      `json:"spring"`
        Result               uint8      `json:"result"`
        LandlordWinGold      int64      `json:"landlord_win_gold"`
        Farmer1WinGold       int64      `json:"farmer1_win_gold"`
        Farmer2WinGold       int64      `json:"farmer2_win_gold"`
        LandlordWinArenaCoin int64      `json:"landlord_win_arena_coin"`
        Farmer1WinArenaCoin  int64      `json:"farmer1_win_arena_coin"`
        Farmer2WinArenaCoin  int64      `json:"farmer2_win_arena_coin"`
        StartedAt            time.Time  `json:"started_at"`
        EndedAt              *time.Time `json:"ended_at"`
        DurationSeconds      int        `json:"duration_seconds"`
        CreatedAt            time.Time  `json:"created_at"`
}

// RoomRecord 分表房间记录结构体
type RoomRecord struct {
        ID           uint64     `json:"id"`
        RoomCode     string     `json:"room_code"`
        RoomName     string     `json:"room_name"`
        RoomConfigID uint64     `json:"room_config_id"`
        RoomType     uint8      `json:"room_type"`
        RoomCategory uint8      `json:"room_category"`
        CreatorID    uint64     `json:"creator_id"`
        PlayerCount  int        `json:"player_count"`
        MaxPlayers   int        `json:"max_players"`
        Status       uint8      `json:"status"`
        BaseScore    int        `json:"base_score"`
        Multiplier   int        `json:"multiplier"`
        CreatedAt    time.Time  `json:"created_at"`
        UpdatedAt    time.Time  `json:"updated_at"`
        EndedAt      *time.Time `json:"ended_at"`
}

// roomRecordToResponse 将分表房间记录转换为响应格式
func (s *DDZGameLogService) roomRecordToResponse(r RoomRecord) ddzRes.DDZRoomResponse {
        db := GetDDZDB()

        // 房间类型名称
        roomTypeName := "未知"
        switch r.RoomType {
        case 1:
                roomTypeName = "新手场"
        case 2:
                roomTypeName = "普通场"
        case 3:
                roomTypeName = "高级场"
        case 4:
                roomTypeName = "富豪场"
        case 5:
                roomTypeName = "至尊场"
        }

        // 房间分类名称
        roomCategoryName := "普通场"
        if r.RoomCategory == 2 {
                roomCategoryName = "竞技场"
        }

        // 房间状态文本
        statusText := "未知"
        switch r.Status {
        case 1:
                statusText = "等待中"
        case 2:
                statusText = "游戏中"
        case 3:
                statusText = "已结束"
        }

        // 获取创建者昵称
        creatorName := ""
        if r.CreatorID > 0 {
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.CreatorID).First(&player).Error; err == nil {
                        creatorName = player.Nickname
                }
        }

        // 处理时间字段
        startedAtStr := ""
        endedAtStr := ""
        if r.EndedAt != nil {
                endedAtStr = r.EndedAt.Format("2006-01-02 15:04:05")
        }

        return ddzRes.DDZRoomResponse{
                ID:               uint(r.ID),
                RoomID:           r.RoomCode,
                RoomConfigID:     uint(r.RoomConfigID),
                RoomName:         r.RoomName,
                RoomType:         int(r.RoomType),
                RoomTypeName:     roomTypeName,
                RoomCategory:     int(r.RoomCategory),
                RoomCategoryName: roomCategoryName,
                Status:           int(r.Status),
                StatusText:       statusText,
                PlayerCount:      r.PlayerCount,
                MaxPlayers:       r.MaxPlayers,
                CreatorID:        fmt.Sprintf("%d", r.CreatorID),
                CreatorName:      creatorName,
                Players:          []ddzRes.DDZRoomPlayer{},
                BaseScore:        r.BaseScore,
                Multiplier:       r.Multiplier,
                CurrentGameID:    "",
                StartedAt:        startedAtStr,
                EndedAt:          endedAtStr,
                CreatedAt:        r.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}
