import adminService from '@/utils/adminRequest'

export const getWriteQueueErrorLogList = (data) => {
  return adminService({
    url: '/ddz/system/writeQueueErrorLogList',
    method: 'post',
    data
  })
}
