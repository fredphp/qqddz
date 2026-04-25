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
        apiOnly := flag.Bool("api-only", false, "仅启动HTTP API服务器（不需要Redis）")
        flag.Parse()

        // 加载配置
        cfg, err := config.Load(*configPath)
        if err != nil {
                log.Printf("加载配置文件失败，使用默认配置: %v", err)
                cfg = config.Default()
        } else {
                log.Printf("✅ 配置文件加载成功: %s", *configPath)
        }
        log.Printf("📋 加载的MySQL配置: Host=%s, Port=%d, User=%s, Database=%s",
                cfg.MySQL.Host, cfg.MySQL.Port, cfg.MySQL.User, cfg.MySQL.Database)

        // 创建WebSocket服务器（如果不是仅API模式）
        var wsServer *server.Server
        if !*apiOnly {
                wsServer, err = server.NewServer(cfg)
                if err != nil {
                        log.Printf("⚠️ 创建WebSocket服务器失败: %v", err)
                        log.Println("ℹ️ 将仅启动HTTP API服务器...")
                }
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
        if wsServer != nil {
                // 设置WebSocket服务器引用到API包
                api.SetWSServer(wsServer)

                go func() {
                        log.Println("🎮 斗地主WebSocket服务器启动中...")
                        if err := wsServer.Start(); err != nil {
                                log.Printf("WebSocket服务器启动失败: %v", err)
                        }
                }()
        }

        // 启动HTTP API服务器（如果启用）
        if apiServer != nil {
                go func() {
                        log.Println("🌐 斗地主HTTP API服务器启动中...")
                        if err := apiServer.Start(); err != nil && err.Error() != "http: Server closed" {
                                log.Printf("HTTP API服务器错误: %v", err)
                        }
                }()
        }

        // 如果没有任何服务器启动，退出
        if wsServer == nil && apiServer == nil {
                log.Fatal("没有可用的服务器启动")
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
        if wsServer != nil {
                wsServer.GracefulShutdown(cfg.Game.ShutdownTimeoutDuration())
        }
}
