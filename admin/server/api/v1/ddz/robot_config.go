package ddz

import (
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	"github.com/flipped-aurora/gin-vue-admin/server/service"
	"github.com/flipped-aurora/gin-vue-admin/server/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DDZRobotConfigApi struct{}

var ddzRobotConfigService = service.ServiceGroupApp.DDZServiceGroup.DDZRobotConfigService

// GetRobotConfigList
// @Tags     DDZ机器人配置
// @Summary  分页获取机器人配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotConfigSearch                                     true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取机器人配置列表"
// @Router   /ddz/robotConfig/list [post]
func (api *DDZRobotConfigApi) GetRobotConfigList(c *gin.Context) {
	var req ddzReq.DDZRobotConfigSearch
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

	list, total, err := ddzRobotConfigService.GetRobotConfigList(req)
	if err != nil {
		global.GVA_LOG.Error("获取机器人配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取机器人配置列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetRobotConfigByID
// @Tags     DDZ机器人配置
// @Summary  根据ID获取机器人配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "配置ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZRobotConfigResponse,msg=string}  "获取机器人配置"
// @Router   /ddz/robotConfig/info [get]
func (api *DDZRobotConfigApi) GetRobotConfigByID(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("配置ID不能为空", c)
		return
	}

	configID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		response.FailWithMessage("配置ID格式错误", c)
		return
	}

	config, err := ddzRobotConfigService.GetRobotConfigByID(configID)
	if err != nil {
		global.GVA_LOG.Error("获取机器人配置失败!", zap.Error(err))
		response.FailWithMessage("获取机器人配置失败", c)
		return
	}

	response.OkWithDetailed(config, "获取成功", c)
}

// GetDefaultConfig
// @Tags     DDZ机器人配置
// @Summary  获取默认配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200  {object}  response.Response{data=ddzRes.DDZRobotConfigResponse,msg=string}  "获取默认配置"
// @Router   /ddz/robotConfig/default [get]
func (api *DDZRobotConfigApi) GetDefaultConfig(c *gin.Context) {
	config, err := ddzRobotConfigService.GetDefaultConfig()
	if err != nil {
		global.GVA_LOG.Error("获取默认配置失败!", zap.Error(err))
		response.FailWithMessage("获取默认配置失败", c)
		return
	}

	response.OkWithDetailed(config, "获取成功", c)
}

// GetAllConfigs
// @Tags     DDZ机器人配置
// @Summary  获取所有启用的配置（用于下拉选择）
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200  {object}  response.Response{data=[]ddzRes.DDZRobotConfigSimpleResponse,msg=string}  "获取配置列表"
// @Router   /ddz/robotConfig/all [get]
func (api *DDZRobotConfigApi) GetAllConfigs(c *gin.Context) {
	list, err := ddzRobotConfigService.GetAllConfigs()
	if err != nil {
		global.GVA_LOG.Error("获取配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取配置列表失败", c)
		return
	}

	response.OkWithDetailed(list, "获取成功", c)
}

// CreateRobotConfig
// @Tags     DDZ机器人配置
// @Summary  创建机器人配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotConfigCreate        true  "配置信息"
// @Success  200   {object}  response.Response{msg=string}  "创建配置"
// @Router   /ddz/robotConfig/create [post]
func (api *DDZRobotConfigApi) CreateRobotConfig(c *gin.Context) {
	var req ddzReq.DDZRobotConfigCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotConfigService.CreateRobotConfig(req)
	if err != nil {
		global.GVA_LOG.Error("创建机器人配置失败!", zap.Error(err))
		response.FailWithMessage("创建机器人配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateRobotConfig
// @Tags     DDZ机器人配置
// @Summary  更新机器人配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotConfigUpdate       true  "配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新配置"
// @Router   /ddz/robotConfig/update [put]
func (api *DDZRobotConfigApi) UpdateRobotConfig(c *gin.Context) {
	var req ddzReq.DDZRobotConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotConfigService.UpdateRobotConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新机器人配置失败!", zap.Error(err))
		response.FailWithMessage("更新机器人配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteRobotConfig
// @Tags     DDZ机器人配置
// @Summary  删除机器人配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotConfigDelete        true  "配置ID"
// @Success  200   {object}  response.Response{msg=string}  "删除配置"
// @Router   /ddz/robotConfig/delete [delete]
func (api *DDZRobotConfigApi) DeleteRobotConfig(c *gin.Context) {
	var req ddzReq.DDZRobotConfigDelete
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotConfigService.DeleteRobotConfig(req.ID)
	if err != nil {
		global.GVA_LOG.Error("删除机器人配置失败!", zap.Error(err))
		response.FailWithMessage("删除机器人配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// SetDefaultConfig
// @Tags     DDZ机器人配置
// @Summary  设置默认配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotConfigSetDefault  true  "配置ID"
// @Success  200   {object}  response.Response{msg=string}  "设置默认配置"
// @Router   /ddz/robotConfig/setDefault [post]
func (api *DDZRobotConfigApi) SetDefaultConfig(c *gin.Context) {
	var req ddzReq.DDZRobotConfigSetDefault
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotConfigService.SetDefaultConfig(req.ID)
	if err != nil {
		global.GVA_LOG.Error("设置默认配置失败!", zap.Error(err))
		response.FailWithMessage("设置默认配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("设置成功", c)
}
