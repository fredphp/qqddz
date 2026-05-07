import service from '@/utils/request'

// ==================== 奖励商品管理 ====================

// 获取奖励商品列表
export const getRewardGoodsList = (data) => {
  return service({
    url: '/ddz/rewardGoods/list',
    method: 'post',
    data
  })
}

// 创建奖励商品
export const createRewardGoods = (data) => {
  return service({
    url: '/ddz/rewardGoods/create',
    method: 'post',
    data
  })
}

// 更新奖励商品
export const updateRewardGoods = (data) => {
  return service({
    url: '/ddz/rewardGoods/update',
    method: 'put',
    data
  })
}

// 删除奖励商品
export const deleteRewardGoods = (data) => {
  return service({
    url: '/ddz/rewardGoods/delete',
    method: 'delete',
    data
  })
}

// 获取奖励商品详情
export const getRewardGoodsDetail = (id) => {
  return service({
    url: '/ddz/rewardGoods/detail',
    method: 'get',
    params: { id }
  })
}

// ==================== 订单管理 ====================

// 获取订单列表
export const getRewardOrdersList = (data) => {
  return service({
    url: '/ddz/rewardOrders/list',
    method: 'post',
    data
  })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return service({
    url: '/ddz/rewardOrders/detail',
    method: 'get',
    params: { id }
  })
}

// 更新订单发货信息
export const updateOrderShipInfo = (data) => {
  return service({
    url: '/ddz/rewardOrders/ship',
    method: 'put',
    data
  })
}

// 获取房间列表（用于绑定商品到房间）
export const getRoomOptions = () => {
  return service({
    url: '/ddz/roomConfig/options',
    method: 'get'
  })
}
