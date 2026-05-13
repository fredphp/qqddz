package api

import (
        "database/sql"
        "encoding/json"
        "fmt"
        "log"
        "net/http"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/cache"

        _ "github.com/go-sql-driver/mysql"
)

// 缓存键前缀
const (
        CacheKeyUserAgreementLatest = "user_agreement:latest"
        CacheKeyUserAgreementPrefix = "user_agreement:id:"
        CacheKeyUserAgreementList   = "user_agreement:list"
        CacheKeyHelpArticleLatest   = "help_article:latest"
        CacheKeyHelpArticleList     = "help_article:list"

        // 缓存永不过期，只有后台管理更新数据时才刷新缓存
        // CacheExpirationUserAgreement = 30 * time.Minute
)

// UserAgreement 用户协议模型
type UserAgreement struct {
        ID        uint      `json:"id"`
        CreatedAt time.Time `json:"createdAt"`
        UpdatedAt time.Time `json:"updatedAt"`
        Title     string    `json:"title"`
        Content   string    `json:"content"`
        Version   string    `json:"version"`
        Status    int       `json:"status"`
        Sort      int       `json:"sort"`
        Type      string    `json:"type"` // 类型: user_agreement, help, privacy
}

// UserAgreementHandler 用户协议处理器
type UserAgreementHandler struct {
        db    *sql.DB
        cache *cache.Cache
}

// NewUserAgreementHandler 创建用户协议处理器
func NewUserAgreementHandler(config *DBConfig) (*UserAgreementHandler, error) {
        if config == nil {
                return &UserAgreementHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
                config.User,
                config.Password,
                config.Host,
                config.Port,
                config.Database,
        )

        db, err := sql.Open("mysql", dsn)
        if err != nil {
                log.Printf("⚠️ 连接数据库失败，使用无数据库模式: %v", err)
                return &UserAgreementHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        // 测试连接
        if err := db.Ping(); err != nil {
                log.Printf("⚠️ 数据库连接测试失败，使用无数据库模式: %v", err)
                db.Close()
                return &UserAgreementHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        // 设置连接池
        db.SetMaxOpenConns(10)
        db.SetMaxIdleConns(5)
        db.SetConnMaxLifetime(time.Hour)

        return &UserAgreementHandler{
                db:    db,
                cache: cache.GetCache(),
        }, nil
}

// Close 关闭数据库连接
func (h *UserAgreementHandler) Close() error {
        if h.db != nil {
                return h.db.Close()
        }
        return nil
}

// ClearCache 清除用户协议相关缓存
func (h *UserAgreementHandler) ClearCache() {
        h.cache.Delete(CacheKeyUserAgreementLatest)
        h.cache.Delete(CacheKeyUserAgreementList)
        h.cache.DeleteByPrefix(CacheKeyUserAgreementPrefix)
}

// GetLatest 获取最新的启用的用户协议（带缓存）
func (h *UserAgreementHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
        if h.db == nil {
                // 没有数据库时返回默认数据
                writeJSONSuccess(w, &UserAgreement{
                        ID:        1,
                        Title:     "用户协议",
                        Content:   "欢迎使用本游戏！\n\n请在使用本游戏服务前，仔细阅读以下用户协议：\n\n1. 服务条款\n本游戏提供的服务仅供娱乐使用。用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n2. 用户账号\n用户应妥善保管账号信息，因个人原因导致账号丢失或被盗，本平台不承担责任。\n\n3. 虚拟货币\n游戏内的虚拟货币仅限本游戏内使用，不得进行任何形式的交易或转让。\n\n4. 行为规范\n用户不得利用外挂、漏洞等方式破坏游戏公平性，一经发现将永久封禁账号。\n\n5. 隐私保护\n我们重视用户隐私，不会向第三方泄露用户个人信息。\n\n6. 服务变更\n本平台有权随时修改服务内容，恕不另行通知。\n\n7. 免责声明\n因不可抗力导致的服务中断，本平台不承担责任。\n\n如有疑问，请联系客服。\n\n更新日期：2024年1月1日",
                        Version:   "v1.0.0",
                        Status:    1,
                        Sort:      1,
                        CreatedAt: time.Now(),
                        UpdatedAt: time.Now(),
                })
                return
        }

        // 尝试从缓存获取
        if value, exists := h.cache.Get(CacheKeyUserAgreementLatest); exists {
                if agreement, ok := value.(*UserAgreement); ok {
                        writeJSONSuccess(w, agreement)
                        return
                }
        }

        // 从数据库查询
        var agreement UserAgreement
        query := `SELECT id, created_at, updated_at, title, content, version, status, sort
                          FROM sys_user_agreement
                          WHERE status = 1 AND deleted_at IS NULL
                          ORDER BY sort ASC, created_at DESC
                          LIMIT 1`

        err := h.db.QueryRow(query).Scan(
                &agreement.ID,
                &agreement.CreatedAt,
                &agreement.UpdatedAt,
                &agreement.Title,
                &agreement.Content,
                &agreement.Version,
                &agreement.Status,
                &agreement.Sort,
        )

        if err != nil {
                if err == sql.ErrNoRows {
                        writeJSONSuccess(w, nil)
                        return
                }
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }

        // 缓存结果（永不过期，只有后台管理更新时才刷新）
        h.cache.Set(CacheKeyUserAgreementLatest, &agreement, 0)

        writeJSONSuccess(w, agreement)
}

// GetByID 根据ID获取用户协议（带缓存）
func (h *UserAgreementHandler) GetByID(w http.ResponseWriter, r *http.Request) {
        if h.db == nil {
                writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
                return
        }

        id := r.URL.Query().Get("id")
        if id == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少id参数")
                return
        }

        cacheKey := CacheKeyUserAgreementPrefix + id

        // 尝试从缓存获取
        if value, exists := h.cache.Get(cacheKey); exists {
                if agreement, ok := value.(*UserAgreement); ok {
                        writeJSONSuccess(w, agreement)
                        return
                }
        }

        var agreement UserAgreement
        query := `SELECT id, created_at, updated_at, title, content, version, status, sort
                          FROM sys_user_agreement
                          WHERE id = ? AND deleted_at IS NULL`

        err := h.db.QueryRow(query, id).Scan(
                &agreement.ID,
                &agreement.CreatedAt,
                &agreement.UpdatedAt,
                &agreement.Title,
                &agreement.Content,
                &agreement.Version,
                &agreement.Status,
                &agreement.Sort,
        )

        if err != nil {
                if err == sql.ErrNoRows {
                        writeJSONError(w, http.StatusNotFound, "用户协议不存在")
                        return
                }
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }

        // 缓存结果（永不过期，只有后台管理更新时才刷新）
        h.cache.Set(cacheKey, &agreement, 0)

        writeJSONSuccess(w, agreement)
}

// List 获取用户协议列表（带缓存）
func (h *UserAgreementHandler) List(w http.ResponseWriter, r *http.Request) {
        if h.db == nil {
                writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
                return
        }

        // 尝试从缓存获取
        if value, exists := h.cache.Get(CacheKeyUserAgreementList); exists {
                if agreements, ok := value.([]UserAgreement); ok {
                        writeJSONSuccess(w, agreements)
                        return
                }
        }

        query := `SELECT id, created_at, updated_at, title, content, version, status, sort
                          FROM sys_user_agreement
                          WHERE deleted_at IS NULL
                          ORDER BY sort ASC, created_at DESC`

        rows, err := h.db.Query(query)
        if err != nil {
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }
        defer rows.Close()

        var agreements []UserAgreement
        for rows.Next() {
                var agreement UserAgreement
                err := rows.Scan(
                        &agreement.ID,
                        &agreement.CreatedAt,
                        &agreement.UpdatedAt,
                        &agreement.Title,
                        &agreement.Content,
                        &agreement.Version,
                        &agreement.Status,
                        &agreement.Sort,
                )
                if err != nil {
                        writeJSONError(w, http.StatusInternalServerError, "解析数据失败: "+err.Error())
                        return
                }
                agreements = append(agreements, agreement)
        }

        if agreements == nil {
                agreements = []UserAgreement{}
        }

        // 缓存结果（永不过期，只有后台管理更新时才刷新）
        h.cache.Set(CacheKeyUserAgreementList, agreements, 0)

        writeJSONSuccess(w, agreements)
}

// RefreshCache 刷新缓存接口（内部调用）
func (h *UserAgreementHandler) RefreshCache(w http.ResponseWriter, r *http.Request) {
        // 只允许 POST 方法
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        // 清除缓存
        h.ClearCache()

        writeJSONSuccess(w, map[string]string{
                "message": "缓存已刷新",
        })
}

// writeJSONSuccess 写入成功响应
func writeJSONSuccess(w http.ResponseWriter, data interface{}) {
        w.Header().Set("Content-Type", "application/json; charset=utf-8")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(Response{
                Code:    0,
                Message: "success",
                Data:    data,
        })
}

// writeJSONError 写入错误响应
func writeJSONError(w http.ResponseWriter, code int, message string) {
        w.Header().Set("Content-Type", "application/json; charset=utf-8")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(Response{
                Code:    code,
                Message: message,
        })
}

// ==================== 帮助文章API ====================

// GetLatestHelpArticle 获取最新的帮助文章（带缓存）
func (h *UserAgreementHandler) GetLatestHelpArticle(w http.ResponseWriter, r *http.Request) {
        if h.db == nil {
                // 没有数据库时返回默认数据
                writeJSONSuccess(w, &UserAgreement{
                        ID:        1,
                        Title:     "游戏帮助",
                        Content:   getDefaultHelpContent(),
                        Version:   "v1.0.0",
                        Status:    1,
                        Sort:      1,
                        Type:      "help",
                        CreatedAt: time.Now(),
                        UpdatedAt: time.Now(),
                })
                return
        }

        // 尝试从缓存获取
        if value, exists := h.cache.Get(CacheKeyHelpArticleLatest); exists {
                if article, ok := value.(*UserAgreement); ok {
                        writeJSONSuccess(w, article)
                        return
                }
        }

        // 从数据库查询
        var article UserAgreement
        query := `SELECT id, created_at, updated_at, title, content, version, status, sort, type
                          FROM sys_user_agreement
                          WHERE status = 1 AND type = 'help' AND deleted_at IS NULL
                          ORDER BY sort ASC, created_at DESC
                          LIMIT 1`

        err := h.db.QueryRow(query).Scan(
                &article.ID,
                &article.CreatedAt,
                &article.UpdatedAt,
                &article.Title,
                &article.Content,
                &article.Version,
                &article.Status,
                &article.Sort,
                &article.Type,
        )

        if err != nil {
                if err == sql.ErrNoRows {
                        // 没有找到帮助文章，返回默认内容
                        writeJSONSuccess(w, &UserAgreement{
                                ID:        0,
                                Title:     "游戏帮助",
                                Content:   getDefaultHelpContent(),
                                Version:   "v1.0.0",
                                Status:    1,
                                Sort:      1,
                                Type:      "help",
                                CreatedAt: time.Now(),
                                UpdatedAt: time.Now(),
                        })
                        return
                }
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }

        // 缓存结果
        h.cache.Set(CacheKeyHelpArticleLatest, &article, 0)

        writeJSONSuccess(w, article)
}

// GetHelpArticleList 获取帮助文章列表（带缓存）
func (h *UserAgreementHandler) GetHelpArticleList(w http.ResponseWriter, r *http.Request) {
        if h.db == nil {
                writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
                return
        }

        // 尝试从缓存获取
        if value, exists := h.cache.Get(CacheKeyHelpArticleList); exists {
                if articles, ok := value.([]UserAgreement); ok {
                        writeJSONSuccess(w, articles)
                        return
                }
        }

        query := `SELECT id, created_at, updated_at, title, content, version, status, sort, type
                          FROM sys_user_agreement
                          WHERE status = 1 AND type = 'help' AND deleted_at IS NULL
                          ORDER BY sort ASC, created_at DESC`

        rows, err := h.db.Query(query)
        if err != nil {
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }
        defer rows.Close()

        var articles []UserAgreement
        for rows.Next() {
                var article UserAgreement
                err := rows.Scan(
                        &article.ID,
                        &article.CreatedAt,
                        &article.UpdatedAt,
                        &article.Title,
                        &article.Content,
                        &article.Version,
                        &article.Status,
                        &article.Sort,
                        &article.Type,
                )
                if err != nil {
                        writeJSONError(w, http.StatusInternalServerError, "解析数据失败: "+err.Error())
                        return
                }
                articles = append(articles, article)
        }

        if articles == nil {
                articles = []UserAgreement{}
        }

        // 缓存结果
        h.cache.Set(CacheKeyHelpArticleList, articles, 0)

        writeJSONSuccess(w, articles)
}

// ClearHelpCache 清除帮助文章缓存
func (h *UserAgreementHandler) ClearHelpCache() {
        h.cache.Delete(CacheKeyHelpArticleLatest)
        h.cache.Delete(CacheKeyHelpArticleList)
}

// getDefaultHelpContent 获取默认帮助内容
func getDefaultHelpContent() string {
        return `【游戏规则】

本游戏为经典斗地主扑克牌游戏，支持3人玩法。

【基本规则】
• 一副牌54张，一人17张，留3张做底牌
• 叫地主：玩家可选择叫地主或不叫，叫地主者获得3张底牌
• 出牌：地主先出牌，按逆时针顺序出牌
• 牌型：单张、对子、三张、三带一、三带二、顺子、连对、飞机、炸弹、王炸等

【牌型大小】
• 王炸 > 炸弹 > 其他牌型
• 同牌型按点数比较大小
• 大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3

【获胜条件】
• 地主：先出完所有牌即获胜
• 农民：任一农民先出完牌，农民方获胜

【货币说明】
• 欢乐豆：普通场游戏货币，用于报名参赛
• 竞技币：竞技场专用货币，参与锦标赛使用

【联系客服】
如有问题，请联系客服处理。`
}
