package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZGameLogRouter struct{}

func (r *DDZGameLogRouter) InitDDZGameLogRouter(Router *gin.RouterGroup) {
	ddzGameLogRouter := Router.Group("ddz").Use(middleware.OperationRecord())
	ddzGameLogRouterWithoutRecord := Router.Group("ddz")

	ddzGameLogApi := v1.ApiGroupApp.DDZApiGroup.DDZGameLogApi
	{
		// 游戏记录
		ddzGameLogRouter.DELETE("gameRecord/delete", ddzGameLogApi.DeleteGameRecord)
		// 房间配置
		ddzGameLogRouter.POST("roomConfig/create", ddzGameLogApi.CreateRoomConfig)
		ddzGameLogRouter.PUT("roomConfig/update", ddzGameLogApi.UpdateRoomConfig)
		ddzGameLogRouter.DELETE("roomConfig/delete", ddzGameLogApi.DeleteRoomConfig)
		ddzGameLogRouter.POST("roomConfig/refresh-cache", ddzGameLogApi.RefreshRoomConfigCache)
		// 短信验证码
		ddzGameLogRouter.DELETE("smsCode/delete", ddzGameLogApi.DeleteSmsCode)
	}
	{
		// 游戏记录
		ddzGameLogRouterWithoutRecord.POST("gameRecord/list", ddzGameLogApi.GetGameRecordList)
		ddzGameLogRouterWithoutRecord.GET("gameRecord/detail", ddzGameLogApi.GetGameRecordDetail)
		// 游戏日志
		ddzGameLogRouterWithoutRecord.POST("log/bid/list", ddzGameLogApi.GetBidLogList)
		ddzGameLogRouterWithoutRecord.POST("log/deal/list", ddzGameLogApi.GetDealLogList)
		ddzGameLogRouterWithoutRecord.POST("log/play/list", ddzGameLogApi.GetPlayLogList)
		// 玩家统计
		ddzGameLogRouterWithoutRecord.POST("playerStat/list", ddzGameLogApi.GetPlayerStatList)
		// 房间配置
		ddzGameLogRouterWithoutRecord.POST("roomConfig/list", ddzGameLogApi.GetRoomConfigList)
		// 短信验证码
		ddzGameLogRouterWithoutRecord.POST("smsCode/list", ddzGameLogApi.GetSmsCodeList)
	}
}
