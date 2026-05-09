package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZGameConfigService struct{}

// GetGameConfigList 获取游戏配置列表
func (s *DDZGameConfigService) GetGameConfigList(req ddzReq.DDZGameConfigSearch) (list []ddz.DDZGameConfig, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	db := global.GVA_DB_GAME.Table("ddz_game_configs")
	if req.ConfigKey != "" {
		db = db.Where("config_key LIKE ?", "%"+req.ConfigKey+"%")
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

// GetGameConfigByKey 根据Key获取配置
func (s *DDZGameConfigService) GetGameConfigByKey(key string) (ddz.DDZGameConfig, error) {
	var config ddz.DDZGameConfig
	err := global.GVA_DB_GAME.Table("ddz_game_configs").Where("config_key = ?", key).First(&config).Error
	return config, err
}

// CreateGameConfig 创建游戏配置
func (s *DDZGameConfigService) CreateGameConfig(req ddzReq.DDZGameConfigCreate) error {
	config := ddz.DDZGameConfig{
		ConfigKey:   req.ConfigKey,
		ConfigValue: req.ConfigValue,
		Description: req.Description,
	}
	return global.GVA_DB_GAME.Table("ddz_game_configs").Create(&config).Error
}

// UpdateGameConfig 更新游戏配置
func (s *DDZGameConfigService) UpdateGameConfig(req ddzReq.DDZGameConfigUpdate) error {
	updates := make(map[string]interface{})
	if req.ConfigKey != "" {
		updates["config_key"] = req.ConfigKey
	}
	updates["config_value"] = req.ConfigValue
	updates["description"] = req.Description
	return global.GVA_DB_GAME.Table("ddz_game_configs").Where("id = ?", req.ID).Updates(updates).Error
}

// DeleteGameConfig 删除游戏配置
func (s *DDZGameConfigService) DeleteGameConfig(id uint64) error {
	return global.GVA_DB_GAME.Table("ddz_game_configs").Where("id = ?", id).Delete(nil).Error
}
