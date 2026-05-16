#!/bin/bash

echo "=========================================="
echo "数据库诊断脚本"
echo "=========================================="

echo ""
echo "1. 检查 MySQL 服务状态..."
systemctl status mysql 2>/dev/null || systemctl status mysqld 2>/dev/null || echo "MySQL 服务状态未知"

echo ""
echo "2. 检查 ddz_game 数据库是否存在..."
mysql -u root -proot -e "SHOW DATABASES LIKE 'ddz_game';" 2>/dev/null || echo "无法使用 root 用户连接 MySQL"

echo ""
echo "3. 检查 ddz_players 表是否存在以及记录数量..."
mysql -u root -proot -e "SELECT COUNT(*) as player_count FROM ddz_game.ddz_players;" 2>/dev/null || echo "无法查询 ddz_players 表"

echo ""
echo "4. 检查 admin 后台配置文件中的数据库配置..."
if [ -f "/www/wwwroot/houtais/server/config.yaml" ]; then
    echo "=== Admin 后台数据库配置 ==="
    grep -A 20 'db-list:' /www/wwwroot/houtais/server/config.yaml 2>/dev/null
fi

echo ""
echo "5. 检查游戏服务器配置文件中的数据库配置..."
if [ -f "/www/wwwroot/ddz-server/config.yaml" ]; then
    echo "=== 游戏服务器数据库配置 ==="
    grep -A 10 'mysql:' /www/wwwroot/ddz-server/config.yaml 2>/dev/null
fi

echo ""
echo "6. 检查 admin 后台服务日志中的错误..."
if [ -d "/www/wwwroot/houtais/server/logs" ]; then
    echo "=== 最近 20 行错误日志 ==="
    tail -20 /www/wwwroot/houtais/server/logs/*.log 2>/dev/null | grep -i "error\|warn\|fail\|ddz-game" | tail -20
fi

echo ""
echo "=========================================="
echo "诊断完成"
echo "=========================================="
