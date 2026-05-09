package response

// DDZGoldLogResponse 金币流水响应
type DDZGoldLogResponse struct {
	ID           uint64 `json:"ID"`
	PlayerID     uint64 `json:"playerId"`
	ChangeAmount int64  `json:"changeAmount"`
	BalanceAfter int64  `json:"balanceAfter"`
	ChangeType   int    `json:"changeType"`
	ChangeTypeText string `json:"changeTypeText"`
	RelatedID    string `json:"relatedId"`
	Remark       string `json:"remark"`
	CreatedAt    string `json:"createdAt"`
}

// DDZArenaCoinLogResponse 竞技币流水响应
type DDZArenaCoinLogResponse struct {
	ID           uint64 `json:"ID"`
	PlayerID     uint64 `json:"playerId"`
	ChangeAmount int64  `json:"changeAmount"`
	BalanceAfter int64  `json:"balanceAfter"`
	ChangeType   int    `json:"changeType"`
	ChangeTypeText string `json:"changeTypeText"`
	RelatedID    string `json:"relatedId"`
	Remark       string `json:"remark"`
	CreatedAt    string `json:"createdAt"`
}
