import adminService from '@/utils/adminRequest'

// 获取金币流水列表
export const getGoldLogList = (data) => {
  return adminService({
    url: '/ddz/goldLog/list',
    method: 'post',
    data
  })
}
