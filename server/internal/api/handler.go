// Package api 提供HTTP API服务
package api

import (
        "bytes"
        "context"
        "encoding/json"
        "io"
        "log"
        "net/http"

        "github.com/palemoky/fight-the-landlord/internal/crypto"
        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// Handler API处理器
type Handler struct {
        crypto       *crypto.AESCrypto
        agreement    *UserAgreementHandler
        auth         *AuthHandler
        enableCrypto bool
}

// NewHandler 创建API处理器
func NewHandler(cryptoKey string, enableCrypto bool, dbConfig *DBConfig) (*Handler, error) {
        var aesCrypto *crypto.AESCrypto
        var err error

        if enableCrypto && cryptoKey != "" {
                aesCrypto, err = crypto.NewAESCrypto(cryptoKey)
                if err != nil {
                        return nil, err
                }
        }

        // 初始化数据库连接
        if dbConfig != nil && dbConfig.Host != "" {
                dbCfg := &database.DatabaseConfig{
                        Host:      dbConfig.Host,
                        Port:      dbConfig.Port,
                        Username:  dbConfig.User,
                        Password:  dbConfig.Password,
                        Database:  dbConfig.Database,
                        Charset:   dbConfig.Charset,
                        Collation: dbConfig.Collation,
                }
                log.Printf("🔗 正在连接数据库: %s@%s:%d/%s", dbCfg.Username, dbCfg.Host, dbCfg.Port, dbCfg.Database)
                if err := database.InitDB(dbCfg); err != nil {
                        log.Printf("⚠️ 数据库连接失败: %v，将使用模拟模式", err)
                        log.Printf("⚠️ 请检查: 1.MySQL服务是否启动 2.数据库'%s'是否存在 3.用户名密码是否正确", dbCfg.Database)
                } else {
                        log.Println("✅ 数据库连接成功")
                        // 自动迁移表结构
                        log.Println("📋 正在执行数据库表迁移...")
                        if err := database.GetInstance().AutoMigrate(); err != nil {
                                log.Printf("⚠️ 数据库表迁移失败: %v", err)
                        } else {
                                log.Println("✅ 数据库表迁移成功")
                        }
                }
        } else {
                log.Printf("⚠️ 未配置数据库(dbConfig=%v, Host=%s)，将使用模拟模式", dbConfig != nil, func() string {
                        if dbConfig != nil {
                                return dbConfig.Host
                        }
                        return ""
                }())
        }

        // 创建用户协议处理器
        agreementHandler, err := NewUserAgreementHandler(dbConfig)
        if err != nil {
                return nil, err
        }

        // 创建认证处理器
        authHandler := NewAuthHandler()

        // 启动验证码清理器
        StartCodeCleaner()

        return &Handler{
                crypto:       aesCrypto,
                agreement:    agreementHandler,
                auth:         authHandler,
                enableCrypto: enableCrypto,
        }, nil
}

// Response 统一响应结构
type Response struct {
        Code    int         `json:"code"`
        Message string      `json:"message"`
        Data    interface{} `json:"data,omitempty"`
}

// WriteJSON 写入JSON响应
func (h *Handler) WriteJSON(w http.ResponseWriter, code int, data interface{}) {
        w.Header().Set("Content-Type", "application/json; charset=utf-8")
        w.WriteHeader(code)
        json.NewEncoder(w).Encode(data)
}

// WriteSuccess 写入成功响应
func (h *Handler) WriteSuccess(w http.ResponseWriter, data interface{}) {
        h.WriteJSON(w, http.StatusOK, Response{
                Code:    0,
                Message: "success",
                Data:    data,
        })
}

// WriteError 写入错误响应
func (h *Handler) WriteError(w http.ResponseWriter, code int, message string) {
        h.WriteJSON(w, http.StatusOK, Response{
                Code:    code,
                Message: message,
        })
}

// EncryptMiddleware 加密中间件（支持GET请求，只加密响应）
func (h *Handler) EncryptMiddleware(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                log.Printf("🔐 EncryptMiddleware 处理请求: %s %s", r.Method, r.URL.Path)
                
                if !h.enableCrypto || h.crypto == nil {
                        log.Printf("🔐 加密未启用，直接处理请求")
                        next(w, r)
                        return
                }

                // 对于POST/PUT请求，尝试解密请求体
                if r.Method == http.MethodPost || r.Method == http.MethodPut {
                        // 读取请求体
                        bodyBytes, err := io.ReadAll(r.Body)
                        if err != nil {
                                log.Printf("⚠️ 读取请求体失败: %v", err)
                        } else {
                                // 恢复请求体供后续处理
                                r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
                                
                                var encReq crypto.EncryptedRequest
                                if err := json.Unmarshal(bodyBytes, &encReq); err == nil {
                                        // 解密数据
                                        reqData, err := h.crypto.DecryptRequest(&encReq)
                                        if err == nil {
                                                log.Printf("🔐 请求体解密成功")
                                                // 将解密后的数据存入上下文
                                                ctx := context.WithValue(r.Context(), RequestDataKey{}, reqData)
                                                *r = *r.WithContext(ctx)
                                        } else {
                                                log.Printf("🔐 请求体解密失败，使用原始数据: %v", err)
                                        }
                                } else {
                                        log.Printf("🔐 请求体非加密格式，使用原始数据")
                                }
                        }
                }

                // 使用响应包装器（加密响应）
                rw := &responseWriter{
                        ResponseWriter: w,
                        handler:        h,
                }

                next(rw, r)

                // 处理完成后刷新加密结果
                rw.FlushResult()
        }
}

// responseWriter 响应包装器，用于加密响应
type responseWriter struct {
        http.ResponseWriter
        handler   *Handler
        data      []byte
        written   bool
        collecting bool
}

// Write 拦截写入的数据
func (rw *responseWriter) Write(data []byte) (int, error) {
        if !rw.handler.enableCrypto || rw.handler.crypto == nil {
                return rw.ResponseWriter.Write(data)
        }

        // 收集数据
        rw.data = append(rw.data, data...)
        return len(data), nil
}

// FlushResult 处理收集的数据并加密输出
func (rw *responseWriter) FlushResult() error {
        if rw.written || len(rw.data) == 0 {
                return nil
        }
        rw.written = true

        // 解析原始响应
        var resp Response
        if err := json.Unmarshal(rw.data, &resp); err != nil {
                // 如果解析失败，直接返回原始数据
                return json.NewEncoder(rw.ResponseWriter).Encode(map[string]interface{}{
                        "code":    0,
                        "message": "success",
                        "data":    string(rw.data),
                })
        }

        // 加密响应
        encResp, err := rw.handler.crypto.EncryptResponse(&crypto.ResponseData{
                Code:    resp.Code,
                Message: resp.Message,
                Data:    resp.Data,
        })
        if err != nil {
                return err
        }

        rw.Header().Set("Content-Type", "application/json; charset=utf-8")
        return json.NewEncoder(rw.ResponseWriter).Encode(encResp)
}

// RequestDataKey 上下文键
type RequestDataKey struct{}

// GetRequestData 从上下文获取请求数据
func GetRequestData(r *http.Request) *crypto.RequestData {
        if v := r.Context().Value(RequestDataKey{}); v != nil {
                return v.(*crypto.RequestData)
        }
        return nil
}

// Close 关闭资源
func (h *Handler) Close() error {
        // 关闭数据库连接
        if database.GetInstance().IsConnected() {
                if err := database.CloseDB(); err != nil {
                        log.Printf("关闭数据库连接失败: %v", err)
                }
        }
        if h.agreement != nil {
                return h.agreement.Close()
        }
        return nil
}
