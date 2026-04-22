package ddz

import (
	"errors"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
	"gorm.io/gorm"
)

type DDZPlayerService struct{}

var DDZPlayerServiceApp = new(DDZPlayerService)

// GetPlayerList 获取玩家列表
func (s *DDZPlayerService) GetPlayerList(req ddzReq.DDZPlayerSearch) (list interface{}, total int64, err error) {
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	db := global.GVA_DB.Model(&ddz.DDZPlayer{})

	if req.PlayerID != "" {
		db = db.Where("player_id = ?", req.PlayerID)
	}
	if req.Nickname != "" {
		db = db.Where("nickname LIKE ?", "%"+req.Nickname+"%")
	}
	if req.Status != nil {
		db = db.Where("status = ?", *req.Status)
	}
	if req.VipLevel > 0 {
		db = db.Where("vip_level = ?", req.VipLevel)
	}
	if req.MinCoins > 0 {
		db = db.Where("coins >= ?", req.MinCoins)
	}
	if req.MaxCoins > 0 {
		db = db.Where("coins <= ?", req.MaxCoins)
	}

	err = db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var players []ddz.DDZPlayer
	err = db.Limit(limit).Offset(offset).Order("id desc").Find(&players).Error
	if err != nil {
		return nil, 0, err
	}

	// 转换为响应格式
	playerList := make([]ddzRes.DDZPlayerResponse, 0, len(players))
	for _, p := range players {
		playerList = append(playerList, s.toPlayerResponse(p))
	}

	return playerList, total, nil
}

// GetPlayerByID 根据ID获取玩家
func (s *DDZPlayerService) GetPlayerByID(id uint) (ddzRes.DDZPlayerResponse, error) {
	var player ddz.DDZPlayer
	err := global.GVA_DB.First(&player, id).Error
	if err != nil {
		return ddzRes.DDZPlayerResponse{}, err
	}
	return s.toPlayerResponse(player), nil
}

// GetPlayerByPlayerID 根据PlayerID获取玩家
func (s *DDZPlayerService) GetPlayerByPlayerID(playerID string) (ddzRes.DDZPlayerResponse, error) {
	var player ddz.DDZPlayer
	err := global.GVA_DB.Where("player_id = ?", playerID).First(&player).Error
	if err != nil {
		return ddzRes.DDZPlayerResponse{}, err
	}
	return s.toPlayerResponse(player), nil
}

// BanPlayer 封禁玩家
func (s *DDZPlayerService) BanPlayer(req ddzReq.DDZPlayerBan) error {
	var player ddz.DDZPlayer
	err := global.GVA_DB.Where("player_id = ?", req.PlayerID).First(&player).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	updates := map[string]interface{}{
		"status":     2,
		"ban_reason": req.Reason,
		"ban_time":   now,
	}

	if req.Duration > 0 {
		unbanTime := time.Now().Add(time.Duration(req.Duration) * time.Hour).Format("2006-01-02 15:04:05")
		updates["unban_time"] = unbanTime
	} else {
		updates["unban_time"] = nil
	}

	return global.GVA_DB.Model(&player).Updates(updates).Error
}

// UnbanPlayer 解封玩家
func (s *DDZPlayerService) UnbanPlayer(req ddzReq.DDZPlayerUnban) error {
	var player ddz.DDZPlayer
	err := global.GVA_DB.Where("player_id = ?", req.PlayerID).First(&player).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	return global.GVA_DB.Model(&player).Updates(map[string]interface{}{
		"status":     1,
		"ban_reason": "",
		"ban_time":   nil,
		"unban_time": nil,
	}).Error
}

// UpdatePlayer 更新玩家信息
func (s *DDZPlayerService) UpdatePlayer(req ddzReq.DDZPlayerUpdate) error {
	var player ddz.DDZPlayer
	err := global.GVA_DB.First(&player, req.ID).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.Gender > 0 {
		updates["gender"] = req.Gender
	}
	if req.VipLevel >= 0 {
		updates["vip_level"] = req.VipLevel
	}
	if req.Coins != 0 {
		updates["coins"] = req.Coins
	}
	if req.Diamonds != 0 {
		updates["diamonds"] = req.Diamonds
	}

	return global.GVA_DB.Model(&player).Updates(updates).Error
}

// UpdatePlayerCoins 更新玩家金币
func (s *DDZPlayerService) UpdatePlayerCoins(req ddzReq.DDZPlayerCoinsUpdate) error {
	return global.GVA_DB.Model(&ddz.DDZPlayer{}).
		Where("player_id = ?", req.PlayerID).
		Update("coins", gorm.Expr("coins + ?", req.Coins)).Error
}

// toPlayerResponse 转换为响应格式
func (s *DDZPlayerService) toPlayerResponse(p ddz.DDZPlayer) ddzRes.DDZPlayerResponse {
	winRate := float64(0)
	if p.TotalGames > 0 {
		winRate = float64(p.WinCount) / float64(p.TotalGames) * 100
	}

	var banTime, unbanTime string
	if p.BanTime != nil {
		banTime = *p.BanTime
	}
	if p.UnbanTime != nil {
		unbanTime = *p.UnbanTime
	}

	var lastLoginAt string
	if p.LastLoginAt != nil {
		lastLoginAt = *p.LastLoginAt
	}

	return ddzRes.DDZPlayerResponse{
		ID:           p.ID,
		PlayerID:     p.PlayerID,
		Nickname:     p.Nickname,
		Avatar:       p.Avatar,
		Gender:       p.Gender,
		Coins:        p.Coins,
		Diamonds:     p.Diamonds,
		WinCount:     p.WinCount,
		LoseCount:    p.LoseCount,
		DrawCount:    p.DrawCount,
		TotalGames:   p.TotalGames,
		WinRate:      winRate,
		MaxWinStreak: p.MaxWinStreak,
		WinStreak:    p.WinStreak,
		Level:        p.Level,
		Experience:   p.Experience,
		VipLevel:     p.VipLevel,
		Status:       p.Status,
		BanReason:    p.BanReason,
		BanTime:      banTime,
		UnbanTime:    unbanTime,
		LastLoginIP:  p.LastLoginIP,
		LastLoginAt:  lastLoginAt,
		RegisterIP:   p.RegisterIP,
		DeviceID:     p.DeviceID,
		CreatedAt:    p.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:    p.UpdatedAt.Format("2006-01-02 15:04:05"),
	}
}
