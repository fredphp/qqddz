import adminService from '@/utils/adminRequest'

export const getArenaSignupLogList = (data) => {
  return adminService({
    url: '/ddz/arenaSignupLog/list',
    method: 'post',
    data
  })
}
