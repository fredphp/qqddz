#!/usr/bin/env python3
"""修复Admin配置文件"""

import paramiko

HOST = "8.137.78.189"
USER = "root"
PASSWORD = "nishiwode123ABC"

# 正确的配置文件内容
CONFIG_CONTENT = '''# Admin后台管理系统配置 - 生产环境
# 域名: houtais.hongxiu88.com

site:
  name: "棋牌游戏后台管理系统"
  logo: ""
  favicon: ""
  description: "专业的棋牌游戏运营管理平台"
  keywords: "棋牌游戏,斗地主,后台管理"

autocode:
  web: web/src
  root: /opt/qqddz/admin
  server: server
  module: github.com/flipped-aurora/gin-vue-admin/server

mysql:
  path: 127.0.0.1
  port: "3306"
  db-name: ddz_game
  username: root
  password: "Hongxiu88@2024"
  config: charset=utf8mb4&parseTime=True&loc=Local
  log-mode: error
  max-idle-conns: 10
  max-open-conns: 100

db-list:
  - type: mysql
    alias-name: ddz-game
    prefix: ""
    port: "3306"
    config: charset=utf8mb4&parseTime=True&loc=Local
    db-name: ddz_game
    username: root
    password: "Hongxiu88@2024"
    path: 127.0.0.1
    log-mode: error
    max-idle-conns: 10
    max-open-conns: 100
    disable: false

redis:
  addr: 127.0.0.1:6379
  password: "Redis@Hongxiu88"
  db: 0

redis-list:
  - name: cache
    addr: 127.0.0.1:6379
    password: "Redis@Hongxiu88"
    db: 0
    useCluster: false

jwt:
  signing-key: "hongxiu88-ddz-jwt-secret-key-2024-secure"
  expires-time: 7d
  buffer-time: 1d
  issuer: qqddz

system:
  db-type: mysql
  oss-type: local
  addr: 8888
  iplimit-count: 15000
  iplimit-time: 3600
  use-multipoint: false
  use-redis: true
  use-mongo: false
  use-strict-auth: false
  disable-auto-migrate: true
  game-server-api-url: http://127.0.0.1:1781

cors:
  mode: allow-all

zap:
  level: info
  prefix: '[qqddz-admin]'
  format: console
  director: log
  encode-level: LowercaseColorLevelEncoder
  stacktrace-key: stacktrace
  show-line: true
  log-in-console: true
  retention-day: -1

local:
  path: uploads/file
  store-path: uploads/file

captcha:
  key-long: 6
  img-width: 240
  img-height: 80
  open-captcha: 9999
  open-captcha-timeout: 3600
'''

def run_command(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

def main():
    print("连接服务器...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✓ 连接成功\n")

    # 备份原配置
    print("1. 备份原配置文件...")
    run_command(ssh, "cp /opt/qqddz/admin/config.yaml /opt/qqddz/admin/config.yaml.bak")

    # 写入新配置
    print("2. 写入新配置文件...")
    # 使用heredoc写入文件
    cmd = f'''cat > /opt/qqddz/admin/config.yaml << 'EOFCONFIG'
{CONFIG_CONTENT}
EOFCONFIG'''
    out, err = run_command(ssh, cmd)
    if err:
        print(f"错误: {err}")

    # 验证配置
    print("3. 验证新配置...")
    out, err = run_command(ssh, "grep -A2 'mysql:' /opt/qqddz/admin/config.yaml | head -5")
    print(out)

    # 重启服务
    print("4. 重启Admin服务...")
    run_command(ssh, "systemctl restart qqddz-admin")

    # 等待服务启动
    import time
    time.sleep(3)

    # 检查服务状态
    print("5. 检查服务状态...")
    out, err = run_command(ssh, "systemctl status qqddz-admin --no-pager")
    print(out)

    # 测试API
    print("\n6. 测试API...")
    out, err = run_command(ssh, "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8888/base/captcha")
    print(f"验证码接口HTTP状态码: {out}")

    ssh.close()
    print("\n✓ 修复完成!")

if __name__ == "__main__":
    main()
