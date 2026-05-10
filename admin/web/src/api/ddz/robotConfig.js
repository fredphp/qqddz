import service from '@/utils/request'

// 获取机器人配置列表
export function getRobotConfigList(data) {
  return service({
    url: '/ddz/robotConfig/list',
    method: 'post',
    data
  })
}

// 获取机器人配置详情
export function getRobotConfigInfo(id) {
  return service({
    url: '/ddz/robotConfig/info',
    method: 'get',
    params: { id }
  })
}

// 获取默认配置
export function getDefaultConfig() {
  return service({
    url: '/ddz/robotConfig/default',
    method: 'get'
  })
}

// 获取所有启用的配置（用于下拉选择）
export function getAllConfigs() {
  return service({
    url: '/ddz/robotConfig/all',
    method: 'get'
  })
}

// 创建机器人配置
export function createRobotConfig(data) {
  return service({
    url: '/ddz/robotConfig/create',
    method: 'post',
    data
  })
}

// 更新机器人配置
export function updateRobotConfig(data) {
  return service({
    url: '/ddz/robotConfig/update',
    method: 'put',
    data
  })
}

// 删除机器人配置
export function deleteRobotConfig(id) {
  return service({
    url: '/ddz/robotConfig/delete',
    method: 'delete',
    data: { id }
  })
}

// 设置默认配置
export function setDefaultConfig(id) {
  return service({
    url: '/ddz/robotConfig/setDefault',
    method: 'post',
    data: { id }
  })
}
