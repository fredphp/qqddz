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

type DDZArenaMatchConfigApi struct{}

var ddzArenaMatchConfigService = service.ServiceGroupApp.DDZServiceGroup.DDZArenaMatchConfigService

// GetArenaMatchConfigList 获取比赛配置列表
// @Tags     DDZ比赛配置
// @Summary  获取比赛配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaMatchConfigSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/arenaMatchConfig/list [post]
func (api *DDZArenaMatchConfigApi) GetArenaMatchConfigList(c *gin.Context) {
	var req ddzReq.DDZArenaMatchConfigSearch
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

	list, total, err := ddzArenaMatchConfigService.GetArenaMatchConfigList(req)
	if err != nil {
		global.GVA_LOG.Error("获取比赛配置列表失败!", zap.Error(err))
		response.FailWithMessage("获取比赛配置列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// CreateArenaMatchConfig 创建比赛配置
// @Tags     DDZ比赛配置
// @Summary  创建比赛配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaMatchConfigCreate  true  "创建参数"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/arenaMatchConfig/create [post]
func (api *DDZArenaMatchConfigApi) CreateArenaMatchConfig(c *gin.Context) {
	var req ddzReq.DDZArenaMatchConfigCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzArenaMatchConfigService.CreateArenaMatchConfig(req)
	if err != nil {
		global.GVA_LOG.Error("创建比赛配置失败!", zap.Error(err))
		response.FailWithMessage("创建比赛配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateArenaMatchConfig 更新比赛配置
// @Tags     DDZ比赛配置
// @Summary  更新比赛配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaMatchConfigUpdate  true  "更新参数"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/arenaMatchConfig/update [put]
func (api *DDZArenaMatchConfigApi) UpdateArenaMatchConfig(c *gin.Context) {
	var req ddzReq.DDZArenaMatchConfigUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzArenaMatchConfigService.UpdateArenaMatchConfig(req)
	if err != nil {
		global.GVA_LOG.Error("更新比赛配置失败!", zap.Error(err))
		response.FailWithMessage("更新比赛配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteArenaMatchConfig 删除比赛配置
// @Tags     DDZ比赛配置
// @Summary  删除比赛配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint  true  "配置ID"
// @Success  200  {object}  response.Response{msg=string}
// @Router   /ddz/arenaMatchConfig/delete [delete]
func (api *DDZArenaMatchConfigApi) DeleteArenaMatchConfig(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("配置ID不能为空", c)
		return
	}

	err := ddzArenaMatchConfigService.DeleteArenaMatchConfig(utils.StringToUint64(id))
	if err != nil {
		global.GVA_LOG.Error("删除比赛配置失败!", zap.Error(err))
		response.FailWithMessage("删除比赛配置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}
