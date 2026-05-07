package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZUserAccountSearch 用户账户搜索请求
type DDZUserAccountSearch struct {
	request.PageInfo
	Phone      string `json:"phone" form:"phone"`
	PlayerID   string `json:"playerId" form:"playerId"`
	LoginType  *int   `json:"loginType" form:"loginType"`
	Status     *int   `json:"status" form:"status"`
	WxNickname string `json:"wxNickname" form:"wxNickname"`
}

// DDZUserAccountCreate 创建用户账户请求
type DDZUserAccountCreate struct {
	PlayerID   uint   `json:"playerId" binding:"required"`
	Phone      string `json:"phone"`
	Password   string `json:"password"`
	WxOpenID   string `json:"wxOpenId"`
	WxUnionID  string `json:"wxUnionId"`
	WxNickname string `json:"wxNickname"`
	WxAvatar   string `json:"wxAvatar"`
	LoginType  int    `json:"loginType"`
	DeviceID   string `json:"deviceId"`
	DeviceType string `json:"deviceType"`
}

// DDZUserAccountUpdate 更新用户账户请求
type DDZUserAccountUpdate struct {
	ID         uint   `json:"ID" binding:"required"`
	Phone      string `json:"phone"`
	WxNickname string `json:"wxNickname"`
	WxAvatar   string `json:"wxAvatar"`
	Status     *int   `json:"status"`
}

// DDZUserAccountDelete 删除用户账户请求
type DDZUserAccountDelete struct {
	ID uint `json:"ID" binding:"required"`
}

// DDZUserAccountStatus 更新账户状态请求
type DDZUserAccountStatus struct {
	ID     uint `json:"ID" binding:"required"`
	Status int  `json:"status" binding:"required"`
	Reason string `json:"reason"` // 禁用/封禁原因
}

// DDZLoginLogSearch 登录日志搜索请求
type DDZLoginLogSearch struct {
	request.PageInfo
	PlayerID    string `json:"playerId" form:"playerId"`
	LoginType   *int   `json:"loginType" form:"loginType"`
	LoginResult *int   `json:"loginResult" form:"loginResult"`
	IP          string `json:"ip" form:"ip"`
	StartDate   string `json:"startDate" form:"startDate"`
	EndDate     string `json:"endDate" form:"endDate"`
}
