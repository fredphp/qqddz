package ddz

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZConfigService struct{}

var DDZConfigServiceApp = new(DDZConfigService)

// GetRoomConfigList 获取房间配置列表
func (s *DDZConfigService) GetRoomConfigList(req ddzReq.DDZRoomConfigSearch) (list interface{}, total int64, err error) {
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
	err = query.Limit(limit).Offset(offset).Order("sort asc, id asc").Find(&configs).Error
	if err != nil {
		return nil, 0, err
	}

	return configs, total, nil
}

// GetRoomConfigByID 根据ID获取房间配置
func (s *DDZConfigService) GetRoomConfigByID(id uint) (ddz.DDZRoomConfig, error) {
	db := GetDDZDB()
	var config ddz.DDZRoomConfig
	err := db.First(&config, id).Error
	return config, err
}

// CreateRoomConfig 创建房间配置
func (s *DDZConfigService) CreateRoomConfig(req ddzReq.DDZRoomConfigCreate) error {
	db := GetDDZDB()
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
	return db.Create(&config).Error
}

// UpdateRoomConfig 更新房间配置
func (s *DDZConfigService) UpdateRoomConfig(req ddzReq.DDZRoomConfigUpdate) error {
	db := GetDDZDB()
	var config ddz.DDZRoomConfig
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

	return db.Model(&config).Updates(updates).Error
}

// DeleteRoomConfig 删除房间配置
func (s *DDZConfigService) DeleteRoomConfig(id uint) error {
	db := GetDDZDB()
	return db.Delete(&ddz.DDZRoomConfig{}, id).Error
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
