package ddz

import (
	"errors"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
	"gorm.io/gorm"
)

type DDZPlayerService struct{}

var DDZPlayerServiceApp = new(DDZPlayerService)

// CreatePlayer 创建玩家
func (s *DDZPlayerService) CreatePlayer(req ddzReq.DDZPlayerCreate) (ddzRes.DDZPlayerResponse, error) {
	db := GetDDZDB()
	// 检查用户名是否已存在
	var count int64
	db.Model(&ddz.DDZPlayer{}).Where("username = ? OR nickname = ?", req.PlayerID, req.Nickname).Count(&count)
	if count > 0 {
		return ddzRes.DDZPlayerResponse{}, errors.New("玩家ID或昵称已存在")
	}

	// 创建玩家
	player := ddz.DDZPlayer{
		Username:   req.PlayerID,
		Nickname:   req.Nickname,
		Avatar:     req.Avatar,
		Gender:     uint8(req.Gender),
		Gold:       req.Coins,
		Diamond:    int(req.Diamonds),
		VIPLevel:   req.VipLevel,
		Level:      1,
		Status:     1, // 默认正常状态
	}

	err := db.Create(&player).Error
	if err != nil {
		return ddzRes.DDZPlayerResponse{}, err
	}

	return s.toPlayerResponse(player), nil
}

// DeletePlayer 删除玩家（根据ID）
func (s *DDZPlayerService) DeletePlayer(id uint) error {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.First(&player, id).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	return db.Delete(&player).Error
}

// DeletePlayerByPlayerID 删除玩家（根据Username/PlayerID）
func (s *DDZPlayerService) DeletePlayerByPlayerID(playerID string) error {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.Where("username = ?", playerID).First(&player).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	return db.Delete(&player).Error
}

// GetPlayerList 获取玩家列表
func (s *DDZPlayerService) GetPlayerList(req ddzReq.DDZPlayerSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)
	query := db.Model(&ddz.DDZPlayer{})

	if req.PlayerID != "" {
		query = query.Where("username = ? OR id = ?", req.PlayerID, req.PlayerID)
	}
	if req.Nickname != "" {
		query = query.Where("nickname LIKE ?", "%"+req.Nickname+"%")
	}
	if req.Status != nil {
		query = query.Where("status = ?", *req.Status)
	}
	if req.VipLevel > 0 {
		query = query.Where("vip_level = ?", req.VipLevel)
	}
	if req.MinCoins > 0 {
		query = query.Where("gold >= ?", req.MinCoins)
	}
	if req.MaxCoins > 0 {
		query = query.Where("gold <= ?", req.MaxCoins)
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var players []ddz.DDZPlayer
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&players).Error
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
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.First(&player, id).Error
	if err != nil {
		return ddzRes.DDZPlayerResponse{}, err
	}
	return s.toPlayerResponse(player), nil
}

// GetPlayerByPlayerID 根据Username/PlayerID获取玩家
func (s *DDZPlayerService) GetPlayerByPlayerID(playerID string) (ddzRes.DDZPlayerResponse, error) {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.Where("username = ?", playerID).First(&player).Error
	if err != nil {
		return ddzRes.DDZPlayerResponse{}, err
	}
	return s.toPlayerResponse(player), nil
}

// BanPlayer 封禁玩家
func (s *DDZPlayerService) BanPlayer(req ddzReq.DDZPlayerBan) error {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.Where("username = ?", req.PlayerID).First(&player).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	return db.Model(&player).Update("status", 2).Error
}

// UnbanPlayer 解封玩家
func (s *DDZPlayerService) UnbanPlayer(req ddzReq.DDZPlayerUnban) error {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.Where("username = ?", req.PlayerID).First(&player).Error
	if err != nil {
		return errors.New("玩家不存在")
	}

	return db.Model(&player).Update("status", 1).Error
}

// UpdatePlayer 更新玩家信息
func (s *DDZPlayerService) UpdatePlayer(req ddzReq.DDZPlayerUpdate) error {
	db := GetDDZDB()
	var player ddz.DDZPlayer
	err := db.First(&player, req.ID).Error
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
		updates["gold"] = req.Coins
	}
	if req.Diamonds != 0 {
		updates["diamond"] = req.Diamonds
	}

	return db.Model(&player).Updates(updates).Error
}

// UpdatePlayerCoins 更新玩家金币
func (s *DDZPlayerService) UpdatePlayerCoins(req ddzReq.DDZPlayerCoinsUpdate) error {
	db := GetDDZDB()
	return db.Model(&ddz.DDZPlayer{}).
		Where("username = ?", req.PlayerID).
		Update("gold", gorm.Expr("gold + ?", req.Coins)).Error
}

// toPlayerResponse 转换为响应格式
func (s *DDZPlayerService) toPlayerResponse(p ddz.DDZPlayer) ddzRes.DDZPlayerResponse {
	totalGames := p.WinCount + p.LoseCount
	winRate := float64(0)
	if totalGames > 0 {
		winRate = float64(p.WinCount) / float64(totalGames) * 100
	}

	var lastLoginAt string
	if p.LastLoginAt != nil {
		lastLoginAt = p.LastLoginAt.Format("2006-01-02 15:04:05")
	}

	return ddzRes.DDZPlayerResponse{
		ID:          uint(p.ID),
		PlayerID:    p.Username,
		Nickname:    p.Nickname,
		Avatar:      p.Avatar,
		Gender:      int(p.Gender),
		Coins:       p.Gold,
		Diamonds:    int64(p.Diamond),
		WinCount:    p.WinCount,
		LoseCount:   p.LoseCount,
		DrawCount:   0,
		TotalGames:  totalGames,
		WinRate:     winRate,
		MaxWinStreak: 0,
		WinStreak:   0,
		Level:       p.Level,
		Experience:  p.Experience,
		VipLevel:    p.VIPLevel,
		Status:      int(p.Status),
		BanReason:   "",
		BanTime:     "",
		UnbanTime:   "",
		LastLoginIP: p.LastLoginIP,
		LastLoginAt: lastLoginAt,
		RegisterIP:  "",
		DeviceID:    "",
		CreatedAt:   p.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:   p.UpdatedAt.Format("2006-01-02 15:04:05"),
	}
}
