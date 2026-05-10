package upload

import (
	"errors"
	"mime/multipart"
)

// TencentCOS 腾讯云对象存储
type TencentCOS struct{}

// UploadFile 上传文件到腾讯云COS
func (t *TencentCOS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("腾讯云COS未配置")
}

// DeleteFile 删除腾讯云COS文件
func (t *TencentCOS) DeleteFile(key string) error {
	return errors.New("腾讯云COS未配置")
}
