package ddz

type RouterGroup struct {
        DDZPlayerRouter
        DDZGameRouter
        DDZStatsRouter
        DDZUserAccountRouter
        DDZGameLogRouter
        DDZRewardRouter
        DDZArenaRegistrationRouter
        DDZConfigRouter
        DDZArenaPeriodRouter
        DDZRobotRouter
        DDZRobotConfigRouter
        DDZAdRewardRouter      // 广告奖励日志路由
        DDZArenaGoldLogRouter  // 竞技场金币流水路由
        DDZGoldLogRouter       // 金币流水路由
        // 新增路由
        DDZArenaMatchConfigRouter  // 比赛配置路由
        DDZArenaSessionRouter      // 会话路由
        DDZArenaRoundRecordRouter  // 轮次记录路由
        DDZArenaSignupLogRouter    // 报名日志路由
        DDZArenaTableRouter        // 桌号路由
        DDZGameConfigRouter        // 游戏配置路由
        DDZGameDetailRouter        // 游戏详情路由
        DDZStatsDetailRouter       // 统计详情路由
        DDZTournamentRouter        // 锦标赛路由
        DDZSystemRouter            // 系统路由
}
