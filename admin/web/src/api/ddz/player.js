import service from '@/utils/request'

// 获取玩家列表
export const getPlayerList = (data) => {
  return service({
    url: '/ddz/player/list',
    method: 'post',
    data
  })
}

// 获取玩家信息
export const getPlayerInfo = (id) => {
  return service({
    url: '/ddz/player/info',
    method: 'get',
    params: { id }
  })
}

// 封禁玩家
export const banPlayer = (data) => {
  return service({
    url: '/ddz/player/ban',
    method: 'post',
    data
  })
}

// 解封玩家
export const unbanPlayer = (data) => {
  return service({
    url: '/ddz/player/unban',
    method: 'post',
    data
  })
}

// 更新玩家信息
export const updatePlayer = (data) => {
  return service({
    url: '/ddz/player/update',
    method: 'put',
    data
  })
}

// 更新玩家金币
export const updatePlayerCoins = (data) => {
  return service({
    url: '/ddz/player/coins',
    method: 'post',
    data
  })
}
