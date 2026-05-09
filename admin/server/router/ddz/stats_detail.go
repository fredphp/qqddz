package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZStatsDetailRouter struct{}

func (r *DDZStatsDetailRouter) InitDDZStatsDetailRouter(Router *gin.RouterGroup) {
	ddzStatsDetailRouterWithoutRecord := Router.Group("ddz/statsDetail")

	ddzStatsDetailApi := v1.ApiGroupApp.DDZApiGroup.DDZStatsDetailApi
	{
		ddzStatsDetailRouterWithoutRecord.POST("dailyStatsList", ddzStatsDetailApi.GetDailyStatsList)       // 获取每日统计列表
		ddzStatsDetailRouterWithoutRecord.POST("leaderboardList", ddzStatsDetailApi.GetLeaderboardList)     // 获取排行榜列表
		ddzStatsDetailRouterWithoutRecord.POST("playerOnlineList", ddzStatsDetailApi.GetPlayerOnlineList)   // 获取在线玩家列表
		ddzStatsDetailRouterWithoutRecord.POST("roomPlayerList", ddzStatsDetailApi.GetRoomPlayerList)       // 获取房间玩家列表
	}
}
