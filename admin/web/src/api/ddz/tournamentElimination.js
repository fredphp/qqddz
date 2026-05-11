import adminService from '@/utils/adminRequest'

export const getTournamentEliminationList = (data) => {
  return adminService({
    url: '/ddz/tournament/eliminationList',
    method: 'post',
    data
  })
}
