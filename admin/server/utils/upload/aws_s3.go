package upload

import (
	"errors"
	"mime/multipart"
)

type AwsS3 struct{}

func (a *AwsS3) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("AWS S3 未配置，请在 config.yaml 中配置 aws-s3 相关参数")
}

func (a *AwsS3) DeleteFile(key string) error {
	return errors.New("AWS S3 未配置")
}
