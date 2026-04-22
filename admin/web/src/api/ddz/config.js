import service from '@/utils/request'

// 获取房间配置列表
export const getRoomConfigList = (data) => {
  return service({
    url: '/ddz/config/room/list',
    method: 'post',
    data
  })
}

// 创建房间配置
export const createRoomConfig = (data) => {
  return service({
    url: '/ddz/config/room/create',
    method: 'post',
    data
  })
}

// 更新房间配置
export const updateRoomConfig = (data) => {
  return service({
    url: '/ddz/config/room/update',
    method: 'put',
    data
  })
}

// 删除房间配置
export const deleteRoomConfig = (data) => {
  return service({
    url: '/ddz/config/room/delete',
    method: 'delete',
    data
  })
}

// 获取游戏配置列表
export const getGameConfigList = (data) => {
  return service({
    url: '/ddz/config/game/list',
    method: 'post',
    data
  })
}

// 更新游戏配置
export const updateGameConfig = (data) => {
  return service({
    url: '/ddz/config/game/update',
    method: 'put',
    data
  })
}
