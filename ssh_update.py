#!/usr/bin/env python3
import paramiko
import time
import sys

# 服务器信息
host = "8.137.78.189"
port = 22
username = "root"
password = "nishiwode123ABC"

def run_command(shell, cmd, wait=2):
    shell.send(cmd + "\n")
    time.sleep(wait)
    output = ""
    while shell.recv_ready():
        output += shell.recv(65535).decode('utf-8', errors='ignore')
        time.sleep(0.5)
    return output

# 创建SSH客户端
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print(f"正在连接服务器 {host}...")
try:
    client.connect(host, port, username, password, timeout=30)
    print("连接成功！")
except Exception as e:
    print(f"连接失败: {e}")
    sys.exit(1)

# 创建交互式shell
shell = client.invoke_shell()
time.sleep(1)

# 清空欢迎信息
while shell.recv_ready():
    shell.recv(65535)

# 1. 进入项目目录并拉取代码
print("\n=== 1. 拉取最新代码 ===")
output = run_command(shell, "cd /opt/qqddz && git pull origin main", 10)
print(output)

# 2. 检查更新结果
print("\n=== 2. 检查最新提交 ===")
output = run_command(shell, "cd /opt/qqddz && git log --oneline -3", 3)
print(output)

# 3. 停止当前服务
print("\n=== 3. 停止当前服务 ===")
output = run_command(shell, "kill $(pgrep -f '/opt/qqddz/admin/bin/admin') 2>/dev/null; sleep 1; echo 'Service stopped'", 3)
print(output)

# 4. 编译项目
print("\n=== 4. 编译项目（可能需要几分钟）===")
shell.send("cd /opt/qqddz/admin/server && go build -o bin/admin\n")
print("编译中...")

# 等待编译完成
for i in range(180):  # 最多等待3分钟
    time.sleep(1)
    if shell.recv_ready():
        output = shell.recv(65535).decode('utf-8', errors='ignore')
        if output.strip():
            print(output)
        # 检查是否返回到命令行提示符
        if '#' in output or '$' in output:
            break
    if i % 30 == 0 and i > 0:
        print(f"已等待 {i} 秒...")

# 5. 检查编译结果
print("\n=== 5. 检查编译结果 ===")
output = run_command(shell, "ls -la /opt/qqddz/admin/server/bin/admin", 2)
print(output)

# 6. 启动服务
print("\n=== 6. 启动服务 ===")
output = run_command(shell, "cd /opt/qqddz/admin/server && nohup ./bin/admin > /var/log/admin.log 2>&1 &", 3)
print(output)

time.sleep(3)

# 7. 检查服务是否启动
print("\n=== 7. 检查服务状态 ===")
output = run_command(shell, "ps aux | grep admin | grep -v grep", 2)
print(output)

# 8. 检查端口
print("\n=== 8. 检查端口 ===")
output = run_command(shell, "netstat -tlnp | grep 8080", 2)
print(output)

# 9. 检查日志
print("\n=== 9. 最新日志 ===")
output = run_command(shell, "tail -20 /var/log/admin.log", 3)
print(output)

client.close()
print("\n=== 完成 ===")
