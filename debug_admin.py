#!/usr/bin/env python3
"""调试后台管理系统启动问题"""

import paramiko
import time

# 服务器配置
HOST = "8.137.78.189"
USER = "root"
PASSWORD = "nishiwode123ABC"

def run_command(ssh, cmd):
    """执行命令并返回输出"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out + err

def main():
    print("=" * 60)
    print("连接服务器...")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        print("✓ 连接成功\n")

        # 1. 检查配置文件
        print("=" * 60)
        print("1. 检查配置文件")
        print("=" * 60)
        result = run_command(ssh, "ls -la /opt/qqddz/admin/")
        print(result)

        # 2. 检查config.yaml
        print("\n" + "=" * 60)
        print("2. 检查config.yaml配置")
        print("=" * 60)
        result = run_command(ssh, "cat /opt/qqddz/admin/config.yaml")
        print(result)

        # 3. 直接运行admin查看错误
        print("\n" + "=" * 60)
        print("3. 直接运行admin查看错误")
        print("=" * 60)
        result = run_command(ssh, "cd /opt/qqddz/admin && ./bin/admin 2>&1")
        print(result)

        # 4. 检查日志文件
        print("\n" + "=" * 60)
        print("4. 检查错误日志")
        print("=" * 60)
        result = run_command(ssh, "tail -100 /opt/qqddz/logs/admin-error.log 2>/dev/null || echo '无错误日志'")
        print(result)

        # 5. 检查数据库连接
        print("\n" + "=" * 60)
        print("5. 检查数据库连接")
        print("=" * 60)
        result = run_command(ssh, "mysql -u root -p'Hongxiu88@2024' -e 'SELECT 1' 2>&1")
        print(result)

        # 6. 检查Redis连接
        print("\n" + "=" * 60)
        print("6. 检查Redis连接")
        print("=" * 60)
        result = run_command(ssh, "redis-cli -a 'Redis@Hongxiu88' ping 2>&1")
        print(result)

        # 7. 检查Go环境
        print("\n" + "=" * 60)
        print("7. 检查Go环境")
        print("=" * 60)
        result = run_command(ssh, "export PATH=$PATH:/usr/local/go/bin && go version")
        print(result)

        ssh.close()

    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    main()
