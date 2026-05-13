package system

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type SysUserAgreementRouter struct{}

// InitSysUserAgreementRouter 初始化用户协议路由
func (s *SysUserAgreementRouter) InitSysUserAgreementRouter(Router *gin.RouterGroup, PublicRouter *gin.RouterGroup) {
	userAgreementApi := v1.ApiGroupApp.SystemApiGroup.SysUserAgreementApi

	// 需要鉴权的路由
	{
		// 用户协议管理
		Router.GET("sysUserAgreement/getSysUserAgreementList", userAgreementApi.GetSysUserAgreementList)
		Router.POST("sysUserAgreement/createSysUserAgreement", userAgreementApi.CreateSysUserAgreement)
		Router.PUT("sysUserAgreement/updateSysUserAgreement", userAgreementApi.UpdateSysUserAgreement)
		Router.DELETE("sysUserAgreement/deleteSysUserAgreement", userAgreementApi.DeleteSysUserAgreement)
		Router.DELETE("sysUserAgreement/deleteSysUserAgreementByIds", userAgreementApi.DeleteSysUserAgreementByIds)
		Router.GET("sysUserAgreement/findSysUserAgreement", userAgreementApi.FindSysUserAgreement)
		Router.PUT("sysUserAgreement/setUserAgreementStatus", userAgreementApi.SetUserAgreementStatus)
	}

	// 公开路由（不需要鉴权）
	{
		PublicRouter.GET("sysUserAgreement/getLatestUserAgreement", userAgreementApi.GetLatestUserAgreement)
		PublicRouter.GET("sysUserAgreement/getHelpArticleList", userAgreementApi.GetHelpArticleList)
		PublicRouter.GET("sysUserAgreement/getLatestHelpArticle", userAgreementApi.GetLatestHelpArticle)
	}
}
