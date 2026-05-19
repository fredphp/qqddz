package upload

import (
	"mime/multipart"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// OSS 对象存储接口
type OSS interface {
	UploadFile(file *multipart.FileHeader) (string, string, error)
	DeleteFile(key string) error
}

// NewOss 根据配置创建 OSS 实例
func NewOss() OSS {
	ossType := global.GVA_CONFIG.System.OssType
	switch ossType {
	case "aliyun-oss":
		return &AliyunOSS{}
	case "local", "":
		return &Local{}
	default:
		// 默认使用本地存储
		return &Local{}
	}
}
