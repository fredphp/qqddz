#!/usr/bin/env python3
import paramiko
import time

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
client.connect(host, port, username, password, timeout=30)

shell = client.invoke_shell()
time.sleep(1)
while shell.recv_ready():
    shell.recv(65535)

print("\n=== 检查监听端口 ===")
output = run_command(shell, "netstat -tlnp | grep admin", 2)
print(output)

print("\n=== 测试文件上传接口 ===")
output = run_command(shell, "curl -s -X POST http://localhost:8888/fileUploadAndDownload/getFileList -H 'Content-Type: application/json' -d '{\"page\":1,\"pageSize\":10}'", 5)
print(output)

print("\n=== 检查进程状态 ===")
output = run_command(shell, "ps aux | grep admin | grep -v grep", 2)
print(output)

client.close()
