package session

import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "math/rand"
        "sort"
        "strconv"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/cdnutil"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/game/deal"
        "github.com/palemoky/fight-the-landlord/internal/game/rule"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/codec"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
        "github.com/palemoky/fight-the-landlord/internal/types"
        "github.com/palemoky/fight-the-landlord/tournament"
)

// 全奋发牌管理器
var globalDealManager = deal.NewDealManager()

func init() {
        // 初始化随机数种子
        rand.Seed(time.Now().UnixNano())
}

// Start 开始游戏
func (gs *GameSession) Start() {
        log.Printf("🃏 [GameSession.Start] 开始游戏会话, 玩家数: %d", len(gs.players))

        // 🔧【关键修复】使用局部变量存储需要在锁外调用的函数
        var startCallLandlordFunc func()

        func() {
                gs.mu.Lock()
                defer gs.mu.Unlock()

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

                // 5. 准备在锁外调用 StartCallLandlord
                startCallLandlordFunc = gs.StartCallLandlord
        }()

        // 🔧【关键修复】在锁外调用 StartCallLandlord，避免死锁
        // 🔧【关键修复】增加延迟，等待客户端发牌动画完成（约3秒）
        // 客户端发牌动画：17张牌 × 80ms间隔 + 动画时间 ≈ 1.5秒
        // 增加3秒延迟确保所有客户端动画完成，按钮能正确显示
        if startCallLandlordFunc != nil {
                log.Printf("🃏 [GameSession.Start] 等待 3 秒后开始抢地主阶段，让客户端发牌动画完成...")
                time.Sleep(3 * time.Second)
                log.Printf("🃏 [GameSession.Start] 延迟结束，开始抢地主阶段")
                startCallLandlordFunc()
        }
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
                var matchCoin int64 = 0 // 🔧【新增】竞技场模式下的竞技币

                // 🔧【重构】竞技场模式：使用 participations.match_coin，不影响 player.gold
                if gs.room.RoomCategory == 2 && gs.room.PeriodNo != "" {
                        // 竞技场模式：从 ddz_arena_participations 获取 match_coin
                        arenaGold, err := database.GetArenaGold(gs.room.PeriodNo, p.DBID)
                        if err != nil {
                                log.Printf("⚠️ [ArenaGold] 获取赛事金币失败: period_no=%s, player_id=%d, err=%v", gs.room.PeriodNo, p.DBID, err)
                                arenaGold = 0
                        }

                        // 计算变化后的赛事金币
                        matchCoin = arenaGold + winGold
                        if matchCoin < 0 {
                                matchCoin = 0
                        }

                        log.Printf("🏟️ [ArenaGold] 玩家 %s (DBID=%d): 赛事金币=%d, 本局变化=%d, 结算后=%d",
                                p.Name, p.DBID, arenaGold, winGold, matchCoin)

                        // 更新赛事金币（异步）
                        go func(playerDBID uint64, change int64, afterGold int64) {
                                reason := database.ArenaGoldReasonLose
                                if change > 0 {
                                        reason = database.ArenaGoldReasonWin
                                }
                                if _, err := database.UpdateArenaGold(gs.room.PeriodNo, playerDBID, change, gs.room.Code, reason); err != nil {
                                        log.Printf("❌ [ArenaGold] 更新赛事金币失败: %v", err)
                                }
                        }(p.DBID, winGold, matchCoin)

                        // 竞技场模式：goldAfter 保持 -1，表示不更新 player.gold
                        goldAfter = -1
                } else if p.DBID > 0 && database.GetInstance().IsConnected() {
                        // 普通场模式：使用 player.gold
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
                        GoldAfter:  goldAfter,  // 🔧【修复】显示计算后的金币值
                        MatchCoin:  matchCoin, // 🔧【新增】竞技场模式下的竞技币
                }

                log.Printf("📊 [PlayerResult] %s(%s): winGold=%d, goldAfter=%d, matchCoin=%d, isWinner=%v",
                        p.Name, role, winGold, goldAfter, matchCoin, isWinner)
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

        // 🔧【新增】计算竞技场下一轮轮次
        nextRound := gs.room.GameCount + 1

        // 🔧【新增】预先计算竞技场相关字段
        var totalPlayers int
        var activePlayers int // 当前剩余玩家数
        var isFinalRound bool
        var arenaCountdown int
        
        if gs.room.RoomCategory == 2 {
                periodNo := gs.room.PeriodNo
                totalPlayers = gs.getArenaTotalPlayers(periodNo)
                maxRoundCount := gs.getMaxRoundCount()
                currentRound := gs.room.GameCount
                
                // 🔧【关键修复】获取当前剩余玩家数
                // 通过 TournamentProgressManager 获取剩余玩家数
                tm := types.GetGlobalTournamentProgress()
                if tm != nil {
                        progress := tm.GetProgress(periodNo)
                        if progress != nil {
                                activePlayers = len(progress.PlayerTableStatus)
                        }
                }
                // 如果无法从 TournamentProgressManager 获取，尝试从数据库获取
                if activePlayers == 0 {
                        activePlayers = totalPlayers // 回退到报名人数
                }
                
                // 🔧【关键】判断是否是最终结算
                // 剩余 <= 3人 且 已完成配置的局数 → 最终结算
                isFinalRound = activePlayers > 0 && activePlayers <= 3 && currentRound >= maxRoundCount
                
                // 🔧【关键】设置倒计时
                // 每一局结束都是30秒倒计时
                // 只有最终结算（剩余<=3人且打完配置局数）才不需要倒计时
                if isFinalRound {
                        arenaCountdown = 0 // 直接显示排行榜
                } else {
                        arenaCountdown = 30 // 30秒倒计时
                }
                
                log.Printf("🏟️ [endGame] 竞技场: 当期报名人数=%d, 当前剩余人数=%d, 当前局数=%d/%d, 是否最终结算=%v, 倒计时=%d秒", 
                        totalPlayers, activePlayers, currentRound, maxRoundCount, isFinalRound, arenaCountdown)
        }

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
                // 🔧【修改】竞技场倒计时：每局30秒，最终结算不需要倒计时
                ArenaCountdown: arenaCountdown,
                ArenaRound:     nextRound,
                MatchCoin:      0, // 比赛金币（TODO: 从竞技场管理器获取）
                // 🔧【新增】竞技场最终结算标识
                TotalPlayers:  totalPlayers,
                IsFinalRound:  isFinalRound,
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

        log.Printf("🎮 [endGame] 检查房间类型: RoomCategory=%d (2=竞技场)", gs.room.RoomCategory)

        if gs.room.RoomCategory == 2 {
                // 🔧【新增】检查当期报名人数和剩余人数
                periodNo := gs.room.PeriodNo
                totalPlayers := gs.getArenaTotalPlayers(periodNo)
                maxRoundCount := gs.getMaxRoundCount()
                currentRound := gs.room.GameCount
                
                // 🔧【关键修复】获取当前剩余玩家数
                activePlayers := totalPlayers // 默认使用报名人数
                tm2 := types.GetGlobalTournamentProgress()
                if tm2 != nil {
                        progress := tm2.GetProgress(periodNo)
                        if progress != nil {
                                activePlayers = len(progress.PlayerTableStatus)
                        }
                }
                
                log.Printf("🏟️ [endGame] 竞技场房间 %s 结算完成, 期号=%s, 当期报名人数=%d, 当前剩余人数=%d, 当前局数=%d/%d", 
                        gs.room.Code, periodNo, totalPlayers, activePlayers, currentRound, maxRoundCount)

                // 🔧【关键修复】根据局数和剩余人数区分不同情况：
                // 1. 未完成配置的局数（如只打了1局，配置要打5局）→ 30秒倒计时后继续在同一桌打下一局
                // 2. 已完成配置的局数且剩余 <= 3人 → 直接显示排行榜（不需要倒计时，已在上面设置 arenaCountdown=0）
                // 3. 已完成配置的局数且剩余 > 3人 → 30秒倒计时后注册桌完成状态（等待其他桌）
                
                if currentRound >= maxRoundCount && activePlayers <= 3 {
                        // 已完成配置的局数且剩余 <= 3人，直接显示排行榜
                        // 注意：这种情况 arenaCountdown 已经设为 0，客户端会直接显示排行榜
                        log.Printf("🏆 [endGame] 已完成配置的局数且剩余 %d 人 <= 3，直接发送最终榜单", activePlayers)
                        gs.sendFinalRankingsForSingleTable(periodNo, players)
                } else if currentRound >= maxRoundCount {
                        // 已完成配置的局数且剩余 > 3人，30秒倒计时后注册桌完成状态
                        log.Printf("🏟️ [endGame] 已完成配置的局数 (当前=%d, 配置=%d)，剩余 %d 人 > 3，启动30秒倒计时后进入等待界面", currentRound, maxRoundCount, activePlayers)
                        gs.startArenaRoundCountdownForWaiting()
                } else {
                        // 未完成配置的局数，30秒倒计时后自动开始下一局（在同一桌继续打）
                        log.Printf("🏟️ [endGame] 未完成配置的局数 (当前=%d, 配置=%d)，启动30秒倒计时准备下一局", currentRound, maxRoundCount)
                        gs.startArenaRoundCountdown()
                }
        } else {
                // 普通场：玩家手动选择继续游戏或返回大厅
                log.Printf("🎮 [endGame] 普通场房间 %s 结算完成，等待玩家选择", gs.room.Code)

                // 🔧【关键修复】更新数据库房间状态为已结束
                // 这样即使服务器重启或玩家断开，数据库中的状态也是正确的
                if err := database.UpdatePartitionRoomStatus(gs.room.Code, database.RoomStatusFinished, gs.room.CreatedAt); err != nil {
                        log.Printf("⚠️ [endGame] 更新房间状态为已结束失败: %v", err)
                } else {
                        log.Printf("✅ [endGame] 房间 %s 数据库状态已更新为已结束", gs.room.Code)
                }

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

// ============================================================
// 游戏结果数据准备与保存
// ============================================================

// gameResultPrepareData 准备好的游戏结果数据
// 🔧【整合】统一数据结构，避免重复代码
type gameResultPrepareData struct {
        landlordID           uint64
        farmer1ID            uint64
        farmer2ID            uint64
        result               uint8
        landlordWinGold      int64
        farmer1WinGold       int64
        farmer2WinGold       int64
        landlordWinArenaCoin int64
        farmer1WinArenaCoin  int64
        farmer2WinArenaCoin  int64
        playerIDMap          map[string]uint64
}

// prepareGameResultData 准备游戏结果数据
// 🔧【整合】公共数据准备逻辑，避免 saveGameResultToDatabaseAsync 和 saveGameResultDirectly 重复代码
func (gs *GameSession) prepareGameResultData(winner *GamePlayer, players []protocol.PlayerResult) (*gameResultPrepareData, bool) {
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

        // 复制玩家结果
        playerResults := make([]protocol.PlayerResult, len(players))
        copy(playerResults, players)

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
                log.Printf("⚠️ [PrepareData] 地主DBID为0，尝试通过昵称查找/创建: %s", landlordName)
                landlordID = database.GetOrCreatePlayerByNickname(landlordName)
        }
        if farmer1ID == 0 && farmer1Name != "" {
                log.Printf("⚠️ [PrepareData] 农民1 DBID为0，尝试通过昵称查找/创建: %s", farmer1Name)
                farmer1ID = database.GetOrCreatePlayerByNickname(farmer1Name)
        }
        if farmer2ID == 0 && farmer2Name != "" {
                log.Printf("⚠️ [PrepareData] 农民2 DBID为0，尝试通过昵称查找/创建: %s", farmer2Name)
                farmer2ID = database.GetOrCreatePlayerByNickname(farmer2Name)
        }

        // 检查数据库ID是否有效
        if landlordID == 0 || farmer1ID == 0 || farmer2ID == 0 {
                log.Printf("⚠️ [PrepareData] 数据库ID无效: 地主=%d, 农民1=%d, 农民2=%d", landlordID, farmer1ID, farmer2ID)
                return nil, false
        }

        // 计算游戏结果
        result := database.GameResultFarmerWin
        if winner.IsLandlord {
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

        // 构建 PlayerID -> DBID 映射
        playerIDMap := make(map[string]uint64)
        for _, p := range playerInfos {
                if p.DBID > 0 {
                        playerIDMap[p.ID] = p.DBID
                }
        }

        log.Printf("📊 [PrepareData] 数据准备完成 - 地主: %d, 农民1: %d, 农民2: %d",
                landlordWinGold, farmer1WinGold, farmer2WinGold)

        return &gameResultPrepareData{
                landlordID:           landlordID,
                farmer1ID:            farmer1ID,
                farmer2ID:            farmer2ID,
                result:               result,
                landlordWinGold:      landlordWinGold,
                farmer1WinGold:       farmer1WinGold,
                farmer2WinGold:       farmer2WinGold,
                landlordWinArenaCoin: landlordWinArenaCoin,
                farmer1WinArenaCoin:  farmer1WinArenaCoin,
                farmer2WinArenaCoin:  farmer2WinArenaCoin,
                playerIDMap:          playerIDMap,
        }, true
}

// saveGameResultToDatabaseAsync 异步保存游戏结果到数据库（使用写入队列）
// 🔧【整合】简化逻辑，使用公共数据准备方法
func (gs *GameSession) saveGameResultToDatabaseAsync(winner *GamePlayer, baseScore, totalMulti int, spring uint8, players []protocol.PlayerResult) {
        roomCode := gs.room.Code
        gameLogger := gs.gameLogger

        log.Printf("📊 [AsyncSave] 开始准备游戏结果数据，房间: %s", roomCode)

        // 检查数据库连接
        if !database.GetInstance().IsConnected() {
                log.Printf("❌ [AsyncSave] 数据库未连接！游戏结果将丢失！房间: %s", roomCode)
                return
        }

        // 准备数据
        data, ok := gs.prepareGameResultData(winner, players)
        if !ok {
                log.Printf("⚠️ [AsyncSave] 数据准备失败，跳过保存")
                return
        }

        log.Printf("📊 [AsyncSave] 金币变化 - 地主: %d, 农民1: %d, 农民2: %d",
                data.landlordWinGold, data.farmer1WinGold, data.farmer2WinGold)

        // 检查写入队列是否可用
        if !database.GetWriteQueue().IsStarted() {
                log.Printf("⚠️ [AsyncSave] 写入队列未启动，使用直接保存")
                gs.saveGameResultDirectlyWithData(gameLogger, baseScore, totalMulti, spring, data)
                return
        }

        // 构建游戏结果数据
        gameData := gameLogger.BuildGameResultData(
                data.landlordID, data.farmer1ID, data.farmer2ID,
                baseScore, totalMulti,
                spring, data.result,
                data.landlordWinGold, data.farmer1WinGold, data.farmer2WinGold,
                data.landlordWinArenaCoin, data.farmer1WinArenaCoin, data.farmer2WinArenaCoin,
                data.playerIDMap,
        )

        // 提交到写入队列，非阻塞模式
        if err := database.SubmitGameResult(gameData); err != nil {
                log.Printf("❌ [AsyncSave] 提交到写入队列失败: %v，尝试直接保存", err)
                gs.saveGameResultDirectlyWithData(gameLogger, baseScore, totalMulti, spring, data)
        } else {
                log.Printf("✅ [AsyncSave] 游戏结果已提交到写入队列，房间: %s", roomCode)
        }
}

// saveGameResultDirectlyWithData 使用准备好的数据直接保存（回退方案）
// 🔧【整合】简化逻辑，接收已准备好的数据
func (gs *GameSession) saveGameResultDirectlyWithData(gameLogger *GameLogger, baseScore, totalMulti int, spring uint8, data *gameResultPrepareData) {
        err := gameLogger.SaveGameResult(
                data.landlordID, data.farmer1ID, data.farmer2ID,
                baseScore, totalMulti,
                spring, data.result,
                data.landlordWinGold, data.farmer1WinGold, data.farmer2WinGold,
                data.landlordWinArenaCoin, data.farmer1WinArenaCoin, data.farmer2WinArenaCoin,
                data.playerIDMap,
        )
        if err != nil {
                log.Printf("❌ [DirectSave] 保存失败: %v", err)
        } else {
                log.Printf("✅ [DirectSave] 保存成功")
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
// 🔧【修复】移除锁，因为它在被锁保护的上下文中调用，使用 goroutine 避免阻塞
func (gs *GameSession) startArenaRoundCountdown() {
        // 🔧【关键修复】检查是否已有倒计时在运行，防止重复启动
        gs.arenaCountdownMu.Lock()
        if gs.arenaCountdownActive {
                gs.arenaCountdownMu.Unlock()
                log.Printf("⚠️ [startArenaRoundCountdown] 房间 %s 已有倒计时在运行，跳过", gs.room.Code)
                return
        }
        gs.arenaCountdownActive = true
        gs.arenaCountdownMu.Unlock()

        // 🔧【关键修复】复制必要数据后启动 goroutine，避免死锁
        // 因为调用者（HandlePlayCards 等）持有 gs.mu 锁，这里不能同步获取锁
        roomCode := gs.room.Code
        gameCount := gs.room.GameCount
        periodNo := gs.room.PeriodNo
        roomConfigID := gs.room.RoomConfigID
        nextRound := gameCount + 1

        log.Printf("🏟️ [startArenaRoundCountdown] 房间 %s 启动30秒倒计时，下一轮: %d, 当前局数: %d",
                roomCode, nextRound, gameCount)

        // 广播倒计时开始消息（不需要锁）
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaRoundCountdown, &protocol.ArenaRoundCountdownPayload{
                Seconds:  ArenaCountdownDuration,
                Round:    nextRound,
                PeriodNo: periodNo,
                RoomID:   roomConfigID,
                Message:  "下一轮将在 30 秒后开始",
        }))

        // 启动倒计时协程
        log.Printf("🏟️ [startArenaRoundCountdown] 启动倒计时协程...")
        go gs.runArenaCountdown(ArenaCountdownDuration, nextRound)
}

// startArenaRoundCountdownForWaiting 启动竞技场等待倒计时
// 🔧【新增】用于打完配置局数后，等待其他桌完成的场景
// 倒计时结束后注册桌完成状态，而不是自动开始下一局
func (gs *GameSession) startArenaRoundCountdownForWaiting() {
        // 🔧【关键修复】检查是否已有倒计时在运行，防止重复启动
        gs.arenaCountdownMu.Lock()
        if gs.arenaCountdownActive {
                gs.arenaCountdownMu.Unlock()
                log.Printf("⚠️ [startArenaRoundCountdownForWaiting] 房间 %s 已有倒计时在运行，跳过", gs.room.Code)
                return
        }
        gs.arenaCountdownActive = true
        gs.arenaCountdownMu.Unlock()

        roomCode := gs.room.Code
        gameCount := gs.room.GameCount
        periodNo := gs.room.PeriodNo
        roomConfigID := gs.room.RoomConfigID

        log.Printf("🏟️ [startArenaRoundCountdownForWaiting] 房间 %s 启动30秒倒计时（等待界面），当前局数: %d",
                roomCode, gameCount)

        // 广播倒计时开始消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaRoundCountdown, &protocol.ArenaRoundCountdownPayload{
                Seconds:  ArenaCountdownDuration,
                Round:    gameCount,
                PeriodNo: periodNo,
                RoomID:   roomConfigID,
                Message:  "等待其他玩家完成，30秒后进入下一阶段",
        }))

        // 启动倒计时协程
        log.Printf("🏟️ [startArenaRoundCountdownForWaiting] 启动倒计时协程...")
        go gs.runArenaCountdownForWaiting(ArenaCountdownDuration)
}

// runArenaCountdownForWaiting 运行竞技场等待倒计时
// 🔧【新增】倒计时结束后注册桌完成状态
func (gs *GameSession) runArenaCountdownForWaiting(totalSeconds int) {
        ticker := time.NewTicker(1 * time.Second)
        defer ticker.Stop()

        // 🔧【关键修复】确保在函数结束时清除倒计时状态
        defer func() {
                gs.arenaCountdownMu.Lock()
                gs.arenaCountdownActive = false
                gs.arenaCountdownMu.Unlock()
                log.Printf("🏟️ [runArenaCountdownForWaiting] 房间 %s 倒计时结束，状态已清除", gs.room.Code)
        }()

        remaining := totalSeconds
        log.Printf("🏟️ [runArenaCountdownForWaiting] 房间 %s 开始倒计时, 总秒数=%d", gs.room.Code, totalSeconds)

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

                        log.Printf("🏟️ [runArenaCountdownForWaiting] 房间 %s 倒计时: %d秒", gs.room.Code, remaining)

                        // 倒计时结束
                        if remaining <= 0 {
                                log.Printf("🏟️ [runArenaCountdownForWaiting] 房间 %s 倒计时归零，注册桌完成状态", gs.room.Code)
                                // 🔧【关键】倒计时结束后注册桌完成状态，检查所有桌是否完成
                                gs.registerTableFinishedAndCheckAdvance()
                                return
                        }
                }
        }
}

// runArenaCountdown 运行竞技场倒计时
// 每秒广播一次倒计时更新
func (gs *GameSession) runArenaCountdown(totalSeconds, nextRound int) {
        ticker := time.NewTicker(1 * time.Second)
        defer ticker.Stop()

        // 🔧【关键修复】确保在函数结束时清除倒计时状态
        defer func() {
                gs.arenaCountdownMu.Lock()
                gs.arenaCountdownActive = false
                gs.arenaCountdownMu.Unlock()
                log.Printf("🏟️ [runArenaCountdown] 房间 %s 倒计时结束，状态已清除", gs.room.Code)
        }()

        remaining := totalSeconds
        log.Printf("🏟️ [runArenaCountdown] 房间 %s 开始倒计时, 总秒数=%d, 下一轮=%d", gs.room.Code, totalSeconds, nextRound)

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
                                log.Printf("🏟️ [runArenaCountdown] 房间 %s 倒计时归零，准备调用 onArenaCountdownEnd()", gs.room.Code)
                                gs.onArenaCountdownEnd(nextRound)
                                return
                        }
                }
        }
}

// onArenaCountdownEnd 竞技场倒计时结束处理
// 自动为所有玩家准备，然后开始新一轮游戏
func (gs *GameSession) onArenaCountdownEnd(nextRound int) {
        log.Printf("🏟️ [onArenaCountdownEnd] ========== 开始处理 ==========")
        log.Printf("🏟️ [onArenaCountdownEnd] 房间 %s 倒计时结束，准备开始第 %d 轮", gs.room.Code, nextRound)

        // 🔧【新增】检查是否达到最大轮次
        maxRoundCount := gs.getMaxRoundCount()
        currentRound := gs.room.GameCount // 当前已完成的局数

        log.Printf("🏟️ [onArenaCountdownEnd] 轮次检查: 当前已完成 %d 局, 最大轮次 %d, GameCount=%d", currentRound, maxRoundCount, gs.room.GameCount)

        if currentRound >= maxRoundCount {
                log.Printf("🏁 [onArenaCountdownEnd] 房间 %s 已完成 %d 轮，竞技场结束，发送最终榜单", gs.room.Code, currentRound)
                
                // 🔧【关键修复】发送最终榜单
                gs.broadcastFinalRankings()
                
                // 广播竞技场结束消息
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaMatchEnd, &protocol.ArenaMatchEndPayload{
                        PeriodNo: gs.room.PeriodNo,
                        RoomID:   gs.room.RoomConfigID,
                        Message:  "比赛结束",
                }))
                // 调用游戏结束回调销毁房间
                if gs.onGameEnd != nil {
                        gs.scheduleRoomDestruction()
                }
                log.Printf("🏟️ [onArenaCountdownEnd] ========== 最终榜单发送完成 ==========")
                return
        }

        log.Printf("🏟️ [onArenaCountdownEnd] 未达到最大轮次，准备进入第 %d 轮", nextRound)

        // 🔧【关键修复】使用单独的锁块，避免与 Start() 死锁
        {
                gs.mu.Lock()

                log.Printf("🏟️ [onArenaCountdownEnd] 当前房间状态: %v, RoomCategory: %d, 玩家数: %d",
                        gs.room.State, gs.room.RoomCategory, len(gs.room.Players))

                // 广播自动准备消息
                log.Printf("🏟️ [onArenaCountdownEnd] 准备广播 MsgArenaAutoReady 消息...")
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaAutoReady, &protocol.ArenaAutoReadyPayload{
                        PeriodNo: "",
                        RoomID:   0,
                        Message:  "系统已自动准备",
                }))
                log.Printf("🏟️ [onArenaCountdownEnd] MsgArenaAutoReady 消息已广播")

                // 为所有玩家设置准备状态
                for playerID, rp := range gs.room.Players {
                        if rp != nil {
                                rp.Ready = true
                                log.Printf("🏟️ [onArenaCountdownEnd] 玩家 %s 已自动准备", playerID)
                        }
                }

                // 🔧【修复】确保房间状态为 Waiting，这样 StartGame() 检查才能通过
                // StartGame() 内部会将状态从 Waiting 改为 Ready
                gs.room.State = RoomStateWaiting
                log.Printf("🏟️ [onArenaCountdownEnd] 房间状态已设置为 Waiting")

                // 调用房间开始游戏
                log.Printf("🏟️ [onArenaCountdownEnd] 准备调用 StartGame()...")
                if err := gs.room.StartGame(); err != nil {
                        log.Printf("❌ [onArenaCountdownEnd] 开始游戏失败: %v", err)
                        // 🔧【修复】即使失败也要尝试恢复，不要直接返回
                        log.Printf("🏟️ [onArenaCountdownEnd] 尝试直接调用 Start()...")
                        gs.mu.Unlock()
                        gs.Start()
                        log.Printf("✅ [onArenaCountdownEnd] 房间 %s 第 %d 轮游戏已开始(通过直接调用Start)", gs.room.Code, nextRound)
                        return
                }
                log.Printf("🏟️ [onArenaCountdownEnd] StartGame() 调用成功")

                // 重置游戏会话状态
                gs.resetForNewRound()

                // 🔧【关键】先解锁再调用 Start()，因为 Start() 内部也会获取锁
                gs.mu.Unlock()
        }

        // 在锁外调用 Start()，避免死锁
        log.Printf("🏟️ [onArenaCountdownEnd] 准备调用 Start()...")
        gs.Start()

        log.Printf("✅ [onArenaCountdownEnd] 房间 %s 第 %d 轮游戏已开始", gs.room.Code, nextRound)
        log.Printf("🏟️ [onArenaCountdownEnd] ========== 处理完成 ==========")
}

// getMaxRoundCount 获取竞技场每桌最大局数
// 🔧【修复】返回房间配置的每桌局数（match_round_count），而不是淘汰轮次数
// 每桌需要打完配置的局数后，才进行淘汰排名
func (gs *GameSession) getMaxRoundCount() int {
        // 默认每桌打 3 局
        defaultRoundCount := 3

        // 从房间配置获取每桌局数
        if gs.room.RoomConfigID > 0 {
                roomConfig, err := database.GetRoomConfigByID(gs.room.RoomConfigID)
                if err != nil {
                        log.Printf("⚠️ [getMaxRoundCount] 获取房间配置失败: %v, 使用默认局数 %d", err, defaultRoundCount)
                        return defaultRoundCount
                }
                if roomConfig.MatchRoundCount > 0 {
                        log.Printf("🏟️ [getMaxRoundCount] 房间配置ID=%d, 每桌局数=%d", gs.room.RoomConfigID, roomConfig.MatchRoundCount)
                        return roomConfig.MatchRoundCount
                }
        }

        log.Printf("🏟️ [getMaxRoundCount] 无房间配置，使用默认局数 %d", defaultRoundCount)
        return defaultRoundCount
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
        gs.lastPlayedHand = rule.ParsedHand{}
        gs.lastPlayerIdx = -1
        gs.consecutivePasses = 0
        gs.playerOutStatus = make(map[int]bool)

        // 🔧【关键修复】重置倍数相关字段，避免倍数累积
        gs.qiangCount = 0   // 抢地主次数
        gs.rocketCount = 0  // 王炸次数

        // 🔧【关键修复】重置 gameLogger 的炸弹和王炸计数
        if gs.gameLogger != nil {
                gs.gameLogger.Reset()
        }

        // 重置玩家状态
        for _, p := range gs.players {
                p.IsLandlord = false
                p.Hand = nil
        }

        log.Printf("🔄 [resetForNewRound] 房间 %s 已重置，准备新一轮", gs.room.Code)
}

// ============================================================
// 🔧【新增】一桌玩家直接显示最终排名
// ============================================================

// getArenaTotalPlayers 获取当期报名人数
func (gs *GameSession) getArenaTotalPlayers(periodNo string) int {
        if periodNo == "" {
                return 0
        }

        // 从数据库获取当期报名人数
        count, err := database.CountArenaPeriodPlayersByPeriodNo(periodNo)
        if err != nil {
                log.Printf("⚠️ [getArenaTotalPlayers] 获取报名人数失败: periodNo=%s, err=%v", periodNo, err)
                return 0
        }

        return int(count)
}

// sendFinalRankingsForSingleTable 为一桌玩家发送最终排名消息
// 当只有3人（一桌）时，直接显示冠军、亚军、季军排名
// 🔧【修复】从数据库获取所有参赛者（包含机器人补位），确保榜单完整
func (gs *GameSession) sendFinalRankingsForSingleTable(periodNo string, players []protocol.PlayerResult) {
        log.Printf("🏆 [sendFinalRankingsForSingleTable] 开始发送最终排名, periodNo=%s, 当前房间玩家数=%d", periodNo, len(players))

        // 🔧【修复】从数据库获取所有参赛者（包含机器人）
        participations, err := database.GetArenaParticipationsByPeriodNo(periodNo)
        if err != nil || len(participations) == 0 {
                log.Printf("⚠️ [sendFinalRankingsForSingleTable] 获取参赛记录失败或为空: err=%v, 使用当前房间玩家", err)
                // 回退到使用传入的玩家列表
                gs.sendFinalRankingsFromPlayerList(periodNo, players)
                return
        }

        log.Printf("🏆 [sendFinalRankingsForSingleTable] 从数据库获取到 %d 个参赛者", len(participations))

        // 构建排名列表
        rankEntries := make([]protocol.TournamentRankEntry, len(participations))
        for i, p := range participations {
                // 🔧【修复】获取头像URL
                avatarURL := ""
                if p.IsRobot == 0 && p.Player.ID != 0 {
                        // 真人玩家使用关联的 Player 头像
                        avatarURL = p.Player.Avatar
                }
                // 机器人使用默认头像（可以后续设置为特定的机器人头像）

                // 🔧【修复】使用 CDN 补全头像 URL
                avatarURL = cdnutil.CompleteAvatar(avatarURL)

                rankEntries[i] = protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   strconv.FormatUint(p.PlayerID, 10),
                        PlayerName: getPlayerDisplayName(p),
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    p.IsRobot == 1,
                }
                log.Printf("🏆 [sendFinalRankingsForSingleTable] 排名 #%d: 玩家 %s (ID=%d), 金币=%d, isRobot=%v, avatar=%s",
                        i+1, getPlayerDisplayName(p), p.PlayerID, p.MatchCoin, p.IsRobot == 1, avatarURL)
        }

        // 构建 TOP3 排名列表
        top3 := make([]protocol.TournamentRankEntry, 0, 3)
        for i := 0; i < 3 && i < len(rankEntries); i++ {
                top3 = append(top3, rankEntries[i])
        }

        // 构建 TOP20 排名列表
        top20 := make([]protocol.TournamentRankEntry, 0, 20)
        for i := 0; i < 20 && i < len(rankEntries); i++ {
                top20 = append(top20, rankEntries[i])
        }

        totalPlayers := len(rankEntries)

        // 🔧【修复】给真人玩家单独发送个性化消息
        for _, p := range participations {
                // 只发送给真人玩家（机器人不需要）
                if p.IsRobot == 1 {
                        continue
                }

                // 查找玩家排名
                myRank := 0
                myMatchCoin := p.MatchCoin
                for i, entry := range rankEntries {
                        if entry.PlayerID == strconv.FormatUint(p.PlayerID, 10) {
                                myRank = i + 1
                                break
                        }
                }

                payload := &protocol.TournamentFinalRankPayload{
                        PeriodNo:     periodNo,
                        TotalPlayers: totalPlayers,
                        Top3:         top3,
                        Top20:        top20,
                        MyRank:       myRank,
                        MyMatchCoin:  myMatchCoin,
                        Message:      "比赛结束",
                }

                log.Printf("🏆 [sendFinalRankingsForSingleTable] 发送最终榜单给真人玩家 %s (ID=%d), 我的排名=%d", getPlayerDisplayName(p), p.PlayerID, myRank)
                
                // 🔧【修复】遍历房间玩家，通过 PlayerID（数据库ID）找到正确的连接
                // room.Players 的 key 是 client.GetID()（客户端ID），不是数据库 PlayerID
                found := false
                for _, rp := range gs.room.Players {
                        if rp != nil && rp.Client != nil && rp.Client.GetPlayerID() == p.PlayerID {
                                rp.Client.SendMessage(codec.MustNewMessage(protocol.MsgTournamentFinalRank, payload))
                                found = true
                                log.Printf("✅ [sendFinalRankingsForSingleTable] 找到玩家 %d 的连接，发送成功", p.PlayerID)
                                break
                        }
                }
                if !found {
                        // 如果找不到玩家连接（玩家可能已断开），使用广播
                        log.Printf("⚠️ [sendFinalRankingsForSingleTable] 找不到玩家 %d 的连接，跳过发送", p.PlayerID)
                }
        }

        // 广播竞技场结束消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaMatchEnd, &protocol.ArenaMatchEndPayload{
                PeriodNo: periodNo,
                RoomID:   gs.room.RoomConfigID,
                Message:  "比赛结束",
        }))

        // 调用游戏结束回调销毁房间
        if gs.onGameEnd != nil {
                gs.scheduleRoomDestruction()
        }

        log.Printf("🏆 [sendFinalRankingsForSingleTable] 最终榜单发送完成, 总人数=%d, 真人=%d", totalPlayers, countRealPlayers(participations))
}

// sendFinalRankingsFromPlayerList 从玩家列表发送最终排名（回退方案）
func (gs *GameSession) sendFinalRankingsFromPlayerList(periodNo string, players []protocol.PlayerResult) {
        log.Printf("🏆 [sendFinalRankingsFromPlayerList] 使用玩家列表发送排名, 玩家数=%d", len(players))

        // 根据比赛金币排序
        sortedPlayers := make([]protocol.PlayerResult, len(players))
        copy(sortedPlayers, players)

        sort.Slice(sortedPlayers, func(i, j int) bool {
                return sortedPlayers[i].MatchCoin > sortedPlayers[j].MatchCoin
        })

        // 构建 TOP3
        top3 := make([]protocol.TournamentRankEntry, 0, 3)
        for i := 0; i < 3 && i < len(sortedPlayers); i++ {
                p := sortedPlayers[i]
                // 🔧【修复】尝试从房间获取头像信息
                avatarURL := ""
                if rp, ok := gs.room.Players[p.PlayerID]; ok && rp != nil && rp.Client != nil {
                        // 从房间玩家获取头像
                        avatarURL = gs.room.GetPlayerInfo(p.PlayerID).Avatar
                }
                avatarURL = cdnutil.CompleteAvatar(avatarURL)

                top3 = append(top3, protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    false,
                })
        }

        // 构建 TOP20
        top20 := make([]protocol.TournamentRankEntry, 0, 20)
        for i, p := range sortedPlayers {
                if i >= 20 {
                        break
                }
                // 🔧【修复】尝试从房间获取头像信息
                avatarURL := ""
                if rp, ok := gs.room.Players[p.PlayerID]; ok && rp != nil && rp.Client != nil {
                        // 从房间玩家获取头像
                        avatarURL = gs.room.GetPlayerInfo(p.PlayerID).Avatar
                }
                avatarURL = cdnutil.CompleteAvatar(avatarURL)

                top20 = append(top20, protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   p.PlayerID,
                        PlayerName: p.PlayerName,
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    false,
                })
        }

        totalPlayers := len(sortedPlayers)

        // 广播消息
        for _, p := range sortedPlayers {
                myRank := 0
                for i, sp := range sortedPlayers {
                        if sp.PlayerID == p.PlayerID {
                                myRank = i + 1
                                break
                        }
                }

                payload := &protocol.TournamentFinalRankPayload{
                        PeriodNo:     periodNo,
                        TotalPlayers: totalPlayers,
                        Top3:         top3,
                        Top20:        top20,
                        MyRank:       myRank,
                        MyMatchCoin:  p.MatchCoin,
                        Message:      "比赛结束",
                }

                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgTournamentFinalRank, payload))
        }

        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaMatchEnd, &protocol.ArenaMatchEndPayload{
                PeriodNo: periodNo,
                RoomID:   gs.room.RoomConfigID,
                Message:  "比赛结束",
        }))

        if gs.onGameEnd != nil {
                gs.scheduleRoomDestruction()
        }
}

// countRealPlayers 统计真人玩家数量
func countRealPlayers(participations []*database.ArenaParticipation) int {
        count := 0
        for _, p := range participations {
                if p.IsRobot == 0 {
                        count++
                }
        }
        return count
}

// getPlayerDisplayName 获取玩家显示名称
// 🔧【新增】处理机器人名称显示
func getPlayerDisplayName(p *database.ArenaParticipation) string {
        // 机器人显示为"智能陪练X号"
        if p.IsRobot == 1 {
                // 使用 PlayerID 最后一位数字作为编号
                robotIndex := p.PlayerID % 10
                if robotIndex == 0 {
                        robotIndex = 1
                }
                return fmt.Sprintf("智能陪练%d号", robotIndex)
        }
        
        // 真人玩家使用关联的 Player 昵称
        if p.Player.ID != 0 && p.Player.Nickname != "" {
                return p.Player.Nickname
        }
        
        // 回退：使用 PlayerID 作为标识
        return fmt.Sprintf("玩家%d", p.PlayerID)
}

// scheduleRoomDestruction 延迟销毁房间（给客户端时间显示排名）
func (gs *GameSession) scheduleRoomDestruction() {
        go func() {
                // 等待5秒让客户端显示排名
                time.Sleep(5 * time.Second)
                if gs.onGameEnd != nil {
                        gs.onGameEnd(gs.room)
                }
                log.Printf("🏆 [scheduleRoomDestruction] 房间已销毁")
        }()
}

// broadcastFinalRankings 从数据库获取玩家比赛金币并广播最终榜单
// 🔧【新增】用于倒计时结束后发送最终排名
func (gs *GameSession) broadcastFinalRankings() {
        periodNo := gs.room.PeriodNo
        if periodNo == "" {
                log.Printf("⚠️ [broadcastFinalRankings] 期号为空，跳过")
                return
        }

        log.Printf("🏆 [broadcastFinalRankings] 开始广播最终榜单, periodNo=%s", periodNo)

        // 1. 从数据库获取所有玩家的比赛金币
        participations, err := database.GetArenaParticipationsByPeriodNo(periodNo)
        if err != nil {
                log.Printf("⚠️ [broadcastFinalRankings] 获取参赛记录失败: %v", err)
                return
        }

        if len(participations) == 0 {
                log.Printf("⚠️ [broadcastFinalRankings] 没有参赛记录")
                return
        }

        // 2. 按比赛金币排序
        sort.Slice(participations, func(i, j int) bool {
                return participations[i].MatchCoin > participations[j].MatchCoin
        })

        // 3. 构建 TOP3 排名列表
        top3 := make([]protocol.TournamentRankEntry, 0, 3)
        for i := 0; i < 3 && i < len(participations); i++ {
                p := participations[i]
                // 🔧【修复】获取并补全头像 URL
                avatarURL := ""
                if p.IsRobot == 0 && p.Player.ID != 0 {
                        avatarURL = p.Player.Avatar
                }
                avatarURL = cdnutil.CompleteAvatar(avatarURL)

                top3 = append(top3, protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   strconv.FormatUint(p.PlayerID, 10),
                        PlayerName: getPlayerDisplayName(p),
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    p.IsRobot == 1,
                })
                log.Printf("🏆 [broadcastFinalRankings] TOP3 #%d: 玩家 %s (ID=%d), 金币=%d, isRobot=%v",
                        i+1, getPlayerDisplayName(p), p.PlayerID, p.MatchCoin, p.IsRobot == 1)
        }

        // 4. 构建 TOP20 排名列表
        top20 := make([]protocol.TournamentRankEntry, 0, 20)
        for i, p := range participations {
                if i >= 20 {
                        break
                }
                // 🔧【修复】获取并补全头像 URL
                avatarURL := ""
                if p.IsRobot == 0 && p.Player.ID != 0 {
                        avatarURL = p.Player.Avatar
                }
                avatarURL = cdnutil.CompleteAvatar(avatarURL)

                top20 = append(top20, protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   strconv.FormatUint(p.PlayerID, 10),
                        PlayerName: getPlayerDisplayName(p),
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    p.IsRobot == 1,
                })
        }

        // 5. 获取总人数
        totalPlayers := len(participations)

        // 6. 🔧【修复】给真人玩家单独发送个性化消息
        for i, p := range participations {
                // 只发送给真人玩家（机器人不需要）
                if p.IsRobot == 1 {
                        continue
                }

                myRank := i + 1
                myMatchCoin := p.MatchCoin

                payload := &protocol.TournamentFinalRankPayload{
                        PeriodNo:     periodNo,
                        TotalPlayers: totalPlayers,
                        Top3:         top3,
                        Top20:        top20,
                        MyRank:       myRank,
                        MyMatchCoin:  myMatchCoin,
                        Message:      "比赛结束",
                }

                log.Printf("🏆 [broadcastFinalRankings] 发送最终榜单给真人玩家 %s (ID=%d), 我的排名=%d", getPlayerDisplayName(p), p.PlayerID, myRank)
                
                // 🔧【修复】遍历房间玩家，通过 PlayerID（数据库ID）找到正确的连接
                // room.Players 的 key 是 client.GetID()（客户端ID），不是数据库 PlayerID
                found := false
                for _, rp := range gs.room.Players {
                        if rp != nil && rp.Client != nil && rp.Client.GetPlayerID() == p.PlayerID {
                                rp.Client.SendMessage(codec.MustNewMessage(protocol.MsgTournamentFinalRank, payload))
                                found = true
                                log.Printf("✅ [broadcastFinalRankings] 找到玩家 %d 的连接，发送成功", p.PlayerID)
                                break
                        }
                }
                if !found {
                        // 如果找不到玩家连接（玩家可能已断开），跳过发送
                        log.Printf("⚠️ [broadcastFinalRankings] 找不到玩家 %d 的连接，跳过发送", p.PlayerID)
                }
        }

        log.Printf("🏆 [broadcastFinalRankings] 最终榜单广播完成, 总人数=%d, 真人=%d", totalPlayers, countRealPlayers(participations))
}

// ============================================================
// 🔧【新增】桌完成状态跟踪和自动推进下一轮
// ============================================================

// registerTableFinishedAndCheckAdvance 注册桌完成状态并检查是否可以进入下一轮
// 🔧【核心修改】移除30秒倒计时，改为等待所有桌完成后自动进入下一轮
func (gs *GameSession) registerTableFinishedAndCheckAdvance() {
        periodNo := gs.room.PeriodNo
        if periodNo == "" {
                log.Printf("⚠️ [registerTableFinishedAndCheckAdvance] 期号为空，跳过")
                return
        }

        // 获取当前轮次
        currentRound := gs.room.GameCount

        // 收集这一桌的玩家ID列表
        playerIDs := make([]string, 0)
        for _, p := range gs.players {
                playerIDs = append(playerIDs, p.ID)
        }

        // 获取服务器的 TournamentProgressManager
        tm := types.GetGlobalTournamentProgress()
        if tm == nil {
                log.Printf("⚠️ [registerTableFinishedAndCheckAdvance] TournamentProgressManager 不可用")
                // 回退到旧的倒计时机制
                gs.startArenaRoundCountdown()
                return
        }

        // 注册桌完成状态
        // 使用房间代码的哈希值作为桌ID，确保同一房间多次调用使用相同的ID
        tableID := gs.room.ArenaSessionID
        if tableID == 0 {
                // 如果 ArenaSessionID 为空，使用房间代码哈希作为备选
                tableID = uint64(uint32(len(gs.room.Code)))
                for _, c := range gs.room.Code {
                        tableID = tableID*31 + uint64(c)
                }
        }

        allFinished, finishedCount, totalTables := tm.UpdateTableFinished(periodNo, currentRound, tableID, playerIDs)

        log.Printf("🏟️ [registerTableFinishedAndCheckAdvance] 桌完成注册: periodNo=%s, tableID=%d, finished=%d/%d, allFinished=%v",
                periodNo, tableID, finishedCount, totalTables, allFinished)

        // 如果所有桌都完成了，触发下一轮或最终榜单
        if allFinished {
                log.Printf("🏟️ [registerTableFinishedAndCheckAdvance] 所有桌完成，准备进入下一阶段")
                gs.onAllTablesFinished(periodNo, currentRound)
        }
}

// onAllTablesFinished 所有桌完成后的处理
// 🔧【重构】添加淘汰阶段逻辑
// 流程：等待完成 → 排名计算 → 检查剩余人数 → 执行淘汰或发送最终榜单
func (gs *GameSession) onAllTablesFinished(periodNo string, currentRound int) {
        maxRoundCount := gs.getMaxRoundCount()

        log.Printf("🏟️ [onAllTablesFinished] periodNo=%s, 当前已完成局数=%d, 每桌配置局数=%d",
                periodNo, currentRound, maxRoundCount)

        // 🔧【关键】获取当期所有参赛玩家并排名
        rankings := gs.calculatePeriodRankings(periodNo)
        log.Printf("🏟️ [onAllTablesFinished] 排名计算完成，玩家数=%d", len(rankings))

        // 🔧【关键修复】根据剩余人数决定是发送最终榜单还是执行淘汰
        // 如果剩余 <= 3人，直接发送最终榜单（决赛）
        // 如果剩余 > 3人，执行淘汰逻辑
        if len(rankings) <= 3 {
                // 剩余3人或更少，比赛结束，发送最终榜单
                log.Printf("🏁 [onAllTablesFinished] 剩余 %d 人，比赛结束，发送最终榜单", len(rankings))
                gs.broadcastFinalRankings()

                // 广播竞技场结束消息
                gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaMatchEnd, &protocol.ArenaMatchEndPayload{
                        PeriodNo: periodNo,
                        RoomID:   gs.room.RoomConfigID,
                        Message:  "比赛结束",
                }))

                // 调用游戏结束回调销毁房间
                if gs.onGameEnd != nil {
                        gs.scheduleRoomDestruction()
                }
        } else {
                // 🔧【核心】执行淘汰逻辑
                eliminationTarget := gs.getEliminationTarget(currentRound, len(rankings))
                log.Printf("🏟️ [onAllTablesFinished] 本轮淘汰目标: 保留前 %d 名", eliminationTarget)

                // 执行淘汰并获取淘汰结果
                eliminatedPlayers, survivingPlayers := gs.executeElimination(periodNo, rankings, eliminationTarget)
                log.Printf("🏟️ [onAllTablesFinished] 淘汰完成: 淘汰=%d人, 晋级=%d人", 
                        len(eliminatedPlayers), len(survivingPlayers))

                // 通知被淘汰的玩家
                gs.notifyEliminatedPlayers(periodNo, eliminatedPlayers)

                // 🔧【关键】只有未被淘汰的玩家才能进入下一轮
                if len(survivingPlayers) <= 3 {
                        // 剩余3人或更少，直接进入决赛
                        log.Printf("🏆 [onAllTablesFinished] 剩余 %d 人，进入决赛", len(survivingPlayers))
                        gs.startFinalRound(periodNo, survivingPlayers)
                } else {
                        // 进入下一轮
                        log.Printf("🏟️ [onAllTablesFinished] 准备进入下一轮淘汰赛，晋级 %d 人", len(survivingPlayers))
                        gs.advanceToNextRoundWithNewPlayers(periodNo, currentRound+1, survivingPlayers)
                }
        }
}

// 🔧【新增】计算当期所有参赛玩家的排名
// 按金币降序排序，金币相同按玩家ID正序排序
// 🔧【修复】只计算未淘汰的玩家
func (gs *GameSession) calculatePeriodRankings(periodNo string) []protocol.TournamentRankEntry {
        // 🔧【关键修复】只获取未淘汰的玩家参与排名
        participations, err := database.GetActiveParticipationsByPeriodNo(periodNo)
        if err != nil || len(participations) == 0 {
                log.Printf("⚠️ [calculatePeriodRankings] 获取参赛记录失败: err=%v", err)
                return nil
        }

        // 按金币降序排序（已从数据库排序）
        rankings := make([]protocol.TournamentRankEntry, len(participations))
        for i, p := range participations {
                avatarURL := cdnutil.CompleteAvatar("")
                if p.Player.ID != 0 {
                        avatarURL = cdnutil.CompleteAvatar(p.Player.Avatar)
                }

                rankings[i] = protocol.TournamentRankEntry{
                        Rank:       i + 1,
                        PlayerID:   strconv.FormatUint(p.PlayerID, 10),
                        PlayerName: getPlayerDisplayName(p),
                        Avatar:     avatarURL,
                        MatchCoin:  p.MatchCoin,
                        IsRobot:    p.IsRobot == 1,
                }
        }

        return rankings
}

// 🔧【新增】获取本轮淘汰目标（保留多少人）
// 淘汰规则 [60, 30, 18, 9, 3]
// 🔧【修复】添加边界检查，确保淘汰目标不超过实际人数
// 🔧【关键修复】基于初始报名人数计算淘汰目标，而不是当前人数
func (gs *GameSession) getEliminationTarget(currentRound int, currentPlayers int) int {
        // 🔧【关键修复】边界检查：如果人数 <= 3，直接返回人数（决赛）
        if currentPlayers <= 3 {
                log.Printf("🏟️ [getEliminationTarget] 人数=%d <= 3，直接决赛", currentPlayers)
                return currentPlayers
        }

        // 从房间配置获取淘汰规则
        rules := gs.getEliminationRules()

        // 🔧【关键修复】获取初始报名人数，而不是当前人数
        periodNo := gs.room.PeriodNo
        totalPlayers := gs.getArenaTotalPlayers(periodNo)
        if totalPlayers <= 0 {
                totalPlayers = currentPlayers // 回退到当前人数
        }

        // 计算初始淘汰规则（基于报名人数）
        activeRules := rules.GetActiveRules(totalPlayers)

        // 🔧【关键修复】如果 activeRules 为空，表示直接决赛
        if len(activeRules) == 0 {
                log.Printf("🏟️ [getEliminationTarget] activeRules 为空，初始人数=%d，直接决赛", totalPlayers)
                return currentPlayers
        }

        // 获取本轮淘汰目标
        // currentRound 是已完成的轮次数（从1开始）
        // 淘汰规则索引：第一轮用 activeRules[0]，第二轮用 activeRules[1]，依此类推
        ruleIndex := currentRound - 1
        if ruleIndex < len(activeRules) {
                target := activeRules[ruleIndex]
                // 🔧【关键修复】确保淘汰目标不超过实际人数
                if target > currentPlayers {
                        log.Printf("🏟️ [getEliminationTarget] 目标=%d > 当前人数=%d，调整为当前人数", target, currentPlayers)
                        return currentPlayers
                }
                log.Printf("🏟️ [getEliminationTarget] round=%d, 初始人数=%d, 当前人数=%d, target=%d, activeRules=%v",
                        currentRound, totalPlayers, currentPlayers, target, activeRules)
                return target
        }

        // 默认保留3人（决赛）
        log.Printf("🏟️ [getEliminationTarget] 超出轮次范围，默认决赛, round=%d, len(activeRules)=%d",
                currentRound, len(activeRules))
        return 3
}

// 🔧【新增】获取淘汰规则
func (gs *GameSession) getEliminationRules() tournament.EliminationRules {
        // 从房间配置获取
        if gs.room.RoomConfigID > 0 {
                roomConfig, err := database.GetRoomConfigByID(gs.room.RoomConfigID)
                if err == nil && roomConfig != nil && roomConfig.EliminationRules != "" {
                        var rules tournament.EliminationRules
                        if err := json.Unmarshal([]byte(roomConfig.EliminationRules), &rules); err == nil {
                                return rules
                        }
                }
        }
        
        // 默认淘汰规则
        return tournament.EliminationRules{60, 30, 18, 9, 3}
}

// 🔧【新增】执行淘汰
// 返回：被淘汰玩家列表，晋级玩家列表
func (gs *GameSession) executeElimination(periodNo string, rankings []protocol.TournamentRankEntry, target int) ([]protocol.TournamentRankEntry, []protocol.TournamentRankEntry) {
        if len(rankings) <= target {
                // 不需要淘汰
                return nil, rankings
        }

        // 前 target 名晋级
        surviving := rankings[:target]
        // 后面的被淘汰
        eliminated := rankings[target:]

        // 更新数据库中被淘汰玩家的状态
        for _, player := range eliminated {
                playerID, _ := strconv.ParseUint(player.PlayerID, 10, 64)
                
                // 更新 participations 表中的 is_eliminated 状态
                err := database.UpdateParticipationEliminationStatus(periodNo, playerID, true)
                if err != nil {
                        log.Printf("⚠️ [executeElimination] 更新淘汰状态失败: playerID=%d, err=%v", playerID, err)
                } else {
                        log.Printf("🏟️ [executeElimination] 玩家 %d (%s) 已被淘汰，排名第 %d", 
                                playerID, player.PlayerName, player.Rank)
                }
        }

        return eliminated, surviving
}

// 🔧【新增】通知被淘汰的玩家
func (gs *GameSession) notifyEliminatedPlayers(periodNo string, eliminatedPlayers []protocol.TournamentRankEntry) {
        if len(eliminatedPlayers) == 0 {
                return
        }

        // 构建淘汰通知消息
        for _, player := range eliminatedPlayers {
                playerID, _ := strconv.ParseUint(player.PlayerID, 10, 64)
                
                // 跳过机器人
                if player.IsRobot {
                        continue
                }

                // 构建淘汰通知 payload
                payload := &protocol.TournamentEliminationPayload{
                        PeriodNo:     periodNo,
                        PlayerID:     player.PlayerID,
                        PlayerName:   player.PlayerName,
                        FinalRank:    player.Rank,
                        MatchCoin:    player.MatchCoin,
                        TotalPlayers: 0, // 稍后填充
                        Message:      fmt.Sprintf("很遗憾，您在第 %d 名被淘汰", player.Rank),
                }

                // 发送给该玩家
                gs.sendToPlayerByID(playerID, codec.MustNewMessage(protocol.MsgTournamentElimination, payload))
                log.Printf("🏟️ [notifyEliminatedPlayers] 已通知玩家 %d 被淘汰", playerID)
                
                // 🔧【关键修复】将被淘汰的玩家从房间中移除
                // 这确保被淘汰的玩家无法继续在当期游戏中
                gs.mu.Lock()
                playerIDStr := fmt.Sprintf("%d", playerID)
                if rp, exists := gs.room.Players[playerIDStr]; exists && rp != nil && rp.Client != nil {
                        // 发送离开房间消息
                        rp.Client.SendMessage(codec.MustNewMessage(protocol.MsgArenaEliminatedKick, &protocol.ArenaEliminatedKickPayload{
                                PeriodNo: periodNo,
                                PlayerID: playerIDStr,
                                Message:  "您已被淘汰，即将离开房间",
                        }))
                        
                        // 🔧【关键修复】将玩家从房间玩家列表中移除
                        // 这确保被淘汰的玩家无法继续参与后续游戏
                        delete(gs.room.Players, playerIDStr)
                        log.Printf("🏟️ [notifyEliminatedPlayers] 玩家 %d 已从房间移除", playerID)
                        
                        // 同时从游戏会话玩家列表中移除
                        for i, p := range gs.players {
                                if p.ID == playerIDStr {
                                        gs.players = append(gs.players[:i], gs.players[i+1:]...)
                                        log.Printf("🏟️ [notifyEliminatedPlayers] 玩家 %d 已从游戏会话移除", playerID)
                                        break
                                }
                        }
                }
                gs.mu.Unlock()
        }
}

// 🔧【新增】带新玩家列表进入下一轮
// 需要重新分配桌子
func (gs *GameSession) advanceToNextRoundWithNewPlayers(periodNo string, nextRound int, survivingPlayers []protocol.TournamentRankEntry) {
        log.Printf("🏟️ [advanceToNextRoundWithNewPlayers] 进入第 %d 轮, periodNo=%s, 晋级玩家=%d",
                nextRound, periodNo, len(survivingPlayers))

        // 🔧【关键】重新分配桌子
        // 收集晋级玩家ID
        var playerIDs []uint64
        for _, p := range survivingPlayers {
                id, _ := strconv.ParseUint(p.PlayerID, 10, 64)
                playerIDs = append(playerIDs, id)
        }

        // 通知晋级玩家进入下一轮
        gs.broadcastRoundAdvanceToPlayers(periodNo, nextRound, playerIDs)

        // 🔧【核心】重新分配桌子和创建房间
        // 这需要调用 arena_status.go 中的方法
        gs.reassignTablesForNextRound(periodNo, nextRound, playerIDs)
}

// 🔧【新增】开始决赛轮（3人）
func (gs *GameSession) startFinalRound(periodNo string, finalists []protocol.TournamentRankEntry) {
        log.Printf("🏆 [startFinalRound] 开始决赛, periodNo=%s, 决赛选手=%d", periodNo, len(finalists))

        // 收集决赛选手ID
        var playerIDs []uint64
        for _, p := range finalists {
                id, _ := strconv.ParseUint(p.PlayerID, 10, 64)
                playerIDs = append(playerIDs, id)
        }

        // 通知决赛选手
        gs.broadcastFinalRoundStart(periodNo, playerIDs)

        // 重新分配桌子和创建房间
        gs.reassignTablesForNextRound(periodNo, gs.getMaxRoundCount(), playerIDs)
}

// 🔧【新增】广播轮次推进给指定玩家
func (gs *GameSession) broadcastRoundAdvanceToPlayers(periodNo string, nextRound int, playerIDs []uint64) {
        // 广播轮次推进消息
        payload := &protocol.TournamentRoundAdvancePayload{
                PeriodNo:    periodNo,
                NewRound:    nextRound,
                TotalRounds: gs.getMaxRoundCount(),
                Message:     "恭喜晋级！请准备下一轮",
        }

        msg := codec.MustNewMessage(protocol.MsgTournamentRoundAdvance, payload)

        // 发送给晋级的玩家
        for _, playerID := range playerIDs {
                gs.sendToPlayerByID(playerID, msg)
        }

        log.Printf("🏟️ [broadcastRoundAdvanceToPlayers] 已通知 %d 名玩家晋级", len(playerIDs))
}

// 🔧【新增】广播决赛开始
func (gs *GameSession) broadcastFinalRoundStart(periodNo string, playerIDs []uint64) {
        payload := &protocol.TournamentRoundAdvancePayload{
                PeriodNo:    periodNo,
                NewRound:    gs.getMaxRoundCount(),
                TotalRounds: gs.getMaxRoundCount(),
                Message:     "恭喜进入决赛！",
        }

        msg := codec.MustNewMessage(protocol.MsgTournamentRoundAdvance, payload)

        for _, playerID := range playerIDs {
                gs.sendToPlayerByID(playerID, msg)
        }

        log.Printf("🏆 [broadcastFinalRoundStart] 已通知 %d 名选手进入决赛", len(playerIDs))
}

// 🔧【新增】重新分配桌子并创建房间
// 🔧【关键修复】正确处理多桌场景，销毁旧房间并创建新房间
func (gs *GameSession) reassignTablesForNextRound(periodNo string, nextRound int, playerIDs []uint64) {
        log.Printf("🏟️ [reassignTablesForNextRound] 重新分配桌子: periodNo=%s, round=%d, players=%d",
                periodNo, nextRound, len(playerIDs))

        // 如果当前房间只有3人或更少，直接继续使用当前房间
        if len(playerIDs) <= 3 {
                // 当前的桌子继续使用
                gs.advanceToNextRound(periodNo, nextRound)
                return
        }

        // 🔧【核心】多桌场景：需要通过 ArenaStatusBroadcaster 重新分配
        // 获取全局竞技场房间创建器
        roomCreator := types.GetGlobalArenaRoomCreator()
        if roomCreator == nil {
                log.Printf("⚠️ [reassignTablesForNextRound] 房间创建器不可用，使用简单逻辑")
                gs.advanceToNextRound(periodNo, nextRound)
                return
        }

        // 获取房间配置ID
        roomConfigID := gs.room.RoomConfigID

        // 🔧【关键】调用 ArenaStatusBroadcaster 为晋级玩家创建新房间
        // 这会处理：
        // 1. 随机分配玩家到新桌子
        // 2. 补充机器人（如果需要）
        // 3. 创建新房间并开始游戏
        log.Printf("🏟️ [reassignTablesForNextRound] 调用 ArenaStatusBroadcaster 为 %d 名玩家创建新房间", len(playerIDs))
        roomCreator.CreateRoomsForNextRound(periodNo, roomConfigID, playerIDs, nextRound)

        // 🔧【关键】销毁当前房间（不再需要）
        // 当前房间的玩家已被移动到新房间
        log.Printf("🏟️ [reassignTablesForNextRound] 当前房间 %s 将被销毁", gs.room.Code)
        if gs.onGameEnd != nil {
                gs.scheduleRoomDestruction()
        }
}

// 🔧【新增】发送消息给指定玩家ID
// 通过房间广播，只有目标玩家会处理该消息
func (gs *GameSession) sendToPlayerByID(playerID uint64, msg *protocol.Message) {
        // 遍历房间玩家找到目标玩家
        for _, p := range gs.players {
                if p.DBID == playerID {
                        rp := gs.room.Players[p.ID]
                        if rp != nil && rp.Client != nil {
                                rp.Client.SendMessage(msg)
                        }
                        return
                }
        }
}

// advanceToNextRound 推进到下一轮
func (gs *GameSession) advanceToNextRound(periodNo string, nextRound int) {
        log.Printf("🏟️ [advanceToNextRound] 进入第 %d 轮, periodNo=%s", nextRound, periodNo)

        // 🔧【关键修复】更新 TournamentProgressManager 的轮次状态
        // 确保后续桌完成检查能正确工作
        tm := types.GetGlobalTournamentProgress()
        if tm != nil {
                // 收集当前房间的玩家ID
                playerIDs := make([]string, 0)
                for _, p := range gs.players {
                        playerIDs = append(playerIDs, p.ID)
                }

                // 计算新一轮的总桌数（当前房间只有1桌）
                newTotalTables := 1

                // 调用 AdvanceRound 更新进度管理器
                if tm.AdvanceRound(periodNo, newTotalTables, playerIDs) {
                        log.Printf("🏟️ [advanceToNextRound] ✅ TournamentProgressManager 已更新: round=%d, tables=%d",
                                nextRound, newTotalTables)
                } else {
                        log.Printf("⚠️ [advanceToNextRound] TournamentProgressManager 更新失败")
                }
        }

        // 广播轮次推进消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgTournamentRoundAdvance, &protocol.TournamentRoundAdvancePayload{
                PeriodNo:    periodNo,
                NewRound:    nextRound,
                TotalRounds: gs.getMaxRoundCount(),
                Message:     "进入下一轮，请准备",
        }))

        // 广播自动准备消息
        gs.room.Broadcast(codec.MustNewMessage(protocol.MsgArenaAutoReady, &protocol.ArenaAutoReadyPayload{
                PeriodNo: periodNo,
                RoomID:   gs.room.RoomConfigID,
                Message:  "系统已自动准备",
        }))

        // 为所有玩家设置准备状态
        gs.mu.Lock()
        for playerID, rp := range gs.room.Players {
                if rp != nil {
                        rp.Ready = true
                        log.Printf("🏟️ [advanceToNextRound] 玩家 %s 已自动准备", playerID)
                }
        }

        // 确保房间状态为 Waiting
        gs.room.State = RoomStateWaiting
        
        // 🔧【关键修复】重置 GameCount，确保新一轮从头计算局数
        // 每轮淘汰赛都需要重新打配置的局数（如5局）
        gs.room.GameCount = 0
        log.Printf("🏟️ [advanceToNextRound] GameCount 已重置为 0，新一轮将从第 1 局开始")
        
        gs.mu.Unlock()

        // 重置游戏会话状态
        gs.resetForNewRound()

        // 开始新一轮
        gs.Start()

        log.Printf("✅ [advanceToNextRound] 房间 %s 第 %d 轮淘汰赛游戏已开始", gs.room.Code, nextRound)
}
