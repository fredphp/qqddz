package ddz

import (
        "context"
        "encoding/json"
        "errors"
        "fmt"
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        "go.uber.org/zap"
)

type DDZConfigService struct{}

var DDZConfigServiceApp = new(DDZConfigService)

// Redis缓存键
const (
        RoomConfigListCacheKey   = "ddz:room_config:list"
        RoomConfigDetailCacheKey = "ddz:room_config:detail:"
        RoomConfigCacheDuration  = 24 * time.Hour // 缓存24小时

        // 广告配置Redis缓存键（永不过期）
        AdConfigCacheKey = "ddz:ad_config"
)

// AdConfig 广告配置结构（用于Redis缓存）
type AdConfig struct {
        Enabled              bool     `json:"enabled"`
        NormalRewardGold     int      `json:"normal_reward_gold"`     // 普通场奖励豆子数量
        NormalDailyMaxCount  int      `json:"normal_daily_max_count"` // 普通场每日最大观看次数
        ArenaRewardCoins     int      `json:"arena_reward_coins"`     // 竞技场奖励竞技币数量
        ArenaDailyMaxCount   int      `json:"arena_daily_max_count"`  // 竞技场每日最大观看次数
        CooldownSeconds      int      `json:"cooldown_seconds"`       // 广告冷却时间（秒）
        SupportedSdks        []string `json:"supported_sdks"`         // 支持的广告SDK列表
        PrimarySdk           string   `json:"primary_sdk"`            // 默认优先SDK
        CsjAppId             string   `json:"csj_app_id"`             // 穿山甲AppId
        CsjRewardedVideoAdId string   `json:"csj_rewarded_video_ad_id"`
        YlhAppId             string   `json:"ylh_app_id"` // 优量汇AppId
        YlhRewardedVideoAdId string   `json:"ylh_rewarded_video_ad_id"`
        KsAppId              string   `json:"ks_app_id"` // 快手AppId
        KsRewardedVideoAdId  string   `json:"ks_rewarded_video_ad_id"`
        BdAppId              string   `json:"bd_app_id"` // 百度AppId
        BdRewardedVideoAdId  string   `json:"bd_rewarded_video_ad_id"`
}

// GetRoomConfigList 获取房间配置列表（ddz_room_configs 表）- 带Redis缓存
func (s *DDZConfigService) GetRoomConfigList(req ddzReq.DDZRoomConfigSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZRoomConfigs{})

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

        var configs []ddz.DDZRoomConfigs
        err = query.Limit(limit).Offset(offset).Order("sort asc, id asc").Find(&configs).Error
        if err != nil {
                return nil, 0, err
        }

        return configs, total, nil
}

// GetRoomConfigByID 根据ID获取房间配置
func (s *DDZConfigService) GetRoomConfigByID(id uint) (ddz.DDZRoomConfigs, error) {
        db := GetDDZDB()
        var config ddz.DDZRoomConfigs
        err := db.First(&config, id).Error
        return config, err
}

// CreateRoomConfig 创建房间配置（ddz_room_configs 表）- 创建后刷新缓存
func (s *DDZConfigService) CreateRoomConfig(req ddzReq.DDZRoomConfigCreate) error {
        db := GetDDZDB()
        
        // 设置默认背景图编号
        bgImageNum := req.BgImageNum
        if bgImageNum < ddz.BgImageNumMin || bgImageNum > ddz.BgImageNumMax {
                bgImageNum = ddz.BgImageNumMin // 默认使用编号2
        }
        
        config := ddz.DDZRoomConfigs{
                Name:        req.Name,
                RoomType:    req.RoomType,
                RoomLevel:   req.RoomLevel,
                BaseScore:   req.BaseScore,
                MinCoins:    req.MinCoins,
                MaxCoins:    req.MaxCoins,
                BgImageNum:  bgImageNum,
                ServiceFee:  req.ServiceFee,
                MaxMultiple: req.MaxMultiple,
                Timeout:     req.Timeout,
                AllowSpring: req.AllowSpring,
                AllowBomb:   req.AllowBomb,
                AllowRocket: req.AllowRocket,
                Status:      req.Status,
                Sort:        req.Sort,
                Description: req.Description,
        }
        
        err := db.Create(&config).Error
        if err != nil {
                return err
        }
        
        // 刷新缓存
        s.RefreshRoomConfigCache()
        
        return nil
}

// UpdateRoomConfig 更新房间配置（ddz_room_configs 表）- 更新后刷新缓存
func (s *DDZConfigService) UpdateRoomConfig(req ddzReq.DDZRoomConfigUpdate) error {
        db := GetDDZDB()
        var config ddz.DDZRoomConfigs
        err := db.First(&config, req.ID).Error
        if err != nil {
                return errors.New("房间配置不存在")
        }

        updates := map[string]interface{}{}
        if req.Name != "" {
                updates["name"] = req.Name
        }
        if req.RoomType > 0 {
                updates["room_type"] = req.RoomType
        }
        if req.RoomLevel > 0 {
                updates["room_level"] = req.RoomLevel
        }
        if req.BaseScore > 0 {
                updates["base_score"] = req.BaseScore
        }
        updates["min_coins"] = req.MinCoins
        updates["max_coins"] = req.MaxCoins
        
        // 更新背景图编号
        if req.BgImageNum >= ddz.BgImageNumMin && req.BgImageNum <= ddz.BgImageNumMax {
                updates["bg_image_num"] = req.BgImageNum
        }
        
        updates["service_fee"] = req.ServiceFee
        if req.MaxMultiple > 0 {
                updates["max_multiple"] = req.MaxMultiple
        }
        if req.Timeout > 0 {
                updates["timeout"] = req.Timeout
        }
        updates["allow_spring"] = req.AllowSpring
        updates["allow_bomb"] = req.AllowBomb
        updates["allow_rocket"] = req.AllowRocket
        updates["status"] = req.Status
        updates["sort"] = req.Sort
        updates["description"] = req.Description

        err = db.Model(&config).Updates(updates).Error
        if err != nil {
                return err
        }
        
        // 刷新缓存
        s.RefreshRoomConfigCache()
        
        return nil
}

// DeleteRoomConfig 删除房间配置（ddz_room_configs 表）- 删除后刷新缓存
func (s *DDZConfigService) DeleteRoomConfig(id uint) error {
        db := GetDDZDB()
        err := db.Delete(&ddz.DDZRoomConfigs{}, id).Error
        if err != nil {
                return err
        }
        
        // 刷新缓存
        s.RefreshRoomConfigCache()
        
        return nil
}

// RefreshRoomConfigCache 刷新房间配置缓存
// 直接从数据库读取最新配置，按server端格式写入Redis
func (s *DDZConfigService) RefreshRoomConfigCache() error {
        if global.GVA_REDIS == nil {
                global.GVA_LOG.Warn("Redis未配置，无法刷新房间配置缓存")
                return nil
        }

        db := GetDDZDB()
        var configs []ddz.DDZRoomConfig
        if err := db.Where("status = 1 AND deleted_at IS NULL").Order("sort_order ASC").Find(&configs).Error; err != nil {
                global.GVA_LOG.Error("查询房间配置失败", zap.Error(err))
                return err
        }

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
                global.GVA_LOG.Error("序列化房间配置失败", zap.Error(err))
                return err
        }

        ctx := context.Background()
        if err := global.GVA_REDIS.Set(ctx, "ddz:room_config:list", string(data), 24*time.Hour).Err(); err != nil {
                global.GVA_LOG.Error("写入Redis失败", zap.Error(err))
                return err
        }

        global.GVA_LOG.Info("房间配置缓存已刷新到Redis", zap.Int("count", len(serverConfigs)))
        return nil
}

// GetRoomConfigListForAPI 获取启用的房间配置列表（供游戏API调用）- 带Redis缓存
func (s *DDZConfigService) GetRoomConfigListForAPI() ([]ddz.DDZRoomConfigs, error) {
        // 尝试从Redis获取缓存
        if global.GVA_REDIS != nil {
                ctx := context.Background()
                cached, err := global.GVA_REDIS.Get(ctx, RoomConfigListCacheKey).Result()
                if err == nil && cached != "" {
                        var configs []ddz.DDZRoomConfigs
                        if jsonErr := json.Unmarshal([]byte(cached), &configs); jsonErr == nil {
                                return configs, nil
                        }
                }
        }
        
        // 从数据库获取
        db := GetDDZDB()
        var configs []ddz.DDZRoomConfigs
        err := db.Where("status = 1").Order("sort asc, id asc").Find(&configs).Error
        if err != nil {
                return nil, err
        }
        
        // 缓存到Redis
        if global.GVA_REDIS != nil && len(configs) > 0 {
                ctx := context.Background()
                if data, jsonErr := json.Marshal(configs); jsonErr == nil {
                        global.GVA_REDIS.Set(ctx, RoomConfigListCacheKey, string(data), RoomConfigCacheDuration)
                }
        }
        
        return configs, nil
}

// GetGameConfigList 获取游戏配置列表
func (s *DDZConfigService) GetGameConfigList(req ddzReq.DDZGameConfigSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZGameConfig{})

        if req.ConfigKey != "" {
                query = query.Where("config_key LIKE ?", "%"+req.ConfigKey+"%")
        }
        if req.ConfigType != "" {
                query = query.Where("config_type = ?", req.ConfigType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var configs []ddz.DDZGameConfig
        err = query.Limit(limit).Offset(offset).Order("id asc").Find(&configs).Error
        if err != nil {
                return nil, 0, err
        }

        return configs, total, nil
}

// UpdateGameConfig 更新游戏配置
func (s *DDZConfigService) UpdateGameConfig(req ddzReq.DDZGameConfigUpdate) error {
        db := GetDDZDB()
        var config ddz.DDZGameConfig
        err := db.First(&config, req.ID).Error
        if err != nil {
                return errors.New("游戏配置不存在")
        }

        updates := map[string]interface{}{}
        if req.ConfigKey != "" {
                updates["config_key"] = req.ConfigKey
        }
        if req.ConfigValue != "" {
                updates["config_value"] = req.ConfigValue
        }
        if req.ConfigType != "" {
                updates["config_type"] = req.ConfigType
        }
        updates["description"] = req.Description
        updates["status"] = req.Status

        return db.Model(&config).Updates(updates).Error
}

// GetBgImageOptions 获取背景图选项（供前端选择）
func (s *DDZConfigService) GetBgImageOptions() []map[string]interface{} {
        options := []map[string]interface{}{}
        for i := ddz.BgImageNumMin; i <= ddz.BgImageNumMax; i++ {
                options = append(options, map[string]interface{}{
                        "value":       i,
                        "label":       fmt.Sprintf("btn_happy_%d.png", i),
                        "description": fmt.Sprintf("背景图编号 %d", i),
                })
        }
        return options
}

// ========== 广告配置Redis缓存相关方法 ==========

// SyncAdConfigToRedis 同步广告配置到Redis（永不过期）
func (s *DDZConfigService) SyncAdConfigToRedis(adConfig *AdConfig) error {
        if global.GVA_REDIS == nil {
                global.GVA_LOG.Warn("Redis未配置，无法同步广告配置")
                return nil
        }

        ctx := context.Background()
        data, err := json.Marshal(adConfig)
        if err != nil {
                global.GVA_LOG.Error("序列化广告配置失败", zap.Error(err))
                return err
        }

        // 存储到Redis，永不过期（duration=0表示永不过期）
        err = global.GVA_REDIS.Set(ctx, AdConfigCacheKey, string(data), 0).Err()
        if err != nil {
                global.GVA_LOG.Error("同步广告配置到Redis失败", zap.Error(err))
                return err
        }

        global.GVA_LOG.Info("广告配置已同步到Redis", zap.String("key", AdConfigCacheKey))
        return nil
}

// GetAdConfigFromRedis 从Redis获取广告配置
func (s *DDZConfigService) GetAdConfigFromRedis() (*AdConfig, error) {
        if global.GVA_REDIS == nil {
                return nil, errors.New("Redis未配置")
        }

        ctx := context.Background()
        cached, err := global.GVA_REDIS.Get(ctx, AdConfigCacheKey).Result()
        if err != nil {
                return nil, err
        }

        var config AdConfig
        if err := json.Unmarshal([]byte(cached), &config); err != nil {
                return nil, err
        }

        return &config, nil
}

// ClearAdConfigCache 清除广告配置缓存
func (s *DDZConfigService) ClearAdConfigCache() error {
        if global.GVA_REDIS == nil {
                return nil
        }

        ctx := context.Background()
        err := global.GVA_REDIS.Del(ctx, AdConfigCacheKey).Err()
        if err != nil {
                global.GVA_LOG.Warn("清除广告配置缓存失败", zap.Error(err))
                return err
        }

        global.GVA_LOG.Info("广告配置缓存已清除")
        return nil
}
