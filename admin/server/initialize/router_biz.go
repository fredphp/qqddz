package initialize

import (
        "github.com/flipped-aurora/gin-vue-admin/server/router"
        "github.com/gin-gonic/gin"
)

// 占位方法，保证文件可以正确加载，避免go空变量检测报错，请勿删除。
func holder(routers ...*gin.RouterGroup) {
        _ = routers
        _ = router.RouterGroupApp
}

func initBizRouter(routers ...*gin.RouterGroup) {
        privateGroup := routers[0]
        publicGroup := routers[1]

        holder(publicGroup, privateGroup)

        // 注册斗地主路由
        ddzRouter := router.RouterGroupApp.DDZ
        {
                ddzRouter.InitDDZPlayerRouter(privateGroup)      // 斗地主玩家路由
                ddzRouter.InitDDZGameRouter(privateGroup)        // 斗地主游戏记录路由
                ddzRouter.InitDDZStatsRouter(privateGroup)       // 斗地主统计路由
                ddzRouter.InitDDZUserAccountRouter(privateGroup) // 斗地主用户账户路由
                ddzRouter.InitDDZGameLogRouter(privateGroup)     // 斗地主游戏日志路由
                ddzRouter.InitDDZRewardRouter(privateGroup)      // 斗地主奖励路由
                ddzRouter.InitDDZArenaRegistrationRouter(privateGroup) // 斗地主竞技场报名路由
                ddzRouter.InitDDZConfigRouter(privateGroup)      // 斗地主配置路由
                ddzRouter.InitDDZArenaPeriodRouter(privateGroup) // 斗地主期号管理路由
                ddzRouter.InitDDZRobotConfigRouter(privateGroup) // 斗地主机器人配置路由
                ddzRouter.InitDDZAdRewardRouter(privateGroup)    // 斗地主广告奖励日志路由
                ddzRouter.InitDDZArenaGoldLogRouter(privateGroup) // 斗地主竞技场金币流水路由
                ddzRouter.InitDDZGoldLogRouter(privateGroup)     // 斗地主金币流水路由
        }
}
