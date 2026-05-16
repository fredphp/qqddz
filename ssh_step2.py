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

# 检查编译结果
print("\n=== 检查编译结果 ===")
output = run_command(shell, "ls -la /opt/qqddz/admin/server/bin/", 2)
print(output)

# 如果没有admin，重新编译
print("\n=== 检查是否需要重新编译 ===")
output = run_command(shell, "test -f /opt/qqddz/admin/server/bin/admin && echo 'EXISTS' || echo 'NEED_BUILD'", 2)
print(output)

if 'NEED_BUILD' in output:
    print("\n需要重新编译...")
    output = run_command(shell, "cd /opt/qqddz/admin/server && go build -o bin/admin 2>&1", 90)
    print(output)
    
    output = run_command(shell, "ls -la /opt/qqddz/admin/server/bin/admin", 2)
    print(output)

client.close()
print("\n检查完成")
