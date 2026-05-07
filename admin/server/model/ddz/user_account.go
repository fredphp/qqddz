package ddz

import (
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DDZUserAccount 用户账户模型 - 用于登录认证
type DDZUserAccount struct {
        global.GVA_MODEL
        PlayerID             uint       `json:"playerId" gorm:"index;comment:关联玩家ID"`
        Phone                string     `json:"phone" gorm:"index;comment:手机号"`
        Password             string     `json:"-" gorm:"comment:密码(加密存储)"`
        WxOpenID             string     `json:"wxOpenId" gorm:"index;comment:微信OpenID"`
        WxUnionID            string     `json:"wxUnionId" gorm:"index;comment:微信UnionID"`
        WxSessionKey         string     `json:"-" gorm:"comment:微信会话密钥"`
        WxNickname           string     `json:"wxNickname" gorm:"comment:微信昵称"`
        WxAvatar             string     `json:"wxAvatar" gorm:"comment:微信头像URL"`
        LoginType            int        `json:"loginType" gorm:"default:1;comment:登录类型 1手机号 2微信 3游客"`
        Token                string     `json:"-" gorm:"index;comment:登录Token"`
        TokenExpireAt        *time.Time `json:"tokenExpireAt" gorm:"type:datetime;comment:Token过期时间"`
        RefreshToken         string     `json:"-" gorm:"comment:刷新Token"`
        RefreshTokenExpireAt *time.Time `json:"refreshTokenExpireAt" gorm:"type:datetime;comment:刷新Token过期时间"`
        DeviceID             string     `json:"deviceId" gorm:"comment:设备ID"`
        DeviceType           string     `json:"deviceType" gorm:"comment:设备类型 ios/android/web"`
        LastLoginAt          *time.Time `json:"lastLoginAt" gorm:"type:datetime;comment:最后登录时间"`
        LastLoginIP          string     `json:"lastLoginIp" gorm:"comment:最后登录IP"`
        LoginCount           int        `json:"loginCount" gorm:"default:0;comment:登录次数"`
        Status               int        `json:"status" gorm:"default:1;comment:状态 0禁用 1正常 2封禁"`
}

func (DDZUserAccount) TableName() string {
        return "ddz_user_accounts"
}

// DDZLoginLog 登录日志
type DDZLoginLog struct {
        ID          uint      `gorm:"primaryKey;autoIncrement;column:id" json:"ID"`
        PlayerID    uint      `json:"playerId" gorm:"index;column:player_id;comment:玩家ID"`
        AccountID   uint      `json:"accountId" gorm:"index;column:account_id;comment:账户ID"`
        LoginType   int       `json:"loginType" gorm:"column:login_type;comment:登录类型 1手机号 2微信 3游客"`
        LoginResult int       `json:"loginResult" gorm:"column:login_result;comment:登录结果 0失败 1成功"`
        FailReason  string    `json:"failReason" gorm:"column:fail_reason;comment:失败原因"`
        IP          string    `json:"ip" gorm:"column:ip;comment:登录IP"`
        DeviceID    string    `json:"deviceId" gorm:"column:device_id;comment:设备ID"`
        DeviceType  string    `json:"deviceType" gorm:"column:device_type;comment:设备类型"`
        UserAgent   string    `json:"userAgent" gorm:"column:user_agent;comment:User-Agent"`
        Location    string    `json:"location" gorm:"column:location;comment:登录地点"`
        CreatedAt   time.Time `json:"createdAt" gorm:"column:created_at;comment:创建时间"`
}

func (DDZLoginLog) TableName() string {
        return "ddz_login_logs"
}

// DDZSmsCode 短信验证码记录
type DDZSmsCode struct {
        global.GVA_MODEL
        Phone    string     `json:"phone" gorm:"index;comment:手机号"`
        Code     string     `json:"code" gorm:"comment:验证码"`
        Type     int        `json:"type" gorm:"default:1;comment:类型 1登录 2注册 3绑定手机 4修改密码"`
        IsUsed   int        `json:"isUsed" gorm:"default:0;comment:是否已使用 0否 1是"`
        ExpireAt time.Time  `json:"expireAt" gorm:"type:datetime;comment:过期时间"`
        UsedAt   *time.Time `json:"usedAt" gorm:"type:datetime;comment:使用时间"`
        IP       string     `json:"ip" gorm:"comment:请求IP"`
}

func (DDZSmsCode) TableName() string {
        return "ddz_sms_codes"
}
