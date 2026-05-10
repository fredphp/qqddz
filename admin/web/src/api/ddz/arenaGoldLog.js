import service from '@/utils/request'

// 获取竞技场金币流水列表
export const getArenaGoldLogList = (data) => {
  return service({
    url: '/ddz/arenaGoldLog/list',
    method: 'post',
    data
  })
}
