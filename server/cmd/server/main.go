package main

import (
	"context"
	"flag"
	"log"
	"os/signal"
	"syscall"

	"github.com/palemoky/fight-the-landlord/internal/api"
	"github.com/palemoky/fight-the-landlord/internal/config"
	"github.com/palemoky/fight-the-landlord/internal/server"
)

func main() {
	configPath := flag.String("config", "config.yaml", "配置文件路径")
	flag.Parse()

	// 加载配置
	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Printf("加载配置文件失败，使用默认配置: %v", err)
		cfg = config.Default()
	}

	// 创建WebSocket服务器
	wsServer, err := server.NewServer(cfg)
	if err != nil {
		log.Fatalf("创建WebSocket服务器失败: %v", err)
	}

	// 创建HTTP API服务器（如果启用）
	var apiServer *api.Server
	if cfg.API.Enable {
		apiServer, err = api.NewServer(cfg)
		if err != nil {
			log.Fatalf("创建HTTP API服务器失败: %v", err)
		}
	}

	// 监听关闭信号
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// 启动WebSocket服务器
	go func() {
		log.Println("🎮 斗地主WebSocket服务器启动中...")
		if err := wsServer.Start(); err != nil {
			log.Fatalf("WebSocket服务器启动失败: %v", err)
		}
	}()

	// 启动HTTP API服务器（如果启用）
	if apiServer != nil {
		go func() {
			log.Println("🌐 斗地主HTTP API服务器启动中...")
			if err := apiServer.Start(); err != nil && err.Error() != "http: Server closed" {
				log.Printf("HTTP API服务器错误: %v", err)
			}
		}()
	}

	// 等待关闭信号
	<-ctx.Done()
	log.Println("📢 收到关闭信号，开始优雅关闭...")

	// 关闭HTTP API服务器
	if apiServer != nil {
		if err := apiServer.Shutdown(context.Background()); err != nil {
			log.Printf("关闭HTTP API服务器失败: %v", err)
		}
	}

	// 关闭WebSocket服务器
	wsServer.GracefulShutdown(cfg.Game.ShutdownTimeoutDuration())
}
