package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZArenaGoldLogRouter struct{}

func (r *DDZArenaGoldLogRouter) InitDDZArenaGoldLogRouter(Router *gin.RouterGroup) {
	ddzArenaGoldLogRouter := Router.Group("ddz/arenaGoldLog")

	ddzArenaGoldLogApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaGoldLogApi
	{
		ddzArenaGoldLogRouter.POST("list", ddzArenaGoldLogApi.GetArenaGoldLogList) // 分页获取竞技场金币流水列表
	}
}
