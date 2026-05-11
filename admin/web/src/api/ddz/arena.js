import adminService from '@/utils/adminRequest'

// 竞技场报名（Admin 后端直接操作数据库）
export const arenaRegister = (data) => {
  return adminService({
    url: '/ddz/arena/register',
    method: 'post',
    data
  })
}

// 取消报名（Admin 后端直接操作数据库）
export const arenaCancel = (data) => {
  return adminService({
    url: '/ddz/arena/cancel',
    method: 'post',
    data
  })
}

// 获取报名状态（Admin 后端直接查询数据库）
export const getArenaStatus = (playerId) => {
  return adminService({
    url: '/ddz/arena/status',
    method: 'get',
    params: { playerId }
  })
}

// 获取竞技场列表（Admin 后端直接查询数据库）
export const getArenaList = (playerId) => {
  return adminService({
    url: '/ddz/arena/list',
    method: 'get',
    params: { playerId }
  })
}

// 获取报名记录列表（Admin 后端直接查询数据库）
export const getArenaRegistrationList = (data) => {
  return adminService({
    url: '/ddz/arena/registration/list',
    method: 'post',
    data
  })
}
