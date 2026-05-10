package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZRobotConfigRouter struct{}

func (r *DDZRobotConfigRouter) InitDDZRobotConfigRouter(Router *gin.RouterGroup) {
	ddzRobotConfigRouter := Router.Group("ddz/robotConfig").Use(middleware.OperationRecord())
	ddzRobotConfigRouterWithoutRecord := Router.Group("ddz/robotConfig")

	ddzRobotConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZRobotConfigApi
	{
		// 配置管理（需要操作记录）
		ddzRobotConfigRouter.POST("create", ddzRobotConfigApi.CreateRobotConfig)      // 创建配置
		ddzRobotConfigRouter.PUT("update", ddzRobotConfigApi.UpdateRobotConfig)       // 更新配置
		ddzRobotConfigRouter.DELETE("delete", ddzRobotConfigApi.DeleteRobotConfig)    // 删除配置
		ddzRobotConfigRouter.POST("setDefault", ddzRobotConfigApi.SetDefaultConfig)   // 设置默认配置
	}
	{
		// 配置查询（不需要操作记录）
		ddzRobotConfigRouterWithoutRecord.POST("list", ddzRobotConfigApi.GetRobotConfigList)    // 获取配置列表
		ddzRobotConfigRouterWithoutRecord.GET("info", ddzRobotConfigApi.GetRobotConfigByID)     // 获取配置详情
		ddzRobotConfigRouterWithoutRecord.GET("default", ddzRobotConfigApi.GetDefaultConfig)    // 获取默认配置
		ddzRobotConfigRouterWithoutRecord.GET("all", ddzRobotConfigApi.GetAllConfigs)           // 获取所有启用的配置
	}
}
