import adminService from '@/utils/adminRequest'

export const getRoomPlayerList = (data) => {
  return adminService({
    url: '/ddz/statsDetail/roomPlayerList',
    method: 'post',
    data
  })
}
