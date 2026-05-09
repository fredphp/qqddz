import service from '@/utils/request'

// 获取广告奖励列表
export const getAdRewardList = (data) => {
  return service({
    url: '/ddz/adReward/list',
    method: 'post',
    data
  })
}
