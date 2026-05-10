package upload

import (
	"mime/multipart"
)

// OSS 接口定义
type OSS interface {
	UploadFile(file *multipart.FileHeader) (string, string, error)
	DeleteFile(key string) error
}

// NewOss 创建 OSS 实例
func NewOss() OSS {
	return &Local{}
}
