package example

import (
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type SysUserAgreementRouter struct{}

// InitSysUserAgreementRouter 初始化 用户协议 路由信息
func (s *SysUserAgreementRouter) InitSysUserAgreementRouter(Router *gin.RouterGroup, PublicRouter *gin.RouterGroup) {
	sysUserAgreementRouter := Router.Group("sysUserAgreement").Use(middleware.OperationRecord())
	sysUserAgreementRouterWithoutRecord := Router.Group("sysUserAgreement")
	sysUserAgreementPublicRouter := PublicRouter.Group("sysUserAgreement")
	{
		sysUserAgreementRouter.POST("createSysUserAgreement", sysUserAgreementApi.CreateSysUserAgreement)             // 新建用户协议
		sysUserAgreementRouter.DELETE("deleteSysUserAgreement", sysUserAgreementApi.DeleteSysUserAgreement)           // 删除用户协议
		sysUserAgreementRouter.DELETE("deleteSysUserAgreementByIds", sysUserAgreementApi.DeleteSysUserAgreementByIds) // 批量删除用户协议
		sysUserAgreementRouter.PUT("updateSysUserAgreement", sysUserAgreementApi.UpdateSysUserAgreement)              // 更新用户协议
	}
	{
		sysUserAgreementRouterWithoutRecord.GET("findSysUserAgreement", sysUserAgreementApi.FindSysUserAgreement)       // 根据ID获取用户协议
		sysUserAgreementRouterWithoutRecord.GET("getSysUserAgreementList", sysUserAgreementApi.GetSysUserAgreementList) // 获取用户协议列表
	}
	{
		sysUserAgreementPublicRouter.GET("getLatestUserAgreement", sysUserAgreementApi.GetLatestUserAgreement) // 获取最新用户协议（公开接口）
	}
}
