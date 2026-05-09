import service from '@/utils/request'

export const getTournamentEliminationList = (data) => {
  return service({
    url: '/ddz/tournament/eliminationList',
    method: 'post',
    data
  })
}
