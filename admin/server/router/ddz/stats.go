package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZStatsRouter struct{}

func (r *DDZStatsRouter) InitDDZStatsRouter(Router *gin.RouterGroup) {
	ddzStatsRouter := Router.Group("ddz/stats")

	ddzStatsApi := v1.ApiGroupApp.DDZApiGroup.DDZStatsApi
	{
		ddzStatsRouter.GET("overview", ddzStatsApi.GetOverviewStats)           // 获取概览统计
		ddzStatsRouter.POST("daily", ddzStatsApi.GetDailyStats)                // 获取每日统计
		ddzStatsRouter.POST("leaderboard", ddzStatsApi.GetLeaderboard)         // 获取排行榜
		ddzStatsRouter.POST("player", ddzStatsApi.GetPlayerStats)              // 获取玩家统计
		ddzStatsRouter.GET("chart/active", ddzStatsApi.GetDailyActiveChart)    // 获取每日活跃图表
		ddzStatsRouter.GET("chart/games", ddzStatsApi.GetDailyGamesChart)      // 获取每日游戏场次图表
	}
}
