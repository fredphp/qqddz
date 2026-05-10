package upload

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/google/uuid"
)

// AliyunOSS 阿里云对象存储
type AliyunOSS struct{}

// UploadFile 上传文件到阿里云OSS
func (a *AliyunOSS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 创建OSS客户端
	client, err := oss.New(
		global.GVA_CONFIG.AliyunOSS.Endpoint,
		global.GVA_CONFIG.AliyunOSS.AccessKeyId,
		global.GVA_CONFIG.AliyunOSS.AccessKeySecret,
	)
	if err != nil {
		return "", "", err
	}

	// 获取存储桶
	bucket, err := client.Bucket(global.GVA_CONFIG.AliyunOSS.BucketName)
	if err != nil {
		return "", "", err
	}

	// 生成文件key
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dateDir := time.Now().Format("2006/01/02")
	key := filepath.Join(global.GVA_CONFIG.AliyunOSS.BasePath, dateDir, filename)

	// 上传文件
	if err := bucket.PutObject(key, f); err != nil {
		return "", "", err
	}

	// 返回文件URL和key
	url := fmt.Sprintf("%s/%s", global.GVA_CONFIG.AliyunOSS.BucketUrl, key)
	return url, key, nil
}

// DeleteFile 删除阿里云OSS文件
func (a *AliyunOSS) DeleteFile(key string) error {
	// 创建OSS客户端
	client, err := oss.New(
		global.GVA_CONFIG.AliyunOSS.Endpoint,
		global.GVA_CONFIG.AliyunOSS.AccessKeyId,
		global.GVA_CONFIG.AliyunOSS.AccessKeySecret,
	)
	if err != nil {
		return err
	}

	// 获取存储桶
	bucket, err := client.Bucket(global.GVA_CONFIG.AliyunOSS.BucketName)
	if err != nil {
		return err
	}

	// 删除文件
	return bucket.DeleteObject(key)
}
