package ddz

import (
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZArenaRegistration 竞技场报名记录
type DDZArenaRegistration struct {
        global.GVA_MODEL
        PlayerID       uint64     `json:"playerId" gorm:"uniqueIndex;comment:玩家ID"`
        ArenaLevel     int        `json:"arenaLevel" gorm:"type:tinyint;not null;comment:竞技场等级:1-初级场,2-中级场,3-高级场"`
        ArenaCoinCost  int64      `json:"arenaCoinCost" gorm:"type:bigint;not null;comment:消耗的竞技币"`
        Status         int        `json:"status" gorm:"type:tinyint;not null;default:1;index;comment:状态:1-已报名,2-已取消,3-已参赛"`
        RegisteredAt   time.Time  `json:"registeredAt" gorm:"type:datetime;not null;comment:报名时间"`
        CancelledAt    *time.Time `json:"cancelledAt" gorm:"type:datetime;comment:取消时间"`
        OperateIP      string     `json:"operateIp" gorm:"type:varchar(64);comment:操作IP"`
}

func (DDZArenaRegistration) TableName() string {
        return "ddz_arena_registrations"
}

// 报名状态常量
const (
        ArenaRegistrationStatusRegistered = 1 // 已报名
        ArenaRegistrationStatusCancelled  = 2 // 已取消
        ArenaRegistrationStatusPlayed     = 3 // 已参赛
)

// 操作冷却时间（秒）
const ArenaOperateCooldownSeconds = 3
