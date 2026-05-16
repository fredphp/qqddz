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

# 1. 拉取最新代码
print("\n=== 1. 拉取最新代码 ===")
output = run_command(shell, "cd /opt/qqddz && git pull origin main", 10)
print(output)

# 2. 设置代理并编译
print("\n=== 2. 编译 ===")
output = run_command(shell, "cd /opt/qqddz/admin/server && export GOPROXY=https://goproxy.cn,direct && go build -o bin/admin 2>&1 &", 3)
print("编译任务已启动...")

# 等待编译
print("等待60秒...")
time.sleep(60)

# 3. 检查编译结果
print("\n=== 3. 检查编译结果 ===")
output = run_command(shell, "ls -la /opt/qqddz/admin/server/bin/admin && stat /opt/qqddz/admin/server/bin/admin | grep Modify", 2)
print(output)

# 4. 检查是否有编译错误
print("\n=== 4. 检查进程 ===")
output = run_command(shell, "ps aux | grep 'go build' | grep -v grep || echo '编译完成'", 2)
print(output)

client.close()
print("\n完成")
