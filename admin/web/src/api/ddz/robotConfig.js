import adminService from '@/utils/adminRequest'

// 获取机器人配置列表
export function getRobotConfigList(data) {
  return adminService({
    url: '/ddz/robotConfig/list',
    method: 'post',
    data
  })
}

// 获取机器人配置详情
export function getRobotConfigInfo(id) {
  return adminService({
    url: '/ddz/robotConfig/info',
    method: 'get',
    params: { id }
  })
}

// 获取默认配置
export function getDefaultConfig() {
  return adminService({
    url: '/ddz/robotConfig/default',
    method: 'get'
  })
}

// 获取所有启用的配置（用于下拉选择）
export function getAllConfigs() {
  return adminService({
    url: '/ddz/robotConfig/all',
    method: 'get'
  })
}

// 创建机器人配置
export function createRobotConfig(data) {
  return adminService({
    url: '/ddz/robotConfig/create',
    method: 'post',
    data
  })
}

// 更新机器人配置
export function updateRobotConfig(data) {
  return adminService({
    url: '/ddz/robotConfig/update',
    method: 'put',
    data
  })
}

// 删除机器人配置
export function deleteRobotConfig(id) {
  return adminService({
    url: '/ddz/robotConfig/delete',
    method: 'delete',
    data: { id }
  })
}

// 设置默认配置
export function setDefaultConfig(id) {
  return adminService({
    url: '/ddz/robotConfig/setDefault',
    method: 'post',
    data: { id }
  })
}
