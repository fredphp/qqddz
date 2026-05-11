import adminService from '@/utils/adminRequest'

export const getTournamentRoundList = (data) => {
  return adminService({
    url: '/ddz/tournament/roundList',
    method: 'post',
    data
  })
}
