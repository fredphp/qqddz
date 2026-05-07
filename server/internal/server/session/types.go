package session

import (
        "github.com/palemoky/fight-the-landlord/internal/game/room"
)

// Type aliases for backward compatibility
type (
        RoomState   = room.RoomState
        PlayerState = room.PlayerState
)

// Re-export room state constants
const (
        RoomStateWaiting  = room.RoomStateWaiting
        RoomStateReady    = room.RoomStateReady
        RoomStateBidding  = room.RoomStateBidding
        RoomStatePlaying  = room.RoomStatePlaying
        RoomStateFinished = room.RoomStateFinished
        RoomStateEnded    = room.RoomStateEnded
)

// Re-export player state constants
const (
        PlayerStateOnline  = room.PlayerStateOnline
        PlayerStateOffline = room.PlayerStateOffline
        PlayerStateRobot   = room.PlayerStateRobot
)
