package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

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
