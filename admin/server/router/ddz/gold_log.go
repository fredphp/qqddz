package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZGoldLogRouter struct{}

func (r *DDZGoldLogRouter) InitDDZGoldLogRouter(Router *gin.RouterGroup) {
	ddzGoldLogRouter := Router.Group("ddz/goldLog")

	ddzGoldLogApi := v1.ApiGroupApp.DDZApiGroup.DDZGoldLogApi
	{
		ddzGoldLogRouter.POST("list", ddzGoldLogApi.GetGoldLogList) // 分页获取金币流水列表
	}

	ddzArenaCoinLogRouter := Router.Group("ddz/arenaCoinLog")
	{
		ddzArenaCoinLogRouter.POST("list", ddzGoldLogApi.GetArenaCoinLogList) // 分页获取竞技币流水列表
	}
}
