import paramiko

# SSH连接信息
host = "8.137.78.189"
port = 22
username = "root"
password = "nishiwode123ABC"

# 创建SSH客户端
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"正在连接服务器 {host}...")
    client.connect(host, port, username, password, timeout=30)
    print("连接成功！")
    
    # 检查当前状态
    commands = [
        "cd /root/qqddz && git status",
        "cd /root/qqddz && git log --oneline -3"
    ]
    
    for cmd in commands:
        print(f"\n执行: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        if out:
            print(out)
        if err:
            print(f"stderr: {err}")
    
except Exception as e:
    print(f"连接失败: {e}")
finally:
    client.close()
    print("\n连接已关闭")
