package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZArenaMatchConfigRouter struct{}

func (r *DDZArenaMatchConfigRouter) InitDDZArenaMatchConfigRouter(Router *gin.RouterGroup) {
	ddzArenaMatchConfigRouter := Router.Group("ddz/arenaMatchConfig").Use(middleware.OperationRecord())
	ddzArenaMatchConfigRouterWithoutRecord := Router.Group("ddz/arenaMatchConfig")

	ddzArenaMatchConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaMatchConfigApi
	{
		ddzArenaMatchConfigRouter.POST("create", ddzArenaMatchConfigApi.CreateArenaMatchConfig)   // 创建比赛配置
		ddzArenaMatchConfigRouter.PUT("update", ddzArenaMatchConfigApi.UpdateArenaMatchConfig)    // 更新比赛配置
		ddzArenaMatchConfigRouter.DELETE("delete", ddzArenaMatchConfigApi.DeleteArenaMatchConfig) // 删除比赛配置
	}
	{
		ddzArenaMatchConfigRouterWithoutRecord.POST("list", ddzArenaMatchConfigApi.GetArenaMatchConfigList) // 获取比赛配置列表
	}
}
