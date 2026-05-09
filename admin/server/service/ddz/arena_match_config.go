package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZArenaMatchConfigService struct{}

// GetArenaMatchConfigList 获取比赛配置列表
func (s *DDZArenaMatchConfigService) GetArenaMatchConfigList(req ddzReq.DDZArenaMatchConfigSearch) (list []ddz.DDZArenaMatchConfig, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_arena_match_config")
        if req.RoomConfigID > 0 {
                db = db.Where("room_config_id = ?", req.RoomConfigID)
        }
        if req.Status != nil {
                db = db.Where("status = ?", *req.Status)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}

// CreateArenaMatchConfig 创建比赛配置
func (s *DDZArenaMatchConfigService) CreateArenaMatchConfig(req ddzReq.DDZArenaMatchConfigCreate) error {
        config := ddz.DDZArenaMatchConfig{
                RoomConfigID:       req.RoomConfigID,
                MatchTimeRanges:    req.MatchTimeRanges,
                MatchRoundDuration: req.MatchRoundDuration,
                MatchRoundCount:    req.MatchRoundCount,
                SignupFee:          req.SignupFee,
                MaxPlayers:         req.MaxPlayers,
                MinPlayers:         req.MinPlayers,
                ChampionRewardID:   req.ChampionRewardID,
                RunnerUpRewardID:   req.RunnerUpRewardID,
                ThirdRewardID:      req.ThirdRewardID,
                SignupStartTime:    req.SignupStartTime,
                SignupEndTime:      req.SignupEndTime,
                AutoStart:          req.AutoStart,
                Status:             req.Status,
                Description:        req.Description,
        }
        return GetDDZDB().Table("ddz_arena_match_config").Create(&config).Error
}

// UpdateArenaMatchConfig 更新比赛配置
func (s *DDZArenaMatchConfigService) UpdateArenaMatchConfig(req ddzReq.DDZArenaMatchConfigUpdate) error {
        updates := make(map[string]interface{})
        if req.RoomConfigID > 0 {
                updates["room_config_id"] = req.RoomConfigID
        }
        if req.MatchTimeRanges != "" {
                updates["match_time_ranges"] = req.MatchTimeRanges
        }
        if req.MatchRoundDuration > 0 {
                updates["match_round_duration"] = req.MatchRoundDuration
        }
        if req.MatchRoundCount > 0 {
                updates["match_round_count"] = req.MatchRoundCount
        }
        if req.SignupFee != 0 {
                updates["signup_fee"] = req.SignupFee
        }
        if req.MaxPlayers > 0 {
                updates["max_players"] = req.MaxPlayers
        }
        if req.MinPlayers > 0 {
                updates["min_players"] = req.MinPlayers
        }
        updates["champion_reward_id"] = req.ChampionRewardID
        updates["runner_up_reward_id"] = req.RunnerUpRewardID
        updates["third_reward_id"] = req.ThirdRewardID
        if req.SignupStartTime != "" {
                updates["signup_start_time"] = req.SignupStartTime
        }
        if req.SignupEndTime != "" {
                updates["signup_end_time"] = req.SignupEndTime
        }
        if req.AutoStart != nil {
                updates["auto_start"] = *req.AutoStart
        }
        if req.Status != nil {
                updates["status"] = *req.Status
        }
        if req.Description != "" {
                updates["description"] = req.Description
        }
        return GetDDZDB().Table("ddz_arena_match_config").Where("id = ?", req.ID).Updates(updates).Error
}

// DeleteArenaMatchConfig 删除比赛配置
func (s *DDZArenaMatchConfigService) DeleteArenaMatchConfig(id uint64) error {
        return GetDDZDB().Table("ddz_arena_match_config").Where("id = ?", id).Delete(nil).Error
}
