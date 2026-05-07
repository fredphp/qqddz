package ddz

import (
        "errors"
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
)

type DDZRewardService struct{}

var DDZRewardServiceApp = new(DDZRewardService)

// ==================== 奖励商品相关方法 ====================

// GetRewardGoodsList 获取奖励商品列表
func (s *DDZRewardService) GetRewardGoodsList(req ddzReq.DDZRewardGoodsSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZRewardGoods{})

        if req.Name != "" {
                query = query.Where("name LIKE ?", "%"+req.Name+"%")
        }
        if req.RewardType != nil {
                query = query.Where("reward_type = ?", *req.RewardType)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var goods []ddz.DDZRewardGoods
        err = query.Limit(limit).Offset(offset).Order("sort_order asc, id desc").Find(&goods).Error
        if err != nil {
                return nil, 0, err
        }

        return goods, total, nil
}

// GetRewardGoodsByID 根据ID获取奖励商品详情
func (s *DDZRewardService) GetRewardGoodsByID(id uint) (ddz.DDZRewardGoods, error) {
        db := GetDDZDB()
        var goods ddz.DDZRewardGoods
        err := db.First(&goods, id).Error
        return goods, err
}

// CreateRewardGoods 创建奖励商品
func (s *DDZRewardService) CreateRewardGoods(req ddzReq.DDZRewardGoodsCreate) error {
        db := GetDDZDB()

        goods := ddz.DDZRewardGoods{
                Name:           req.Name,
                Image:          req.Image,
                RoomConfigIDs:  req.RoomConfigIDs,
                DetailRichtext: req.DetailRichtext,
                RewardType:     req.RewardType,
                RewardValue:    req.RewardValue,
                Stock:          req.Stock,
                Status:         req.Status,
                SortOrder:      req.SortOrder,
        }

        return db.Create(&goods).Error
}

// UpdateRewardGoods 更新奖励商品
func (s *DDZRewardService) UpdateRewardGoods(req ddzReq.DDZRewardGoodsUpdate) error {
        db := GetDDZDB()
        var goods ddz.DDZRewardGoods
        err := db.First(&goods, req.ID).Error
        if err != nil {
                return errors.New("商品不存在")
        }

        updates := map[string]interface{}{}
        if req.Name != "" {
                updates["name"] = req.Name
        }
        if req.Image != "" {
                updates["image"] = req.Image
        }
        updates["room_config_ids"] = req.RoomConfigIDs
        updates["detail_richtext"] = req.DetailRichtext
        if req.RewardType > 0 {
                updates["reward_type"] = req.RewardType
        }
        updates["reward_value"] = req.RewardValue
        updates["stock"] = req.Stock
        updates["status"] = req.Status
        updates["sort_order"] = req.SortOrder

        return db.Model(&goods).Updates(updates).Error
}

// DeleteRewardGoods 删除奖励商品
func (s *DDZRewardService) DeleteRewardGoods(id uint) error {
        db := GetDDZDB()
        return db.Delete(&ddz.DDZRewardGoods{}, id).Error
}

// ==================== 奖励订单相关方法 ====================

// GetRewardOrderList 获取奖励订单列表
func (s *DDZRewardService) GetRewardOrderList(req ddzReq.DDZRewardOrderSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZRewardOrder{})

        if req.OrderNo != "" {
                query = query.Where("order_no = ?", req.OrderNo)
        }
        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.RoomConfigID != nil {
                query = query.Where("room_config_id = ?", *req.RoomConfigID)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }
        if req.StartDate != "" {
                query = query.Where("created_at >= ?", req.StartDate)
        }
        if req.EndDate != "" {
                query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var orders []ddz.DDZRewardOrder
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&orders).Error
        if err != nil {
                return nil, 0, err
        }

        return orders, total, nil
}

// GetRewardOrderByID 根据ID获取订单详情
func (s *DDZRewardService) GetRewardOrderByID(id uint) (ddz.DDZRewardOrder, error) {
        db := GetDDZDB()
        var order ddz.DDZRewardOrder
        err := db.First(&order, id).Error
        return order, err
}

// ShipRewardOrder 发货
func (s *DDZRewardService) ShipRewardOrder(req ddzReq.DDZRewardOrderShip) error {
        db := GetDDZDB()
        var order ddz.DDZRewardOrder
        err := db.First(&order, req.ID).Error
        if err != nil {
                return errors.New("订单不存在")
        }

        if order.Status != ddz.OrderStatusPendingShip {
                return errors.New("订单状态不允许发货")
        }

        now := time.Now().Format("2006-01-02 15:04:05")
        updates := map[string]interface{}{
                "express_company": req.ExpressCompany,
                "express_no":      req.ExpressNo,
                "shipped_at":      now,
                "status":          ddz.OrderStatusShipped,
        }

        return db.Model(&order).Updates(updates).Error
}

// CancelRewardOrder 取消订单
func (s *DDZRewardService) CancelRewardOrder(req ddzReq.DDZRewardOrderCancel) error {
        db := GetDDZDB()
        var order ddz.DDZRewardOrder
        err := db.First(&order, req.ID).Error
        if err != nil {
                return errors.New("订单不存在")
        }

        if order.Status == ddz.OrderStatusCompleted || order.Status == ddz.OrderStatusCancelled {
                return errors.New("订单状态不允许取消")
        }

        updates := map[string]interface{}{
                "status": ddz.OrderStatusCancelled,
                "remark": req.Remark,
        }

        return db.Model(&order).Updates(updates).Error
}
