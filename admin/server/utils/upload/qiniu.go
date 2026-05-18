package upload

import (
	"errors"
	"mime/multipart"
)

type Qiniu struct{}

func (q *Qiniu) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("七牛云 OSS 未配置，请在 config.yaml 中配置 qiniu 相关参数")
}

func (q *Qiniu) DeleteFile(key string) error {
	return errors.New("七牛云 OSS 未配置")
}
