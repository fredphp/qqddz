package ddz

import "time"

// DDZArenaSession 比赛会话表模型
type DDZArenaSession struct {
	ID                 uint64     `gorm:"primaryKey;autoIncrement;comment:会话ID" json:"id"`
	SessionCode        string     `gorm:"type:varchar(32);uniqueIndex;not null;comment:会话编码" json:"session_code"`
	PeriodNo           string     `gorm:"type:varchar(20);index;comment:期号(格式J202605060001)" json:"period_no"`
	RoomConfigID       uint64     `gorm:"type:bigint unsigned;not null;index;comment:关联房间配置ID" json:"room_config_id"`
	MatchConfigID      uint64     `gorm:"type:bigint unsigned;not null;index;comment:关联比赛配置ID" json:"match_config_id"`
	ScheduledStartTime time.Time  `gorm:"type:datetime;not null;comment:计划开始时间" json:"scheduled_start_time"`
	ActualStartTime    *time.Time `gorm:"type:datetime;comment:实际开始时间" json:"actual_start_time"`
	EndTime            *time.Time `gorm:"type:datetime;comment:结束时间" json:"end_time"`
	SignupDeadline     *time.Time `gorm:"type:datetime;comment:报名截止时间" json:"signup_deadline"`
	Status             uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
	CurrentRound       int        `gorm:"type:int;not null;default:0;comment:当前轮次" json:"current_round"`
	TotalRounds        int        `gorm:"type:int;not null;default:3;comment:总轮次" json:"total_rounds"`
	EliminationRules   string     `gorm:"type:varchar(255);default:'[60,30,18,9,3]';comment:淘汰规则JSON数组" json:"elimination_rules"`
	CurrentEliminationIdx int     `gorm:"type:int;not null;default:0;comment:当前淘汰规则索引" json:"current_elimination_idx"`
	TournamentStage    string     `gorm:"type:varchar(32);default:'SIGNUP';comment:赛事阶段" json:"tournament_stage"`
	RankWaitUntil      *time.Time `gorm:"type:datetime;comment:排行榜阶段等待截止时间" json:"rank_wait_until"`
	TablesCompleted    int        `gorm:"type:int;not null;default:0;comment:本轮已完成的桌数" json:"tables_completed"`
	TotalPlayers       int        `gorm:"type:int;not null;default:0;comment:参赛人数" json:"total_players"`
	ActivePlayers      int        `gorm:"type:int;not null;default:0;comment:剩余人数" json:"active_players"`
	SignupFee          int64      `gorm:"type:bigint;not null;default:0;comment:报名费(竞技币)" json:"signup_fee"`
	ChampionID         *uint64    `gorm:"type:bigint unsigned;comment:冠军玩家ID" json:"champion_id"`
	RunnerUpID         *uint64    `gorm:"type:bigint unsigned;comment:亚军玩家ID" json:"runner_up_id"`
	ThirdID            *uint64    `gorm:"type:bigint unsigned;comment:季军玩家ID" json:"third_id"`
	CreatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
}

// TableName 指定比赛会话表名
func (DDZArenaSession) TableName() string {
	return "ddz_arena_sessions"
}

// DDZArenaTable 比赛桌表模型
type DDZArenaTable struct {
	ID         uint64     `gorm:"primaryKey;autoIncrement;comment:桌ID" json:"id"`
	TableCode  string     `gorm:"type:varchar(32);uniqueIndex;not null;comment:桌编码" json:"table_code"`
	SessionID  uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛会话ID" json:"session_id"`
	RoundNum   int        `gorm:"type:int;not null;default:1;index;comment:轮次" json:"round_num"`
	Player1ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家1 ID" json:"player1_id"`
	Player2ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家2 ID" json:"player2_id"`
	Player3ID  *uint64    `gorm:"type:bigint unsigned;comment:玩家3 ID" json:"player3_id"`
	Status     uint8      `gorm:"type:tinyint unsigned;not null;default:0;index;comment:状态" json:"status"`
	GameID     *string    `gorm:"type:varchar(64);comment:当前游戏ID" json:"game_id"`
	CreatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updated_at"`
}

// TableName 指定比赛桌表名
func (DDZArenaTable) TableName() string {
	return "ddz_arena_tables"
}

// DDZArenaRoundRecord 比赛轮次记录表模型
type DDZArenaRoundRecord struct {
	ID                 uint64     `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	SessionID          uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛会话ID" json:"session_id"`
	TableID            uint64     `gorm:"type:bigint unsigned;not null;index;comment:比赛桌ID" json:"table_id"`
	GameID             string     `gorm:"type:varchar(64);not null;index;comment:游戏ID" json:"game_id"`
	RoundNum           int        `gorm:"type:int;not null;index;comment:轮次" json:"round_num"`
	LandlordID         uint64     `gorm:"type:bigint unsigned;not null;comment:地主玩家ID" json:"landlord_id"`
	Farmer1ID          uint64     `gorm:"type:bigint unsigned;not null;comment:农民1玩家ID" json:"farmer1_id"`
	Farmer2ID          uint64     `gorm:"type:bigint unsigned;not null;comment:农民2玩家ID" json:"farmer2_id"`
	LandlordWin        uint8      `gorm:"type:tinyint unsigned;not null;comment:地主是否获胜" json:"landlord_win"`
	LandlordCoinChange int64      `gorm:"type:bigint;not null;default:0;comment:地主比赛金币变化" json:"landlord_coin_change"`
	Farmer1CoinChange  int64      `gorm:"type:bigint;not null;default:0;comment:农民1比赛金币变化" json:"farmer1_coin_change"`
	Farmer2CoinChange  int64      `gorm:"type:bigint;not null;default:0;comment:农民2比赛金币变化" json:"farmer2_coin_change"`
	Multiplier         int        `gorm:"type:int;not null;default:1;comment:倍数" json:"multiplier"`
	StartedAt          time.Time  `gorm:"type:datetime;not null;comment:开始时间" json:"started_at"`
	EndedAt            *time.Time `gorm:"type:datetime;comment:结束时间" json:"ended_at"`
	CreatedAt          time.Time  `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"created_at"`
}

// TableName 指定比赛轮次记录表名
func (DDZArenaRoundRecord) TableName() string {
	return "ddz_arena_round_records"
}

// DDZArenaSignupLog 报名日志表模型
type DDZArenaSignupLog struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement;comment:记录ID" json:"id"`
	PlayerID  uint64    `gorm:"type:bigint unsigned;not null;index;comment:玩家ID" json:"player_id"`
	PeriodNo  string    `gorm:"type:varchar(20);index;comment:期号" json:"period_no"`
	SessionID uint64    `gorm:"type:bigint unsigned;not null;index;comment:会话ID" json:"session_id"`
	Action    uint8     `gorm:"type:tinyint unsigned;not null;comment:操作类型:1-报名,2-取消报名" json:"action"`
	CreatedAt time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index;comment:创建时间" json:"created_at"`
}

// TableName 指定报名日志表名
func (DDZArenaSignupLog) TableName() string {
	return "ddz_arena_signup_logs"
}
