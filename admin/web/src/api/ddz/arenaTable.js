import service from '@/utils/request'

export const getArenaTableList = (data) => {
  return service({
    url: '/ddz/arenaTable/list',
    method: 'post',
    data
  })
}
