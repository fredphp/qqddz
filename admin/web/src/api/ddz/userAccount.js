import service from '@/utils/request'

// 获取用户账户列表
export const getUserAccountList = (data) => {
  return service({
    url: '/ddz/userAccount/list',
    method: 'post',
    data
  })
}

// 获取用户账户信息
export const getUserAccountInfo = (id) => {
  return service({
    url: '/ddz/userAccount/info',
    method: 'get',
    params: { id }
  })
}

// 创建用户账户
export const createUserAccount = (data) => {
  return service({
    url: '/ddz/userAccount/create',
    method: 'post',
    data
  })
}

// 删除用户账户
export const deleteUserAccount = (data) => {
  return service({
    url: '/ddz/userAccount/delete',
    method: 'delete',
    data
  })
}

// 更新用户账户
export const updateUserAccount = (data) => {
  return service({
    url: '/ddz/userAccount/update',
    method: 'put',
    data
  })
}

// 更新用户账户状态
export const updateUserAccountStatus = (data) => {
  return service({
    url: '/ddz/userAccount/status',
    method: 'post',
    data
  })
}

// 绑定手机号
export const bindPhone = (data) => {
  return service({
    url: '/ddz/userAccount/bindPhone',
    method: 'post',
    data
  })
}

// 解绑微信
export const unbindWechat = (data) => {
  return service({
    url: '/ddz/userAccount/unbindWechat',
    method: 'post',
    data
  })
}

// 重置Token(强制下线)
export const resetToken = (data) => {
  return service({
    url: '/ddz/userAccount/resetToken',
    method: 'post',
    data
  })
}

// 获取登录日志列表
export const getLoginLogList = (data) => {
  return service({
    url: '/ddz/userAccount/loginLog',
    method: 'post',
    data
  })
}
