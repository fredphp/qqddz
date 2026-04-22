package session

import (
        "context"
        "log"
        "math/rand/v2"
        "sort"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// Start 开始游戏
func (gs *GameSession) Start() {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        // 创建并洗牌
        gs.deck = card.NewDeck()
        gs.deck.Shuffle()

        // 发牌
        gs.deal()

        // 进入叫地主阶段
        gs.state = GameStateBidding
        gs.room.State = RoomStateBidding

        // 随机选择第一个叫地主的玩家
        gs.currentBidder = rand.IntN(3)

        // 通知叫地主
        gs.notifyBidTurn()
}

// deal 发牌
func (gs *GameSession) deal() {
        // 每人发 17 张
        for range 17 {
                for i := range 3 {
                        gs.players[i].Hand = append(gs.players[i].Hand, gs.deck[0])
                        gs.deck = gs.deck[1:]
                }
        }

        // 剩余 3 张为底牌
        gs.bottomCards = gs.deck

        // 排序手牌
        for _, p := range gs.players {
                sort.Slice(p.Hand, func(i, j int) bool {
                        return p.Hand[i].Rank > p.Hand[j].Rank
                })
        }

        // 发送手牌给各玩家（先不显示底牌）
        for _, p := range gs.players {
                rp := gs.room.Players[p.ID]
                client := rp.Client
                client.SendMessage(codec.MustNewMessage(protocol.MsgDealCards, protocol.DealCardsPayload{
                        Cards:       convert.CardsToInfos(p.Hand),
                        BottomCards: make([]protocol.CardInfo, 3), // 暂时不显示
                }))

                // 记录发牌日志（暂时记录为农民角色，叫地主后更新）
                gs.gameLogger.RecordDealLog(p.ID, database.PlayerRoleFarmer, p.Hand, nil)
        }
}

// endGame 结束游戏
func (gs *GameSession) endGame(winner *GamePlayer) {
        gs.state = GameStateEnded
        gs.room.State = RoomStateEnded

        // 收集所有玩家剩余手牌
        playerHands := make([]protocol.PlayerHand, len(gs.players))
        for i, p := range gs.players {
                playerHands[i] = protocol.PlayerHand{
                        PlayerID:   p.ID,
                        PlayerName: p.Name,
                        Cards:      convert.CardsToInfos(p.Hand),
                }
        }

        // 广播游戏结束
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgGameOver, protocol.GameOverPayload{
                WinnerID:    winner.ID,
                WinnerName:  winner.Name,
                IsLandlord:  winner.IsLandlord,
                PlayerHands: playerHands,
        }))

        role := "农民"
        if winner.IsLandlord {
                role = "地主"
        }
        log.Printf("🎮 游戏结束！房间 %s，获胜者: %s (%s)",
                gs.room.Code, winner.Name, role)

        // 更新发牌日志中的玩家角色
        gs.updateDealLogRoles()

        // 保存游戏结果到数据库
        gs.saveGameResultToDatabase(winner)

        // 游戏结束，解散房间
        for _, p := range gs.players {
                rp := gs.room.Players[p.ID]
                if rp != nil {
                        rp.Client.SetRoom("")
                }
        }

        // 记录游戏结果到排行榜
        gs.recordGameResults(winner)
}

// updateDealLogRoles 更新发牌日志中的玩家角色
func (gs *GameSession) updateDealLogRoles() {
        // 找到地主并更新发牌日志
        for i, dl := range gs.gameLogger.dealLogs {
                for _, p := range gs.players {
                        if p.ID == dl.PlayerID {
                                if p.IsLandlord {
                                        gs.gameLogger.dealLogs[i].PlayerRole = database.PlayerRoleLandlord
                                        gs.gameLogger.dealLogs[i].LandlordCards = gs.bottomCards
                                } else {
                                        gs.gameLogger.dealLogs[i].PlayerRole = database.PlayerRoleFarmer
                                }
                                break
                        }
                }
        }
}

// saveGameResultToDatabase 保存游戏结果到数据库
func (gs *GameSession) saveGameResultToDatabase(winner *GamePlayer) {
        // 查找地主和农民
        var landlordID, farmer1ID, farmer2ID uint64
        var landlordPlayer *GamePlayer
        var farmer1Player, farmer2Player *GamePlayer

        farmerCount := 0
        for _, p := range gs.players {
                playerID := parsePlayerID(p.ID)
                if p.IsLandlord {
                        landlordID = playerID
                        landlordPlayer = p
                } else {
                        if farmerCount == 0 {
                                farmer1ID = playerID
                                farmer1Player = p
                        } else {
                                farmer2ID = playerID
                                farmer2Player = p
                        }
                        farmerCount++
                }
        }

        // 计算游戏结果
        result := database.GameResultFarmerWin
        if winner.IsLandlord {
                result = database.GameResultLandlordWin
        }

        // 检测春天（地主出完牌，农民一张未出）
        spring := database.SpringNone
        if winner.IsLandlord {
                // 地主胜，检查是否春天
                farmer1Cards := 0
                farmer2Cards := 0
                if farmer1Player != nil {
                        farmer1Cards = len(farmer1Player.Hand)
                }
                if farmer2Player != nil {
                        farmer2Cards = len(farmer2Player.Hand)
                }
                if farmer1Cards == 17 && farmer2Cards == 17 {
                        spring = database.SpringLandlord
                }
        } else {
                // 农民胜，检查是否反春天（地主只出了底牌后的20张，剩17张）
                if landlordPlayer != nil && len(landlordPlayer.Hand) == 17 {
                        spring = database.SpringAnti
                }
        }

        // 计算倍数（基础倍数 1 * 炸弹数量 * 2）
        baseScore := 1 // 默认底分
        multiplier := 1
        bombCount := gs.gameLogger.GetBombCount()
        for range bombCount {
                multiplier *= 2
        }

        // 春天翻倍
        if spring != database.SpringNone {
                multiplier *= 2
        }

        // 计算金币变化（简化版本，实际应该根据房间配置）
        baseGold := int64(baseScore * multiplier)

        var landlordWinGold, farmer1WinGold, farmer2WinGold int64
        if result == database.GameResultLandlordWin {
                // 地主胜，地主获得两个农民的金币
                landlordWinGold = baseGold * 2
                farmer1WinGold = -baseGold
                farmer2WinGold = -baseGold
        } else {
                // 农民胜，每个农民获得地主的金币
                landlordWinGold = -baseGold * 2
                farmer1WinGold = baseGold
                farmer2WinGold = baseGold
        }

        // 保存游戏结果
        err := gs.gameLogger.SaveGameResult(
                landlordID, farmer1ID, farmer2ID,
                baseScore, multiplier,
                spring, result,
                landlordWinGold, farmer1WinGold, farmer2WinGold,
        )
        if err != nil {
                log.Printf("保存游戏结果到数据库失败: %v", err)
        }
}

// recordGameResults 记录游戏结果到排行榜
func (gs *GameSession) recordGameResults(winner *GamePlayer) {
        ctx := context.Background()
        leaderboard := gs.leaderboard
        if leaderboard == nil || !leaderboard.IsReady() {
                return
        }

        // 计算获胜方
        landlordWins := winner.IsLandlord

        for _, p := range gs.players {
                isWinner := false
                if landlordWins {
                        isWinner = p.IsLandlord
                } else {
                        isWinner = !p.IsLandlord
                }

                // 获取玩家名称
                playerName := p.Name
                rp := gs.room.Players[p.ID]
                if rp != nil {
                        playerName = rp.Client.GetName()
                }

                // 记录结果
                if err := leaderboard.RecordGameResult(ctx, p.ID, playerName, p.IsLandlord, isWinner); err != nil {
                        log.Printf("记录游戏结果失败: %v", err)
                }
        }
}
