#!/bin/bash

#######################################################################
#               欢乐斗地主 - 服务器部署脚本
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
    echo -e "${RED}✗ sshpass 未安装${NC}"
    echo -e "${CYAN}安装: sudo apt install sshpass${NC}"
    exit 1
fi

# 测试连接
echo -e "${BLUE}═══ 步骤1: 测试服务器连接 ═══${NC}"
if ssh_exec "echo '连接成功'" &> /dev/null; then
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

# 检查并安装 Go
if ! command -v go &> /dev/null; then
    echo "安装 Go 1.21..."
    wget -q https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
    rm go1.21.6.linux-amd64.tar.gz
    
    # 配置环境变量
    if ! grep -q '/usr/local/go/bin' /etc/profile; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    fi
    export PATH=$PATH:/usr/local/go/bin
    echo "Go 安装完成: $(go version)"
else
    echo "Go 已安装: $(go version)"
fi

# 安装 MySQL
if ! command -v mysql &> /dev/null; then
    echo "安装 MySQL..."
    export DEBIAN_FRONTEND=noninteractive
    apt install -y -qq mysql-server mysql-client
    
    # 启动 MySQL
    systemctl start mysql
    systemctl enable mysql
    echo "MySQL 安装完成"
else
    echo "MySQL 已安装"
fi

# 安装 Redis
if ! command -v redis-server &> /dev/null; then
    echo "安装 Redis..."
    apt install -y -qq redis-server
    systemctl start redis-server
    systemctl enable redis-server
    echo "Redis 安装完成"
else
    echo "Redis 已安装"
fi

# 安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt install -y -qq nginx
    systemctl start nginx
    systemctl enable nginx
    echo "Nginx 安装完成"
else
    echo "Nginx 已安装"
fi

# 安装其他工具
apt install -y -qq git curl wget unzip certbot python3-certbot-nginx

echo "基础环境安装完成"
REMOTE_SCRIPT

echo -e "${GREEN}✓ 基础环境安装完成${NC}"

# 配置 MySQL
echo -e "${BLUE}═══ 步骤3: 配置 MySQL 数据库 ═══${NC}"
ssh_exec "mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}'; FLUSH PRIVILEGES;\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';\""
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' -e \"GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;\""
echo -e "${GREEN}✓ MySQL 配置完成${NC}"

# 上传并导入 SQL
echo -e "${BLUE}═══ 步骤4: 导入数据库 ═══${NC}"
ssh_upload /home/z/qqddz-project/sql/ddz_game.sql /tmp/
ssh_exec "mysql -u root -p'${DB_ROOT_PASS}' ${DB_NAME} < /tmp/ddz_game.sql"
echo -e "${GREEN}✓ 数据库导入完成${NC}"

# 配置 Redis
echo -e "${BLUE}═══ 步骤5: 配置 Redis ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 设置 Redis 密码
sed -i "s/# requirepass foobared/requirepass Redis@Hongxiu88/" /etc/redis/redis.conf
sed -i "s/bind 127.0.0.1 -::1/bind 127.0.0.1/" /etc/redis/redis.conf
systemctl restart redis-server
echo "Redis 配置完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ Redis 配置完成${NC}"

# 创建项目目录
echo -e "${BLUE}═══ 步骤6: 创建项目目录 ═══${NC}"
ssh_exec "mkdir -p /opt/qqddz/{server,admin,logs}"
echo -e "${GREEN}✓ 项目目录创建完成${NC}"

# 上传服务端代码
echo -e "${BLUE}═══ 步骤7: 上传服务端代码 ═══${NC}"
ssh_upload /home/z/qqddz-project/server/ /opt/qqddz/server/
ssh_upload /home/z/qqddz-project/admin/server/ /opt/qqddz/admin/
echo -e "${GREEN}✓ 代码上传完成${NC}"

# 创建 Game Server 配置
echo -e "${BLUE}═══ 步骤8: 配置 Game Server ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
cat > /opt/qqddz/server/config.yaml << 'EOF'
# 斗地主服务端配置

server:
  host: "0.0.0.0"
  port: 1780
  max_connections: 10000

redis:
  addr: "localhost:6379"
  password: "Redis@Hongxiu88"
  db: 0

api:
  enable: true
  port: 1781
  crypto_key: "qqddz2026gameaes256secretkey123!"
  enable_crypto: true

mysql:
  host: "127.0.0.1"
  port: 3306
  user: "ddz"
  password: "Ddz@2024Secure"
  database: "ddz_game"

cdn:
  url: "https://houtais.hongxiu88.com"

game:
  turn_timeout: 30
  bid_timeout: 15
  room_timeout: 10
  shutdown_timeout: 30
  shutdown_check_interval: 15
  room_cleanup_delay: 30

security:
  allowed_origins:
    - "*"
  rate_limit:
    max_per_second: 10
    max_per_minute: 60
    ban_duration: 60
  message_limit:
    max_per_second: 20
  chat_limit:
    max_per_second: 1
    max_per_minute: 30
    cooldown: 5

notification:
  xiaomi_speaker:
    url: ""
    api_secret: ""
    cf_client_id: ""
    cf_client_secret: ""
EOF
echo "Game Server 配置完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ Game Server 配置完成${NC}"

# 创建 Admin Server 配置
echo -e "${BLUE}═══ 步骤9: 配置 Admin Server ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
cat > /opt/qqddz/admin/config.yaml << 'EOF'
site:
  name: "棋牌游戏后台管理系统"
  logo: ""
  favicon: ""
  description: "专业的棋牌游戏运营管理平台"
  keywords: "棋牌游戏,斗地主,后台管理"

mysql:
  path: 127.0.0.1
  port: "3306"
  db-name: ddz_game
  username: ddz
  password: "Ddz@2024Secure"
  config: charset=utf8mb4&parseTime=True&loc=Local
  log-mode: error
  max-idle-conns: 10
  max-open-conns: 100

redis:
  addr: 127.0.0.1:6379
  password: "Redis@Hongxiu88"
  db: 0

db-list:
  - type: mysql
    alias-name: ddz-game
    prefix: ""
    port: "3306"
    config: charset=utf8mb4&parseTime=True&loc=Local
    db-name: ddz_game
    username: ddz
    password: "Ddz@2024Secure"
    path: 127.0.0.1
    log-mode: error
    max-idle-conns: 10
    max-open-conns: 100
    disable: false

jwt:
  signing-key: "hongxiu88-ddz-jwt-secret-key-2024"
  expires-time: 7d
  buffer-time: 1d
  issuer: qqddz

system:
  db-type: mysql
  oss-type: local
  addr: 8888
  use-redis: true
  use-mongo: false
  game-server-api-url: http://127.0.0.1:1781

cors:
  mode: allow-all

zap:
  level: info
  format: console
  director: log
  show-line: true
  log-in-console: true

local:
  path: uploads/file
  store-path: uploads/file
EOF
echo "Admin Server 配置完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ Admin Server 配置完成${NC}"

# 编译服务
echo -e "${BLUE}═══ 步骤10: 编译服务 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
export PATH=$PATH:/usr/local/go/bin

# 编译 Game Server
echo "编译 Game Server..."
cd /opt/qqddz/server
go mod download
go build -o bin/server ./cmd/server
echo "Game Server 编译完成"

# 编译 Admin Server
echo "编译 Admin Server..."
cd /opt/qqddz/admin
go mod download
go build -o bin/admin .
echo "Admin Server 编译完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ 服务编译完成${NC}"

# 创建 systemd 服务
echo -e "${BLUE}═══ 步骤11: 创建系统服务 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# Game Server 服务
cat > /etc/systemd/system/qqddz-game.service << 'EOF'
[Unit]
Description=QQDDZ Game Server
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/qqddz/server
ExecStart=/opt/qqddz/server/bin/server
Restart=always
RestartSec=5
StandardOutput=append:/opt/qqddz/logs/game.log
StandardError=append:/opt/qqddz/logs/game-error.log

[Install]
WantedBy=multi-user.target
EOF

# Admin Server 服务
cat > /etc/systemd/system/qqddz-admin.service << 'EOF'
[Unit]
Description=QQDDZ Admin Server
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/qqddz/admin
ExecStart=/opt/qqddz/admin/bin/admin
Restart=always
RestartSec=5
StandardOutput=append:/opt/qqddz/logs/admin.log
StandardError=append:/opt/qqddz/logs/admin-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo "系统服务创建完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ 系统服务创建完成${NC}"

# 配置 Nginx
echo -e "${BLUE}═══ 步骤12: 配置 Nginx ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# Game API 配置
cat > /etc/nginx/sites-available/apis.hongxiu88.com << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name apis.hongxiu88.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name apis.hongxiu88.com;

    # SSL 证书（需要运行 certbot 获取）
    ssl_certificate /etc/letsencrypt/live/apis.hongxiu88.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apis.hongxiu88.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HTTP API
    location /api/ {
        proxy_pass http://127.0.0.1:1781/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:1780;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 根路径
    location / {
        return 200 '{"status":"ok","service":"QQDDZ Game Server"}';
        add_header Content-Type application/json;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:1781/health;
    }
}
EOF

# Admin 后台配置
cat > /etc/nginx/sites-available/houtais.hongxiu88.com << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name houtais.hongxiu88.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name houtais.hongxiu88.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/houtais.hongxiu88.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/houtais.hongxiu88.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 文件上传大小限制
    client_max_body_size 50M;

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8888/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
    }

    # 静态文件
    location /uploads/ {
        alias /opt/qqddz/admin/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 前端静态文件（如果有）
    location / {
        root /opt/qqddz/admin/web/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
    }

    # 健康检查
    location /health {
        return 200 '{"status":"ok","service":"QQDDZ Admin Server"}';
        add_header Content-Type application/json;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/apis.hongxiu88.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/houtais.hongxiu88.com /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

echo "Nginx 配置完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# 启动服务
echo -e "${BLUE}═══ 步骤13: 启动服务 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 启动 Game Server
systemctl enable qqddz-game
systemctl start qqddz-game

# 启动 Admin Server
systemctl enable qqddz-admin
systemctl start qqddz-admin

# 重启 Nginx
systemctl restart nginx

echo "服务启动完成"
REMOTE_SCRIPT
echo -e "${GREEN}✓ 服务启动完成${NC}"

# 申请 SSL 证书
echo -e "${BLUE}═══ 步骤14: 申请 SSL 证书 ═══${NC}"
echo -e "${YELLOW}注意: 请确保域名已解析到服务器 IP: ${SERVER_HOST}${NC}"
echo -e "${YELLOW}如果域名解析未生效，SSL 申请将失败${NC}"
read -p "域名解析是否已配置？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh_exec "certbot --nginx -d apis.hongxiu88.com -d houtais.hongxiu88.com --non-interactive --agree-tos --email admin@hongxiu88.com || echo 'SSL证书申请失败，请检查域名解析'"
    echo -e "${GREEN}✓ SSL 证书申请完成${NC}"
else
    echo -e "${YELLOW}跳过 SSL 证书申请，请稍后手动运行:${NC}"
    echo -e "${CYAN}certbot --nginx -d apis.hongxiu88.com -d houtais.hongxiu88.com${NC}"
fi

# 显示部署结果
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
echo -e "${CYAN}常用命令:${NC}"
echo "  查看Game服务状态: ssh root@${SERVER_HOST} 'systemctl status qqddz-game'"
echo "  查看Admin服务状态: ssh root@${SERVER_HOST} 'systemctl status qqddz-admin'"
echo "  查看Game日志: ssh root@${SERVER_HOST} 'tail -f /opt/qqddz/logs/game.log'"
echo "  查看Admin日志: ssh root@${SERVER_HOST} 'tail -f /opt/qqddz/logs/admin.log'"
echo "  重启所有服务: ssh root@${SERVER_HOST} 'systemctl restart qqddz-game qqddz-admin nginx'"
echo ""
