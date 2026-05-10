package upload

import (
	"errors"
	"mime/multipart"
)

// HuaWeiObs 华为云对象存储
type HuaWeiObs struct{}

// UploadFile 上传文件到华为云OBS
func (h *HuaWeiObs) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("华为云OBS未配置")
}

// DeleteFile 删除华为云OBS文件
func (h *HuaWeiObs) DeleteFile(key string) error {
	return errors.New("华为云OBS未配置")
}
