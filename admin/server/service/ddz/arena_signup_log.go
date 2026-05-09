package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZArenaSignupLogService struct{}

// GetArenaSignupLogList 获取报名日志列表
func (s *DDZArenaSignupLogService) GetArenaSignupLogList(req ddzReq.DDZArenaSignupLogSearch) (list []ddz.DDZArenaSignupLog, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_arena_signup_logs")
        if req.PlayerID > 0 {
                db = db.Where("player_id = ?", req.PlayerID)
        }
        if req.PeriodNo != "" {
                db = db.Where("period_no = ?", req.PeriodNo)
        }
        if req.Action != nil {
                db = db.Where("action = ?", *req.Action)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}
