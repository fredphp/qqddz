package upload

import (
	"errors"
	"mime/multipart"
)

// CloudflareR2 Cloudflare R2对象存储
type CloudflareR2 struct{}

// UploadFile 上传文件到Cloudflare R2
func (c *CloudflareR2) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("Cloudflare R2未配置")
}

// DeleteFile 删除Cloudflare R2文件
func (c *CloudflareR2) DeleteFile(key string) error {
	return errors.New("Cloudflare R2未配置")
}
