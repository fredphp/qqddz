// Package crypto 提供API数据加密功能
package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"time"
)

var (
	ErrInvalidKey        = errors.New("无效的加密密钥，密钥长度必须为16、24或32字节")
	ErrInvalidCiphertext = errors.New("无效的密文")
	ErrInvalidNonce      = errors.New("无效的nonce")
	ErrTimestampExpired  = errors.New("时间戳已过期")
)

// AESCrypto AES加密器
type AESCrypto struct {
	key []byte
}

// NewAESCrypto 创建AES加密器
// key 支持16字节(AES-128)、24字节(AES-192)、32字节(AES-256)
func NewAESCrypto(key string) (*AESCrypto, error) {
	// 尝试作为hex解码
	keyBytes, err := hex.DecodeString(key)
	if err != nil {
		// 如果不是hex，直接使用字符串作为密钥
		keyBytes = []byte(key)
	}

	// 验证密钥长度
	kLen := len(keyBytes)
	if kLen != 16 && kLen != 24 && kLen != 32 {
		return nil, ErrInvalidKey
	}

	return &AESCrypto{key: keyBytes}, nil
}

// Encrypt AES-GCM加密
func (a *AESCrypto) Encrypt(plaintext []byte) (string, error) {
	block, err := aes.NewCipher(a.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt AES-GCM解密
func (a *AESCrypto) Decrypt(ciphertext string) ([]byte, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, ErrInvalidCiphertext
	}

	block, err := aes.NewCipher(a.key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, ErrInvalidNonce
	}

	nonce, cipherData := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, cipherData, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

// EncryptedRequest 加密请求结构
type EncryptedRequest struct {
	Data      string `json:"data"`      // 加密后的数据
	Timestamp int64  `json:"timestamp"` // 时间戳（毫秒）
	Nonce     string `json:"nonce"`     // 随机字符串，防重放
}

// EncryptedResponse 加密响应结构
type EncryptedResponse struct {
	Data      string `json:"data"`      // 加密后的数据
	Timestamp int64  `json:"timestamp"` // 时间戳（毫秒）
}

// RequestData 请求数据结构
type RequestData struct {
	Action string      `json:"action"`
	Params interface{} `json:"params,omitempty"`
}

// ResponseData 响应数据结构
type ResponseData struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// TimestampTolerance 时间戳容忍度（默认5分钟）
const TimestampTolerance = 5 * 60 * 1000

// ValidateTimestamp 验证时间戳
func (r *EncryptedRequest) ValidateTimestamp() error {
	now := time.Now().UnixMilli()
	diff := now - r.Timestamp
	if diff < 0 {
		diff = -diff
	}
	if diff > TimestampTolerance {
		return ErrTimestampExpired
	}
	return nil
}

// EncryptResponse 加密响应数据
func (a *AESCrypto) EncryptResponse(data *ResponseData) (*EncryptedResponse, error) {
	// 将响应数据序列化为JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	// 加密
	encrypted, err := a.Encrypt(jsonData)
	if err != nil {
		return nil, err
	}

	return &EncryptedResponse{
		Data:      encrypted,
		Timestamp: time.Now().UnixMilli(),
	}, nil
}

// DecryptRequest 解密请求数据
func (a *AESCrypto) DecryptRequest(req *EncryptedRequest) (*RequestData, error) {
	// 验证时间戳
	if err := req.ValidateTimestamp(); err != nil {
		return nil, err
	}

	// 解密
	plaintext, err := a.Decrypt(req.Data)
	if err != nil {
		return nil, err
	}

	// 解析JSON
	var data RequestData
	if err := json.Unmarshal(plaintext, &data); err != nil {
		return nil, err
	}

	return &data, nil
}

// SimpleEncrypt 简单加密（用于非结构化数据）
func (a *AESCrypto) SimpleEncrypt(plaintext string) (string, error) {
	return a.Encrypt([]byte(plaintext))
}

// SimpleDecrypt 简单解密（用于非结构化数据）
func (a *AESCrypto) SimpleDecrypt(ciphertext string) (string, error) {
	plaintext, err := a.Decrypt(ciphertext)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}
