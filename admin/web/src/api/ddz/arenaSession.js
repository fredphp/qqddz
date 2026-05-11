import adminService from '@/utils/adminRequest'

// 获取竞技场会话列表
export const getArenaSessionList = (data) => {
  return adminService({
    url: '/ddz/arenaSession/list',
    method: 'post',
    data
  })
}
