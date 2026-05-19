#!/bin/bash

#######################################################################
#               欢乐斗地主 - 一键启动脚本
#######################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}           欢乐斗地主 - 一键启动脚本                        ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./start.sh server       启动后端服务 (需要Redis)"
    echo "  ./start.sh mock-api     启动Mock API服务 (无需Redis)"
    echo "  ./start.sh --daemon     后台启动后端服务"
    echo "  ./start.sh --stop       停止后端服务"
    echo "  ./start.sh --status     查看服务状态"
    echo "  ./start.sh --help       显示帮助信息"
    echo ""
}

start_server() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  启动后端服务                                              ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    cd "$SCRIPT_DIR/server"

    if [ ! -f bin/server ]; then
        echo -e "${YELLOW}服务端未编译，正在编译...${NC}"
        go build -o bin/server ./cmd/server
    fi

    echo -e "${GREEN}启动服务端 (端口 1780)...${NC}"
    ./bin/server
}

start_mock_api() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  启动Mock API服务 (无需Redis)                              ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    cd "$SCRIPT_DIR/server"

    if command -v node &> /dev/null; then
        echo -e "${GREEN}启动Mock API服务器 (端口 1781)...${NC}"
        node mock_api.js
    else
        echo -e "${RED}Node.js 未安装，无法启动Mock API服务器${NC}"
        exit 1
    fi
}

start_server_daemon() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  后台启动后端服务                                          ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/server"
    
    if [ ! -f bin/server ]; then
        echo -e "${YELLOW}服务端未编译，正在编译...${NC}"
        go build -o bin/server ./cmd/server
    fi
    
    mkdir -p logs
    nohup ./bin/server > logs/server.log 2>&1 &
    PID=$!
    echo $PID > logs/server.pid
    
    echo -e "${GREEN}✓ 服务已启动 (PID: $PID)${NC}"
    echo -e "${CYAN}日志文件: logs/server.log${NC}"
    echo -e "${CYAN}停止服务: ./start.sh --stop${NC}"
}

stop_server() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  停止后端服务                                              ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/server"
    
    if [ -f logs/server.pid ]; then
        PID=$(cat logs/server.pid)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo -e "${GREEN}✓ 服务已停止 (PID: $PID)${NC}"
        else
            echo -e "${YELLOW}服务未运行${NC}"
        fi
        rm -f logs/server.pid
    else
        echo -e "${YELLOW}未找到 PID 文件${NC}"
    fi
}

show_status() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  服务状态                                                  ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    
    cd "$SCRIPT_DIR/server"
    
    if [ -f logs/server.pid ]; then
        PID=$(cat logs/server.pid)
        if kill -0 $PID 2>/dev/null; then
            echo -e "${GREEN}服务运行中 (PID: $PID)${NC}"
        else
            echo -e "${RED}服务已停止${NC}"
        fi
    else
        echo -e "${YELLOW}服务未启动${NC}"
    fi
    
    # 检查端口
    if command -v lsof &> /dev/null; then
        if lsof -i:1780 &> /dev/null; then
            echo -e "${GREEN}端口 1780: 已监听${NC}"
        else
            echo -e "${YELLOW}端口 1780: 未监听${NC}"
        fi
    fi
    
    # 检查 Redis
    if redis-cli ping &> /dev/null 2>&1; then
        echo -e "${GREEN}Redis: 运行中${NC}"
    else
        echo -e "${RED}Redis: 未运行${NC}"
    fi
}

main() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         🎮 欢乐斗地主 - 一键启动脚本                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    case "${1:-}" in
        server)
            start_server
            ;;
        mock-api|mock)
            start_mock_api
            ;;
        --daemon|-d)
            start_server_daemon
            ;;
        --stop)
            stop_server
            ;;
        --status)
            show_status
            ;;
        --help|-h)
            show_help
            ;;
        "")
            echo -e "${YELLOW}请选择操作:${NC}"
            echo "  1) 启动服务端 (前台)"
            echo "  2) 启动服务端 (后台)"
            echo "  3) 停止服务端"
            echo "  4) 查看状态"
            echo "  5) 退出"
            echo ""
            read -p "请输入选项 [1-5]: " choice
            
            case $choice in
                1) start_server ;;
                2) start_server_daemon ;;
                3) stop_server ;;
                4) show_status ;;
                5) echo "再见！"; exit 0 ;;
                *) echo -e "${RED}无效选项${NC}"; exit 1 ;;
            esac
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
