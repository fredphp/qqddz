import adminService from '@/utils/adminRequest'

// 获取游戏记录列表
export const getGameList = (data) => {
  return adminService({
    url: '/ddz/game/list',
    method: 'post',
    data
  })
}

// 获取游戏记录详情
export const getGameDetail = (id) => {
  return adminService({
    url: '/ddz/game/detail',
    method: 'get',
    params: { id }
  })
}
