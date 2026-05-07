#!/bin/bash

#######################################################################
#                     斗地主游戏一键启动脚本
#                   Fight the Landlord Start Script
#######################################################################
# 
# 项目: fight-the-landlord
# 作者: palemoky
# GitHub: https://github.com/palemoky/fight-the-landlord
#
# 功能:
#   - 启动服务端 (前台/后台)
#   - 启动客户端
#   - 管理服务状态
#   - 查看日志
#
# 用法:
#   ./start.sh              # 显示菜单
#   ./start.sh server       # 启动服务端
#   ./start.sh client       # 启动客户端
#   ./start.sh --daemon     # 后台启动服务端
#   ./start.sh --stop       # 停止服务
#   ./start.sh --status     # 查看状态
#   ./start.sh --logs       # 查看日志
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

# ============== 配置 ==============
PROJECT_NAME="fight-the-landlord"
SERVER_PORT=1780
REDIS_PORT=6379
PID_FILE="./logs/server.pid"
LOG_DIR="./logs"
SERVER_LOG="$LOG_DIR/server.log"

# ============== 获取脚本目录 ==============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============== 创建必要目录 ==============
mkdir -p "$LOG_DIR"
mkdir -p bin

# ============== 帮助信息 ==============
show_help() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}           斗地主游戏一键启动脚本 v1.0                       ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./start.sh [命令] [选项]"
    echo ""
    echo -e "${YELLOW}命令:${NC}"
    echo "  server         启动服务端（前台）"
    echo "  client         启动客户端"
    echo "  --daemon, -d   后台启动服务端"
    echo "  --stop         停止服务端"
    echo "  --restart      重启服务端"
    echo "  --status       查看服务状态"
    echo "  --logs         查看实时日志"
    echo "  --build        编译项目"
    echo "  --help, -h     显示此帮助信息"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  ./start.sh server       # 前台启动服务端"
    echo "  ./start.sh --daemon     # 后台启动服务端"
    echo "  ./start.sh client       # 启动客户端"
    echo "  ./start.sh --status     # 查看状态"
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

# ============== 检查依赖 ==============
check_dependencies() {
    print_header "检查依赖"
    
    # 检查 Go
    if ! command -v go &> /dev/null; then
        print_error "Go 未安装，请先运行 ./deploy.sh --install-go"
        return 1
    fi
    print_success "Go: $(go version | cut -d' ' -f3)"
    
    # 检查 Redis
    if ! command -v redis-server &> /dev/null; then
        print_warning "Redis 未安装，请先运行 ./deploy.sh --install-redis"
    else
        print_success "Redis: 已安装"
        
        # 检查 Redis 是否运行
        if redis-cli ping &> /dev/null 2>&1; then
            print_success "Redis 服务: 运行中"
        else
            print_warning "Redis 服务: 未运行"
            print_info "正在启动 Redis..."
            
            if command -v systemctl &> /dev/null; then
                sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis 2>/dev/null || true
            elif command -v brew &> /dev/null; then
                brew services start redis 2>/dev/null || redis-server --daemonize yes 2>/dev/null || true
            else
                redis-server --daemonize yes 2>/dev/null || true
            fi
            
            sleep 1
            if redis-cli ping &> /dev/null 2>&1; then
                print_success "Redis 服务已启动"
            fi
        fi
    fi
    
    return 0
}

# ============== 检查端口 ==============
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -i:$port &> /dev/null; then
            return 0  # 端口被占用
        fi
    elif command -v ss &> /dev/null; then
        if ss -ln | grep -q ":$port "; then
            return 0
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -ln | grep -q ":$port "; then
            return 0
        fi
    fi
    return 1  # 端口未被占用
}

# ============== 编译项目 ==============
build_project() {
    print_header "编译项目"
    
    cd "$SCRIPT_DIR"
    
    # 检查 Go
    if ! command -v go &> /dev/null; then
        print_error "Go 未安装"
        exit 1
    fi
    
    # 下载依赖
    print_info "正在下载依赖..."
    go mod download
    
    # 整理依赖（确保所有依赖正确安装）
    print_info "正在整理依赖..."
    go mod tidy
    
    # 编译服务端
    print_info "正在编译服务端..."
    go build -o bin/server ./cmd/server
    print_success "服务端编译完成: bin/server"
    
    # 编译客户端
    print_info "正在编译客户端..."
    go build -o bin/client ./cmd/client
    print_success "客户端编译完成: bin/client"
    
    print_success "编译完成！"
}

# ============== 启动服务端 ==============
start_server() {
    print_header "启动服务端"
    
    cd "$SCRIPT_DIR"
    
    # 检查是否已运行
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            print_warning "服务端已在运行 (PID: $PID)"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # 检查端口
    if check_port $SERVER_PORT; then
        print_error "端口 $SERVER_PORT 已被占用"
        print_info "请检查是否有其他服务使用该端口"
        return 1
    fi
    
    # 检查可执行文件
    if [ ! -f bin/server ]; then
        print_info "服务端程序不存在，正在编译..."
        build_project
    fi
    
    # 启动服务
    print_info "正在启动服务端..."
    print_info "监听端口: $SERVER_PORT"
    
    if [ "$1" = "--daemon" ] || [ "$1" = "-d" ]; then
        # 后台启动
        nohup ./bin/server > "$SERVER_LOG" 2>&1 &
        PID=$!
        echo $PID > "$PID_FILE"
        sleep 1
        
        if kill -0 "$PID" 2>/dev/null; then
            print_success "服务端已启动 (PID: $PID)"
            print_info "日志文件: $SERVER_LOG"
            print_info "查看日志: ./start.sh --logs"
        else
            print_error "服务端启动失败"
            cat "$SERVER_LOG"
            return 1
        fi
    else
        # 前台启动
        print_info "前台模式启动，按 Ctrl+C 停止"
        echo ""
        ./bin/server
    fi
}

# ============== 停止服务端 ==============
stop_server() {
    print_header "停止服务端"
    
    if [ ! -f "$PID_FILE" ]; then
        print_warning "PID 文件不存在，服务可能未运行"
        
        # 尝试通过端口查找
        if check_port $SERVER_PORT; then
            print_info "检测到端口 $SERVER_PORT 被占用，尝试停止..."
            
            if command -v lsof &> /dev/null; then
                PID=$(lsof -t -i:$SERVER_PORT)
                if [ -n "$PID" ]; then
                    kill $PID 2>/dev/null || true
                    print_success "已停止进程 $PID"
                fi
            fi
        fi
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    
    if kill -0 "$PID" 2>/dev/null; then
        print_info "正在停止服务端 (PID: $PID)..."
        
        # 发送 SIGTERM 进行优雅关闭
        kill -TERM "$PID" 2>/dev/null
        
        # 等待进程结束（最多等待 30 秒）
        for i in {1..30}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                break
            fi
            sleep 1
            echo -n "."
        done
        echo ""
        
        if kill -0 "$PID" 2>/dev/null; then
            print_warning "进程未响应，强制终止..."
            kill -9 "$PID" 2>/dev/null || true
        fi
        
        rm -f "$PID_FILE"
        print_success "服务端已停止"
    else
        print_warning "进程不存在 (PID: $PID)"
        rm -f "$PID_FILE"
    fi
}

# ============== 重启服务端 ==============
restart_server() {
    print_header "重启服务端"
    stop_server
    sleep 2
    start_server --daemon
}

# ============== 查看状态 ==============
show_status() {
    print_header "服务状态"
    
    echo -e "${CYAN}项目信息:${NC}"
    echo "  名称: $PROJECT_NAME"
    echo "  目录: $SCRIPT_DIR"
    echo ""
    
    echo -e "${CYAN}服务端状态:${NC}"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "  状态: ${GREEN}运行中${NC}"
            echo "  PID: $PID"
            
            # 显示进程信息
            if command -v ps &> /dev/null; then
                ps -p "$PID" -o pid,ppid,%cpu,%mem,etime,cmd 2>/dev/null || true
            fi
        else
            echo -e "  状态: ${RED}已停止${NC} (PID 文件存在但进程不存在)"
        fi
    else
        echo -e "  状态: ${YELLOW}未运行${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}端口状态:${NC}"
    if check_port $SERVER_PORT; then
        echo -e "  $SERVER_PORT: ${GREEN}已监听${NC}"
    else
        echo -e "  $SERVER_PORT: ${YELLOW}未监听${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Redis 状态:${NC}"
    if redis-cli ping &> /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        redis-cli INFO server 2>/dev/null | grep -E "redis_version|uptime_in_seconds" || true
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi
}

# ============== 查看日志 ==============
show_logs() {
    print_header "查看日志"
    
    if [ ! -f "$SERVER_LOG" ]; then
        print_warning "日志文件不存在: $SERVER_LOG"
        return 1
    fi
    
    print_info "实时日志 (按 Ctrl+C 退出):"
    echo ""
    tail -f "$SERVER_LOG"
}

# ============== 启动客户端 ==============
start_client() {
    print_header "启动客户端"
    
    cd "$SCRIPT_DIR"
    
    # 检查可执行文件
    if [ ! -f bin/client ]; then
        print_info "客户端程序不存在，正在编译..."
        build_project
    fi
    
    # 启动客户端
    print_info "正在启动客户端..."
    print_info "连接地址: localhost:$SERVER_PORT"
    echo ""
    
    ./bin/client
}

# ============== 主函数 ==============
main() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         🎮 斗地主游戏一键启动脚本 v1.0                    ║"
    echo "║         Fight the Landlord Start Script                   ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # 解析参数
    case "${1:-}" in
        server)
            check_dependencies
            start_server "${2:-}"
            ;;
        client)
            start_client
            ;;
        --daemon|-d)
            check_dependencies
            start_server --daemon
            ;;
        --stop)
            stop_server
            ;;
        --restart)
            restart_server
            ;;
        --status)
            show_status
            ;;
        --logs)
            show_logs
            ;;
        --build)
            check_dependencies
            build_project
            ;;
        --help|-h)
            show_help
            ;;
        "")
            # 交互式菜单
            echo -e "${YELLOW}请选择操作:${NC}"
            echo "  1) 启动服务端 (前台)"
            echo "  2) 启动服务端 (后台)"
            echo "  3) 停止服务端"
            echo "  4) 重启服务端"
            echo "  5) 启动客户端"
            echo "  6) 查看状态"
            echo "  7) 查看日志"
            echo "  8) 编译项目"
            echo "  9) 退出"
            echo ""
            read -p "请输入选项 [1-9]: " choice
            
            case $choice in
                1) check_dependencies; start_server ;;
                2) check_dependencies; start_server --daemon ;;
                3) stop_server ;;
                4) restart_server ;;
                5) start_client ;;
                6) show_status ;;
                7) show_logs ;;
                8) check_dependencies; build_project ;;
                9) echo "再见！"; exit 0 ;;
                *) print_error "无效选项"; exit 1 ;;
            esac
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
