package ddz

import (
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZSystemService struct{}

// GetPendingGameDataList 获取待处理数据列表
func (s *DDZSystemService) GetPendingGameDataList(req ddzReq.DDZPendingGameDataSearch) (list []ddz.DDZPendingGameData, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_pending_game_data")
        if req.DataType != "" {
                db = db.Where("data_type = ?", req.DataType)
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

// GetWriteQueueErrorLogList 获取写入队列错误日志列表
func (s *DDZSystemService) GetWriteQueueErrorLogList(req ddzReq.DDZWriteQueueErrorLogSearch) (list []ddz.DDZWriteQueueErrorLog, total int64, err error) {
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        db := GetDDZDB().Table("ddz_write_queue_error_logs")
        if req.QueueName != "" {
                db = db.Where("queue_name = ?", req.QueueName)
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
