package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	"github.com/flipped-aurora/gin-vue-admin/server/service"
	"github.com/flipped-aurora/gin-vue-admin/server/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DDZUserAccountApi struct{}

var ddzUserAccountService = service.ServiceGroupApp.DDZServiceGroup.DDZUserAccountService

// CreateUserAccount
// @Tags     DDZ用户账户管理
// @Summary  创建用户账户
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountCreate  true  "用户账户信息"
// @Success  200   {object}  response.Response{data=ddzRes.DDZUserAccountResponse,msg=string}  "创建用户账户"
// @Router   /ddz/userAccount/create [post]
func (api *DDZUserAccountApi) CreateUserAccount(c *gin.Context) {
	var req ddzReq.DDZUserAccountCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	account, err := ddzUserAccountService.CreateUserAccount(req)
	if err != nil {
		global.GVA_LOG.Error("创建用户账户失败!", zap.Error(err))
		response.FailWithMessage("创建用户账户失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(account, "创建成功", c)
}

// DeleteUserAccount
// @Tags     DDZ用户账户管理
// @Summary  删除用户账户
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountDelete  true  "用户账户ID"
// @Success  200   {object}  response.Response{msg=string}  "删除用户账户"
// @Router   /ddz/userAccount/delete [delete]
func (api *DDZUserAccountApi) DeleteUserAccount(c *gin.Context) {
	var req ddzReq.DDZUserAccountDelete
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.DeleteUserAccount(req.ID)
	if err != nil {
		global.GVA_LOG.Error("删除用户账户失败!", zap.Error(err))
		response.FailWithMessage("删除用户账户失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// GetUserAccountList
// @Tags     DDZ用户账户管理
// @Summary  分页获取用户账户列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取用户账户列表"
// @Router   /ddz/userAccount/list [post]
func (api *DDZUserAccountApi) GetUserAccountList(c *gin.Context) {
	var req ddzReq.DDZUserAccountSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = utils.Verify(req.PageInfo, utils.PageInfoVerify)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, total, err := ddzUserAccountService.GetUserAccountList(req)
	if err != nil {
		global.GVA_LOG.Error("获取用户账户列表失败!", zap.Error(err))
		response.FailWithMessage("获取用户账户列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetUserAccountByID
// @Tags     DDZ用户账户管理
// @Summary  根据ID获取用户账户信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint  true  "用户账户ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZUserAccountResponse,msg=string}  "获取用户账户信息"
// @Router   /ddz/userAccount/info [get]
func (api *DDZUserAccountApi) GetUserAccountByID(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("用户账户ID不能为空", c)
		return
	}

	accountID := utils.StringToUint(id)
	account, err := ddzUserAccountService.GetUserAccountByID(accountID)
	if err != nil {
		global.GVA_LOG.Error("获取用户账户信息失败!", zap.Error(err))
		response.FailWithMessage("获取用户账户信息失败", c)
		return
	}

	response.OkWithDetailed(account, "获取成功", c)
}

// UpdateUserAccount
// @Tags     DDZ用户账户管理
// @Summary  更新用户账户信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountUpdate  true  "用户账户信息"
// @Success  200   {object}  response.Response{msg=string}  "更新用户账户信息"
// @Router   /ddz/userAccount/update [put]
func (api *DDZUserAccountApi) UpdateUserAccount(c *gin.Context) {
	var req ddzReq.DDZUserAccountUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.UpdateUserAccount(req)
	if err != nil {
		global.GVA_LOG.Error("更新用户账户信息失败!", zap.Error(err))
		response.FailWithMessage("更新用户账户信息失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// UpdateUserAccountStatus
// @Tags     DDZ用户账户管理
// @Summary  更新用户账户状态
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountStatus  true  "状态信息"
// @Success  200   {object}  response.Response{msg=string}  "更新用户账户状态"
// @Router   /ddz/userAccount/status [post]
func (api *DDZUserAccountApi) UpdateUserAccountStatus(c *gin.Context) {
	var req ddzReq.DDZUserAccountStatus
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.UpdateUserAccountStatus(req)
	if err != nil {
		global.GVA_LOG.Error("更新用户账户状态失败!", zap.Error(err))
		response.FailWithMessage("更新用户账户状态失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// GetLoginLogList
// @Tags     DDZ用户账户管理
// @Summary  分页获取登录日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZLoginLogSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取登录日志列表"
// @Router   /ddz/userAccount/loginLog [post]
func (api *DDZUserAccountApi) GetLoginLogList(c *gin.Context) {
	var req ddzReq.DDZLoginLogSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = utils.Verify(req.PageInfo, utils.PageInfoVerify)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, total, err := ddzUserAccountService.GetLoginLogList(req)
	if err != nil {
		global.GVA_LOG.Error("获取登录日志列表失败!", zap.Error(err))
		response.FailWithMessage("获取登录日志列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// BindPhone
// @Tags     DDZ用户账户管理
// @Summary  绑定手机号
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      map[string]interface{}  true  "账户ID和手机号"
// @Success  200   {object}  response.Response{msg=string}  "绑定手机号"
// @Router   /ddz/userAccount/bindPhone [post]
func (api *DDZUserAccountApi) BindPhone(c *gin.Context) {
	var req struct {
		ID    uint   `json:"ID" binding:"required"`
		Phone string `json:"phone" binding:"required"`
	}
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.BindPhone(req.ID, req.Phone)
	if err != nil {
		global.GVA_LOG.Error("绑定手机号失败!", zap.Error(err))
		response.FailWithMessage("绑定手机号失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("绑定成功", c)
}

// UnbindWeChat
// @Tags     DDZ用户账户管理
// @Summary  解绑微信
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountDelete  true  "用户账户ID"
// @Success  200   {object}  response.Response{msg=string}  "解绑微信"
// @Router   /ddz/userAccount/unbindWechat [post]
func (api *DDZUserAccountApi) UnbindWeChat(c *gin.Context) {
	var req ddzReq.DDZUserAccountDelete
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.UnbindWeChat(req.ID)
	if err != nil {
		global.GVA_LOG.Error("解绑微信失败!", zap.Error(err))
		response.FailWithMessage("解绑微信失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("解绑成功", c)
}

// ResetToken
// @Tags     DDZ用户账户管理
// @Summary  重置Token(强制下线)
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZUserAccountDelete  true  "用户账户ID"
// @Success  200   {object}  response.Response{msg=string}  "重置Token"
// @Router   /ddz/userAccount/resetToken [post]
func (api *DDZUserAccountApi) ResetToken(c *gin.Context) {
	var req ddzReq.DDZUserAccountDelete
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzUserAccountService.ResetToken(req.ID)
	if err != nil {
		global.GVA_LOG.Error("重置Token失败!", zap.Error(err))
		response.FailWithMessage("重置Token失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("重置成功，用户已被强制下线", c)
}
