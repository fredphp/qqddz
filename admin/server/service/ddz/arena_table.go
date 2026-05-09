package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZArenaTableService struct{}

// GetArenaTableList 获取桌号列表
func (s *DDZArenaTableService) GetArenaTableList(req ddzReq.DDZArenaTableSearch) (list []ddz.DDZArenaTable, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_arena_tables")
        if req.SessionID > 0 {
                db = db.Where("session_id = ?", req.SessionID)
        }
        if req.RoundID > 0 {
                db = db.Where("round_id = ?", req.RoundID)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}
