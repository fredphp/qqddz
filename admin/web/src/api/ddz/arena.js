import service from '@/utils/request'

// 竞技场报名
export const arenaRegister = (data) => {
  return service({
    url: '/ddz/arena/register',
    method: 'post',
    data
  })
}

// 取消报名
export const arenaCancel = (data) => {
  return service({
    url: '/ddz/arena/cancel',
    method: 'post',
    data
  })
}

// 获取报名状态
export const getArenaStatus = (playerId) => {
  return service({
    url: '/ddz/arena/status',
    method: 'get',
    params: { playerId }
  })
}

// 获取竞技场列表
export const getArenaList = (playerId) => {
  return service({
    url: '/ddz/arena/list',
    method: 'get',
    params: { playerId }
  })
}

// 获取报名记录列表（管理后台用）
export const getArenaRegistrationList = (data) => {
  return service({
    url: '/ddz/arena/registration/list',
    method: 'post',
    data
  })
}
