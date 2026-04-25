package api

import (
        "context"
        "log"
        "net/http"
        "strconv"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/config"
)

// Server HTTP API服务器
type Server struct {
        server  *http.Server
        handler *Handler
}

// NewServer 创建HTTP API服务器
func NewServer(cfg *config.Config) (*Server, error) {
        // 打印MySQL配置信息用于调试
        log.Printf("📋 MySQL配置: Host=%s, Port=%d, User=%s, Database=%s", 
                cfg.MySQL.Host, cfg.MySQL.Port, cfg.MySQL.User, cfg.MySQL.Database)
        
        // 创建数据库配置
        var dbConfig *DBConfig
        if cfg.MySQL.Host != "" {
                dbConfig = &DBConfig{
                        Host:      cfg.MySQL.Host,
                        Port:      cfg.MySQL.Port,
                        User:      cfg.MySQL.User,
                        Password:  cfg.MySQL.Password,
                        Database:  cfg.MySQL.Database,
                        Charset:   "utf8mb4",
                        Collation: "utf8mb4_unicode_ci",
                }
                log.Printf("📋 创建dbConfig: %+v", dbConfig)
        } else {
                log.Printf("⚠️ cfg.MySQL.Host 为空，不创建dbConfig")
        }

        // 创建处理器
        handler, err := NewHandler(cfg.API.CryptoKey, cfg.API.EnableCrypto, dbConfig)
        if err != nil {
                return nil, err
        }

        // 创建路由
        mux := http.NewServeMux()

        // 注册路由
        RegisterRoutes(mux, handler)

        // 创建服务器
        addr := ":" + intToStr(cfg.API.Port)
        server := &http.Server{
                Addr:         addr,
                Handler:      mux,
                ReadTimeout:  10 * time.Second,
                WriteTimeout: 10 * time.Second,
                IdleTimeout:  60 * time.Second,
        }

        return &Server{
                server:  server,
                handler: handler,
        }, nil
}

// Start 启动HTTP API服务器
func (s *Server) Start() error {
        log.Printf("🚀 HTTP API服务器启动，监听端口: %s", s.server.Addr)
        return s.server.ListenAndServe()
}

// Shutdown 优雅关闭
func (s *Server) Shutdown(ctx context.Context) error {
        log.Println("📢 正在关闭HTTP API服务器...")
        if err := s.handler.Close(); err != nil {
                log.Printf("关闭数据库连接失败: %v", err)
        }
        return s.server.Shutdown(ctx)
}

// RegisterRoutes 注册路由
func RegisterRoutes(mux *http.ServeMux, h *Handler) {
        log.Println("📝 注册API路由...")

        // 认证接口（加密响应）
        // 注意：CORS由外层代理(ddzapi.qqddz.local)处理，这里不设置
        log.Println("📝 注册路由: /api/v1/auth/send-code")
        mux.HandleFunc("/api/v1/auth/send-code", h.EncryptMiddleware(h.auth.SendVerificationCode))
        log.Println("📝 注册路由: /api/v1/auth/phone-login")
        mux.HandleFunc("/api/v1/auth/phone-login", h.EncryptMiddleware(h.auth.PhoneLogin))
        log.Println("📝 注册路由: /api/v1/auth/wx-login")
        mux.HandleFunc("/api/v1/auth/wx-login", h.EncryptMiddleware(h.auth.WxLogin))
        log.Println("📝 注册路由: /api/v1/auth/wx-app-login")
        mux.HandleFunc("/api/v1/auth/wx-app-login", h.EncryptMiddleware(h.auth.WxAppLogin))

        // 公开接口（加密响应）
        log.Println("📝 注册路由: /api/v1/user-agreement/latest")
        mux.HandleFunc("/api/v1/user-agreement/latest", h.EncryptMiddleware(h.agreement.GetLatest))
        log.Println("📝 注册路由: /api/v1/user-agreement/get")
        mux.HandleFunc("/api/v1/user-agreement/get", h.EncryptMiddleware(h.agreement.GetByID))
        log.Println("📝 注册路由: /api/v1/user-agreement/list")
        mux.HandleFunc("/api/v1/user-agreement/list", h.EncryptMiddleware(h.agreement.List))

        // 内部接口（用于后台管理调用，刷新缓存，不加密）
        log.Println("📝 注册路由: /api/internal/cache/refresh/user-agreement")
        mux.HandleFunc("/api/internal/cache/refresh/user-agreement", h.agreement.RefreshCache)

        // 健康检查（不加密）
        log.Println("📝 注册路由: /api/health")
        mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
                w.WriteHeader(http.StatusOK)
                w.Write([]byte("OK"))
        })

        log.Println("✅ API路由注册完成")
}

// intToStr 整数转字符串
func intToStr(n int) string {
        return strconv.Itoa(n)
}
