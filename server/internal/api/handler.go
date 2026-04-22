// Package api 提供HTTP API服务
package api

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/palemoky/fight-the-landlord/internal/crypto"
)

// Handler API处理器
type Handler struct {
	crypto       *crypto.AESCrypto
	agreement    *UserAgreementHandler
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

	// 创建用户协议处理器
	agreementHandler, err := NewUserAgreementHandler(dbConfig)
	if err != nil {
		return nil, err
	}

	return &Handler{
		crypto:       aesCrypto,
		agreement:    agreementHandler,
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

// EncryptMiddleware 加密中间件
func (h *Handler) EncryptMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !h.enableCrypto || h.crypto == nil {
			next(w, r)
			return
		}

		// 解密请求
		var encReq crypto.EncryptedRequest
		if err := json.NewDecoder(r.Body).Decode(&encReq); err != nil {
			h.WriteError(w, http.StatusBadRequest, "无效的请求格式")
			return
		}

		// 解密数据
		reqData, err := h.crypto.DecryptRequest(&encReq)
		if err != nil {
			h.WriteError(w, http.StatusBadRequest, "解密失败: "+err.Error())
			return
		}

		// 将解密后的数据存入上下文
		ctx := context.WithValue(r.Context(), RequestDataKey{}, reqData)
		*r = *r.WithContext(ctx)

		// 使用响应包装器
		rw := &responseWriter{
			ResponseWriter: w,
			handler:        h,
		}

		next(rw, r)
	}
}

// responseWriter 响应包装器，用于加密响应
type responseWriter struct {
	http.ResponseWriter
	handler *Handler
	written bool
}

// WriteJSON 重写WriteJSON方法，自动加密响应
func (rw *responseWriter) WriteJSON(data interface{}) error {
	if !rw.handler.enableCrypto || rw.handler.crypto == nil {
		return json.NewEncoder(rw).Encode(data)
	}

	// 将数据转为Response
	respData, ok := data.(Response)
	if !ok {
		// 如果不是Response类型，直接返回
		return json.NewEncoder(rw).Encode(data)
	}

	// 加密响应
	encResp, err := rw.handler.crypto.EncryptResponse(&crypto.ResponseData{
		Code:    respData.Code,
		Message: respData.Message,
		Data:    respData.Data,
	})
	if err != nil {
		return err
	}

	rw.Header().Set("Content-Type", "application/json; charset=utf-8")
	return json.NewEncoder(rw).Encode(encResp)
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
	if h.agreement != nil {
		return h.agreement.Close()
	}
	return nil
}
