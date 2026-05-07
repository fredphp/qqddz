package response

// DDZGameRecordResponse 游戏记录响应
type DDZGameRecordResponse struct {
        ID                    uint                `json:"ID"`
        RoomID                string              `json:"roomId"`
        RoomType              int                 `json:"roomType"`
        RoomTypeName          string              `json:"roomTypeName"`
        RoomCategory          int                 `json:"roomCategory"`
        BaseScore             int                 `json:"baseScore"`
        Multiplier            int                 `json:"multiplier"`
        LandlordID            string              `json:"landlordId"`
        LandlordName          string              `json:"landlordName"`
        Farmer1ID             string              `json:"farmer1Id"`
        Farmer1Name           string              `json:"farmer1Name"`
        Farmer2ID             string              `json:"farmer2Id"`
        Farmer2Name           string              `json:"farmer2Name"`
        Winner                int                 `json:"winner"`
        Result                int                 `json:"result"`
        ResultText            string              `json:"resultText"`
        Spring                int                 `json:"spring"`
        SpringText            string              `json:"springText"`
        BombCount             int                 `json:"bombCount"`
        LandlordWinGold       int64               `json:"landlordWinGold"`
        Farmer1WinGold        int64               `json:"farmer1WinGold"`
        Farmer2WinGold        int64               `json:"farmer2WinGold"`
        LandlordWinArenaCoin  int64               `json:"landlordWinArenaCoin"`
        Farmer1WinArenaCoin   int64               `json:"farmer1WinArenaCoin"`
        Farmer2WinArenaCoin   int64               `json:"farmer2WinArenaCoin"`
        GameDuration          int                 `json:"gameDuration"`
        DurationText          string              `json:"durationText"`
        GameTime              string              `json:"gameTime"`
        StartedAt             string              `json:"startedAt"`
        EndedAt               string              `json:"endedAt"`
        Players               []DDZGamePlayerInfo `json:"players"`
        CreatedAt             string              `json:"createdAt"`
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
