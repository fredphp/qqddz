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

// NewOss 创建OSS实例
func NewOss() OSS {
	switch global.GVA_CONFIG.System.OssType {
	case "local":
		return &Local{}
	case "aliyun-oss":
		return &AliyunOSS{}
	case "qiniu":
		return &Qiniu{}
	case "tencent-cos":
		return &TencentCOS{}
	case "aws-s3":
		return &AwsS3{}
	case "hua-wei-obs":
		return &HuaWeiObs{}
	case "cloudflare-r2":
		return &CloudflareR2{}
	case "minio":
		return &Minio{}
	default:
		return &Local{}
	}
}
