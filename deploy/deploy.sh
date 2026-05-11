#!/bin/bash

#######################################################################
#               欢乐斗地主 - 一键部署脚本
#   目标服务器: 8.137.78.189
#   域名:
#     - apis.hongxiu88.com (Game Server API + WebSocket)
#     - houtais.hongxiu88.com (Admin Backend)
#######################################################################

set -e

# 服务器配置
SERVER_HOST="8.137.78.189"
SERVER_USER="root"
SERVER_PASS="nishiwode123ABC"

# 域名配置
GAME_DOMAIN="apis.hongxiu88.com"
ADMIN_DOMAIN="houtais.hongxiu88.com"

# 数据库配置
DB_ROOT_PASS="Hongxiu88@2024"
DB_NAME="ddz_game"
DB_USER="ddz"
DB_PASS="Ddz@2024Secure"

# Redis配置
REDIS_PASS="Redis@Hongxiu88"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 远程执行命令
ssh_exec() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$1"
}

# 上传文件
ssh_upload() {
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_HOST:$2"
}

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         🎮 欢乐斗地主 - 服务器部署脚本                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}目标服务器: ${SERVER_HOST}${NC}"
echo -e "${YELLOW}Game API域名: ${GAME_DOMAIN}${NC}"
echo -e "${YELLOW}Admin后台域名: ${ADMIN_DOMAIN}${NC}"
echo ""

# 检查sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}✗ sshpass 未安装，正在安装...${NC}"
    apt-get update && apt-get install -y sshpass
fi

# 测试连接
echo -e "${BLUE}═══ 步骤1: 测试服务器连接 ═══${NC}"
if ssh_exec "echo '连接成功'" 2>/dev/null; then
    echo -e "${GREEN}✓ 服务器连接成功${NC}"
else
    echo -e "${RED}✗ 服务器连接失败${NC}"
    exit 1
fi

# 安装基础环境
echo -e "${BLUE}═══ 步骤2: 安装基础环境 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
set -e
echo "更新系统包..."
apt update -qq

# 安装 Go
if ! command -v go &> /dev/null; then
    echo "安装 Go 1.21..."
    wget -q https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
    rm go1.21.6.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    export PATH=$PATH:/usr/local/go/bin
    echo "Go 安装完成"
else
    echo "Go 已安装: $(go version)"
fi

# 安装 MySQL
if ! command -v mysql &> /dev/null; then
    echo "安装 MySQL..."
    export DEBIAN_FRONTEND=noninteractive
    apt install -y -qq mysql-server mysql-client
    systemctl start mysql
    systemctl enable mysql
    echo "MySQL 安装完成"
fi

# 安装 Redis
if ! command -v redis-server &> /dev/null; then
    echo "安装 Redis..."
    apt install -y -qq redis-server
    systemctl start redis-server
    systemctl enable redis-server
    echo "Redis 安装完成"
fi

# 安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt install -y -qq nginx
    systemctl start nginx
    systemctl enable nginx
    echo "Nginx 安装完成"
fi

# 安装工具
apt install -y -qq git curl wget unzip certbot python3-certbot-nginx

echo "基础环境安装完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ 基础环境安装完成${NC}"

# 配置 MySQL
echo -e "${BLUE}═══ 步骤3: 配置 MySQL 数据库 ═══${NC}"
ssh_exec "mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}'; FLUSH PRIVILEGES;\" 2>/dev/null || mysql -e \"CREATE USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}'; FLUSH PRIVILEGES;\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;\""
echo -e "${GREEN}✓ MySQL 配置完成${NC}"

# 配置 Redis
echo -e "${BLUE}═══ 步骤4: 配置 Redis ═══${NC}"
ssh_exec "sed -i 's/# requirepass foobared/requirepass ${REDIS_PASS}/' /etc/redis/redis.conf"
ssh_exec "sed -i 's/bind 127.0.0.1 -::1/bind 127.0.0.1/' /etc/redis/redis.conf"
ssh_exec "systemctl restart redis-server"
echo -e "${GREEN}✓ Redis 配置完成${NC}"

# 创建项目目录
echo -e "${BLUE}═══ 步骤5: 创建项目目录 ═══${NC}"
ssh_exec "mkdir -p /opt/qqddz/{server,admin,logs,admin/web/dist}"
echo -e "${GREEN}✓ 项目目录创建完成${NC}"

# 上传服务端代码
echo -e "${BLUE}═══ 步骤6: 上传服务端代码 ═══${NC}"
ssh_upload "${PROJECT_DIR}/server/" /opt/qqddz/server/
ssh_upload "${PROJECT_DIR}/admin/server/" /opt/qqddz/admin/
echo -e "${GREEN}✓ 代码上传完成${NC}"

# 上传配置文件
echo -e "${BLUE}═══ 步骤7: 上传配置文件 ═══${NC}"
ssh_upload "${SCRIPT_DIR}/configs/game-server-config.yaml" /opt/qqddz/server/config.yaml
ssh_upload "${SCRIPT_DIR}/configs/admin-server-config.yaml" /opt/qqddz/admin/config.yaml
echo -e "${GREEN}✓ 配置文件上传完成${NC}"

# 上传数据库
echo -e "${BLUE}═══ 步骤8: 导入数据库 ═══${NC}"
ssh_upload "${PROJECT_DIR}/sql/ddz_game.sql" /tmp/
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' ${DB_NAME} < /tmp/ddz_game.sql"
echo -e "${GREEN}✓ 数据库导入完成${NC}"

# 编译服务
echo -e "${BLUE}═══ 步骤9: 编译服务 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
export PATH=$PATH:/usr/local/go/bin

echo "编译 Game Server..."
cd /opt/qqddz/server
go mod download
go build -o bin/server ./cmd/server
echo "Game Server 编译完成"

echo "编译 Admin Server..."
cd /opt/qqddz/admin
go mod download
go build -o bin/admin .
echo "Admin Server 编译完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ 服务编译完成${NC}"

# 配置 systemd
echo -e "${BLUE}═══ 步骤10: 配置系统服务 ═══${NC}"
ssh_upload "${SCRIPT_DIR}/systemd/qqddz-game.service" /etc/systemd/system/
ssh_upload "${SCRIPT_DIR}/systemd/qqddz-admin.service" /etc/systemd/system/
ssh_exec "systemctl daemon-reload"
echo -e "${GREEN}✓ 系统服务配置完成${NC}"

# 配置 Nginx
echo -e "${BLUE}═══ 步骤11: 配置 Nginx ═══${NC}"
ssh_upload "${SCRIPT_DIR}/nginx/apis.hongxiu88.com" /etc/nginx/sites-available/
ssh_upload "${SCRIPT_DIR}/nginx/houtais.hongxiu88.com" /etc/nginx/sites-available/
ssh_exec "ln -sf /etc/nginx/sites-available/apis.hongxiu88.com /etc/nginx/sites-enabled/"
ssh_exec "ln -sf /etc/nginx/sites-available/houtais.hongxiu88.com /etc/nginx/sites-enabled/"
ssh_exec "rm -f /etc/nginx/sites-enabled/default"
ssh_exec "nginx -t && systemctl restart nginx"
echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# 启动服务
echo -e "${BLUE}═══ 步骤12: 启动服务 ═══${NC}"
ssh_exec "systemctl enable qqddz-game qqddz-admin"
ssh_exec "systemctl start qqddz-game qqddz-admin"
echo -e "${GREEN}✓ 服务启动完成${NC}"

# 申请 SSL 证书
echo -e "${BLUE}═══ 步骤13: 申请 SSL 证书 ═══${NC}"
echo -e "${YELLOW}请确保域名已解析到服务器: ${SERVER_HOST}${NC}"
read -p "域名解析是否已配置？(y/n): " confirm
if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
    ssh_exec "certbot --nginx -d apis.hongxiu88.com -d houtais.hongxiu88.com --non-interactive --agree-tos --email admin@hongxiu88.com || echo 'SSL证书申请失败'"
    echo -e "${GREEN}✓ SSL 证书申请完成${NC}"
else
    echo -e "${YELLOW}跳过 SSL 申请，请手动运行:${NC}"
    echo "certbot --nginx -d apis.hongxiu88.com -d houtais.hongxiu88.com"
fi

# 显示结果
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                   🎉 部署完成！                           ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}服务地址:${NC}"
echo -e "  Game API:  ${GREEN}https://${GAME_DOMAIN}${NC}"
echo -e "  WebSocket: ${GREEN}wss://${GAME_DOMAIN}/ws${NC}"
echo -e "  Admin后台: ${GREEN}https://${ADMIN_DOMAIN}${NC}"
echo ""
echo -e "${CYAN}数据库信息:${NC}"
echo -e "  数据库名: ${DB_NAME}"
echo -e "  用户名:   ${DB_USER}"
echo -e "  密码:     ${DB_PASS}"
echo ""
