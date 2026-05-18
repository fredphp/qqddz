package upload

import (
	"errors"
	"mime/multipart"
)

type HuaWeiOBS struct{}

func (h *HuaWeiOBS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	return "", "", errors.New("华为云 OBS 未配置，请在 config.yaml 中配置 hua-wei-obs 相关参数")
}

func (h *HuaWeiOBS) DeleteFile(key string) error {
	return errors.New("华为云 OBS 未配置")
}
