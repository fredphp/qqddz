import service from '@/utils/request'

// 获取竞技币流水列表
export const getArenaCoinLogList = (data) => {
  return service({
    url: '/ddz/arenaCoinLog/list',
    method: 'post',
    data
  })
}
