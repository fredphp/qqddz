import adminService from '@/utils/adminRequest'

export const getGameConfigList = (data) => {
  return adminService({
    url: '/ddz/gameConfig/list',
    method: 'post',
    data
  })
}

export const createGameConfig = (data) => {
  return adminService({
    url: '/ddz/gameConfig/create',
    method: 'post',
    data
  })
}

export const updateGameConfig = (data) => {
  return adminService({
    url: '/ddz/gameConfig/update',
    method: 'put',
    data
  })
}

export const deleteGameConfig = (data) => {
  return adminService({
    url: '/ddz/gameConfig/delete',
    method: 'delete',
    data
  })
}
