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

type DDZArenaRegistrationApi struct{}

var ddzArenaRegistrationService = service.ServiceGroupApp.DDZServiceGroup.DDZArenaRegistrationService

// Register 竞技场报名
// @Tags     DDZ竞技场报名
// @Summary  竞技场报名
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaRegister                                      true  "报名请求"
// @Success  200   {object}  response.Response{data=ddzRes.DDZArenaOperateResponse,msg=string}  "报名结果"
// @Router   /ddz/arena/register [post]
func (api *DDZArenaRegistrationApi) Register(c *gin.Context) {
	var req ddzReq.DDZArenaRegister
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	ip := c.ClientIP()
	result, err := ddzArenaRegistrationService.Register(req, ip)
	if err != nil {
		global.GVA_LOG.Error("竞技场报名失败!", zap.Error(err))
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "报名成功", c)
}

// Cancel 取消报名
// @Tags     DDZ竞技场报名
// @Summary  取消竞技场报名
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaCancel                                        true  "取消报名请求"
// @Success  200   {object}  response.Response{data=ddzRes.DDZArenaOperateResponse,msg=string}  "取消结果"
// @Router   /ddz/arena/cancel [post]
func (api *DDZArenaRegistrationApi) Cancel(c *gin.Context) {
	var req ddzReq.DDZArenaCancel
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	ip := c.ClientIP()
	result, err := ddzArenaRegistrationService.Cancel(req, ip)
	if err != nil {
		global.GVA_LOG.Error("取消报名失败!", zap.Error(err))
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "取消成功", c)
}

// GetStatus 获取报名状态
// @Tags     DDZ竞技场报名
// @Summary  获取玩家报名状态
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    playerId  query     uint64                                                       true  "玩家ID"
// @Success  200       {object}  response.Response{data=ddzRes.DDZArenaStatusResponse,msg=string}  "报名状态"
// @Router   /ddz/arena/status [get]
func (api *DDZArenaRegistrationApi) GetStatus(c *gin.Context) {
	playerIDStr := c.Query("playerId")
	if playerIDStr == "" {
		response.FailWithMessage("玩家ID不能为空", c)
		return
	}

	playerID := utils.StringToUint64(playerIDStr)
	result, err := ddzArenaRegistrationService.GetStatus(playerID)
	if err != nil {
		global.GVA_LOG.Error("获取报名状态失败!", zap.Error(err))
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// GetArenaList 获取竞技场列表
// @Tags     DDZ竞技场报名
// @Summary  获取竞技场列表（包含玩家报名状态）
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    playerId  query     uint64                                                       true  "玩家ID"
// @Success  200       {object}  response.Response{data=[]ddzRes.DDZArenaListResponse,msg=string}  "竞技场列表"
// @Router   /ddz/arena/list [get]
func (api *DDZArenaRegistrationApi) GetArenaList(c *gin.Context) {
	playerIDStr := c.Query("playerId")
	if playerIDStr == "" {
		response.FailWithMessage("玩家ID不能为空", c)
		return
	}

	playerID := utils.StringToUint64(playerIDStr)
	result, err := ddzArenaRegistrationService.GetArenaList(playerID)
	if err != nil {
		global.GVA_LOG.Error("获取竞技场列表失败!", zap.Error(err))
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// GetRegistrationList 获取报名记录列表（管理后台用）
// @Tags     DDZ竞技场报名
// @Summary  分页获取报名记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaRegistrationSearch                            true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "报名记录列表"
// @Router   /ddz/arena/registration/list [post]
func (api *DDZArenaRegistrationApi) GetRegistrationList(c *gin.Context) {
	var req ddzReq.DDZArenaRegistrationSearch
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

	list, total, err := ddzArenaRegistrationService.GetRegistrationList(req)
	if err != nil {
		global.GVA_LOG.Error("获取报名记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取报名记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
