package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/flipped-aurora/gin-vue-admin/server/middleware"
        "github.com/gin-gonic/gin"
)

type DDZPlayerRouter struct{}

func (r *DDZPlayerRouter) InitDDZPlayerRouter(Router *gin.RouterGroup) {
        ddzPlayerRouter := Router.Group("ddz/player").Use(middleware.OperationRecord())
        ddzPlayerRouterWithoutRecord := Router.Group("ddz/player")

        ddzPlayerApi := v1.ApiGroupApp.DDZApiGroup.DDZPlayerApi
        {
                ddzPlayerRouter.POST("create", ddzPlayerApi.CreatePlayer)           // 创建玩家
                ddzPlayerRouter.DELETE("delete", ddzPlayerApi.DeletePlayer)         // 删除玩家（根据ID）
                ddzPlayerRouter.DELETE("deleteByPlayerId", ddzPlayerApi.DeletePlayerByPlayerID) // 删除玩家（根据PlayerID）
                ddzPlayerRouter.POST("ban", ddzPlayerApi.BanPlayer)                 // 封禁玩家
                ddzPlayerRouter.POST("unban", ddzPlayerApi.UnbanPlayer)             // 解封玩家
                ddzPlayerRouter.PUT("update", ddzPlayerApi.UpdatePlayer)            // 更新玩家信息
                ddzPlayerRouter.POST("coins", ddzPlayerApi.UpdatePlayerCoins)       // 更新玩家金币
        }
        {
                ddzPlayerRouterWithoutRecord.POST("list", ddzPlayerApi.GetPlayerList) // 分页获取玩家列表
                ddzPlayerRouterWithoutRecord.GET("info", ddzPlayerApi.GetPlayerByID)  // 获取玩家信息
        }
}
