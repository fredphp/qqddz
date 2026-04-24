package ddz

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type DDZUserAccountRouter struct{}

func (r *DDZUserAccountRouter) InitDDZUserAccountRouter(Router *gin.RouterGroup) {
	ddzUserAccountRouter := Router.Group("ddz/userAccount").Use(middleware.OperationRecord())
	ddzUserAccountRouterWithoutRecord := Router.Group("ddz/userAccount")

	ddzUserAccountApi := v1.ApiGroupApp.DDZApiGroup.DDZUserAccountApi
	{
		ddzUserAccountRouter.POST("create", ddzUserAccountApi.CreateUserAccount)           // 创建用户账户
		ddzUserAccountRouter.DELETE("delete", ddzUserAccountApi.DeleteUserAccount)         // 删除用户账户
		ddzUserAccountRouter.PUT("update", ddzUserAccountApi.UpdateUserAccount)            // 更新用户账户
		ddzUserAccountRouter.POST("status", ddzUserAccountApi.UpdateUserAccountStatus)     // 更新账户状态
		ddzUserAccountRouter.POST("bindPhone", ddzUserAccountApi.BindPhone)                // 绑定手机号
		ddzUserAccountRouter.POST("unbindWechat", ddzUserAccountApi.UnbindWeChat)          // 解绑微信
		ddzUserAccountRouter.POST("resetToken", ddzUserAccountApi.ResetToken)              // 重置Token(强制下线)
	}
	{
		ddzUserAccountRouterWithoutRecord.POST("list", ddzUserAccountApi.GetUserAccountList)     // 分页获取用户账户列表
		ddzUserAccountRouterWithoutRecord.GET("info", ddzUserAccountApi.GetUserAccountByID)      // 获取用户账户信息
		ddzUserAccountRouterWithoutRecord.POST("loginLog", ddzUserAccountApi.GetLoginLogList)    // 获取登录日志列表
	}
}
