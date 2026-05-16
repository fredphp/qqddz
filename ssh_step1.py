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

# 1. 拉取代码
print("\n=== 拉取代码 ===")
output = run_command(shell, "cd /opt/qqddz && git pull origin main", 15)
print(output)

# 2. 检查提交
print("\n=== 最新提交 ===")
output = run_command(shell, "cd /opt/qqddz && git log --oneline -3", 3)
print(output)

# 3. 停止服务
print("\n=== 停止服务 ===")
output = run_command(shell, "pkill -f '/opt/qqddz/admin/bin/admin' || echo 'No process'", 2)
print(output)

client.close()
print("\n步骤1完成，继续编译...")
