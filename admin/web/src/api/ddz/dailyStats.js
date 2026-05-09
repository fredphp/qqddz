import service from '@/utils/request'

export const getDailyStatsList = (data) => {
  return service({
    url: '/ddz/statsDetail/dailyStatsList',
    method: 'post',
    data
  })
}
