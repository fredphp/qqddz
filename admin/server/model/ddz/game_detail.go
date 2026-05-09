package ddz

import "time"

// DDZDealRecord 发牌记录表
type DDZDealRecord struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	GameID       string    `gorm:"type:varchar(64);not null;index;comment:游戏ID" json:"gameId"`
	PlayerID     uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	Cards        string    `gorm:"type:text;comment:手牌(JSON)" json:"cards"`
	IsLandlord   uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:是否地主:0-否,1-是" json:"isLandlord"`
	LandlordCards string   `gorm:"type:text;comment:地主底牌(JSON)" json:"landlordCards"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZDealRecord) TableName() string {
	return "ddz_deal_records"
}

// DDZGameConfig 游戏配置表
type DDZGameConfig struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement;comment:配置ID" json:"id"`
	ConfigKey   string    `gorm:"type:varchar(64);not null;uniqueIndex;comment:配置键" json:"configKey"`
	ConfigValue string    `gorm:"type:text;comment:配置值" json:"configValue"`
	Description string    `gorm:"type:varchar(256);default:'';comment:配置描述" json:"description"`
	CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
}

func (DDZGameConfig) TableName() string {
	return "ddz_game_configs"
}

// DDZGamePlayRecord 出牌记录表
type DDZGamePlayRecord struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	GameID    string    `gorm:"type:varchar(64);not null;index;comment:游戏ID" json:"gameId"`
	PlayerID  uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	PlayType  uint8     `gorm:"type:tinyint unsigned;not null;comment:出牌类型:1-出牌,2-不出,3-抢地主" json:"playType"`
	Cards     string    `gorm:"type:text;comment:出的牌(JSON)" json:"cards"`
	CreatedAt time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZGamePlayRecord) TableName() string {
	return "ddz_game_play_records"
}

// DDZGamePlayerRecord 游戏玩家记录表
type DDZGamePlayerRecord struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	GameID     string    `gorm:"type:varchar(64);not null;index;comment:游戏ID" json:"gameId"`
	PlayerID   uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	IsLandlord uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:是否地主:0-否,1-是" json:"isLandlord"`
	IsWinner   uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:是否获胜:0-否,1-是" json:"isWinner"`
	GoldChange int64     `gorm:"not null;default:0;comment:金币变化" json:"goldChange"`
	CardCount  int       `gorm:"not null;default:0;comment:剩余牌数" json:"cardCount"`
	CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZGamePlayerRecord) TableName() string {
	return "ddz_game_player_records"
}
