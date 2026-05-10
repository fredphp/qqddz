package response

// DDZCoinLogResponse 流水日志响应
type DDZCoinLogResponse struct {
	ID           uint64 `json:"id"`
	PlayerID     uint64 `json:"playerId"`
	ChangeAmount int64  `json:"changeAmount"`
	BalanceAfter int64  `json:"balanceAfter"`
	ChangeType   int    `json:"changeType"`
	ChangeTypeText string `json:"changeTypeText"`
	RelatedID    string `json:"relatedId"`
	Remark       string `json:"remark"`
	CreatedAt    string `json:"createdAt"`
}

// DDZCoinLogListResponse 流水日志列表响应
type DDZCoinLogListResponse struct {
	List        []DDZCoinLogResponse `json:"list"`
	Total       int64                `json:"total"`
	Page        int                  `json:"page"`
	PageSize    int                  `json:"pageSize"`
	CurrencyType string              `json:"currencyType"`
}
