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

type DDZArenaRoundRecordApi struct{}

var ddzArenaRoundRecordService = service.ServiceGroupApp.DDZServiceGroup.DDZArenaRoundRecordService

// GetArenaRoundRecordList 获取轮次记录列表
// @Tags     DDZ轮次记录
// @Summary  获取轮次记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZArenaRoundRecordSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/arenaRoundRecord/list [post]
func (api *DDZArenaRoundRecordApi) GetArenaRoundRecordList(c *gin.Context) {
	var req ddzReq.DDZArenaRoundRecordSearch
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

	list, total, err := ddzArenaRoundRecordService.GetArenaRoundRecordList(req)
	if err != nil {
		global.GVA_LOG.Error("获取轮次记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取轮次记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
