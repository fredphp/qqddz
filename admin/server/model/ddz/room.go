package ddz

import "time"

// DDZRoomPlayer 房间玩家表
type DDZRoomPlayer struct {
        ID         uint64     `gorm:"primaryKey;autoIncrement;comment:主键ID" json:"id"`
        RoomCode   string     `gorm:"type:varchar(10);not null;index;comment:房间号" json:"roomCode"`
        PlayerID   uint64     `gorm:"not null;index;comment:玩家ID" json:"playerId"`
        SeatIndex  uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:座位号:0-2" json:"seatIndex"`
        IsCreator  uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:是否房主:0-否,1-是" json:"isCreator"`
        IsReady    uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:是否准备:0-否,1-是" json:"isReady"`
        IsOffline  uint8      `gorm:"type:tinyint unsigned;not null;default:0;comment:是否离线:0-在线,1-离线" json:"isOffline"`
        JoinedAt   time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:加入时间" json:"joinedAt"`
        LeftAt     *time.Time `gorm:"type:datetime;comment:离开时间" json:"leftAt"`
        CreatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
        UpdatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
}

func (DDZRoomPlayer) TableName() string {
        return "ddz_room_players"
}
