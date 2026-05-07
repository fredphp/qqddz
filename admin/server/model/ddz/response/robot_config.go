package response

import "time"

// =============================================
// 机器人配置响应
// =============================================

// DDZRobotConfigResponse 机器人配置响应
type DDZRobotConfigResponse struct {
	ID                     uint64    `json:"id"`
	ConfigName             string    `json:"configName"`
	MinThinkTime           int       `json:"minThinkTime"`           // 最小思考时间(ms)
	MaxThinkTime           int       `json:"maxThinkTime"`           // 最大思考时间(ms)
	BombThinkTime          int       `json:"bombThinkTime"`          // 炸弹思考时间(ms)
	BombProbability        float64   `json:"bombProbability"`        // 炸弹使用概率(0-1)
	LandlordBidProbability float64   `json:"landlordBidProbability"` // 抢地主概率(0-1)
	LetWinProbability      float64   `json:"letWinProbability"`      // 决赛让牌概率(0-1)
	LetWinMinRank          int       `json:"letWinMinRank"`          // 触发让牌的最小排名
	IsDefault              int8      `json:"isDefault"`              // 是否默认配置
	Status                 int8      `json:"status"`                 // 状态
	Description            string    `json:"description"`            // 配置描述
	CreatedAt              time.Time `json:"createdAt"`
	UpdatedAt              time.Time `json:"updatedAt"`
}

// DDZRobotConfigListResponse 机器人配置列表响应
type DDZRobotConfigListResponse struct {
	List     []DDZRobotConfigResponse `json:"list"`
	Total    int64                    `json:"total"`
	Page     int                      `json:"page"`
	PageSize int                      `json:"pageSize"`
}

// DDZRobotConfigSimpleResponse 机器人配置简单响应（用于下拉选择）
type DDZRobotConfigSimpleResponse struct {
	ID         uint64 `json:"id"`
	ConfigName string `json:"configName"`
	IsDefault  int8   `json:"isDefault"`
	Status     int8   `json:"status"`
}
