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

type DDZArenaSignupLogApi struct{}

var ddzArenaSignupLogService = service.ServiceGroupApp.DDZServiceGroup.DDZArenaSignupLogService

// GetArenaSignupLogList 获取报名日志列表
// @Tags     DDZ报名日志
// @Summary  获取报名日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaSignupLogSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/arenaSignupLog/list [post]
func (api *DDZArenaSignupLogApi) GetArenaSignupLogList(c *gin.Context) {
	var req ddzReq.DDZArenaSignupLogSearch
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

	list, total, err := ddzArenaSignupLogService.GetArenaSignupLogList(req)
	if err != nil {
		global.GVA_LOG.Error("获取报名日志列表失败!", zap.Error(err))
		response.FailWithMessage("获取报名日志列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
