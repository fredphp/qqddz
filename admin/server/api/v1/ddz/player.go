package ddz

import (
        "fmt"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        "github.com/flipped-aurora/gin-vue-admin/server/service"
        "github.com/flipped-aurora/gin-vue-admin/server/utils"
        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
)

type DDZPlayerApi struct{}

var ddzPlayerService = service.ServiceGroupApp.DDZServiceGroup.DDZPlayerService

// DeletePlayer
// @Tags     DDZ玩家管理
// @Summary  删除玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerDelete        true  "玩家ID"
// @Success  200   {object}  response.Response{msg=string}  "删除玩家"
// @Router   /ddz/player/delete [delete]
func (api *DDZPlayerApi) DeletePlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerDelete
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.DeletePlayer(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除玩家失败!", zap.Error(err))
                response.FailWithMessage("删除玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// DeletePlayerByPlayerID
// @Tags     DDZ玩家管理
// @Summary  根据PlayerID删除玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerDeleteByPlayerID  true  "玩家PlayerID"
// @Success  200   {object}  response.Response{msg=string}  "删除玩家"
// @Router   /ddz/player/deleteByPlayerId [delete]
func (api *DDZPlayerApi) DeletePlayerByPlayerID(c *gin.Context) {
        var req ddzReq.DDZPlayerDeleteByPlayerID
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.DeletePlayerByPlayerID(req.PlayerID)
        if err != nil {
                global.GVA_LOG.Error("删除玩家失败!", zap.Error(err))
                response.FailWithMessage("删除玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// GetPlayerList
// @Tags     DDZ玩家管理
// @Summary  分页获取玩家列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerSearch                                     true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取玩家列表"
// @Router   /ddz/player/list [post]
func (api *DDZPlayerApi) GetPlayerList(c *gin.Context) {
        var req ddzReq.DDZPlayerSearch
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

        list, total, err := ddzPlayerService.GetPlayerList(req)
        if err != nil {
                global.GVA_LOG.Error("获取玩家列表失败!", zap.Error(err))
                response.FailWithMessage("获取玩家列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetPlayerByID
// @Tags     DDZ玩家管理
// @Summary  根据ID获取玩家信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   query     uint                                               true  "玩家ID"
// @Success  200  {object}  response.Response{data=ddzRes.DDZPlayerResponse,msg=string}  "获取玩家信息"
// @Router   /ddz/player/info [get]
func (api *DDZPlayerApi) GetPlayerByID(c *gin.Context) {
        id := c.Query("id")
        if id == "" {
                response.FailWithMessage("玩家ID不能为空", c)
                return
        }

        playerID := utils.StringToUint(id)
        player, err := ddzPlayerService.GetPlayerByID(playerID)
        if err != nil {
                global.GVA_LOG.Error("获取玩家信息失败!", zap.Error(err))
                response.FailWithMessage("获取玩家信息失败", c)
                return
        }

        response.OkWithDetailed(player, "获取成功", c)
}

// BanPlayer
// @Tags     DDZ玩家管理
// @Summary  封禁玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerBan          true  "封禁信息"
// @Success  200   {object}  response.Response{msg=string}  "封禁玩家"
// @Router   /ddz/player/ban [post]
func (api *DDZPlayerApi) BanPlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerBan
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 获取操作人信息
        operatorID := utils.GetUserID(c)
        operatorName := utils.GetUserName(c)

        err = ddzPlayerService.BanPlayer(req, operatorID, operatorName)
        if err != nil {
                global.GVA_LOG.Error("封禁玩家失败!", zap.Error(err))
                response.FailWithMessage("封禁玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("封禁成功", c)
}

// UnbanPlayer
// @Tags     DDZ玩家管理
// @Summary  解封玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerUnban        true  "解封信息"
// @Success  200   {object}  response.Response{msg=string}  "解封玩家"
// @Router   /ddz/player/unban [post]
func (api *DDZPlayerApi) UnbanPlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerUnban
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 获取操作人信息
        operatorID := utils.GetUserID(c)
        operatorName := utils.GetUserName(c)

        err = ddzPlayerService.UnbanPlayer(req, operatorID, operatorName)
        if err != nil {
                global.GVA_LOG.Error("解封玩家失败!", zap.Error(err))
                response.FailWithMessage("解封玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("解封成功", c)
}

// FreezePlayer
// @Tags     DDZ玩家管理
// @Summary  冻结玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerFreeze       true  "冻结信息"
// @Success  200   {object}  response.Response{msg=string}  "冻结玩家"
// @Router   /ddz/player/freeze [post]
func (api *DDZPlayerApi) FreezePlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerFreeze
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 获取操作人信息
        operatorID := utils.GetUserID(c)
        operatorName := utils.GetUserName(c)

        err = ddzPlayerService.FreezePlayer(req, operatorID, operatorName)
        if err != nil {
                global.GVA_LOG.Error("冻结玩家失败!", zap.Error(err))
                response.FailWithMessage("冻结玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("冻结成功", c)
}

// UnfreezePlayer
// @Tags     DDZ玩家管理
// @Summary  解冻玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerUnfreeze     true  "解冻信息"
// @Success  200   {object}  response.Response{msg=string}  "解冻玩家"
// @Router   /ddz/player/unfreeze [post]
func (api *DDZPlayerApi) UnfreezePlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerUnfreeze
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 获取操作人信息
        operatorID := utils.GetUserID(c)
        operatorName := utils.GetUserName(c)

        err = ddzPlayerService.UnfreezePlayer(req, operatorID, operatorName)
        if err != nil {
                global.GVA_LOG.Error("解冻玩家失败!", zap.Error(err))
                response.FailWithMessage("解冻玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("解冻成功", c)
}

// GetPlayerStatusLogs
// @Tags     DDZ玩家管理
// @Summary  获取玩家状态变更日志
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerStatusLogSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取玩家状态变更日志"
// @Router   /ddz/player/statusLogs [post]
func (api *DDZPlayerApi) GetPlayerStatusLogs(c *gin.Context) {
        var req ddzReq.DDZPlayerStatusLogSearch
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

        list, total, err := ddzPlayerService.GetPlayerStatusLogs(req)
        if err != nil {
                global.GVA_LOG.Error("获取状态日志失败!", zap.Error(err))
                response.FailWithMessage("获取状态日志失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// UpdatePlayer
// @Tags     DDZ玩家管理
// @Summary  更新玩家信息
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerUpdate       true  "玩家信息"
// @Success  200   {object}  response.Response{msg=string}  "更新玩家信息"
// @Router   /ddz/player/update [put]
func (api *DDZPlayerApi) UpdatePlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.UpdatePlayer(req)
        if err != nil {
                global.GVA_LOG.Error("更新玩家信息失败!", zap.Error(err))
                response.FailWithMessage("更新玩家信息失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// UpdatePlayerCurrency
// @Tags     DDZ玩家管理
// @Summary  更新玩家货币
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerCurrencyUpdate  true  "货币更新信息"
// @Success  200   {object}  response.Response{msg=string}  "更新玩家货币"
// @Router   /ddz/player/currency [post]
func (api *DDZPlayerApi) UpdatePlayerCurrency(c *gin.Context) {
        var req ddzReq.DDZPlayerCurrencyUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.UpdatePlayerCurrency(req)
        if err != nil {
                global.GVA_LOG.Error("更新玩家货币失败!", zap.Error(err))
                response.FailWithMessage("更新玩家货币失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// UpdatePlayerCoins
// @Tags     DDZ玩家管理
// @Summary  更新玩家金币
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerCoinsUpdate  true  "金币更新信息"
// @Success  200   {object}  response.Response{msg=string}  "更新玩家金币"
// @Router   /ddz/player/coins [post]
func (api *DDZPlayerApi) UpdatePlayerCoins(c *gin.Context) {
        var req ddzReq.DDZPlayerCoinsUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.UpdatePlayerCoins(req)
        if err != nil {
                global.GVA_LOG.Error("更新玩家金币失败!", zap.Error(err))
                response.FailWithMessage("更新玩家金币失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// UpdatePlayerArenaCoin
// @Tags     DDZ玩家管理
// @Summary  更新玩家竞技币
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerArenaCoinUpdate  true  "竞技币更新信息"
// @Success  200   {object}  response.Response{msg=string}  "更新玩家竞技币"
// @Router   /ddz/player/arenaCoin [post]
func (api *DDZPlayerApi) UpdatePlayerArenaCoin(c *gin.Context) {
        var req ddzReq.DDZPlayerArenaCoinUpdate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err = ddzPlayerService.UpdatePlayerArenaCoin(req)
        if err != nil {
                global.GVA_LOG.Error("更新玩家竞技币失败!", zap.Error(err))
                response.FailWithMessage("更新玩家竞技币失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// GetCoinLogList
// @Tags     DDZ玩家管理
// @Summary  获取货币流水日志
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZCoinLogSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "获取货币流水日志"
// @Router   /ddz/player/coinLogs [post]
func (api *DDZPlayerApi) GetCoinLogList(c *gin.Context) {
        var req ddzReq.DDZCoinLogSearch
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

        list, total, err := ddzPlayerService.GetCoinLogList(req)
        if err != nil {
                global.GVA_LOG.Error("获取货币流水失败!", zap.Error(err))
                response.FailWithMessage("获取货币流水失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GenerateRobots
// @Tags     DDZ玩家管理
// @Summary  批量生成机器人玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGenerateRobots  true  "生成参数"
// @Success  200   {object}  response.Response{data=ddzRes.DDZGenerateRobotsResponse,msg=string}  "生成机器人"
// @Router   /ddz/player/generateRobots [post]
func (api *DDZPlayerApi) GenerateRobots(c *gin.Context) {
        var req ddzReq.DDZGenerateRobots
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 限制生成数量为1-20个
        if req.Count < 1 || req.Count > 20 {
                response.FailWithMessage("生成数量必须在1-20之间", c)
                return
        }

        result, err := ddzPlayerService.GenerateRobots(req.Count)
        if err != nil {
                global.GVA_LOG.Error("生成机器人失败!", zap.Error(err))
                response.FailWithMessage("生成机器人失败: "+err.Error(), c)
                return
        }

        global.GVA_LOG.Info("机器人批量生成完成",
                zap.Int("successCount", result.SuccessCount),
                zap.Int("failedCount", result.FailedCount))

        response.OkWithDetailed(result, fmt.Sprintf("成功生成 %d 个机器人", result.SuccessCount), c)
}
