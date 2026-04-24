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

type DDZPlayerApi struct{}

var ddzPlayerService = service.ServiceGroupApp.DDZServiceGroup.DDZPlayerService

// CreatePlayer
// @Tags     DDZ玩家管理
// @Summary  创建玩家
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZPlayerCreate                                     true  "玩家信息"
// @Success  200   {object}  response.Response{data=ddzRes.DDZPlayerResponse,msg=string}  "创建玩家"
// @Router   /ddz/player/create [post]
func (api *DDZPlayerApi) CreatePlayer(c *gin.Context) {
        var req ddzReq.DDZPlayerCreate
        err := c.ShouldBindJSON(&req)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        player, err := ddzPlayerService.CreatePlayer(req)
        if err != nil {
                global.GVA_LOG.Error("创建玩家失败!", zap.Error(err))
                response.FailWithMessage("创建玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(player, "创建成功", c)
}

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

        err = ddzPlayerService.BanPlayer(req)
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

        err = ddzPlayerService.UnbanPlayer(req)
        if err != nil {
                global.GVA_LOG.Error("解封玩家失败!", zap.Error(err))
                response.FailWithMessage("解封玩家失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("解封成功", c)
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
