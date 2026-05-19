package upload

import (
	"errors"
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

// UploadFile 上传文件到阿里云 OSS
func (a *AliyunOSS) UploadFile(file *multipart.FileHeader) (string, string, error) {
	config := global.GVA_CONFIG.AliyunOSS

	// 创建 OSS 客户端
	client, err := oss.New(config.Endpoint, config.AccessKeyId, config.AccessKeySecret)
	if err != nil {
		return "", "", err
	}

	// 获取 bucket
	bucket, err := client.Bucket(config.BucketName)
	if err != nil {
		return "", "", err
	}

	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 生成文件名
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// 生成存储路径
	basePath := config.BasePath
	if basePath != "" {
		basePath = basePath + "/"
	}
	key := fmt.Sprintf("%s%s/%s", basePath, time.Now().Format("2006-01-02"), filename)

	// 上传文件
	err = bucket.PutObject(key, f)
	if err != nil {
		return "", "", err
	}

	// 返回访问 URL
	filePath := fmt.Sprintf("%s/%s", config.BucketUrl, key)

	return filePath, key, nil
}

// DeleteFile 从阿里云 OSS 删除文件
func (a *AliyunOSS) DeleteFile(key string) error {
	config := global.GVA_CONFIG.AliyunOSS

	// 创建 OSS 客户端
	client, err := oss.New(config.Endpoint, config.AccessKeyId, config.AccessKeySecret)
	if err != nil {
		return err
	}

	// 获取 bucket
	bucket, err := client.Bucket(config.BucketName)
	if err != nil {
		return err
	}

	// 检查文件是否存在
	isExist, err := bucket.IsObjectExist(key)
	if err != nil {
		return err
	}
	if !isExist {
		return errors.New("文件不存在")
	}

	// 删除文件
	return bucket.DeleteObject(key)
}
