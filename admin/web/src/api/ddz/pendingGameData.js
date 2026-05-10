import service from '@/utils/request'

export const getPendingGameDataList = (data) => {
  return service({
    url: '/ddz/system/pendingGameDataList',
    method: 'post',
    data
  })
}
