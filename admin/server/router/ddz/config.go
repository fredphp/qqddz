package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/flipped-aurora/gin-vue-admin/server/middleware"
        "github.com/gin-gonic/gin"
)

type DDZConfigRouter struct{}

func (r *DDZConfigRouter) InitDDZConfigRouter(Router *gin.RouterGroup) {
        // 游戏配置路由 (ddz_game_configs 表)
        ddzGameConfigRouter := Router.Group("ddz/gameConfig").Use(middleware.OperationRecord())
        ddzGameConfigRouterWithoutRecord := Router.Group("ddz/gameConfig")

        ddzConfigApi := v1.ApiGroupApp.DDZApiGroup.DDZConfigApi
        {
                // 游戏配置 - 需要操作记录
                ddzGameConfigRouter.PUT("update", ddzConfigApi.UpdateGameConfig) // 更新游戏配置
        }
        {
                // 游戏配置 - 不需要操作记录
                ddzGameConfigRouterWithoutRecord.POST("list", ddzConfigApi.GetGameConfigList) // 分页获取游戏配置列表
        }
}
