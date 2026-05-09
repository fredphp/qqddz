package ddz

import "time"

// DDZRoomPlayer 房间玩家表
type DDZRoomPlayer struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	RoomID     uint64    `gorm:"not null;index;comment:房间ID" json:"roomId"`
	PlayerID   uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	SeatIndex  int       `gorm:"not null;default:0;comment:座位号" json:"seatIndex"`
	IsReady    uint8     `gorm:"type:tinyint unsigned;not null;default:0;comment:是否准备:0-否,1-是" json:"isReady"`
	IsOnline   uint8     `gorm:"type:tinyint unsigned;not null;default:1;comment:是否在线:0-否,1-是" json:"isOnline"`
	JoinedAt   time.Time `gorm:"type:datetime;comment:加入时间" json:"joinedAt"`
	CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZRoomPlayer) TableName() string {
	return "ddz_room_players"
}
