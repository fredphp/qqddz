package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZGameRouter struct{}

func (r *DDZGameRouter) InitDDZGameRouter(Router *gin.RouterGroup) {
	ddzGameRouter := Router.Group("ddz/game")

	ddzGameApi := v1.ApiGroupApp.DDZApiGroup.DDZGameApi
	{
		ddzGameRouter.POST("list", ddzGameApi.GetGameRecordList)   // 分页获取游戏记录列表
		ddzGameRouter.GET("detail", ddzGameApi.GetGameRecordDetail) // 获取游戏记录详情
	}
}
