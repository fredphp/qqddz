import service from '@/utils/request'

export const getTournamentRoundList = (data) => {
  return service({
    url: '/ddz/tournament/roundList',
    method: 'post',
    data
  })
}
