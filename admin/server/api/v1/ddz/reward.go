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

type DDZRewardApi struct{}

var ddzRewardService = service.ServiceGroupApp.DDZServiceGroup.DDZRewardService

// GetRewardGoodsList 获取奖励商品列表
// @Tags     DDZ奖励商品
// @Summary  分页获取奖励商品列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardGoodsSearch                                  true  "分页参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}  "分页获取奖励商品列表"
// @Router   /ddz/rewardGoods/list [post]
func (api *DDZRewardApi) GetRewardGoodsList(c *gin.Context) {
	var req ddzReq.DDZRewardGoodsSearch
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

	list, total, err := ddzRewardService.GetRewardGoodsList(req)
	if err != nil {
		global.GVA_LOG.Error("获取奖励商品列表失败!", zap.Error(err))
		response.FailWithMessage("获取奖励商品列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetRewardGoodsDetail 获取奖励商品详情
// @Tags     DDZ奖励商品
// @Summary  获取奖励商品详情
// @Security ApiKeyAuth
// @Produce  application/json
// @Param    id   query     uint                     true  "商品ID"
// @Success  200  {object}  response.Response{data=ddz.DDZRewardGoods,msg=string}  "获取奖励商品详情"
// @Router   /ddz/rewardGoods/detail [get]
func (api *DDZRewardApi) GetRewardGoodsDetail(c *gin.Context) {
	var req struct {
		ID uint `form:"id" binding:"required"`
	}
	err := c.ShouldBindQuery(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	goods, err := ddzRewardService.GetRewardGoodsByID(req.ID)
	if err != nil {
		global.GVA_LOG.Error("获取奖励商品详情失败!", zap.Error(err))
		response.FailWithMessage("获取奖励商品详情失败", c)
		return
	}

	response.OkWithDetailed(goods, "获取成功", c)
}

// CreateRewardGoods 创建奖励商品
// @Tags     DDZ奖励商品
// @Summary  创建奖励商品
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardGoodsCreate   true  "商品信息"
// @Success  200   {object}  response.Response{msg=string}  "创建奖励商品"
// @Router   /ddz/rewardGoods/create [post]
func (api *DDZRewardApi) CreateRewardGoods(c *gin.Context) {
	var req ddzReq.DDZRewardGoodsCreate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRewardService.CreateRewardGoods(req)
	if err != nil {
		global.GVA_LOG.Error("创建奖励商品失败!", zap.Error(err))
		response.FailWithMessage("创建奖励商品失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateRewardGoods 更新奖励商品
// @Tags     DDZ奖励商品
// @Summary  更新奖励商品
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZRewardGoodsUpdate   true  "商品信息"
// @Success  200   {object}  response.Response{msg=string}  "更新奖励商品"
// @Router   /ddz/rewardGoods/update [put]
func (api *DDZRewardApi) UpdateRewardGoods(c *gin.Context) {
	var req ddzReq.DDZRewardGoodsUpdate
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRewardService.UpdateRewardGoods(req)
	if err != nil {
		global.GVA_LOG.Error("更新奖励商品失败!", zap.Error(err))
		response.FailWithMessage("更新奖励商品失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// DeleteRewardGoods 删除奖励商品
// @Tags     DDZ奖励商品
// @Summary  删除奖励商品
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    id   body      request.GetById              true  "商品ID"
// @Success  200  {object}  response.Response{msg=string}  "删除奖励商品"
// @Router   /ddz/rewardGoods/delete [delete]
func (api *DDZRewardApi) DeleteRewardGoods(c *gin.Context) {
	var req struct {
		ID uint `json:"id" binding:"required"`
	}
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	err = ddzRewardService.DeleteRewardGoods(req.ID)
	if err != nil {
		global.GVA_LOG.Error("删除奖励商品失败!", zap.Error(err))
		response.FailWithMessage("删除奖励商品失败", c)
		return
	}

	response.OkWithMessage("删除成功", c)
}
