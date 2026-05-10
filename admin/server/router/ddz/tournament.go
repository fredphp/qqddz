package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZTournamentRouter struct{}

func (r *DDZTournamentRouter) InitDDZTournamentRouter(Router *gin.RouterGroup) {
	ddzTournamentRouterWithoutRecord := Router.Group("ddz/tournament")

	ddzTournamentApi := v1.ApiGroupApp.DDZApiGroup.DDZTournamentApi
	{
		ddzTournamentRouterWithoutRecord.POST("roundList", ddzTournamentApi.GetTournamentRoundList)             // 获取锦标赛轮次列表
		ddzTournamentRouterWithoutRecord.POST("eliminationList", ddzTournamentApi.GetTournamentEliminationList) // 获取锦标赛淘汰记录列表
	}
}
