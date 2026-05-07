import service from '@/utils/request'

// @Tags SysUserAgreement
// @Summary 创建用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUserAgreement true "创建用户协议"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /sysUserAgreement/createSysUserAgreement [post]
export const createSysUserAgreement = (data) => {
  return service({
    url: '/sysUserAgreement/createSysUserAgreement',
    method: 'post',
    data
  })
}

// @Tags SysUserAgreement
// @Summary 删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUserAgreement true "删除用户协议"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /sysUserAgreement/deleteSysUserAgreement [delete]
export const deleteSysUserAgreement = (params) => {
  return service({
    url: '/sysUserAgreement/deleteSysUserAgreement',
    method: 'delete',
    params
  })
}

// @Tags SysUserAgreement
// @Summary 批量删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "批量删除用户协议"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /sysUserAgreement/deleteSysUserAgreementByIds [delete]
export const deleteSysUserAgreementByIds = (params) => {
  return service({
    url: '/sysUserAgreement/deleteSysUserAgreementByIds',
    method: 'delete',
    params
  })
}

// @Tags SysUserAgreement
// @Summary 更新用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUserAgreement true "更新用户协议"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /sysUserAgreement/updateSysUserAgreement [put]
export const updateSysUserAgreement = (data) => {
  return service({
    url: '/sysUserAgreement/updateSysUserAgreement',
    method: 'put',
    data
  })
}

// @Tags SysUserAgreement
// @Summary 用id查询用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query model.SysUserAgreement true "用id查询用户协议"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /sysUserAgreement/findSysUserAgreement [get]
export const findSysUserAgreement = (params) => {
  return service({
    url: '/sysUserAgreement/findSysUserAgreement',
    method: 'get',
    params
  })
}

// @Tags SysUserAgreement
// @Summary 分页获取用户协议列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "分页获取用户协议列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /sysUserAgreement/getSysUserAgreementList [get]
export const getSysUserAgreementList = (params) => {
  return service({
    url: '/sysUserAgreement/getSysUserAgreementList',
    method: 'get',
    params
  })
}

// @Tags SysUserAgreement
// @Summary 获取最新的用户协议（公开接口）
// @accept application/json
// @Produce application/json
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /sysUserAgreement/getLatestUserAgreement [get]
export const getLatestUserAgreement = () => {
  return service({
    url: '/sysUserAgreement/getLatestUserAgreement',
    method: 'get'
  })
}

// @Tags SysUserAgreement
// @Summary 设置用户协议状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id query int true "ID"
// @Param status query int true "状态"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"设置成功"}"
// @Router /sysUserAgreement/setUserAgreementStatus [put]
export const setUserAgreementStatus = (params) => {
  return service({
    url: '/sysUserAgreement/setUserAgreementStatus',
    method: 'put',
    params
  })
}
