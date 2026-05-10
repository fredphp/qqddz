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

// Local 本地文件上传
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
        ext := path.Ext(file.Filename)
        filename := uuid.New().String() + ext
        relativePath := time.Now().Format("2006-01-02") + "/"
        
        // 使用配置中的存储路径
        storePath := global.GVA_CONFIG.Local.StorePath
        if storePath == "" {
                storePath = "./uploads/"
        }
        absPath := storePath + relativePath

        // 创建目录
        if err := os.MkdirAll(absPath, 0755); err != nil {
                return "", "", err
        }

        // 保存文件
        dst := filepath.Join(absPath, filename)
        if err := saveMultipartFile(file, dst); err != nil {
                return "", "", err
        }

        // 返回访问路径和文件key
        accessPath := global.GVA_CONFIG.Local.Path
        if accessPath == "" {
                accessPath = "/uploads/"
        }
        return accessPath + relativePath + filename, relativePath + filename, nil
}

// DeleteFile 删除本地文件
func (l *Local) DeleteFile(key string) error {
        storePath := global.GVA_CONFIG.Local.StorePath
        if storePath == "" {
                storePath = "./uploads/"
        }
        filePath := storePath + key
        if _, err := os.Stat(filePath); os.IsNotExist(err) {
                return nil
        }
        return os.Remove(filePath)
}

// saveMultipartFile 保存 multipart 文件
func saveMultipartFile(file *multipart.FileHeader, dst string) error {
        src, err := file.Open()
        if err != nil {
                return err
        }
        defer src.Close()

        // 检查文件大小
        if file.Size == 0 {
                return errors.New("file is empty")
        }

        // 创建目标文件
        dstFile, err := os.Create(dst)
        if err != nil {
                return err
        }
        defer dstFile.Close()

        // 复制文件内容
        buf := make([]byte, 1024*1024) // 1MB buffer
        for {
                n, err := src.Read(buf)
                if n > 0 {
                        if _, writeErr := dstFile.Write(buf[:n]); writeErr != nil {
                                return writeErr
                        }
                }
                if err != nil {
                        break
                }
        }

        return nil
}
