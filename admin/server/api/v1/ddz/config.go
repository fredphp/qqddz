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

type DDZConfigApi struct{}

var ddzConfigService = service.ServiceGroupApp.DDZServiceGroup.DDZConfigService

// GetRoomConfigList
// @Tags     DDZ房间配置
// @Summary  分页获取房间配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRoomConfigSearch                                  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取房间配置列表"
// @Router   /ddz/config/room/list [post]
func (api *DDZConfigApi) GetRoomConfigList(c *gin.Context) {
	var req ddzReq.DDZRoomConfigSearch
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

	list, total, err := ddzConfigService.GetRoomConfigList(req)
	if err != nil {
		global.GVA_LOG.Error("获取房间配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取房间配置列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// CreateRoomConfig
// @Tags     DDZ房间配置
// @Summary  创建房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRoomConfigCreate   true  "房间配置信息"
// @Success  200   {object}  response.Response{msg=string}  "创建房间配置"
// @Router   /ddz/config/room/create [post]
func (api *DDZConfigApi) CreateRoomConfig(c *gin.Context) {
	var req ddzReq.DDZRoomConfigCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzConfigService.CreateRoomConfig(req)
	if err != nil {
		global.GVA_LOG.Error("创建房间配置失败!", zap.Error(err))
		response.FailWithMessage("创建房间配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateRoomConfig
// @Tags     DDZ房间配置
// @Summary  更新房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRoomConfigUpdate   true  "房间配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新房间配置"
// @Router   /ddz/config/room/update [put]
func (api *DDZConfigApi) UpdateRoomConfig(c *gin.Context) {
	var req ddzReq.DDZRoomConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzConfigService.UpdateRoomConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新房间配置失败!", zap.Error(err))
		response.FailWithMessage("更新房间配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteRoomConfig
// @Tags     DDZ房间配置
// @Summary  删除房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   body      request.GetById              true  "配置ID"
// @Success  200  {object}  response.Response{msg=string}  "删除房间配置"
// @Router   /ddz/config/room/delete [delete]
func (api *DDZConfigApi) DeleteRoomConfig(c *gin.Context) {
	var req struct {
		ID uint `json:"id" binding:"required"`
	}
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzConfigService.DeleteRoomConfig(req.ID)
	if err != nil {
		global.GVA_LOG.Error("删除房间配置失败!", zap.Error(err))
		response.FailWithMessage("删除房间配置失败", c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// GetGameConfigList
// @Tags     DDZ游戏配置
// @Summary  分页获取游戏配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameConfigSearch                                  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取游戏配置列表"
// @Router   /ddz/config/game/list [post]
func (api *DDZConfigApi) GetGameConfigList(c *gin.Context) {
	var req ddzReq.DDZGameConfigSearch
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

	list, total, err := ddzConfigService.GetGameConfigList(req)
	if err != nil {
		global.GVA_LOG.Error("获取游戏配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取游戏配置列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// UpdateGameConfig
// @Tags     DDZ游戏配置
// @Summary  更新游戏配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameConfigUpdate    true  "游戏配置信息"
// @Success  200   {object}  response.Response{msg=string}  "更新游戏配置"
// @Router   /ddz/config/game/update [put]
func (api *DDZConfigApi) UpdateGameConfig(c *gin.Context) {
	var req ddzReq.DDZGameConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzConfigService.UpdateGameConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新游戏配置失败!", zap.Error(err))
		response.FailWithMessage("更新游戏配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}
