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
        // 创建数据库配置
        var dbConfig *DBConfig
        if cfg.MySQL.Host != "" {
                dbConfig = &DBConfig{
                        Host:     cfg.MySQL.Host,
                        Port:     cfg.MySQL.Port,
                        User:     cfg.MySQL.User,
                        Password: cfg.MySQL.Password,
                        Database: cfg.MySQL.Database,
                }
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

        // 认证接口（不加密，方便前端调用）
        log.Println("📝 注册路由: /api/v1/auth/send-code")
        mux.HandleFunc("/api/v1/auth/send-code", corsMiddleware(h.auth.SendVerificationCode))
        log.Println("📝 注册路由: /api/v1/auth/phone-login")
        mux.HandleFunc("/api/v1/auth/phone-login", corsMiddleware(h.auth.PhoneLogin))
        log.Println("📝 注册路由: /api/v1/auth/wx-login")
        mux.HandleFunc("/api/v1/auth/wx-login", corsMiddleware(h.auth.WxLogin))
        log.Println("📝 注册路由: /api/v1/auth/wx-app-login")
        mux.HandleFunc("/api/v1/auth/wx-app-login", corsMiddleware(h.auth.WxAppLogin))

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

// corsMiddleware CORS中间件
// 注意：CORS已由Nginx处理，此处不再重复设置
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                // OPTIONS预检请求由Nginx处理，这里只处理实际请求
                if r.Method == "OPTIONS" {
                        w.WriteHeader(http.StatusOK)
                        return
                }
                next(w, r)
        }
}

// intToStr 整数转字符串
func intToStr(n int) string {
        return strconv.Itoa(n)
}
