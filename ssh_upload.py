import paramiko

# SSH连接信息
host = "8.137.78.189"
port = 22
username = "root"
password = "nishiwode123ABC"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"正在连接服务器 {host}...")
    client.connect(host, port, username, password, timeout=30)
    print("连接成功！")
    
    # 检查所有监听端口
    print("\n=== 所有监听端口 ===")
    stdin, stdout, stderr = client.exec_command("netstat -tlnp 2>/dev/null || ss -tlnp")
    out = stdout.read().decode('utf-8')
    print(out)
    
    # 检查配置文件中的端口
    print("\n=== 配置文件端口 ===")
    stdin, stdout, stderr = client.exec_command("grep -E 'port|Port' /opt/qqddz/server/config.yaml | head -20")
    out = stdout.read().decode('utf-8')
    print(out)
    
    # 查看完整日志
    print("\n=== 服务完整日志(最后100行) ===")
    stdin, stdout, stderr = client.exec_command("tail -100 /opt/qqddz/server/logs/server.log 2>/dev/null | head -50")
    out = stdout.read().decode('utf-8')
    print(out)
    
except Exception as e:
    print(f"连接失败: {e}")
finally:
    client.close()
