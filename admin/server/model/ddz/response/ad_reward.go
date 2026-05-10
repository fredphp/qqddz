package response

// DDZAdRewardResponse 广告奖励日志响应
type DDZAdRewardResponse struct {
	ID             uint64 `json:"ID"`
	PlayerID       uint64 `json:"playerId"`
	AdType         int    `json:"adType"`
	AdTypeText     string `json:"adTypeText"`
	RewardAmount   int64  `json:"rewardAmount"`
	CurrencyType   int    `json:"currencyType"`
	CurrencyText   string `json:"currencyText"`
	CreatedAt      string `json:"createdAt"`
}
