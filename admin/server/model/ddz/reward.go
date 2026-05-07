package ddz

import (
        "time"
)

// DDZBaseModel 基础模型（不带软删除，适用于游戏表）
type DDZBaseModel struct {
        ID        uint      `gorm:"primarykey" json:"ID"`
        CreatedAt time.Time `json:"createdAt"`
        UpdatedAt time.Time `json:"updatedAt"`
}

// DDZRewardGoods 奖励商品（对应 ddz_reward_goods 表）
type DDZRewardGoods struct {
        DDZBaseModel
        Name           string `json:"name" gorm:"type:varchar(128);not null;comment:商品名称"`
        Image          string `json:"image" gorm:"type:varchar(512);default:'';comment:商品图片URL"`
        RoomConfigIDs  string `json:"roomConfigIds" gorm:"type:varchar(512);default:'';comment:关联房间配置ID列表(JSON数组)"`
        DetailRichtext string `json:"detailRichtext" gorm:"type:text;comment:商品详情富文本"`
        RewardType     int    `json:"rewardType" gorm:"type:tinyint;not null;default:1;comment:奖励类型:1-实物,2-虚拟货币,3-虚拟道具"`
        RewardValue    int64  `json:"rewardValue" gorm:"type:bigint;not null;default:0;comment:奖励值(实物为空,虚拟货币为金额,道具为道具ID)"`
        Stock          int    `json:"stock" gorm:"type:int;not null;default:0;comment:库存数量"`
        Status         int    `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:状态:0-下架,1-上架"`
        SortOrder      int    `json:"sortOrder" gorm:"type:int;not null;default:0;comment:排序权重"`
}

func (DDZRewardGoods) TableName() string {
        return "ddz_reward_goods"
}

// DDZRewardOrder 奖励订单（对应 ddz_reward_orders 表）
type DDZRewardOrder struct {
        DDZBaseModel
        OrderNo         string `json:"orderNo" gorm:"uniqueIndex;type:varchar(32);not null;comment:订单编号"`
        PlayerID        int64  `json:"playerId" gorm:"index;not null;comment:玩家ID"`
        RewardID        uint   `json:"rewardId" gorm:"index;not null;comment:奖励商品ID"`
        RoomConfigID    uint   `json:"roomConfigId" gorm:"index;comment:房间配置ID"`
        SessionID       int64  `json:"sessionId" gorm:"type:bigint;comment:游戏会话ID"`
        Rank            int    `json:"rank" gorm:"type:int;not null;default:0;comment:排名"`
        Status          int    `json:"status" gorm:"type:tinyint;not null;default:0;index;comment:订单状态:0-待填写,1-待发货,2-已发货,3-已完成"`
        ReceiverName    string `json:"receiverName" gorm:"type:varchar(64);default:'';comment:收货人姓名"`
        ReceiverPhone   string `json:"receiverPhone" gorm:"type:varchar(20);default:'';comment:收货人电话"`
        ReceiverAddress string `json:"receiverAddress" gorm:"type:varchar(512);default:'';comment:收货人地址"`
        ExpressCompany  string `json:"expressCompany" gorm:"type:varchar(64);default:'';comment:快递公司"`
        ExpressNo       string `json:"expressNo" gorm:"type:varchar(64);default:'';comment:快递单号"`
        ShippedAt       string `json:"shippedAt" gorm:"type:datetime;comment:发货时间"`
        CompletedAt     string `json:"completedAt" gorm:"type:datetime;comment:完成时间"`
        Remark          string `json:"remark" gorm:"type:varchar(256);default:'';comment:备注"`
}

func (DDZRewardOrder) TableName() string {
        return "ddz_reward_orders"
}

// 奖励类型常量
const (
        RewardTypePhysical  = 1 // 实物
        RewardTypeVirtual   = 2 // 虚拟货币
        RewardTypeItem      = 3 // 虚拟道具
)

// 订单状态常量
const (
        OrderStatusPendingInfo   = 0 // 待填写收货信息
        OrderStatusPendingShip   = 1 // 待发货
        OrderStatusShipped       = 2 // 已发货
        OrderStatusCompleted     = 3 // 已完成
        OrderStatusCancelled     = 4 // 已取消
)

// GetRewardTypeText 获取奖励类型文本
func GetRewardTypeText(rewardType int) string {
        switch rewardType {
        case RewardTypePhysical:
                return "实物"
        case RewardTypeVirtual:
                return "虚拟货币"
        case RewardTypeItem:
                return "虚拟道具"
        default:
                return "未知"
        }
}

// GetOrderStatusText 获取订单状态文本
func GetOrderStatusText(status int) string {
        switch status {
        case OrderStatusPendingInfo:
                return "待填写"
        case OrderStatusPendingShip:
                return "待发货"
        case OrderStatusShipped:
                return "已发货"
        case OrderStatusCompleted:
                return "已完成"
        case OrderStatusCancelled:
                return "已取消"
        default:
                return "未知"
        }
}
