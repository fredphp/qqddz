import service from '@/utils/request'

export const getLeaderboardList = (data) => {
  return service({
    url: '/ddz/statsDetail/leaderboardList',
    method: 'post',
    data
  })
}
