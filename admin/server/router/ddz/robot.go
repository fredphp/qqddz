package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZRobotRouter struct{}

func (r *DDZRobotRouter) InitDDZRobotRouter(Router *gin.RouterGroup) {
	ddzRobotRouter := Router.Group("ddz/robot").Use(middleware.OperationRecord())
	ddzRobotRouterWithoutRecord := Router.Group("ddz/robot")

	ddzRobotApi := v1.ApiGroupApp.DDZApiGroup.DDZRobotApi
	{
		// 机器人管理
		ddzRobotRouter.POST("level", ddzRobotApi.UpdateRobotLevel)             // 更新机器人等级
		ddzRobotRouter.POST("aiConfig/assign", ddzRobotApi.UpdateRobotAIConfig) // 分配AI配置
		ddzRobotRouter.POST("batch/status", ddzRobotApi.BatchUpdateRobotStatus) // 批量更新状态
		ddzRobotRouter.POST("releaseAll", ddzRobotApi.ReleaseAllRobots)         // 释放所有机器人

		// AI配置管理
		ddzRobotRouter.POST("aiConfig/create", ddzRobotApi.CreateAIConfig)    // 创建AI配置
		ddzRobotRouter.PUT("aiConfig/update", ddzRobotApi.UpdateAIConfig)     // 更新AI配置
		ddzRobotRouter.DELETE("aiConfig/delete", ddzRobotApi.DeleteAIConfig)  // 删除AI配置

		// 补位配置管理
		ddzRobotRouter.PUT("patcher/config", ddzRobotApi.UpdatePatcherConfig) // 更新补位配置

		// 不能夺冠配置管理
		ddzRobotRouter.PUT("noWin/config", ddzRobotApi.UpdateNoWinConfig)     // 更新不能夺冠配置
	}
	{
		// 机器人查询
		ddzRobotRouterWithoutRecord.POST("list", ddzRobotApi.GetRobotList)          // 获取机器人列表
		ddzRobotRouterWithoutRecord.GET("status", ddzRobotApi.GetRobotStatus)       // 获取机器人状态
		ddzRobotRouterWithoutRecord.GET("stats", ddzRobotApi.GetRobotStats)         // 获取机器人统计
		ddzRobotRouterWithoutRecord.POST("fillRecords", ddzRobotApi.GetFillRecords) // 获取补位记录

		// AI配置查询
		ddzRobotRouterWithoutRecord.POST("aiConfig/list", ddzRobotApi.GetAIConfigList)    // 获取AI配置列表
		ddzRobotRouterWithoutRecord.GET("aiConfig/info", ddzRobotApi.GetAIConfigByID)     // 获取AI配置详情

		// 补位配置查询
		ddzRobotRouterWithoutRecord.GET("patcher/config", ddzRobotApi.GetPatcherConfig)   // 获取补位配置

		// 不能夺冠配置查询
		ddzRobotRouterWithoutRecord.GET("noWin/config", ddzRobotApi.GetNoWinConfig)       // 获取不能夺冠配置
	}
}
