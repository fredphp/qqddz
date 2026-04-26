package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZConfigRouter struct{}

func (r *DDZConfigRouter) InitDDZConfigRouter(Router *gin.RouterGroup) {
	ddzConfigRouter := Router.Group("ddz/config").Use(middleware.OperationRecord())
	ddzConfigRouterWithoutRecord := Router.Group("ddz/config")

	ddzConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZConfigApi
	{
		ddzConfigRouter.POST("room/create", ddzConfigApi.CreateRoomConfig)             // 创建房间配置
		ddzConfigRouter.PUT("room/update", ddzConfigApi.UpdateRoomConfig)              // 更新房间配置
		ddzConfigRouter.DELETE("room/delete", ddzConfigApi.DeleteRoomConfig)           // 删除房间配置
		ddzConfigRouter.POST("room/refresh-cache", ddzConfigApi.RefreshRoomConfigCache) // 刷新房间配置缓存
		ddzConfigRouter.PUT("game/update", ddzConfigApi.UpdateGameConfig)              // 更新游戏配置
	}
	{
		ddzConfigRouterWithoutRecord.POST("room/list", ddzConfigApi.GetRoomConfigList)         // 分页获取房间配置列表
		ddzConfigRouterWithoutRecord.GET("room/bg-image-options", ddzConfigApi.GetBgImageOptions) // 获取背景图选项
		ddzConfigRouterWithoutRecord.POST("game/list", ddzConfigApi.GetGameConfigList)         // 分页获取游戏配置列表
	}
}
