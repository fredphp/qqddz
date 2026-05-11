import adminService from '@/utils/adminRequest'

export const getPlayerOnlineList = (data) => {
  return adminService({
    url: '/ddz/statsDetail/playerOnlineList',
    method: 'post',
    data
  })
}
