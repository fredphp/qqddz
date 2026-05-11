import adminService from '@/utils/adminRequest'

// 获取广告奖励列表
export const getAdRewardList = (data) => {
  return adminService({
    url: '/ddz/adReward/list',
    method: 'post',
    data
  })
}
