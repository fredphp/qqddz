package upload

import (
	"errors"
	"mime/multipart"
)

type CloudflareR2 struct{}

func (c *CloudflareR2) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("Cloudflare R2 未配置，请在 config.yaml 中配置 cloudflare-r2 相关参数")
}

func (c *CloudflareR2) DeleteFile(key string) error {
	return errors.New("Cloudflare R2 未配置")
}
