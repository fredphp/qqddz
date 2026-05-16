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

# 1. 停止旧服务
print("\n=== 1. 停止旧服务 ===")
output = run_command(shell, "pkill -f '/opt/qqddz/admin/bin/admin' || echo 'No process'", 2)
print(output)

time.sleep(2)

# 2. 启动新服务
print("\n=== 2. 启动新服务 ===")
output = run_command(shell, "cd /opt/qqddz/admin/server && nohup ./bin/admin -c config.yaml > /var/log/admin.log 2>&1 &", 3)
print(output)

time.sleep(5)

# 3. 检查进程
print("\n=== 3. 检查进程 ===")
output = run_command(shell, "ps aux | grep admin | grep -v grep", 2)
print(output)

# 4. 检查端口
print("\n=== 4. 检查端口 ===")
output = run_command(shell, "netstat -tlnp | grep 8080 || echo 'Port not ready yet'", 2)
print(output)

# 5. 检查日志
print("\n=== 5. 检查启动日志 ===")
output = run_command(shell, "tail -30 /var/log/admin.log", 3)
print(output)

# 6. 测试接口
print("\n=== 6. 测试接口 ===")
output = run_command(shell, "curl -s http://localhost:8080/health || echo 'Service not ready'", 3)
print(output)

client.close()
print("\n=== 完成 ===")
