#!/bin/bash

#######################################################################
#               后台管理系统 - 502错误修复脚本
#   问题: houtais.hongxiu88.com 返回 502 Bad Gateway
#   原因: Admin后端服务没有正常运行
#######################################################################

set -e

# 服务器配置
SERVER_HOST="8.137.78.189"
SERVER_USER="root"
SERVER_PASS="nishiwode123ABC"

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

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         后台管理系统 502 错误修复脚本                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}✗ sshpass 未安装，正在安装...${NC}"
    sudo apt install -y sshpass
fi

echo -e "${BLUE}═══ 步骤1: 检查服务状态 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
echo "=== Admin服务状态 ==="
systemctl status qqddz-admin --no-pager || true

echo ""
echo "=== Game服务状态 ==="
systemctl status qqddz-game --no-pager || true

echo ""
echo "=== Nginx状态 ==="
systemctl status nginx --no-pager || true

echo ""
echo "=== 检查端口监听 ==="
netstat -tlnp | grep -E "8888|1780|1781|80|443" || ss -tlnp | grep -E "8888|1780|1781|80|443" || true
REMOTE_SCRIPT

echo -e "${BLUE}═══ 步骤2: 查看Admin日志 ═══${NC}"
ssh_exec "tail -100 /opt/qqddz/logs/admin.log 2>/dev/null || tail -100 /opt/qqddz/logs/admin-error.log 2>/dev/null || echo '日志文件不存在'"

echo ""
echo -e "${BLUE}═══ 步骤3: 检查数据库连接 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 检查MySQL
if mysqladmin ping -h localhost -u root -p'Hongxiu88@2024' --silent 2>/dev/null; then
    echo "✓ MySQL 正常运行"
else
    echo "✗ MySQL 可能有问题，尝试启动..."
    systemctl start mysql
fi

# 检查Redis
if redis-cli -a 'Redis@Hongxiu88' ping 2>/dev/null | grep -q PONG; then
    echo "✓ Redis 正常运行"
else
    echo "✗ Redis 可能有问题，尝试启动..."
    systemctl start redis-server
fi
REMOTE_SCRIPT

echo ""
echo -e "${BLUE}═══ 步骤4: 重启Admin服务 ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 停止服务
systemctl stop qqddz-admin 2>/dev/null || true

# 检查配置文件
if [ ! -f /opt/qqddz/admin/config.yaml ]; then
    echo "✗ 配置文件不存在!"
    exit 1
fi

# 检查可执行文件
if [ ! -f /opt/qqddz/admin/bin/admin ]; then
    echo "✗ 可执行文件不存在，需要重新编译..."
    cd /opt/qqddz/admin
    export PATH=$PATH:/usr/local/go/bin
    go mod download
    go build -o bin/admin .
fi

# 启动服务
systemctl start qqddz-admin
sleep 3

# 检查是否启动成功
if systemctl is-active --quiet qqddz-admin; then
    echo "✓ Admin服务启动成功"
else
    echo "✗ Admin服务启动失败，查看错误日志:"
    journalctl -u qqddz-admin -n 20 --no-pager
fi
REMOTE_SCRIPT

echo ""
echo -e "${BLUE}═══ 步骤5: 测试API ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 等待服务完全启动
sleep 2

# 测试验证码接口
echo "测试验证码接口..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8888/base/captcha)
if [ "$HTTP_CODE" == "200" ]; then
    echo "✓ 验证码接口正常 (HTTP $HTTP_CODE)"
else
    echo "✗ 验证码接口异常 (HTTP $HTTP_CODE)"
fi

# 测试健康检查
echo "测试健康检查..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8888/health 2>/dev/null || echo "000")
echo "健康检查: HTTP $HTTP_CODE"
REMOTE_SCRIPT

echo ""
echo -e "${BLUE}═══ 步骤6: 重启Nginx ═══${NC}"
ssh_exec << 'REMOTE_SCRIPT'
# 测试Nginx配置
if nginx -t 2>/dev/null; then
    echo "✓ Nginx配置正确"
    systemctl restart nginx
    echo "✓ Nginx已重启"
else
    echo "✗ Nginx配置有误"
    nginx -t
fi
REMOTE_SCRIPT

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                   修复完成！                                ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}请访问: https://webss.hongxiu88.com/#/login 测试${NC}"
echo ""
