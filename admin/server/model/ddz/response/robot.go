package response

import "time"

// =============================================
// 机器人响应
// =============================================

// DDZRobotResponse 机器人信息响应
type DDZRobotResponse struct {
	ID              uint64    `json:"id"`
	PlayerID        uint64    `json:"playerId"`
	Nickname        string    `json:"nickname"`
	Avatar          string    `json:"avatar"`
	RobotLevel      uint8     `json:"robotLevel"`      // 机器人等级
	AIConfigID      uint64    `json:"aiConfigId"`      // AI配置ID
	AIConfigName    string    `json:"aiConfigName"`    // AI配置名称
	Status          int       `json:"status"`          // 状态: 1-正常 2-禁用
	TotalGames      int       `json:"totalGames"`      // 总对局数
	WinGames        int       `json:"winGames"`        // 胜利对局数
	WinRate         float64   `json:"winRate"`         // 胜率
	LandlordGames   int       `json:"landlordGames"`   // 地主对局数
	LandlordWins    int       `json:"landlordWins"`    // 地主胜利数
	FarmerGames     int       `json:"farmerGames"`     // 农民对局数
	FarmerWins      int       `json:"farmerWins"`      // 农民胜利数
	IsOnline        int       `json:"isOnline"`        // 是否在线
	LastActiveAt    *time.Time `json:"lastActiveAt"`   // 最后活跃时间
	CreatedAt       time.Time `json:"createdAt"`
}

// DDZRobotStatusResponse 机器人状态响应
type DDZRobotStatusResponse struct {
	RobotID      uint64 `json:"robotId"`
	IsBusy       bool   `json:"isBusy"`       // 是否忙碌
	IsLocked     bool   `json:"isLocked"`     // 是否被锁定
	SessionID    string `json:"sessionId"`    // 当前会话ID
	RoomCode     string `json:"roomCode"`     // 当前房间代码
	GameID       string `json:"gameId"`       // 当前游戏ID
	TableID      uint64 `json:"tableId"`      // 当前桌ID
	Role         uint8  `json:"role"`         // 角色: 1-地主 2-农民
	IsLetWin     uint8  `json:"isLetWin"`     // 是否正在让牌
	LetWinTarget uint64 `json:"letWinTarget"` // 让牌目标玩家ID
}

// DDZRobotStatsResponse 机器人统计响应
type DDZRobotStatsResponse struct {
	TotalRobots   int          `json:"totalRobots"`   // 总机器人数量
	IdleRobots    int          `json:"idleRobots"`    // 空闲机器人数量
	BusyRobots    int          `json:"busyRobots"`    // 忙碌机器人数量
	LockedRobots  int          `json:"lockedRobots"`  // 锁定机器人数量
	OnlineRobots  int          `json:"onlineRobots"`  // 在线机器人数量
	LevelStats    []LevelStat  `json:"levelStats"`    // 各等级统计
}

// LevelStat 等级统计
type LevelStat struct {
	Level      uint8 `json:"level"`
	Total      int   `json:"total"`
	Idle       int   `json:"idle"`
	Busy       int   `json:"busy"`
	WinRate    float64 `json:"winRate"`
}

// =============================================
// AI配置响应
// =============================================

// DDZAIConfigResponse AI配置响应
type DDZAIConfigResponse struct {
	ID                uint      `json:"id"`
	ConfigName        string    `json:"configName"`
	RobotLevel        uint8     `json:"robotLevel"`
	PlayStrength      int       `json:"playStrength"`      // AI强度 0-100
	ThinkTimeMin      int       `json:"thinkTimeMin"`      // 最小思考时间(ms)
	ThinkTimeMax      int       `json:"thinkTimeMax"`      // 最大思考时间(ms)
	MistakeProb       int       `json:"mistakeProb"`       // 失误概率 0-100
	BombProb          int       `json:"bombProb"`          // 炸弹使用概率 0-100
	PassProb          int       `json:"passProb"`          // 过牌概率 0-100
	Status            int       `json:"status"`            // 状态 1-正常 2-禁用
	Description       string    `json:"description"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	RobotCount        int       `json:"robotCount"`        // 使用此配置的机器人数量
}

// =============================================
// 补位配置响应
// =============================================

// DDZPatcherConfigResponse 补位配置响应
type DDZPatcherConfigResponse struct {
	EnableAutoFill      bool   `json:"enableAutoFill"`
	FillDelaySeconds    int    `json:"fillDelaySeconds"`
	MaxFillCount        int    `json:"maxFillCount"`
	RobotLevelMin       uint8  `json:"robotLevelMin"`
	RobotLevelMax       uint8  `json:"robotLevelMax"`
	FillStrategy        string `json:"fillStrategy"`
	AllowFinalRoundFill bool   `json:"allowFinalRoundFill"`
}

// DDZFillRecordResponse 补位记录响应
type DDZFillRecordResponse struct {
	ID         uint64    `json:"id"`
	SessionID  uint64    `json:"sessionId"`
	RobotID    uint64    `json:"robotId"`
	PlayerID   uint64    `json:"playerId"`
	Nickname   string    `json:"nickname"`
	FillReason string    `json:"fillReason"`
	FillTime   time.Time `json:"fillTime"`
}

// =============================================
// 不能夺冠配置响应
// =============================================

// DDZNoWinConfigResponse 不能夺冠配置响应
type DDZNoWinConfigResponse struct {
	EnableNoWin       bool   `json:"enableNoWin"`
	StartFromRound    int    `json:"startFromRound"`
	LetWinProbability int    `json:"letWinProbability"`
	ForceLetWin       bool   `json:"forceLetWin"`
	LetWinStrategy    string `json:"letWinStrategy"`
	MaxRank           int    `json:"maxRank"`
}
