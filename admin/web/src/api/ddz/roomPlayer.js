import service from '@/utils/request'

export const getRoomPlayerList = (data) => {
  return service({
    url: '/ddz/statsDetail/roomPlayerList',
    method: 'post',
    data
  })
}
