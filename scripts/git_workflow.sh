#!/bin/bash

# 脚本：增强版 Git 工作流助手
# 描述：根据预设模式执行 Git 操作，支持分支管理、自动重试推送等
# 注意：使用方式 gw <命令> [参数]，不要在命令中添加注释，shell 不会过滤掉这些注释

# --- 配置 ---
MAX_ATTEMPTS=${MAX_ATTEMPTS:-50}           # 最大尝试次数，可通过环境变量覆盖
DELAY_SECONDS=${DELAY_SECONDS:-1}          # 每次尝试之间的延迟（秒），可通过环境变量覆盖
REMOTE_NAME=${REMOTE_NAME:-"origin"}       # 默认的远程仓库名称，可通过环境变量覆盖
MAIN_BRANCH_NAME=${MAIN_BRANCH_NAME:-"master"} # 默认的主分支名称，可通过环境变量覆盖(根据需要改为"main")

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 设置中断处理
trap "echo -e '\n${YELLOW}脚本被用户中断，退出.${NC}'; exit 130" INT

# --- 帮助函数：获取当前分支名称 ---
get_current_branch_name() {
    local branch_name
    # 尝试获取当前分支名，抑制错误输出以便我们自己处理
    branch_name=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    local exit_code=$?

    # 检查是否成功获取，以及是否处于 detached HEAD 状态
    if [ $exit_code -ne 0 ] || [ -z "$branch_name" ] || [ "$branch_name" == "HEAD" ]; then
        echo -e "${RED}错误：无法确定当前分支名称，或您正处于 'detached HEAD' 状态。${NC}" >&2
        return 1
    fi
    echo "$branch_name"
    return 0
}

# --- 检查未提交的变更 ---
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️ 警告：当前分支存在未提交的变更，推送可能失败。${NC}"
        return 1
    fi
    return 0
}

# --- 检查是否需要 pull ---
check_need_pull() {
    local branch=$1
    git fetch "$REMOTE_NAME" "$branch" > /dev/null 2>&1
    local behind=$(git rev-list --count HEAD.."$REMOTE_NAME/$branch" 2>/dev/null)
    
    if [ "$behind" -gt 0 ] 2>/dev/null; then
        echo -e "${YELLOW}⚠️ 警告：当前分支落后于远程分支 $behind 个提交。建议先执行 git pull。${NC}"
        return 1
    fi
    return 0
}

# --- 检查是否在 Git 仓库中 ---
check_in_git_repo() {
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        echo -e "${RED}错误：当前目录不是 Git 仓库。${NC}"
        return 1
    fi
    return 0
}

# --- 执行带重试的 Git 推送 ---
do_push_with_retry() {
    local push_args=("$@")
    local command_str="git push ${push_args[*]}"
    
    echo -e "${GREEN}--- Git 推送重试执行 ---${NC}"
    echo "将尝试执行命令: $command_str"
    echo "最大尝试次数: $MAX_ATTEMPTS"
    if [ "$DELAY_SECONDS" -gt 0 ]; then
        echo "每次尝试间隔: ${DELAY_SECONDS} 秒"
    fi
    echo "-----------------------------------------"

    # 检查未提交的变更
    check_uncommitted_changes

    # 开始循环尝试
    for i in $(seq 1 $MAX_ATTEMPTS)
    do
       echo "--- 第 $i/$MAX_ATTEMPTS 次尝试: 执行 '$command_str' ---"

       # 执行构建好的 git push 命令
       git push "${push_args[@]}"

       # 检查退出状态码
       EXIT_CODE=$?
       if [ $EXIT_CODE -eq 0 ]; then
          echo -e "${GREEN}--- 推送成功 (第 $i 次尝试). 操作完成. ---${NC}"
          return 0
       else
          echo -e "${RED}!!! 第 $i 次尝试失败 (退出码: $EXIT_CODE). 正在重试... !!!${NC}"
       fi

       # 如果已经是最后一次尝试，则不需要再等待，直接跳出循环
       if [ $i -eq $MAX_ATTEMPTS ]; then
           break
       fi

       # 如果配置了延迟，则等待
       if [ "$DELAY_SECONDS" -gt 0 ]; then
           sleep $DELAY_SECONDS
       fi
    done

    # 如果循环完成仍未成功
    echo -e "${RED}=== 尝试 $MAX_ATTEMPTS 次后推送仍失败. 操作终止. ===${NC}"
    return 1
}

# --- 创建新分支并设置 ---
create_new_branch() {
    local new_branch=$1
    
    # 先确保在主分支并更新
    local current_branch=$(get_current_branch_name)
    if [ "$current_branch" != "$MAIN_BRANCH_NAME" ]; then
        echo -e "${YELLOW}当前不在主分支 $MAIN_BRANCH_NAME, 正在切换...${NC}"
        git checkout "$MAIN_BRANCH_NAME"
        if [ $? -ne 0 ]; then
            echo -e "${RED}切换到主分支失败，请检查分支名称或解决冲突后重试。${NC}"
            return 1
        fi
    fi
    
    # 拉取最新代码
    echo -e "${BLUE}从远程更新主分支...${NC}"
    git pull "$REMOTE_NAME" "$MAIN_BRANCH_NAME"
    if [ $? -ne 0 ]; then
        echo -e "${RED}更新主分支失败，请解决冲突后重试。${NC}"
        return 1
    fi
    
    # 创建并切换到新分支
    echo -e "${BLUE}创建并切换到新分支 '$new_branch'...${NC}"
    git checkout -b "$new_branch"
    if [ $? -ne 0 ]; then
        echo -e "${RED}创建分支失败，请检查分支名称或解决问题后重试。${NC}"
        return 1
    fi
    
    echo -e "${GREEN}成功创建并切换到新分支 '$new_branch'${NC}"
    return 0
}

# --- 完成分支工作，推送分支和创建 PR 准备 ---
finish_branch_work() {
    local branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # 检查是否有未提交的变更
    if ! check_uncommitted_changes; then
        echo -e "${YELLOW}您有未提交的变更。是否要先提交这些变更？ [y/N] ${NC}"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}请输入提交信息：${NC}"
            read -r commit_msg
            git add .
            git commit -m "$commit_msg"
            if [ $? -ne 0 ]; then
                echo -e "${RED}提交变更失败。请手动解决问题后重试。${NC}"
                return 1
            fi
        else
            echo -e "${YELLOW}跳过提交，继续执行...${NC}"
        fi
    fi
    
    # 推送分支
    echo -e "${BLUE}推送分支 '$branch' 到远程...${NC}"
    do_push_with_retry "-u" "$REMOTE_NAME" "$branch"
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # 提示创建 PR/MR
    echo -e "${GREEN}分支已成功推送到远程。${NC}"
    echo -e "${CYAN}现在您可以前往 GitHub/GitLab 创建 PR/MR。${NC}"
    
    # 询问是否要切回主分支
    echo -e "${YELLOW}是否要切回主分支 '$MAIN_BRANCH_NAME'？ [Y/n] ${NC}"
    read -r answer
    if [[ ! "$answer" =~ ^[Nn]$ ]]; then
        git checkout "$MAIN_BRANCH_NAME"
        git pull "$REMOTE_NAME" "$MAIN_BRANCH_NAME"
        echo -e "${GREEN}已切回主分支 '$MAIN_BRANCH_NAME' 并更新。${NC}"
    fi
    
    return 0
}

# --- 拉取并合并某个分支的变更 ---
pull_changes() {
    local branch=${1:-$(get_current_branch_name)}
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    echo -e "${BLUE}拉取远程 '$REMOTE_NAME/$branch' 的变更...${NC}"
    git pull "$REMOTE_NAME" "$branch"
    if [ $? -ne 0 ]; then
        echo -e "${RED}拉取变更失败，请手动解决冲突或问题。${NC}"
        return 1
    fi
    
    echo -e "${GREEN}成功拉取并合并变更。${NC}"
    return 0
}

# --- 获取仓库状态摘要 ---
show_repo_status() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    local current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    echo -e "${CYAN}=== Git 仓库状态 ===${NC}"
    echo -e "${BLUE}当前分支:${NC} $current_branch"
    
    # 获取远程信息
    git fetch --quiet
    
    # 获取领先/落后状态
    local ahead_behind=$(git rev-list --left-right --count "$current_branch"..."$REMOTE_NAME/$current_branch" 2>/dev/null)
    if [ $? -eq 0 ]; then
        local ahead=$(echo "$ahead_behind" | awk '{print $1}')
        local behind=$(echo "$ahead_behind" | awk '{print $2}')
        echo -e "${BLUE}与远程比较:${NC} 领先 $ahead 个提交, 落后 $behind 个提交"
    else
        echo -e "${YELLOW}此分支尚未推送到远程${NC}"
    fi
    
    # 检查未提交变更
    local changes=$(git status --porcelain | wc -l)
    echo -e "${BLUE}未提交变更:${NC} $changes 个文件"
    
    # 显示最近提交
    echo -e "${BLUE}最近提交:${NC}"
    git log -1 --pretty=format:"%h %s (%an, %ar)"
    echo ""
    
    return 0
}

# --- 显示帮助信息 ---
show_help() {
    echo -e "${CYAN}=== Git 工作流助手 使用说明 ===${NC}"
    echo -e "${GREEN}基本命令:${NC}"
    echo "  gw push                  - 推送当前分支到远程 (自动处理首次推送)"
    echo "  gw push <分支名>         - 推送指定分支到远程"
    echo "  gw main                  - 推送到主分支 ($MAIN_BRANCH_NAME)"
    echo "  gw new <分支名>          - 从最新主分支创建新的功能分支"
    echo "  gw finish                - 完成当前分支工作并推送 (准备 PR/MR)"
    echo "  gw pull                  - 拉取当前分支更新"
    echo "  gw status                - 显示仓库状态摘要"
    echo ""
    echo -e "${RED}注意：命令行中不要添加注释，例如：${NC}"
    echo -e "  ${RED}错误用法：${NC} gw push  # 这是注释"
    echo -e "  ${GREEN}正确用法：${NC} gw push"
    echo ""
    echo -e "${GREEN}高级模式 (原 gp 兼容命令):${NC}"
    echo "  gw 1 <分支名>            - 首次推送指定分支 (带 -u)"
    echo "  gw 2                     - 推送主分支 ($MAIN_BRANCH_NAME)"
    echo "  gw 3 <分支名>            - 推送指定已存在的分支"
    echo "  gw 4                     - 推送当前所在分支"
    echo ""
    echo -e "${GREEN}环境变量设置:${NC}"
    echo "  MAIN_BRANCH_NAME=main    - 设置主分支名称 (默认: master)"
    echo "  REMOTE_NAME=upstream     - 设置远程仓库名称 (默认: origin)"
    echo "  MAX_ATTEMPTS=20          - 设置最大重试次数 (默认: 50)"
    echo "  DELAY_SECONDS=2          - 设置重试间隔秒数 (默认: 1)"
    echo ""
    echo -e "${YELLOW}提示：如需使用旧版 gp 命令，请在 .zshrc 中添加别名：alias gp='gw'${NC}"
}

# --- 主程序 ---
if ! check_in_git_repo; then
    exit 1
fi

# 参数解析
COMMAND=$1
shift

# 使用 case 语句根据第一个参数 $COMMAND 选择操作模式
case "$COMMAND" in
    # --- 新命令系统 ---
    ("push")
        # 过滤掉注释（以#开头的参数）和其后的所有参数
        BRANCH_ARG=""
        for arg in "$@"; do
            # 如果发现参数是以 # 开头，就停止处理后续参数
            if [[ "$arg" == \#* ]]; then
                break
            fi
            # 否则，设置为分支参数并退出循环（只取第一个非#参数）
            BRANCH_ARG="$arg"
            break
        done
        
        if [ -z "$BRANCH_ARG" ]; then
            # 自动检测是否需要 -u
            CURRENT_BRANCH=$(get_current_branch_name)
            if [ $? -ne 0 ]; then
                exit 1
            fi
            
            # 检查分支是否存在于远程
            git ls-remote --heads "$REMOTE_NAME" "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"
            if [ $? -ne 0 ]; then
                echo -e "${BLUE}首次推送分支 '$CURRENT_BRANCH'，自动设置上游跟踪...${NC}"
                do_push_with_retry "-u" "$REMOTE_NAME" "$CURRENT_BRANCH"
            else
                echo -e "${BLUE}推送已存在的分支 '$CURRENT_BRANCH'...${NC}"
                do_push_with_retry "$REMOTE_NAME" "$CURRENT_BRANCH"
            fi
        else
            # 推送指定分支
            # 检查分支是否存在于远程
            git ls-remote --heads "$REMOTE_NAME" "$BRANCH_ARG" | grep -q "$BRANCH_ARG"
            if [ $? -ne 0 ]; then
                echo -e "${BLUE}首次推送分支 '$BRANCH_ARG'，自动设置上游跟踪...${NC}"
                do_push_with_retry "-u" "$REMOTE_NAME" "$BRANCH_ARG"
            else
                echo -e "${BLUE}推送已存在的分支 '$BRANCH_ARG'...${NC}"
                do_push_with_retry "$REMOTE_NAME" "$BRANCH_ARG"
            fi
        fi
        ;;
        
    ("main" | "master")
        # 推送主分支
        do_push_with_retry "$REMOTE_NAME" "$MAIN_BRANCH_NAME" "$@"
        ;;
        
    ("new")
        # 创建新分支
        NEW_BRANCH=$1
        if [ -z "$NEW_BRANCH" ]; then
            echo -e "${RED}错误：'new' 命令需要指定分支名称。${NC}"
            echo "用法: gw new <分支名>"
            exit 1
        fi
        create_new_branch "$NEW_BRANCH"
        ;;
        
    ("finish")
        # 完成分支工作
        finish_branch_work
        ;;
        
    ("pull")
        # 拉取更新
        BRANCH_ARG=$1
        pull_changes "$BRANCH_ARG"
        ;;
        
    ("status")
        # 显示状态
        show_repo_status
        ;;
        
    ("help" | "--help" | "-h")
        # 显示帮助
        show_help
        ;;
    
    # --- 原 gp 兼容命令 ---
    ("1" | "first")
        # 模式 1: 首次推送分支 (需要指定分支名, 带 -u)
        BRANCH_ARG=$1
        if [ -z "$BRANCH_ARG" ]; then
            echo -e "${RED}错误：模式 'first' (或 '1') 需要第二个参数指定分支名称。${NC}"
            echo "用法: gw first <分支名>"
            exit 1
        fi
        do_push_with_retry "-u" "$REMOTE_NAME" "$BRANCH_ARG" "${@:2}"
        ;;

    ("2")
        # 模式 2: 推送主分支
        do_push_with_retry "$REMOTE_NAME" "$MAIN_BRANCH_NAME" "$@"
        ;;

    ("3" | "other")
        # 模式 3: 推送其他指定的分支 (需要指定分支名, 不带 -u)
        BRANCH_ARG=$1
        if [ -z "$BRANCH_ARG" ]; then
            echo -e "${RED}错误：模式 'other' (或 '3') 需要第二个参数指定分支名称。${NC}"
            echo "用法: gw other <分支名>"
            exit 1
        fi
        do_push_with_retry "$REMOTE_NAME" "$BRANCH_ARG" "${@:2}"
        ;;

    ("4" | "current")
        # 模式 4: 推送当前分支
        CURRENT_BRANCH=$(get_current_branch_name)
        if [ $? -ne 0 ]; then
            exit 1
        fi
        do_push_with_retry "$REMOTE_NAME" "$CURRENT_BRANCH" "$@"
        ;;

    ("") # 无参数: 显示帮助
        show_help
        ;;
        
    *) # 无效命令
        echo -e "${RED}错误：无法识别的命令 '$COMMAND'${NC}"
        echo "使用 'gw help' 查看命令帮助"
        exit 1
        ;;
esac

exit $?