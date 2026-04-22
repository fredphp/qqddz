import service from '@/utils/request'

// 获取概览统计
export const getOverviewStats = () => {
  return service({
    url: '/ddz/stats/overview',
    method: 'get'
  })
}

// 获取每日统计
export const getDailyStats = (data) => {
  return service({
    url: '/ddz/stats/daily',
    method: 'post',
    data
  })
}

// 获取排行榜
export const getLeaderboard = (data) => {
  return service({
    url: '/ddz/stats/leaderboard',
    method: 'post',
    data
  })
}

// 获取玩家统计
export const getPlayerStats = (data) => {
  return service({
    url: '/ddz/stats/player',
    method: 'post',
    data
  })
}

// 获取每日活跃图表
export const getDailyActiveChart = (startDate, endDate) => {
  return service({
    url: '/ddz/stats/chart/active',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取每日游戏场次图表
export const getDailyGamesChart = (startDate, endDate) => {
  return service({
    url: '/ddz/stats/chart/games',
    method: 'get',
    params: { startDate, endDate }
  })
}
