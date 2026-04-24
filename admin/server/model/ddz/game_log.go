package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZGameRecord 游戏记录模型
type DDZGameRecord struct {
	global.GVA_MODEL
	GameID          string  `json:"gameId" gorm:"uniqueIndex;comment:游戏唯一标识"`
	RoomID          string  `json:"roomId" gorm:"index;comment:房间ID"`
	RoomType        int     `json:"roomType" gorm:"default:1;comment:房间类型"`
	LandlordID      uint64  `json:"landlordId" gorm:"index;comment:地主玩家ID"`
	Farmer1ID       uint64  `json:"farmer1Id" gorm:"index;comment:农民1玩家ID"`
	Farmer2ID       uint64  `json:"farmer2Id" gorm:"index;评论:农民2玩家ID"`
	BaseScore       int     `json:"baseScore" gorm:"default:1;comment:底分"`
	Multiplier      int     `json:"multiplier" gorm:"default:1;comment:最终倍数"`
	BombCount       int     `json:"bombCount" gorm:"default:0;comment:炸弹数量"`
	Spring          int     `json:"spring" gorm:"default:0;comment:是否春天 0否 1地主春天 2反春天"`
	Result          int     `json:"result" gorm:"index;comment:结果 1地主胜 2农民胜"`
	LandlordWinGold int64   `json:"landlordWinGold" gorm:"default:0;comment:地主输赢金币"`
	Farmer1WinGold  int64   `json:"farmer1WinGold" gorm:"default:0;comment:农民1输赢金币"`
	Farmer2WinGold  int64   `json:"farmer2WinGold" gorm:"default:0;评论:农民2输赢金币"`
	StartedAt       string  `json:"startedAt" gorm:"index;comment:开始时间"`
	EndedAt         *string `json:"endedAt" gorm:"comment:结束时间"`
	DurationSeconds int     `json:"durationSeconds" gorm:"default:0;comment:游戏时长(秒)"`
}

func (DDZGameRecord) TableName() string {
	return "ddz_game_records"
}

// DDZBidLog 叫地主日志模型
type DDZBidLog struct {
	global.GVA_MODEL
	GameID    string `json:"gameId" gorm:"index;comment:游戏唯一标识"`
	PlayerID  uint64 `json:"playerId" gorm:"index;comment:玩家ID"`
	BidOrder  int    `json:"bidOrder" gorm:"index;comment:叫地主顺序(1-3)"`
	BidType   int    `json:"bidType" gorm:"comment:叫地主类型 0不叫 1叫地主 2抢地主"`
	BidScore  int    `json:"bidScore" gorm:"default:0;comment:叫分(1-3分)"`
	IsSuccess int    `json:"isSuccess" gorm:"default:0;comment:是否成功成为地主"`
}

func (DDZBidLog) TableName() string {
	return "ddz_bid_logs"
}

// DDZDealLog 发牌日志模型
type DDZDealLog struct {
	global.GVA_MODEL
	GameID       string `json:"gameId" gorm:"index;comment:游戏唯一标识"`
	PlayerID     uint64 `json:"playerId" gorm:"index;comment:玩家ID"`
	PlayerRole   int    `json:"playerRole" gorm:"comment:玩家角色 1地主 2农民"`
	HandCards    string `json:"handCards" gorm:"comment:手牌(逗号分隔的牌编码)"`
	CardsCount   int    `json:"cardsCount" gorm:"default:0;comment:手牌数量"`
	LandlordCards string `json:"landlordCards" gorm:"comment:底牌(仅地主有)"`
}

func (DDZDealLog) TableName() string {
	return "ddz_deal_logs"
}

// DDZPlayLog 出牌日志模型
type DDZPlayLog struct {
	global.GVA_MODEL
	GameID      string `json:"gameId" gorm:"index;comment:游戏唯一标识"`
	PlayerID    uint64 `json:"playerId" gorm:"index;comment:玩家ID"`
	PlayerRole  int    `json:"playerRole" gorm:"comment:玩家角色 1地主 2农民"`
	RoundNum    int    `json:"roundNum" gorm:"index;comment:回合数"`
	PlayOrder   int    `json:"playOrder" gorm:"comment:本回合出牌顺序"`
	PlayType    int    `json:"playType" gorm:"comment:出牌类型 1出牌 2不出 3超时自动出牌"`
	Cards       string `json:"cards" gorm:"comment:出的牌"`
	CardsCount  int    `json:"cardsCount" gorm:"default:0;comment:出牌数量"`
	CardPattern string `json:"cardPattern" gorm:"comment:牌型"`
	IsBomb      int    `json:"isBomb" gorm:"default:0;comment:是否炸弹"`
	IsRocket    int    `json:"isRocket" gorm:"default:0;comment:是否火箭"`
}

func (DDZPlayLog) TableName() string {
	return "ddz_play_logs"
}

// DDZPlayerStat 玩家统计模型
type DDZPlayerStat struct {
	global.GVA_MODEL
	PlayerID        uint64  `json:"playerId" gorm:"uniqueIndex:idx_player_date;index;comment:玩家ID"`
	StatDate        string  `json:"statDate" gorm:"uniqueIndex:idx_player_date;index;comment:统计日期"`
	TotalGames      int     `json:"totalGames" gorm:"default:0;comment:总场次"`
	WinGames        int     `json:"winGames" gorm:"default:0;comment:胜场"`
	LoseGames       int     `json:"loseGames" gorm:"default:0;comment:负场"`
	WinRate         float64 `json:"winRate" gorm:"default:0;comment:胜率(%)"`
	LandlordGames   int     `json:"landlordGames" gorm:"default:0;comment:当地主场次"`
	LandlordWins    int     `json:"landlordWins" gorm:"default:0;comment:当地主胜场"`
	FarmerGames     int     `json:"farmerGames" gorm:"default:0;comment:当农民场次"`
	FarmerWins      int     `json:"farmerWins" gorm:"default:0;评论:当农民胜场"`
	TotalGoldChange int64   `json:"totalGoldChange" gorm:"default:0;comment:总金币变化"`
	MaxWinGold      int64   `json:"maxWinGold" gorm:"default:0;comment:单局最大赢金"`
	MaxLoseGold     int64   `json:"maxLoseGold" gorm:"default:0;comment:单局最大输金"`
	TotalBombs      int     `json:"totalBombs" gorm:"default:0;comment:炸弹总数"`
	TotalRockets    int     `json:"totalRockets" gorm:"default:0;comment:火箭总数"`
	SpringCount     int     `json:"springCount" gorm:"default:0;comment:春天次数"`
	AntiSpringCount int     `json:"antiSpringCount" gorm:"default:0;comment:反春天次数"`
	AvgGameDuration int     `json:"avgGameDuration" gorm:"default:0;comment:平均游戏时长(秒)"`
}

func (DDZPlayerStat) TableName() string {
	return "ddz_player_stats"
}

// DDZRoomConfig 房间配置模型
type DDZRoomConfig struct {
	global.GVA_MODEL
	RoomName       string  `json:"roomName" gorm:"comment:房间名称"`
	RoomType       int     `json:"roomType" gorm:"uniqueIndex;comment:房间类型 1普通场 2高级场 3富豪场 4至尊场"`
	BaseScore      int     `json:"baseScore" gorm:"default:1;comment:底分"`
	Multiplier     int     `json:"multiplier" gorm:"default:1;comment:初始倍数"`
	MinGold        int64   `json:"minGold" gorm:"default:0;comment:最低入场金币"`
	MaxGold        int64   `json:"maxGold" gorm:"default:0;comment:最高入场金币(0表示无限制)"`
	BotEnabled     int     `json:"botEnabled" gorm:"default:1;comment:是否允许机器人"`
	BotCount       int     `json:"botCount" gorm:"default:0;comment:房间机器人数量"`
	FeeRate        float64 `json:"feeRate" gorm:"default:0;comment:手续费率"`
	MaxRound       int     `json:"maxRound" gorm:"default:20;comment:最大回合数"`
	TimeoutSeconds int     `json:"timeoutSeconds" gorm:"default:30;comment:操作超时时间(秒)"`
	Status         int     `json:"status" gorm:"default:1;comment:状态 0关闭 1开启"`
	SortOrder      int     `json:"sortOrder" gorm:"default:0;comment:排序权重"`
	Description    string  `json:"description" gorm:"comment:房间描述"`
}

func (DDZRoomConfig) TableName() string {
	return "ddz_room_config"
}

// DDZSmsCode 短信验证码模型
type DDZSmsCode struct {
	global.GVA_MODEL
	Phone    string `json:"phone" gorm:"index;comment:手机号"`
	Code     string `json:"code" gorm:"comment:验证码"`
	Type     int    `json:"type" gorm:"default:1;comment:类型 1登录 2注册 3绑定手机 4修改密码"`
	IsUsed   int    `json:"isUsed" gorm:"default:0;comment:是否已使用 0否 1是"`
	ExpireAt string `json:"expireAt" gorm:"comment:过期时间"`
	UsedAt   string `json:"usedAt" gorm:"comment:使用时间"`
	IP       string `json:"ip" gorm:"comment:请求IP"`
}

func (DDZSmsCode) TableName() string {
	return "ddz_sms_codes"
}
