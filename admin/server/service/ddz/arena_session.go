package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZArenaSessionService struct{}

// GetArenaSessionList 获取会话列表
func (s *DDZArenaSessionService) GetArenaSessionList(req ddzReq.DDZArenaSessionSearch) (list []ddz.DDZArenaSession, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_arena_sessions")
        if req.PeriodNo != "" {
                db = db.Where("period_no = ?", req.PeriodNo)
        }
        if req.RoomConfigID.Valid && req.RoomConfigID.Value > 0 {
                db = db.Where("room_config_id = ?", req.RoomConfigID.Value)
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

// GetArenaSessionByID 根据ID获取会话
func (s *DDZArenaSessionService) GetArenaSessionByID(id uint64) (ddz.DDZArenaSession, error) {
        var session ddz.DDZArenaSession
        err := GetDDZDB().Table("ddz_arena_sessions").Where("id = ?", id).First(&session).Error
        return session, err
}
