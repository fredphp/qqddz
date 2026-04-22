package ddz

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZConfigService struct{}

var DDZConfigServiceApp = new(DDZConfigService)

// GetRoomConfigList 获取房间配置列表
func (s *DDZConfigService) GetRoomConfigList(req ddzReq.DDZRoomConfigSearch) (list interface{}, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	db := global.GVA_DB.Model(&ddz.DDZRoomConfig{})

	if req.RoomType != nil {
		db = db.Where("room_type = ?", *req.RoomType)
	}
	if req.Status != nil {
		db = db.Where("status = ?", *req.Status)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var configs []ddz.DDZRoomConfig
	err = db.Limit(limit).Offset(offset).Order("sort asc, id asc").Find(&configs).Error
	if err != nil {
		return nil, 0, err
	}

	return configs, total, nil
}

// GetRoomConfigByID 根据ID获取房间配置
func (s *DDZConfigService) GetRoomConfigByID(id uint) (ddz.DDZRoomConfig, error) {
	var config ddz.DDZRoomConfig
	err := global.GVA_DB.First(&config, id).Error
	return config, err
}

// CreateRoomConfig 创建房间配置
func (s *DDZConfigService) CreateRoomConfig(req ddzReq.DDZRoomConfigCreate) error {
	config := ddz.DDZRoomConfig{
		Name:        req.Name,
		RoomType:    req.RoomType,
		RoomLevel:   req.RoomLevel,
		BaseScore:   req.BaseScore,
		MinCoins:    req.MinCoins,
		MaxCoins:    req.MaxCoins,
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
	return global.GVA_DB.Create(&config).Error
}

// UpdateRoomConfig 更新房间配置
func (s *DDZConfigService) UpdateRoomConfig(req ddzReq.DDZRoomConfigUpdate) error {
	var config ddz.DDZRoomConfig
	err := global.GVA_DB.First(&config, req.ID).Error
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

	return global.GVA_DB.Model(&config).Updates(updates).Error
}

// DeleteRoomConfig 删除房间配置
func (s *DDZConfigService) DeleteRoomConfig(id uint) error {
	return global.GVA_DB.Delete(&ddz.DDZRoomConfig{}, id).Error
}

// GetGameConfigList 获取游戏配置列表
func (s *DDZConfigService) GetGameConfigList(req ddzReq.DDZGameConfigSearch) (list interface{}, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	db := global.GVA_DB.Model(&ddz.DDZGameConfig{})

	if req.ConfigKey != "" {
		db = db.Where("config_key LIKE ?", "%"+req.ConfigKey+"%")
	}
	if req.ConfigType != "" {
		db = db.Where("config_type = ?", req.ConfigType)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var configs []ddz.DDZGameConfig
	err = db.Limit(limit).Offset(offset).Order("id asc").Find(&configs).Error
	if err != nil {
		return nil, 0, err
	}

	return configs, total, nil
}

// UpdateGameConfig 更新游戏配置
func (s *DDZConfigService) UpdateGameConfig(req ddzReq.DDZGameConfigUpdate) error {
	var config ddz.DDZGameConfig
	err := global.GVA_DB.First(&config, req.ID).Error
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

	return global.GVA_DB.Model(&config).Updates(updates).Error
}
