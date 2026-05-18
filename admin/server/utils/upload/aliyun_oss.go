package upload

import (
	"errors"
	"mime/multipart"
)

type AliyunOSS struct{}

func (a *AliyunOSS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("阿里云 OSS 未配置，请在 config.yaml 中配置 aliyun-oss 相关参数")
}

func (a *AliyunOSS) DeleteFile(key string) error {
	return errors.New("阿里云 OSS 未配置")
}
