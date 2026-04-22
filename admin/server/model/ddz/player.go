package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZPlayer 斗地主玩家模型
type DDZPlayer struct {
	global.GVA_MODEL
	PlayerID    string `json:"playerId" gorm:"uniqueIndex;comment:玩家ID"`
	Nickname    string `json:"nickname" gorm:"comment:昵称"`
	Avatar      string `json:"avatar" gorm:"comment:头像URL"`
	Gender      int    `json:"gender" gorm:"default:0;comment:性别 0未知 1男 2女"`
	Coins       int64  `json:"coins" gorm:"default:0;comment:金币"`
	Diamonds    int64  `json:"diamonds" gorm:"default:0;comment:钻石"`
	WinCount    int    `json:"winCount" gorm:"default:0;comment:胜场"`
	LoseCount   int    `json:"loseCount" gorm:"default:0;comment:败场"`
	DrawCount   int    `json:"drawCount" gorm:"default:0;comment:平局场"`
	TotalGames  int    `json:"totalGames" gorm:"default:0;comment:总场次"`
	MaxWinStreak int   `json:"maxWinStreak" gorm:"default:0;comment:最大连胜"`
	WinStreak   int    `json:"winStreak" gorm:"default:0;comment:当前连胜"`
	Level       int    `json:"level" gorm:"default:1;comment:等级"`
	Experience  int    `json:"experience" gorm:"default:0;comment:经验值"`
	VipLevel    int    `json:"vipLevel" gorm:"default:0;comment:VIP等级"`
	Status      int    `json:"status" gorm:"default:1;comment:状态 1正常 2封禁"`
	BanReason   string `json:"banReason" gorm:"comment:封禁原因"`
	BanTime     *string `json:"banTime" gorm:"comment:封禁时间"`
	UnbanTime   *string `json:"unbanTime" gorm:"comment:解封时间"`
	LastLoginIP string `json:"lastLoginIp" gorm:"comment:最后登录IP"`
	LastLoginAt *string `json:"lastLoginAt" gorm:"comment:最后登录时间"`
	RegisterIP  string `json:"registerIp" gorm:"comment:注册IP"`
	DeviceID    string `json:"deviceId" gorm:"comment:设备ID"`
}

func (DDZPlayer) TableName() string {
	return "ddz_players"
}

// DDZPlayerOnline 在线玩家记录
type DDZPlayerOnline struct {
	global.GVA_MODEL
	PlayerID   string `json:"playerId" gorm:"index;comment:玩家ID"`
	LoginIP    string `json:"loginIp" gorm:"comment:登录IP"`
	DeviceID   string `json:"deviceId" gorm:"comment:设备ID"`
	ServerID   string `json:"serverId" gorm:"comment:服务器ID"`
	LoginTime  string `json:"loginTime" gorm:"comment:登录时间"`
	LogoutTime string `json:"logoutTime" gorm:"comment:登出时间"`
	OnlineTime int64  `json:"onlineTime" gorm:"comment:在线时长(秒)"`
}

func (DDZPlayerOnline) TableName() string {
	return "ddz_player_online"
}
