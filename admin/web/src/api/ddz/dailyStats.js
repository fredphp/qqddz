import adminService from '@/utils/adminRequest'

export const getDailyStatsList = (data) => {
  return adminService({
    url: '/ddz/statsDetail/dailyStatsList',
    method: 'post',
    data
  })
}
