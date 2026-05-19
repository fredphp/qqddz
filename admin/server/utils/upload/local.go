package upload

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/google/uuid"
)

// Local 本地存储
type Local struct{}

// UploadFile 上传文件
func (l *Local) UploadFile(file *multipart.FileHeader) (string, string, error) {
	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 生成文件存储路径
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	relativePath := fmt.Sprintf("%s/%s", time.Now().Format("2006-01-02"), filename)

	// 获取存储路径
	storePath := global.GVA_CONFIG.Local.StorePath
	if storePath == "" {
		storePath = "uploads/file"
	}

	// 创建目录
	fullPath := filepath.Join(storePath, relativePath)
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", "", err
	}

	// 创建目标文件
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := io.Copy(dst, f); err != nil {
		return "", "", err
	}

	// 返回访问路径和 key
	accessPath := global.GVA_CONFIG.Local.Path
	if accessPath == "" {
		accessPath = "uploads/file"
	}
	filePath := fmt.Sprintf("%s/%s", accessPath, relativePath)

	return filePath, relativePath, nil
}

// DeleteFile 删除文件
func (l *Local) DeleteFile(key string) error {
	storePath := global.GVA_CONFIG.Local.StorePath
	if storePath == "" {
		storePath = "uploads/file"
	}

	fullPath := filepath.Join(storePath, key)

	// 检查文件是否存在
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return errors.New("文件不存在")
	}

	return os.Remove(fullPath)
}

// GetFileExtension 获取文件扩展名
func GetFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

// IsAllowedExtension 检查是否是允许的文件扩展名
func IsAllowedExtension(filename string, allowed []string) bool {
	ext := GetFileExtension(filename)
	for _, a := range allowed {
		if ext == strings.ToLower(a) {
			return true
		}
	}
	return false
}
