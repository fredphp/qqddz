package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZGameConfigRouter struct{}

func (r *DDZGameConfigRouter) InitDDZGameConfigRouter(Router *gin.RouterGroup) {
	ddzGameConfigRouter := Router.Group("ddz/gameConfig").Use(middleware.OperationRecord())
	ddzGameConfigRouterWithoutRecord := Router.Group("ddz/gameConfig")

	ddzGameConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZGameConfigApi
	{
		ddzGameConfigRouter.POST("create", ddzGameConfigApi.CreateGameConfig)   // 创建游戏配置
		ddzGameConfigRouter.PUT("update", ddzGameConfigApi.UpdateGameConfig)    // 更新游戏配置
		ddzGameConfigRouter.DELETE("delete", ddzGameConfigApi.DeleteGameConfig) // 删除游戏配置
	}
	{
		ddzGameConfigRouterWithoutRecord.POST("list", ddzGameConfigApi.GetGameConfigList) // 获取游戏配置列表
	}
}
