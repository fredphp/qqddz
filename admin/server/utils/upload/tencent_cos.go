package upload

import (
	"errors"
	"mime/multipart"
)

type TencentCOS struct{}

func (t *TencentCOS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("腾讯云 COS 未配置，请在 config.yaml 中配置 tencent-cos 相关参数")
}

func (t *TencentCOS) DeleteFile(key string) error {
	return errors.New("腾讯云 COS 未配置")
}
