package middleware

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
        "github.com/flipped-aurora/gin-vue-admin/server/model/system"
        "github.com/flipped-aurora/gin-vue-admin/server/utils"
        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
        "strconv"
        "strings"
        "sync"
        "time"
)

// ignoreApiCache 忽略API缓存
var (
        ignoreApiCache     map[string]bool
        ignoreApiCacheMu   sync.RWMutex
        ignoreApiCacheTime time.Time
)

// isIgnoredApi 检查API是否在忽略列表中
func isIgnoredApi(path, method string) bool {
        ignoreApiCacheMu.RLock()
        // 缓存有效期为5分钟
        if ignoreApiCache != nil && time.Since(ignoreApiCacheTime) < 5*time.Minute {
                _, exists := ignoreApiCache[path+":"+method]
                ignoreApiCacheMu.RUnlock()
                return exists
        }
        ignoreApiCacheMu.RUnlock()

        // 重新加载缓存
        ignoreApiCacheMu.Lock()
        defer ignoreApiCacheMu.Unlock()

        // 双重检查
        if ignoreApiCache != nil && time.Since(ignoreApiCacheTime) < 5*time.Minute {
                _, exists := ignoreApiCache[path+":"+method]
                return exists
        }

        // 从数据库加载
        var ignoreApis []system.SysIgnoreApi
        if err := global.GVA_DB.Find(&ignoreApis).Error; err == nil {
                ignoreApiCache = make(map[string]bool)
                for _, api := range ignoreApis {
                        ignoreApiCache[api.Path+":"+api.Method] = true
                }
                ignoreApiCacheTime = time.Now()
        }

        _, exists := ignoreApiCache[path+":"+method]
        return exists
}

// CasbinHandler 拦截器
func CasbinHandler() gin.HandlerFunc {
        return func(c *gin.Context) {
                // 获取请求的PATH
                path := c.Request.URL.Path
                obj := strings.TrimPrefix(path, global.GVA_CONFIG.System.RouterPrefix)
                // 获取请求方法
                act := c.Request.Method

                // 检查是否在忽略列表中
                if isIgnoredApi(obj, act) {
                        c.Next()
                        return
                }

                waitUse, _ := utils.GetClaims(c)
                // 获取用户的角色
                sub := strconv.Itoa(int(waitUse.AuthorityId))
                e := utils.GetCasbin() // 判断策略中是否存在
                
                // 如果 Casbin 未初始化，记录错误并放行（避免 panic）
                if e == nil {
                        global.GVA_LOG.Warn("Casbin 未初始化，跳过权限检查", 
                                zap.String("path", obj), 
                                zap.String("method", act))
                        c.Next()
                        return
                }
                
                success, _ := e.Enforce(sub, obj, act)
                if !success {
                        response.FailWithDetailed(gin.H{}, "权限不足", c)
                        c.Abort()
                        return
                }
                c.Next()
        }
}
