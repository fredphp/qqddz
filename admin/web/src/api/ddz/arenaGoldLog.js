import adminService from '@/utils/adminRequest'

// 获取竞技场金币流水列表
export const getArenaGoldLogList = (data) => {
  return adminService({
    url: '/ddz/arenaGoldLog/list',
    method: 'post',
    data
  })
}
