package session

import (
        "log"

        "github.com/palemoky/fight-the-landlord/internal/game/card"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
        "github.com/palemoky/fight-the-landlord/internal/protocol/convert"
)

// BuildGameStateDTO 构建游戏状态 DTO（用于重连等场景）
func (gs *GameSession) BuildGameStateDTO(playerID string, sessionManager *SessionManager) *protocol.GameStateDTO {
        gs.mu.RLock()
        defer gs.mu.RUnlock()
        
        // 🔧【调试日志】打印玩家手牌信息
        log.Printf("🔄 [BuildGameStateDTO] 构建游戏状态DTO for playerID=%s", playerID)
        
        var hand []card.Card
        for _, p := range gs.players {
                log.Printf("🔄 [BuildGameStateDTO] 玩家 %s (ID=%s): 手牌数=%d, 地主=%v, 状态=%v", 
                        p.Name, p.ID, len(p.Hand), p.IsLandlord, p.State)
                if p.ID == playerID {
                        hand = p.Hand
                        log.Printf("🔄 [BuildGameStateDTO] 找到目标玩家 %s，手牌数=%d", playerID, len(hand))
                }
        }
        
        players := make([]protocol.PlayerInfo, len(gs.players))
        for i, p := range gs.players {
                // 获取玩家状态
                playerState := "online"
                switch p.State {
                case PlayerStateOnline:
                        playerState = "online"
                case PlayerStateOffline:
                        playerState = "offline"
                case PlayerStateRobot:
                        playerState = "robot"
                }
                
                players[i] = protocol.PlayerInfo{
                        ID:         p.ID,
                        Name:       p.Name,
                        Seat:       p.Seat,
                        IsLandlord: p.IsLandlord,
                        CardsCount: len(p.Hand),
                        Online:     p.State == PlayerStateOnline,
                        State:      playerState,
                }
        }
        phase := "waiting"
        switch gs.state {
        case GameStateCallLandlord:
                phase = "bidding"
        case GameStatePlaying:
                phase = "playing"
        case GameStateEnded:
                phase = "ended"
        }
        currentTurnID := ""
        switch gs.state {
        case GameStateCallLandlord:
                currentTurnID = gs.currentCallerID
        case GameStatePlaying:
                currentTurnID = gs.players[gs.currentPlayer].ID
        }
        var lastPlayed []card.Card
        lastPlayerID := ""
        if !gs.lastPlayedHand.IsEmpty() {
                lastPlayed = gs.lastPlayedHand.Cards
                lastPlayerID = gs.players[gs.lastPlayerIdx].ID
        }
        
        dto := &protocol.GameStateDTO{
                Phase:        phase,
                Players:      players,
                Hand:         convert.CardsToInfos(hand),
                BottomCards:  convert.CardsToInfos(gs.bottomCards),
                CurrentTurn:  currentTurnID,
                LastPlayed:   convert.CardsToInfos(lastPlayed),
                LastPlayerID: lastPlayerID,
                MustPlay:     gs.lastPlayerIdx == gs.currentPlayer || gs.lastPlayedHand.IsEmpty(),
                CanBeat:      true,
        }
        
        // 🔧【调试日志】打印DTO内容
        log.Printf("🔄 [BuildGameStateDTO] 返回DTO: phase=%s, hand_count=%d, current_turn=%s, must_play=%v", 
                phase, len(dto.Hand), currentTurnID, dto.MustPlay)
        
        return dto
}

// SerializeForRedis 为Redis序列化准备数据（提供只读访问）
func (gs *GameSession) SerializeForRedis(serialize func()) {
        gs.mu.RLock()
        defer gs.mu.RUnlock()
        serialize()
}

// GetStateForSerialization 获取state用于序列化
func (gs *GameSession) GetStateForSerialization() GameState {
        return gs.state
}

// GetCurrentPlayerForSerialization 获取currentPlayer用于序列化
func (gs *GameSession) GetCurrentPlayerForSerialization() int {
        return gs.currentPlayer
}

// GetHighestBidderForSerialization 获取最高叫价者用于序列化
func (gs *GameSession) GetHighestBidderForSerialization() int {
        if gs.lastCallerIdx >= 0 && gs.lastCallerIdx < len(gs.players) {
                return gs.lastCallerIdx
        }
        return -1
}

// GetPlayersForSerialization 获取players用于序列化
func (gs *GameSession) GetPlayersForSerialization() []*GamePlayer {
        return gs.players
}

// GetBottomCardsForSerialization 获取bottomCards用于序列化
func (gs *GameSession) GetBottomCardsForSerialization() []card.Card {
        return gs.bottomCards
}
