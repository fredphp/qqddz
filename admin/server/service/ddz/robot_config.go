package ddz

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	ddzModel "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type DDZRobotConfigService struct{}

// GetRobotConfigList 获取机器人配置列表
func (s *DDZRobotConfigService) GetRobotConfigList(req ddzReq.DDZRobotConfigSearch) (list []ddzRes.DDZRobotConfigResponse, total int64, err error) {
	db := global.GetGlobalDBByDBName("ddz-game").Model(&ddzModel.DDZRobotConfig{})

	// 条件筛选
	if req.ConfigName != "" {
		db = db.Where("config_name LIKE ?", "%"+req.ConfigName+"%")
	}
	if req.Status != nil {
		db = db.Where("status = ?", *req.Status)
	}
	if req.IsDefault != nil {
		db = db.Where("is_default = ?", *req.IsDefault)
	}

	// 统计总数
	if err = db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询列表
	var configs []ddzModel.DDZRobotConfig
	offset := (req.Page - 1) * req.PageSize
	if err = db.Order("is_default DESC, id DESC").Offset(offset).Limit(req.PageSize).Find(&configs).Error; err != nil {
		return nil, 0, err
	}

	// 转换响应
	list = make([]ddzRes.DDZRobotConfigResponse, 0, len(configs))
	for _, c := range configs {
		list = append(list, s.modelToResponse(c))
	}

	return list, total, nil
}

// GetRobotConfigByID 根据ID获取机器人配置
func (s *DDZRobotConfigService) GetRobotConfigByID(id uint64) (ddzRes.DDZRobotConfigResponse, error) {
	var config ddzModel.DDZRobotConfig
	if err := global.GetGlobalDBByDBName("ddz-game").Where("id = ?", id).First(&config).Error; err != nil {
		return ddzRes.DDZRobotConfigResponse{}, err
	}
	return s.modelToResponse(config), nil
}

// GetDefaultConfig 获取默认配置
func (s *DDZRobotConfigService) GetDefaultConfig() (ddzRes.DDZRobotConfigResponse, error) {
	var config ddzModel.DDZRobotConfig
	if err := global.GetGlobalDBByDBName("ddz-game").
		Where("is_default = ? AND status = ?", 1, 1).
		First(&config).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 返回内置默认配置
			return s.modelToResponse(*ddzModel.GetDefaultConfig()), nil
		}
		return ddzRes.DDZRobotConfigResponse{}, err
	}
	return s.modelToResponse(config), nil
}

// GetAllConfigs 获取所有启用的配置（用于下拉选择）
func (s *DDZRobotConfigService) GetAllConfigs() ([]ddzRes.DDZRobotConfigSimpleResponse, error) {
	var configs []ddzModel.DDZRobotConfig
	if err := global.GetGlobalDBByDBName("ddz-game").
		Where("status = ?", 1).
		Order("is_default DESC, id ASC").
		Find(&configs).Error; err != nil {
		return nil, err
	}

	list := make([]ddzRes.DDZRobotConfigSimpleResponse, 0, len(configs))
	for _, c := range configs {
		list = append(list, ddzRes.DDZRobotConfigSimpleResponse{
			ID:         c.ID,
			ConfigName: c.ConfigName,
			IsDefault:  c.IsDefault,
			Status:     c.Status,
		})
	}
	return list, nil
}

// CreateRobotConfig 创建机器人配置
func (s *DDZRobotConfigService) CreateRobotConfig(req ddzReq.DDZRobotConfigCreate) error {
	db := global.GetGlobalDBByDBName("ddz-game")

	config := ddzModel.DDZRobotConfig{
		ConfigName:             req.ConfigName,
		MinThinkTime:           req.MinThinkTime,
		MaxThinkTime:           req.MaxThinkTime,
		BombThinkTime:          req.BombThinkTime,
		BombProbability:        decimal.NewFromFloat(req.BombProbability),
		LandlordBidProbability: decimal.NewFromFloat(req.LandlordBidProbability),
		LetWinProbability:      decimal.NewFromFloat(req.LetWinProbability),
		LetWinMinRank:          req.LetWinMinRank,
		Status:                 req.Status,
		Description:            req.Description,
	}

	// 设置默认值
	if config.MinThinkTime == 0 {
		config.MinThinkTime = 1500
	}
	if config.MaxThinkTime == 0 {
		config.MaxThinkTime = 3000
	}
	if config.BombThinkTime == 0 {
		config.BombThinkTime = 4000
	}
	if config.BombProbability.IsZero() {
		config.BombProbability = decimal.NewFromFloat(0.60)
	}
	if config.LandlordBidProbability.IsZero() {
		config.LandlordBidProbability = decimal.NewFromFloat(0.50)
	}
	if config.LetWinProbability.IsZero() {
		config.LetWinProbability = decimal.NewFromFloat(0.85)
	}
	if config.LetWinMinRank == 0 {
		config.LetWinMinRank = 3
	}
	if config.Status == 0 {
		config.Status = 1
	}

	// 如果设置为默认，需要先清除其他默认
	if req.IsDefault == 1 {
		config.IsDefault = 1
		return db.Transaction(func(tx *gorm.DB) error {
			// 清除其他默认
			if err := tx.Model(&ddzModel.DDZRobotConfig{}).Where("1 = 1").Update("is_default", 0).Error; err != nil {
				return err
			}
			return tx.Create(&config).Error
		})
	}

	return db.Create(&config).Error
}

// UpdateRobotConfig 更新机器人配置
func (s *DDZRobotConfigService) UpdateRobotConfig(req ddzReq.DDZRobotConfigUpdate) error {
	db := global.GetGlobalDBByDBName("ddz-game")

	// 检查配置是否存在
	var config ddzModel.DDZRobotConfig
	if err := db.Where("id = ?", req.ID).First(&config).Error; err != nil {
		return errors.New("配置不存在")
	}

	updates := make(map[string]interface{})
	if req.ConfigName != "" {
		updates["config_name"] = req.ConfigName
	}
	if req.MinThinkTime > 0 {
		updates["min_think_time"] = req.MinThinkTime
	}
	if req.MaxThinkTime > 0 {
		updates["max_think_time"] = req.MaxThinkTime
	}
	if req.BombThinkTime > 0 {
		updates["bomb_think_time"] = req.BombThinkTime
	}
	if req.BombProbability >= 0 {
		updates["bomb_probability"] = decimal.NewFromFloat(req.BombProbability)
	}
	if req.LandlordBidProbability >= 0 {
		updates["landlord_bid_probability"] = decimal.NewFromFloat(req.LandlordBidProbability)
	}
	if req.LetWinProbability >= 0 {
		updates["let_win_probability"] = decimal.NewFromFloat(req.LetWinProbability)
	}
	if req.LetWinMinRank > 0 {
		updates["let_win_min_rank"] = req.LetWinMinRank
	}
	if req.Status > 0 {
		updates["status"] = req.Status
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}

	// 如果设置为默认
	if req.IsDefault == 1 {
		return db.Transaction(func(tx *gorm.DB) error {
			// 清除其他默认
			if err := tx.Model(&ddzModel.DDZRobotConfig{}).Where("id != ?", req.ID).Update("is_default", 0).Error; err != nil {
				return err
			}
			updates["is_default"] = 1
			return tx.Model(&ddzModel.DDZRobotConfig{}).Where("id = ?", req.ID).Updates(updates).Error
		})
	}

	return db.Model(&ddzModel.DDZRobotConfig{}).Where("id = ?", req.ID).Updates(updates).Error
}

// DeleteRobotConfig 删除机器人配置
func (s *DDZRobotConfigService) DeleteRobotConfig(id uint64) error {
	db := global.GetGlobalDBByDBName("ddz-game")

	// 检查配置是否存在
	var config ddzModel.DDZRobotConfig
	if err := db.Where("id = ?", id).First(&config).Error; err != nil {
		return errors.New("配置不存在")
	}

	// 如果是默认配置，不允许删除
	if config.IsDefault == 1 {
		return errors.New("默认配置不能删除")
	}

	return db.Delete(&config).Error
}

// SetDefaultConfig 设置默认配置
func (s *DDZRobotConfigService) SetDefaultConfig(id uint64) error {
	db := global.GetGlobalDBByDBName("ddz-game")

	// 检查配置是否存在
	var config ddzModel.DDZRobotConfig
	if err := db.Where("id = ?", id).First(&config).Error; err != nil {
		return errors.New("配置不存在")
	}

	// 如果配置被禁用，不允许设置为默认
	if config.Status != 1 {
		return errors.New("禁用的配置不能设置为默认")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		// 清除其他默认
		if err := tx.Model(&ddzModel.DDZRobotConfig{}).Where("id != ?", id).Update("is_default", 0).Error; err != nil {
			return err
		}
		// 设置当前配置为默认
		return tx.Model(&ddzModel.DDZRobotConfig{}).Where("id = ?", id).Update("is_default", 1).Error
	})
}

// modelToResponse 模型转响应
func (s *DDZRobotConfigService) modelToResponse(c ddzModel.DDZRobotConfig) ddzRes.DDZRobotConfigResponse {
	return ddzRes.DDZRobotConfigResponse{
		ID:                     c.ID,
		ConfigName:             c.ConfigName,
		MinThinkTime:           c.MinThinkTime,
		MaxThinkTime:           c.MaxThinkTime,
		BombThinkTime:          c.BombThinkTime,
		BombProbability:        c.BombProbability.InexactFloat64(),
		LandlordBidProbability: c.LandlordBidProbability.InexactFloat64(),
		LetWinProbability:      c.LetWinProbability.InexactFloat64(),
		LetWinMinRank:          c.LetWinMinRank,
		IsDefault:              c.IsDefault,
		Status:                 c.Status,
		Description:            c.Description,
		CreatedAt:              c.CreatedAt,
		UpdatedAt:              c.UpdatedAt,
	}
}
