// +build ignore

package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// 简单的模拟API服务器，用于测试用户协议功能

func main() {
	mux := http.NewServeMux()

	// CORS 中间件
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next(w, r)
		}
	}

	// 用户协议接口
	mux.HandleFunc("/api/v1/user-agreement/latest", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		response := map[string]interface{}{
			"code":    0,
			"message": "success",
			"data": map[string]interface{}{
				"id":      1,
				"title":   "用户协议",
				"content": "欢迎使用本游戏！\n\n请在使用本游戏服务前，仔细阅读以下用户协议：\n\n1. 服务条款\n本游戏提供的服务仅供娱乐使用。用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n2. 用户账号\n用户应妥善保管账号信息，因个人原因导致账号丢失或被盗，本平台不承担责任。\n\n3. 虚拟货币\n游戏内的虚拟货币仅限本游戏内使用，不得进行任何形式的交易或转让。\n\n4. 行为规范\n用户不得利用外挂、漏洞等方式破坏游戏公平性，一经发现将永久封禁账号。\n\n5. 隐私保护\n我们重视用户隐私，不会向第三方泄露用户个人信息。\n\n6. 服务变更\n本平台有权随时修改服务内容，恕不另行通知。\n\n7. 免责声明\n因不可抗力导致的服务中断，本平台不承担责任。\n\n如有疑问，请联系客服。\n\n更新日期：2024年1月1日",
				"version": "v1.0.0",
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))

	// 健康检查
	mux.HandleFunc("/api/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))

	log.Println("🚀 模拟API服务器启动，监听端口: 1781")
	if err := http.ListenAndServe(":1781", mux); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
