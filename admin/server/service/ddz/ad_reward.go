package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZAdRewardService struct{}

var DDZAdRewardServiceApp = new(DDZAdRewardService)

// GetAdRewardList 获取广告奖励日志列表
func (s *DDZAdRewardService) GetAdRewardList(req ddzReq.DDZAdRewardSearch) (list interface{}, total int64, err error) {
	db := GetDDZDB()
	limit := req.PageSize
	offset := req.PageSize * (req.Page - 1)

	query := db.Model(&ddz.DDZAdReward{})
	if req.PlayerID > 0 {
		query = query.Where("player_id = ?", req.PlayerID)
	}
	if req.AdType != nil {
		query = query.Where("ad_type = ?", *req.AdType)
	}
	if req.CurrencyType != nil {
		query = query.Where("currency_type = ?", *req.CurrencyType)
	}
	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate+" 00:00:00")
	}
	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
	}

	err = query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	var rewards []ddz.DDZAdReward
	err = query.Limit(limit).Offset(offset).Order("id desc").Find(&rewards).Error
	if err != nil {
		return nil, 0, err
	}

	result := make([]ddzRes.DDZAdRewardResponse, 0, len(rewards))
	for _, r := range rewards {
		result = append(result, ddzRes.DDZAdRewardResponse{
			ID:           r.ID,
			PlayerID:     r.PlayerID,
			AdType:       int(r.AdType),
			AdTypeText:   ddz.AdTypeText[r.AdType],
			RewardAmount: r.RewardAmount,
			CurrencyType: int(r.CurrencyType),
			CurrencyText: ddz.CurrencyTypeText[r.CurrencyType],
			CreatedAt:    r.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return result, total, nil
}
