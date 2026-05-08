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
	roomConfig   *RoomConfigHandler
	adConfig     *AdConfigHandler
	adReward     *AdRewardHandler
	arena        *ArenaHandler
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

	// 🔧【修复】不再在此处初始化数据库，改为检查是否已初始化
	// 数据库初始化已移至 main.go 中独立执行，确保 WebSocket 服务也能正常保存数据
	if dbConfig != nil && dbConfig.Host != "" {
		if !database.GetInstance().IsConnected() {
			log.Printf("⚠️ 数据库未连接！API 功能可能受限")
			log.Printf("⚠️ 请检查 MySQL 配置是否正确: %s@%s:%d/%s", dbConfig.User, dbConfig.Host, dbConfig.Port, dbConfig.Database)
		} else {
			log.Println("✅ 数据库连接正常（已在启动时初始化）")
		}
	} else {
		log.Printf("⚠️ 未配置数据库(dbConfig=%v)，部分API功能可能受限", dbConfig != nil)
	}

	// 创建用户协议处理器
	agreementHandler, err := NewUserAgreementHandler(dbConfig)
	if err != nil {
		return nil, err
	}

	// 创建认证处理器
	authHandler := NewAuthHandler()

	// 创建房间配置处理器
	roomConfigHandler, err := NewRoomConfigHandler(dbConfig)
	if err != nil {
		return nil, err
	}

	// 创建广告配置处理器
	adConfigHandler := NewAdConfigHandler()

	// 创建广告奖励处理器
	adRewardHandler := NewAdRewardHandler()

	// 创建竞技场处理器
	arenaHandler := NewArenaHandler()

	// 启动验证码清理器
	StartCodeCleaner()

	return &Handler{
		crypto:       aesCrypto,
		agreement:    agreementHandler,
		auth:         authHandler,
		roomConfig:   roomConfigHandler,
		adConfig:     adConfigHandler,
		adReward:     adRewardHandler,
		arena:        arenaHandler,
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
				log.Printf("🔐 请求体长度: %d 字节", len(bodyBytes))

				// 恢复请求体供后续处理
				r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

				var encReq crypto.EncryptedRequest
				if err := json.Unmarshal(bodyBytes, &encReq); err == nil {
					log.Printf("🔐 解析加密请求成功 - timestamp: %d, nonce: %s, data长度: %d",
						encReq.Timestamp, encReq.Nonce, len(encReq.Data))

					// 解密数据
					reqData, err := h.crypto.DecryptRequest(&encReq)
					if err == nil {
						log.Printf("🔐 请求体解密成功 - action: %s", reqData.Action)
						log.Printf("🔐 解密后的参数: %+v", reqData.Params)
						// 将解密后的数据存入上下文
						ctx := context.WithValue(r.Context(), RequestDataKey{}, reqData)
						*r = *r.WithContext(ctx)
					} else {
						log.Printf("❌ 请求体解密失败: %v", err)
					}
				} else {
					log.Printf("🔐 请求体非加密格式: %v", err)
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
	// 停止分表定时调度器
	database.StopPartitionScheduler()

	// 注意：数据库连接在 main.go 中统一关闭，这里不再关闭
	// 如果数据库已连接，只打印日志
	if database.GetInstance().IsConnected() {
		log.Println("📢 Handler 关闭，数据库连接将由主程序管理")
	}
	if h.agreement != nil {
		h.agreement.Close()
	}
	if h.roomConfig != nil {
		h.roomConfig.Close()
	}
	return nil
}
