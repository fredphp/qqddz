package upload

import (
	"errors"
	"mime/multipart"
)

// Qiniu 七牛云对象存储
type Qiniu struct{}

// UploadFile 上传文件到七牛云
func (q *Qiniu) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("七牛云OSS未配置")
}

// DeleteFile 删除七牛云文件
func (q *Qiniu) DeleteFile(key string) error {
	return errors.New("七牛云OSS未配置")
}
