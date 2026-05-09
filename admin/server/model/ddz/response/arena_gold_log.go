package response

// DDZArenaGoldLogResponse 竞技场金币流水响应
type DDZArenaGoldLogResponse struct {
	ID         uint64 `json:"ID"`
	PeriodNo   string `json:"periodNo"`
	RoomID     uint64 `json:"roomId"`
	PlayerID   uint64 `json:"playerId"`
	MatchID    string `json:"matchId"`
	BeforeGold int64  `json:"beforeGold"`
	ChangeGold int64  `json:"changeGold"`
	AfterGold  int64  `json:"afterGold"`
	Reason     string `json:"reason"`
	CreatedAt  string `json:"createdAt"`
}
