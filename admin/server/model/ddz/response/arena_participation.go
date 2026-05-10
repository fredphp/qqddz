package response

// ArenaParticipationResponse 参赛记录响应
type ArenaParticipationResponse struct {
        ID              uint64 `json:"ID"`
        SessionID       uint64 `json:"sessionId"`       // 会话ID
        PlayerID        uint64 `json:"playerId"`        // 玩家ID
        PlayerName      string `json:"playerName"`      // 玩家昵称
        PeriodNo        string `json:"periodNo"`        // 期号
        MatchCoin       int64  `json:"matchCoin"`       // 比赛金币
        RoundMatchCoin  int64  `json:"roundMatchCoin"`  // 本轮比赛金币
        IsEliminated    bool   `json:"isEliminated"`    // 是否淘汰
        EliminatedRound int    `json:"eliminatedRound"` // 淘汰轮次
        Rank            int    `json:"rank"`            // 最终排名
        IsChampion      bool   `json:"isChampion"`      // 是否冠军
        IsOnline        bool   `json:"isOnline"`        // 是否在线
        CreatedAt       string `json:"createdAt"`       // 创建时间
        UpdatedAt       string `json:"updatedAt"`       // 更新时间
}

// TournamentRoundResponse 锦标赛轮次响应
type TournamentRoundResponse struct {
        ID                uint64 `json:"ID"`
        SessionID         uint64 `json:"sessionId"`         // 会话ID
        RoundNum          int    `json:"roundNum"`          // 轮次号
        EliminationTarget int    `json:"eliminationTarget"` // 淘汰目标人数
        TotalPlayers      int    `json:"totalPlayers"`      // 总玩家数
        TablesCount       int    `json:"tablesCount"`       // 桌子数量
        Stage             string `json:"stage"`             // 阶段
        StageText         string `json:"stageText"`         // 阶段文本
        StartedAt         string `json:"startedAt"`         // 开始时间
        EndedAt           string `json:"endedAt"`           // 结束时间
        CreatedAt         string `json:"createdAt"`         // 创建时间
}

// TournamentEliminationResponse 锦标赛淘汰记录响应
type TournamentEliminationResponse struct {
        ID               uint64 `json:"ID"`
        SessionID        uint64 `json:"sessionId"`        // 会话ID
        RoundNum         int    `json:"roundNum"`         // 轮次号
        PlayerID         uint64 `json:"playerId"`         // 玩家ID
        PlayerName       string `json:"playerName"`       // 玩家昵称
        RankBefore       int    `json:"rankBefore"`       // 淘汰前排名
        MatchCoin        int64  `json:"matchCoin"`        // 淘汰时金币
        EliminatedReason string `json:"eliminatedReason"` // 淘汰原因
        CreatedAt        string `json:"createdAt"`        // 创建时间
}
