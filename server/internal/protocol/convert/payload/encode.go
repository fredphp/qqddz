package payload

import (
        "encoding/json"

        "google.golang.org/protobuf/proto"

        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
        "github.com/palemoky/fight-the-landlord/internal/protocol/pb"
)

// payloadToPtr 将 payload 转换为指针类型，支持传入值类型或指针类型
func payloadToPtr[T any](payload any) *T {
        switch p := payload.(type) {
        case *T:
                return p
        case T:
                return &p
        default:
                return nil
        }
}

// protocol.EncodePayload 将 Go struct payload 编码为 protobuf bytes
func EncodePayload(msgType protocol.MessageType, payload any) ([]byte, error) {
        if payload == nil {
                return nil, nil
        }

        // 尝试作为客户端请求编码
        if pb, handled := encodeClientRequests(msgType, payload); handled {
                if pb == nil {
                        return nil, nil
                }
                return proto.Marshal(pb)
        }

        // 尝试作为服务端系统消息编码
        if pb, handled := encodeServerSystemMessages(msgType, payload); handled {
                return proto.Marshal(pb)
        }

        // 尝试作为服务端房间消息编码
        if pb, handled := encodeServerRoomMessages(msgType, payload); handled {
                return proto.Marshal(pb)
        }

        // 尝试作为服务端游戏消息编码
        if pb, handled := encodeServerGameMessages(msgType, payload); handled {
                return proto.Marshal(pb)
        }

        // 未知类型，回退到 JSON
        return json.Marshal(payload)
}

// encodeClientRequests 编码客户端请求
func encodeClientRequests(msgType protocol.MessageType, payload any) (proto.Message, bool) {
        switch msgType {
        case protocol.MsgReconnect:
                p := payloadToPtr[protocol.ReconnectPayload](payload)
                return &pb.ReconnectPayload{
                        Token:    p.Token,
                        PlayerId: p.PlayerID,
                }, true
        case protocol.MsgPing:
                p := payloadToPtr[protocol.PingPayload](payload)
                return &pb.PingPayload{
                        Timestamp: p.Timestamp,
                }, true
        case protocol.MsgJoinRoom:
                p := payloadToPtr[protocol.JoinRoomPayload](payload)
                return &pb.JoinRoomPayload{
                        RoomCode: p.RoomCode,
                }, true
        case protocol.MsgBid:
                p := payloadToPtr[protocol.BidPayload](payload)
                return &pb.BidPayload{
                        Bid: p.Bid,
                }, true
        case protocol.MsgRob:
                p := payloadToPtr[protocol.RobPayload](payload)
                return &pb.RobPayload{
                        Rob: p.Rob,
                }, true
        case protocol.MsgPlayCards:
                p := payloadToPtr[protocol.PlayCardsPayload](payload)
                return &pb.PlayCardsPayload{
                        Cards: convert.CardsToProto(p.Cards),
                }, true
        case protocol.MsgGetLeaderboard:
                p := payloadToPtr[protocol.GetLeaderboardPayload](payload)
                return &pb.GetLeaderboardPayload{
                        Type:   p.Type,
                        Offset: int64(p.Offset),
                        Limit:  int64(p.Limit),
                }, true
        case protocol.MsgGetOnlineCount, protocol.MsgGetMaintenanceStatus:
                // No payload needed for these messages
                return nil, true
        }
        return nil, false
}

// encodeServerSystemMessages 编码系统相关消息
func encodeServerSystemMessages(msgType protocol.MessageType, payload any) (proto.Message, bool) {
        switch msgType {
        case protocol.MsgConnected:
                p := payloadToPtr[protocol.ConnectedPayload](payload)
                return &pb.ConnectedPayload{
                        PlayerId:       p.PlayerID,
                        PlayerName:     p.PlayerName,
                        ReconnectToken: p.ReconnectToken,
                }, true
        case protocol.MsgReconnected:
                p := payloadToPtr[protocol.ReconnectedPayload](payload)
                var gameState *pb.GameStateDTO
                if p.GameState != nil {
                        gameState = convert.GameStateDTOToProto(p.GameState)
                }
                return &pb.ReconnectedPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        RoomCode:   p.RoomCode,
                        GameState:  gameState,
                }, true
        case protocol.MsgPong:
                p := payloadToPtr[protocol.PongPayload](payload)
                return &pb.PongPayload{
                        ClientTimestamp: p.ClientTimestamp,
                        ServerTimestamp: p.ServerTimestamp,
                }, true
        case protocol.MsgOnlineCount:
                p := payloadToPtr[protocol.OnlineCountPayload](payload)
                return &pb.OnlineCountPayload{
                        Count: int64(p.Count),
                }, true
        case protocol.MsgMaintenancePull:
                p := payloadToPtr[protocol.MaintenanceStatusPayload](payload)
                return &pb.MaintenanceStatusPayload{
                        Maintenance: p.Maintenance,
                }, true
        case protocol.MsgMaintenancePush:
                p := payloadToPtr[protocol.MaintenancePayload](payload)
                return &pb.MaintenancePayload{
                        Maintenance: p.Maintenance,
                }, true
        case protocol.MsgStatsResult:
                p := payloadToPtr[protocol.StatsResultPayload](payload)
                return &pb.StatsResultPayload{
                        PlayerId:      p.PlayerID,
                        PlayerName:    p.PlayerName,
                        TotalGames:    int64(p.TotalGames),
                        Wins:          int64(p.Wins),
                        Losses:        int64(p.Losses),
                        WinRate:       p.WinRate,
                        LandlordGames: int64(p.LandlordGames),
                        LandlordWins:  int64(p.LandlordWins),
                        FarmerGames:   int64(p.FarmerGames),
                        FarmerWins:    int64(p.FarmerWins),
                        Score:         int64(p.Score),
                        Rank:          int64(p.Rank),
                        CurrentStreak: int64(p.CurrentStreak),
                        MaxWinStreak:  int64(p.MaxWinStreak),
                }, true
        case protocol.MsgLeaderboardResult:
                p := payloadToPtr[protocol.LeaderboardResultPayload](payload)
                return &pb.LeaderboardResultPayload{
                        Type:    p.Type,
                        Entries: convert.LeaderboardEntriesToProto(p.Entries),
                }, true
        case protocol.MsgError:
                p := payloadToPtr[protocol.ErrorPayload](payload)
                return &pb.ErrorPayload{
                        Code:    int64(p.Code),
                        Message: p.Message,
                }, true
        }
        return nil, false
}

// encodeServerRoomMessages 编码房间及玩家状态消息
func encodeServerRoomMessages(msgType protocol.MessageType, payload any) (proto.Message, bool) {
        switch msgType {
        case protocol.MsgPlayerOffline:
                p := payloadToPtr[protocol.PlayerOfflinePayload](payload)
                return &pb.PlayerOfflinePayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Timeout:    int64(p.Timeout),
                }, true
        case protocol.MsgPlayerOnline:
                p := payloadToPtr[protocol.PlayerOnlinePayload](payload)
                return &pb.PlayerOnlinePayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                }, true
        case protocol.MsgRoomCreated:
                p := payloadToPtr[protocol.RoomCreatedPayload](payload)
                return &pb.RoomCreatedPayload{
                        RoomCode: p.RoomCode,
                        Player:   convert.PlayerInfoToProto(&p.Player),
                }, true
        // 🔧【修复】MsgRoomJoined 使用 JSON 编码以确保 GoldCount 字段正确序列化
        // protobuf 序列化可能因 proto 定义和 pb.go 不同步导致 gold_count 字段丢失
        case protocol.MsgRoomJoined:
                return nil, false // 回退到 JSON 编码
        case protocol.MsgPlayerJoined:
                p := payloadToPtr[protocol.PlayerJoinedPayload](payload)
                return &pb.PlayerJoinedPayload{
                        Player: convert.PlayerInfoToProto(&p.Player),
                }, true
        case protocol.MsgPlayerLeft:
                p := payloadToPtr[protocol.PlayerLeftPayload](payload)
                return &pb.PlayerLeftPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                }, true
        case protocol.MsgPlayerReady:
                p := payloadToPtr[protocol.PlayerReadyPayload](payload)
                return &pb.PlayerReadyPayload{
                        PlayerId: p.PlayerID,
                        Ready:    p.Ready,
                }, true
        case protocol.MsgRoomListResult:
                p := payloadToPtr[protocol.RoomListResultPayload](payload)
                return &pb.RoomListResultPayload{
                        Rooms: convert.RoomListItemsToProto(p.Rooms),
                }, true
        }
        return nil, false
}

// encodeServerGameMessages 编码游戏逻辑相关消息
func encodeServerGameMessages(msgType protocol.MessageType, payload any) (proto.Message, bool) {
        switch msgType {
        case protocol.MsgGameStart:
                p := payloadToPtr[protocol.GameStartPayload](payload)
                return &pb.GameStartPayload{
                        Players: convert.PlayerInfosToProto(p.Players),
                }, true
        case protocol.MsgDealCards:
                p := payloadToPtr[protocol.DealCardsPayload](payload)
                return &pb.DealCardsPayload{
                        Cards:       convert.CardsToProto(p.Cards),
                        BottomCards: convert.CardsToProto(p.BottomCards),
                }, true
        case protocol.MsgBidTurn:
                p := payloadToPtr[protocol.BidTurnPayload](payload)
                return &pb.BidTurnPayload{
                        PlayerId: p.PlayerID,
                        Timeout:  int64(p.Timeout),
                }, true
        case protocol.MsgBidResult:
                p := payloadToPtr[protocol.BidResultPayload](payload)
                return &pb.BidResultPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Bid:        p.Bid,
                }, true
        case protocol.MsgRobTurn:
                p := payloadToPtr[protocol.RobTurnPayload](payload)
                return &pb.RobTurnPayload{
                        PlayerId: p.PlayerID,
                        Timeout:  int64(p.Timeout),
                }, true
        case protocol.MsgRobResult:
                p := payloadToPtr[protocol.RobResultPayload](payload)
                return &pb.RobResultPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Rob:        p.Rob,
                }, true
        case protocol.MsgLandlord:
                p := payloadToPtr[protocol.LandlordPayload](payload)
                return &pb.LandlordPayload{
                        PlayerId:    p.PlayerID,
                        PlayerName:  p.PlayerName,
                        BottomCards: convert.CardsToProto(p.BottomCards),
                }, true
        case protocol.MsgPlayTurn:
                p := payloadToPtr[protocol.PlayTurnPayload](payload)
                return &pb.PlayTurnPayload{
                        PlayerId: p.PlayerID,
                        Timeout:  int64(p.Timeout),
                        MustPlay: p.MustPlay,
                        CanBeat:  p.CanBeat,
                }, true
        case protocol.MsgCardPlayed:
                p := payloadToPtr[protocol.CardPlayedPayload](payload)
                return &pb.CardPlayedPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Cards:      convert.CardsToProto(p.Cards),
                        CardsLeft:  int64(p.CardsLeft),
                        HandType:   p.HandType,
                        Gender:     p.Gender,
                        Rank:       int64(p.Rank),
                }, true
        case protocol.MsgPlayerPass:
                p := payloadToPtr[protocol.PlayerPassPayload](payload)
                return &pb.PlayerPassPayload{
                        PlayerId:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Gender:     p.Gender,
                }, true
        // 🔧【修复】MsgGameOver 使用 JSON 编码以支持完整的结算数据
        // protobuf 定义中缺少 base_score, multiple, multi_detail, players 字段
        // 返回 false 让 EncodePayload 函数回退到 JSON 编码
        case protocol.MsgGameOver:
                return nil, false
        }
        return nil, false
}
