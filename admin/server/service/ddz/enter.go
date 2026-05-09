package ddz

type ServiceGroup struct {
        DDZPlayerService
        DDZGameService
        DDZStatsService
        DDZConfigService
        DDZUserAccountService
        DDZGameLogService
        DDZRewardService
        DDZArenaRegistrationService
        DDZArenaPeriodService
        DDZArenaParticipationService // 参赛记录服务
        DDZRobotConfigService
        DDZRobotService
        DDZAdRewardService      // 广告奖励日志服务
        DDZArenaGoldLogService  // 竞技场金币流水服务
        DDZGoldLogService       // 金币流水服务
        // 新增服务
        DDZArenaMatchConfigService  // 比赛配置服务
        DDZArenaSessionService      // 会话服务
        DDZArenaRoundRecordService  // 轮次记录服务
        DDZArenaSignupLogService    // 报名日志服务
        DDZArenaTableService        // 桌号服务
        DDZGameConfigService        // 游戏配置服务
        DDZGameDetailService        // 游戏详情服务
        DDZTournamentService        // 锦标赛服务
        DDZSystemService            // 系统服务
}
