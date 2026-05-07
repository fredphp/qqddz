package response

// DDZUserAccountResponse 用户账户响应
type DDZUserAccountResponse struct {
	ID                   uint   `json:"ID"`
	PlayerID             uint   `json:"playerId"`
	Phone                string `json:"phone"`
	WxOpenID             string `json:"wxOpenId"`
	WxUnionID            string `json:"wxUnionId"`
	WxNickname           string `json:"wxNickname"`
	WxAvatar             string `json:"wxAvatar"`
	LoginType            int    `json:"loginType"`
	LoginTypeText        string `json:"loginTypeText"`
	DeviceID             string `json:"deviceId"`
	DeviceType           string `json:"deviceType"`
	LastLoginAt          string `json:"lastLoginAt"`
	LastLoginIP          string `json:"lastLoginIp"`
	LoginCount           int    `json:"loginCount"`
	Status               int    `json:"status"`
	StatusText           string `json:"statusText"`
	TokenExpireAt        string `json:"tokenExpireAt"`
	RefreshTokenExpireAt string `json:"refreshTokenExpireAt"`
	CreatedAt            string `json:"createdAt"`
	UpdatedAt            string `json:"updatedAt"`
	// 关联玩家信息
	PlayerNickname string `json:"playerNickname"`
	PlayerAvatar   string `json:"playerAvatar"`
	PlayerLevel    int    `json:"playerLevel"`
	PlayerVipLevel int    `json:"playerVipLevel"`
	PlayerCoins    int64  `json:"playerCoins"`
}

// DDZLoginLogResponse 登录日志响应
type DDZLoginLogResponse struct {
	ID          uint   `json:"ID"`
	PlayerID    uint   `json:"playerId"`
	AccountID   uint   `json:"accountId"`
	LoginType   int    `json:"loginType"`
	LoginTypeText string `json:"loginTypeText"`
	LoginResult int    `json:"loginResult"`
	LoginResultText string `json:"loginResultText"`
	FailReason  string `json:"failReason"`
	IP          string `json:"ip"`
	DeviceID    string `json:"deviceId"`
	DeviceType  string `json:"deviceType"`
	UserAgent   string `json:"userAgent"`
	Location    string `json:"location"`
	CreatedAt   string `json:"createdAt"`
	// 关联信息
	PlayerNickname string `json:"playerNickname"`
}
