package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZArenaRoundRecordRouter struct{}

func (r *DDZArenaRoundRecordRouter) InitDDZArenaRoundRecordRouter(Router *gin.RouterGroup) {
	ddzArenaRoundRecordRouterWithoutRecord := Router.Group("ddz/arenaRoundRecord")

	ddzArenaRoundRecordApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaRoundRecordApi
	{
		ddzArenaRoundRecordRouterWithoutRecord.POST("list", ddzArenaRoundRecordApi.GetArenaRoundRecordList) // 获取轮次记录列表
	}
}
