package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZGoldLogService struct{}

var DDZGoldLogServiceApp = new(DDZGoldLogService)

// GetGoldLogList 获取金币流水列表
func (s *DDZGoldLogService) GetGoldLogList(req ddzReq.DDZGoldLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        query := db.Model(&ddz.DDZGoldLog{})
        if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                query = query.Where("player_id = ?", req.PlayerID.Value)
        }
        if req.ChangeType != nil {
                query = query.Where("change_type = ?", *req.ChangeType)
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

        var logs []ddz.DDZGoldLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZGoldLogResponse, 0, len(logs))
        for _, l := range logs {
                resp := ddzRes.DDZGoldLogResponse{
                        ID:             l.ID,
                        PlayerID:       l.PlayerID,
                        BeforeGold:     l.BalanceAfter - l.ChangeAmount,
                        ChangeAmount:   l.ChangeAmount,
                        BalanceAfter:   l.BalanceAfter,
                        ChangeType:     int(l.ChangeType),
                        ChangeTypeText: ddz.CoinChangeTypeText[l.ChangeType],
                        RelatedID:      l.RelatedID,
                        Remark:         l.Remark,
                        CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
                }
                // 获取玩家信息
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                        resp.PlayerName = player.Nickname
                        resp.PlayerAvatar = player.Avatar
                }
                result = append(result, resp)
        }

        return result, total, nil
}

// GetArenaCoinLogList 获取竞技币流水列表
func (s *DDZGoldLogService) GetArenaCoinLogList(req ddzReq.DDZArenaCoinLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        query := db.Model(&ddz.DDZArenaCoinLog{})
        if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                query = query.Where("player_id = ?", req.PlayerID.Value)
        }
        if req.ChangeType != nil {
                query = query.Where("change_type = ?", *req.ChangeType)
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

        var logs []ddz.DDZArenaCoinLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZArenaCoinLogResponse, 0, len(logs))
        for _, l := range logs {
                resp := ddzRes.DDZArenaCoinLogResponse{
                        ID:             l.ID,
                        PlayerID:       l.PlayerID,
                        BeforeBalance:  l.BalanceAfter - l.ChangeAmount,
                        ChangeAmount:   l.ChangeAmount,
                        BalanceAfter:   l.BalanceAfter,
                        ChangeType:     int(l.ChangeType),
                        ChangeTypeText: ddz.CoinChangeTypeText[l.ChangeType],
                        RelatedID:      l.RelatedID,
                        Remark:         l.Remark,
                        CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
                }
                // 获取玩家信息
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", l.PlayerID).First(&player).Error; err == nil {
                        resp.PlayerName = player.Nickname
                        resp.PlayerAvatar = player.Avatar
                }
                result = append(result, resp)
        }

        return result, total, nil
}
