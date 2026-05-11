import adminService from '@/utils/adminRequest'

// 获取玩家列表
export const getPlayerList = (data) => {
  return adminService({
    url: '/ddz/player/list',
    method: 'post',
    data
  })
}

// 获取玩家信息
export const getPlayerInfo = (id) => {
  return adminService({
    url: '/ddz/player/info',
    method: 'get',
    params: { id }
  })
}

// 封禁玩家
export const banPlayer = (data) => {
  return adminService({
    url: '/ddz/player/ban',
    method: 'post',
    data
  })
}

// 解封玩家
export const unbanPlayer = (data) => {
  return adminService({
    url: '/ddz/player/unban',
    method: 'post',
    data
  })
}

// 冻结玩家
export const freezePlayer = (data) => {
  return adminService({
    url: '/ddz/player/freeze',
    method: 'post',
    data
  })
}

// 解冻玩家
export const unfreezePlayer = (data) => {
  return adminService({
    url: '/ddz/player/unfreeze',
    method: 'post',
    data
  })
}

// 获取玩家状态变更日志
export const getPlayerStatusLogs = (data) => {
  return adminService({
    url: '/ddz/player/statusLogs',
    method: 'post',
    data
  })
}

// 更新玩家信息（基本信息）
export const updatePlayer = (data) => {
  return adminService({
    url: '/ddz/player/update',
    method: 'put',
    data
  })
}

// 更新玩家货币（统一接口 - 增减模式）
export const updatePlayerCurrency = (data) => {
  return adminService({
    url: '/ddz/player/currency',
    method: 'post',
    data
  })
}

// 更新玩家金币
export const updatePlayerCoins = (data) => {
  return adminService({
    url: '/ddz/player/coins',
    method: 'post',
    data
  })
}

// 更新玩家竞技币
export const updatePlayerArenaCoin = (data) => {
  return adminService({
    url: '/ddz/player/arenaCoin',
    method: 'post',
    data
  })
}

// 获取货币流水日志
export const getCoinLogList = (data) => {
  return adminService({
    url: '/ddz/player/coinLogs',
    method: 'post',
    data
  })
}

// 批量生成机器人
export const generateRobots = (data) => {
  return adminService({
    url: '/ddz/player/generateRobots',
    method: 'post',
    data
  })
}
