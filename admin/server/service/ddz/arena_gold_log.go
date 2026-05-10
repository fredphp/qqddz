package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
)

type DDZArenaGoldLogService struct{}

var DDZArenaGoldLogServiceApp = new(DDZArenaGoldLogService)

// GetArenaGoldLogList 获取竞技场金币流水列表
func (s *DDZArenaGoldLogService) GetArenaGoldLogList(req ddzReq.DDZArenaGoldLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        query := db.Model(&ddz.DDZArenaGoldLog{})
        if req.PlayerID.Valid && req.PlayerID.Value > 0 {
                query = query.Where("player_id = ?", req.PlayerID.Value)
        }
        if req.PeriodNo != "" {
                query = query.Where("period_no = ?", req.PeriodNo)
        }
        if req.RoomID.Valid && req.RoomID.Value > 0 {
                query = query.Where("room_id = ?", req.RoomID.Value)
        }
        if req.StartDate != "" {
                query = query.Where("created_at >= ?", req.StartDate+" 00:00:00")
        }
        if req.EndDate != "" {
                query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
        }
        if req.Reason != "" {
                query = query.Where("reason = ?", req.Reason)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZArenaGoldLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZArenaGoldLogResponse, 0, len(logs))
        for _, l := range logs {
                result = append(result, ddzRes.DDZArenaGoldLogResponse{
                        ID:         l.ID,
                        PeriodNo:   l.PeriodNo,
                        RoomID:     l.RoomID,
                        PlayerID:   l.PlayerID,
                        MatchID:    l.MatchID,
                        BeforeGold: l.BeforeGold,
                        ChangeGold: l.ChangeGold,
                        AfterGold:  l.AfterGold,
                        Reason:     l.Reason,
                        CreatedAt:  l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}
