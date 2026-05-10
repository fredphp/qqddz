package upload

import (
	"errors"
	"mime/multipart"
)

// Minio MinIO对象存储
type Minio struct{}

// UploadFile 上传文件到MinIO
func (m *Minio) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("MinIO未配置")
}

// DeleteFile 删除MinIO文件
func (m *Minio) DeleteFile(key string) error {
	return errors.New("MinIO未配置")
}
