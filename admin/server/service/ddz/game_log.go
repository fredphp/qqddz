package ddz

import (
        "context"
        "encoding/json"
        "errors"
        "fmt"
        "strconv"
        "time"

        "gorm.io/datatypes"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "go.uber.org/zap"
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
// 🔧【关键修复】默认查询当前月份的分表，因为游戏服务器将数据写入分表
func (s *DDZGameLogService) GetGameRecordList(req ddzReq.DDZGameRecordSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 🔧【关键修复】默认查询当前月份的分表（游戏服务器将数据写入分表）
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
// 支持分表查询，month参数格式: 202605
func (s *DDZGameLogService) GetGameRecordDetail(id uint, month string) (ddzRes.DDZGameRecordDetailResponse, error) {
        db := GetDDZDB()

        // 确定查询的分表
        if month == "" {
                month = getCurrentMonth()
        }
        gameRecordTable := getTableNameWithMonth("ddz_game_records", month)
        bidLogTable := getTableNameWithMonth("ddz_bid_logs", month)
        dealLogTable := getTableNameWithMonth("ddz_deal_logs", month)
        playLogTable := getTableNameWithMonth("ddz_play_logs", month)

        // 检查游戏记录分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", gameRecordTable).Scan(&tableCount)
        if tableCount == 0 {
                return ddzRes.DDZGameRecordDetailResponse{}, errors.New("游戏记录不存在")
        }

        // 查询游戏记录
        var record GameRecord
        err := db.Table(gameRecordTable).Where("id = ?", id).First(&record).Error
        if err != nil {
                return ddzRes.DDZGameRecordDetailResponse{}, err
        }

        resp := ddzRes.DDZGameRecordDetailResponse{
                GameRecord: s.gameRecordToResponse(record),
        }

        // 获取叫地主日志
        var bidLogs []BidLog
        db.Table(bidLogTable).Where("game_id = ?", record.GameID).Order("bid_order asc").Find(&bidLogs)
        resp.BidLogs = make([]ddzRes.DDZBidLogResponse, 0, len(bidLogs))
        for _, bl := range bidLogs {
                resp.BidLogs = append(resp.BidLogs, s.bidLogToResponse(bl))
        }

        // 获取发牌日志
        var dealLogs []DealLog
        db.Table(dealLogTable).Where("game_id = ?", record.GameID).Order("id asc").Find(&dealLogs)
        resp.DealLogs = make([]ddzRes.DDZDealLogResponse, 0, len(dealLogs))
        for _, dl := range dealLogs {
                resp.DealLogs = append(resp.DealLogs, s.dealLogToResponse(dl))
        }

        // 获取出牌日志
        var playLogs []PlayLog
        db.Table(playLogTable).Where("game_id = ?", record.GameID).Order("round_num asc, play_order asc").Find(&playLogs)
        resp.PlayLogs = make([]ddzRes.DDZPlayLogResponse, 0, len(playLogs))
        for _, pl := range playLogs {
                resp.PlayLogs = append(resp.PlayLogs, s.playLogToResponse(pl))
        }

        return resp, nil
}

// DeleteGameRecord 删除游戏记录
func (s *DDZGameLogService) DeleteGameRecord(id uint) error {
        db := GetDDZDB()
        return db.Delete(&ddz.DDZGameRecord{}, id).Error
}

// GetBidLogList 获取叫地主日志列表
// 🔧【关键修复】默认查询当前月份的分表，因为游戏服务器将数据写入分表
func (s *DDZGameLogService) GetBidLogList(req ddzReq.DDZBidLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 🔧【关键修复】默认查询当前月份的分表（游戏服务器将数据写入分表）
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_bid_logs", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                // 分表不存在，返回空结果
                return []ddzRes.DDZBidLogResponse{}, 0, nil
        }

        query := db.Table(tableName)

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

        var logs []BidLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        logList := make([]ddzRes.DDZBidLogResponse, 0, len(logs))
        for _, l := range logs {
                logList = append(logList, s.bidLogToResponse(l))
        }

        return logList, total, nil
}

// GetDealLogList 获取发牌日志列表
// 🔧【关键修复】默认查询当前月份的分表，因为游戏服务器将数据写入分表
func (s *DDZGameLogService) GetDealLogList(req ddzReq.DDZDealLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 🔧【关键修复】默认查询当前月份的分表（游戏服务器将数据写入分表）
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_deal_logs", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                // 分表不存在，返回空结果
                return []ddzRes.DDZDealLogResponse{}, 0, nil
        }

        query := db.Table(tableName)

        if req.GameID != "" {
                query = query.Where("game_id = ?", req.GameID)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []DealLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        logList := make([]ddzRes.DDZDealLogResponse, 0, len(logs))
        for _, l := range logs {
                logList = append(logList, s.dealLogToResponse(l))
        }

        return logList, total, nil
}

// GetPlayLogList 获取出牌日志列表
// 🔧【关键修复】默认查询当前月份的分表，因为游戏服务器将数据写入分表
func (s *DDZGameLogService) GetPlayLogList(req ddzReq.DDZPlayLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 🔧【关键修复】默认查询当前月份的分表（游戏服务器将数据写入分表）
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_play_logs", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                // 分表不存在，返回空结果
                return []ddzRes.DDZPlayLogResponse{}, 0, nil
        }

        query := db.Table(tableName)

        if req.GameID != "" {
                query = query.Where("game_id = ?", req.GameID)
        }
        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.PlayType != nil {
                query = query.Where("play_type = ?", *req.PlayType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []PlayLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        logList := make([]ddzRes.DDZPlayLogResponse, 0, len(logs))
        for _, l := range logs {
                logList = append(logList, s.playLogToResponse(l))
        }

        return logList, total, nil
}

// GetPlayerStatList 获取玩家统计列表
// 🔧【修复】从 ddz_players 表获取统计数据（win_count, lose_count 等字段存储在玩家表中）
func (s *DDZGameLogService) GetPlayerStatList(req ddzReq.DDZPlayerStatSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZPlayer{})

        // 支持按ID或用户名搜索
        if req.PlayerID != "" {
                // 尝试解析为数字ID
                if id, err := strconv.ParseUint(req.PlayerID, 10, 64); err == nil {
                        query = query.Where("id = ?", id)
                } else {
                        // 非数字则按用户名或昵称搜索
                        query = query.Where("username = ? OR nickname LIKE ?", req.PlayerID, "%"+req.PlayerID+"%")
                }
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

        var players []ddz.DDZPlayer
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&players).Error
        if err != nil {
                return nil, 0, err
        }

        // 转换为统计响应格式
        result := make([]ddzRes.DDZPlayerStatResponse, 0, len(players))
        for _, p := range players {
                winRate := 0.0
                totalGames := p.WinCount + p.LoseCount
                if totalGames > 0 {
                        winRate = float64(p.WinCount) / float64(totalGames) * 100
                }
                
                // 计算角色胜率
                landlordWinRate := 0.0
                if p.LandlordCount > 0 {
                        landlordWinRate = float64(p.WinCount) / float64(p.LandlordCount) * 100 // 简化计算
                }
                farmerWinRate := 0.0
                if p.FarmerCount > 0 {
                        farmerWinRate = float64(p.WinCount) / float64(p.FarmerCount) * 100 // 简化计算
                }
                
                result = append(result, ddzRes.DDZPlayerStatResponse{
                        PlayerID:        uint64(p.ID),
                        PlayerName:      p.Nickname,
                        PlayerAvatar:    p.Avatar,
                        StatDate:        p.CreatedAt.Format("2006-01-02"),
                        TotalGames:      totalGames,
                        WinGames:        p.WinCount,
                        LoseGames:       p.LoseCount,
                        WinRate:         winRate,
                        LandlordGames:   p.LandlordCount,
                        LandlordWins:    p.WinCount / 3 * 1, // 简化计算
                        LandlordWinRate: landlordWinRate,
                        FarmerGames:     p.FarmerCount,
                        FarmerWins:      p.WinCount / 3 * 2, // 简化计算
                        FarmerWinRate:   farmerWinRate,
                        CurrentGold:     p.Gold,        // 当前金币余额
                        VipLevel:        p.VIPLevel,    // VIP等级
                        CreatedAt:       p.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
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
                RoomName:           req.RoomName,
                RoomType:           req.RoomType,
                RoomCategory:       roomCategory,
                BaseScore:          req.BaseScore,
                Multiplier:         req.Multiplier,
                MinGold:            req.MinGold,
                MaxGold:            req.MaxGold,
                MinArenaCoin:       req.MinArenaCoin,
                MaxArenaCoin:       req.MaxArenaCoin,
                BgImageNum:         bgImageNum,
                BotEnabled:         req.BotEnabled,
                BotCount:           req.BotCount,
                FeeRate:            req.FeeRate,
                MaxRound:           req.MaxRound,
                TimeoutSeconds:     req.TimeoutSeconds,
                Status:             req.Status,
                SortOrder:          req.SortOrder,
                Description:        req.Description,
                MatchTimeRanges:    datatypes.JSON([]byte(req.MatchTimeRanges)), // string 转换为 []byte 再转为 datatypes.JSON
                MatchRoundDuration: req.MatchRoundDuration,
                MatchRoundCount:    req.MatchRoundCount,
                MaxPlayers:         req.MaxPlayers,
                MinPlayers:         req.MinPlayers,
                ChampionRewardID:   req.ChampionRewardID,
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

        // 竞技场专属字段
        // match_time_ranges 是JSON类型字段，需要使用 datatypes.JSON
        // 优先使用蛇形命名字段（match_time_ranges），如果为空则使用驼峰命名（matchTimeRanges）
        var matchTimeRangesJSON datatypes.JSON
        if len(req.MatchTimeRangesAlt) > 0 {
                // 使用蛇形命名字段的值（json.RawMessage 是 []byte 类型）
                matchTimeRangesJSON = datatypes.JSON(req.MatchTimeRangesAlt)
                global.GVA_LOG.Info("使用蛇形命名字段", zap.String("match_time_ranges", string(req.MatchTimeRangesAlt)))
        } else if req.MatchTimeRanges != "" {
                // 将 string 转换为 []byte 再转为 datatypes.JSON
                matchTimeRangesJSON = datatypes.JSON([]byte(req.MatchTimeRanges))
                global.GVA_LOG.Info("使用驼峰命名字段", zap.String("matchTimeRanges", req.MatchTimeRanges))
        } else {
                global.GVA_LOG.Info("两个字段都为空")
        }
        // 对于MySQL JSON类型字段，空值需要设置为nil
        if len(matchTimeRangesJSON) == 0 || string(matchTimeRangesJSON) == "null" || string(matchTimeRangesJSON) == "\"\"" {
                updates["match_time_ranges"] = nil
                global.GVA_LOG.Info("设置match_time_ranges为nil")
        } else {
                // 直接使用 datatypes.JSON
                updates["match_time_ranges"] = matchTimeRangesJSON
                global.GVA_LOG.Info("设置match_time_ranges", zap.String("value", string(matchTimeRangesJSON)))
        }
        
        // 其他字段优先使用蛇形命名
        matchRoundDuration := req.MatchRoundDurationAlt
        if matchRoundDuration == 0 {
                matchRoundDuration = req.MatchRoundDuration
        }
        updates["match_round_duration"] = matchRoundDuration
        
        matchRoundCount := req.MatchRoundCountAlt
        if matchRoundCount == 0 {
                matchRoundCount = req.MatchRoundCount
        }
        updates["match_round_count"] = matchRoundCount
        
        maxPlayers := req.MaxPlayersAlt
        if maxPlayers == 0 {
                maxPlayers = req.MaxPlayers
        }
        updates["max_players"] = maxPlayers
        
        minPlayers := req.MinPlayersAlt
        if minPlayers == 0 {
                minPlayers = req.MinPlayers
        }
        updates["min_players"] = minPlayers
        
        // ChampionRewardID 需要特殊处理
        if req.ChampionRewardIDAlt != nil {
                updates["champion_reward_id"] = req.ChampionRewardIDAlt
        } else if req.ChampionRewardID > 0 {
                updates["champion_reward_id"] = req.ChampionRewardID
        } else {
                updates["champion_reward_id"] = nil
        }

        err = db.Model(&config).Updates(updates).Error
        if err != nil {
                return err
        }

        // 更新成功后，直接将最新配置按server端格式写入Redis
        // 这样server端可以直接读取，无需清除缓存或调用API
        if err := s.SyncRoomConfigCacheToRedis(); err != nil {
                global.GVA_LOG.Error("同步房间配置到Redis失败", zap.Error(err))
        } else {
                global.GVA_LOG.Info("更新房间配置后成功同步到Redis", zap.Uint("configID", req.ID))
        }

        return nil
}

// SyncRoomConfigCacheToRedis 同步房间配置到Redis（按server端格式）
func (s *DDZGameLogService) SyncRoomConfigCacheToRedis() error {
        if global.GVA_REDIS == nil {
                global.GVA_LOG.Warn("Redis未配置，无法同步房间配置缓存")
                return nil
        }

        db := GetDDZDB()
        var configs []ddz.DDZRoomConfig
        if err := db.Where("status = 1 AND deleted_at IS NULL").Order("sort_order ASC").Find(&configs).Error; err != nil {
                return fmt.Errorf("查询房间配置失败: %w", err)
        }

        global.GVA_LOG.Info("从数据库读取到房间配置", zap.Int("count", len(configs)))

        // 转换为server端期望的格式
        type ServerRoomConfig struct {
                ID                 uint   `json:"id"`
                RoomName           string `json:"room_name"`
                RoomType           int    `json:"room_type"`
                RoomCategory       int    `json:"room_category"`
                BaseScore          int    `json:"base_score"`
                Multiplier         int    `json:"multiplier"`
                MinGold            int64  `json:"min_gold"`
                MaxGold            int64  `json:"max_gold"`
                MinArenaCoin       int64  `json:"min_arena_coin"`
                MaxArenaCoin       int64  `json:"max_arena_coin"`
                EntryGold          int64  `json:"entry_gold"`
                BgImageNum         int    `json:"bg_image_num"`
                Description        string `json:"description"`
                Status             int    `json:"status"`
                SortOrder          int    `json:"sort_order"`
                MatchTimeRanges    string `json:"matchTimeRanges"`    // 驼峰命名，server端期望
                MatchRoundDuration int    `json:"matchDuration"`      // 驼峰命名，server端期望
                MatchRoundCount    int    `json:"matchRoundCount"`
                MaxPlayers         int    `json:"maxPlayers"`
                MinPlayers         int    `json:"minPlayers"`
                ChampionRewardID   uint   `json:"championRewardId"`
        }

        serverConfigs := make([]ServerRoomConfig, 0, len(configs))
        for _, c := range configs {
                // 将 datatypes.JSON 转换为 string
                matchTimeRangesStr := ""
                if c.MatchTimeRanges != nil {
                        matchTimeRangesStr = string(c.MatchTimeRanges)
                }

                // 记录每条配置的详细信息
                global.GVA_LOG.Info("房间配置详情",
                        zap.Uint("ID", c.ID),
                        zap.String("room_name", c.RoomName),
                        zap.Int("room_category", c.RoomCategory),
                        zap.String("matchTimeRanges", matchTimeRangesStr),
                        zap.Int("matchDuration", c.MatchRoundDuration),
                )

                serverConfigs = append(serverConfigs, ServerRoomConfig{
                        ID:                 c.ID,
                        RoomName:           c.RoomName,
                        RoomType:           c.RoomType,
                        RoomCategory:       c.RoomCategory,
                        BaseScore:          c.BaseScore,
                        Multiplier:         c.Multiplier,
                        MinGold:            c.MinGold,
                        MaxGold:            c.MaxGold,
                        MinArenaCoin:       c.MinArenaCoin,
                        MaxArenaCoin:       c.MaxArenaCoin,
                        EntryGold:          c.MinGold, // 入场豆子等于最低入场金币
                        BgImageNum:         c.BgImageNum,
                        Description:        c.Description,
                        Status:             c.Status,
                        SortOrder:          c.SortOrder,
                        MatchTimeRanges:    matchTimeRangesStr,
                        MatchRoundDuration: c.MatchRoundDuration,
                        MatchRoundCount:    c.MatchRoundCount,
                        MaxPlayers:         c.MaxPlayers,
                        MinPlayers:         c.MinPlayers,
                        ChampionRewardID:   c.ChampionRewardID,
                })
        }

        // 序列化并写入Redis
        data, err := json.Marshal(serverConfigs)
        if err != nil {
                return fmt.Errorf("序列化房间配置失败: %w", err)
        }

        // 打印写入Redis的数据摘要
        dataPreview := string(data)
        if len(dataPreview) > 500 {
                dataPreview = dataPreview[:500] + "..."
        }
        global.GVA_LOG.Info("准备写入Redis的数据", zap.String("data", dataPreview))

        ctx := context.Background()
        if err := global.GVA_REDIS.Set(ctx, "ddz:room_config:list", string(data), 24*time.Hour).Err(); err != nil {
                return fmt.Errorf("写入Redis失败: %w", err)
        }

        // 验证写入是否成功
        cached, err := global.GVA_REDIS.Get(ctx, "ddz:room_config:list").Result()
        if err != nil {
                global.GVA_LOG.Error("验证Redis写入失败", zap.Error(err))
        } else {
                cachedPreview := cached
                if len(cachedPreview) > 500 {
                        cachedPreview = cachedPreview[:500] + "..."
                }
                global.GVA_LOG.Info("验证Redis写入成功", zap.String("cached_data", cachedPreview))
        }

        global.GVA_LOG.Info("房间配置已同步到Redis", zap.Int("count", len(serverConfigs)))
        return nil
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
// 需要传入月份参数来确定查询哪个分表，如果不传则查询当前月份
func (s *DDZGameLogService) GetRoomDetail(id uint, month string) (ddzRes.DDZRoomResponse, error) {
        db := GetDDZDB()

        // 确定查询的分表
        if month == "" {
                month = getCurrentMonth()
        }
        tableName := getTableNameWithMonth("ddz_rooms", month)

        // 检查分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
        if tableCount == 0 {
                return ddzRes.DDZRoomResponse{}, errors.New("房间不存在")
        }

        var room RoomRecord
        err := db.Table(tableName).Where("id = ?", id).First(&room).Error
        if err != nil {
                return ddzRes.DDZRoomResponse{}, err
        }
        return s.roomRecordToResponse(room), nil
}

// DeleteRoom 删除房间
func (s *DDZGameLogService) DeleteRoom(id uint) error {
        db := GetDDZDB()
        return db.Delete(&ddz.DDZRoom{}, id).Error
}

// GetGameRoomConfigOptions 获取游戏房间配置选项列表（供下拉选择使用）
func (s *DDZGameLogService) GetGameRoomConfigOptions() ([]map[string]interface{}, error) {
        db := GetDDZDB()
        var configs []ddz.DDZRoomConfig
        err := db.Where("status = 1").Order("room_category desc, sort_order asc, id asc").Find(&configs).Error
        if err != nil {
                return nil, err
        }

        options := []map[string]interface{}{}
        for _, config := range configs {
                options = append(options, map[string]interface{}{
                        "value":       config.ID,
                        "label":       config.RoomName,
                        "roomType":    config.RoomType,
                        "roomCategory": config.RoomCategory,
                        "description": config.Description,
                })
        }
        return options, nil
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
                        durationText = fmt.Sprintf("%d分%d秒", minutes, seconds)
                } else {
                        durationText = fmt.Sprintf("%d秒", seconds)
                }
        }

        // 🔧【修复】获取地主昵称 - LandlordID 现在是 uint64 类型
        landlordName := ""
        landlordIDStr := ""
        if r.LandlordID != 0 {
                landlordIDStr = fmt.Sprintf("%d", r.LandlordID)
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.LandlordID).First(&player).Error; err == nil {
                        landlordName = player.Nickname
                }
        }

        // 🔧【修复】获取农民1昵称 - Farmer1ID 现在是 uint64 类型
        farmer1Name := ""
        farmer1IDStr := ""
        if r.Farmer1ID != 0 {
                farmer1IDStr = fmt.Sprintf("%d", r.Farmer1ID)
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer1ID).First(&player).Error; err == nil {
                        farmer1Name = player.Nickname
                }
        }

        // 🔧【修复】获取农民2昵称 - Farmer2ID 现在是 uint64 类型
        farmer2Name := ""
        farmer2IDStr := ""
        if r.Farmer2ID != 0 {
                farmer2IDStr = fmt.Sprintf("%d", r.Farmer2ID)
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.Farmer2ID).First(&player).Error; err == nil {
                        farmer2Name = player.Nickname
                }
        }

        // 🔧【修复】时间格式化 - StartedAt 现在是 time.Time 类型
        startedAtStr := ""
        if !r.StartedAt.IsZero() {
                startedAtStr = r.StartedAt.Format("2006-01-02 15:04:05")
        }

        // 🔧【修复】时间格式化 - EndedAt 现在是 *time.Time 类型
        endedAtStr := ""
        if r.EndedAt != nil && !r.EndedAt.IsZero() {
                endedAtStr = r.EndedAt.Format("2006-01-02 15:04:05")
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
                LandlordID:           landlordIDStr,  // 🔧【修复】转换为字符串
                LandlordName:         landlordName,
                Farmer1ID:            farmer1IDStr,   // 🔧【修复】转换为字符串
                Farmer1Name:          farmer1Name,
                Farmer2ID:            farmer2IDStr,   // 🔧【修复】转换为字符串
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
                GameTime:             startedAtStr,
                StartedAt:            startedAtStr,
                EndedAt:              endedAtStr,
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
                ID:                 c.ID,
                RoomName:           c.RoomName,
                RoomType:           c.RoomType,
                RoomTypeName:       roomTypeName,
                RoomCategory:       c.RoomCategory,
                RoomCategoryName:   roomCategoryName,
                BaseScore:          c.BaseScore,
                Multiplier:         c.Multiplier,
                MinGold:            c.MinGold,
                MaxGold:            c.MaxGold,
                MinArenaCoin:       c.MinArenaCoin,
                MaxArenaCoin:       c.MaxArenaCoin,
                EntryGold:          c.MinGold, // 入场金币 = 最低入场金币
                BgImageNum:         bgImageNum,
                BotEnabled:         c.BotEnabled,
                BotCount:           c.BotCount,
                FeeRate:            c.FeeRate,
                MaxRound:           c.MaxRound,
                TimeoutSeconds:     c.TimeoutSeconds,
                Status:             c.Status,
                StatusText:         statusText,
                SortOrder:          c.SortOrder,
                Description:        c.Description,
                MatchTimeRanges:    string(c.MatchTimeRanges), // datatypes.JSON 转换为 string
                MatchRoundDuration: c.MatchRoundDuration,
                MatchRoundCount:    c.MatchRoundCount,
                MaxPlayers:         c.MaxPlayers,
                MinPlayers:         c.MinPlayers,
                ChampionRewardID:   c.ChampionRewardID,
                CreatedAt:          c.CreatedAt.Format("2006-01-02 15:04:05"),
                UpdatedAt:          c.UpdatedAt.Format("2006-01-02 15:04:05"),
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
        } else if r.RoomCategory == 0 {
                roomCategoryName = "未知"
        }

        // 房间状态文本
        // 状态值：0-已关闭, 1-等待中, 2-游戏中, 3-已结束
        // 如果玩家数为0，也显示已关闭
        statusText := "未知"
        if r.PlayerCount == 0 {
                statusText = "已关闭"
        } else {
                switch r.Status {
                case 0:
                        statusText = "已关闭"
                case 1:
                        statusText = "等待中"
                case 2:
                        statusText = "游戏中"
                case 3:
                        statusText = "已结束"
                }
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

// DealLog 分表发牌日志结构体
type DealLog struct {
        ID            uint64    `json:"id"`
        GameID        string    `json:"game_id"`
        PlayerID      uint64    `json:"player_id"`
        PlayerRole    uint8     `json:"player_role"`
        HandCards     string    `json:"hand_cards"`
        CardsCount    int       `json:"cards_count"`
        LandlordCards string    `json:"landlord_cards"`
        CreatedAt     time.Time `json:"created_at"`
}

// BidLog 分表叫地主日志结构体
type BidLog struct {
        ID        uint64    `json:"id"`
        GameID    string    `json:"game_id"`
        PlayerID  uint64    `json:"player_id"`
        BidOrder  int       `json:"bid_order"`
        BidType   int       `json:"bid_type"`
        BidScore  int       `json:"bid_score"`
        IsSuccess int       `json:"is_success"`
        CreatedAt time.Time `json:"created_at"`
}

// PlayLog 分表出牌日志结构体
type PlayLog struct {
        ID          uint64    `json:"id"`
        GameID      string    `json:"game_id"`
        PlayerID    uint64    `json:"player_id"`
        PlayerRole  uint8     `json:"player_role"`
        RoundNum    int       `json:"round_num"`
        PlayOrder   int       `json:"play_order"`
        PlayType    int       `json:"play_type"`
        Cards       string    `json:"cards"`
        CardsCount  int       `json:"cards_count"`
        CardPattern string    `json:"card_pattern"`
        IsBomb      int       `json:"is_bomb"`
        IsRocket    int       `json:"is_rocket"`
        CreatedAt   time.Time `json:"created_at"`
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
        } else if r.RoomCategory == 0 {
                roomCategoryName = "未知"
        }

        // 房间状态文本
        // 状态值：0-已关闭, 1-等待中, 2-游戏中, 3-已结束
        // 如果玩家数为0，也显示已关闭
        statusText := "未知"
        if r.PlayerCount == 0 {
                statusText = "已关闭"
        } else {
                switch r.Status {
                case 0:
                        statusText = "已关闭"
                case 1:
                        statusText = "等待中"
                case 2:
                        statusText = "游戏中"
                case 3:
                        statusText = "已结束"
                }
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

// 🔧【新增】叫地主日志转换方法
func (s *DDZGameLogService) toBidLogResponse(l ddz.DDZBidLog) ddzRes.DDZBidLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 叫地主类型文本
        bidTypeText := "不叫"
        switch l.BidType {
        case 1:
                bidTypeText = "叫地主"
        case 2:
                bidTypeText = "抢地主"
        }
        
        // 是否成功文本
        successText := "失败"
        if l.IsSuccess == 1 {
                successText = "成功"
        }
        
        return ddzRes.DDZBidLogResponse{
                ID:          l.ID,
                GameID:      l.GameID,
                PlayerID:    l.PlayerID,
                PlayerName:  playerName,
                BidOrder:    l.BidOrder,
                BidType:     l.BidType,
                BidTypeText: bidTypeText,
                BidScore:    l.BidScore,
                IsSuccess:   l.IsSuccess,
                SuccessText: successText,
                CreatedAt:   l.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// 🔧【新增】发牌日志转换方法
func (s *DDZGameLogService) toDealLogResponse(l ddz.DDZDealLog) ddzRes.DDZDealLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 玩家角色文本
        playerRoleText := "农民"
        if l.PlayerRole == 1 {
                playerRoleText = "地主"
        }
        
        return ddzRes.DDZDealLogResponse{
                ID:             l.ID,
                GameID:         l.GameID,
                PlayerID:       l.PlayerID,
                PlayerName:     playerName,
                PlayerRole:     l.PlayerRole,
                PlayerRoleText: playerRoleText,
                HandCards:      l.HandCards,
                CardsCount:     l.CardsCount,
                LandlordCards:  l.LandlordCards,
                CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// 🔧【新增】出牌日志转换方法
func (s *DDZGameLogService) toPlayLogResponse(l ddz.DDZPlayLog) ddzRes.DDZPlayLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 玩家角色文本
        playerRoleText := "农民"
        if l.PlayerRole == 1 {
                playerRoleText = "地主"
        }
        
        // 出牌类型文本
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
                PlayerName:     playerName,
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

// 🔧【新增】分表叫地主日志转换方法
func (s *DDZGameLogService) bidLogToResponse(l BidLog) ddzRes.DDZBidLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 叫地主类型文本
        bidTypeText := "不叫"
        switch l.BidType {
        case 1:
                bidTypeText = "叫地主"
        case 2:
                bidTypeText = "抢地主"
        }
        
        // 是否成功文本
        successText := "失败"
        if l.IsSuccess == 1 {
                successText = "成功"
        }
        
        return ddzRes.DDZBidLogResponse{
                ID:          uint(l.ID),
                GameID:      l.GameID,
                PlayerID:    l.PlayerID,
                PlayerName:  playerName,
                BidOrder:    l.BidOrder,
                BidType:     l.BidType,
                BidTypeText: bidTypeText,
                BidScore:    l.BidScore,
                IsSuccess:   l.IsSuccess,
                SuccessText: successText,
                CreatedAt:   l.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// 🔧【新增】分表发牌日志转换方法
func (s *DDZGameLogService) dealLogToResponse(l DealLog) ddzRes.DDZDealLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 玩家角色文本
        playerRoleText := "农民"
        if l.PlayerRole == 1 {
                playerRoleText = "地主"
        }
        
        return ddzRes.DDZDealLogResponse{
                ID:             uint(l.ID),
                GameID:         l.GameID,
                PlayerID:       l.PlayerID,
                PlayerName:     playerName,
                PlayerRole:     int(l.PlayerRole),
                PlayerRoleText: playerRoleText,
                HandCards:      l.HandCards,
                CardsCount:     l.CardsCount,
                LandlordCards:  l.LandlordCards,
                CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// 🔧【新增】分表出牌日志转换方法
func (s *DDZGameLogService) playLogToResponse(l PlayLog) ddzRes.DDZPlayLogResponse {
        db := GetDDZDB()
        
        // 获取玩家昵称
        playerName := ""
        var player ddz.DDZPlayer
        if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                playerName = player.Nickname
        }
        
        // 玩家角色文本
        playerRoleText := "农民"
        if l.PlayerRole == 1 {
                playerRoleText = "地主"
        }
        
        // 出牌类型文本
        playTypeText := "出牌"
        switch l.PlayType {
        case 2:
                playTypeText = "不出"
        case 3:
                playTypeText = "超时自动出牌"
        }
        
        return ddzRes.DDZPlayLogResponse{
                ID:             uint(l.ID),
                GameID:         l.GameID,
                PlayerID:       l.PlayerID,
                PlayerName:     playerName,
                PlayerRole:     int(l.PlayerRole),
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

// GetRoomGameRecords 获取房间内所有游戏记录（含详细日志）
// 用于房间详情页面展示活动日志
func (s *DDZGameLogService) GetRoomGameRecords(req ddzReq.DDZRoomGameRecordsSearch) (ddzRes.DDZRoomGameRecordsResponse, error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 确定查询的分表
        month := req.Month
        if month == "" {
                month = getCurrentMonth()
        }
        gameRecordTable := getTableNameWithMonth("ddz_game_records", month)
        bidLogTable := getTableNameWithMonth("ddz_bid_logs", month)
        dealLogTable := getTableNameWithMonth("ddz_deal_logs", month)
        playLogTable := getTableNameWithMonth("ddz_play_logs", month)

        // 检查游戏记录分表是否存在
        var tableCount int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", gameRecordTable).Scan(&tableCount)
        if tableCount == 0 {
                return ddzRes.DDZRoomGameRecordsResponse{
                        RoomCode:    req.RoomCode,
                        GameRecords: []ddzRes.DDZGameRecordWithLogsResponse{},
                        Total:       0,
                        Page:        req.Page,
                        PageSize:    req.PageSize,
                }, nil
        }

        // 查询该房间的游戏记录
        // 注意：游戏服务器将房间号存储在 room_id 字段（room_code 可能为空）
        // 所以需要同时查询 room_code 和 room_id 两个字段
        query := db.Table(gameRecordTable).Where("room_code = ? OR room_id = ?", req.RoomCode, req.RoomCode)

        var total int64
        err := query.Count(&total).Error
        if err != nil {
                return ddzRes.DDZRoomGameRecordsResponse{}, err
        }

        var records []GameRecord
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&records).Error
        if err != nil {
                return ddzRes.DDZRoomGameRecordsResponse{}, err
        }

        // 转换为响应格式，并获取详细日志
        gameRecords := make([]ddzRes.DDZGameRecordWithLogsResponse, 0, len(records))
        for _, r := range records {
                recordWithLogs := ddzRes.DDZGameRecordWithLogsResponse{
                        DDZGameRecordResponse: s.gameRecordToResponse(r),
                        BidLogs:               []ddzRes.DDZBidLogResponse{},
                        DealLogs:              []ddzRes.DDZDealLogResponse{},
                        PlayLogs:              []ddzRes.DDZPlayLogResponse{},
                }

                // 获取叫地主日志
                var bidLogs []BidLog
                db.Table(bidLogTable).Where("game_id = ?", r.GameID).Order("bid_order asc").Find(&bidLogs)
                for _, bl := range bidLogs {
                        recordWithLogs.BidLogs = append(recordWithLogs.BidLogs, s.bidLogToResponse(bl))
                }

                // 获取发牌日志
                var dealLogs []DealLog
                db.Table(dealLogTable).Where("game_id = ?", r.GameID).Order("id asc").Find(&dealLogs)
                for _, dl := range dealLogs {
                        recordWithLogs.DealLogs = append(recordWithLogs.DealLogs, s.dealLogToResponse(dl))
                }

                // 获取出牌日志
                var playLogs []PlayLog
                db.Table(playLogTable).Where("game_id = ?", r.GameID).Order("round_num asc, play_order asc").Find(&playLogs)
                for _, pl := range playLogs {
                        recordWithLogs.PlayLogs = append(recordWithLogs.PlayLogs, s.playLogToResponse(pl))
                }

                gameRecords = append(gameRecords, recordWithLogs)
        }

        // 获取房间名称
        roomName := ""
        roomsTable := getTableNameWithMonth("ddz_rooms", month)
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", roomsTable).Scan(&tableCount)
        if tableCount > 0 {
                var room RoomRecord
                // ddz_rooms 表中 room_code 字段有数据，直接用 room_code 查询
                if err := db.Table(roomsTable).Where("room_code = ?", req.RoomCode).First(&room).Error; err == nil {
                        roomName = room.RoomName
                }
        }

        return ddzRes.DDZRoomGameRecordsResponse{
                RoomCode:    req.RoomCode,
                RoomName:    roomName,
                TotalGames:  total,
                GameRecords: gameRecords,
                Total:       total,
                Page:        req.Page,
                PageSize:    req.PageSize,
        }, nil
}
