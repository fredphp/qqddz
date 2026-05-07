package cdnutil

import (
	"strings"
	"sync"
)

// CDNConfig CDN配置
type CDNConfig struct {
	URL string
}

// Manager CDN管理器
type Manager struct {
	config *CDNConfig
	mu     sync.RWMutex
}

// 全局CDN管理器实例
var globalManager *Manager
var once sync.Once

// InitManager 初始化全局CDN管理器
func InitManager(cdnURL string) {
	once.Do(func() {
		globalManager = &Manager{
			config: &CDNConfig{
				URL: strings.TrimSuffix(cdnURL, "/"),
			},
		}
	})
}

// GetManager 获取全局CDN管理器
func GetManager() *Manager {
	if globalManager == nil {
		// 如果未初始化，使用空配置初始化
		InitManager("")
	}
	return globalManager
}

// SetConfig 设置CDN配置
func (m *Manager) SetConfig(cdnURL string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.config.URL = strings.TrimSuffix(cdnURL, "/")
}

// GetConfig 获取CDN配置
func (m *Manager) GetConfig() *CDNConfig {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.config
}

// IsEnabled 检查CDN是否启用
func (m *Manager) IsEnabled() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.config.URL != ""
}

// CompleteURL 补全URL
// 如果URL已经是完整的URL（以http://或https://开头），则直接返回
// 如果URL是相对路径，则补全为完整的CDN URL
// avatar_1, avatar_2等内置头像格式会被转换为 /avatar/avatar_1.png
func (m *Manager) CompleteURL(url string) string {
	if url == "" || url == "null" || url == "undefined" {
		return ""
	}

	// 已经是完整URL，直接返回
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
		return url
	}

	// CDN未配置，返回原始URL
	if !m.IsEnabled() {
		return url
	}

	m.mu.RLock()
	cdnURL := m.config.URL
	m.mu.RUnlock()

	// 处理内置头像格式: avatar_1, avatar_2 等
	if strings.HasPrefix(url, "avatar_") && !strings.Contains(url, "/") && !strings.Contains(url, ".") {
		return cdnURL + "/avatar/" + url + ".png"
	}

	// 处理相对路径
	if strings.HasPrefix(url, "/") {
		return cdnURL + url
	}

	// 其他情况，添加斜杠
	return cdnURL + "/" + url
}

// CompleteAvatar 专门处理头像URL
// 处理各种头像格式：
// - 空值返回默认头像
// - 完整URL直接返回
// - 内置头像(avatar_1等)转换为CDN URL
// - 相对路径补全为CDN URL
func (m *Manager) CompleteAvatar(avatar string) string {
	// 空值返回默认头像
	if avatar == "" || avatar == "null" || avatar == "undefined" {
		if m.IsEnabled() {
			m.mu.RLock()
			cdnURL := m.config.URL
			m.mu.RUnlock()
			return cdnURL + "/avatar/avatar_1.png"
		}
		return "avatar_1"
	}

	return m.CompleteURL(avatar)
}

// CompleteImage 通用图片URL补全
// 与CompleteURL类似，但会对空值返回默认图片
func (m *Manager) CompleteImage(url string, defaultImage string) string {
	if url == "" || url == "null" || url == "undefined" {
		if defaultImage != "" {
			return m.CompleteURL(defaultImage)
		}
		return ""
	}
	return m.CompleteURL(url)
}

// 全局便捷函数

// CompleteURL 全局URL补全函数
func CompleteURL(url string) string {
	return GetManager().CompleteURL(url)
}

// CompleteAvatar 全局头像URL补全函数
func CompleteAvatar(avatar string) string {
	return GetManager().CompleteAvatar(avatar)
}

// CompleteImage 全局图片URL补全函数
func CompleteImage(url string, defaultImage string) string {
	return GetManager().CompleteImage(url, defaultImage)
}

// IsEnabled 检查CDN是否启用
func IsEnabled() bool {
	return GetManager().IsEnabled()
}

// SetCDNURL 设置CDN URL（用于热更新配置）
func SetCDNURL(cdnURL string) {
	GetManager().SetConfig(cdnURL)
}
