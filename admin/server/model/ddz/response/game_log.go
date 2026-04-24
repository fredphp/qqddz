package response

// DDZGameRecordResponse 游戏记录响应
type DDZGameRecordResponse struct {
	ID              uint   `json:"ID"`
	GameID          string `json:"gameId"`
	RoomID          string `json:"roomId"`
	RoomType        int    `json:"roomType"`
	RoomTypeName    string `json:"roomTypeName"`
	LandlordID      uint64 `json:"landlordId"`
	LandlordName    string `json:"landlordName"`
	Farmer1ID       uint64 `json:"farmer1Id"`
	Farmer1Name     string `json:"farmer1Name"`
	Farmer2ID       uint64 `json:"farmer2Id"`
	Farmer2Name     string `json:"farmer2Name"`
	BaseScore       int    `json:"baseScore"`
	Multiplier      int    `json:"multiplier"`
	BombCount       int    `json:"bombCount"`
	Spring          int    `json:"spring"`
	SpringText      string `json:"springText"`
	Result          int    `json:"result"`
	ResultText      string `json:"resultText"`
	LandlordWinGold int64  `json:"landlordWinGold"`
	Farmer1WinGold  int64  `json:"farmer1WinGold"`
	Farmer2WinGold  int64  `json:"farmer2WinGold"`
	StartedAt       string `json:"startedAt"`
	EndedAt         string `json:"endedAt"`
	DurationSeconds int    `json:"durationSeconds"`
	DurationText    string `json:"durationText"`
	CreatedAt       string `json:"createdAt"`
}

// DDZGameRecordDetailResponse 游戏记录详情响应
type DDZGameRecordDetailResponse struct {
	GameRecord DDZGameRecordResponse `json:"gameRecord"`
	BidLogs    []DDZBidLogResponse   `json:"bidLogs"`
	DealLogs   []DDZDealLogResponse  `json:"dealLogs"`
	PlayLogs   []DDZPlayLogResponse  `json:"playLogs"`
}

// DDZBidLogResponse 叫地主日志响应
type DDZBidLogResponse struct {
	ID         uint   `json:"ID"`
	GameID     string `json:"gameId"`
	PlayerID   uint64 `json:"playerId"`
	PlayerName string `json:"playerName"`
	BidOrder   int    `json:"bidOrder"`
	BidType    int    `json:"bidType"`
	BidTypeText string `json:"bidTypeText"`
	BidScore   int    `json:"bidScore"`
	IsSuccess  int    `json:"isSuccess"`
	SuccessText string `json:"successText"`
	CreatedAt  string `json:"createdAt"`
}

// DDZDealLogResponse 发牌日志响应
type DDZDealLogResponse struct {
	ID            uint   `json:"ID"`
	GameID        string `json:"gameId"`
	PlayerID      uint64 `json:"playerId"`
	PlayerName    string `json:"playerName"`
	PlayerRole    int    `json:"playerRole"`
	PlayerRoleText string `json:"playerRoleText"`
	HandCards     string `json:"handCards"`
	CardsCount    int    `json:"cardsCount"`
	LandlordCards string `json:"landlordCards"`
	CreatedAt     string `json:"createdAt"`
}

// DDZPlayLogResponse 出牌日志响应
type DDZPlayLogResponse struct {
	ID           uint   `json:"ID"`
	GameID       string `json:"gameId"`
	PlayerID     uint64 `json:"playerId"`
	PlayerName   string `json:"playerName"`
	PlayerRole   int    `json:"playerRole"`
	PlayerRoleText string `json:"playerRoleText"`
	RoundNum     int    `json:"roundNum"`
	PlayOrder    int    `json:"playOrder"`
	PlayType     int    `json:"playType"`
	PlayTypeText string `json:"playTypeText"`
	Cards        string `json:"cards"`
	CardsCount   int    `json:"cardsCount"`
	CardPattern  string `json:"cardPattern"`
	IsBomb       int    `json:"isBomb"`
	IsRocket     int    `json:"isRocket"`
	CreatedAt    string `json:"createdAt"`
}

// DDZPlayerStatResponse 玩家统计响应
type DDZPlayerStatResponse struct {
	ID              uint    `json:"ID"`
	PlayerID        uint64  `json:"playerId"`
	PlayerName      string  `json:"playerName"`
	PlayerAvatar    string  `json:"playerAvatar"`
	StatDate        string  `json:"statDate"`
	TotalGames      int     `json:"totalGames"`
	WinGames        int     `json:"winGames"`
	LoseGames       int     `json:"loseGames"`
	WinRate         float64 `json:"winRate"`
	LandlordGames   int     `json:"landlordGames"`
	LandlordWins    int     `json:"landlordWins"`
	LandlordWinRate float64 `json:"landlordWinRate"`
	FarmerGames     int     `json:"farmerGames"`
	FarmerWins      int     `json:"farmerWins"`
	FarmerWinRate   float64 `json:"farmerWinRate"`
	TotalGoldChange int64   `json:"totalGoldChange"`
	MaxWinGold      int64   `json:"maxWinGold"`
	MaxLoseGold     int64   `json:"maxLoseGold"`
	TotalBombs      int     `json:"totalBombs"`
	TotalRockets    int     `json:"totalRockets"`
	SpringCount     int     `json:"springCount"`
	AntiSpringCount int     `json:"antiSpringCount"`
	AvgGameDuration int     `json:"avgGameDuration"`
	CreatedAt       string  `json:"createdAt"`
}

// DDZRoomConfigResponse 房间配置响应
type DDZRoomConfigResponse struct {
	ID             uint    `json:"ID"`
	RoomName       string  `json:"roomName"`
	RoomType       int     `json:"roomType"`
	RoomTypeName   string  `json:"roomTypeName"`
	BaseScore      int     `json:"baseScore"`
	Multiplier     int     `json:"multiplier"`
	MinGold        int64   `json:"minGold"`
	MaxGold        int64   `json:"maxGold"`
	BotEnabled     int     `json:"botEnabled"`
	BotCount       int     `json:"botCount"`
	FeeRate        float64 `json:"feeRate"`
	MaxRound       int     `json:"maxRound"`
	TimeoutSeconds int     `json:"timeoutSeconds"`
	Status         int     `json:"status"`
	StatusText     string  `json:"statusText"`
	SortOrder      int     `json:"sortOrder"`
	Description    string  `json:"description"`
	CreatedAt      string  `json:"createdAt"`
	UpdatedAt      string  `json:"updatedAt"`
}

// DDZSmsCodeResponse 短信验证码响应
type DDZSmsCodeResponse struct {
	ID        uint   `json:"ID"`
	Phone     string `json:"phone"`
	Code      string `json:"code"`
	Type      int    `json:"type"`
	TypeText  string `json:"typeText"`
	IsUsed    int    `json:"isUsed"`
	IsUsedText string `json:"isUsedText"`
	ExpireAt  string `json:"expireAt"`
	UsedAt    string `json:"usedAt"`
	IP        string `json:"ip"`
	CreatedAt string `json:"createdAt"`
}

// DDZOverviewStatsResponse 概览统计响应
type DDZOverviewStatsResponse struct {
	TotalPlayers    int64 `json:"totalPlayers"`
	ActivePlayers   int64 `json:"activePlayers"`
	OnlinePlayers   int64 `json:"onlinePlayers"`
	TotalGames      int64 `json:"totalGames"`
	TodayGames      int64 `json:"todayGames"`
	TodayNewPlayers int64 `json:"todayNewPlayers"`
	AvgOnlineTime   int64 `json:"avgOnlineTime"`
	AvgGameDuration int64 `json:"avgGameDuration"`
	TotalCoins      int64 `json:"totalCoins"`
}

// DDZChartResponse 图表数据响应
type DDZChartResponse struct {
	Labels []string  `json:"labels"`
	Data   []float64 `json:"data"`
	Title  string    `json:"title"`
}
