#!/usr/bin/env python3
import paramiko
import time
import sys

host = "8.137.78.189"
port = 22
username = "root"
password = "nishiwode123ABC"

def run_command(shell, cmd, wait=3):
    shell.send(cmd + "\n")
    time.sleep(wait)
    output = ""
    while shell.recv_ready():
        output += shell.recv(65535).decode('utf-8', errors='ignore')
        time.sleep(0.3)
    return output

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print(f"连接服务器 {host}...")
client.connect(host, port, username, password, timeout=30)
print("连接成功！")

shell = client.invoke_shell()
time.sleep(1)
while shell.recv_ready():
    shell.recv(65535)

# 设置代理并后台编译
print("\n=== 设置代理并后台编译 ===")
output = run_command(shell, "cd /opt/qqddz/admin/server && export GOPROXY=https://goproxy.cn,direct && nohup go build -o bin/admin > /tmp/build.log 2>&1 &", 3)
print(output)

print("\n编译任务已启动，等待30秒...")
time.sleep(30)

# 检查编译进程
print("\n=== 检查编译进程 ===")
output = run_command(shell, "ps aux | grep 'go build' | grep -v grep || echo 'No build process'", 2)
print(output)

# 检查编译日志
print("\n=== 编译日志 ===")
output = run_command(shell, "tail -30 /tmp/build.log", 2)
print(output)

# 检查文件
print("\n=== 检查二进制文件 ===")
output = run_command(shell, "ls -la /opt/qqddz/admin/server/bin/admin", 2)
print(output)

client.close()
print("\n完成")
