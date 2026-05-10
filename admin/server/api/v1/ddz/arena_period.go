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

type DDZArenaPeriodApi struct{}

var ddzArenaPeriodService = service.ServiceGroupApp.DDZServiceGroup.DDZArenaPeriodService

// GetArenaPeriodList
// @Tags     竞技场期号管理
// @Summary  获取期号列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.ArenaPeriodSearch                                  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取期号列表"
// @Router   /ddz/arenaPeriod/list [post]
func (api *DDZArenaPeriodApi) GetArenaPeriodList(c *gin.Context) {
        var req ddzReq.ArenaPeriodSearch
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

        list, total, err := ddzArenaPeriodService.GetArenaPeriodList(req)
        if err != nil {
                global.GVA_LOG.Error("获取期号列表失败!", zap.Error(err))
                response.FailWithMessage("获取期号列表失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetArenaPeriodByID
// @Tags     竞技场期号管理
// @Summary  根据ID获取期号详情
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "期号ID"
// @Success  200  {object}  response.Response{data=ddzRes.ArenaPeriodResponse,msg=string}  "获取期号详情"
// @Router   /ddz/arenaPeriod/info [get]
func (api *DDZArenaPeriodApi) GetArenaPeriodByID(c *gin.Context) {
        id := c.Query("id")
        if id == "" {
                response.FailWithMessage("期号ID不能为空", c)
                return
        }

        periodID := utils.StringToUint(id)
        period, err := ddzArenaPeriodService.GetArenaPeriodByID(uint64(periodID))
        if err != nil {
                global.GVA_LOG.Error("获取期号详情失败!", zap.Error(err))
                response.FailWithMessage("获取期号详情失败", c)
                return
        }

        response.OkWithDetailed(period, "获取成功", c)
}

// UpdateArenaPeriod
// @Tags     竞技场期号管理
// @Summary  更新期号信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.ArenaPeriodUpdate     true  "期号信息"
// @Success  200   {object}  response.Response{msg=string}  "更新期号信息"
// @Router   /ddz/arenaPeriod/update [put]
func (api *DDZArenaPeriodApi) UpdateArenaPeriod(c *gin.Context) {
        var req ddzReq.ArenaPeriodUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzArenaPeriodService.UpdateArenaPeriodStatus(req)
        if err != nil {
                global.GVA_LOG.Error("更新期号信息失败!", zap.Error(err))
                response.FailWithMessage("更新期号信息失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// DeleteArenaPeriod
// @Tags     竞技场期号管理
// @Summary  删除期号
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.ArenaPeriodDelete        true  "期号ID"
// @Success  200   {object}  response.Response{msg=string}  "删除期号"
// @Router   /ddz/arenaPeriod/delete [delete]
func (api *DDZArenaPeriodApi) DeleteArenaPeriod(c *gin.Context) {
        var req ddzReq.ArenaPeriodDelete
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzArenaPeriodService.DeleteArenaPeriod(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除期号失败!", zap.Error(err))
                response.FailWithMessage("删除期号失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// GetArenaPeriodPlayers
// @Tags     竞技场期号管理
// @Summary  获取期号玩家列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.ArenaPeriodPlayerSearch                              true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取期号玩家列表"
// @Router   /ddz/arenaPeriod/players [post]
func (api *DDZArenaPeriodApi) GetArenaPeriodPlayers(c *gin.Context) {
        var req ddzReq.ArenaPeriodPlayerSearch
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

        list, total, err := ddzArenaPeriodService.GetArenaPeriodPlayers(req)
        if err != nil {
                global.GVA_LOG.Error("获取期号玩家列表失败!", zap.Error(err))
                response.FailWithMessage("获取期号玩家列表失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetArenaPeriodSignupLogs
// @Tags     竞技场期号管理
// @Summary  获取期号报名日志
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.ArenaPeriodSignupLogSearch                           true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取期号报名日志"
// @Router   /ddz/arenaPeriod/signupLogs [post]
func (api *DDZArenaPeriodApi) GetArenaPeriodSignupLogs(c *gin.Context) {
        var req ddzReq.ArenaPeriodSignupLogSearch
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

        list, total, err := ddzArenaPeriodService.GetArenaPeriodSignupLogs(req)
        if err != nil {
                global.GVA_LOG.Error("获取期号报名日志失败!", zap.Error(err))
                response.FailWithMessage("获取期号报名日志失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetArenaPeriodStats
// @Tags     竞技场期号管理
// @Summary  获取期号统计
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Success  200   {object}  response.Response{data=ddzRes.ArenaPeriodStatsResponse,msg=string}  "获取期号统计"
// @Router   /ddz/arenaPeriod/stats [get]
func (api *DDZArenaPeriodApi) GetArenaPeriodStats(c *gin.Context) {
        stats, err := ddzArenaPeriodService.GetArenaPeriodStats()
        if err != nil {
                global.GVA_LOG.Error("获取期号统计失败!", zap.Error(err))
                response.FailWithMessage("获取期号统计失败", c)
                return
        }

        response.OkWithDetailed(stats, "获取成功", c)
}
