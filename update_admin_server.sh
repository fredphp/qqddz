#!/bin/bash
# 后台管理系统更新脚本
# 用于在服务器上更新代码并重新编译重启服务

set -e

echo "=========================================="
echo "后台管理系统更新脚本"
echo "=========================================="

# 配置
SERVER_DIR="/www/wwwroot/houtais/server"
SERVICE_NAME="houtais"

echo ""
echo "1. 进入服务器目录..."
cd $SERVER_DIR

echo ""
echo "2. 拉取最新代码..."
git pull origin main

echo ""
echo "3. 检查数据库配置..."
if grep -q "ddz-game" config.yaml; then
    echo "✓ ddz-game 数据库配置存在"
    grep -A 15 "alias-name: ddz-game" config.yaml
else
    echo "✗ ddz-game 数据库配置不存在，请手动添加！"
    echo ""
    echo "请在 config.yaml 的 db-list 中添加以下配置："
    echo ""
    cat << 'EOF'
db-list:
    - type: mysql
      alias-name: ddz-game
      prefix: ""
      port: "3306"
      config: charset=utf8mb4&parseTime=True&loc=Local
      db-name: ddz_game
      username: root
      password: YOUR_MYSQL_PASSWORD  # 请替换为实际的 MySQL 密码
      path: 127.0.0.1
      engine: ""
      log-mode: error
      max-idle-conns: 10
      max-open-conns: 100
      singular: false
      log-zap: false
      disable: false
EOF
    echo ""
    read -p "请确认已添加配置后按回车继续..."
fi

echo ""
echo "4. 编译 Go 项目..."
go build -o admin

echo ""
echo "5. 重启服务..."
supervisorctl restart $SERVICE_NAME

echo ""
echo "6. 检查服务状态..."
supervisorctl status $SERVICE_NAME

echo ""
echo "=========================================="
echo "更新完成！"
echo "=========================================="
