package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZAdRewardRouter struct{}

func (r *DDZAdRewardRouter) InitDDZAdRewardRouter(Router *gin.RouterGroup) {
	ddzAdRewardRouter := Router.Group("ddz/adReward")

	ddzAdRewardApi := v1.ApiGroupApp.DDZApiGroup.DDZAdRewardApi
	{
		ddzAdRewardRouter.POST("list", ddzAdRewardApi.GetAdRewardList) // 分页获取广告奖励日志列表
	}
}
