import service from '@/utils/request'

export const getGameConfigList = (data) => {
  return service({
    url: '/ddz/gameConfig/list',
    method: 'post',
    data
  })
}

export const createGameConfig = (data) => {
  return service({
    url: '/ddz/gameConfig/create',
    method: 'post',
    data
  })
}

export const updateGameConfig = (data) => {
  return service({
    url: '/ddz/gameConfig/update',
    method: 'put',
    data
  })
}

export const deleteGameConfig = (data) => {
  return service({
    url: '/ddz/gameConfig/delete',
    method: 'delete',
    data
  })
}
