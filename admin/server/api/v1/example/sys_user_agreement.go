package example

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/model/example"
	exampleReq "github.com/flipped-aurora/gin-vue-admin/server/model/example/request"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"strconv"
)

type SysUserAgreementApi struct{}

// CreateSysUserAgreement 创建用户协议
// @Tags SysUserAgreement
// @Summary 创建用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body example.SysUserAgreement true "创建用户协议"
// @Success 200 {object} response.Response{msg=string} "创建成功"
// @Router /sysUserAgreement/createSysUserAgreement [post]
func (sysUserAgreementApi *SysUserAgreementApi) CreateSysUserAgreement(c *gin.Context) {
	var sysUserAgreement example.SysUserAgreement
	err := c.ShouldBindJSON(&sysUserAgreement)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = sysUserAgreementService.CreateSysUserAgreement(&sysUserAgreement)
	if err != nil {
		global.GVA_LOG.Error("创建失败!", zap.Error(err))
		response.FailWithMessage("创建失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("创建成功", c)
}

// DeleteSysUserAgreement 删除用户协议
// @Tags SysUserAgreement
// @Summary 删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body example.SysUserAgreement true "删除用户协议"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /sysUserAgreement/deleteSysUserAgreement [delete]
func (sysUserAgreementApi *SysUserAgreementApi) DeleteSysUserAgreement(c *gin.Context) {
	ID := c.Query("ID")
	err := sysUserAgreementService.DeleteSysUserAgreement(ID)
	if err != nil {
		global.GVA_LOG.Error("删除失败!", zap.Error(err))
		response.FailWithMessage("删除失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("删除成功", c)
}

// DeleteSysUserAgreementByIds 批量删除用户协议
// @Tags SysUserAgreement
// @Summary 批量删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{msg=string} "批量删除成功"
// @Router /sysUserAgreement/deleteSysUserAgreementByIds [delete]
func (sysUserAgreementApi *SysUserAgreementApi) DeleteSysUserAgreementByIds(c *gin.Context) {
	IDs := c.QueryArray("IDs[]")
	err := sysUserAgreementService.DeleteSysUserAgreementByIds(IDs)
	if err != nil {
		global.GVA_LOG.Error("批量删除失败!", zap.Error(err))
		response.FailWithMessage("批量删除失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("批量删除成功", c)
}

// UpdateSysUserAgreement 更新用户协议
// @Tags SysUserAgreement
// @Summary 更新用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body example.SysUserAgreement true "更新用户协议"
// @Success 200 {object} response.Response{msg=string} "更新成功"
// @Router /sysUserAgreement/updateSysUserAgreement [put]
func (sysUserAgreementApi *SysUserAgreementApi) UpdateSysUserAgreement(c *gin.Context) {
	var sysUserAgreement example.SysUserAgreement
	err := c.ShouldBindJSON(&sysUserAgreement)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = sysUserAgreementService.UpdateSysUserAgreement(sysUserAgreement)
	if err != nil {
		global.GVA_LOG.Error("更新失败!", zap.Error(err))
		response.FailWithMessage("更新失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("更新成功", c)
}

// FindSysUserAgreement 用id查询用户协议
// @Tags SysUserAgreement
// @Summary 用id查询用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query example.SysUserAgreement true "用id查询用户协议"
// @Success 200 {object} response.Response{data=example.SysUserAgreement,msg=string} "查询成功"
// @Router /sysUserAgreement/findSysUserAgreement [get]
func (sysUserAgreementApi *SysUserAgreementApi) FindSysUserAgreement(c *gin.Context) {
	ID := c.Query("ID")
	resysUserAgreement, err := sysUserAgreementService.GetSysUserAgreement(ID)
	if err != nil {
		global.GVA_LOG.Error("查询失败!", zap.Error(err))
		response.FailWithMessage("查询失败:"+err.Error(), c)
		return
	}
	response.OkWithData(resysUserAgreement, c)
}

// GetSysUserAgreementList 分页获取用户协议列表
// @Tags SysUserAgreement
// @Summary 分页获取用户协议列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query exampleReq.SysUserAgreementSearch true "分页获取用户协议列表"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取成功"
// @Router /sysUserAgreement/getSysUserAgreementList [get]
func (sysUserAgreementApi *SysUserAgreementApi) GetSysUserAgreementList(c *gin.Context) {
	var pageInfo exampleReq.SysUserAgreementSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	list, total, err := sysUserAgreementService.GetSysUserAgreementInfoList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取失败!", zap.Error(err))
		response.FailWithMessage("获取失败:"+err.Error(), c)
		return
	}
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取成功", c)
}

// GetLatestUserAgreement 获取最新的用户协议（公开接口）
// @Tags SysUserAgreement
// @Summary 获取最新的用户协议
// @accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=example.SysUserAgreement,msg=string} "获取成功"
// @Router /sysUserAgreement/getLatestUserAgreement [get]
func (sysUserAgreementApi *SysUserAgreementApi) GetLatestUserAgreement(c *gin.Context) {
	resysUserAgreement, err := sysUserAgreementService.GetLatestUserAgreement()
	if err != nil {
		global.GVA_LOG.Error("获取失败!", zap.Error(err))
		response.FailWithMessage("获取失败:"+err.Error(), c)
		return
	}
	response.OkWithData(resysUserAgreement, c)
}

// SetUserAgreementStatus 设置用户协议状态
// @Tags SysUserAgreement
// @Summary 设置用户协议状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id query int true "ID"
// @Param status query int true "状态"
// @Success 200 {object} response.Response{msg=string} "设置成功"
// @Router /sysUserAgreement/setUserAgreementStatus [put]
func (sysUserAgreementApi *SysUserAgreementApi) SetUserAgreementStatus(c *gin.Context) {
	idStr := c.Query("id")
	statusStr := c.Query("status")
	
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.FailWithMessage("无效的ID", c)
		return
	}
	
	status, err := strconv.Atoi(statusStr)
	if err != nil {
		response.FailWithMessage("无效的状态值", c)
		return
	}
	
	var sysUserAgreement example.SysUserAgreement
	sysUserAgreement.ID = uint(id)
	sysUserAgreement.Status = status
	
	err = sysUserAgreementService.UpdateSysUserAgreement(sysUserAgreement)
	if err != nil {
		global.GVA_LOG.Error("设置失败!", zap.Error(err))
		response.FailWithMessage("设置失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("设置成功", c)
}
