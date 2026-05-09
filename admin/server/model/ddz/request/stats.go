package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZDailyStatsSearch 每日统计查询请求
type DDZDailyStatsSearch struct {
        request.PageInfo
        StartDate string `json:"startDate" form:"startDate"`
        EndDate   string `json:"endDate" form:"endDate"`
}

// DDZLeaderboardSearch 排行榜查询请求
type DDZLeaderboardSearch struct {
        request.PageInfo
        PlayerName string `json:"playerName" form:"playerName"`
        OrderBy    string `json:"orderBy" form:"orderBy"` // winCount, gold, arenaCoin, rankScore
}

// DDZPlayerOnlineSearch 在线玩家查询请求
type DDZPlayerOnlineSearch struct {
        request.PageInfo
        PlayerID uint64 `json:"playerId" form:"playerId"`
        LoginIP  string `json:"loginIp" form:"loginIp"`
}

// DDZRoomPlayerSearch 房间玩家查询请求
type DDZRoomPlayerSearch struct {
        request.PageInfo
        RoomID   uint64 `json:"roomId" form:"roomId"`
        PlayerID uint64 `json:"playerId" form:"playerId"`
}
