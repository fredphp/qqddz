#!/bin/bash

#######################################################################
#               欢乐斗地主 - 一键部署脚本
#######################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}           欢乐斗地主 - 一键部署脚本                        ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./deploy.sh [选项]"
    echo ""
    echo -e "${YELLOW}选项:${NC}"
    echo "  --server       仅部署后端服务"
    echo "  --client       仅准备客户端"
    echo "  --all          部署全部（默认）"
    echo "  --docker       使用 Docker 部署后端"
    echo "  --help, -h     显示帮助信息"
    echo ""
}

deploy_server_docker() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  部署后端服务 (Docker)                                    ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/server"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ 已创建 .env 配置文件${NC}"
    fi
    
    docker compose up -d
    echo -e "${GREEN}✓ 后端服务已启动${NC}"
    echo ""
    echo -e "${CYAN}服务信息:${NC}"
    echo "  - WebSocket 端口: 1780"
    echo "  - Redis 端口: 6379"
    echo ""
    echo -e "${CYAN}查看日志: docker compose logs -f${NC}"
    echo -e "${CYAN}停止服务: docker compose down${NC}"
}

deploy_server_local() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  部署后端服务 (本地)                                      ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/server"
    
    # 检查 Go
    if ! command -v go &> /dev/null; then
        echo -e "${RED}✗ Go 未安装，请先安装 Go 1.21+${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Go: $(go version)${NC}"
    
    # 检查 Redis
    if ! command -v redis-server &> /dev/null; then
        echo -e "${YELLOW}⚠ Redis 未安装${NC}"
    else
        echo -e "${GREEN}✓ Redis 已安装${NC}"
        if ! redis-cli ping &> /dev/null; then
            echo -e "${YELLOW}⚠ Redis 未运行，正在启动...${NC}"
            redis-server --daemonize yes 2>/dev/null || true
        fi
    fi
    
    # 下载依赖
    echo -e "${CYAN}正在下载依赖...${NC}"
    go mod download
    
    # 编译
    echo -e "${CYAN}正在编译...${NC}"
    go build -o bin/server ./cmd/server
    
    echo -e "${GREEN}✓ 后端编译完成: bin/server${NC}"
    echo ""
    echo -e "${CYAN}启动服务端: ./bin/server${NC}"
    echo -e "${CYAN}或使用: ./start.sh server${NC}"
}

prepare_client() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  准备客户端                                                ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/client"
    
    echo -e "${CYAN}客户端需要使用 Cocos Creator 打开:${NC}"
    echo ""
    echo "1. 安装 Cocos Creator 2.4.x"
    echo "   下载地址: https://www.cocos.com/creator-download"
    echo ""
    echo "2. 打开项目"
    echo "   路径: $SCRIPT_DIR/client"
    echo ""
    echo "3. 修改服务器地址"
    echo "   文件: assets/scripts/defines.js"
    echo "   修改: var serverUrl = \"ws://YOUR_SERVER:1780/ws\""
    echo ""
    echo "4. 运行或构建"
    echo "   点击 Cocos Creator 的运行按钮测试"
    echo "   或使用 构建 -> 发布平台"
}

main() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         🎮 欢乐斗地主 - 一键部署脚本                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    case "${1:-}" in
        --server)
            deploy_server_local
            ;;
        --client)
            prepare_client
            ;;
        --docker)
            deploy_server_docker
            ;;
        --all|"")
            deploy_server_local
            echo ""
            prepare_client
            ;;
        --help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✓ 部署完成！${NC}"
}

main "$@"
