package system

import (
        "context"
        "encoding/json"
        "strconv"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
        "github.com/flipped-aurora/gin-vue-admin/server/model/system"
        sysrequest "github.com/flipped-aurora/gin-vue-admin/server/model/system/request"
commonrequest "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
        "github.com/flipped-aurora/gin-vue-admin/server/utils/game_server"
        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
)

// Redis key 常量
const (
        RedisKeyHelpArticleList = "ddz:help_article:list"
        RedisKeyUserAgreementList = "ddz:user_agreement:list"
)

// syncHelpArticlesToRedis 同步帮助文章到Redis
func syncHelpArticlesToRedis() {
        if global.GVA_REDIS == nil {
                global.GVA_LOG.Warn("Redis未配置，跳过同步帮助文章到Redis")
                return
        }

        ctx := context.Background()

        // 查询所有启用的帮助文章
        var articles []system.SysUserAgreement
        if err := global.GVA_DB.Where("status = 1 AND type = ?", "help").
                Order("sort ASC, created_at DESC").
                Find(&articles).Error; err != nil {
                global.GVA_LOG.Error("查询帮助文章失败", zap.Error(err))
                return
        }

        // 序列化并写入Redis
        data, err := json.Marshal(articles)
        if err != nil {
                global.GVA_LOG.Error("序列化帮助文章失败", zap.Error(err))
                return
        }

        if err := global.GVA_REDIS.Set(ctx, RedisKeyHelpArticleList, string(data), 0).Err(); err != nil {
                global.GVA_LOG.Error("写入Redis失败", zap.Error(err))
                return
        }

        global.GVA_LOG.Info("✅ 帮助文章已同步到Redis", zap.Int("count", len(articles)))
}

// syncUserAgreementsToRedis 同步用户协议到Redis
func syncUserAgreementsToRedis() {
        if global.GVA_REDIS == nil {
                global.GVA_LOG.Warn("Redis未配置，跳过同步用户协议到Redis")
                return
        }

        ctx := context.Background()

        // 查询所有启用的用户协议
        var agreements []system.SysUserAgreement
        if err := global.GVA_DB.Where("status = 1 AND type = ?", "user_agreement").
                Order("sort ASC, created_at DESC").
                Find(&agreements).Error; err != nil {
                global.GVA_LOG.Error("查询用户协议失败", zap.Error(err))
                return
        }

        // 序列化并写入Redis
        data, err := json.Marshal(agreements)
        if err != nil {
                global.GVA_LOG.Error("序列化用户协议失败", zap.Error(err))
                return
        }

        if err := global.GVA_REDIS.Set(ctx, RedisKeyUserAgreementList, string(data), 0).Err(); err != nil {
                global.GVA_LOG.Error("写入Redis失败", zap.Error(err))
                return
        }

        global.GVA_LOG.Info("✅ 用户协议已同步到Redis", zap.Int("count", len(agreements)))
}

// syncAllToRedis 同步所有单页内容到Redis
func syncAllToRedis() {
        syncHelpArticlesToRedis()
        syncUserAgreementsToRedis()
}

// SysUserAgreementApi 用户协议API
type SysUserAgreementApi struct{}

// GetSysUserAgreementList 获取用户协议/单页列表
// @Tags SysUserAgreement
// @Summary 分页获取用户协议/单页列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query sysrequest.SysUserAgreementSearch true "分页参数"
// @Success 200 {object} response.Response{data=response.PageResult} "成功"
// @Router /sysUserAgreement/getSysUserAgreementList [get]
func (a *SysUserAgreementApi) GetSysUserAgreementList(c *gin.Context) {
        var req sysrequest.SysUserAgreementSearch
        if err := c.ShouldBindQuery(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        // 设置默认分页
        if req.Page == 0 {
                req.Page = 1
        }
        if req.PageSize == 0 {
                req.PageSize = 10
        }

        var agreements []system.SysUserAgreement
        var total int64

        db := global.GVA_DB.Model(&system.SysUserAgreement{})

        // 条件搜索
        if req.Title != "" {
                db = db.Where("title LIKE ?", "%"+req.Title+"%")
        }
        if req.Status != nil {
                db = db.Where("status = ?", *req.Status)
        }
        if req.Type != "" {
                db = db.Where("type = ?", req.Type)
        }

        // 统计总数
        db.Count(&total)

        // 分页查询
        offset := (req.Page - 1) * req.PageSize
        if err := db.Order("sort ASC, created_at DESC").Offset(offset).Limit(req.PageSize).Find(&agreements).Error; err != nil {
                global.GVA_LOG.Error("获取列表失败!", zap.Error(err))
                response.FailWithMessage("获取列表失败", c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     agreements,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// CreateSysUserAgreement 创建用户协议
// @Tags SysUserAgreement
// @Summary 创建用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body sysrequest.SysUserAgreementCreate true "创建请求"
// @Success 200 {object} response.Response "成功"
// @Router /sysUserAgreement/createSysUserAgreement [post]
func (a *SysUserAgreementApi) CreateSysUserAgreement(c *gin.Context) {
        var req sysrequest.SysUserAgreementCreate
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        agreement := system.SysUserAgreement{
                Title:   req.Title,
                Content: req.Content,
                Version: req.Version,
                Status:  req.Status,
                Sort:    req.Sort,
                Type:    req.Type,
        }

        if agreement.Type == "" {
                agreement.Type = "user_agreement"
        }

        if err := global.GVA_DB.Create(&agreement).Error; err != nil {
                global.GVA_LOG.Error("创建失败!", zap.Error(err))
                response.FailWithMessage("创建失败", c)
                return
        }

        // 同步到Redis
        syncAllToRedis()

        // 刷新游戏服务器缓存
        game_server.RefreshUserAgreementCache()

        response.OkWithMessage("创建成功", c)
}

// UpdateSysUserAgreement 更新用户协议
// @Tags SysUserAgreement
// @Summary 更新用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body sysrequest.SysUserAgreementUpdate true "更新请求"
// @Success 200 {object} response.Response "成功"
// @Router /sysUserAgreement/updateSysUserAgreement [put]
func (a *SysUserAgreementApi) UpdateSysUserAgreement(c *gin.Context) {
        var req sysrequest.SysUserAgreementUpdate
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        var agreement system.SysUserAgreement
        if err := global.GVA_DB.First(&agreement, req.ID).Error; err != nil {
                response.FailWithMessage("记录不存在", c)
                return
        }

        updates := map[string]interface{}{}
        if req.Title != "" {
                updates["title"] = req.Title
        }
        if req.Content != "" {
                updates["content"] = req.Content
        }
        if req.Version != "" {
                updates["version"] = req.Version
        }
        if req.Status != nil {
                updates["status"] = *req.Status
        }
        if req.Sort != nil {
                updates["sort"] = *req.Sort
        }
        if req.Type != "" {
                updates["type"] = req.Type
        }

        if err := global.GVA_DB.Model(&agreement).Updates(updates).Error; err != nil {
                global.GVA_LOG.Error("更新失败!", zap.Error(err))
                response.FailWithMessage("更新失败", c)
                return
        }

        // 同步到Redis
        syncAllToRedis()

        // 刷新游戏服务器缓存
        game_server.RefreshUserAgreementCache()

        response.OkWithMessage("更新成功", c)
}

// DeleteSysUserAgreement 删除用户协议
// @Tags SysUserAgreement
// @Summary 删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id query uint true "ID"
// @Success 200 {object} response.Response "成功"
// @Router /sysUserAgreement/deleteSysUserAgreement [delete]
func (a *SysUserAgreementApi) DeleteSysUserAgreement(c *gin.Context) {
        // 兼容大小写参数
        idStr := c.Query("ID")
        if idStr == "" {
                idStr = c.Query("id")
        }
        id, err := strconv.ParseUint(idStr, 10, 64)
        if err != nil {
                response.FailWithMessage("无效的ID", c)
                return
        }

        if err := global.GVA_DB.Delete(&system.SysUserAgreement{}, id).Error; err != nil {
                global.GVA_LOG.Error("删除失败!", zap.Error(err))
                response.FailWithMessage("删除失败", c)
                return
        }

        // 同步到Redis
        syncAllToRedis()

        // 刷新游戏服务器缓存
        game_server.RefreshUserAgreementCache()

        response.OkWithMessage("删除成功", c)
}

// DeleteSysUserAgreementByIds 批量删除用户协议
// @Tags SysUserAgreement
// @Summary 批量删除用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body commonrequest.IdsReq true "ID列表"
// @Success 200 {object} response.Response "成功"
// @Router /sysUserAgreement/deleteSysUserAgreementByIds [delete]
func (a *SysUserAgreementApi) DeleteSysUserAgreementByIds(c *gin.Context) {
        var req commonrequest.IdsReq
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        if err := global.GVA_DB.Delete(&[]system.SysUserAgreement{}, "id IN ?", req.Ids).Error; err != nil {
                global.GVA_LOG.Error("批量删除失败!", zap.Error(err))
                response.FailWithMessage("批量删除失败", c)
                return
        }

        // 同步到Redis
        syncAllToRedis()

        // 刷新游戏服务器缓存
        game_server.RefreshUserAgreementCache()

        response.OkWithMessage("批量删除成功", c)
}

// FindSysUserAgreement 根据ID查询用户协议
// @Tags SysUserAgreement
// @Summary 根据ID查询用户协议
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id query uint true "ID"
// @Success 200 {object} response.Response{data=system.SysUserAgreement} "成功"
// @Router /sysUserAgreement/findSysUserAgreement [get]
func (a *SysUserAgreementApi) FindSysUserAgreement(c *gin.Context) {
        // 兼容大小写参数
        idStr := c.Query("ID")
        if idStr == "" {
                idStr = c.Query("id")
        }
        id, err := strconv.ParseUint(idStr, 10, 64)
        if err != nil {
                response.FailWithMessage("无效的ID", c)
                return
        }

        var agreement system.SysUserAgreement
        if err := global.GVA_DB.First(&agreement, id).Error; err != nil {
                response.FailWithMessage("记录不存在", c)
                return
        }

        response.OkWithDetailed(agreement, "查询成功", c)
}

// GetLatestUserAgreement 获取最新的用户协议（公开接口，不需要登录）
// @Tags SysUserAgreement
// @Summary 获取最新的用户协议
// @accept application/json
// @Produce application/json
// @Param type query string false "类型" default(user_agreement)
// @Success 200 {object} response.Response{data=system.SysUserAgreement} "成功"
// @Router /sysUserAgreement/getLatestUserAgreement [get]
func (a *SysUserAgreementApi) GetLatestUserAgreement(c *gin.Context) {
        articleType := c.DefaultQuery("type", "user_agreement")

        var agreement system.SysUserAgreement
        if err := global.GVA_DB.Where("status = 1 AND type = ?", articleType).
                Order("sort ASC, created_at DESC").
                First(&agreement).Error; err != nil {
                response.FailWithMessage("暂无数据", c)
                return
        }

        response.OkWithDetailed(agreement, "获取成功", c)
}

// SetUserAgreementStatus 设置用户协议状态
// @Tags SysUserAgreement
// @Summary 设置用户协议状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body sysrequest.SysUserAgreementStatus true "状态请求"
// @Success 200 {object} response.Response "成功"
// @Router /sysUserAgreement/setUserAgreementStatus [put]
func (a *SysUserAgreementApi) SetUserAgreementStatus(c *gin.Context) {
        var req sysrequest.SysUserAgreementStatus
        
        // 优先从URL参数获取，如果没有则从JSON请求体获取
        idStr := c.Query("id")
        statusStr := c.Query("status")
        
        if idStr != "" && statusStr != "" {
                // 从URL参数获取
                id, err := strconv.ParseUint(idStr, 10, 64)
                if err != nil {
                        response.FailWithMessage("无效的ID", c)
                        return
                }
                status, err := strconv.Atoi(statusStr)
                if err != nil {
                        response.FailWithMessage("无效的状态", c)
                        return
                }
                req.ID = uint(id)
                req.Status = status
        } else {
                // 从JSON请求体获取
                if err := c.ShouldBindJSON(&req); err != nil {
                        response.FailWithMessage(err.Error(), c)
                        return
                }
        }

        if err := global.GVA_DB.Model(&system.SysUserAgreement{}).Where("id = ?", req.ID).Update("status", req.Status).Error; err != nil {
                global.GVA_LOG.Error("设置状态失败!", zap.Error(err))
                response.FailWithMessage("设置状态失败", c)
                return
        }

        // 同步到Redis
        syncAllToRedis()

        // 刷新游戏服务器缓存
        game_server.RefreshUserAgreementCache()

        response.OkWithMessage("设置成功", c)
}

// GetHelpArticleList 获取帮助文章列表（公开接口）
// @Tags SysUserAgreement
// @Summary 获取帮助文章列表
// @accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]system.SysUserAgreement} "成功"
// @Router /sysUserAgreement/getHelpArticleList [get]
func (a *SysUserAgreementApi) GetHelpArticleList(c *gin.Context) {
        var articles []system.SysUserAgreement

        if err := global.GVA_DB.Where("status = 1 AND type = ?", "help").
                Order("sort ASC, created_at DESC").
                Find(&articles).Error; err != nil {
                response.FailWithMessage("获取失败", c)
                return
        }

        response.OkWithDetailed(articles, "获取成功", c)
}

// GetLatestHelpArticle 获取最新的帮助文章（公开接口）
// @Tags SysUserAgreement
// @Summary 获取最新的帮助文章
// @accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=system.SysUserAgreement} "成功"
// @Router /sysUserAgreement/getLatestHelpArticle [get]
func (a *SysUserAgreementApi) GetLatestHelpArticle(c *gin.Context) {
        var article system.SysUserAgreement

        if err := global.GVA_DB.Where("status = 1 AND type = ?", "help").
                Order("sort ASC, created_at DESC").
                First(&article).Error; err != nil {
                response.FailWithMessage("暂无帮助文章", c)
                return
        }

        response.OkWithDetailed(article, "获取成功", c)
}
