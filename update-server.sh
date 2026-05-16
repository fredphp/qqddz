#!/bin/bash
# 服务器更新脚本
# 请在服务器上执行以下命令：
# ssh root@8.137.78.189
# 密码: nishiwode123ABC

echo "正在更新服务器代码..."
cd /opt/qqddz
git pull origin main

echo "正在编译服务端..."
cd server
export PATH=$PATH:/usr/local/go/bin
go build -o bin/server ./cmd/server

echo "正在重启服务..."
systemctl restart qqddz-game

echo "检查服务状态..."
systemctl status qqddz-game --no-pager

echo "✅ 服务器更新完成！"
