package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// =============================================
// 机器人搜索和管理请求
// =============================================

// DDZRobotSearch 机器人搜索请求
type DDZRobotSearch struct {
	request.PageInfo
	RobotID    uint64 `json:"robotId" form:"robotId"`
	PlayerID   uint64 `json:"playerId" form:"playerId"`
	Nickname   string `json:"nickname" form:"nickname"`
	RobotLevel *uint8 `json:"robotLevel" form:"robotLevel"`   // 机器人等级
	Status     *int   `json:"status" form:"status"`           // 状态
	IsOnline   *int   `json:"isOnline" form:"isOnline"`       // 是否在线
}

// DDZRobotLevelUpdate 更新机器人等级请求
type DDZRobotLevelUpdate struct {
	RobotID    uint64 `json:"robotId" binding:"required"`
	RobotLevel uint8  `json:"robotLevel" binding:"required,min=1,max=5"` // 1-5级
}

// DDZRobotAIConfigUpdate 更新机器人AI配置请求
type DDZRobotAIConfigUpdate struct {
	RobotID    uint64 `json:"robotId" binding:"required"`
	AIConfigID uint64 `json:"aiConfigId" binding:"required"`
}

// DDZRobotBatchStatusUpdate 批量更新机器人状态请求
type DDZRobotBatchStatusUpdate struct {
	RobotIDs []uint64 `json:"robotIds" binding:"required"`
	Status   int      `json:"status" binding:"required"` // 状态: 1-正常 2-禁用
}

// =============================================
// AI配置请求
// =============================================

// DDZAIConfigSearch AI配置搜索请求
type DDZAIConfigSearch struct {
	request.PageInfo
	ConfigName  string `json:"configName" form:"configName"`
	RobotLevel  *uint8 `json:"robotLevel" form:"robotLevel"`
	Status      *int   `json:"status" form:"status"`
}

// DDZAIConfigCreate 创建AI配置请求
type DDZAIConfigCreate struct {
	ConfigName        string `json:"configName" binding:"required"`
	RobotLevel        uint8  `json:"robotLevel" binding:"required,min=1,max=5"`
	PlayStrength      int    `json:"playStrength" binding:"min=0,max=100"`       // AI强度 0-100
	ThinkTimeMin      int    `json:"thinkTimeMin"`                               // 最小思考时间(ms)
	ThinkTimeMax      int    `json:"thinkTimeMax"`                               // 最大思考时间(ms)
	MistakeProb       int    `json:"mistakeProb" binding:"min=0,max=100"`        // 失误概率 0-100
	BombProb          int    `json:"bombProb" binding:"min=0,max=100"`           // 炸弹使用概率 0-100
	PassProb          int    `json:"passProb" binding:"min=0,max=100"`           // 过牌概率 0-100
	Status            int    `json:"status"`                                     // 状态 1-正常 2-禁用
	Description       string `json:"description"`                                // 配置描述
}

// DDZAIConfigUpdate 更新AI配置请求
type DDZAIConfigUpdate struct {
	ID                uint   `json:"ID" binding:"required"`
	ConfigName        string `json:"configName"`
	RobotLevel        uint8  `json:"robotLevel" binding:"min=1,max=5"`
	PlayStrength      int    `json:"playStrength" binding:"min=0,max=100"`
	ThinkTimeMin      int    `json:"thinkTimeMin"`
	ThinkTimeMax      int    `json:"thinkTimeMax"`
	MistakeProb       int    `json:"mistakeProb" binding:"min=0,max=100"`
	BombProb          int    `json:"bombProb" binding:"min=0,max=100"`
	PassProb          int    `json:"passProb" binding:"min=0,max=100"`
	Status            int    `json:"status"`
	Description       string `json:"description"`
}

// DDZAIConfigDelete 删除AI配置请求
type DDZAIConfigDelete struct {
	ID uint `json:"ID" binding:"required"`
}

// =============================================
// 补位配置请求
// =============================================

// DDZPatcherConfigUpdate 更新补位配置请求
type DDZPatcherConfigUpdate struct {
	EnableAutoFill      bool   `json:"enableAutoFill"`      // 是否启用自动补位
	FillDelaySeconds    int    `json:"fillDelaySeconds"`    // 补位延迟时间(秒)
	MaxFillCount        int    `json:"maxFillCount"`        // 最大补位数量
	RobotLevelMin       uint8  `json:"robotLevelMin"`       // 补位机器人最小等级
	RobotLevelMax       uint8  `json:"robotLevelMax"`       // 补位机器人最大等级
	FillStrategy        string `json:"fillStrategy"`        // 补位策略: random/balanced/weak_first
	AllowFinalRoundFill bool   `json:"allowFinalRoundFill"` // 是否允许决赛补位
}

// DDZFillRecordSearch 补位记录搜索请求
type DDZFillRecordSearch struct {
	request.PageInfo
	SessionID  uint64 `json:"sessionId" form:"sessionId"`
	RobotID    uint64 `json:"robotId" form:"robotId"`
	FillReason string `json:"fillReason" form:"fillReason"`
	StartDate  string `json:"startDate" form:"startDate"`
	EndDate    string `json:"endDate" form:"endDate"`
}

// =============================================
// 不能夺冠配置请求
// =============================================

// DDZNoWinConfigUpdate 更新不能夺冠配置请求
type DDZNoWinConfigUpdate struct {
	EnableNoWin       bool   `json:"enableNoWin"`       // 是否启用不能夺冠逻辑
	StartFromRound    int    `json:"startFromRound"`    // 开始让牌的轮次
	LetWinProbability int    `json:"letWinProbability"` // 让牌概率 0-100
	ForceLetWin       bool   `json:"forceLetWin"`       // 是否强制让牌
	LetWinStrategy    string `json:"letWinStrategy"`    // 让牌策略: smart/random/aggressive
	MaxRank           int    `json:"maxRank"`           // 机器人最大可获得排名
}
