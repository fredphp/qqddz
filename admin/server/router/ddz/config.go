package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/flipped-aurora/gin-vue-admin/server/middleware"
        "github.com/gin-gonic/gin"
)

type DDZConfigRouter struct{}

func (r *DDZConfigRouter) InitDDZConfigRouter(Router *gin.RouterGroup) {
        ddzRoomConfigRouter := Router.Group("ddz/roomConfig").Use(middleware.OperationRecord())
        ddzRoomConfigRouterWithoutRecord := Router.Group("ddz/roomConfig")

        ddzGameConfigRouter := Router.Group("ddz/gameConfig").Use(middleware.OperationRecord())
        ddzGameConfigRouterWithoutRecord := Router.Group("ddz/gameConfig")

        ddzConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZConfigApi
        {
                // 房间配置 - 需要操作记录
                ddzRoomConfigRouter.POST("create", ddzConfigApi.CreateRoomConfig)             // 创建房间配置
                ddzRoomConfigRouter.PUT("update", ddzConfigApi.UpdateRoomConfig)              // 更新房间配置
                ddzRoomConfigRouter.DELETE("delete", ddzConfigApi.DeleteRoomConfig)           // 删除房间配置
                ddzRoomConfigRouter.POST("refresh-cache", ddzConfigApi.RefreshRoomConfigCache) // 刷新房间配置缓存
                // 游戏配置 - 需要操作记录
                ddzGameConfigRouter.PUT("update", ddzConfigApi.UpdateGameConfig)              // 更新游戏配置
        }
        {
                // 房间配置 - 不需要操作记录
                ddzRoomConfigRouterWithoutRecord.POST("list", ddzConfigApi.GetRoomConfigList)         // 分页获取房间配置列表
                ddzRoomConfigRouterWithoutRecord.GET("bg-image-options", ddzConfigApi.GetBgImageOptions) // 获取背景图选项
                // 游戏配置 - 不需要操作记录
                ddzGameConfigRouterWithoutRecord.POST("list", ddzConfigApi.GetGameConfigList)         // 分页获取游戏配置列表
        }
}
