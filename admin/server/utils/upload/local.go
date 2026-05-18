package upload

import (
	"errors"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/google/uuid"
)

type Local struct{}

func (l *Local) UploadFile(file *multipart.FileHeader) (string, string, error) {
	if file == nil {
		return "", "", errors.New("文件不能为空")
	}

	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer f.Close()

	// 生成文件名
	ext := filepath.Ext(file.Filename)
	filename := uuid.New().String() + ext
	relativePath := global.GVA_CONFIG.Local.Path

	// 确保目录存在
	uploadDir := path.Join("./", relativePath)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", "", err
	}

	// 按日期创建子目录
	dateDir := time.Now().Format("2006-01-02")
	fullDir := path.Join(uploadDir, dateDir)
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", "", err
	}

	// 目标文件路径
	dstPath := path.Join(fullDir, filename)
	key := path.Join(dateDir, filename)

	// 创建目标文件
	dst, err := os.Create(dstPath)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	// 复制文件内容
	buf := make([]byte, 1024*1024) // 1MB buffer
	for {
		n, err := f.Read(buf)
		if n > 0 {
			if _, writeErr := dst.Write(buf[:n]); writeErr != nil {
				return "", "", writeErr
			}
		}
		if err != nil {
			break
		}
	}

	// 返回访问路径
	filePath := "/" + relativePath + "/" + key
	return filePath, key, nil
}

func (l *Local) DeleteFile(key string) error {
	filePath := path.Join("./", global.GVA_CONFIG.Local.Path, key)
	return os.Remove(filePath)
}
