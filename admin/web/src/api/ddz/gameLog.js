import service from '@/utils/request'

// ==================== 游戏记录 ====================

// 获取游戏记录列表
export const getGameRecordList = (data) => {
  return service({
    url: '/ddz/gameRecord/list',
    method: 'post',
    data
  })
}

// 获取游戏记录详情
export const getGameRecordDetail = (id) => {
  return service({
    url: '/ddz/gameRecord/detail',
    method: 'get',
    params: { id }
  })
}

// 删除游戏记录
export const deleteGameRecord = (data) => {
  return service({
    url: '/ddz/gameRecord/delete',
    method: 'delete',
    data
  })
}

// ==================== 游戏日志 ====================

// 获取叫地主日志列表
export const getBidLogList = (data) => {
  return service({
    url: '/ddz/log/bid/list',
    method: 'post',
    data
  })
}

// 获取发牌日志列表
export const getDealLogList = (data) => {
  return service({
    url: '/ddz/log/deal/list',
    method: 'post',
    data
  })
}

// 获取出牌日志列表
export const getPlayLogList = (data) => {
  return service({
    url: '/ddz/log/play/list',
    method: 'post',
    data
  })
}

// ==================== 玩家统计 ====================

// 获取玩家统计列表
export const getPlayerStatList = (data) => {
  return service({
    url: '/ddz/playerStat/list',
    method: 'post',
    data
  })
}

// ==================== 房间配置 ====================

// 获取房间配置列表
export const getRoomConfigList = (data) => {
  return service({
    url: '/ddz/roomConfig/list',
    method: 'post',
    data
  })
}

// 创建房间配置
export const createRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfig/create',
    method: 'post',
    data
  })
}

// 更新房间配置
export const updateRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfig/update',
    method: 'put',
    data
  })
}

// 删除房间配置
export const deleteRoomConfig = (data) => {
  return service({
    url: '/ddz/roomConfig/delete',
    method: 'delete',
    data
  })
}

// 刷新房间配置缓存
export const refreshRoomConfigCache = () => {
  return service({
    url: '/ddz/roomConfig/refresh-cache',
    method: 'post'
  })
}

// 获取背景图选项
export const getBgImageOptions = () => {
  return service({
    url: '/ddz/roomConfig/bg-image-options',
    method: 'get'
  })
}

// ==================== 游戏房间实例 ====================

// 获取房间列表
export const getRoomList = (data) => {
  return service({
    url: '/ddz/room/list',
    method: 'post',
    data
  })
}

// 获取房间详情
export const getRoomDetail = (id) => {
  return service({
    url: '/ddz/room/detail',
    method: 'get',
    params: { id }
  })
}

// 删除房间
export const deleteRoom = (data) => {
  return service({
    url: '/ddz/room/delete',
    method: 'delete',
    data
  })
}

// ==================== 短信验证码 ====================

// 获取短信验证码列表
export const getSmsCodeList = (data) => {
  return service({
    url: '/ddz/smsCode/list',
    method: 'post',
    data
  })
}

// 删除短信验证码
export const deleteSmsCode = (data) => {
  return service({
    url: '/ddz/smsCode/delete',
    method: 'delete',
    data
  })
}
