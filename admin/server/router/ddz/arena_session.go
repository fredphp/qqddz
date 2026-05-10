package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZArenaSessionRouter struct{}

func (r *DDZArenaSessionRouter) InitDDZArenaSessionRouter(Router *gin.RouterGroup) {
	ddzArenaSessionRouterWithoutRecord := Router.Group("ddz/arenaSession")

	ddzArenaSessionApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaSessionApi
	{
		ddzArenaSessionRouterWithoutRecord.POST("list", ddzArenaSessionApi.GetArenaSessionList) // 获取会话列表
	}
}
