import service from '@/utils/request'

// 获取金币流水列表
export const getGoldLogList = (data) => {
  return service({
    url: '/ddz/goldLog/list',
    method: 'post',
    data
  })
}
