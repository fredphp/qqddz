package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZArenaRoundRecordService struct{}

// GetArenaRoundRecordList 获取轮次记录列表
func (s *DDZArenaRoundRecordService) GetArenaRoundRecordList(req ddzReq.DDZArenaRoundRecordSearch) (list []ddz.DDZArenaRoundRecord, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_arena_round_records")
        if req.SessionID.Valid && req.SessionID.Value > 0 {
                db = db.Where("session_id = ?", req.SessionID.Value)
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
