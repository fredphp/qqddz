package response

// DDZGameRecordResponse 游戏记录响应
type DDZGameRecordResponse struct {
	ID           uint                `json:"ID"`
	RoomID       string              `json:"roomId"`
	RoomType     int                 `json:"roomType"`
	RoomLevel    int                 `json:"roomLevel"`
	BaseScore    int                 `json:"baseScore"`
	Multiple     int                 `json:"multiple"`
	LandlordID   string              `json:"landlordId"`
	Winner       int                 `json:"winner"`
	GameDuration int                 `json:"gameDuration"`
	GameTime     string              `json:"gameTime"`
	Spring       int                 `json:"spring"`
	BombCount    int                 `json:"bombCount"`
	Players      []DDZGamePlayerInfo `json:"players"`
	CreatedAt    string              `json:"createdAt"`
}

// DDZGamePlayerInfo 游戏玩家信息
type DDZGamePlayerInfo struct {
	PlayerID    string `json:"playerId"`
	Nickname    string `json:"nickname"`
	PlayerIndex int    `json:"playerIndex"`
	IsLandlord  int    `json:"isLandlord"`
	IsWinner    int    `json:"isWinner"`
	Score       int64  `json:"score"`
	Cards       string `json:"cards"`
}

// DDZGameRecordListResponse 游戏记录列表响应
type DDZGameRecordListResponse struct {
	List  []DDZGameRecordResponse `json:"list"`
	Total int64                   `json:"total"`
	Page  int                     `json:"page"`
	PageSize int                  `json:"pageSize"`
}

// DDZGameRecordDetailResponse 游戏记录详情响应
type DDZGameRecordDetailResponse struct {
	GameRecord  DDZGameRecordResponse `json:"gameRecord"`
	DealRecord  DDZDealRecordResponse `json:"dealRecord"`
	PlayRecords []DDZPlayRecordResponse `json:"playRecords"`
}

// DDZDealRecordResponse 发牌记录响应
type DDZDealRecordResponse struct {
	ID           uint   `json:"ID"`
	GameID       string `json:"gameId"`
	Player0Cards string `json:"player0Cards"`
	Player1Cards string `json:"player1Cards"`
	Player2Cards string `json:"player2Cards"`
	DizhuCards   string `json:"dizhuCards"`
	FirstPlayer  int    `json:"firstPlayer"`
}

// DDZPlayRecordResponse 出牌记录响应
type DDZPlayRecordResponse struct {
	ID          uint   `json:"ID"`
	GameID      string `json:"gameId"`
	PlayerID    string `json:"playerId"`
	PlayerIndex int    `json:"playerIndex"`
	TurnIndex   int    `json:"turnIndex"`
	ActionType  int    `json:"actionType"`
	Cards       string `json:"cards"`
	Timestamp   string `json:"timestamp"`
}
