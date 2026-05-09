package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/gin-gonic/gin"
)

type DDZSystemRouter struct{}

func (r *DDZSystemRouter) InitDDZSystemRouter(Router *gin.RouterGroup) {
	ddzSystemRouterWithoutRecord := Router.Group("ddz/system")

	ddzSystemApi := v1.ApiGroupApp.DDZApiGroup.DDZSystemApi
	{
		ddzSystemRouterWithoutRecord.POST("pendingGameDataList", ddzSystemApi.GetPendingGameDataList)         // 获取待处理数据列表
		ddzSystemRouterWithoutRecord.POST("writeQueueErrorLogList", ddzSystemApi.GetWriteQueueErrorLogList)   // 获取写入队列错误日志列表
	}
}
