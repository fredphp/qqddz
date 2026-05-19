package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/flipped-aurora/gin-vue-admin/server/middleware"
        "github.com/gin-gonic/gin"
)

type DDZRoomSublevelRouter struct{}

// InitDDZRoomSublevelRouter 初始化子分区路由
func (r *DDZRoomSublevelRouter) InitDDZRoomSublevelRouter(Router *gin.RouterGroup) {
        ddzRoomSublevelApi := v1.ApiGroupApp.DDZApiGroup.DDZRoomSublevelApi
        {
                // 需要权限的路由
                ddzRoomSublevelRouter := Router.Group("roomSublevel").Use(middleware.OperationRecord())
                ddzRoomSublevelRouter.Use(middleware.JWTAuth())
                {
                        ddzRoomSublevelRouter.GET("list", ddzRoomSublevelApi.GetRoomSublevelList)             // 获取子分区列表
                        ddzRoomSublevelRouter.GET("detail", ddzRoomSublevelApi.GetRoomSublevelByID)           // 获取子分区详情
                        ddzRoomSublevelRouter.POST("create", ddzRoomSublevelApi.CreateRoomSublevel)           // 创建子分区
                        ddzRoomSublevelRouter.PUT("update", ddzRoomSublevelApi.UpdateRoomSublevel)            // 更新子分区
                        ddzRoomSublevelRouter.DELETE("delete", ddzRoomSublevelApi.DeleteRoomSublevel)         // 删除子分区
                        ddzRoomSublevelRouter.POST("batchCreate", ddzRoomSublevelApi.BatchCreateDefaultSublevels) // 批量创建默认子分区
                        ddzRoomSublevelRouter.GET("byRoom", ddzRoomSublevelApi.GetRoomSublevelsByRoomConfig)  // 根据房间配置ID获取子分区
                        ddzRoomSublevelRouter.POST("refreshCache", ddzRoomSublevelApi.RefreshSublevelCache)   // 刷新缓存
                }
        }
}
