import service from '@/utils/request'

export const getDealRecordList = (data) => {
  return service({
    url: '/ddz/gameDetail/dealRecordList',
    method: 'post',
    data
  })
}
