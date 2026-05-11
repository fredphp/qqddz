import adminService from '@/utils/adminRequest'

export const getPendingGameDataList = (data) => {
  return adminService({
    url: '/ddz/system/pendingGameDataList',
    method: 'post',
    data
  })
}
