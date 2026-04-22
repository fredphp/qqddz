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
        // 公开接口（不需要加密）
        mux.HandleFunc("/api/v1/user-agreement/latest", h.agreement.GetLatest)
        mux.HandleFunc("/api/v1/user-agreement/get", h.agreement.GetByID)
        mux.HandleFunc("/api/v1/user-agreement/list", h.agreement.List)

        // 健康检查
        mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
                w.WriteHeader(http.StatusOK)
                w.Write([]byte("OK"))
        })
}

// intToStr 整数转字符串
func intToStr(n int) string {
        return strconv.Itoa(n)
}
