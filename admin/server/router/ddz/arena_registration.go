package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZArenaRegistrationRouter struct{}

// InitDDZArenaRegistrationRouter 初始化竞技场报名路由
func (r *DDZArenaRegistrationRouter) InitDDZArenaRegistrationRouter(Router *gin.RouterGroup) {
	ddzArenaRegistrationApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaRegistrationApi
	{
		// 竞技场报名相关接口（需要登录）
		arenaRouter := Router.Group("arena").Use(middleware.OperationRecord())
		{
			arenaRouter.POST("register", ddzArenaRegistrationApi.Register)                // 竞技场报名
			arenaRouter.POST("cancel", ddzArenaRegistrationApi.Cancel)                    // 取消报名
			arenaRouter.GET("status", ddzArenaRegistrationApi.GetStatus)                  // 获取报名状态
			arenaRouter.GET("list", ddzArenaRegistrationApi.GetArenaList)                 // 获取竞技场列表
			arenaRouter.POST("registration/list", ddzArenaRegistrationApi.GetRegistrationList) // 获取报名记录列表（管理后台用）
		}
	}
}
