import service from '@/utils/request'

// ==================== 广告奖励日志 ====================

// 获取广告奖励日志列表
export const getAdRewardList = (data) => {
  return service({
    url: '/ddz/adReward/list',
    method: 'post',
    data
  })
}

// ==================== 竞技场金币流水 ====================

// 获取竞技场金币流水列表
export const getArenaGoldLogList = (data) => {
  return service({
    url: '/ddz/arenaGoldLog/list',
    method: 'post',
    data
  })
}

// ==================== 金币流水 ====================

// 获取金币流水列表
export const getGoldLogList = (data) => {
  return service({
    url: '/ddz/goldLog/list',
    method: 'post',
    data
  })
}

// ==================== 竞技币流水 ====================

// 获取竞技币流水列表
export const getArenaCoinLogList = (data) => {
  return service({
    url: '/ddz/arenaCoinLog/list',
    method: 'post',
    data
  })
}
