package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZArenaTableRouter struct{}

func (r *DDZArenaTableRouter) InitDDZArenaTableRouter(Router *gin.RouterGroup) {
	ddzArenaTableRouterWithoutRecord := Router.Group("ddz/arenaTable")

	ddzArenaTableApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaTableApi
	{
		ddzArenaTableRouterWithoutRecord.POST("list", ddzArenaTableApi.GetArenaTableList) // 获取桌号列表
	}
}
