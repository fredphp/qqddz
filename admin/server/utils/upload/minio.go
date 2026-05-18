package upload

import (
	"errors"
	"mime/multipart"
)

type Minio struct{}

func (m *Minio) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("Minio OSS 未配置，请在 config.yaml 中配置 minio 相关参数")
}

func (m *Minio) DeleteFile(key string) error {
	return errors.New("Minio OSS 未配置")
}
