import adminService from '@/utils/adminRequest'

// 获取竞技币流水列表
export const getArenaCoinLogList = (data) => {
  return adminService({
    url: '/ddz/arenaCoinLog/list',
    method: 'post',
    data
  })
}
