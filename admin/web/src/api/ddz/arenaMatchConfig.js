import service from '@/utils/request'

// 获取比赛配置列表
export const getArenaMatchConfigList = (data) => {
  return service({
    url: '/ddz/arenaMatchConfig/list',
    method: 'post',
    data
  })
}

// 创建比赛配置
export const createArenaMatchConfig = (data) => {
  return service({
    url: '/ddz/arenaMatchConfig/create',
    method: 'post',
    data
  })
}

// 更新比赛配置
export const updateArenaMatchConfig = (data) => {
  return service({
    url: '/ddz/arenaMatchConfig/update',
    method: 'put',
    data
  })
}

// 删除比赛配置
export const deleteArenaMatchConfig = (data) => {
  return service({
    url: '/ddz/arenaMatchConfig/delete',
    method: 'delete',
    data
  })
}
