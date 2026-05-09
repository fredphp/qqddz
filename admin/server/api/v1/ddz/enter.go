package ddz

type ApiGroup struct {
        DDZPlayerApi
        DDZGameApi
        DDZStatsApi
        DDZUserAccountApi
        DDZGameLogApi
        DDZRewardApi
        DDZOrderApi
        DDZArenaRegistrationApi
        DDZConfigApi
        DDZArenaPeriodApi
        DDZRobotApi
        DDZRobotConfigApi
        DDZAdRewardApi       // 广告奖励日志API
        DDZArenaGoldLogApi   // 竞技场金币流水API
        DDZGoldLogApi        // 金币流水API
        // 新增API
        DDZArenaMatchConfigApi  // 比赛配置API
        DDZArenaSessionApi      // 会话API
        DDZArenaRoundRecordApi  // 轮次记录API
        DDZArenaSignupLogApi    // 报名日志API
        DDZArenaTableApi        // 桌号API
        DDZGameConfigApi        // 游戏配置API
        DDZGameDetailApi        // 游戏详情API
        DDZStatsDetailApi       // 统计详情API
        DDZTournamentApi        // 锦标赛API
        DDZSystemApi            // 系统API
}
