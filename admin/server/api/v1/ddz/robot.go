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

type DDZRobotApi struct{}

var ddzRobotService = service.ServiceGroupApp.DDZServiceGroup.DDZRobotService

// GetRobotList
// @Tags     DDZ机器人管理
// @Summary  分页获取机器人列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotSearch                                     true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取机器人列表"
// @Router   /ddz/robot/list [post]
func (api *DDZRobotApi) GetRobotList(c *gin.Context) {
	var req ddzReq.DDZRobotSearch
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

	list, total, err := ddzRobotService.GetRobotList(req)
	if err != nil {
		global.GVA_LOG.Error("获取机器人列表失败!", zap.Error(err))
		response.FailWithMessage("获取机器人列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetRobotStatus
// @Tags     DDZ机器人管理
// @Summary  获取机器人状态
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "机器人ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZRobotStatusResponse,msg=string}  "获取机器人状态"
// @Router   /ddz/robot/status [get]
func (api *DDZRobotApi) GetRobotStatus(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("机器人ID不能为空", c)
		return
	}

	robotID := utils.StringToUint(id)
	status, err := ddzRobotService.GetRobotStatus(robotID)
	if err != nil {
		global.GVA_LOG.Error("获取机器人状态失败!", zap.Error(err))
		response.FailWithMessage("获取机器人状态失败", c)
		return
	}

	response.OkWithDetailed(status, "获取成功", c)
}

// GetRobotStats
// @Tags     DDZ机器人管理
// @Summary  获取机器人统计信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200  {object}  response.Response{data=ddzRes.DDZRobotStatsResponse,msg=string}  "获取机器人统计"
// @Router   /ddz/robot/stats [get]
func (api *DDZRobotApi) GetRobotStats(c *gin.Context) {
	stats, err := ddzRobotService.GetRobotStats()
	if err != nil {
		global.GVA_LOG.Error("获取机器人统计失败!", zap.Error(err))
		response.FailWithMessage("获取机器人统计失败", c)
		return
	}

	response.OkWithDetailed(stats, "获取成功", c)
}

// GetAIConfigList
// @Tags     DDZ机器人管理
// @Summary  获取AI配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZAIConfigSearch                                     true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取AI配置列表"
// @Router   /ddz/robot/aiConfig/list [post]
func (api *DDZRobotApi) GetAIConfigList(c *gin.Context) {
	var req ddzReq.DDZAIConfigSearch
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

	list, total, err := ddzRobotService.GetAIConfigList(req)
	if err != nil {
		global.GVA_LOG.Error("获取AI配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取AI配置列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetAIConfigByID
// @Tags     DDZ机器人管理
// @Summary  根据ID获取AI配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "AI配置ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZAIConfigResponse,msg=string}  "获取AI配置"
// @Router   /ddz/robot/aiConfig/info [get]
func (api *DDZRobotApi) GetAIConfigByID(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("AI配置ID不能为空", c)
		return
	}

	configID := utils.StringToUint(id)
	config, err := ddzRobotService.GetAIConfigByID(configID)
	if err != nil {
		global.GVA_LOG.Error("获取AI配置失败!", zap.Error(err))
		response.FailWithMessage("获取AI配置失败", c)
		return
	}

	response.OkWithDetailed(config, "获取成功", c)
}

// CreateAIConfig
// @Tags     DDZ机器人管理
// @Summary  创建AI配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZAIConfigCreate        true  "AI配置信息"
// @Success  200   {object}  response.Response{msg=string}  "创建AI配置"
// @Router   /ddz/robot/aiConfig/create [post]
func (api *DDZRobotApi) CreateAIConfig(c *gin.Context) {
	var req ddzReq.DDZAIConfigCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.CreateAIConfig(req)
	if err != nil {
		global.GVA_LOG.Error("创建AI配置失败!", zap.Error(err))
		response.FailWithMessage("创建AI配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateAIConfig
// @Tags     DDZ机器人管理
// @Summary  更新AI配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZAIConfigUpdate       true  "AI配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新AI配置"
// @Router   /ddz/robot/aiConfig/update [put]
func (api *DDZRobotApi) UpdateAIConfig(c *gin.Context) {
	var req ddzReq.DDZAIConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.UpdateAIConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新AI配置失败!", zap.Error(err))
		response.FailWithMessage("更新AI配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteAIConfig
// @Tags     DDZ机器人管理
// @Summary  删除AI配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZAIConfigDelete        true  "AI配置ID"
// @Success  200   {object}  response.Response{msg=string}  "删除AI配置"
// @Router   /ddz/robot/aiConfig/delete [delete]
func (api *DDZRobotApi) DeleteAIConfig(c *gin.Context) {
	var req ddzReq.DDZAIConfigDelete
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.DeleteAIConfig(req.ID)
	if err != nil {
		global.GVA_LOG.Error("删除AI配置失败!", zap.Error(err))
		response.FailWithMessage("删除AI配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// UpdateRobotLevel
// @Tags     DDZ机器人管理
// @Summary  更新机器人等级
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotLevelUpdate     true  "机器人等级信息"
// @Success  200   {object}  response.Response{msg=string}  "更新机器人等级"
// @Router   /ddz/robot/level [post]
func (api *DDZRobotApi) UpdateRobotLevel(c *gin.Context) {
	var req ddzReq.DDZRobotLevelUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.UpdateRobotLevel(req)
	if err != nil {
		global.GVA_LOG.Error("更新机器人等级失败!", zap.Error(err))
		response.FailWithMessage("更新机器人等级失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// UpdateRobotAIConfig
// @Tags     DDZ机器人管理
// @Summary  更新机器人AI配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotAIConfigUpdate  true  "机器人AI配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新机器人AI配置"
// @Router   /ddz/robot/aiConfig/assign [post]
func (api *DDZRobotApi) UpdateRobotAIConfig(c *gin.Context) {
	var req ddzReq.DDZRobotAIConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.UpdateRobotAIConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新机器人AI配置失败!", zap.Error(err))
		response.FailWithMessage("更新机器人AI配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// GetPatcherConfig
// @Tags     DDZ机器人管理
// @Summary  获取补位配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200  {object}  response.Response{data=ddzRes.DDZPatcherConfigResponse,msg=string}  "获取补位配置"
// @Router   /ddz/robot/patcher/config [get]
func (api *DDZRobotApi) GetPatcherConfig(c *gin.Context) {
	config, err := ddzRobotService.GetPatcherConfig()
	if err != nil {
		global.GVA_LOG.Error("获取补位配置失败!", zap.Error(err))
		response.FailWithMessage("获取补位配置失败", c)
		return
	}

	response.OkWithDetailed(config, "获取成功", c)
}

// UpdatePatcherConfig
// @Tags     DDZ机器人管理
// @Summary  更新补位配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPatcherConfigUpdate  true  "补位配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新补位配置"
// @Router   /ddz/robot/patcher/config [put]
func (api *DDZRobotApi) UpdatePatcherConfig(c *gin.Context) {
	var req ddzReq.DDZPatcherConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.UpdatePatcherConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新补位配置失败!", zap.Error(err))
		response.FailWithMessage("更新补位配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// GetNoWinConfig
// @Tags     DDZ机器人管理
// @Summary  获取不能夺冠配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200  {object}  response.Response{data=ddzRes.DDZNoWinConfigResponse,msg=string}  "获取不能夺冠配置"
// @Router   /ddz/robot/noWin/config [get]
func (api *DDZRobotApi) GetNoWinConfig(c *gin.Context) {
	config, err := ddzRobotService.GetNoWinConfig()
	if err != nil {
		global.GVA_LOG.Error("获取不能夺冠配置失败!", zap.Error(err))
		response.FailWithMessage("获取不能夺冠配置失败", c)
		return
	}

	response.OkWithDetailed(config, "获取成功", c)
}

// UpdateNoWinConfig
// @Tags     DDZ机器人管理
// @Summary  更新不能夺冠配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZNoWinConfigUpdate    true  "不能夺冠配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新不能夺冠配置"
// @Router   /ddz/robot/noWin/config [put]
func (api *DDZRobotApi) UpdateNoWinConfig(c *gin.Context) {
	var req ddzReq.DDZNoWinConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.UpdateNoWinConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新不能夺冠配置失败!", zap.Error(err))
		response.FailWithMessage("更新不能夺冠配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// GetFillRecords
// @Tags     DDZ机器人管理
// @Summary  获取补位记录
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZFillRecordSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取补位记录"
// @Router   /ddz/robot/fillRecords [post]
func (api *DDZRobotApi) GetFillRecords(c *gin.Context) {
	var req ddzReq.DDZFillRecordSearch
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

	list, total, err := ddzRobotService.GetFillRecords(req)
	if err != nil {
		global.GVA_LOG.Error("获取补位记录失败!", zap.Error(err))
		response.FailWithMessage("获取补位记录失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// BatchUpdateRobotStatus
// @Tags     DDZ机器人管理
// @Summary  批量更新机器人状态
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRobotBatchStatusUpdate  true  "批量更新信息"
// @Success  200   {object}  response.Response{msg=string}  "批量更新机器人状态"
// @Router   /ddz/robot/batch/status [post]
func (api *DDZRobotApi) BatchUpdateRobotStatus(c *gin.Context) {
	var req ddzReq.DDZRobotBatchStatusUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRobotService.BatchUpdateRobotStatus(req)
	if err != nil {
		global.GVA_LOG.Error("批量更新机器人状态失败!", zap.Error(err))
		response.FailWithMessage("批量更新机器人状态失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// ReleaseAllRobots
// @Tags     DDZ机器人管理
// @Summary  释放所有忙碌的机器人
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200   {object}  response.Response{msg=string}  "释放所有机器人"
// @Router   /ddz/robot/releaseAll [post]
func (api *DDZRobotApi) ReleaseAllRobots(c *gin.Context) {
	count, err := ddzRobotService.ReleaseAllRobots()
	if err != nil {
		global.GVA_LOG.Error("释放机器人失败!", zap.Error(err))
		response.FailWithMessage("释放机器人失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(gin.H{"released_count": count}, "释放成功", c)
}
