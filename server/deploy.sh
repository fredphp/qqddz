#!/bin/bash

#######################################################################
#                     斗地主游戏一键部署脚本
#                   Fight the Landlord Deploy Script
#######################################################################
# 
# 项目: fight-the-landlord
# 作者: palemoky
# GitHub: https://github.com/palemoky/fight-the-landlord
#
# 功能:
#   - 自动检测并安装 Go 环境
#   - 自动检测并安装 Redis
#   - 编译服务端和客户端
#   - 配置系统服务
#   - 支持本地开发和 Docker 两种部署方式
#
# 用法:
#   ./deploy.sh              # 交互式部署
#   ./deploy.sh --docker     # Docker 部署
#   ./deploy.sh --local      # 本地开发部署
#   ./deploy.sh --help       # 显示帮助
#
#######################################################################

set -e

# ============== 颜色定义 ==============
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============== 版本配置 ==============
GO_VERSION="1.22"
GO_MIN_VERSION="1.21"
REDIS_VERSION="7"
PROJECT_NAME="fight-the-landlord"
SERVER_PORT=1780
REDIS_PORT=6379

# ============== 获取脚本目录 ==============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============== 帮助信息 ==============
show_help() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}           斗地主游戏一键部署脚本 v1.0                       ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./deploy.sh [选项]"
    echo ""
    echo -e "${YELLOW}选项:${NC}"
    echo "  --docker       使用 Docker Compose 部署（推荐生产环境）"
    echo "  --local        本地开发部署（需要手动安装 Go 和 Redis）"
    echo "  --install-go   自动安装 Go 环境"
    echo "  --install-redis 自动安装 Redis"
    echo "  --help, -h     显示此帮助信息"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  ./deploy.sh --docker      # Docker 一键部署"
    echo "  ./deploy.sh --local       # 本地开发部署"
    echo ""
}

# ============== 打印函数 ==============
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# ============== 检测系统 ==============
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
        elif command -v yum &> /dev/null; then
            OS="centos"
        elif command -v pacman &> /dev/null; then
            OS="arch"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    print_info "检测到系统: $OS"
}

# ============== 检查 Go 环境 ==============
check_go() {
    print_header "检查 Go 环境"
    
    if command -v go &> /dev/null; then
        GO_INSTALLED_VERSION=$(go version | grep -oP 'go\K[0-9.]+' | head -1)
        print_success "Go 已安装: go$GO_INSTALLED_VERSION"
        
        # 检查版本是否满足要求
        MIN_MAJOR=$(echo $GO_MIN_VERSION | cut -d. -f1)
        MIN_MINOR=$(echo $GO_MIN_VERSION | cut -d. -f2)
        INST_MAJOR=$(echo $GO_INSTALLED_VERSION | cut -d. -f1)
        INST_MINOR=$(echo $GO_INSTALLED_VERSION | cut -d. -f2)
        
        if [ "$INST_MAJOR" -gt "$MIN_MAJOR" ] || ([ "$INST_MAJOR" -eq "$MIN_MAJOR" ] && [ "$INST_MINOR" -ge "$MIN_MINOR" ]); then
            print_success "Go 版本满足要求 (>= $GO_MIN_VERSION)"
            return 0
        else
            print_warning "Go 版本过低，建议升级到 Go $GO_VERSION+"
            return 1
        fi
    else
        print_warning "Go 未安装"
        return 1
    fi
}

# ============== 安装 Go ==============
install_go() {
    print_header "安装 Go 环境"
    
    if command -v go &> /dev/null; then
        print_info "Go 已安装，跳过安装"
        return 0
    fi
    
    # 确定 Go 版本
    GO_INSTALL_VERSION="${GO_VERSION:-1.22}"
    
    # 检测架构
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) GO_ARCH="amd64" ;;
        aarch64|arm64) GO_ARCH="arm64" ;;
        *) print_error "不支持的架构: $ARCH"; return 1 ;;
    esac
    
    # 检测系统
    case $OS in
        ubuntu|centos|linux) GO_OS="linux" ;;
        macos) GO_OS="darwin" ;;
        *) print_error "不支持的系统: $OS"; return 1 ;;
    esac
    
    GO_TARBALL="go${GO_INSTALL_VERSION}.${GO_OS}-${GO_ARCH}.tar.gz"
    GO_DOWNLOAD_URL="https://go.dev/dl/${GO_TARBALL}"
    
    print_info "准备安装 Go $GO_INSTALL_VERSION ($GO_OS/$GO_ARCH)"
    
    # 下载并安装
    cd /tmp
    print_info "正在下载 $GO_DOWNLOAD_URL ..."
    
    if command -v wget &> /dev/null; then
        wget -q "$GO_DOWNLOAD_URL" || { print_error "下载失败"; return 1; }
    elif command -v curl &> /dev/null; then
        curl -sLO "$GO_DOWNLOAD_URL" || { print_error "下载失败"; return 1; }
    else
        print_error "需要 wget 或 curl 来下载 Go"
        return 1
    fi
    
    # 删除旧版本
    sudo rm -rf /usr/local/go
    
    # 解压安装
    print_info "正在解压安装..."
    sudo tar -C /usr/local -xzf "$GO_TARBALL"
    
    # 配置环境变量
    if ! grep -q '/usr/local/go/bin' ~/.bashrc 2>/dev/null; then
        echo '' >> ~/.bashrc
        echo '# Go 环境变量' >> ~/.bashrc
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
        echo 'export GOPATH=$HOME/go' >> ~/.bashrc
        echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
    fi
    
    # 立即生效
    export PATH=$PATH:/usr/local/go/bin
    
    # 清理
    rm -f "$GO_TARBALL"
    cd "$SCRIPT_DIR"
    
    print_success "Go 安装完成: $(go version)"
    print_info "请运行 'source ~/.bashrc' 或重新打开终端以更新环境变量"
}

# ============== 检查 Redis ==============
check_redis() {
    print_header "检查 Redis"
    
    if command -v redis-server &> /dev/null; then
        print_success "Redis 已安装: $(redis-server --version | head -1)"
        
        # 检查是否运行
        if redis-cli ping &> /dev/null; then
            print_success "Redis 服务正在运行"
        else
            print_warning "Redis 服务未运行"
        fi
        return 0
    else
        print_warning "Redis 未安装"
        return 1
    fi
}

# ============== 安装 Redis ==============
install_redis() {
    print_header "安装 Redis"
    
    if command -v redis-server &> /dev/null; then
        print_info "Redis 已安装，跳过安装"
        return 0
    fi
    
    case $OS in
        ubuntu)
            print_info "正在安装 Redis (Ubuntu)..."
            sudo apt-get update
            sudo apt-get install -y redis-server
            sudo systemctl enable redis-server
            sudo systemctl start redis-server
            ;;
        centos)
            print_info "正在安装 Redis (CentOS)..."
            sudo yum install -y epel-release
            sudo yum install -y redis
            sudo systemctl enable redis
            sudo systemctl start redis
            ;;
        macos)
            print_info "正在安装 Redis (macOS)..."
            if command -v brew &> /dev/null; then
                brew install redis
                brew services start redis
            else
                print_error "需要 Homebrew 来安装 Redis"
                return 1
            fi
            ;;
        *)
            print_error "不支持的系统，请手动安装 Redis"
            return 1
            ;;
    esac
    
    print_success "Redis 安装完成"
}

# ============== 检查 Docker ==============
check_docker() {
    print_header "检查 Docker"
    
    if command -v docker &> /dev/null; then
        print_success "Docker 已安装: $(docker --version)"
        
        if docker compose version &> /dev/null; then
            print_success "Docker Compose 已安装"
        elif command -v docker-compose &> /dev/null; then
            print_success "Docker Compose 已安装 (旧版)"
        else
            print_warning "Docker Compose 未安装"
            return 1
        fi
        return 0
    else
        print_warning "Docker 未安装"
        return 1
    fi
}

# ============== 编译项目 ==============
build_project() {
    print_header "编译项目"
    
    cd "$SCRIPT_DIR"
    
    # 下载依赖
    print_info "正在下载依赖..."
    go mod download
    
    # 编译服务端
    print_info "正在编译服务端..."
    go build -o bin/server ./cmd/server
    print_success "服务端编译完成: bin/server"
    
    # 编译客户端
    print_info "正在编译客户端..."
    go build -o bin/client ./cmd/client
    print_success "客户端编译完成: bin/client"
    
    print_success "项目编译完成！"
}

# ============== Docker 部署 ==============
deploy_docker() {
    print_header "Docker 部署"
    
    cd "$SCRIPT_DIR"
    
    # 检查 Docker
    if ! check_docker; then
        print_error "请先安装 Docker 和 Docker Compose"
        print_info "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # 创建 .env 文件
    if [ ! -f .env ]; then
        print_info "创建 .env 配置文件..."
        cp .env.example .env
        print_success ".env 文件已创建"
    fi
    
    # 拉取镜像并启动
    print_info "正在启动服务..."
    docker compose up -d
    
    print_success "服务启动成功！"
    echo ""
    print_info "服务信息:"
    echo "  - WebSocket 端口: $SERVER_PORT"
    echo "  - Redis 端口: $REDIS_PORT"
    echo ""
    print_info "查看日志: docker compose logs -f"
    print_info "停止服务: docker compose down"
}

# ============== 本地部署 ==============
deploy_local() {
    print_header "本地开发部署"
    
    cd "$SCRIPT_DIR"
    
    # 检查 Go
    if ! check_go; then
        print_warning "Go 环境未准备好，是否自动安装? [y/N]"
        read -r INSTALL_GO
        if [[ "$INSTALL_GO" =~ ^[Yy]$ ]]; then
            install_go
        else
            print_error "Go 环境是必需的，部署终止"
            exit 1
        fi
    fi
    
    # 检查 Redis
    if ! check_redis; then
        print_warning "Redis 未准备好，是否自动安装? [y/N]"
        read -r INSTALL_REDIS
        if [[ "$INSTALL_REDIS" =~ ^[Yy]$ ]]; then
            install_redis
        else
            print_error "Redis 是必需的，部署终止"
            exit 1
        fi
    fi
    
    # 创建配置文件
    if [ ! -f config.yaml ]; then
        print_warning "config.yaml 不存在"
        exit 1
    fi
    
    # 编译项目
    build_project
    
    # 创建日志目录
    mkdir -p logs
    
    print_success "本地部署完成！"
    echo ""
    print_info "启动服务端: ./bin/server"
    print_info "启动客户端: ./bin/client"
    print_info "或运行: ./start.sh"
}

# ============== 主函数 ==============
main() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         🎮 斗地主游戏一键部署脚本 v1.0                    ║"
    echo "║         Fight the Landlord Deploy Script                  ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    detect_os
    
    # 解析参数
    case "${1:-}" in
        --docker)
            deploy_docker
            ;;
        --local)
            deploy_local
            ;;
        --install-go)
            install_go
            ;;
        --install-redis)
            install_redis
            ;;
        --help|-h)
            show_help
            ;;
        "")
            # 交互式模式
            echo -e "${YELLOW}请选择部署方式:${NC}"
            echo "  1) Docker 部署 (推荐生产环境)"
            echo "  2) 本地开发部署"
            echo "  3) 仅安装 Go"
            echo "  4) 仅安装 Redis"
            echo "  5) 退出"
            echo ""
            read -p "请输入选项 [1-5]: " choice
            
            case $choice in
                1) deploy_docker ;;
                2) deploy_local ;;
                3) install_go ;;
                4) install_redis ;;
                5) echo "再见！"; exit 0 ;;
                *) print_error "无效选项"; exit 1 ;;
            esac
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_success "部署完成！祝游戏愉快！ 🎮"
}

# 执行主函数
main "$@"
