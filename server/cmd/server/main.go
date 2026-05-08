package main

import (
	"context"
	"flag"
	"log"
	"os/signal"
	"syscall"

	"github.com/palemoky/fight-the-landlord/internal/api"
	"github.com/palemoky/fight-the-landlord/internal/config"
	"github.com/palemoky/fight-the-landlord/internal/game/database"
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

	// 🔧【关键修复】在任何服务器启动前，独立初始化数据库
	// 这样确保无论是 WebSocket 服务器还是 API 服务器，都能正常保存游戏数据
	if cfg.MySQL.Host != "" {
		dbCfg := &database.DatabaseConfig{
			Host:            cfg.MySQL.Host,
			Port:            cfg.MySQL.Port,
			Username:        cfg.MySQL.User,
			Password:        cfg.MySQL.Password,
			Database:        cfg.MySQL.Database,
			Charset:         "utf8mb4",
			Collation:       "utf8mb4_unicode_ci",
			MaxIdleConns:    10,
			MaxOpenConns:    100,
			ConnMaxLifetime: 0,
			LogLevel:        "warn",
		}
		log.Printf("🔗 正在连接数据库: %s@%s:%d/%s", dbCfg.Username, dbCfg.Host, dbCfg.Port, dbCfg.Database)
		if err := database.InitDB(dbCfg); err != nil {
			log.Printf("❌ 数据库初始化失败: %v，游戏数据将无法保存！", err)
			log.Printf("⚠️ 请检查: 1.MySQL服务是否启动 2.数据库'%s'是否存在 3.用户名密码是否正确", dbCfg.Database)
		} else {
			log.Println("✅ 数据库初始化成功")
			// 自动迁移表结构
			log.Println("📋 正在执行数据库表迁移...")
			if err := database.GetInstance().AutoMigrate(); err != nil {
				log.Printf("⚠️ 数据库表迁移失败: %v", err)
			} else {
				log.Println("✅ 数据库表迁移成功")
			}

			// 初始化分表管理器
			log.Println("📊 正在初始化分表管理器...")
			if err := database.InitPartitionManager(database.GetInstance().GetDB()); err != nil {
				log.Printf("⚠️ 分表管理器初始化失败: %v", err)
			} else {
				log.Println("✅ 分表管理器初始化成功")
				// 启动分表定时调度器
				database.StartPartitionScheduler()
			}
		}
	} else {
		log.Println("⚠️ 未配置MySQL数据库，游戏数据将无法保存！")
	}

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

		// 如果API服务器也存在，设置Redis客户端给API处理器（使用包装器适配接口）
		if apiServer != nil && wsServer.GetRedis() != nil {
			apiServer.SetRedis(api.NewRedisClientWrapper(wsServer.GetRedis()))
		}

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

	// 关闭数据库连接
	if database.GetInstance().IsConnected() {
		if err := database.CloseDB(); err != nil {
			log.Printf("关闭数据库连接失败: %v", err)
		} else {
			log.Println("✅ 数据库连接已关闭")
		}
	}
}
