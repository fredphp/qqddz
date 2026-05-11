import adminService from '@/utils/adminRequest'

export const getLeaderboardList = (data) => {
  return adminService({
    url: '/ddz/statsDetail/leaderboardList',
    method: 'post',
    data
  })
}
