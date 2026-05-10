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

// Local 本地文件存储
type Local struct{}

// UploadFile 上传文件到本地
func (l *Local) UploadFile(file *multipart.FileHeader) (string, string, error) {
	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 生成存储路径
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	uploadPath := global.GVA_CONFIG.Local.Path

	// 确保目录存在
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return "", "", err
	}

	// 按日期创建子目录
	dateDir := time.Now().Format("2006/01/02")
	fullPath := filepath.Join(uploadPath, dateDir)
	if err := os.MkdirAll(fullPath, 0755); err != nil {
		return "", "", err
	}

	// 目标文件路径
	dstPath := filepath.Join(fullPath, filename)
	key := filepath.Join(dateDir, filename)

	// 创建目标文件
	dst, err := os.Create(dstPath)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := io.Copy(dst, f); err != nil {
		return "", "", err
	}

	// 返回文件URL和key
	url := filepath.Join("/", uploadPath, key)
	return url, key, nil
}

// DeleteFile 删除本地文件
func (l *Local) DeleteFile(key string) error {
	uploadPath := global.GVA_CONFIG.Local.Path
	fullPath := filepath.Join(uploadPath, key)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil
	}

	return os.Remove(fullPath)
}

func init() {
	// 确保上传目录存在
	if global.GVA_CONFIG.Local.Path != "" {
		os.MkdirAll(global.GVA_CONFIG.Local.Path, 0755)
	}
}
