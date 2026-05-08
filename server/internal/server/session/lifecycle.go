package session

import (
        "context"
        "log"
        "math/rand"
        "sort"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/deal"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// 全奋发牌管理器
var globalDealManager = deal.NewDealManager()

func init() {
        // 初始化随机数种子
        rand.Seed(time.Now().UnixNano())
}

// Start 开始游戏
func (gs *GameSession) Start() {
        gs.mu.Lock()
        defer gs.mu.Unlock()

        log.Printf("🃏 [GameSession.Start] 开始游戏会话, 玩家数: %d", len(gs.players))

        // 检查是否正在发牌（防重复）
        if globalDealManager.IsDealing(gs.room.Code) {
                log.Printf("⚠️ [GameSession.Start] 房间 %s 正在发牌，跳过", gs.room.Code)
                return
        }

        // 🔧【新增】增加游戏局数计数
        gs.room.GameCount++
        log.Printf("🃏 [GameSession.Start] 房间 %s 第 %d 局游戏", gs.room.Code, gs.room.GameCount)

        // ============================================================
        // 【核心】游戏阶段控制（服务端权威驱动）
        // ============================================================

        // 1. 广播准备阶段结束
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgReadyEnd, &protocol.PhaseEndPayload{
                Phase: "ready",
        }))

        // 2. 广播发牌阶段开始
        gs.state = GameStateDeal
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgDealStart, &protocol.DealStartPayload{
                RoomCode: gs.room.Code,
        }))

        // 3. 执行发牌
        gs.dealWithServerAuthority()

        // 4. 广播发牌阶段结束
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgDealEnd, &protocol.DealEndPayload{
                RoomCode: gs.room.Code,
        }))

        // 5. 解锁后开始抢地主阶段（需要在锁外调用以避免死锁）
        gs.mu.Unlock()
        gs.StartCallLandlord()
        gs.mu.Lock() // 重新获取锁以完成 defer
}

// dealWithServerAuthority 服务端权威发牌
// 核心原则：服务端生成所有牌，一次性发送给所有客户端
func (gs *GameSession) dealWithServerAuthority() {
        log.Printf("🃏 [dealWithServerAuthority] ========== 开始服务端权威发牌 ==========")

        // 1. 获取玩家顺序（按座位）
        playerIDs := make([]string, len(gs.players))
        for i, p := range gs.players {
                playerIDs[i] = p.ID
                log.Printf("🃏 [dealWithServerAuthority] 座位 %d: 玩家 %s", i, p.ID)
        }

        // 2. 调用发牌管理器
        dealResult := globalDealManager.StartDeal(gs.room.Code, playerIDs)
        if dealResult == nil {
                log.Printf("⚠️ [dealWithServerAuthority] 发牌失败，可能正在发牌")
                return
        }
        defer globalDealManager.FinishDeal(gs.room.Code)

        // 3. 保存发牌结果到游戏会话
        for _, p := range gs.players {
                p.Hand = dealResult.Players[p.ID]
        }
        gs.bottomCards = dealResult.BottomCards

        log.Printf("🃏 [dealWithServerAuthority] 发牌完成，底牌数量: %d", len(gs.bottomCards))

        // 4. 广播发牌结果给所有客户端
        gs.broadcastDealResult(dealResult)
}

// broadcastDealResult 广播发牌结果给所有客户端
// 【核心】每个客户端收到完全一致的数据
func (gs *GameSession) broadcastDealResult(dealResult *deal.DealResult) {
        log.Printf("🃏 [broadcastDealResult] 广播发牌结果给 %d 个玩家", len(gs.players))

        for _, p := range gs.players {
                rp := gs.room.Players[p.ID]
                if rp == nil || rp.Client == nil {
                        log.Printf("⚠️ [broadcastDealResult] 玩家 %s 的房间玩家或客户端为空", p.ID)
                        continue
                }

                client := rp.Client

                // 构建发送给该玩家的数据
                // 自己的手牌（完整显示）
                myCards := convert.CardsToInfos(p.Hand)
                
                // 底牌（暂时不显示，等叫地主完成后显示）
                hiddenBottomCards := make([]protocol.CardInfo, 3)

                log.Printf("🃏 [broadcastDealResult] 发送手牌给玩家 %s, 手牌数: %d", p.ID, len(myCards))

                // 发送发牌消息
                client.SendMessage(codec.MustNewMessage(protocol.MsgDealCards, &protocol.DealCardsPayload{
                        Cards:       myCards,
                        BottomCards: hiddenBottomCards,
                }))

                // 记录发牌日志（暂时记录为农民角色，叫地主后更新）
                gs.gameLogger.RecordDealLog(p.ID, database.PlayerRoleFarmer, p.Hand, nil)
        }

        log.Printf("🃏 [broadcastDealResult] 广播完成")
}

// deal 保留原有方法作为备用（已废弃，使用 dealWithServerAuthority）
func (gs *GameSession) deal() {
        log.Printf("🃏 [deal] 开始发牌, 玩家数: %d", len(gs.players))

        // 每人发 17 张
        for range 17 {
                for i := range 3 {
                        gs.players[i].Hand = append(gs.players[i].Hand, gs.deck[0])
                        gs.deck = gs.deck[1:]
                }
        }

        // 剩余 3 张为底牌
        gs.bottomCards = gs.deck
        log.Printf("🃏 [deal] 发牌完成, 底牌: %d 张", len(gs.bottomCards))

        // 排序手牌
        for _, p := range gs.players {
                sort.Slice(p.Hand, func(i, j int) bool {
                        return p.Hand[i].Rank > p.Hand[j].Rank
                })
        }

        // 发送手牌给各玩家（先不显示底牌）
        for _, p := range gs.players {
                rp := gs.room.Players[p.ID]
                if rp == nil || rp.Client == nil {
                        log.Printf("⚠️ [deal] 玩家 %s 的房间玩家或客户端为空", p.ID)
                        continue
                }
                client := rp.Client
                log.Printf("🃏 [deal] 发送手牌给玩家 %s, 手牌数: %d", p.ID, len(p.Hand))
                client.SendMessage(codec.MustNewMessage(protocol.MsgDealCards, &protocol.DealCardsPayload{
                        Cards:       convert.CardsToInfos(p.Hand),
                        BottomCards: make([]protocol.CardInfo, 3), // 暂时不显示
                }))

                // 记录发牌日志（暂时记录为农民角色，叫地主后更新）
                gs.gameLogger.RecordDealLog(p.ID, database.PlayerRoleFarmer, p.Hand, nil)
        }
}

// endGame 结束游戏
func (gs *GameSession) endGame(winner *GamePlayer) {
        // ============================================================
        // 【核心】阶段控制消息（服务端权威驱动）
        // ============================================================

        // 1. 广播出牌阶段结束
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgPlayEnd, &protocol.PhaseEndPayload{
                Phase: "play",
        }))
        log.Printf("🎮 [endGame] 已发送 play_end")

        // 2. 广播结算阶段开始
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgSettlementStart, &protocol.SettlementStartPayload{
                WinnerID:   winner.ID,
                WinnerName: winner.Name,
                IsLandlord: winner.IsLandlord,
        }))
        log.Printf("🎮 [endGame] 已发送 settlement_start")

        gs.state = GameStateSettlement
        gs.room.State = RoomStateFinished

        // ============================================================
        // 【核心】结算计算
        // ============================================================
        
        // 基础底分（默认10）
        baseScore := 10
        
        // 计算倍数详情
        multiDetail := protocol.MultiplierDetail{}
        
        // 1. 抢地主倍数: 2^n
        multiDetail.QiangCount = gs.qiangCount
        if gs.qiangCount > 0 {
                multiDetail.QiangMulti = 1 << gs.qiangCount // 2^n
        } else {
                multiDetail.QiangMulti = 1 // 没人抢，倍数为1
        }
        
        // 2. 炸弹倍数: 2^n
        bombCount := gs.gameLogger.GetBombCount() - gs.gameLogger.GetRocketCount() // 排除王炸
        if bombCount < 0 {
                bombCount = 0
        }
        multiDetail.BombCount = bombCount
        if bombCount > 0 {
                multiDetail.BombMulti = 1 << bombCount
        } else {
                multiDetail.BombMulti = 1
        }
        
        // 3. 王炸倍数: 2^n
        rocketCount := gs.gameLogger.GetRocketCount()
        multiDetail.RocketCount = rocketCount
        if rocketCount > 0 {
                multiDetail.RocketMulti = 1 << rocketCount
        } else {
                multiDetail.RocketMulti = 1
        }
        
        // 4. 春天检测
        springType := 0 // 0=无, 1=春天, 2=反春
        var landlordPlayer, farmer1Player, farmer2Player *GamePlayer
        for _, p := range gs.players {
                if p.IsLandlord {
                        landlordPlayer = p
                } else {
                        if farmer1Player == nil {
                                farmer1Player = p
                        } else {
                                farmer2Player = p
                        }
                }
        }
        
        if winner.IsLandlord {
                // 地主胜，检查是否春天（农民一张未出）
                farmer1Cards := 17
                farmer2Cards := 17
                if farmer1Player != nil {
                        farmer1Cards = len(farmer1Player.Hand)
                }
                if farmer2Player != nil {
                        farmer2Cards = len(farmer2Player.Hand)
                }
                if farmer1Cards == 17 && farmer2Cards == 17 {
                        springType = 1 // 春天
                        log.Printf("🌸 [endGame] 春天！农民一张未出")
                }
        } else {
                // 农民胜，检查是否反春（地主只出了底牌后的20张，剩17张）
                if landlordPlayer != nil && len(landlordPlayer.Hand) == 17 {
                        springType = 2 // 反春
                        log.Printf("🌸 [endGame] 反春！地主一张未出")
                }
        }
        
        multiDetail.SpringType = springType
        if springType > 0 {
                multiDetail.SpringMulti = 2
        } else {
                multiDetail.SpringMulti = 1
        }
        
        // 5. 计算总倍数
        totalMulti := multiDetail.QiangMulti * multiDetail.BombMulti * multiDetail.RocketMulti * multiDetail.SpringMulti
        
        log.Printf("📊 [GameResult] base=%d, qiang=%d(x%d), bomb=%d(x%d), rocket=%d(x%d), spring=%d(x%d), total=%d",
                baseScore, multiDetail.QiangCount, multiDetail.QiangMulti,
                multiDetail.BombCount, multiDetail.BombMulti,
                multiDetail.RocketCount, multiDetail.RocketMulti,
                multiDetail.SpringType, multiDetail.SpringMulti,
                totalMulti)
        
        // 6. 计算玩家输赢
        players := make([]protocol.PlayerResult, 3)
        baseGold := int64(baseScore * totalMulti)
        
        landlordWins := winner.IsLandlord
        
        for i, p := range gs.players {
                isWinner := false
                if landlordWins {
                        isWinner = p.IsLandlord
                } else {
                        isWinner = !p.IsLandlord
                }
                
                role := "farmer"
                if p.IsLandlord {
                        role = "landlord"
                }
                
                var winGold int64
                if p.IsLandlord {
                        if landlordWins {
                                winGold = baseGold * 2 // 地主赢，获得两份
                        } else {
                                winGold = -baseGold * 2 // 地主输，赔两份
                        }
                } else {
                        if landlordWins {
                                winGold = -baseGold // 农民输，赔一份
                        } else {
                                winGold = baseGold // 农民赢，获得一份
                        }
                }
                
                // 🔧【修复】查询当前金币，计算变化后的金币值
                // 实现界面"同步加减"效果，无需等待数据库异步更新
                var goldAfter int64 = -1
                if p.DBID > 0 && database.GetInstance().IsConnected() {
                        if player, err := database.GetPlayerByID(p.DBID); err == nil {
                                goldAfter = int64(player.Gold) + winGold
                                log.Printf("📊 [GoldCalc] 玩家 %s (DBID=%d): 当前金币=%d, 变化=%d, 结算后=%d",
                                        p.Name, p.DBID, player.Gold, winGold, goldAfter)
                        } else {
                                log.Printf("⚠️ [GoldCalc] 查询玩家金币失败: DBID=%d, err=%v", p.DBID, err)
                        }
                }
                
                players[i] = protocol.PlayerResult{
                        PlayerID:   p.ID,
                        PlayerName: p.Name,
                        Seat:       p.Seat,
                        Role:       role,
                        IsWinner:   isWinner,
                        WinGold:    winGold,
                        GoldAfter:  goldAfter, // 🔧【修复】显示计算后的金币值
                }
                
                log.Printf("📊 [PlayerResult] %s(%s): winGold=%d, goldAfter=%d, isWinner=%v",
                        p.Name, role, winGold, goldAfter, isWinner)
        }

        // 收集所有玩家剩余手牌
        playerHands := make([]protocol.PlayerHand, len(gs.players))
        for i, p := range gs.players {
                playerHands[i] = protocol.PlayerHand{
                        PlayerID:   p.ID,
                        PlayerName: p.Name,
                        Cards:      convert.CardsToInfos(p.Hand),
                }
        }

        // 🔧【优化】异步保存游戏结果到数据库，实现"无感结算"
        // 先广播结算消息，数据库操作异步执行，不阻塞结算弹窗
        gs.updateDealLogRoles()

        // 🔧【异步】复制必要的数据，在 goroutine 中执行数据库保存
        // 这样结算弹窗可以立即弹出，数据库更新在后台进行
        go func() {
                // 异步保存游戏结果，带重试机制
                gs.saveGameResultToDatabaseAsync(winner, baseScore, totalMulti, uint8(multiDetail.SpringType), players)
        }()

        // 广播游戏结束（包含完整结算信息）
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgGameOver, &protocol.GameOverPayload{
                WinnerID:    winner.ID,
                WinnerName:  winner.Name,
                IsLandlord:  winner.IsLandlord,
                PlayerHands: playerHands,
                // 🔧【新增】结算详情
                BaseScore:   baseScore,
                Multiple:    totalMulti,
                MultiDetail: multiDetail,
                Players:     players,
                // 🔧【新增】房间分类（用于区分普通场和竞技场）
                RoomCategory: gs.room.RoomCategory,
        }))

        role := "农民"
        if winner.IsLandlord {
                role = "地主"
        }
        log.Printf("🎮 游戏结束！房间 %s，获胜者: %s (%s)，总倍数: %d",
                gs.room.Code, winner.Name, role, totalMulti)

        // 3. 广播结算阶段结束
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgSettlementEnd, &protocol.PhaseEndPayload{
                Phase: "settlement",
        }))
        log.Printf("🎮 [endGame] 已发送 settlement_end")

        gs.state = GameStateEnded
        gs.room.State = RoomStateEnded

        // 🔧【关键修复】检查是否所有玩家都是机器人托管状态
        // 如果是，则销毁房间（因为没有真实玩家会继续游戏）
        allRobot := true
        for _, p := range gs.players {
                rp := gs.room.Players[p.ID]
                if rp != nil && rp.State == PlayerStateOnline {
                        allRobot = false
                        break
                }
        }

        if allRobot {
                log.Printf("🧹 [endGame] 房间 %s 所有玩家都是机器人托管，销毁房间", gs.room.Code)
                // 调用回调销毁房间
                if gs.onGameEnd != nil {
                        gs.onGameEnd(gs.room)
                }
                return
        }

        // ============================================================
        // 【核心】区分普通场和竞技场的结算后逻辑
        // ============================================================
        
        if gs.room.RoomCategory == 2 {
                // 竞技场模式：启动30秒倒计时，自动进入下一轮
                log.Printf("🏟️ [endGame] 竞技场房间 %s 结算完成，启动30秒倒计时", gs.room.Code)
                gs.startArenaRoundCountdown()
        } else {
                // 普通场：玩家手动选择继续游戏或返回大厅
                log.Printf("🎮 [endGame] 普通场房间 %s 结算完成，等待玩家选择", gs.room.Code)
                
                // 重置房间为等待状态，让玩家可以重新准备
                for _, p := range gs.players {
                        rp := gs.room.Players[p.ID]
                        if rp != nil {
                                // 重置玩家准备状态，但不离开房间
                                rp.Ready = false
                                log.Printf("🎮 [endGame] 重置玩家 %s 的准备状态为 false", p.ID)
                        }
                }
                
                // 将房间状态设为等待，允许玩家重新准备
                gs.room.State = RoomStateWaiting
                log.Printf("🎮 [endGame] 房间 %s 状态重置为 Waiting，等待玩家重新准备", gs.room.Code)
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
// 🔧【修复】使用 endGame 中已计算好的金币变化，避免重复计算
// 🔧【新增】当 DBID 为0时，使用玩家昵称查找或创建玩家记录
func (gs *GameSession) saveGameResultToDatabase(winner *GamePlayer, baseScore, totalMulti int, spring uint8, players []protocol.PlayerResult) {
        // 查找地主和农民 - 🔧【修复】使用 GamePlayer.DBID 而不是 parsePlayerID
        var landlordID, farmer1ID, farmer2ID uint64
        var landlordName, farmer1Name, farmer2Name string

        farmerCount := 0
        for _, p := range gs.players {
                log.Printf("📊 [saveGameResultToDatabase] 玩家: ID=%s, Name=%s, DBID=%d, IsLandlord=%v", 
                        p.ID, p.Name, p.DBID, p.IsLandlord)
                if p.IsLandlord {
                        landlordID = p.DBID
                        landlordName = p.Name
                } else {
                        if farmerCount == 0 {
                                farmer1ID = p.DBID
                                farmer1Name = p.Name
                        } else {
                                farmer2ID = p.DBID
                                farmer2Name = p.Name
                        }
                        farmerCount++
                }
        }

        log.Printf("📊 [saveGameResultToDatabase] 数据库ID - 地主: %d, 农民1: %d, 农民2: %d", 
                landlordID, farmer1ID, farmer2ID)

        // 🔧【新增】检查数据库ID是否有效，如果无效则尝试通过昵称查找或创建玩家
        // 同时更新 gs.players 中的 DBID 字段，以便后续查询金币时使用
        if landlordID == 0 && landlordName != "" && database.GetInstance().IsConnected() {
                log.Printf("⚠️ [saveGameResultToDatabase] 地主DBID为0，尝试通过昵称查找/创建玩家: %s", landlordName)
                landlordID = database.GetOrCreatePlayerByNickname(landlordName)
                if landlordID > 0 {
                        log.Printf("✅ [saveGameResultToDatabase] 地主玩家已通过昵称获取/创建，ID: %d", landlordID)
                        // 🔧【关键修复】更新 gs.players 中的 DBID
                        for _, p := range gs.players {
                                if p.IsLandlord {
                                        p.DBID = landlordID
                                        break
                                }
                        }
                }
        }
        if farmer1ID == 0 && farmer1Name != "" && database.GetInstance().IsConnected() {
                log.Printf("⚠️ [saveGameResultToDatabase] 农民1 DBID为0，尝试通过昵称查找/创建玩家: %s", farmer1Name)
                farmer1ID = database.GetOrCreatePlayerByNickname(farmer1Name)
                if farmer1ID > 0 {
                        log.Printf("✅ [saveGameResultToDatabase] 农民1玩家已通过昵称获取/创建，ID: %d", farmer1ID)
                        // 🔧【关键修复】更新 gs.players 中的 DBID
                        farmerCount := 0
                        for _, p := range gs.players {
                                if !p.IsLandlord {
                                        if farmerCount == 0 {
                                                p.DBID = farmer1ID
                                                break
                                        }
                                        farmerCount++
                                }
                        }
                }
        }
        if farmer2ID == 0 && farmer2Name != "" && database.GetInstance().IsConnected() {
                log.Printf("⚠️ [saveGameResultToDatabase] 农民2 DBID为0，尝试通过昵称查找/创建玩家: %s", farmer2Name)
                farmer2ID = database.GetOrCreatePlayerByNickname(farmer2Name)
                if farmer2ID > 0 {
                        log.Printf("✅ [saveGameResultToDatabase] 农民2玩家已通过昵称获取/创建，ID: %d", farmer2ID)
                        // 🔧【关键修复】更新 gs.players 中的 DBID
                        farmerCount := 0
                        for _, p := range gs.players {
                                if !p.IsLandlord {
                                        if farmerCount == 1 {
                                                p.DBID = farmer2ID
                                                break
                                        }
                                        farmerCount++
                                }
                        }
                }
        }

        // 检查数据库ID是否有效
        if landlordID == 0 || farmer1ID == 0 || farmer2ID == 0 {
                log.Printf("⚠️ [saveGameResultToDatabase] 数据库ID无效，可能Token验证失败且数据库连接异常，跳过保存游戏结果")
                return
        }

        // 计算游戏结果
        result := database.GameResultFarmerWin
        if winner.IsLandlord {
                result = database.GameResultLandlordWin
        }

        // 🔧【修复】使用传入的已计算好的金币变化值
        var landlordWinGold, farmer1WinGold, farmer2WinGold int64
        var landlordWinArenaCoin, farmer1WinArenaCoin, farmer2WinArenaCoin int64

        // 从 players 数组中获取已计算好的金币变化
        // 🔧【修复】需要匹配正确的玩家ID，使用 GamePlayer.ID 匹配 protocol.PlayerResult.PlayerID
        for i := range players {
                // 找到对应的 GamePlayer 来获取 DBID
                var dbID uint64
                for _, p := range gs.players {
                        if p.ID == players[i].PlayerID {
                                dbID = p.DBID
                                break
                        }
                }

                log.Printf("📊 [saveGameResultToDatabase] PlayerResult[%d]: PlayerID=%s, DBID=%d, WinGold=%d", 
                        i, players[i].PlayerID, dbID, players[i].WinGold)

                if dbID == landlordID {
                        landlordWinGold = players[i].WinGold
                        landlordWinArenaCoin = players[i].WinGold // 竞技币与金币相同
                } else if dbID == farmer1ID {
                        farmer1WinGold = players[i].WinGold
                        farmer1WinArenaCoin = players[i].WinGold
                } else if dbID == farmer2ID {
                        farmer2WinGold = players[i].WinGold
                        farmer2WinArenaCoin = players[i].WinGold
                }
        }

        log.Printf("📊 [saveGameResultToDatabase] 金币变化 - 地主: %d, 农民1: %d, 农民2: %d",
                landlordWinGold, farmer1WinGold, farmer2WinGold)

        // 🔧【新增】构建 WebSocket PlayerID -> 数据库 DBID 的映射
        playerIDMap := make(map[string]uint64)
        for _, p := range gs.players {
                if p.DBID > 0 {
                        playerIDMap[p.ID] = p.DBID
                }
        }
        log.Printf("📊 [saveGameResultToDatabase] PlayerID映射: %v", playerIDMap)

        // 保存游戏结果
        err := gs.gameLogger.SaveGameResult(
                landlordID, farmer1ID, farmer2ID,
                baseScore, totalMulti,
                spring, result,
                landlordWinGold, farmer1WinGold, farmer2WinGold,
                landlordWinArenaCoin, farmer1WinArenaCoin, farmer2WinArenaCoin,
                playerIDMap, // 🔧【新增】传入 PlayerID 到 DBID 的映射
        )
        if err != nil {
                log.Printf("❌ [saveGameResultToDatabase] 保存游戏结果到数据库失败: %v", err)
        } else {
                log.Printf("✅ [saveGameResultToDatabase] 游戏结果保存成功")
        }
}

// saveGameResultToDatabaseAsync 异步保存游戏结果到数据库（带重试机制）
// 🔧【新增】实现"无感结算"，数据库操作不阻塞结算弹窗
func (gs *GameSession) saveGameResultToDatabaseAsync(winner *GamePlayer, baseScore, totalMulti int, spring uint8, players []protocol.PlayerResult) {
        // 🔧【重要】复制必要的数据，避免在 goroutine 中访问可能已被修改的数据
        // 复制玩家信息
        type playerInfo struct {
                ID         string
                Name       string
                DBID       uint64
                IsLandlord bool
        }
        playerInfos := make([]playerInfo, len(gs.players))
        for i, p := range gs.players {
                playerInfos[i] = playerInfo{
                        ID:         p.ID,
                        Name:       p.Name,
                        DBID:       p.DBID,
                        IsLandlord: p.IsLandlord,
                }
        }

        // 复制 winner 信息
        winnerInfo := playerInfo{
                ID:         winner.ID,
                Name:       winner.Name,
                DBID:       winner.DBID,
                IsLandlord: winner.IsLandlord,
        }

        // 复制 gameLogger 引用（它是线程安全的）
        gameLogger := gs.gameLogger

        // 复制玩家结果
        playerResults := make([]protocol.PlayerResult, len(players))
        copy(playerResults, players)

        // 复制房间信息
        roomCode := gs.room.Code

        log.Printf("📊 [AsyncSave] 开始异步保存游戏结果，房间: %s", roomCode)

        // 重试机制：最多重试3次，每次间隔递增
        maxRetries := 3
        for retry := 0; retry < maxRetries; retry++ {
                if retry > 0 {
                        waitTime := time.Duration(retry) * time.Second
                        log.Printf("📊 [AsyncSave] 第 %d 次重试，等待 %v...", retry, waitTime)
                        time.Sleep(waitTime)
                }

                // 检查数据库连接
                if !database.GetInstance().IsConnected() {
                        log.Printf("⚠️ [AsyncSave] 数据库未连接，跳过保存")
                        return
                }

                // 查找地主和农民
                var landlordID, farmer1ID, farmer2ID uint64
                var landlordName, farmer1Name, farmer2Name string
                farmerCount := 0

                for _, p := range playerInfos {
                        if p.IsLandlord {
                                landlordID = p.DBID
                                landlordName = p.Name
                        } else {
                                if farmerCount == 0 {
                                        farmer1ID = p.DBID
                                        farmer1Name = p.Name
                                } else {
                                        farmer2ID = p.DBID
                                        farmer2Name = p.Name
                                }
                                farmerCount++
                        }
                }

                // 如果 DBID 为 0，尝试通过昵称查找或创建玩家
                if landlordID == 0 && landlordName != "" {
                        log.Printf("⚠️ [AsyncSave] 地主DBID为0，尝试通过昵称查找/创建: %s", landlordName)
                        landlordID = database.GetOrCreatePlayerByNickname(landlordName)
                }
                if farmer1ID == 0 && farmer1Name != "" {
                        log.Printf("⚠️ [AsyncSave] 农民1 DBID为0，尝试通过昵称查找/创建: %s", farmer1Name)
                        farmer1ID = database.GetOrCreatePlayerByNickname(farmer1Name)
                }
                if farmer2ID == 0 && farmer2Name != "" {
                        log.Printf("⚠️ [AsyncSave] 农民2 DBID为0，尝试通过昵称查找/创建: %s", farmer2Name)
                        farmer2ID = database.GetOrCreatePlayerByNickname(farmer2Name)
                }

                // 检查数据库ID是否有效
                if landlordID == 0 || farmer1ID == 0 || farmer2ID == 0 {
                        log.Printf("⚠️ [AsyncSave] 数据库ID无效，跳过保存")
                        return
                }

                // 计算游戏结果
                result := database.GameResultFarmerWin
                if winnerInfo.IsLandlord {
                        result = database.GameResultLandlordWin
                }

                // 从 players 数组中获取已计算好的金币变化
                var landlordWinGold, farmer1WinGold, farmer2WinGold int64
                var landlordWinArenaCoin, farmer1WinArenaCoin, farmer2WinArenaCoin int64

                for i := range playerResults {
                        var dbID uint64
                        for _, p := range playerInfos {
                                if p.ID == playerResults[i].PlayerID {
                                        dbID = p.DBID
                                        break
                                }
                        }

                        if dbID == landlordID {
                                landlordWinGold = playerResults[i].WinGold
                                landlordWinArenaCoin = playerResults[i].WinGold
                        } else if dbID == farmer1ID {
                                farmer1WinGold = playerResults[i].WinGold
                                farmer1WinArenaCoin = playerResults[i].WinGold
                        } else if dbID == farmer2ID {
                                farmer2WinGold = playerResults[i].WinGold
                                farmer2WinArenaCoin = playerResults[i].WinGold
                        }
                }

                log.Printf("📊 [AsyncSave] 金币变化 - 地主: %d, 农民1: %d, 农民2: %d",
                        landlordWinGold, farmer1WinGold, farmer2WinGold)

                // 构建 PlayerID -> DBID 映射
                playerIDMap := make(map[string]uint64)
                for _, p := range playerInfos {
                        if p.DBID > 0 {
                                playerIDMap[p.ID] = p.DBID
                        }
                }

                // 保存游戏结果
                err := gameLogger.SaveGameResult(
                        landlordID, farmer1ID, farmer2ID,
                        baseScore, totalMulti,
                        spring, result,
                        landlordWinGold, farmer1WinGold, farmer2WinGold,
                        landlordWinArenaCoin, farmer1WinArenaCoin, farmer2WinArenaCoin,
                        playerIDMap,
                )

                if err != nil {
                        log.Printf("❌ [AsyncSave] 第 %d 次保存失败: %v", retry+1, err)
                        // 如果是锁超时错误，继续重试
                        if retry < maxRetries-1 {
                                continue
                        }
                        log.Printf("❌ [AsyncSave] 已达最大重试次数，保存失败")
                        return
                }

                log.Printf("✅ [AsyncSave] 游戏结果保存成功，房间: %s", roomCode)
                return
        }
}

// recordGameResults 记录游戏结果到排行榜
func (gs *GameSession) recordGameResults(winner *GamePlayer) {
        ctx := context.Background()
        leaderboard := gs.leaderboard
        if leaderboard == nil {
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
                if rp != nil && rp.Client != nil {
                        playerName = rp.Client.GetName()
                }

                // 记录结果
                if err := leaderboard.RecordGameResult(ctx, p.ID, playerName, p.IsLandlord, isWinner); err != nil {
                        log.Printf("记录游戏结果失败: %v", err)
                }
        }
}

// ============================================================
// 【竞技场】轮次倒计时逻辑（服务端控制）
// ============================================================

// ArenaCountdownDuration 竞技场倒计时总时长（30秒）
const ArenaCountdownDuration = 30

// startArenaRoundCountdown 启动竞技场轮次倒计时
// 竞技场游戏结束后，服务端控制30秒倒计时，然后自动准备并开始下一轮
func (gs *GameSession) startArenaRoundCountdown() {
        gs.mu.Lock()
        defer gs.mu.Unlock()
        
        // 计算下一轮轮次
        nextRound := gs.room.GameCount + 1
        
        log.Printf("🏟️ [startArenaRoundCountdown] 房间 %s 启动30秒倒计时，下一轮: %d", gs.room.Code, nextRound)
        
        // 广播倒计时开始消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaRoundCountdown, &protocol.ArenaRoundCountdownPayload{
                Seconds:  ArenaCountdownDuration,
                Round:    nextRound,
                PeriodNo: "", // TODO: 从竞技场管理器获取期号
                RoomID:   0,  // TODO: 从房间配置获取
                Message:  "下一轮将在 30 秒后开始",
        }))
        
        // 启动倒计时协程
        go gs.runArenaCountdown(ArenaCountdownDuration, nextRound)
}

// runArenaCountdown 运行竞技场倒计时
// 每秒广播一次倒计时更新
func (gs *GameSession) runArenaCountdown(totalSeconds, nextRound int) {
        ticker := time.NewTicker(1 * time.Second)
        defer ticker.Stop()
        
        remaining := totalSeconds
        
        for {
                select {
                case <-ticker.C:
                        remaining--
                        
                        // 广播倒计时更新
                        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaCountdownTick, &protocol.ArenaCountdownTickPayload{
                                Seconds:  remaining,
                                PeriodNo: "",
                                RoomID:   0,
                        }))
                        
                        log.Printf("🏟️ [runArenaCountdown] 房间 %s 倒计时: %d秒", gs.room.Code, remaining)
                        
                        // 倒计时结束
                        if remaining <= 0 {
                                gs.onArenaCountdownEnd(nextRound)
                                return
                        }
                }
        }
}

// onArenaCountdownEnd 竞技场倒计时结束处理
// 自动为所有玩家准备，然后开始新一轮游戏
func (gs *GameSession) onArenaCountdownEnd(nextRound int) {
        gs.mu.Lock()
        defer gs.mu.Unlock()
        
        log.Printf("🏟️ [onArenaCountdownEnd] 房间 %s 倒计时结束，自动准备并开始第 %d 轮", gs.room.Code, nextRound)
        
        // 广播自动准备消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaAutoReady, &protocol.ArenaAutoReadyPayload{
                PeriodNo: "",
                RoomID:   0,
                Message:  "系统已自动准备",
        }))
        
        // 为所有玩家设置准备状态
        for playerID, rp := range gs.room.Players {
                if rp != nil {
                        rp.Ready = true
                        log.Printf("🏟️ [onArenaCountdownEnd] 玩家 %s 已自动准备", playerID)
                }
        }
        
        // 更新房间状态
        gs.room.State = RoomStateReady
        
        // 调用房间开始游戏
        if err := gs.room.startGameLocked(); err != nil {
                log.Printf("❌ [onArenaCountdownEnd] 开始游戏失败: %v", err)
                return
        }
        
        // 创建新的游戏会话并开始
        // 注意：这里需要通过房间管理器的回调来创建新会话
        // 暂时直接调用 Start 方法重用当前会话
        gs.resetForNewRound()
        gs.Start()
        
        log.Printf("✅ [onArenaCountdownEnd] 房间 %s 第 %d 轮游戏已开始", gs.room.Code, nextRound)
}

// resetForNewRound 重置游戏会话状态以准备新一轮
func (gs *GameSession) resetForNewRound() {
        // 重置游戏状态
        gs.state = GameStateInit
        gs.deck = nil
        gs.bottomCards = nil
        gs.callIndex = 0
        gs.callRound = 0
        gs.callTurnIndex = 0
        gs.callHistory = make([]CallRecord, 0)
        gs.firstCallerIdx = -1
        gs.lastCallerIdx = -1
        gs.currentCallerID = ""
        gs.pendingCallAction = ""
        gs.reDealCount = 0
        gs.currentPlayer = 0
        gs.lastPlayedHand = nil
        gs.lastPlayerIdx = -1
        gs.consecutivePasses = 0
        gs.playerOutStatus = make(map[int]bool)
        
        // 重置玩家状态
        for _, p := range gs.players {
                p.IsLandlord = false
                p.Hand = nil
        }
        
        log.Printf("🔄 [resetForNewRound] 房间 %s 已重置，准备新一轮", gs.room.Code)
}
