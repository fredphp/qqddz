package response

// DDZPlayerResponse 玩家响应
type DDZPlayerResponse struct {
	ID          uint   `json:"ID"`
	PlayerID    string `json:"playerId"`
	Nickname    string `json:"nickname"`
	Avatar      string `json:"avatar"`
	Gender      int    `json:"gender"`
	Coins       int64  `json:"coins"`
	Diamonds    int64  `json:"diamonds"`
	WinCount    int    `json:"winCount"`
	LoseCount   int    `json:"loseCount"`
	DrawCount   int    `json:"drawCount"`
	TotalGames  int    `json:"totalGames"`
	WinRate     float64 `json:"winRate"`
	MaxWinStreak int   `json:"maxWinStreak"`
	WinStreak   int    `json:"winStreak"`
	Level       int    `json:"level"`
	Experience  int    `json:"experience"`
	VipLevel    int    `json:"vipLevel"`
	Status      int    `json:"status"`
	BanReason   string `json:"banReason"`
	BanTime     string `json:"banTime"`
	UnbanTime   string `json:"unbanTime"`
	LastLoginIP string `json:"lastLoginIp"`
	LastLoginAt string `json:"lastLoginAt"`
	RegisterIP  string `json:"registerIp"`
	DeviceID    string `json:"deviceId"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// DDZPlayerListResponse 玩家列表响应
type DDZPlayerListResponse struct {
	List  []DDZPlayerResponse `json:"list"`
	Total int64               `json:"total"`
	Page  int                 `json:"page"`
	PageSize int               `json:"pageSize"`
}
