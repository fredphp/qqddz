import service from '@/utils/request'

// 获取期号列表
export const getArenaPeriodList = (data) => {
  return service({
    url: '/ddz/arenaPeriod/list',
    method: 'post',
    data
  })
}

// 获取期号详情
export const getArenaPeriodInfo = (id) => {
  return service({
    url: '/ddz/arenaPeriod/info',
    method: 'get',
    params: { id }
  })
}

// 更新期号
export const updateArenaPeriod = (data) => {
  return service({
    url: '/ddz/arenaPeriod/update',
    method: 'put',
    data
  })
}

// 删除期号
export const deleteArenaPeriod = (data) => {
  return service({
    url: '/ddz/arenaPeriod/delete',
    method: 'delete',
    data
  })
}

// 获取期号玩家列表
export const getArenaPeriodPlayers = (data) => {
  return service({
    url: '/ddz/arenaPeriod/players',
    method: 'post',
    data
  })
}

// 获取期号报名日志
export const getArenaPeriodSignupLogs = (data) => {
  return service({
    url: '/ddz/arenaPeriod/signupLogs',
    method: 'post',
    data
  })
}

// 获取期号统计
export const getArenaPeriodStats = () => {
  return service({
    url: '/ddz/arenaPeriod/stats',
    method: 'get'
  })
}
