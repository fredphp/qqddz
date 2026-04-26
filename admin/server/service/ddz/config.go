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
)

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
func (s *DDZConfigService) RefreshRoomConfigCache() error {
	// 如果Redis可用，清除缓存
	if global.GVA_REDIS != nil {
		ctx := context.Background()
		
		// 删除列表缓存
		err := global.GVA_REDIS.Del(ctx, RoomConfigListCacheKey).Err()
		if err != nil {
			global.GVA_LOG.Warn("清除房间配置列表缓存失败", zap.Error(err))
		}
		
		// 删除所有详情缓存
		keys, err := global.GVA_REDIS.Keys(ctx, RoomConfigDetailCacheKey+"*").Result()
		if err == nil && len(keys) > 0 {
			global.GVA_REDIS.Del(ctx, keys...)
		}
		
		global.GVA_LOG.Info("房间配置缓存已刷新")
	}
	
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
