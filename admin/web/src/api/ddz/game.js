import service from '@/utils/request'

// 获取游戏记录列表
export const getGameList = (data) => {
  return service({
    url: '/ddz/game/list',
    method: 'post',
    data
  })
}

// 获取游戏记录详情
export const getGameDetail = (id) => {
  return service({
    url: '/ddz/game/detail',
    method: 'get',
    params: { id }
  })
}
