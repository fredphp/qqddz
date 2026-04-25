package ddz

import (
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "gorm.io/gorm"
)

// DDZPlayer 斗地主玩家模型 - 与游戏服务器数据库表结构一致
type DDZPlayer struct {
        ID            uint64         `gorm:"primaryKey;autoIncrement;comment:玩家ID" json:"id"`
        Username      string         `gorm:"type:varchar(64);uniqueIndex;comment:用户名" json:"username"`
        Nickname      string         `gorm:"type:varchar(64);uniqueIndex;not null;comment:昵称" json:"nickname"`
        Avatar        string         `gorm:"type:varchar(256);default:'';comment:头像URL" json:"avatar"`
        Gender        uint8          `gorm:"type:tinyint unsigned;default:0;comment:性别:0-未知,1-男,2-女" json:"gender"`
        Gold          int64          `gorm:"type:bigint;not null;default:0;comment:金币余额" json:"gold"`
        Diamond       int            `gorm:"type:int;not null;default:0;comment:钻石余额" json:"diamond"`
        Experience    int            `gorm:"type:int;not null;default:0;comment:经验值" json:"experience"`
        Level         int            `gorm:"type:int;not null;default:1;comment:等级" json:"level"`
        VIPLevel      int            `gorm:"column:vip_level;type:int;not null;default:0;comment:VIP等级" json:"vipLevel"`
        WinCount      int            `gorm:"type:int;not null;default:0;comment:胜场数" json:"winCount"`
        LoseCount     int            `gorm:"type:int;not null;default:0;comment:负场数" json:"loseCount"`
        LandlordCount int            `gorm:"type:int;not null;default:0;comment:当地主次数" json:"landlordCount"`
        FarmerCount   int            `gorm:"type:int;not null;default:0;comment:当农民次数" json:"farmerCount"`
        Status        uint8          `gorm:"type:tinyint;not null;default:1;index;comment:状态:0-禁用,1-正常,2-封禁" json:"status"`
        LastLoginAt   *time.Time     `gorm:"type:datetime;comment:最后登录时间" json:"lastLoginAt"`
        LastLoginIP   string         `gorm:"type:varchar(64);default:'';comment:最后登录IP" json:"lastLoginIp"`
        CreatedAt     time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:创建时间" json:"createdAt"`
        UpdatedAt     time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;comment:更新时间" json:"updatedAt"`
        DeletedAt     gorm.DeletedAt `gorm:"type:datetime;index;comment:删除时间" json:"-"`
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
