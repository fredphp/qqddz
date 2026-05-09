package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZArenaSignupLogRouter struct{}

func (r *DDZArenaSignupLogRouter) InitDDZArenaSignupLogRouter(Router *gin.RouterGroup) {
	ddzArenaSignupLogRouterWithoutRecord := Router.Group("ddz/arenaSignupLog")

	ddzArenaSignupLogApi := v1.ApiGroupApp.DDZApiGroup.DDZArenaSignupLogApi
	{
		ddzArenaSignupLogRouterWithoutRecord.POST("list", ddzArenaSignupLogApi.GetArenaSignupLogList) // 获取报名日志列表
	}
}
