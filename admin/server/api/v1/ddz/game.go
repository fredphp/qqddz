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

type DDZGameApi struct{}

var ddzGameService = service.ServiceGroupApp.DDZServiceGroup.DDZGameService

// GetGameRecordList
// @Tags     DDZ游戏记录
// @Summary  分页获取游戏记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameRecordSearch                                  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取游戏记录列表"
// @Router   /ddz/game/list [post]
func (api *DDZGameApi) GetGameRecordList(c *gin.Context) {
	var req ddzReq.DDZGameRecordSearch
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

	list, total, err := ddzGameService.GetGameRecordList(req)
	if err != nil {
		global.GVA_LOG.Error("获取游戏记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取游戏记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetGameRecordDetail
// @Tags     DDZ游戏记录
// @Summary  获取游戏记录详情
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "记录ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZGameRecordDetailResponse,msg=string}  "获取游戏记录详情"
// @Router   /ddz/game/detail [get]
func (api *DDZGameApi) GetGameRecordDetail(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		response.FailWithMessage("记录ID不能为空", c)
		return
	}

	recordID := utils.StringToUint(id)
	detail, err := ddzGameService.GetGameRecordDetail(recordID)
	if err != nil {
		global.GVA_LOG.Error("获取游戏记录详情失败!", zap.Error(err))
		response.FailWithMessage("获取游戏记录详情失败", c)
		return
	}

	response.OkWithDetailed(detail, "获取成功", c)
}
