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

type DDZStatsDetailApi struct{}

var ddzStatsDetailService = service.ServiceGroupApp.DDZServiceGroup.DDZStatsService

// GetDailyStatsList 获取每日统计列表
// @Tags     DDZ每日统计
// @Summary  获取每日统计列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZDailyStatsSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/dailyStats/list [post]
func (api *DDZStatsDetailApi) GetDailyStatsList(c *gin.Context) {
	var req ddzReq.DDZDailyStatsSearch
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

	list, total, err := ddzStatsDetailService.GetDailyStatsList(req)
	if err != nil {
		global.GVA_LOG.Error("获取每日统计列表失败!", zap.Error(err))
		response.FailWithMessage("获取每日统计列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetLeaderboardList 获取排行榜列表
// @Tags     DDZ排行榜
// @Summary  获取排行榜列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZLeaderboardSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/leaderboard/list [post]
func (api *DDZStatsDetailApi) GetLeaderboardList(c *gin.Context) {
	var req ddzReq.DDZLeaderboardSearch
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

	list, total, err := ddzStatsDetailService.GetLeaderboardList(req)
	if err != nil {
		global.GVA_LOG.Error("获取排行榜列表失败!", zap.Error(err))
		response.FailWithMessage("获取排行榜列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetPlayerOnlineList 获取在线玩家列表
// @Tags     DDZ在线玩家
// @Summary  获取在线玩家列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerOnlineSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/playerOnline/list [post]
func (api *DDZStatsDetailApi) GetPlayerOnlineList(c *gin.Context) {
	var req ddzReq.DDZPlayerOnlineSearch
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

	list, total, err := ddzStatsDetailService.GetPlayerOnlineList(req)
	if err != nil {
		global.GVA_LOG.Error("获取在线玩家列表失败!", zap.Error(err))
		response.FailWithMessage("获取在线玩家列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetRoomPlayerList 获取房间玩家列表
// @Tags     DDZ房间玩家
// @Summary  获取房间玩家列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRoomPlayerSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/roomPlayer/list [post]
func (api *DDZStatsDetailApi) GetRoomPlayerList(c *gin.Context) {
	var req ddzReq.DDZRoomPlayerSearch
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

	list, total, err := ddzStatsDetailService.GetRoomPlayerList(req)
	if err != nil {
		global.GVA_LOG.Error("获取房间玩家列表失败!", zap.Error(err))
		response.FailWithMessage("获取房间玩家列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
