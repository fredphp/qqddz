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

type DDZStatsApi struct{}

var ddzStatsService = service.ServiceGroupApp.DDZServiceGroup.DDZStatsService

// GetOverviewStats
// @Tags     DDZ统计数据
// @Summary  获取概览统计
// @Security ApiKeyAuth
// @Produce  application/json
// @Success  200  {object}  response.Response{data=ddzRes.DDZOverviewStatsResponse,msg=string}  "获取概览统计"
// @Router   /ddz/stats/overview [get]
func (api *DDZStatsApi) GetOverviewStats(c *gin.Context) {
	stats, err := ddzStatsService.GetOverviewStats()
	if err != nil {
		global.GVA_LOG.Error("获取概览统计失败!", zap.Error(err))
		response.FailWithMessage("获取概览统计失败", c)
		return
	}

	response.OkWithDetailed(stats, "获取成功", c)
}

// GetDailyStats
// @Tags     DDZ统计数据
// @Summary  获取每日统计
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZDailyStatsSearch  true  "日期范围"
// @Success  200   {object}  response.Response{data=ddzRes.DDZDailyStatsListResponse,msg=string}  "获取每日统计"
// @Router   /ddz/stats/daily [post]
func (api *DDZStatsApi) GetDailyStats(c *gin.Context) {
	var req ddzReq.DDZDailyStatsSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	stats, err := ddzStatsService.GetDailyStats(req)
	if err != nil {
		global.GVA_LOG.Error("获取每日统计失败!", zap.Error(err))
		response.FailWithMessage("获取每日统计失败", c)
		return
	}

	response.OkWithDetailed(stats, "获取成功", c)
}

// GetLeaderboard
// @Tags     DDZ统计数据
// @Summary  获取排行榜
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZLeaderboardSearch  true  "排行榜参数"
// @Success  200   {object}  response.Response{data=ddzRes.DDZLeaderboardListResponse,msg=string}  "获取排行榜"
// @Router   /ddz/stats/leaderboard [post]
func (api *DDZStatsApi) GetLeaderboard(c *gin.Context) {
	var req ddzReq.DDZLeaderboardSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, err := ddzStatsService.GetLeaderboard(req)
	if err != nil {
		global.GVA_LOG.Error("获取排行榜失败!", zap.Error(err))
		response.FailWithMessage("获取排行榜失败", c)
		return
	}

	response.OkWithDetailed(list, "获取成功", c)
}

// GetPlayerStats
// @Tags     DDZ统计数据
// @Summary  获取玩家统计
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZStatsSearch                                      true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取玩家统计"
// @Router   /ddz/stats/player [post]
func (api *DDZStatsApi) GetPlayerStats(c *gin.Context) {
	var req ddzReq.DDZStatsSearch
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

	list, total, err := ddzStatsService.GetPlayerStats(req)
	if err != nil {
		global.GVA_LOG.Error("获取玩家统计失败!", zap.Error(err))
		response.FailWithMessage("获取玩家统计失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetDailyActiveChart
// @Tags     DDZ统计数据
// @Summary  获取每日活跃图表数据
// @Security ApiKeyAuth
// @Produce  application/json
// @Param    startDate  query     string  true  "开始日期"
// @Param    endDate    query     string  true  "结束日期"
// @Success  200        {object}  response.Response{data=ddzRes.DDZChartResponse,msg=string}  "获取图表数据"
// @Router   /ddz/stats/chart/active [get]
func (api *DDZStatsApi) GetDailyActiveChart(c *gin.Context) {
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	if startDate == "" || endDate == "" {
		response.FailWithMessage("日期参数不能为空", c)
		return
	}

	chart, err := ddzStatsService.GetDailyActiveChart(startDate, endDate)
	if err != nil {
		global.GVA_LOG.Error("获取每日活跃图表失败!", zap.Error(err))
		response.FailWithMessage("获取每日活跃图表失败", c)
		return
	}

	response.OkWithDetailed(chart, "获取成功", c)
}

// GetDailyGamesChart
// @Tags     DDZ统计数据
// @Summary  获取每日游戏场次图表数据
// @Security ApiKeyAuth
// @Produce  application/json
// @Param    startDate  query     string  true  "开始日期"
// @Param    endDate    query     string  true  "结束日期"
// @Success  200        {object}  response.Response{data=ddzRes.DDZChartResponse,msg=string}  "获取图表数据"
// @Router   /ddz/stats/chart/games [get]
func (api *DDZStatsApi) GetDailyGamesChart(c *gin.Context) {
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	if startDate == "" || endDate == "" {
		response.FailWithMessage("日期参数不能为空", c)
		return
	}

	chart, err := ddzStatsService.GetDailyGamesChart(startDate, endDate)
	if err != nil {
		global.GVA_LOG.Error("获取每日游戏场次图表失败!", zap.Error(err))
		response.FailWithMessage("获取每日游戏场次图表失败", c)
		return
	}

	response.OkWithDetailed(chart, "获取成功", c)
}
