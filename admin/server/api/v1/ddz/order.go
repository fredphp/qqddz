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

type DDZOrderApi struct{}

var ddzOrderService = service.ServiceGroupApp.DDZServiceGroup.DDZRewardService

// GetRewardOrderList 获取奖励订单列表
// @Tags     DDZ奖励订单
// @Summary  分页获取奖励订单列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardOrderSearch                                  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取奖励订单列表"
// @Router   /ddz/rewardOrders/list [post]
func (api *DDZOrderApi) GetRewardOrderList(c *gin.Context) {
	var req ddzReq.DDZRewardOrderSearch
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

	list, total, err := ddzOrderService.GetRewardOrderList(req)
	if err != nil {
		global.GVA_LOG.Error("获取奖励订单列表失败!", zap.Error(err))
		response.FailWithMessage("获取奖励订单列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetRewardOrderDetail 获取奖励订单详情
// @Tags     DDZ奖励订单
// @Summary  获取奖励订单详情
// @Security ApiKeyAuth
// @Produce  application/json
// @Param    id   query     uint                     true  "订单ID"
// @Success  200  {object}  response.Response{data=ddz.DDZRewardOrder,msg=string}  "获取奖励订单详情"
// @Router   /ddz/rewardOrders/detail [get]
func (api *DDZOrderApi) GetRewardOrderDetail(c *gin.Context) {
	var req struct {
		ID uint `form:"id" binding:"required"`
	}
	err := c.ShouldBindQuery(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	order, err := ddzOrderService.GetRewardOrderByID(req.ID)
	if err != nil {
		global.GVA_LOG.Error("获取奖励订单详情失败!", zap.Error(err))
		response.FailWithMessage("获取奖励订单详情失败", c)
		return
	}

	response.OkWithDetailed(order, "获取成功", c)
}

// ShipRewardOrder 发货
// @Tags     DDZ奖励订单
// @Summary  订单发货
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardOrderShip   true  "发货信息"
// @Success  200   {object}  response.Response{msg=string}  "发货"
// @Router   /ddz/rewardOrders/ship [put]
func (api *DDZOrderApi) ShipRewardOrder(c *gin.Context) {
	var req ddzReq.DDZRewardOrderShip
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzOrderService.ShipRewardOrder(req)
	if err != nil {
		global.GVA_LOG.Error("发货失败!", zap.Error(err))
		response.FailWithMessage("发货失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("发货成功", c)
}

// CancelRewardOrder 取消订单
// @Tags     DDZ奖励订单
// @Summary  取消订单
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardOrderCancel   true  "取消信息"
// @Success  200   {object}  response.Response{msg=string}  "取消订单"
// @Router   /ddz/rewardOrders/cancel [put]
func (api *DDZOrderApi) CancelRewardOrder(c *gin.Context) {
	var req ddzReq.DDZRewardOrderCancel
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzOrderService.CancelRewardOrder(req)
	if err != nil {
		global.GVA_LOG.Error("取消订单失败!", zap.Error(err))
		response.FailWithMessage("取消订单失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("取消成功", c)
}
