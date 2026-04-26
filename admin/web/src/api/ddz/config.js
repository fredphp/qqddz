import service from '@/utils/request'

// ==================== 菜单房间配置 (ddz_room_configs 表) ====================

// 获取房间配置列表
export const getRoomConfigList = (data) => {
  return service({
    url: '/ddz/roomConfigs/list',
    method: 'post',
    data
  })
}

// 创建房间配置
export const createRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfigs/create',
    method: 'post',
    data
  })
}

// 更新房间配置
export const updateRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfigs/update',
    method: 'put',
    data
  })
}

// 删除房间配置
export const deleteRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfigs/delete',
    method: 'delete',
    data
  })
}

// 刷新房间配置缓存
export const refreshRoomConfigCache = () => {
  return service({
    url: '/ddz/roomConfigs/refresh-cache',
    method: 'post'
  })
}

// 获取背景图选项
export const getBgImageOptions = () => {
  return service({
    url: '/ddz/roomConfigs/bg-image-options',
    method: 'get'
  })
}

// ==================== 游戏配置 (ddz_game_configs 表) ====================

// 获取游戏配置列表
export const getGameConfigList = (data) => {
  return service({
    url: '/ddz/gameConfig/list',
    method: 'post',
    data
  })
}

// 更新游戏配置
export const updateGameConfig = (data) => {
  return service({
    url: '/ddz/gameConfig/update',
    method: 'put',
    data
  })
}
