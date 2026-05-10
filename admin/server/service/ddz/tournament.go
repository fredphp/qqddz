package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZTournamentService struct{}

// GetTournamentRoundList 获取锦标赛轮次列表
func (s *DDZTournamentService) GetTournamentRoundList(req ddzReq.DDZTournamentRoundSearch) (list []ddz.DDZTournamentRound, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_tournament_rounds")
        if req.SessionID != nil && *req.SessionID > 0 {
                db = db.Where("session_id = ?", *req.SessionID)
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

// GetTournamentEliminationList 获取锦标赛淘汰记录列表
func (s *DDZTournamentService) GetTournamentEliminationList(req ddzReq.DDZTournamentEliminationSearch) (list []ddz.DDZTournamentElimination, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_tournament_eliminations")
        // 通过期号查询（需要关联 session 表）
        if req.PeriodNo != "" {
                db = db.Where("session_id IN (SELECT id FROM ddz_tournament_sessions WHERE period_no = ?)", req.PeriodNo)
        }
        if req.SessionID != nil && *req.SessionID > 0 {
                db = db.Where("session_id = ?", *req.SessionID)
        }
        if req.RoundID != nil && *req.RoundID > 0 {
                db = db.Where("round_id = ?", *req.RoundID)
        }
        if req.PlayerID != nil && *req.PlayerID > 0 {
                db = db.Where("player_id = ?", *req.PlayerID)
        }

        err = db.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        err = db.Order("id DESC").Limit(limit).Offset(offset).Find(&list).Error
        return list, total, err
}
