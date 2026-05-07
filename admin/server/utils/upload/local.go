package upload

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/google/uuid"
)

// Local 本地存储实现
type Local struct{}

// UploadFile 上传文件到本地
func (l *Local) UploadFile(file *multipart.FileHeader) (string, string, error) {
	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 生成文件名
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// 获取存储路径
	storePath := global.GVA_CONFIG.Local.StorePath
	if storePath == "" {
		storePath = "./uploads"
	}

	// 按日期创建子目录
	dateDir := time.Now().Format("2006/01/02")
	fullPath := filepath.Join(storePath, dateDir)

	// 确保目录存在
	if err := os.MkdirAll(fullPath, 0755); err != nil {
		return "", "", err
	}

	// 文件保存路径
	filePath := filepath.Join(fullPath, filename)

	// 创建目标文件
	dst, err := os.Create(filePath)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := io.Copy(dst, f); err != nil {
		return "", "", err
	}

	// 返回访问路径和文件key
	accessPath := global.GVA_CONFIG.Local.Path
	if accessPath == "" {
		accessPath = "/uploads"
	}

	url := fmt.Sprintf("%s/%s/%s", accessPath, dateDir, filename)
	key := filepath.Join(dateDir, filename)

	return url, key, nil
}

// DeleteFile 删除本地文件
func (l *Local) DeleteFile(key string) error {
	storePath := global.GVA_CONFIG.Local.StorePath
	if storePath == "" {
		storePath = "./uploads"
	}

	filePath := filepath.Join(storePath, key)

	// 检查文件是否存在
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // 文件不存在，直接返回
	}

	// 删除文件
	return os.Remove(filePath)
}

// GetFile 获取本地文件路径
func (l *Local) GetFile(key string) (string, error) {
	storePath := global.GVA_CONFIG.Local.StorePath
	if storePath == "" {
		storePath = "./uploads"
	}

	filePath := filepath.Join(storePath, key)

	// 检查文件是否存在
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return "", errors.New("文件不存在")
	}

	return filePath, nil
}
