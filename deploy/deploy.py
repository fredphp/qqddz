#!/usr/bin/env python3
"""
欢乐斗地主 - 服务器自动部署脚本
目标服务器: 8.137.78.189
域名:
  - apis.hongxiu88.com (Game Server API + WebSocket)
  - houtais.hongxiu88.com (Admin Backend)
"""

import paramiko
import os
import sys
import time
import socket

# 配置
SERVER_HOST = "8.137.78.189"
SERVER_USER = "root"
SERVER_PASS = "nishiwode123ABC"

GAME_DOMAIN = "apis.hongxiu88.com"
ADMIN_DOMAIN = "houtais.hongxiu88.com"

DB_ROOT_PASS = "Hongxiu88@2024"
DB_NAME = "ddz_game"
DB_USER = "ddz"
DB_PASS = "Ddz@2024Secure"
REDIS_PASS = "Redis@Hongxiu88"

# 颜色
class Color:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[0;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'

def print_color(color, msg):
    print(f"{color}{msg}{Color.NC}")

def print_step(step, msg):
    print(f"\n{Color.BLUE}═══ 步骤{step}: {msg} ═══{Color.NC}")

def print_success(msg):
    print(f"{Color.GREEN}✓ {msg}{Color.NC}")

def print_error(msg):
    print(f"{Color.RED}✗ {msg}{Color.NC}")

def print_info(msg):
    print(f"{Color.CYAN}{msg}{Color.NC}")

class SSHClient:
    def __init__(self, host, user, password):
        self.host = host
        self.user = user
        self.password = password
        self.client = None

    def connect(self):
        print_info(f"连接服务器 {self.host}...")
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(self.host, username=self.user, password=self.password, timeout=30)
        print_success("服务器连接成功")
        return True

    def exec_command(self, cmd, verbose=True):
        if verbose:
            print_info(f"执行: {cmd[:80]}...")
        stdin, stdout, stderr = self.client.exec_command(cmd, timeout=300)
        exit_code = stdout.channel.recv_exit_status()
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')

        if exit_code != 0 and verbose:
            print_error(f"命令执行失败: {error[:200]}")
        return exit_code, output, error

    def upload_file(self, local_path, remote_path):
        sftp = self.client.open_sftp()
        try:
            # 如果是目录，递归上传
            if os.path.isdir(local_path):
                try:
                    sftp.mkdir(remote_path)
                except:
                    pass
                for item in os.listdir(local_path):
                    local_item = os.path.join(local_path, item)
                    remote_item = f"{remote_path}/{item}"
                    if os.path.isdir(local_item):
                        self.upload_dir(local_item, remote_item, sftp)
                    else:
                        sftp.put(local_item, remote_item)
            else:
                sftp.put(local_path, remote_path)
            print_success(f"上传: {local_path} -> {remote_path}")
        finally:
            sftp.close()

    def upload_dir(self, local_dir, remote_dir, sftp):
        try:
            sftp.mkdir(remote_dir)
        except:
            pass
        for item in os.listdir(local_dir):
            local_path = os.path.join(local_dir, item)
            remote_path = f"{remote_dir}/{item}"
            if os.path.isdir(local_path):
                self.upload_dir(local_path, remote_path, sftp)
            else:
                sftp.put(local_path, remote_path)

    def close(self):
        if self.client:
            self.client.close()

def main():
    print(f"""
{Color.CYAN}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🎮 欢乐斗地主 - 服务器自动部署                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝{Color.NC}

{Color.YELLOW}目标服务器: {SERVER_HOST}{Color.NC}
{Color.YELLOW}Game API域名: {GAME_DOMAIN}{Color.NC}
{Color.YELLOW}Admin后台域名: {ADMIN_DOMAIN}{Color.NC}
""")

    # 获取脚本目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)

    # 连接服务器
    ssh = SSHClient(SERVER_HOST, SERVER_USER, SERVER_PASS)
    try:
        ssh.connect()
    except Exception as e:
        print_error(f"服务器连接失败: {e}")
        return 1

    try:
        # 步骤1: 更新系统
        print_step(1, "更新系统并安装基础环境")
        ssh.exec_command("apt update -qq")

        # 安装 Go
        code, out, err = ssh.exec_command("which go || echo 'not_found'")
        if "not_found" in out:
            print_info("安装 Go 1.21...")
            ssh.exec_command("wget -q https://go.dev/dl/go1.21.6.linux-amd64.tar.gz")
            ssh.exec_command("rm -rf /usr/local/go && tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz")
            ssh.exec_command("rm -f go1.21.6.linux-amd64.tar.gz")
            ssh.exec_command("echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile")
        print_success("Go 环境就绪")

        # 安装 MySQL
        code, out, err = ssh.exec_command("which mysql || echo 'not_found'")
        if "not_found" in out:
            print_info("安装 MySQL...")
            ssh.exec_command("export DEBIAN_FRONTEND=noninteractive && apt install -y -qq mysql-server mysql-client")
            ssh.exec_command("systemctl start mysql && systemctl enable mysql")
        print_success("MySQL 环境就绪")

        # 安装 Redis
        code, out, err = ssh.exec_command("which redis-server || echo 'not_found'")
        if "not_found" in out:
            print_info("安装 Redis...")
            ssh.exec_command("apt install -y -qq redis-server")
            ssh.exec_command("systemctl start redis-server && systemctl enable redis-server")
        print_success("Redis 环境就绪")

        # 安装 Nginx
        code, out, err = ssh.exec_command("which nginx || echo 'not_found'")
        if "not_found" in out:
            print_info("安装 Nginx...")
            ssh.exec_command("apt install -y -qq nginx")
            ssh.exec_command("systemctl start nginx && systemctl enable nginx")
        print_success("Nginx 环境就绪")

        # 安装其他工具
        ssh.exec_command("apt install -y -qq git curl wget unzip certbot python3-certbot-nginx")

        # 步骤2: 配置 MySQL
        print_step(2, "配置 MySQL 数据库")
        ssh.exec_command(f"mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '{DB_ROOT_PASS}'; FLUSH PRIVILEGES;\" 2>/dev/null || true")
        ssh.exec_command(f"mysql -u root -p'{DB_ROOT_PASS}' -e \"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"")
        ssh.exec_command(f"mysql -u root -p'{DB_ROOT_PASS}' -e \"CREATE USER IF NOT EXISTS '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASS}';\"")
        ssh.exec_command(f"mysql -u root -p'{DB_ROOT_PASS}' -e \"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'localhost'; FLUSH PRIVILEGES;\"")
        print_success("MySQL 配置完成")

        # 步骤3: 配置 Redis
        print_step(3, "配置 Redis")
        ssh.exec_command(f"sed -i 's/# requirepass foobared/requirepass {REDIS_PASS}/' /etc/redis/redis.conf")
        ssh.exec_command("sed -i 's/bind 127.0.0.1 -::1/bind 127.0.0.1/' /etc/redis/redis.conf")
        ssh.exec_command("systemctl restart redis-server")
        print_success("Redis 配置完成")

        # 步骤4: 创建项目目录
        print_step(4, "创建项目目录")
        ssh.exec_command("mkdir -p /opt/qqddz/{server,admin,logs,admin/web/dist,admin/uploads}")
        print_success("项目目录创建完成")

        # 步骤5: 上传服务端代码
        print_step(5, "上传服务端代码")
        server_dir = os.path.join(project_dir, "server")
        admin_dir = os.path.join(project_dir, "admin", "server")
        ssh.upload_file(server_dir, "/opt/qqddz/server")
        ssh.upload_file(admin_dir, "/opt/qqddz/admin")
        print_success("代码上传完成")

        # 步骤6: 上传配置文件
        print_step(6, "上传配置文件")
        game_config = os.path.join(script_dir, "configs", "game-server-config.yaml")
        admin_config = os.path.join(script_dir, "configs", "admin-server-config.yaml")
        ssh.upload_file(game_config, "/opt/qqddz/server/config.yaml")
        ssh.upload_file(admin_config, "/opt/qqddz/admin/config.yaml")
        print_success("配置文件上传完成")

        # 步骤7: 导入数据库
        print_step(7, "导入数据库")
        sql_file = os.path.join(project_dir, "sql", "ddz_game.sql")
        if os.path.exists(sql_file):
            ssh.upload_file(sql_file, "/tmp/ddz_game.sql")
            ssh.exec_command(f"mysql -u root -p'{DB_ROOT_PASS}' {DB_NAME} < /tmp/ddz_game.sql")
            print_success("数据库导入完成")
        else:
            print_error(f"SQL文件不存在: {sql_file}")

        # 步骤8: 编译服务
        print_step(8, "编译服务")
        print_info("编译 Game Server...")
        ssh.exec_command("export PATH=$PATH:/usr/local/go/bin && cd /opt/qqddz/server && go mod download && go build -o bin/server ./cmd/server")
        print_success("Game Server 编译完成")

        print_info("编译 Admin Server...")
        ssh.exec_command("export PATH=$PATH:/usr/local/go/bin && cd /opt/qqddz/admin && go mod download && go build -o bin/admin .")
        print_success("Admin Server 编译完成")

        # 步骤9: 配置系统服务
        print_step(9, "配置系统服务")
        game_service = os.path.join(script_dir, "systemd", "qqddz-game.service")
        admin_service = os.path.join(script_dir, "systemd", "qqddz-admin.service")
        ssh.upload_file(game_service, "/etc/systemd/system/qqddz-game.service")
        ssh.upload_file(admin_service, "/etc/systemd/system/qqddz-admin.service")
        ssh.exec_command("systemctl daemon-reload")
        print_success("系统服务配置完成")

        # 步骤10: 配置 Nginx
        print_step(10, "配置 Nginx")
        nginx_api = os.path.join(script_dir, "nginx", "apis.hongxiu88.com")
        nginx_admin = os.path.join(script_dir, "nginx", "houtais.hongxiu88.com")
        ssh.upload_file(nginx_api, "/etc/nginx/sites-available/apis.hongxiu88.com")
        ssh.upload_file(nginx_admin, "/etc/nginx/sites-available/houtais.hongxiu88.com")
        ssh.exec_command("ln -sf /etc/nginx/sites-available/apis.hongxiu88.com /etc/nginx/sites-enabled/")
        ssh.exec_command("ln -sf /etc/nginx/sites-available/houtais.hongxiu88.com /etc/nginx/sites-enabled/")
        ssh.exec_command("rm -f /etc/nginx/sites-enabled/default")
        code, out, err = ssh.exec_command("nginx -t")
        if code == 0:
            ssh.exec_command("systemctl restart nginx")
            print_success("Nginx 配置完成")
        else:
            print_error(f"Nginx 配置错误: {err}")

        # 步骤11: 启动服务
        print_step(11, "启动服务")
        ssh.exec_command("systemctl enable qqddz-game qqddz-admin")
        ssh.exec_command("systemctl start qqddz-game")
        time.sleep(2)
        ssh.exec_command("systemctl start qqddz-admin")
        print_success("服务启动完成")

        # 步骤12: 申请SSL证书
        print_step(12, "申请 SSL 证书")
        print_info(f"请确保域名已解析到服务器: {SERVER_HOST}")
        print_info("正在申请 SSL 证书...")

        # 先创建临时证书配置
        ssh.exec_command("mkdir -p /etc/letsencrypt/live/apis.hongxiu88.com /etc/letsencrypt/live/houtais.hongxiu88.com")

        # 尝试申请证书
        ssl_cmd = f"certbot --nginx -d {GAME_DOMAIN} -d {ADMIN_DOMAIN} --non-interactive --agree-tos --email admin@hongxiu88.com 2>&1 || echo 'SSL_FAILED'"
        code, out, err = ssh.exec_command(ssl_cmd)
        if "SSL_FAILED" in out or code != 0:
            print_error("SSL 证书申请失败，请检查域名解析")
            print_info("您可以稍后手动运行: certbot --nginx -d apis.hongxiu88.com -d houtais.hongxiu88.com")
        else:
            print_success("SSL 证书申请成功")

        # 显示结果
        print(f"""
{Color.GREEN}═══════════════════════════════════════════════════════════
                   🎉 部署完成！
═══════════════════════════════════════════════════════════{Color.NC}

{Color.CYAN}服务地址:{Color.NC}
  Game API:  {Color.GREEN}https://{GAME_DOMAIN}{Color.NC}
  WebSocket: {Color.GREEN}wss://{GAME_DOMAIN}/ws{Color.NC}
  Admin后台: {Color.GREEN}https://{ADMIN_DOMAIN}{Color.NC}

{Color.CYAN}数据库信息:{Color.NC}
  数据库名: {DB_NAME}
  用户名:   {DB_USER}
  密码:     {DB_PASS}

{Color.CYAN}常用命令:{Color.NC}
  查看服务状态: ssh root@{SERVER_HOST} 'systemctl status qqddz-game qqddz-admin'
  查看日志: ssh root@{SERVER_HOST} 'tail -f /opt/qqddz/logs/*.log'
  重启服务: ssh root@{SERVER_HOST} 'systemctl restart qqddz-game qqddz-admin'
""")

    except Exception as e:
        print_error(f"部署过程出错: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        ssh.close()

    return 0

if __name__ == "__main__":
    sys.exit(main())
