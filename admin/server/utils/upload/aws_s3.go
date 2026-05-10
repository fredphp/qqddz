package upload

import (
	"errors"
	"mime/multipart"
)

// AwsS3 AWS S3对象存储
type AwsS3 struct{}

// UploadFile 上传文件到AWS S3
func (a *AwsS3) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("AWS S3未配置")
}

// DeleteFile 删除AWS S3文件
func (a *AwsS3) DeleteFile(key string) error {
	return errors.New("AWS S3未配置")
}
