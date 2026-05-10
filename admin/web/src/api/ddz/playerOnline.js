import service from '@/utils/request'

export const getPlayerOnlineList = (data) => {
  return service({
    url: '/ddz/statsDetail/playerOnlineList',
    method: 'post',
    data
  })
}
