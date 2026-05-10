package ddz

import (
        v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
        "github.com/gin-gonic/gin"
)

type DDZGameDetailRouter struct{}

func (r *DDZGameDetailRouter) InitDDZGameDetailRouter(Router *gin.RouterGroup) {
        ddzGameDetailRouterWithoutRecord := Router.Group("ddz/gameDetail")

        ddzGameDetailApi := v1.ApiGroupApp.DDZApiGroup.DDZGameDetailApi
        {
                ddzGameDetailRouterWithoutRecord.POST("gamePlayerRecordList", ddzGameDetailApi.GetGamePlayerRecordList) // 获取游戏玩家记录列表
                ddzGameDetailRouterWithoutRecord.POST("gamePlayRecordList", ddzGameDetailApi.GetGamePlayRecordList)     // 获取出牌记录列表
        }
}
