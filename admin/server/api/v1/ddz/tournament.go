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

type DDZTournamentApi struct{}

var ddzTournamentService = service.ServiceGroupApp.DDZServiceGroup.DDZTournamentService

// GetTournamentRoundList 获取锦标赛轮次列表
// @Tags     DDZ锦标赛轮次
// @Summary  获取锦标赛轮次列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZTournamentRoundSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/tournamentRound/list [post]
func (api *DDZTournamentApi) GetTournamentRoundList(c *gin.Context) {
	var req ddzReq.DDZTournamentRoundSearch
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

	list, total, err := ddzTournamentService.GetTournamentRoundList(req)
	if err != nil {
		global.GVA_LOG.Error("获取锦标赛轮次列表失败!", zap.Error(err))
		response.FailWithMessage("获取锦标赛轮次列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetTournamentEliminationList 获取锦标赛淘汰记录列表
// @Tags     DDZ锦标赛淘汰
// @Summary  获取锦标赛淘汰记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZTournamentEliminationSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/tournamentElimination/list [post]
func (api *DDZTournamentApi) GetTournamentEliminationList(c *gin.Context) {
	var req ddzReq.DDZTournamentEliminationSearch
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

	list, total, err := ddzTournamentService.GetTournamentEliminationList(req)
	if err != nil {
		global.GVA_LOG.Error("获取锦标赛淘汰记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取锦标赛淘汰记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
