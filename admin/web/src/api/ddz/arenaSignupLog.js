import service from '@/utils/request'

export const getArenaSignupLogList = (data) => {
  return service({
    url: '/ddz/arenaSignupLog/list',
    method: 'post',
    data
  })
}
