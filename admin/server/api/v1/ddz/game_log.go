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

type DDZGameLogApi struct{}

var ddzGameLogService = service.ServiceGroupApp.DDZServiceGroup.DDZGameLogService

// GetGameRecordList 获取游戏记录列表
// @Tags     DDZ游戏记录
// @Summary  获取游戏记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameRecordSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/gameRecord/list [post]
func (api *DDZGameLogApi) GetGameRecordList(c *gin.Context) {
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

        list, total, err := ddzGameLogService.GetGameRecordList(req)
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

// GetGameRecordDetail 获取游戏记录详情
// @Tags     DDZ游戏记录
// @Summary  获取游戏记录详情
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint  true  "游戏记录ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZGameRecordDetailResponse,msg=string}
// @Router   /ddz/gameRecord/detail [get]
func (api *DDZGameLogApi) GetGameRecordDetail(c *gin.Context) {
        id := c.Query("id")
        if id == "" {
                response.FailWithMessage("游戏记录ID不能为空", c)
                return
        }

        recordID := utils.StringToUint(id)
        detail, err := ddzGameLogService.GetGameRecordDetail(recordID)
        if err != nil {
                global.GVA_LOG.Error("获取游戏记录详情失败!", zap.Error(err))
                response.FailWithMessage("获取游戏记录详情失败", c)
                return
        }

        response.OkWithDetailed(detail, "获取成功", c)
}

// DeleteGameRecord 删除游戏记录
// @Tags     DDZ游戏记录
// @Summary  删除游戏记录
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      map[string]interface{}  true  "游戏记录ID"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/gameRecord/delete [delete]
func (api *DDZGameLogApi) DeleteGameRecord(c *gin.Context) {
        var req struct {
                ID uint `json:"ID" binding:"required"`
        }
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzGameLogService.DeleteGameRecord(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除游戏记录失败!", zap.Error(err))
                response.FailWithMessage("删除游戏记录失败", c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// GetBidLogList 获取叫地主日志列表
// @Tags     DDZ游戏日志
// @Summary  获取叫地主日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZBidLogSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/log/bid/list [post]
func (api *DDZGameLogApi) GetBidLogList(c *gin.Context) {
        var req ddzReq.DDZBidLogSearch
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

        list, total, err := ddzGameLogService.GetBidLogList(req)
        if err != nil {
                global.GVA_LOG.Error("获取叫地主日志列表失败!", zap.Error(err))
                response.FailWithMessage("获取叫地主日志列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetDealLogList 获取发牌日志列表
// @Tags     DDZ游戏日志
// @Summary  获取发牌日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZDealLogSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/log/deal/list [post]
func (api *DDZGameLogApi) GetDealLogList(c *gin.Context) {
        var req ddzReq.DDZDealLogSearch
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

        list, total, err := ddzGameLogService.GetDealLogList(req)
        if err != nil {
                global.GVA_LOG.Error("获取发牌日志列表失败!", zap.Error(err))
                response.FailWithMessage("获取发牌日志列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetPlayLogList 获取出牌日志列表
// @Tags     DDZ游戏日志
// @Summary  获取出牌日志列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayLogSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/log/play/list [post]
func (api *DDZGameLogApi) GetPlayLogList(c *gin.Context) {
        var req ddzReq.DDZPlayLogSearch
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

        list, total, err := ddzGameLogService.GetPlayLogList(req)
        if err != nil {
                global.GVA_LOG.Error("获取出牌日志列表失败!", zap.Error(err))
                response.FailWithMessage("获取出牌日志列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetPlayerStatList 获取玩家统计列表
// @Tags     DDZ玩家统计
// @Summary  获取玩家统计列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerStatSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/playerStat/list [post]
func (api *DDZGameLogApi) GetPlayerStatList(c *gin.Context) {
        var req ddzReq.DDZPlayerStatSearch
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

        list, total, err := ddzGameLogService.GetPlayerStatList(req)
        if err != nil {
                global.GVA_LOG.Error("获取玩家统计列表失败!", zap.Error(err))
                response.FailWithMessage("获取玩家统计列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetRoomConfigList 获取游戏房间配置列表（ddz_room_config 表）
// @Tags     DDZ游戏房间配置
// @Summary  获取游戏房间配置列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameRoomConfigSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/roomConfig/list [post]
func (api *DDZGameLogApi) GetRoomConfigList(c *gin.Context) {
        var req ddzReq.DDZGameRoomConfigSearch
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

        list, total, err := ddzGameLogService.GetRoomConfigList(req)
        if err != nil {
                global.GVA_LOG.Error("获取房间配置列表失败!", zap.Error(err))
                response.FailWithMessage("获取房间配置列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// CreateRoomConfig 创建游戏房间配置（ddz_room_config 表）
// @Tags     DDZ游戏房间配置
// @Summary  创建游戏房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameRoomConfigCreate  true  "房间配置"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/roomConfig/create [post]
func (api *DDZGameLogApi) CreateRoomConfig(c *gin.Context) {
        var req ddzReq.DDZGameRoomConfigCreate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzGameLogService.CreateRoomConfig(req)
        if err != nil {
                global.GVA_LOG.Error("创建房间配置失败!", zap.Error(err))
                response.FailWithMessage("创建房间配置失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("创建成功", c)
}

// UpdateRoomConfig 更新游戏房间配置（ddz_room_config 表）
// @Tags     DDZ游戏房间配置
// @Summary  更新游戏房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGameRoomConfigUpdate  true  "房间配置"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/roomConfig/update [put]
func (api *DDZGameLogApi) UpdateRoomConfig(c *gin.Context) {
        var req ddzReq.DDZGameRoomConfigUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzGameLogService.UpdateRoomConfig(req)
        if err != nil {
                global.GVA_LOG.Error("更新房间配置失败!", zap.Error(err))
                response.FailWithMessage("更新房间配置失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// DeleteRoomConfig 删除游戏房间配置（ddz_room_config 表）
// @Tags     DDZ游戏房间配置
// @Summary  删除游戏房间配置
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      map[string]interface{}  true  "房间配置ID"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/roomConfig/delete [delete]
func (api *DDZGameLogApi) DeleteRoomConfig(c *gin.Context) {
        var req struct {
                ID uint `json:"ID" binding:"required"`
        }
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzGameLogService.DeleteRoomConfig(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除房间配置失败!", zap.Error(err))
                response.FailWithMessage("删除房间配置失败", c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// RefreshRoomConfigCache 刷新房间配置缓存
// @Tags     DDZ游戏房间配置
// @Summary  刷新房间配置缓存
// @Security ApiKeyAuth
// @Produce  application/json
// @Success  200  {object}  response.Response{msg=string}
// @Router   /ddz/roomConfig/refresh-cache [post]
func (api *DDZGameLogApi) RefreshRoomConfigCache(c *gin.Context) {
        // 清除Redis共享缓存（游戏服务器和admin后台共用同一套缓存）
        // 游戏服务器下次查询时会从数据库重新加载最新数据
        if global.GVA_REDIS != nil {
                global.GVA_REDIS.Del(c.Request.Context(), "ddz:room_config:list")
                global.GVA_LOG.Info("Redis房间配置缓存已清除")
        }

        response.OkWithMessage("缓存刷新成功", c)
}

// GetSmsCodeList 获取短信验证码列表
// @Tags     DDZ短信记录
// @Summary  获取短信验证码列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZSmsCodeSearch  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/smsCode/list [post]
func (api *DDZGameLogApi) GetSmsCodeList(c *gin.Context) {
        var req ddzReq.DDZSmsCodeSearch
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

        list, total, err := ddzGameLogService.GetSmsCodeList(req)
        if err != nil {
                global.GVA_LOG.Error("获取短信验证码列表失败!", zap.Error(err))
                response.FailWithMessage("获取短信验证码列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// DeleteSmsCode 删除短信验证码
// @Tags     DDZ短信记录
// @Summary  删除短信验证码
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      map[string]interface{}  true  "短信验证码ID"
// @Success  200   {object}  response.Response{msg=string}
// @Router   /ddz/smsCode/delete [delete]
func (api *DDZGameLogApi) DeleteSmsCode(c *gin.Context) {
        var req struct {
                ID uint `json:"ID" binding:"required"`
        }
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzGameLogService.DeleteSmsCode(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除短信验证码失败!", zap.Error(err))
                response.FailWithMessage("删除短信验证码失败", c)
                return
        }

        response.OkWithMessage("删除成功", c)
}
