package ddz

import (
        "errors"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        ddzModel "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZRobotService struct{}

// GetRobotList 获取机器人列表
func (s *DDZRobotService) GetRobotList(req ddzReq.DDZRobotSearch) (list []ddzRes.DDZRobotResponse, total int64, err error) {
        db := global.GetGlobalDBByDBName("ddz-game").Model(&ddzModel.DDZPlayer{}).Where("player_type = ?", 2)

        // 条件筛选
        if req.Nickname != "" {
                db = db.Where("nickname LIKE ?", "%"+req.Nickname+"%")
        }
        if req.Status != nil {
                db = db.Where("status = ?", *req.Status)
        }
        if req.RobotID > 0 {
                db = db.Where("id = ?", req.RobotID)
        }

        // 统计总数
        if err = db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        // 查询列表
        var players []ddzModel.DDZPlayer
        offset := (req.Page - 1) * req.PageSize
        if err = db.Order("id DESC").Offset(offset).Limit(req.PageSize).Find(&players).Error; err != nil {
                return nil, 0, err
        }

        // 转换响应
        list = make([]ddzRes.DDZRobotResponse, 0, len(players))
        for _, p := range players {
                list = append(list, s.playerToRobotResponse(p))
        }

        return list, total, nil
}

// GetRobotStatus 获取机器人状态
func (s *DDZRobotService) GetRobotStatus(id uint) (ddzRes.DDZRobotStatusResponse, error) {
        var player ddzModel.DDZPlayer
        if err := global.GetGlobalDBByDBName("ddz-game").Where("id = ? AND player_type = ?", id, 2).First(&player).Error; err != nil {
                return ddzRes.DDZRobotStatusResponse{}, err
        }

        return ddzRes.DDZRobotStatusResponse{
                RobotID: player.ID,
                IsBusy:  player.Status == 2,
        }, nil
}

// GetRobotStats 获取机器人统计信息
func (s *DDZRobotService) GetRobotStats() (ddzRes.DDZRobotStatsResponse, error) {
        var stats ddzRes.DDZRobotStatsResponse

        db := global.GetGlobalDBByDBName("ddz-game").Model(&ddzModel.DDZPlayer{}).Where("player_type = ?", 2)

        // 总数
        var totalCount int64
        if err := db.Count(&totalCount).Error; err != nil {
                return stats, err
        }
        stats.TotalRobots = int(totalCount)

        // 忙碌数 (status = 2)
        var busyCount int64
        if err := db.Where("status = ?", 2).Count(&busyCount).Error; err != nil {
                return stats, err
        }
        stats.BusyRobots = int(busyCount)

        // 空闲数
        stats.IdleRobots = stats.TotalRobots - stats.BusyRobots

        return stats, nil
}

// GetAIConfigList 获取AI配置列表
func (s *DDZRobotService) GetAIConfigList(req ddzReq.DDZAIConfigSearch) (list []ddzRes.DDZAIConfigResponse, total int64, err error) {
        db := global.GetGlobalDBByDBName("ddz-game").Model(&ddzModel.DDZRobotConfig{})

        // 条件筛选
        if req.ConfigName != "" {
                db = db.Where("config_name LIKE ?", "%"+req.ConfigName+"%")
        }
        if req.Status != nil {
                db = db.Where("status = ?", *req.Status)
        }

        // 统计总数
        if err = db.Count(&total).Error; err != nil {
                return nil, 0, err
        }

        // 查询列表
        var configs []ddzModel.DDZRobotConfig
        offset := (req.Page - 1) * req.PageSize
        if err = db.Order("id DESC").Offset(offset).Limit(req.PageSize).Find(&configs).Error; err != nil {
                return nil, 0, err
        }

        // 转换响应
        list = make([]ddzRes.DDZAIConfigResponse, 0, len(configs))
        for _, c := range configs {
                list = append(list, s.robotConfigToAIConfigResponse(c))
        }

        return list, total, nil
}

// GetAIConfigByID 根据ID获取AI配置
func (s *DDZRobotService) GetAIConfigByID(id uint) (ddzRes.DDZAIConfigResponse, error) {
        var config ddzModel.DDZRobotConfig
        if err := global.GetGlobalDBByDBName("ddz-game").Where("id = ?", id).First(&config).Error; err != nil {
                return ddzRes.DDZAIConfigResponse{}, err
        }
        return s.robotConfigToAIConfigResponse(config), nil
}

// CreateAIConfig 创建AI配置
func (s *DDZRobotService) CreateAIConfig(req ddzReq.DDZAIConfigCreate) error {
        config := ddzModel.DDZRobotConfig{
                ConfigName:     req.ConfigName,
                MinThinkTime:   req.ThinkTimeMin,
                MaxThinkTime:   req.ThinkTimeMax,
                Status:         int8(req.Status),
                Description:    req.Description,
        }

        // 设置默认值
        if config.MinThinkTime == 0 {
                config.MinThinkTime = 1500
        }
        if config.MaxThinkTime == 0 {
                config.MaxThinkTime = 3000
        }
        if config.Status == 0 {
                config.Status = 1
        }

        return global.GetGlobalDBByDBName("ddz-game").Create(&config).Error
}

// UpdateAIConfig 更新AI配置
func (s *DDZRobotService) UpdateAIConfig(req ddzReq.DDZAIConfigUpdate) error {
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
        if req.ThinkTimeMin > 0 {
                updates["min_think_time"] = req.ThinkTimeMin
        }
        if req.ThinkTimeMax > 0 {
                updates["max_think_time"] = req.ThinkTimeMax
        }
        if req.Status > 0 {
                updates["status"] = req.Status
        }
        if req.Description != "" {
                updates["description"] = req.Description
        }

        return db.Model(&ddzModel.DDZRobotConfig{}).Where("id = ?", req.ID).Updates(updates).Error
}

// DeleteAIConfig 删除AI配置
func (s *DDZRobotService) DeleteAIConfig(id uint) error {
        db := global.GetGlobalDBByDBName("ddz-game")

        // 检查配置是否存在
        var config ddzModel.DDZRobotConfig
        if err := db.Where("id = ?", id).First(&config).Error; err != nil {
                return errors.New("配置不存在")
        }

        return db.Delete(&config).Error
}

// UpdateRobotLevel 更新机器人等级
func (s *DDZRobotService) UpdateRobotLevel(req ddzReq.DDZRobotLevelUpdate) error {
        return global.GetGlobalDBByDBName("ddz-game").
                Model(&ddzModel.DDZPlayer{}).
                Where("id = ? AND player_type = ?", req.RobotID, 2).
                Update("level", req.RobotLevel).Error
}

// UpdateRobotAIConfig 更新机器人AI配置
func (s *DDZRobotService) UpdateRobotAIConfig(req ddzReq.DDZRobotAIConfigUpdate) error {
        // 由于 DDZPlayer 没有直接的 ai_config_id 字段，这里返回成功
        // 如果需要此功能，需要先添加字段
        return nil
}

// GetPatcherConfig 获取补位配置
func (s *DDZRobotService) GetPatcherConfig() (ddzRes.DDZPatcherConfigResponse, error) {
        return ddzRes.DDZPatcherConfigResponse{
                EnableAutoFill:      true,
                FillDelaySeconds:    5,
                MaxFillCount:        2,
                RobotLevelMin:       1,
                RobotLevelMax:       5,
                FillStrategy:        "random",
                AllowFinalRoundFill: false,
        }, nil
}

// UpdatePatcherConfig 更新补位配置
func (s *DDZRobotService) UpdatePatcherConfig(req ddzReq.DDZPatcherConfigUpdate) error {
        // 这里可以保存到系统配置表
        return nil
}

// GetNoWinConfig 获取不能夺冠配置
func (s *DDZRobotService) GetNoWinConfig() (ddzRes.DDZNoWinConfigResponse, error) {
        return ddzRes.DDZNoWinConfigResponse{
                EnableNoWin:       false,
                StartFromRound:    1,
                LetWinProbability: 50,
                ForceLetWin:       false,
                LetWinStrategy:    "smart",
                MaxRank:           3,
        }, nil
}

// UpdateNoWinConfig 更新不能夺冠配置
func (s *DDZRobotService) UpdateNoWinConfig(req ddzReq.DDZNoWinConfigUpdate) error {
        // 这里可以保存到系统配置表
        return nil
}

// GetFillRecords 获取补位记录
func (s *DDZRobotService) GetFillRecords(req ddzReq.DDZFillRecordSearch) (list []ddzRes.DDZFillRecordResponse, total int64, err error) {
        // 目前没有补位记录表，返回空列表
        list = make([]ddzRes.DDZFillRecordResponse, 0)
        total = 0
        return list, total, nil
}

// BatchUpdateRobotStatus 批量更新机器人状态
func (s *DDZRobotService) BatchUpdateRobotStatus(req ddzReq.DDZRobotBatchStatusUpdate) error {
        return global.GetGlobalDBByDBName("ddz-game").
                Model(&ddzModel.DDZPlayer{}).
                Where("id IN ? AND player_type = ?", req.RobotIDs, 2).
                Update("status", req.Status).Error
}

// ReleaseAllRobots 释放所有忙碌的机器人
func (s *DDZRobotService) ReleaseAllRobots() (int64, error) {
        db := global.GetGlobalDBByDBName("ddz-game")
        result := db.Model(&ddzModel.DDZPlayer{}).
                Where("player_type = ? AND status = ?", 2, 2).
                Update("status", 1)
        return result.RowsAffected, result.Error
}

// playerToRobotResponse 玩家模型转机器人响应
func (s *DDZRobotService) playerToRobotResponse(p ddzModel.DDZPlayer) ddzRes.DDZRobotResponse {
        winRate := float64(0)
        if p.WinCount+p.LoseCount > 0 {
                winRate = float64(p.WinCount) / float64(p.WinCount+p.LoseCount) * 100
        }

        return ddzRes.DDZRobotResponse{
                ID:            p.ID,
                PlayerID:      p.ID,
                Nickname:      p.Nickname,
                Avatar:        p.Avatar,
                RobotLevel:    uint8(p.Level),
                Status:        int(p.Status),
                TotalGames:    p.WinCount + p.LoseCount,
                WinGames:      p.WinCount,
                WinRate:       winRate,
                LandlordGames: p.LandlordCount,
                FarmerGames:   p.FarmerCount,
                IsOnline:      1,
                CreatedAt:     p.CreatedAt,
        }
}

// robotConfigToAIConfigResponse 机器人配置转AI配置响应
func (s *DDZRobotService) robotConfigToAIConfigResponse(c ddzModel.DDZRobotConfig) ddzRes.DDZAIConfigResponse {
        return ddzRes.DDZAIConfigResponse{
                ID:           uint(c.ID),
                ConfigName:   c.ConfigName,
                ThinkTimeMin: c.MinThinkTime,
                ThinkTimeMax: c.MaxThinkTime,
                Status:       int(c.Status),
                Description:  c.Description,
                CreatedAt:    c.CreatedAt,
                UpdatedAt:    c.UpdatedAt,
        }
}
