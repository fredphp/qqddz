import adminService from '@/utils/adminRequest'

// ==================== 广告奖励日志 ====================

// 获取广告奖励日志列表
export const getAdRewardList = (data) => {
  return adminService({
    url: '/ddz/adReward/list',
    method: 'post',
    data
  })
}

// ==================== 竞技场金币流水 ====================

// 获取竞技场金币流水列表
export const getArenaGoldLogList = (data) => {
  return adminService({
    url: '/ddz/arenaGoldLog/list',
    method: 'post',
    data
  })
}

// ==================== 金币流水 ====================

// 获取金币流水列表
export const getGoldLogList = (data) => {
  return adminService({
    url: '/ddz/goldLog/list',
    method: 'post',
    data
  })
}

// ==================== 竞技币流水 ====================

// 获取竞技币流水列表
export const getArenaCoinLogList = (data) => {
  return adminService({
    url: '/ddz/arenaCoinLog/list',
    method: 'post',
    data
  })
}
