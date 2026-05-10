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

type DDZAdRewardApi struct{}

var ddzAdRewardService = service.ServiceGroupApp.DDZServiceGroup.DDZAdRewardService

// GetAdRewardList
// @Tags     DDZ广告奖励日志
// @Summary  分页获取广告奖励日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZAdRewardSearch                                     true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取广告奖励日志列表"
// @Router   /ddz/adReward/list [post]
func (api *DDZAdRewardApi) GetAdRewardList(c *gin.Context) {
	var req ddzReq.DDZAdRewardSearch
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

	list, total, err := ddzAdRewardService.GetAdRewardList(req)
	if err != nil {
		global.GVA_LOG.Error("获取广告奖励日志列表失败!", zap.Error(err))
		response.FailWithMessage("获取广告奖励日志列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
