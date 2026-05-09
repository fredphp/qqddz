package ddz

import "time"

// DDZArenaGoldLog 竞技场金币流水日志模型
type DDZArenaGoldLog struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement;comment:日志ID" json:"id"`
	PeriodNo    string    `gorm:"type:varchar(64);index;comment:期号" json:"periodNo"`
	RoomID      uint64    `gorm:"index;comment:房间ID" json:"roomId"`
	PlayerID    uint64    `gorm:"not null;index;comment:玩家ID" json:"playerId"`
	MatchID     string    `gorm:"type:varchar(64);comment:比赛ID" json:"matchId"`
	BeforeGold  int64     `gorm:"not null;comment:变化前金币" json:"beforeGold"`
	ChangeGold  int64     `gorm:"not null;comment:变化金币(正数为获得,负数为消耗)" json:"changeGold"`
	AfterGold   int64     `gorm:"not null;comment:变化后金币" json:"afterGold"`
	Reason      string    `gorm:"type:varchar(256);comment:原因" json:"reason"`
	CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
}

func (DDZArenaGoldLog) TableName() string {
	return "ddz_arena_gold_logs"
}

// 竞技场金币变化原因常量
const (
	ArenaGoldReasonSignup     = "signup"      // 报名
	ArenaGoldReasonReward     = "reward"      // 奖励
	ArenaGoldReasonRefund     = "refund"      // 退款
	ArenaGoldReasonGameWin    = "game_win"    // 游戏获胜
	ArenaGoldReasonGameLose   = "game_lose"   // 游戏失败
	ArenaGoldReasonEliminated = "eliminated"  // 被淘汰
)
