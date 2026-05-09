package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZArenaMatchConfigSearch 比赛配置查询请求
type DDZArenaMatchConfigSearch struct {
        request.PageInfo
        RoomConfigID uint64 `json:"roomConfigId" form:"roomConfigId"`
        Status       *uint8 `json:"status" form:"status"`
}

// DDZArenaMatchConfigCreate 创建比赛配置请求
type DDZArenaMatchConfigCreate struct {
        RoomConfigID      uint64 `json:"roomConfigId" binding:"required"`
        MatchTimeRanges   string `json:"matchTimeRanges"`
        MatchRoundDuration int   `json:"matchRoundDuration"`
        MatchRoundCount   int    `json:"matchRoundCount"`
        SignupFee         int64  `json:"signupFee"`
        MaxPlayers        int    `json:"maxPlayers"`
        MinPlayers        int    `json:"minPlayers"`
        ChampionRewardID  *uint64 `json:"championRewardId"`
        RunnerUpRewardID  *uint64 `json:"runnerUpRewardId"`
        ThirdRewardID     *uint64 `json:"thirdRewardId"`
        SignupStartTime   string `json:"signupStartTime"`
        SignupEndTime     string `json:"signupEndTime"`
        AutoStart         uint8  `json:"autoStart"`
        Status            uint8  `json:"status"`
        Description       string `json:"description"`
}

// DDZArenaMatchConfigUpdate 更新比赛配置请求
type DDZArenaMatchConfigUpdate struct {
        ID                uint64 `json:"id" binding:"required"`
        RoomConfigID      uint64 `json:"roomConfigId"`
        MatchTimeRanges   string `json:"matchTimeRanges"`
        MatchRoundDuration int   `json:"matchRoundDuration"`
        MatchRoundCount   int    `json:"matchRoundCount"`
        SignupFee         int64  `json:"signupFee"`
        MaxPlayers        int    `json:"maxPlayers"`
        MinPlayers        int    `json:"minPlayers"`
        ChampionRewardID  *uint64 `json:"championRewardId"`
        RunnerUpRewardID  *uint64 `json:"runnerUpRewardId"`
        ThirdRewardID     *uint64 `json:"thirdRewardId"`
        SignupStartTime   string `json:"signupStartTime"`
        SignupEndTime     string `json:"signupEndTime"`
        AutoStart         *uint8 `json:"autoStart"`
        Status            *uint8 `json:"status"`
        Description       string `json:"description"`
}

// DDZArenaSessionSearch 会话查询请求
type DDZArenaSessionSearch struct {
        request.PageInfo
        PeriodNo     string `json:"periodNo" form:"periodNo"`
        RoomConfigID uint64 `json:"roomConfigId" form:"roomConfigId"`
        Status       *uint8 `json:"status" form:"status"`
}

// DDZArenaSignupLogSearch 报名日志查询请求
type DDZArenaSignupLogSearch struct {
        request.PageInfo
        PlayerID uint64 `json:"playerId" form:"playerId"`
        PeriodNo string `json:"periodNo" form:"periodNo"`
        Action   *uint8 `json:"action" form:"action"`
}

// DDZArenaRoundRecordSearch 轮次记录查询请求
type DDZArenaRoundRecordSearch struct {
        request.PageInfo
        SessionID uint64 `json:"sessionId" form:"sessionId"`
        Status    *uint8 `json:"status" form:"status"`
}

// DDZArenaTableSearch 桌号查询请求
type DDZArenaTableSearch struct {
        request.PageInfo
        SessionID uint64 `json:"sessionId" form:"sessionId"`
        RoundID   uint64 `json:"roundId" form:"roundId"`
}
