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

// NewOss 创建 OSS 实例
func NewOss() OSS {
	switch global.GVA_CONFIG.System.OssType {
	case "local":
		return &Local{}
	case "qiniu":
		return &Qiniu{}
	case "minio":
		return &Minio{}
	case "aliyun-oss":
		return &AliyunOSS{}
	case "tencent-cos":
		return &TencentCOS{}
	case "aws-s3":
		return &AwsS3{}
	case "cloudflare-r2":
		return &CloudflareR2{}
	case "hua-wei-obs":
		return &HuaWeiOBS{}
	default:
		return &Local{}
	}
}
