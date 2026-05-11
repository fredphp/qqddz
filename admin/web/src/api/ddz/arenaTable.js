import adminService from '@/utils/adminRequest'

export const getArenaTableList = (data) => {
  return adminService({
    url: '/ddz/arenaTable/list',
    method: 'post',
    data
  })
}
