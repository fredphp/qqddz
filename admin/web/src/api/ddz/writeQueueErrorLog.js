import service from '@/utils/request'

export const getWriteQueueErrorLogList = (data) => {
  return service({
    url: '/ddz/system/writeQueueErrorLogList',
    method: 'post',
    data
  })
}
