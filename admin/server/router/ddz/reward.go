package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZRewardRouter struct{}

func (r *DDZRewardRouter) InitDDZRewardRouter(Router *gin.RouterGroup) {
	// 奖励商品路由
	ddzRewardGoodsRouter := Router.Group("ddz/rewardGoods").Use(middleware.OperationRecord())
	ddzRewardGoodsRouterWithoutRecord := Router.Group("ddz/rewardGoods")

	// 奖励订单路由
	ddzRewardOrderRouter := Router.Group("ddz/rewardOrders").Use(middleware.OperationRecord())
	ddzRewardOrderRouterWithoutRecord := Router.Group("ddz/rewardOrders")

	ddzRewardApi := v1.ApiGroupApp.DDZApiGroup.DDZRewardApi
	ddzOrderApi := v1.ApiGroupApp.DDZApiGroup.DDZOrderApi
	{
		// 奖励商品 - 需要操作记录
		ddzRewardGoodsRouter.POST("create", ddzRewardApi.CreateRewardGoods)   // 创建奖励商品
		ddzRewardGoodsRouter.PUT("update", ddzRewardApi.UpdateRewardGoods)    // 更新奖励商品
		ddzRewardGoodsRouter.DELETE("delete", ddzRewardApi.DeleteRewardGoods) // 删除奖励商品
	}
	{
		// 奖励商品 - 不需要操作记录
		ddzRewardGoodsRouterWithoutRecord.POST("list", ddzRewardApi.GetRewardGoodsList)   // 分页获取奖励商品列表
		ddzRewardGoodsRouterWithoutRecord.GET("detail", ddzRewardApi.GetRewardGoodsDetail) // 获取奖励商品详情
	}
	{
		// 奖励订单 - 需要操作记录
		ddzRewardOrderRouter.PUT("ship", ddzOrderApi.ShipRewardOrder)       // 发货
		ddzRewardOrderRouter.PUT("cancel", ddzOrderApi.CancelRewardOrder)   // 取消订单
	}
	{
		// 奖励订单 - 不需要操作记录
		ddzRewardOrderRouterWithoutRecord.POST("list", ddzOrderApi.GetRewardOrderList)     // 分页获取奖励订单列表
		ddzRewardOrderRouterWithoutRecord.GET("detail", ddzOrderApi.GetRewardOrderDetail)  // 获取奖励订单详情
	}
}
