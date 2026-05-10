import service from '@/utils/request'

// 获取竞技场会话列表
export const getArenaSessionList = (data) => {
  return service({
    url: '/ddz/arenaSession/list',
    method: 'post',
    data
  })
}
