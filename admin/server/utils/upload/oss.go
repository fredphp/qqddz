package upload

import (
	"mime/multipart"
)

// Oss OSS接口定义
type Oss interface {
	UploadFile(file *multipart.FileHeader) (string, string, error)
	DeleteFile(key string) error
}

// NewOss 根据配置返回对应的OSS实现
func NewOss() Oss {
	// 默认使用本地存储
	return &Local{}
}
