package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// =============================================
// 机器人配置请求
// =============================================

// DDZRobotConfigSearch 机器人配置搜索请求
type DDZRobotConfigSearch struct {
	request.PageInfo
	ConfigName string `json:"configName" form:"configName"`
	Status     *int8  `json:"status" form:"status"`
	IsDefault  *int8  `json:"isDefault" form:"isDefault"`
}

// DDZRobotConfigCreate 创建机器人配置请求
type DDZRobotConfigCreate struct {
	ConfigName             string  `json:"configName" binding:"required"`
	MinThinkTime           int     `json:"minThinkTime" binding:"min=500,max=10000"`           // 最小思考时间(ms)
	MaxThinkTime           int     `json:"maxThinkTime" binding:"min=500,max=10000"`           // 最大思考时间(ms)
	BombThinkTime          int     `json:"bombThinkTime" binding:"min=500,max=10000"`          // 炸弹思考时间(ms)
	BombProbability        float64 `json:"bombProbability" binding:"min=0,max=1"`              // 炸弹使用概率(0-1)
	LandlordBidProbability float64 `json:"landlordBidProbability" binding:"min=0,max=1"`       // 抢地主概率(0-1)
	LetWinProbability      float64 `json:"letWinProbability" binding:"min=0,max=1"`            // 决赛让牌概率(0-1)
	LetWinMinRank          int     `json:"letWinMinRank" binding:"min=1,max=10"`               // 触发让牌的最小排名
	IsDefault              int8    `json:"isDefault"`                                          // 是否默认配置
	Status                 int8    `json:"status"`                                             // 状态
	Description            string  `json:"description"`                                        // 配置描述
}

// DDZRobotConfigUpdate 更新机器人配置请求
type DDZRobotConfigUpdate struct {
	ID                     uint64  `json:"id" binding:"required"`
	ConfigName             string  `json:"configName"`
	MinThinkTime           int     `json:"minThinkTime" binding:"omitempty,min=500,max=10000"`
	MaxThinkTime           int     `json:"maxThinkTime" binding:"omitempty,min=500,max=10000"`
	BombThinkTime          int     `json:"bombThinkTime" binding:"omitempty,min=500,max=10000"`
	BombProbability        float64 `json:"bombProbability" binding:"omitempty,min=0,max=1"`
	LandlordBidProbability float64 `json:"landlordBidProbability" binding:"omitempty,min=0,max=1"`
	LetWinProbability      float64 `json:"letWinProbability" binding:"omitempty,min=0,max=1"`
	LetWinMinRank          int     `json:"letWinMinRank" binding:"omitempty,min=1,max=10"`
	IsDefault              int8    `json:"isDefault"`
	Status                 int8    `json:"status"`
	Description            string  `json:"description"`
}

// DDZRobotConfigDelete 删除机器人配置请求
type DDZRobotConfigDelete struct {
	ID uint64 `json:"id" binding:"required"`
}

// DDZRobotConfigSetDefault 设置默认配置请求
type DDZRobotConfigSetDefault struct {
	ID uint64 `json:"id" binding:"required"`
}
