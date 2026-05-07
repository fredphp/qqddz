package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZArenaPeriodRouter struct{}

func (r *DDZArenaPeriodRouter) InitDDZArenaPeriodRouter(Router *gin.RouterGroup) {
	ddzArenaPeriodRouter := Router.Group("ddz/arenaPeriod").Use(middleware.OperationRecord())
	ddzArenaPeriodRouterWithoutRecord := Router.Group("ddz/arenaPeriod")

	ddzArenaPeriodApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaPeriodApi
	{
		ddzArenaPeriodRouter.PUT("update", ddzArenaPeriodApi.UpdateArenaPeriod)     // 更新期号
		ddzArenaPeriodRouter.DELETE("delete", ddzArenaPeriodApi.DeleteArenaPeriod) // 删除期号
	}
	{
		ddzArenaPeriodRouterWithoutRecord.POST("list", ddzArenaPeriodApi.GetArenaPeriodList)         // 获取期号列表
		ddzArenaPeriodRouterWithoutRecord.GET("info", ddzArenaPeriodApi.GetArenaPeriodByID)          // 获取期号详情
		ddzArenaPeriodRouterWithoutRecord.POST("players", ddzArenaPeriodApi.GetArenaPeriodPlayers)   // 获取期号玩家列表
		ddzArenaPeriodRouterWithoutRecord.POST("signupLogs", ddzArenaPeriodApi.GetArenaPeriodSignupLogs) // 获取期号报名日志
		ddzArenaPeriodRouterWithoutRecord.GET("stats", ddzArenaPeriodApi.GetArenaPeriodStats)        // 获取期号统计
	}
}
