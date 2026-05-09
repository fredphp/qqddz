package ddz

import "time"

// DDZAdReward 广告奖励日志模型
type DDZAdReward struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PlayerID     uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	AdType       uint8     `gorm:"not null;index;comment:广告类型:1-激励视频,2-插屏广告,3-横幅广告" json:"adType"`
	RewardAmount int64     `gorm:"not null;comment:奖励数量" json:"rewardAmount"`
	CurrencyType uint8     `gorm:"not null;comment:货币类型:1-金币,2-钻石,3-竞技币" json:"currencyType"`
	CreatedAt    time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZAdReward) TableName() string {
	return "ddz_ad_rewards"
}

// 广告类型常量
const (
	AdTypeRewardedVideo = 1 // 激励视频
	AdTypeInterstitial  = 2 // 插屏广告
	AdTypeBanner        = 3 // 横幅广告
)

// 货币类型常量
const (
	CurrencyTypeGold      = 1 // 金币
	CurrencyTypeDiamond   = 2 // 钻石
	CurrencyTypeArenaCoin = 3 // 竞技币
)

// 广告类型文本映射
var AdTypeText = map[uint8]string{
	1: "激励视频",
	2: "插屏广告",
	3: "横幅广告",
}

// 货币类型文本映射
var CurrencyTypeText = map[uint8]string{
	1: "金币",
	2: "钻石",
	3: "竞技币",
}
