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
        DDZArenaParticipationService // 🔧【新增】参赛记录服务
        DDZRobotConfigService
        DDZRobotService
}
