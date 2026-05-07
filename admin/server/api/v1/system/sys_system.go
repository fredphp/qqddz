package system

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
        "github.com/flipped-aurora/gin-vue-admin/server/model/system"
        systemRes "github.com/flipped-aurora/gin-vue-admin/server/model/system/response"
        "github.com/flipped-aurora/gin-vue-admin/server/service/ddz"
        "github.com/flipped-aurora/gin-vue-admin/server/utils"
        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
)

type SystemApi struct{}

// GetSystemConfig
// @Tags      System
// @Summary   获取配置文件内容
// @Security  ApiKeyAuth
// @Produce   application/json
// @Success   200  {object}  response.Response{data=systemRes.SysConfigResponse,msg=string}  "获取配置文件内容,返回包括系统配置"
// @Router    /system/getSystemConfig [post]
func (s *SystemApi) GetSystemConfig(c *gin.Context) {
        config, err := systemConfigService.GetSystemConfig()
        if err != nil {
                global.GVA_LOG.Error("获取失败!", zap.Error(err))
                response.FailWithMessage("获取失败", c)
                return
        }
        response.OkWithDetailed(systemRes.SysConfigResponse{Config: config}, "获取成功", c)
}

// SetSystemConfig
// @Tags      System
// @Summary   设置配置文件内容
// @Security  ApiKeyAuth
// @Produce   application/json
// @Param     data  body      system.System                   true  "设置配置文件内容"
// @Success   200   {object}  response.Response{data=string}  "设置配置文件内容"
// @Router    /system/setSystemConfig [post]
func (s *SystemApi) SetSystemConfig(c *gin.Context) {
        var sys system.System
        err := c.ShouldBindJSON(&sys)
        if err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }
        err = systemConfigService.SetSystemConfig(sys)
        if err != nil {
                global.GVA_LOG.Error("设置失败!", zap.Error(err))
                response.FailWithMessage("设置失败", c)
                return
        }

        // 同步广告配置到Redis
        syncAdConfigToRedis(sys)

        response.OkWithMessage("设置成功", c)
}

// syncAdConfigToRedis 同步广告配置到Redis
func syncAdConfigToRedis(sys system.System) {
        // 注意: Config 和 Ad 是值类型，不能与 nil 比较
        // 这里直接使用配置，如果需要检查是否启用可以用 adConfig.Enabled
        adConfig := sys.Config.Ad
        redisConfig := &ddz.AdConfig{
                Enabled:              adConfig.Enabled,
                NormalRewardGold:     adConfig.NormalRewardGold,
                NormalDailyMaxCount:  adConfig.NormalDailyMaxCount,
                ArenaRewardCoins:     adConfig.ArenaRewardCoins,
                ArenaDailyMaxCount:   adConfig.ArenaDailyMaxCount,
                CooldownSeconds:      adConfig.CooldownSeconds,
                SupportedSdks:        adConfig.SupportedSdks,
                PrimarySdk:           adConfig.PrimarySdk,
                CsjAppId:             adConfig.CsjAppId,
                CsjRewardedVideoAdId: adConfig.CsjRewardedVideoAdId,
                YlhAppId:             adConfig.YlhAppId,
                YlhRewardedVideoAdId: adConfig.YlhRewardedVideoAdId,
                KsAppId:              adConfig.KsAppId,
                KsRewardedVideoAdId:  adConfig.KsRewardedVideoAdId,
                BdAppId:              adConfig.BdAppId,
                BdRewardedVideoAdId:  adConfig.BdRewardedVideoAdId,
        }

        if err := ddz.DDZConfigServiceApp.SyncAdConfigToRedis(redisConfig); err != nil {
                global.GVA_LOG.Error("同步广告配置到Redis失败", zap.Error(err))
        }
}

// ReloadSystem
// @Tags      System
// @Summary   重载系统
// @Security  ApiKeyAuth
// @Produce   application/json
// @Success   200  {object}  response.Response{msg=string}  "重载系统"
// @Router    /system/reloadSystem [post]
func (s *SystemApi) ReloadSystem(c *gin.Context) {
        // 触发系统重载事件
        err := utils.GlobalSystemEvents.TriggerReload()
        if err != nil {
                global.GVA_LOG.Error("重载系统失败!", zap.Error(err))
                response.FailWithMessage("重载系统失败:"+err.Error(), c)
                return
        }
        response.OkWithMessage("重载系统成功", c)
}

// GetServerInfo
// @Tags      System
// @Summary   获取服务器信息
// @Security  ApiKeyAuth
// @Produce   application/json
// @Success   200  {object}  response.Response{data=map[string]interface{},msg=string}  "获取服务器信息"
// @Router    /system/getServerInfo [post]
func (s *SystemApi) GetServerInfo(c *gin.Context) {
        server, err := systemConfigService.GetServerInfo()
        if err != nil {
                global.GVA_LOG.Error("获取失败!", zap.Error(err))
                response.FailWithMessage("获取失败", c)
                return
        }
        response.OkWithDetailed(gin.H{"server": server}, "获取成功", c)
}
