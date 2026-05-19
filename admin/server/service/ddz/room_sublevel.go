package ddz

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DDZRoomSublevelService struct{}

var DDZRoomSublevelServiceApp = new(DDZRoomSublevelService)

// Redis缓存键
const (
	RoomSublevelListCacheKey     = "ddz:room_sublevel:list:"
	RoomSublevelByRoomCacheKey   = "ddz:room_sublevel:room:"
	RoomSublevelCacheDuration    = 24 * time.Hour
)

// GetRoomSublevelList 获取子分区列表
func (s *DDZRoomSublevelService) GetRoomSublevelList(req ddzReq.DDZRoomSublevelSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZRoomSublevel{})

	if req.RoomConfigID != nil {
		query = query.Where("room_config_id = ?", *req.RoomConfigID)
	}
	if req.SublevelName != "" {
		query = query.Where("sublevel_name LIKE ?", "%"+req.SublevelName+"%")
	}
	if req.BaseScore != nil {
		query = query.Where("base_score = ?", *req.BaseScore)
	}
	if req.Status != nil {
		query = query.Where("status = ?", *req.Status)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var sublevels []ddz.DDZRoomSublevel
	err = query.Limit(limit).Offset(offset).Order("room_config_id asc, sort_order asc, id asc").Find(&sublevels).Error
	if err != nil {
		return nil, 0, err
	}

	return sublevels, total, nil
}

// GetRoomSublevelByID 根据ID获取子分区
func (s *DDZRoomSublevelService) GetRoomSublevelByID(id uint) (ddz.DDZRoomSublevel, error) {
	db := GetDDZDB()
	var sublevel ddz.DDZRoomSublevel
	err := db.First(&sublevel, id).Error
	return sublevel, err
}

// GetRoomSublevelsByRoomConfigID 根据房间配置ID获取子分区列表（客户端使用）
func (s *DDZRoomSublevelService) GetRoomSublevelsByRoomConfigID(roomConfigID uint) ([]ddz.DDZRoomSublevel, error) {
	// 尝试从Redis获取缓存
	if global.GVA_REDIS != nil {
		ctx := context.Background()
		cacheKey := RoomSublevelByRoomCacheKey + string(rune(roomConfigID))
		cached, err := global.GVA_REDIS.Get(ctx, cacheKey).Result()
		if err == nil && cached != "" {
			var sublevels []ddz.DDZRoomSublevel
			if jsonErr := json.Unmarshal([]byte(cached), &sublevels); jsonErr == nil {
				return sublevels, nil
			}
		}
	}

	// 从数据库获取
	db := GetDDZDB()
	var sublevels []ddz.DDZRoomSublevel
	err := db.Where("room_config_id = ? AND status = ?", roomConfigID, ddz.SublevelStatusEnabled).
		Order("sort_order asc, id asc").
		Find(&sublevels).Error
	if err != nil {
		return nil, err
	}

	// 缓存到Redis
	if global.GVA_REDIS != nil && len(sublevels) > 0 {
		ctx := context.Background()
		cacheKey := RoomSublevelByRoomCacheKey + string(rune(roomConfigID))
		if data, jsonErr := json.Marshal(sublevels); jsonErr == nil {
			global.GVA_REDIS.Set(ctx, cacheKey, string(data), RoomSublevelCacheDuration)
		}
	}

	return sublevels, nil
}

// CreateRoomSublevel 创建子分区
func (s *DDZRoomSublevelService) CreateRoomSublevel(req ddzReq.DDZRoomSublevelCreate) error {
	db := GetDDZDB()

	// 验证房间配置是否存在
	var roomConfig ddz.DDZRoomConfig
	if err := db.First(&roomConfig, req.RoomConfigID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("房间配置不存在")
		}
		return err
	}

	// 只允许普通房间（练级区）创建子分区
	if roomConfig.RoomCategory != 1 {
		return errors.New("只有普通房间（练级区）才能创建子分区")
	}

	// 检查底分是否已存在
	var existCount int64
	db.Model(&ddz.DDZRoomSublevel{}).Where("room_config_id = ? AND base_score = ?", req.RoomConfigID, req.BaseScore).Count(&existCount)
	if existCount > 0 {
		return errors.New("该底分的子分区已存在")
	}

	// 设置默认值
	upgradeScore := req.UpgradeScore
	if upgradeScore <= 0 {
		upgradeScore = int64(req.BaseScore) * ddz.UpgradeMultiplier // 自动计算50倍基础分
	}

	bgImageNum := req.BgImageNum
	if bgImageNum < ddz.BgImageNumMin || bgImageNum > ddz.BgImageNumMax {
		bgImageNum = roomConfig.BgImageNum // 使用父房间的背景图
	}

	sublevel := ddz.DDZRoomSublevel{
		RoomConfigID:   req.RoomConfigID,
		SublevelName:   req.SublevelName,
		BaseScore:      req.BaseScore,
		MinGold:        req.MinGold,
		MaxGold:        req.MaxGold,
		UpgradeScore:   upgradeScore,
		NextSublevelID: req.NextSublevelID,
		PrevSublevelID: req.PrevSublevelID,
		BgImageNum:     bgImageNum,
		BotEnabled:     req.BotEnabled,
		BotCount:       req.BotCount,
		TimeoutSeconds: req.TimeoutSeconds,
		Status:         req.Status,
		SortOrder:      req.SortOrder,
		Description:    req.Description,
	}

	// 设置默认值
	if sublevel.BotEnabled == 0 {
		sublevel.BotEnabled = 1
	}
	if sublevel.BotCount == 0 {
		sublevel.BotCount = 2
	}
	if sublevel.TimeoutSeconds == 0 {
		sublevel.TimeoutSeconds = 30
	}
	if sublevel.Status == 0 {
		sublevel.Status = 1
	}

	err := db.Create(&sublevel).Error
	if err != nil {
		return err
	}

	// 刷新缓存
	s.RefreshRoomSublevelCache(req.RoomConfigID)

	return nil
}

// UpdateRoomSublevel 更新子分区
func (s *DDZRoomSublevelService) UpdateRoomSublevel(req ddzReq.DDZRoomSublevelUpdate) error {
	db := GetDDZDB()
	var sublevel ddz.DDZRoomSublevel
	err := db.First(&sublevel, req.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("子分区不存在")
		}
		return err
	}

	updates := map[string]interface{}{}

	if req.SublevelName != "" {
		updates["sublevel_name"] = req.SublevelName
	}
	if req.BaseScore > 0 {
		updates["base_score"] = req.BaseScore
		// 自动更新升级分数
		if req.UpgradeScore <= 0 {
			updates["upgrade_score"] = int64(req.BaseScore) * ddz.UpgradeMultiplier
		}
	}
	updates["min_gold"] = req.MinGold
	updates["max_gold"] = req.MaxGold
	if req.UpgradeScore > 0 {
		updates["upgrade_score"] = req.UpgradeScore
	}
	updates["next_sublevel_id"] = req.NextSublevelID
	updates["prev_sublevel_id"] = req.PrevSublevelID
	if req.BgImageNum >= ddz.BgImageNumMin && req.BgImageNum <= ddz.BgImageNumMax {
		updates["bg_image_num"] = req.BgImageNum
	}
	updates["bot_enabled"] = req.BotEnabled
	updates["bot_count"] = req.BotCount
	updates["timeout_seconds"] = req.TimeoutSeconds
	updates["status"] = req.Status
	updates["sort_order"] = req.SortOrder
	updates["description"] = req.Description

	err = db.Model(&sublevel).Updates(updates).Error
	if err != nil {
		return err
	}

	// 刷新缓存
	s.RefreshRoomSublevelCache(sublevel.RoomConfigID)

	return nil
}

// DeleteRoomSublevel 删除子分区
func (s *DDZRoomSublevelService) DeleteRoomSublevel(id uint) error {
	db := GetDDZDB()
	var sublevel ddz.DDZRoomSublevel
	err := db.First(&sublevel, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("子分区不存在")
		}
		return err
	}

	roomConfigID := sublevel.RoomConfigID

	err = db.Delete(&sublevel).Error
	if err != nil {
		return err
	}

	// 刷新缓存
	s.RefreshRoomSublevelCache(roomConfigID)

	return nil
}

// BatchCreateDefaultSublevels 批量创建默认子分区
func (s *DDZRoomSublevelService) BatchCreateDefaultSublevels(roomConfigID uint) error {
	db := GetDDZDB()

	// 验证房间配置
	var roomConfig ddz.DDZRoomConfig
	if err := db.First(&roomConfig, roomConfigID).Error; err != nil {
		return errors.New("房间配置不存在")
	}

	if roomConfig.RoomCategory != 1 {
		return errors.New("只有普通房间（练级区）才能创建子分区")
	}

	// 检查是否已存在子分区
	var existCount int64
	db.Model(&ddz.DDZRoomSublevel{}).Where("room_config_id = ?", roomConfigID).Count(&existCount)
	if existCount > 0 {
		return errors.New("该房间已存在子分区，请先删除后再创建")
	}

	// 默认子分区配置
	defaultSublevels := []struct {
		Name      string
		BaseScore int
		MinGold   int64
		MaxGold   int64
	}{
		{"10分场", 10, 500, 5000},
		{"50分场", 50, 2500, 25000},
		{"200分场", 200, 10000, 100000},
		{"500分场", 500, 25000, 250000},
		{"1000分场", 1000, 50000, 500000},
	}

	sublevels := make([]ddz.DDZRoomSublevel, len(defaultSublevels))
	for i, d := range defaultSublevels {
		sublevels[i] = ddz.DDZRoomSublevel{
			RoomConfigID:   roomConfigID,
			SublevelName:   d.Name,
			BaseScore:      d.BaseScore,
			MinGold:        d.MinGold,
			MaxGold:        d.MaxGold,
			UpgradeScore:   int64(d.BaseScore) * ddz.UpgradeMultiplier,
			BgImageNum:     roomConfig.BgImageNum,
			BotEnabled:     1,
			BotCount:       2,
			TimeoutSeconds: 30,
			Status:         1,
			SortOrder:      i + 1,
			Description:    d.Name + " - 底分" + string(rune(d.BaseScore+'0')) + "，入场金币" + string(rune(d.MinGold+'0')),
		}
	}

	// 设置前后关系
	for i := range sublevels {
		if i > 0 {
			sublevels[i].PrevSublevelID = 0 // 将在创建后更新
		}
		if i < len(sublevels)-1 {
			sublevels[i].NextSublevelID = 0 // 将在创建后更新
		}
	}

	// 批量创建
	err := db.Create(&sublevels).Error
	if err != nil {
		return err
	}

	// 更新前后关系
	for i := range sublevels {
		updates := map[string]interface{}{}
		if i > 0 {
			updates["prev_sublevel_id"] = sublevels[i-1].ID
		}
		if i < len(sublevels)-1 {
			updates["next_sublevel_id"] = sublevels[i+1].ID
		}
		if len(updates) > 0 {
			db.Model(&sublevels[i]).Updates(updates)
		}
	}

	// 刷新缓存
	s.RefreshRoomSublevelCache(roomConfigID)

	global.GVA_LOG.Info("批量创建子分区成功", zap.Uint("roomConfigID", roomConfigID), zap.Int("count", len(sublevels)))

	return nil
}

// RefreshRoomSublevelCache 刷新子分区缓存
func (s *DDZRoomSublevelService) RefreshRoomSublevelCache(roomConfigID uint) error {
	if global.GVA_REDIS == nil {
		global.GVA_LOG.Warn("Redis未配置，无法刷新子分区缓存")
		return nil
	}

	db := GetDDZDB()
	var sublevels []ddz.DDZRoomSublevel
	if err := db.Where("room_config_id = ? AND status = ?", roomConfigID, ddz.SublevelStatusEnabled).
		Order("sort_order ASC, id ASC").Find(&sublevels).Error; err != nil {
		global.GVA_LOG.Error("查询子分区失败", zap.Error(err))
		return err
	}

	ctx := context.Background()
	cacheKey := RoomSublevelByRoomCacheKey + string(rune(roomConfigID))

	if len(sublevels) == 0 {
		// 如果没有子分区，删除缓存
		global.GVA_REDIS.Del(ctx, cacheKey)
		return nil
	}

	// 序列化并写入Redis
	data, err := json.Marshal(sublevels)
	if err != nil {
		global.GVA_LOG.Error("序列化子分区失败", zap.Error(err))
		return err
	}

	if err := global.GVA_REDIS.Set(ctx, cacheKey, string(data), RoomSublevelCacheDuration).Err(); err != nil {
		global.GVA_LOG.Error("写入Redis失败", zap.Error(err))
		return err
	}

	global.GVA_LOG.Info("子分区缓存已刷新", zap.Uint("roomConfigID", roomConfigID), zap.Int("count", len(sublevels)))
	return nil
}

// GetAllSublevelsForAPI 获取所有启用的子分区列表（供游戏API调用）
func (s *DDZRoomSublevelService) GetAllSublevelsForAPI() (map[uint][]ddz.DDZRoomSublevel, error) {
	db := GetDDZDB()
	var sublevels []ddz.DDZRoomSublevel
	err := db.Where("status = ?", ddz.SublevelStatusEnabled).
		Order("room_config_id asc, sort_order asc, id asc").
		Find(&sublevels).Error
	if err != nil {
		return nil, err
	}

	// 按房间配置ID分组
	result := make(map[uint][]ddz.DDZRoomSublevel)
	for _, s := range sublevels {
		result[s.RoomConfigID] = append(result[s.RoomConfigID], s)
	}

	return result, nil
}
