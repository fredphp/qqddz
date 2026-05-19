import adminService from '@/utils/adminRequest'

// ==================== 子分区管理 ====================

// 获取子分区列表
export const getRoomSublevelList = (params) => {
  return adminService({
    url: '/ddz/roomSublevel/list',
    method: 'get',
    params
  })
}

// 获取子分区详情
export const getRoomSublevelDetail = (id) => {
  return adminService({
    url: '/ddz/roomSublevel/detail',
    method: 'get',
    params: { ID: id }
  })
}

// 创建子分区
export const createRoomSublevel = (data) => {
  return adminService({
    url: '/ddz/roomSublevel/create',
    method: 'post',
    data
  })
}

// 更新子分区
export const updateRoomSublevel = (data) => {
  return adminService({
    url: '/ddz/roomSublevel/update',
    method: 'put',
    data
  })
}

// 删除子分区
export const deleteRoomSublevel = (id) => {
  return adminService({
    url: '/ddz/roomSublevel/delete',
    method: 'delete',
    data: { ID: id }
  })
}

// 批量创建默认子分区
export const batchCreateDefaultSublevels = (roomConfigId) => {
  return adminService({
    url: '/ddz/roomSublevel/batchCreate',
    method: 'post',
    data: { roomConfigId }
  })
}

// 根据房间配置ID获取子分区列表
export const getSublevelsByRoomConfig = (roomConfigId) => {
  return adminService({
    url: '/ddz/roomSublevel/byRoom',
    method: 'get',
    params: { roomConfigId }
  })
}

// 刷新子分区缓存
export const refreshSublevelCache = (roomConfigId) => {
  return adminService({
    url: '/ddz/roomSublevel/refreshCache',
    method: 'post',
    params: { roomConfigId }
  })
}
