package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZGameRecord 斗地主游戏记录
type DDZGameRecord struct {
	global.GVA_MODEL
	RoomID       string `json:"roomId" gorm:"index;comment:房间ID"`
	RoomType     int    `json:"roomType" gorm:"comment:房间类型 1普通 2VIP"`
	RoomLevel    int    `json:"roomLevel" gorm:"comment:房间等级"`
	BaseScore    int    `json:"baseScore" gorm:"comment:底分"`
	Multiple     int    `json:"multiple" gorm:"comment:倍数"`
	LandlordID   string `json:"landlordId" gorm:"comment:地主玩家ID"`
	Winner       int    `json:"winner" gorm:"comment:赢家 1地主 2农民"`
	GameDuration int    `json:"gameDuration" gorm:"comment:游戏时长(秒)"`
	GameTime     string `json:"gameTime" gorm:"comment:游戏时间"`
	GameStatus   int    `json:"gameStatus" gorm:"default:1;comment:游戏状态 1进行中 2已结束"`
	Spring       int    `json:"spring" gorm:"default:0;comment:春天 0否 1春天 2反春天"`
	BombCount    int    `json:"bombCount" gorm:"default:0;comment:炸弹数量"`
}

func (DDZGameRecord) TableName() string {
	return "ddz_game_records"
}

// DDZGamePlayerRecord 游戏玩家记录
type DDZGamePlayerRecord struct {
	global.GVA_MODEL
	GameID      string `json:"gameId" gorm:"index;comment:游戏记录ID"`
	PlayerID    string `json:"playerId" gorm:"index;comment:玩家ID"`
	PlayerIndex int    `json:"playerIndex" gorm:"comment:玩家位置 0-2"`
	IsLandlord  int    `json:"isLandlord" gorm:"comment:是否地主 0否 1是"`
	IsWinner    int    `json:"isWinner" gorm:"comment:是否赢家 0否 1是"`
	Score       int64  `json:"score" gorm:"comment:得分(负数为扣分)"`
	CoinsBefore int64  `json:"coinsBefore" gorm:"comment:变化前金币"`
	CoinsAfter  int64  `json:"coinsAfter" gorm:"comment:变化后金币"`
	Cards       string `json:"cards" gorm:"type:text;comment:手牌(序列化)"`
}

func (DDZGamePlayerRecord) TableName() string {
	return "ddz_game_player_records"
}

// DDZGamePlayRecord 游戏出牌记录
type DDZGamePlayRecord struct {
	global.GVA_MODEL
	GameID     string `json:"gameId" gorm:"index;comment:游戏记录ID"`
	PlayerID   string `json:"playerId" gorm:"index;comment:玩家ID"`
	PlayerIndex int   `json:"playerIndex" gorm:"comment:玩家位置"`
	TurnIndex  int    `json:"turnIndex" gorm:"comment:回合序号"`
	ActionType int    `json:"actionType" gorm:"comment:操作类型 1出牌 2不出 3叫地主 4不叫 5抢地主 6不抢"`
	Cards      string `json:"cards" gorm:"type:text;comment:出的牌(序列化)"`
	Timestamp  string `json:"timestamp" gorm:"comment:操作时间"`
}

func (DDZGamePlayRecord) TableName() string {
	return "ddz_game_play_records"
}

// DDZDealRecord 发牌记录
type DDZDealRecord struct {
	global.GVA_MODEL
	GameID        string `json:"gameId" gorm:"uniqueIndex;comment:游戏记录ID"`
	Player0Cards  string `json:"player0Cards" gorm:"type:text;comment:玩家0手牌"`
	Player1Cards  string `json:"player1Cards" gorm:"type:text;comment:玩家1手牌"`
	Player2Cards  string `json:"player2Cards" gorm:"type:text;comment:玩家2手牌"`
	DizhuCards    string `json:"dizhuCards" gorm:"comment:地主牌(三张底牌)"`
	FirstPlayer   int    `json:"firstPlayer" gorm:"comment:首发玩家位置"`
}

func (DDZDealRecord) TableName() string {
	return "ddz_deal_records"
}
