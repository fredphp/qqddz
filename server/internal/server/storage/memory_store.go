package storage

import (
        "context"
        "encoding/json"
        "errors"
        "sync"
        "time"
)

type MemoryStore struct {
        mu             sync.RWMutex
        rooms          map[string]*RoomData
        sessions       map[string]*PlayerSessionData
        matchQueue     []string
        availableRooms []RoomListItemData
        roomExpirations map[string]time.Time
}

func NewMemoryStore() *MemoryStore {
        return &MemoryStore{
                rooms:          make(map[string]*RoomData),
                sessions:       make(map[string]*PlayerSessionData),
                matchQueue:     make([]string, 0),
                availableRooms: make([]RoomListItemData, 0),
                roomExpirations: make(map[string]time.Time),
        }
}

func (ms *MemoryStore) IsReady() bool { return ms != nil }

func (ms *MemoryStore) SaveRoom(ctx context.Context, roomCode string, data *RoomData) error {
        if data == nil { return nil }
        ms.mu.Lock()
        defer ms.mu.Unlock()
        dataCopy := *data
        ms.rooms[roomCode] = &dataCopy
        ms.roomExpirations[roomCode] = time.Now().Add(roomExpiration)
        return nil
}

func (ms *MemoryStore) LoadRoom(ctx context.Context, code string) (*RoomData, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        data, exists := ms.rooms[code]
        if !exists { return nil, nil }
        if exp, hasExp := ms.roomExpirations[code]; hasExp && time.Now().After(exp) { return nil, nil }
        dataCopy := *data
        return &dataCopy, nil
}

func (ms *MemoryStore) DeleteRoom(ctx context.Context, code string) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        delete(ms.rooms, code)
        delete(ms.roomExpirations, code)
        var newAvailable []RoomListItemData
        for _, item := range ms.availableRooms {
                if item.RoomCode != code { newAvailable = append(newAvailable, item) }
        }
        ms.availableRooms = newAvailable
        return nil
}

func (ms *MemoryStore) GetAllRoomCodes(ctx context.Context) ([]string, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        codes := make([]string, 0, len(ms.rooms))
        for code := range ms.rooms { codes = append(codes, code) }
        return codes, nil
}

func (ms *MemoryStore) AddToMatchQueue(ctx context.Context, playerID string) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        ms.matchQueue = append(ms.matchQueue, playerID)
        return nil
}

func (ms *MemoryStore) RemoveFromMatchQueue(ctx context.Context, playerID string) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        var newQueue []string
        for _, id := range ms.matchQueue {
                if id != playerID { newQueue = append(newQueue, id) }
        }
        ms.matchQueue = newQueue
        return nil
}

func (ms *MemoryStore) GetMatchQueueLength(ctx context.Context) (int64, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        return int64(len(ms.matchQueue)), nil
}

func (ms *MemoryStore) PopFromMatchQueue(ctx context.Context, count int) ([]string, error) {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        if len(ms.matchQueue) == 0 { return nil, nil }
        actualCount := count
        if actualCount > len(ms.matchQueue) { actualCount = len(ms.matchQueue) }
        players := ms.matchQueue[:actualCount]
        ms.matchQueue = ms.matchQueue[actualCount:]
        return players, nil
}

func (ms *MemoryStore) SaveSession(ctx context.Context, session *PlayerSessionData) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        sessionCopy := *session
        ms.sessions[session.PlayerID] = &sessionCopy
        return nil
}

func (ms *MemoryStore) LoadSession(ctx context.Context, playerID string) (*PlayerSessionData, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        session, exists := ms.sessions[playerID]
        if !exists { return nil, nil }
        sessionCopy := *session
        return &sessionCopy, nil
}

func (ms *MemoryStore) DeleteSession(ctx context.Context, playerID string) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        delete(ms.sessions, playerID)
        return nil
}

func (ms *MemoryStore) SetRoomExpiration(ctx context.Context, code string, expiration time.Duration) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        ms.roomExpirations[code] = time.Now().Add(expiration)
        return nil
}

func (ms *MemoryStore) AddToAvailableRooms(ctx context.Context, item *RoomListItemData) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        ms.availableRooms = append(ms.availableRooms, *item)
        return nil
}

func (ms *MemoryStore) RemoveFromAvailableRooms(ctx context.Context, roomCode string) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        var newAvailable []RoomListItemData
        for _, item := range ms.availableRooms {
                if item.RoomCode != roomCode { newAvailable = append(newAvailable, item) }
        }
        ms.availableRooms = newAvailable
        return nil
}

func (ms *MemoryStore) UpdateAvailableRoom(ctx context.Context, item *RoomListItemData) error {
        if err := ms.RemoveFromAvailableRooms(ctx, item.RoomCode); err != nil { return err }
        if item.PlayerCount < item.MaxPlayers { return ms.AddToAvailableRooms(ctx, item) }
        return nil
}

func (ms *MemoryStore) GetAvailableRooms(ctx context.Context) ([]RoomListItemData, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        var rooms []RoomListItemData
        for _, item := range ms.availableRooms {
                if item.PlayerCount < item.MaxPlayers { rooms = append(rooms, item) }
        }
        return rooms, nil
}

func (ms *MemoryStore) ClearAvailableRooms(ctx context.Context) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        ms.availableRooms = make([]RoomListItemData, 0)
        return nil
}

func (ms *MemoryStore) MarshalJSON() ([]byte, error) {
        ms.mu.RLock()
        defer ms.mu.RUnlock()
        return json.Marshal(map[string]interface{}{"rooms": ms.rooms, "sessions": ms.sessions, "matchQueue": ms.matchQueue})
}

func (ms *MemoryStore) UnmarshalJSON(data []byte) error {
        ms.mu.Lock()
        defer ms.mu.Unlock()
        var raw map[string]json.RawMessage
        if err := json.Unmarshal(data, &raw); err != nil { return err }
        if rooms, ok := raw["rooms"]; ok { json.Unmarshal(rooms, &ms.rooms) }
        if sessions, ok := raw["sessions"]; ok { json.Unmarshal(sessions, &ms.sessions) }
        if matchQueue, ok := raw["matchQueue"]; ok { json.Unmarshal(matchQueue, &ms.matchQueue) }
        return nil
}

type Storage interface {
        IsReady() bool
        SaveRoom(ctx context.Context, roomCode string, data *RoomData) error
        LoadRoom(ctx context.Context, code string) (*RoomData, error)
        DeleteRoom(ctx context.Context, code string) error
        GetAllRoomCodes(ctx context.Context) ([]string, error)
        AddToMatchQueue(ctx context.Context, playerID string) error
        RemoveFromMatchQueue(ctx context.Context, playerID string) error
        GetMatchQueueLength(ctx context.Context) (int64, error)
        PopFromMatchQueue(ctx context.Context, count int) ([]string, error)
        SaveSession(ctx context.Context, session *PlayerSessionData) error
        LoadSession(ctx context.Context, playerID string) (*PlayerSessionData, error)
        DeleteSession(ctx context.Context, playerID string) error
        SetRoomExpiration(ctx context.Context, code string, expiration time.Duration) error
        AddToAvailableRooms(ctx context.Context, item *RoomListItemData) error
        RemoveFromAvailableRooms(ctx context.Context, roomCode string) error
        UpdateAvailableRoom(ctx context.Context, item *RoomListItemData) error
        GetAvailableRooms(ctx context.Context) ([]RoomListItemData, error)
        ClearAvailableRooms(ctx context.Context) error
}

var _ Storage = (*MemoryStore)(nil)
var _ Storage = (*RedisStore)(nil)
var ErrNotFound = errors.New("not found")
