package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"go.uber.org/zap"
)

// GameServerClient 游戏服务器API客户端
type GameServerClient struct {
	baseURL    string
	httpClient *http.Client
}

// gameServerClient 全局客户端实例
var gameServerClient *GameServerClient

// GetGameServerClient 获取游戏服务器API客户端实例
func GetGameServerClient() *GameServerClient {
	if gameServerClient == nil {
		baseURL := global.GVA_CONFIG.System.GameServerApiUrl
		if baseURL == "" {
			baseURL = "http://127.0.0.1:1781" // 默认地址
		}
		gameServerClient = &GameServerClient{
			baseURL: baseURL,
			httpClient: &http.Client{
				Timeout: 10 * time.Second,
			},
		}
	}
	return gameServerClient
}

// Response 通用响应结构
type GameServerResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// RefreshUserAgreementCache 刷新用户协议缓存
func (c *GameServerClient) RefreshUserAgreementCache() error {
	url := fmt.Sprintf("%s/api/internal/cache/refresh/user-agreement", c.baseURL)

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader([]byte{}))
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("读取响应失败: %w", err)
	}

	var result GameServerResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	if result.Code != 0 {
		return fmt.Errorf("刷新缓存失败: %s", result.Message)
	}

	global.GVA_LOG.Info("游戏服务器用户协议缓存已刷新", zap.String("url", url))
	return nil
}

// RefreshUserAgreementCache 全局函数，刷新用户协议缓存
func RefreshUserAgreementCache() {
	client := GetGameServerClient()
	if err := client.RefreshUserAgreementCache(); err != nil {
		global.GVA_LOG.Error("刷新游戏服务器用户协议缓存失败", zap.Error(err))
	}
}
