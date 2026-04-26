package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/flipped-aurora/gin-vue-admin/server/middleware"
        "github.com/gin-gonic/gin"
)

type DDZConfigRouter struct{}

func (r *DDZConfigRouter) InitDDZConfigRouter(Router *gin.RouterGroup) {
        // 菜单房间配置路由 (ddz_room_configs 表)
        ddzRoomConfigsRouter := Router.Group("ddz/roomConfigs").Use(middleware.OperationRecord())
        ddzRoomConfigsRouterWithoutRecord := Router.Group("ddz/roomConfigs")

        // 游戏配置路由 (ddz_game_configs 表)
        ddzGameConfigRouter := Router.Group("ddz/gameConfig").Use(middleware.OperationRecord())
        ddzGameConfigRouterWithoutRecord := Router.Group("ddz/gameConfig")

        ddzConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZConfigApi
        {
                // 菜单房间配置 - 需要操作记录 (ddz_room_configs 表)
                ddzRoomConfigsRouter.POST("create", ddzConfigApi.CreateRoomConfig)             // 创建房间配置
                ddzRoomConfigsRouter.PUT("update", ddzConfigApi.UpdateRoomConfig)              // 更新房间配置
                ddzRoomConfigsRouter.DELETE("delete", ddzConfigApi.DeleteRoomConfig)           // 删除房间配置
                ddzRoomConfigsRouter.POST("refresh-cache", ddzConfigApi.RefreshRoomConfigCache) // 刷新房间配置缓存
                // 游戏配置 - 需要操作记录
                ddzGameConfigRouter.PUT("update", ddzConfigApi.UpdateGameConfig)              // 更新游戏配置
        }
        {
                // 菜单房间配置 - 不需要操作记录 (ddz_room_configs 表)
                ddzRoomConfigsRouterWithoutRecord.POST("list", ddzConfigApi.GetRoomConfigList)         // 分页获取房间配置列表
                ddzRoomConfigsRouterWithoutRecord.GET("bg-image-options", ddzConfigApi.GetBgImageOptions) // 获取背景图选项
                // 游戏配置 - 不需要操作记录
                ddzGameConfigRouterWithoutRecord.POST("list", ddzConfigApi.GetGameConfigList)         // 分页获取游戏配置列表
        }
}
