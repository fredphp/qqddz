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

type DDZGameConfigApi struct{}

var ddzGameConfigService = service.ServiceGroupApp.DDZServiceGroup.DDZGameConfigService

// GetGameConfigList 获取游戏配置列表
// @Tags     DDZ游戏配置
// @Summary  获取游戏配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameConfigSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/gameConfig/list [post]
func (api *DDZGameConfigApi) GetGameConfigList(c *gin.Context) {
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

	list, total, err := ddzGameConfigService.GetGameConfigList(req)
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

// CreateGameConfig 创建游戏配置
// @Tags     DDZ游戏配置
// @Summary  创建游戏配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameConfigCreate  true  "创建参数"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/gameConfig/create [post]
func (api *DDZGameConfigApi) CreateGameConfig(c *gin.Context) {
	var req ddzReq.DDZGameConfigCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzGameConfigService.CreateGameConfig(req)
	if err != nil {
		global.GVA_LOG.Error("创建游戏配置失败!", zap.Error(err))
		response.FailWithMessage("创建游戏配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateGameConfig 更新游戏配置
// @Tags     DDZ游戏配置
// @Summary  更新游戏配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameConfigUpdate  true  "更新参数"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/gameConfig/update [put]
func (api *DDZGameConfigApi) UpdateGameConfig(c *gin.Context) {
	var req ddzReq.DDZGameConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzGameConfigService.UpdateGameConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新游戏配置失败!", zap.Error(err))
		response.FailWithMessage("更新游戏配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteGameConfig 删除游戏配置
// @Tags     DDZ游戏配置
// @Summary  删除游戏配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint  true  "配置ID"
// @Success  200  {object}  response.Response{msg=string}
// @Router   /ddz/gameConfig/delete [delete]
func (api *DDZGameConfigApi) DeleteGameConfig(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("配置ID不能为空", c)
		return
	}

	err := ddzGameConfigService.DeleteGameConfig(utils.StringToUint64(id))
	if err != nil {
		global.GVA_LOG.Error("删除游戏配置失败!", zap.Error(err))
		response.FailWithMessage("删除游戏配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}
