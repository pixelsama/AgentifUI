#!/bin/bash

# 脚本：增强版 Git 工作流助手 (Git Workflow - gw)
# 描述：根据实际工作流程优化的 Git 操作集合，提供便捷的一站式命令
# 版本：3.0

# --- 配置变量 ---
MAX_ATTEMPTS=${MAX_ATTEMPTS:-50}           # 最大尝试次数，可通过环境变量覆盖
DELAY_SECONDS=${DELAY_SECONDS:-1}          # 每次尝试之间的延迟（秒），可通过环境变量覆盖
REMOTE_NAME=${REMOTE_NAME:-"origin"}       # 默认的远程仓库名称，可通过环境变量覆盖
DEFAULT_MAIN_BRANCH=${DEFAULT_MAIN_BRANCH:-"master"}  # 默认的主分支名称，可通过环境变量覆盖

# --- 获取实际的主分支名称 (master 或 main) ---
get_main_branch_name() {
    # 检查 master 和 main 是否存在，优先返回存在的
    if git rev-parse --verify --quiet master >/dev/null 2>&1; then
        echo "master"
        return 0
    elif git rev-parse --verify --quiet main >/dev/null 2>&1; then
        echo "main"
        return 0
    else
        # 如果都不存在，返回配置的默认值
        echo "$DEFAULT_MAIN_BRANCH"
        return 0
    fi
}

# 设置实际使用的主分支名
MAIN_BRANCH=$(get_main_branch_name)

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 记录最后一次命令的执行状态
LAST_COMMAND_STATUS=0

# 设置中断处理
trap "echo -e '\n${YELLOW}脚本被用户中断，退出.${NC}'; exit 130" INT

# --- 工具函数 ---

# 获取当前分支名称
get_current_branch_name() {
    local branch_name
    branch_name=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    local exit_code=$?

    if [ $exit_code -ne 0 ] || [ -z "$branch_name" ] || [ "$branch_name" == "HEAD" ]; then
        echo -e "${RED}错误：无法确定当前分支名称，或您正处于 'detached HEAD' 状态。${NC}" >&2
        return 1
    fi
    echo "$branch_name"
    return 0
}

# 检查是否在 Git 仓库中
check_in_git_repo() {
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        echo -e "${RED}错误：当前目录不是 Git 仓库。${NC}"
        return 1
    fi
    return 0
}

# 检查是否有未提交的变更
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        return 0  # 有变更返回0（成功）
    fi
    return 1  # 无变更返回1（失败）
}

# 检查是否有未追踪的文件
check_untracked_files() {
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        return 0  # 有未追踪文件返回0（成功）
    fi
    return 1  # 无未追踪文件返回1（失败）
}

# 检查文件是否已暂存
is_file_staged() {
    local file="$1"
    git diff --cached --name-only | grep -q "^$file$"
    return $?
}

# 执行带重试的 Git 推送
do_push_with_retry() {
    local push_args=()
    local remote="$REMOTE_NAME"
    local branch_to_push=""
    local current_branch
    current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then return 1; fi

    # --- 前置检查：未提交的变更 ---
    if check_uncommitted_changes || check_untracked_files; then
        echo -e "${YELLOW}检测到未提交的变更或未追踪的文件。${NC}"
        # 列出具体文件
        echo "变更详情:"
        git status -s
        echo ""
        if confirm_action "是否要将所有变更添加到暂存区并提交，然后再推送？"; then
            echo -e "${BLUE}正在暂存所有变更...${NC}"
            cmd_add_all
            if [ $? -ne 0 ]; then
                echo -e "${RED}暂存变更失败，推送已取消。${NC}"
                return 1
            fi
            
            echo -e "${BLUE}正在提交变更...${NC}"
            # 调用 cmd_commit 时不带 -m，让用户在编辑器中输入信息
            cmd_commit
            if [ $? -ne 0 ]; then
                echo -e "${RED}提交失败或被取消，推送已取消。${NC}"
                return 1
            fi
            echo -e "${GREEN}变更已提交，继续推送...${NC}"
        else
            echo "推送已取消。请先处理未提交的变更。"
            return 1
        fi
    fi

    # 解析传入的参数，分离出远程和分支，保留其他 git push 参数
    local other_args=()
    local arg_count=$#
    local args_array=("$@") # 将参数存入数组

    # 尝试识别远程和分支参数，并处理 --set-upstream 等常见选项
    # 这是一个简化的解析，可能无法覆盖所有 git push 的复杂场景
    local potential_remote=""
    local potential_branch=""
    local set_upstream=false

    for (( i=0; i<$arg_count; i++ )); do
        local arg="${args_array[i]}"
        case "$arg" in
            -u|--set-upstream)
                set_upstream=true
                other_args+=("$arg")
                ;;
            -f|--force|--force-with-lease)
                other_args+=("$arg")
                ;;
            # 其他需要保留的标志...
            -*)
                other_args+=("$arg") # 保留其他选项
                ;;
            *)
                # 非选项参数，可能是远程或分支
                if [ -z "$potential_remote" ]; then
                    # 尝试检查是否是已知的远程仓库名
                    if git remote | grep -q "^$arg$"; then
                        potential_remote="$arg"
                    elif [ -z "$potential_branch" ]; then # 如果不是远程，可能是分支
                        potential_branch="$arg"
                    else # 如果远程和分支都已有值，则认为是其他参数
                        other_args+=("$arg")
                    fi
                elif [ -z "$potential_branch" ]; then
                    potential_branch="$arg"
                else
                    other_args+=("$arg") # 多余的非选项参数
                fi
                ;;
        esac
    done

    # 确定最终的远程和分支
    remote=${potential_remote:-$REMOTE_NAME} # 如果没指定远程，使用默认
    branch_to_push=${potential_branch:-$current_branch} # 如果没指定分支，推送当前分支

    # 组合最终的 push 参数
    push_args=("$remote" "$branch_to_push")
    push_args+=("${other_args[@]}") # 添加其他保留的参数

    # 如果是第一次推送当前分支，且用户没有指定 -u，自动添加 --set-upstream
    if ! git rev-parse --verify --quiet "refs/remotes/$remote/$current_branch" > /dev/null 2>&1 && \
       [ "$branch_to_push" == "$current_branch" ] && \
       ! $set_upstream; then
        if ! printf '%s\n' "${other_args[@]}" | grep -q -e '-u' -e '--set-upstream'; then
           echo -e "${BLUE}检测到是首次推送分支 '$current_branch' 到 '$remote'，将自动设置上游跟踪 (-u)。${NC}"
           push_args+=("--set-upstream")
        fi
    fi
    
    local command_str="git push ${push_args[*]}"
    
    echo -e "${GREEN}--- Git 推送重试执行 ---${NC}"
    echo "执行命令: $command_str"
    echo "最大尝试次数: $MAX_ATTEMPTS"
    if [ "$DELAY_SECONDS" -gt 0 ]; then
        echo "每次尝试间隔: ${DELAY_SECONDS} 秒"
    fi
    echo "-----------------------------------------"

    # 开始循环尝试
    for i in $(seq 1 $MAX_ATTEMPTS)
    do
       echo "--- 第 $i/$MAX_ATTEMPTS 次尝试 ---"

       # 执行 git push 命令
       git push "${push_args[@]}"

       # 检查退出状态码
       EXIT_CODE=$?
       if [ $EXIT_CODE -eq 0 ]; then
          echo -e "${GREEN}--- 推送成功 (第 $i 次尝试). 操作完成. ---${NC}"
          return 0
       else
          echo -e "${RED}!!! 第 $i 次尝试失败 (退出码: $EXIT_CODE). 正在重试... !!!${NC}"
       fi

       # 如果已经是最后一次尝试，则不需要等待
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

# 交互式选择文件
interactive_select_files() {
    local title="$1"
    local file_list=("${@:2}")
    local selected_files=()
    local num_files=${#file_list[@]}
    
    if [ $num_files -eq 0 ]; then
        echo "没有可选择的文件。"
        return 1
    fi

    # 在终端下使用更简单的选择方式，防止zsh兼容性问题
    echo -e "${CYAN}${title}${NC}"
    echo "输入文件编号（用空格分隔多个编号）来选择文件，或输入 'a' 选择全部，输入 'q' 取消。"
    echo ""

    # 显示所有文件，带编号
    for ((i=0; i<$num_files; i++)); do
        echo "[$i] ${file_list[$i]}"
    done
    echo ""
    
    echo -n "请选择 (0-$((num_files-1)), a=全部, q=取消): "
    read -r selection
    
    # 处理用户输入
    if [[ "$selection" == "q" ]]; then
        echo "已取消选择。"
        return 1
    elif [[ "$selection" == "a" ]]; then
        selected_files=("${file_list[@]}")
    else
        # 解析用户输入的编号
        for num in $selection; do
            if [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -lt "$num_files" ]; then
                selected_files+=("${file_list[$num]}")
            else
                echo "忽略无效选择: $num"
            fi
        done
    fi
    
    if [ ${#selected_files[@]} -eq 0 ]; then
        echo "未选择任何文件。"
        return 1
    fi
    
    echo -e "${GREEN}已选择 ${#selected_files[@]} 个文件：${NC}"
    for file in "${selected_files[@]}"; do
        echo " - $file"
        echo "$file"  # 输出到 stdout 供调用者捕获
    done
    
    return 0
}

# 确认操作（Y/n）
confirm_action() {
    local message="$1"
    local default="${2:-Y}"  # 默认为 Y
    
    if [[ "$default" == "Y" ]]; then
        prompt="[Y/n]"
        default_answer="Y"
    else
        prompt="[y/N]"
        default_answer="N"
    fi
    
    echo -e -n "${YELLOW}$message $prompt ${NC}"
    read -r answer
    
    if [[ -z "$answer" ]]; then
        answer="$default_answer"
    fi
    
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# 获取正在编辑的提交消息文件路径
get_commit_msg_file() {
    local commit_msg_file=""
    
    # 检查是否处于提交编辑状态
    if [ -f ".git/COMMIT_EDITMSG" ]; then
        commit_msg_file=".git/COMMIT_EDITMSG"
    elif [ -f "$(git rev-parse --git-dir)/COMMIT_EDITMSG" ]; then
        commit_msg_file="$(git rev-parse --git-dir)/COMMIT_EDITMSG"
    fi
    
    echo "$commit_msg_file"
}

# --- 命令实现 ---

# 显示仓库的所有分支
cmd_branches() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    echo -e "${CYAN}=== 本地分支列表 ===${NC}"
    
    # 获取当前分支名
    current_branch=$(get_current_branch_name)
    
    # 本地分支
    echo -e "${BOLD}本地分支:${NC}"
    git for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(color:red)%(objectname:short)%(color:reset) - %(contents:subject) - %(authorname) (%(color:green)%(committerdate:relative)%(color:reset))' | 
    while read -r branch; do
        if [[ $branch == "*"* ]]; then
            # 如果是当前分支，用绿色标记
            echo -e "${GREEN}$branch${NC}"
        else
            echo "$branch"
        fi
    done

    # 远程分支
    echo -e "\n${BOLD}远程分支:${NC}"
    git for-each-ref --sort=committerdate refs/remotes/ --format='%(color:yellow)%(refname:short)%(color:reset) - %(color:red)%(objectname:short)%(color:reset) - %(contents:subject) - %(authorname) (%(color:green)%(committerdate:relative)%(color:reset))' |
    grep -v "HEAD"
    
    return 0
}

# 切换分支
cmd_checkout() {
    if ! check_in_git_repo; then
        return 1
    fi

    local branch="$1"
    
    if [ -z "$branch" ]; then
        # 没有提供分支名，显示所有可选分支并交互式选择
        echo -e "${CYAN}可用分支:${NC}"
        branches=($(git branch --format="%(refname:short)" | sort))
        
        PS3="选择要切换的分支 (输入数字): "
        select branch_name in "${branches[@]}" "取消"; do
            if [ "$branch_name" = "取消" ]; then
                echo "已取消分支切换。"
                return 0
            elif [ -n "$branch_name" ]; then
                branch="$branch_name"
                break
            else
                echo "无效选择，请重试。"
            fi
        done
    fi
    
    # 检查是否有未提交的变更
    if check_uncommitted_changes || check_untracked_files; then
        echo -e "${YELLOW}⚠️ 警告：您有未提交的变更或未追踪的文件。${NC}"
        echo "1) 提交变更"
        echo "2) 暂存变更"
        echo "3) 放弃变更"
        echo "4) 保持变更并切换分支"
        echo "5) 取消操作"
        echo -n "请选择操作 [1-5]: "
        read -r choice
        
        case "$choice" in
            1)
                # 提交变更
                cmd_commit_all
                ;;
            2)
                # 暂存变更
                echo -e "${BLUE}正在暂存当前变更...${NC}"
                git stash save "Auto-stashed before checkout to $branch"
                ;;
            3)
                # 放弃变更
                if confirm_action "确定要放弃所有未提交的变更吗？这个操作不可逆！" "N"; then
                    echo -e "${BLUE}正在放弃变更...${NC}"
                    git reset --hard HEAD
                    git clean -fd
                else
                    echo "已取消。"
                    return 1
                fi
                ;;
            4)
                # 继续保持变更
                echo -e "${YELLOW}保持变更并尝试切换分支，如果有冲突可能会失败。${NC}"
                ;;
            5|*)
                echo "已取消分支切换。"
                return 1
                ;;
        esac
    fi
    
    # 执行分支切换
    echo -e "${BLUE}正在切换到分支 '$branch'...${NC}"
    git checkout "$branch"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功切换到分支 '$branch'${NC}"
        return 0
    else
        echo -e "${RED}切换分支失败，请检查分支名称或解决冲突。${NC}"
        return 1
    fi
}

# 创建并切换到新分支
cmd_new_branch() {
    if ! check_in_git_repo; then
        return 1
    fi

    local new_branch="$1"
    local base_branch="$2"
    
    if [ -z "$new_branch" ]; then
        echo -n "请输入新分支名称: "
        read -r new_branch
        
        if [ -z "$new_branch" ]; then
            echo -e "${RED}错误：必须指定分支名称。${NC}"
            return 1
        fi
    fi
    
    # 检查分支名是否已存在
    if git show-ref --verify --quiet refs/heads/"$new_branch"; then
        echo -e "${RED}错误：分支 '$new_branch' 已存在。${NC}"
        return 1
    fi
    
    # 如果没有指定基础分支，则使用主分支
    if [ -z "$base_branch" ]; then
        base_branch="$MAIN_BRANCH"
        echo -e "${BLUE}将基于 '$base_branch' 创建新分支。${NC}"
    fi
        
    # 先检查是否需要切换到基础分支
    current_branch=$(get_current_branch_name)
    if [ "$current_branch" != "$base_branch" ]; then
        echo -e "${YELLOW}当前在 '$current_branch' 分支，需先切换到 '$base_branch'。${NC}"
        
        # 检查是否有未提交的变更
        if check_uncommitted_changes || check_untracked_files; then
            echo -e "${YELLOW}⚠️ 警告：您有未提交的变更或未追踪的文件。${NC}"
            echo "1) 提交变更"
            echo "2) 暂存变更"
            echo "3) 保持变更并尝试切换"
            echo "4) 取消操作"
            echo -n "请选择操作 [1-4]: "
            read -r choice
            
            case "$choice" in
                1)
                    # 提交变更
                    cmd_commit_all
                    ;;
                2)
                    # 暂存变更
                    echo -e "${BLUE}正在暂存当前变更...${NC}"
                    git stash save "Auto-stashed before switching to $base_branch"
                    ;;
                3)
                    # 继续保持变更
                    echo -e "${YELLOW}保持变更并尝试切换分支，如果有冲突可能会失败。${NC}"
                    ;;
                4|*)
                    echo "已取消创建新分支。"
                    return 1
                    ;;
            esac
        fi
        
        # 切换到基础分支
        echo -e "${BLUE}正在切换到 '$base_branch' 分支...${NC}"
        git checkout "$base_branch"
        if [ $? -ne 0 ]; then
            echo -e "${RED}切换到基础分支失败，中止操作。${NC}"
            return 1
        fi
    fi
    
    # 更新基础分支
    echo -e "${BLUE}更新 '$base_branch' 分支...${NC}"
    git pull "$REMOTE_NAME" "$base_branch"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}警告：拉取最新代码失败，可能会基于过时的代码创建分支。${NC}"
        if ! confirm_action "是否继续创建分支？"; then
            return 1
        fi
    fi
    
    # 创建并切换到新分支
    echo -e "${BLUE}创建并切换到新分支 '$new_branch'...${NC}"
    git checkout -b "$new_branch"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功创建并切换到新分支 '$new_branch'${NC}"
        return 0
    else
        echo -e "${RED}创建分支失败，请检查分支名称或解决问题。${NC}"
        return 1
    fi
}

# 删除分支
cmd_delete_branch() {
    if ! check_in_git_repo; then
        return 1
    fi

    local branch="$1"
    local force="$2"  # 是否强制删除
    
    if [ -z "$branch" ]; then
        # 没有提供分支名，显示所有可选分支并交互式选择
        current_branch=$(get_current_branch_name)
        echo -e "${CYAN}可删除的分支:${NC}"
        branches=($(git branch --format="%(refname:short)" | grep -v "^$current_branch$" | sort))
        
        if [ ${#branches[@]} -eq 0 ]; then
            echo "没有可删除的分支。"
            return 1
        fi
        
        PS3="选择要删除的分支 (输入数字): "
        select branch_name in "${branches[@]}" "取消"; do
            if [ "$branch_name" = "取消" ]; then
                echo "已取消分支删除操作。"
                return 0
            elif [ -n "$branch_name" ]; then
                branch="$branch_name"
                break
            else
                echo "无效选择，请重试。"
            fi
        done
    fi
    
    # 检查不能删除当前分支
    current_branch=$(get_current_branch_name)
    if [ "$branch" = "$current_branch" ]; then
        echo -e "${RED}错误：不能删除当前所在的分支。请先切换到其他分支。${NC}"
        return 1
    fi
    
    # 检查是否为主分支
    if [ "$branch" = "$MAIN_BRANCH" ]; then
        echo -e "${RED}错误：不能删除主分支。${NC}"
        return 1
    fi
    
    # 检查分支是否已合并
    is_merged=false
    if git branch --merged | grep -q "^..\?$branch$"; then
        is_merged=true
    fi
    
    # 根据是否已合并选择删除方式
    delete_flag="-d"  # 默认安全删除
    if [ "$force" = "force" ] || [ "$force" = "-f" ]; then
        delete_flag="-D"  # 强制删除
        echo -e "${YELLOW}⚠️ 警告：将强制删除分支 '$branch'，即使它包含未合并的更改。${NC}"
    elif [ "$is_merged" = false ]; then
        echo -e "${YELLOW}⚠️ 警告：分支 '$branch' 包含未合并到 '$current_branch' 的更改。${NC}"
        if confirm_action "是否要强制删除此分支？" "N"; then
            delete_flag="-D"  # 强制删除
        else
            echo "已取消分支删除操作。"
            return 1
        fi
    fi
    
    # 执行分支删除
    echo -e "${BLUE}正在删除分支 '$branch'...${NC}"
    git branch $delete_flag "$branch"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功删除分支 '$branch'${NC}"
        
        # 询问是否也删除远程分支
        if git ls-remote --heads "$REMOTE_NAME" "$branch" | grep -q "$branch"; then
            if confirm_action "是否同时删除远程分支 '$REMOTE_NAME/$branch'？" "N"; then
                echo -e "${BLUE}正在删除远程分支...${NC}"
                git push "$REMOTE_NAME" --delete "$branch"
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}成功删除远程分支 '$REMOTE_NAME/$branch'${NC}"
                else
                    echo -e "${RED}删除远程分支失败。${NC}"
                    return 1
                fi
            fi
        fi
        
        return 0
    else
        echo -e "${RED}删除分支失败。${NC}"
        return 1
    fi
}

# 删除本地分支 (新命令 gw rm)
cmd_rm_branch() {
    if ! check_in_git_repo; then return 1; fi

    local target="$1"
    local force=false
    local delete_remote=false # 暂不自动删除远程，保持与 cmd_delete_branch 逻辑一致，需要确认
    
    # 处理参数
    if [ -z "$target" ]; then
        echo -e "${RED}错误: 请指定要删除的分支名称或 'all'。${NC}"
        echo "用法: gw rm <分支名|all> [-f]"
        return 1
    fi
    shift # 移除 target 参数
    
    # 检查剩余参数是否有 -f
    for arg in "$@"; do
        if [ "$arg" = "-f" ] || [ "$arg" = "--force" ]; then
            force=true
            break
        fi
    done

    local current_branch
    current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then return 1; fi

    # --- 处理 gw rm all --- 
    if [ "$target" = "all" ]; then
        if [ "$current_branch" != "$MAIN_BRANCH" ]; then
            echo -e "${RED}错误: 'gw rm all' 只能在主分支 ($MAIN_BRANCH) 上执行以确保安全。${NC}"
            echo "您当前在分支 '$current_branch'。"
            return 1
        fi
        
        echo -e "${YELLOW}⚠️ 警告：即将删除除了 '$MAIN_BRANCH' 之外的所有本地分支！${NC}"
        mapfile -t branches_to_delete < <(git branch --format="%(refname:short)" | grep -v -e "^${MAIN_BRANCH}$" -e "^\* ${MAIN_BRANCH}$")
        
        if [ ${#branches_to_delete[@]} -eq 0 ]; then
            echo "没有其他可删除的本地分支。"
            return 0
        fi
        
        echo "将要删除以下分支:"
        for b in "${branches_to_delete[@]}"; do echo " - $b"; done
        echo ""
        
        local confirm_msg="确认要删除这 ${#branches_to_delete[@]} 个本地分支吗？此操作不可逆！"
        if $force; then
            confirm_msg="强制删除模式 (-f): ${confirm_msg}"
        fi

        if ! confirm_action "$confirm_msg" "N"; then
            echo "已取消批量删除操作。"
            return 1
        fi
        
        local delete_flag="-d"
        if $force; then delete_flag="-D"; fi
        local success_count=0
        local fail_count=0
        
        echo -e "${BLUE}开始批量删除分支...${NC}"
        for branch in "${branches_to_delete[@]}"; do
            echo -n "删除分支 '$branch'... "
            if git branch $delete_flag "$branch"; then
                echo -e "${GREEN}成功${NC}"
                success_count=$((success_count + 1))
            else
                echo -e "${RED}失败${NC}"
                fail_count=$((fail_count + 1))
            fi
        done
        
        echo -e "${GREEN}批量删除完成。成功: $success_count, 失败: $fail_count ${NC}"
        if [ $fail_count -gt 0 ]; then
             echo -e "${YELLOW}提示: 删除失败的分支可能包含未合并的更改 (若未使用 -f) 或其他问题。${NC}"
             return 1 # 返回错误码表示部分失败
        fi
        return 0

    # --- 处理 gw rm <分支名> --- 
    else
        local branch="$target" # target 就是分支名
        
        # 不能删除当前分支
        if [ "$branch" = "$current_branch" ]; then
            echo -e "${RED}错误：不能删除当前所在的分支。请先切换到其他分支。${NC}"
            return 1
        fi
        
        # 不能删除主分支
        if [ "$branch" = "$MAIN_BRANCH" ]; then
            echo -e "${RED}错误：不能删除主分支 ($MAIN_BRANCH)。${NC}"
            return 1
        fi
        
        # 检查分支是否存在
        if ! git rev-parse --verify --quiet "refs/heads/$branch"; then
             echo -e "${RED}错误：本地分支 '$branch' 不存在。${NC}"
             return 1
        fi

        # 检查合并状态 (仅当非强制删除时)
        local delete_flag="-d"
        if $force; then
            delete_flag="-D"
            echo -e "${YELLOW}⚠️ 警告：将强制删除分支 '$branch'，即使它包含未合并的更改。${NC}"
        else
            # 检查是否已合并到当前分支
            # 注意：这里检查的是合并到 *当前* 分支，如果想检查合并到 main，需要切换或修改逻辑
            if ! git branch --merged | grep -q -E "(^|\s)${branch}$"; then
                 echo -e "${YELLOW}⚠️ 警告：分支 '$branch' 包含未合并到当前分支 ('$current_branch') 的更改。${NC}"
                 if confirm_action "是否要强制删除此分支？" "N"; then
                     delete_flag="-D" # 用户确认强制删除
                 else
                     echo "已取消分支删除操作。"
                     return 1
                 fi
            fi
        fi
        
        # 执行删除
        echo -e "${BLUE}正在删除本地分支 '$branch'...${NC}"
        if git branch $delete_flag "$branch"; then
            echo -e "${GREEN}成功删除本地分支 '$branch'${NC}"
            
            # 询问是否删除远程分支 (与 cmd_delete_branch 保持一致)
            if git ls-remote --heads "$REMOTE_NAME" "$branch" | grep -q "$branch"; then
                if confirm_action "是否同时删除远程分支 '$REMOTE_NAME/$branch'？" "N"; then
                    echo -e "${BLUE}正在删除远程分支...${NC}"
                    if git push "$REMOTE_NAME" --delete "$branch"; then
                        echo -e "${GREEN}成功删除远程分支 '$REMOTE_NAME/$branch'${NC}"
                    else
                        echo -e "${RED}删除远程分支失败。${NC}"
                        # 即使远程删除失败，本地删除已成功，返回成功码？还是失败？暂定返回成功
                    fi
                fi
            fi
            return 0
        else
            echo -e "${RED}删除本地分支失败。${NC}"
            return 1
        fi
    fi
}

# 获取状态摘要
cmd_status() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    local fetch_remote=false
    local show_log=false
    # 解析参数
    local remaining_args=()
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -r|--remote)
                fetch_remote=true
                shift
                ;;
            -l|--log)
                show_log=true
                shift
                ;;
            *)
                # 保留无法识别的参数（如果需要传递给 git status 或其他）
                # 但对于 status，通常不需要其他参数
                echo -e "${YELLOW}警告: status 命令忽略未知参数: $1${NC}"
                shift
                ;;
        esac
    done
    
    if $fetch_remote; then
        echo -e "${BLUE}正在从远程仓库 '$REMOTE_NAME' 获取最新状态...${NC}"
        # 只在显式请求时才 fetch
        git fetch --quiet "$REMOTE_NAME"
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}警告: 从远程获取状态失败。可能无法看到最新的远程分支信息。${NC}"
        fi
    fi
    
    local current_branch
    current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    echo -e "${CYAN}=== Git 本地仓库状态 ===${NC}" # 标题强调本地
    echo -e "${BOLD}当前分支:${NC} $current_branch"
    
    # 检查本地是否存在对应的远程跟踪分支信息
    local remote_branch_ref="refs/remotes/$REMOTE_NAME/$current_branch"
    if git show-ref --verify --quiet "$remote_branch_ref"; then
        local ahead_behind
        # 基于本地已有的信息进行比较，不自动 fetch
        ahead_behind=$(git rev-list --left-right --count "$current_branch...$remote_branch_ref" 2>/dev/null)
        if [ $? -eq 0 ]; then
            local ahead=$(echo "$ahead_behind" | awk '{print $1}')
            local behind=$(echo "$ahead_behind" | awk '{print $2}')
            
            local compare_info="与本地跟踪的 $REMOTE_NAME/$current_branch 比较:"
            if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
                compare_info+=" ${YELLOW}领先 $ahead, 落后 $behind${NC}"
            elif [ "$ahead" -gt 0 ]; then
                compare_info+=" ${GREEN}领先 $ahead${NC}"
            elif [ "$behind" -gt 0 ]; then
                compare_info+=" ${RED}落后 $behind${NC}"
            else
                compare_info+=" ${GREEN}已同步${NC}"
            fi
            echo -e "${BOLD}远程跟踪状态:${NC} $compare_info"
            
            if [ "$behind" -gt 0 ]; then
                echo -e "${YELLOW}  提示: 您的分支可能落后于远程，可执行 'gw fetch' 或 'gw pull' 更新。${NC}"
            fi
            if ! $fetch_remote ; then
                 echo -e "${PURPLE}  (此状态基于本地缓存，可能不是最新，使用 'gw status -r' 获取最新)${NC}"
        fi
    else
            echo -e "${BOLD}远程跟踪状态:${NC} ${YELLOW}无法计算与远程分支的差异 (也许刚 fetch 或有其他问题?) ${NC}"
        fi
    else
        # 检查分支是否是新建的且未推送
        if ! git log "$REMOTE_NAME/$current_branch..$current_branch" >/dev/null 2>&1; then 
             echo -e "${BOLD}远程跟踪状态:${NC} ${PURPLE}分支 '$current_branch' 尚未推送到远程 '$REMOTE_NAME' 或本地无跟踪信息${NC}"
        else
            # 如果远程分支不存在但本地有基于它的记录，说明可能远程分支已被删除
            echo -e "${BOLD}远程跟踪状态:${NC} ${YELLOW}远程分支 '$REMOTE_NAME/$current_branch' 可能已被删除或本地未同步${NC}"
        fi
       
    fi
    
    # 使用 'git status -sb' 获取更简洁的状态输出
    echo -e "\n${BOLD}本地变更详情 (git status -sb):${NC}"
    git status -sb
    
    # --- 只有在指定 -l/--log 时才显示日志和标签 ---
    if $show_log; then
        # 显示最近提交
        echo -e "\n${BOLD}最近提交 (-l):${NC}"
        # 使用更详细和彩色的格式
        git log -3 --pretty=format:"%C(yellow)%h%Creset %s %C(bold blue)<%an>%Creset %C(green)(%ar)%Creset%C(auto)%d%Creset"
        echo ""
        
        # 显示最近的标签
        latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$latest_tag" ]; then
            echo -e "${BOLD}最近标签 (-l):${NC} $latest_tag"
        fi
    fi
    
    return 0
}

# 添加修改到暂存区
cmd_add() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    local files=("$@")
    
    # 如果没有指定文件，提供交互式选择
    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${CYAN}=== 选择要添加到暂存区的文件 ===${NC}"
        
        # 获取所有未暂存的和未追踪的文件
        mapfile -t unstaged_files < <(git diff --name-only)
        mapfile -t untracked_files < <(git ls-files --others --exclude-standard)
        
        local all_files=("${unstaged_files[@]}" "${untracked_files[@]}")
        
        if [ ${#all_files[@]} -eq 0 ]; then
            echo "没有可添加的文件。"
            return 0
        fi
        
        # 交互式选择文件
        local selected_files=()
        while IFS= read -r file; do
            selected_files+=("$file")
        done < <(interactive_select_files "选择要添加到暂存区的文件" "${all_files[@]}")
        
        if [ ${#selected_files[@]} -eq 0 ]; then
            echo "未选择任何文件，操作已取消。"
            return 1
        fi
        
        files=("${selected_files[@]}")
    fi
    
    # 添加所选文件到暂存区
    echo -e "${BLUE}正在添加文件到暂存区...${NC}"
    git add -- "${files[@]}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功添加 ${#files[@]} 个文件到暂存区。${NC}"
        return 0
    else
        echo -e "${RED}添加文件失败。${NC}"
        return 1
    fi
}

# 添加所有修改到暂存区
cmd_add_all() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    echo -e "${BLUE}正在添加所有变更到暂存区...${NC}"
    git add -A
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功添加所有变更到暂存区。${NC}"
        return 0
    else
        echo -e "${RED}添加变更失败。${NC}"
        return 1
    fi
}

# 提交变更
cmd_commit() {
    if ! check_in_git_repo; then
        return 1
    fi
    
    local message=""
    local add_all_flag=false
    local commit_args=()
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -m|--message)
                if [ -n "$2" ]; then
                    message="$2"
                    commit_args+=("-m" "$message")
                    shift 2
                else
                    echo -e "${RED}错误: -m/--message 选项需要一个参数。${NC}"
                    return 1
                fi
                ;;
            -a|--all)
                add_all_flag=true
                commit_args+=("-a") # git commit -a 会自动暂存已跟踪文件的修改和删除
    shift
                ;;
            # 你可以在这里添加更多 git commit 支持的参数处理，例如 --amend, -S 等
            *)
                # 如果不是已知选项，则认为是提交消息的一部分（如果 -m 未提供）或无效参数
                if [ -z "$message" ] && [[ ! "$1" =~ ^- ]]; then
                     # 允许多个词作为提交信息，但推荐使用 -m
                     if [ ${#commit_args[@]} -eq 0 ]; then # 确保只添加一次消息
                        message="$*" # 将剩余所有非选项参数作为消息
                        commit_args+=("-m" "$message")
                     fi
                     break # 消息是最后一个参数
                else
                    # 将未识别的参数传递给 git commit
                    # 注意：这可能不安全，需要谨慎使用
                    # commit_args+=("$1")
                    # shift
                    echo -e "${YELLOW}警告: 忽略未知或不支持的参数: $1 ${NC}"
                    shift
                fi
                ;;
        esac
    done
    
    # 如果指定了 -a 标志，则不需要检查暂存区，git commit -a 会处理
    if ! $add_all_flag; then
    # 检查是否有已暂存的变更
        if git diff --cached --quiet; then
        echo -e "${YELLOW}没有已暂存的变更可提交。${NC}"
        
            # 检查是否有未暂存的变更或未追踪文件
            if check_uncommitted_changes || check_untracked_files; then
                echo -e "提示: 有未暂存的变更或未追踪的文件。"
                echo -e "您可以使用 'gw add <文件>' 或 'gw add-all' 来暂存它们，"
                echo -e "或者使用 'gw commit -a' 来暂存已跟踪文件的修改并提交。"
            fi
            return 1
        fi
    else
         # 使用 -a 时，检查是否有任何变更（已跟踪）
         if git diff --quiet && git diff --cached --quiet; then
             echo -e "${YELLOW}没有任何已跟踪的文件发生变更可提交 (-a)。${NC}"
             # 检查是否有未追踪文件，提示用户需要手动 add
             if check_untracked_files; then
                echo -e "提示: 有未追踪的文件，'commit -a' 不会包含它们，请使用 'gw add' 手动添加。"
             fi
             return 1
         fi
    fi
    
    # 执行提交
    echo -e "${BLUE}准备执行提交...${NC}"
    
    # 如果没有通过 -m 提供消息，git commit 会自动打开编辑器
    # 如果提供了 -a，它会被包含在 commit_args 中传递给 git commit
    if git commit "${commit_args[@]}"; then
        echo -e "${GREEN}提交成功！${NC}"
        return 0
    else
        echo -e "${RED}提交失败或被取消。${NC}"
        # 检查是否是因为空提交或没有变更（理论上前面检查过了，但以防万一）
        if git diff --cached --quiet && ! $add_all_flag; then
             echo -e "${YELLOW}原因可能是没有暂存任何变更。${NC}"
        elif $add_all_flag && git diff --quiet && git diff --cached --quiet; then
             echo -e "${YELLOW}原因可能是没有任何已跟踪的文件发生变更。${NC}"
        fi
        return 1
    fi
}

# 合并分支
cmd_merge() {
    if ! check_in_git_repo; then return 1; fi
    
    local source_branch="$1"
    local current_branch
    current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then return 1; fi
    
    if [ -z "$source_branch" ]; then
        echo -e "${RED}错误: 请指定要合并到 '$current_branch' 的来源分支。${NC}"
        echo "用法: gw merge <来源分支> [git merge 的其他参数...]"
        return 1
    fi
    
    # 检查是否有未提交的变更
    if check_uncommitted_changes || check_untracked_files; then
        echo -e "${YELLOW}警告: 检测到未提交的变更或未追踪的文件。${NC}"
        echo "合并前建议先提交或暂存变更。"
        if ! confirm_action "是否仍要继续合并？"; then
            echo "合并操作已取消。"
            return 1
        fi
    fi
    
    echo -e "${BLUE}准备将分支 '$source_branch' 合并到 '$current_branch'...${NC}"
    shift # 移除已处理的 source_branch 参数
    
    # 执行 git merge，并将剩余参数传递过去
    if git merge "$source_branch" "$@"; then
        echo -e "${GREEN}成功将 '$source_branch' 合并到 '$current_branch'。${NC}"
        return 0
    else
        echo -e "${RED}合并 '$source_branch' 时遇到冲突或失败。${NC}"
        echo -e "请解决冲突后手动提交。你可以使用 'git status' 查看冲突文件。"
        echo -e "解决冲突后，运行 'gw add <冲突文件>' 然后 'gw commit'。"
        echo -e "如果想中止合并，可以运行 'git merge --abort'。"
        return 1
    fi
}

# 从远程获取更新 (不合并)
cmd_fetch() {
    if ! check_in_git_repo; then return 1; fi
    
    local remote=${1:-$REMOTE_NAME} # 默认使用 origin
    local fetch_args=()
    
    # 如果指定了远程名，则从参数中移除它
    if [ "$1" = "$remote" ]; then
        shift
    fi
    
    fetch_args=("$remote" "$@") # 包含远程名和所有其他 git fetch 参数
    
    echo -e "${BLUE}正在从远程仓库 '$remote' 获取最新信息...${NC}"
    if git fetch "${fetch_args[@]}"; then
        echo -e "${GREEN}成功从 '$remote' 获取更新。${NC}"
        # 可以考虑在这里显示一些 fetch 的摘要信息
        # git fetch --verbose "${fetch_args[@]}"
        return 0
    else
        echo -e "${RED}从 '$remote' 获取更新失败。${NC}"
        return 1
    fi
}

# 显示差异
cmd_diff() {
    if ! check_in_git_repo; then return 1; fi
    
    # 直接将所有参数传递给 git diff
    # 用户可以自行添加 --cached, 文件路径等
    git diff "$@"
    # git diff 的退出码通常为 0 (无差异) 或 1 (有差异)，我们不视为脚本错误
    return 0 
}

# 显示提交历史
cmd_log() {
    if ! check_in_git_repo; then return 1; fi
    
    # 直接将所有参数传递给 git log
    # 为了更好的分页体验，检测是否在 TTY 环境，如果是，则使用 less
    if [ -t 1 ]; then # 检查 stdout 是否连接到终端
        git log --color=always "$@" | less -R
    else
        git log "$@"
    fi
    # git log 的退出码我们不视为脚本错误
    return 0
}

# 同步当前分支 (拉取主分支最新代码并 rebase)
cmd_sync() {
    if ! check_in_git_repo; then return 1; fi

    local original_branch
    original_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then return 1; fi

    if [ "$original_branch" = "$MAIN_BRANCH" ]; then
        echo -e "${YELLOW}您已在主分支 ($MAIN_BRANCH)。正在尝试拉取最新代码...${NC}"
        if git pull "$REMOTE_NAME" "$MAIN_BRANCH"; then
            echo -e "${GREEN}主分支已更新。${NC}"
            return 0
        else
            echo -e "${RED}拉取主分支更新失败。${NC}"
            return 1
        fi
    fi

    echo -e "${CYAN}=== 同步当前分支 ('$original_branch') ===${NC}"

    # 1. 检查未提交的变更
    local stash_needed=false
    if check_uncommitted_changes || check_untracked_files; then
        echo -e "${YELLOW}检测到未提交的变更或未追踪的文件。${NC}"
        echo "在同步操作前，建议先处理这些变更。"
        echo "1) 暂存 (stash) 变更并在同步后尝试恢复"
        echo "2) 提交变更"
        echo "3) 取消同步"
        echo -n "请选择操作 [1-3]: "
        read -r choice
        
        case "$choice" in
            1)
                echo -e "${BLUE}正在暂存当前变更...${NC}"
                if git stash save "Auto-stash before sync on $original_branch"; then
                    stash_needed=true
                else
                    echo -e "${RED}暂存失败，同步已取消。${NC}"
                    return 1
                fi
                ;;
            2)
                echo -e "${BLUE}请提交您的变更。${NC}"
                cmd_commit # 让用户提交
                if [ $? -ne 0 ]; then
                    echo -e "${RED}提交失败或被取消，同步已取消。${NC}"
                    return 1
                fi
                ;;
            3|*)
                echo "同步操作已取消。"
                return 1
                ;;
        esac
    fi

    # 2. 切换到主分支
    echo -e "${BLUE}切换到主分支 ($MAIN_BRANCH)...${NC}"
    if ! git checkout "$MAIN_BRANCH"; then
        echo -e "${RED}切换到主分支失败。请检查您的工作区状态。${NC}"
        # 如果之前暂存了，尝试恢复
        if $stash_needed; then
            echo -e "${YELLOW}正在尝试恢复之前暂存的变更...${NC}"
            git stash pop
        fi
        return 1
    fi

    # 3. 拉取主分支最新代码
    echo -e "${BLUE}正在从远程 '$REMOTE_NAME' 拉取主分支 ($MAIN_BRANCH) 的最新代码...${NC}"
    if ! git pull "$REMOTE_NAME" "$MAIN_BRANCH"; then
        echo -e "${RED}拉取主分支更新失败。${NC}"
        echo -e "${BLUE}正在切换回原分支 '$original_branch'...${NC}"
        git checkout "$original_branch"
        # 如果之前暂存了，尝试恢复
        if $stash_needed; then
            echo -e "${YELLOW}正在尝试恢复之前暂存的变更...${NC}"
            git stash pop
        fi
        return 1
    fi
    echo -e "${GREEN}主分支已更新。${NC}"

    # 4. 切换回原分支
    echo -e "${BLUE}切换回原分支 '$original_branch'...${NC}"
    if ! git checkout "$original_branch"; then
        echo -e "${RED}切换回原分支 '$original_branch' 失败。${NC}"
        echo -e "${YELLOW}您的代码仍在最新的主分支上。请手动切换。${NC}"
         # 如果之前暂存了，需要提示用户手动恢复
        if $stash_needed; then
            echo -e "${YELLOW}请注意：您之前暂存的变更需要手动恢复 (git stash pop)。${NC}"
        fi
        return 1
    fi

    # 5. Rebase 当前分支到主分支
    echo -e "${BLUE}正在将当前分支 '$original_branch' Rebase 到最新的 '$MAIN_BRANCH'...${NC}"
    if git rebase "$MAIN_BRANCH"; then
        echo -e "${GREEN}成功将 '$original_branch' Rebase 到 '$MAIN_BRANCH'。${NC}"
    else
        echo -e "${RED}Rebase 操作失败或遇到冲突。${NC}"
        echo -e "请解决 Rebase 冲突。"
        echo -e "解决冲突后，运行 'gw add <冲突文件>' 然后 'git rebase --continue'。"
        echo -e "如果想中止 Rebase，可以运行 'git rebase --abort'。"
        # Rebase 失败时，暂存的变更不自动恢复，因为可能与 Rebase 冲突
        if $stash_needed; then
             echo -e "${YELLOW}请注意：您之前暂存的变更在 Rebase 成功后需要手动恢复 (git stash pop)。${NC}"
        fi
        return 1
    fi

    # 6. 如果之前暂存了，尝试恢复
    if $stash_needed; then
        echo -e "${BLUE}正在尝试恢复之前暂存的变更...${NC}"
        if git stash pop; then
            echo -e "${GREEN}成功恢复暂存的变更。${NC}"
        else
            echo -e "${RED}自动恢复暂存失败。可能存在冲突。${NC}"
            echo -e "请运行 'git status' 查看详情，并手动解决冲突。未恢复的暂存在 'git stash list' 中。"
            # 即使 pop 失败，同步的主要流程已完成，返回成功码？或者返回错误码？暂定返回成功
        fi
    fi

    echo -e "${GREEN}=== 分支 '$original_branch' 同步完成 ===${NC}"
    return 0
}

# 快速保存变更 (add + commit)
cmd_save() {
    if ! check_in_git_repo; then return 1; fi

    local message=""
    local files_to_add=() # 存储要添加的文件
    local commit_args=() # 存储最终传递给 git commit 的参数
    local add_all=true # 默认添加所有变更

    # 解析参数，区分 -m 和文件路径
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -m|--message)
                if [ -n "$2" ]; then
                    message="$2"
                    commit_args+=("-m" "$message")
                    shift 2 # 跳过 -m 和消息参数
                else
                    echo -e "${RED}错误: -m/--message 选项需要一个参数。${NC}"
                    echo "用法: gw save [-m \"提交消息\"] [文件...]"
                    return 1
                fi
                ;;
            -*)
                # 不支持其他选项，例如 -a 在 save 中没有意义，因为默认就是 add all
                echo -e "${RED}错误: 'save' 命令不支持选项 '$1'。${NC}"
                echo "用法: gw save [-m \"提交消息\"] [文件...]"
                return 1
                ;;
            *)
                # 如果不是选项，则认为是文件路径
                add_all=false # 一旦指定了文件，就不是 add all 了
                files_to_add+=("$1")
                shift
                ;;
        esac
    done

    echo -e "${BLUE}正在准备保存变更...${NC}"
    
    # 1. 添加变更
    if $add_all; then
        echo -e "${BLUE}正在添加所有变更到暂存区...${NC}"
        git add -A
        if [ $? -ne 0 ]; then
            echo -e "${RED}快速保存失败：添加所有变更时出错。${NC}"
            return 1
        fi
    elif [ ${#files_to_add[@]} -gt 0 ]; then
        echo -e "${BLUE}正在添加指定文件到暂存区: ${files_to_add[*]}${NC}"
        # 使用 -- 确保文件名不会被误解为选项
        git add -- "${files_to_add[@]}"
        if [ $? -ne 0 ]; then
            echo -e "${RED}快速保存失败：添加指定文件时出错。${NC}"
            return 1
        fi
    else
        # 理论上不会到这里，因为没有参数或只有 -m 时 add_all 仍为 true
        echo -e "${YELLOW}没有指定要保存的文件，也没有添加所有变更。${NC}"
        return 1 
    fi
    
    # 2. 检查是否有实际变更被暂存
    if git diff --cached --quiet; then
        if $add_all; then
            echo -e "${YELLOW}没有检测到需要保存的变更。${NC}"
        else
            echo -e "${YELLOW}指定的文件没有变更或未能添加到暂存区。${NC}"
        fi
        return 0 # 返回成功，因为状态是干净的或没有有效暂存
    fi

    # 3. 提交
    echo -e "${BLUE}准备提交暂存的变更...${NC}"
    # 如果没有通过 -m 提供消息，git commit 会自动打开编辑器
    if git commit "${commit_args[@]}"; then
        echo -e "${GREEN}快速保存成功！${NC}"
        return 0
    else
        echo -e "${RED}快速保存失败：提交时出错或被取消。${NC}"
        # 可以尝试撤销刚才的 add 操作吗？比较复杂，暂时不处理
        # echo -e "${YELLOW}提示：刚才添加的文件仍在暂存区。${NC}"
        return 1
    fi
}

# 完成当前分支工作 (准备 PR/MR)
cmd_finish() {
    if ! check_in_git_repo; then return 1; fi

    local no_switch=false
    # 检查是否有 --no-switch 或 -n 参数
    for arg in "$@"; do
        if [ "$arg" = "--no-switch" ] || [ "$arg" = "-n" ]; then
            no_switch=true
            break
        fi
    done
    # 如果有其他不支持的参数，可以给出警告或错误
    if [ $# -gt 0 ] && ! $no_switch; then 
         # 如果只提供了 -n/--no-switch，# 仍然是 1，所以要判断!$no_switch
         if [ $# -eq 1 ] && $no_switch ; then
             # 合法情况：只有一个参数且是 --no-switch 或 -n
             : # do nothing
         else
             echo -e "${YELLOW}警告: 'finish' 命令当前只支持 '-n'/'--no-switch' 参数，忽略其他参数: $@ ${NC}"
         fi
    fi

    local current_branch
    current_branch=$(get_current_branch_name)
    if [ $? -ne 0 ]; then return 1; fi

    if [ "$current_branch" = "$MAIN_BRANCH" ]; then
        echo -e "${YELLOW}警告: 您当前在主分支 ($MAIN_BRANCH)。'finish' 命令通常用于功能分支。${NC}"
        if ! confirm_action "是否仍要继续执行推送主分支的操作？"; then
            echo "操作已取消。"
            return 1
        fi
    fi

    echo -e "${CYAN}=== 完成分支 '$current_branch' 工作流 ===${NC}"

    # 1. 检查未提交/未暂存的变更
    if check_uncommitted_changes || check_untracked_files; then
        echo -e "${YELLOW}检测到未提交的变更或未追踪的文件。${NC}"
        echo "变更详情:"
        git status -s
        echo ""
        echo "在完成前，您需要处理这些变更:"
        echo "1) 提交所有变更"
        echo "2) 暂存变更 (不推荐，推送后 PR 中不包含)"
        echo "3) 取消完成操作"
        echo -n "请选择操作 [1-3]: "
        read -r choice

        case "$choice" in
            1)
                echo -e "${BLUE}请提交您的变更。${NC}"
                # 使用 cmd_commit -a 模式尝试自动添加并提交
                # 或者直接调用 cmd_commit 让用户在编辑器处理
                # 这里选择调用 cmd_commit -a，如果用户需要更精细控制会取消
                if ! cmd_commit -a; then # 尝试添加所有已跟踪文件并提交
                   # 如果 cmd_commit -a 失败 (可能因为用户取消，或没有变更，或只想提交部分)
                   # 再次检查状态，如果仍有未提交变更则提示并退出
                   if check_uncommitted_changes || check_untracked_files; then
                       echo -e "${RED}提交失败或变更未完全处理。请手动提交或暂存后再试。${NC}"
                       return 1
                   fi
                fi
                echo -e "${GREEN}变更已提交。${NC}"
                ;;
            2)
                echo -e "${BLUE}正在暂存变更...${NC}"
                if git stash save "Stashed before finishing branch $current_branch"; then
                    echo -e "${YELLOW}警告: 变更已暂存，不会包含在本次推送和 PR 中。${NC}"
                else
                    echo -e "${RED}暂存失败，操作已取消。${NC}"
            return 1
        fi
                ;;
            3|*)
                echo "完成操作已取消。"
                return 1
                ;;
        esac
    else
        echo -e "${GREEN}未检测到需要提交的变更。${NC}"
    fi

    # 2. 推送当前分支 (使用 do_push_with_retry，它会自动处理 -u)
    echo -e "${BLUE}准备推送当前分支 '$current_branch' 到远程 '$REMOTE_NAME'...${NC}"
    # 调用时不带参数，do_push_with_retry 会自动推当前分支并设置上游
    if ! do_push_with_retry; then
        echo -e "${RED}推送分支失败。请检查错误信息。${NC}"
        return 1
    fi

    echo -e "${GREEN}分支 '$current_branch' 已成功推送到远程。${NC}"
    echo -e "${CYAN}现在您可以前往 GitHub/GitLab 等平台基于 '$current_branch' 创建 Pull Request / Merge Request。${NC}"

    # 3. 询问是否切回主分支 (除非指定了 --no-switch)
    if ! $no_switch && [ "$current_branch" != "$MAIN_BRANCH" ]; then
        if confirm_action "是否要切换回主分支 ($MAIN_BRANCH) 并拉取更新？"; then
            echo -e "${BLUE}正在切换到主分支 '$MAIN_BRANCH'...${NC}"
            if git checkout "$MAIN_BRANCH"; then
                echo -e "${BLUE}正在拉取主分支最新代码...${NC}"
                if git pull "$REMOTE_NAME" "$MAIN_BRANCH"; then
                    echo -e "${GREEN}已成功切换到主分支并更新。${NC}"
                else
                    echo -e "${YELLOW}已切换到主分支，但拉取更新失败。请稍后手动执行 'gw pull'。${NC}"
                fi
            else
                echo -e "${RED}切换到主分支失败。请保持在当前分支 '$current_branch'。${NC}"
            fi
        fi
    fi

    echo -e "${GREEN}=== 分支 '$current_branch' 完成工作流结束 ===${NC}"
    return 0
}

# 显示帮助信息
show_help() {
    echo -e "${BOLD}Git 工作流助手 (gw) 使用说明${NC}"
    echo "用法: gw <命令> [参数...]"
    echo ""
    echo -e "${CYAN}⭐ 核心工作流命令 ⭐${NC}"
    echo "  new <分支名> [基础分支] - 从最新的主分支 (或指定基础分支) 创建并切换，开始新任务"
    echo "  save [-m \"消息\"] [文件...] - 快速保存变更: 添加指定文件 (默认全部) 并提交开发进展"
    echo "  finish [-n|--no-switch] - 完成当前分支开发: 检查/提交, 推送, 准备 PR/MR (-n 不切主分支)"
    echo "  main | master [...]     - 推送主分支 ($MAIN_BRANCH) 到远程 (用于主分支维护, 可加 -f 等)"
    echo "  sync                    - 同步开发分支: 拉取主分支最新代码并 rebase 当前分支"
    echo ""
    echo -e "${CYAN}常用 Git 操作:${NC}"
    echo "  status [-r] [-l]        - 显示工作区状态 (默认纯本地; -r 获取远程; -l 显示日志)"
    echo "  add [文件...]           - 添加文件到暂存区 (无参数则交互式选择)"
    echo "  add-all                 - 添加所有变更到暂存区 (git add -A)"
    echo "  commit [-m \"消息\"] [-a] - 提交暂存或指定变更 (无 -m 打开编辑器, -a 添加已跟踪文件)"
    echo "  pull [远程] [分支] [...] - 拉取并合并远程更新 (git pull)"
    echo "  fetch [远程] [...]      - 从远程获取最新信息，但不合并 (git fetch)"
    echo ""
    echo -e "${CYAN}其他分支操作:${NC}"
    echo "  branch                  - 列出本地分支 (同 git branch)"
    echo "  branch -a               - 列出所有分支 (本地和远程跟踪)"
    echo "  checkout <分支名>       - 切换到已存在的分支 (会处理未提交变更)"
    echo "  merge <来源分支> [...]  - 合并指定分支到当前分支 (可加 git merge 参数)"
    echo "  rm <分支名> [-f]        - 删除指定本地分支 (可选删远程, -f 强制)"
    echo "  rm all [-f]             - (仅限主分支)删除除主分支外所有本地分支 (-f 强制)"
    echo "  clean <分支名>          - 清理已合并分支: 切主分支->更新->删除本地/远程"
    echo ""
    echo -e "${CYAN}历史与差异:${NC}"
    echo "  log [...]               - 显示提交历史 (支持 git log 参数, 带分页)"
    echo "  diff [...]              - 显示变更差异 (支持 git diff 参数, 如 --cached)"
    echo "  reset                 - ${RED}危险:${NC} 丢弃所有本地未提交的变更 (工作区和暂存区)"
    echo "                            (相当于 git reset --hard HEAD, 需要强确认)"
    echo "  reset <目标>          - ${RED}危险:${NC} 将当前分支强制重置到指定 <目标>"
    echo "                            (<目标> 可以是提交ID, 分支名, 标签等)"
    echo "                            (丢失目标之后的所有本地提交, 需要强确认)"
    echo ""
    echo -e "${CYAN}兼容旧版 (gp) 命令:${NC}"
    echo "  1 | first <分支名> [...] - 首次推送指定分支 (带 -u)"
    echo "  2 [...]                 - 推送主分支 ($MAIN_BRANCH) (同 gw main)"
    echo "  3 | other <分支名> [...] - 推送已存在的指定分支 (不带 -u)"
    echo "  4 | current [...]       - 推送当前所在分支 (自动处理 -u)"
    echo ""
    echo -e "${CYAN}其他:${NC}"
    echo "  help, --help, -h        - 显示此帮助信息"
    echo ""
    echo -e "${YELLOW}环境变量:${NC}"
    echo "  MAIN_BRANCH (默认: $MAIN_BRANCH) - 可通过环境变量覆盖主分支名"
    echo "  REMOTE_NAME (默认: $REMOTE_NAME) - 可通过环境变量覆盖默认远程名"
    echo "  MAX_ATTEMPTS (默认: $MAX_ATTEMPTS), DELAY_SECONDS (默认: $DELAY_SECONDS) - 控制推送重试"
    echo ""
    echo -e "${YELLOW}提示:${NC} 大部分命令在 Git 命令基础上增加了交互提示和工作流优化。"
    echo -e "对于 push/pull/log/diff/branch/merge 等命令, 你仍然可以使用它们原生支持的 Git 参数。"
}

# 主函数
main() {
    if ! check_in_git_repo; then
        # 允许 help 命令在非 git 仓库目录执行
        if [[ "$1" != "help" && "$1" != "--help" && "$1" != "-h" ]]; then
           return 1
        fi
    fi

    local command="$1"
    # 如果没有命令，显示帮助
    if [ -z "$command" ]; then
        show_help
        return 0
    fi
    shift # 移除命令参数，剩下的是命令的参数
    
    case "$command" in
        status)
            cmd_status "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        add)
            # cmd_add 内部处理无参数时的交互
            cmd_add "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        add-all)
            cmd_add_all
            LAST_COMMAND_STATUS=$?
            ;;
        commit)
            cmd_commit "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        save)
            cmd_save "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        push)
            # do_push_with_retry 处理提交检查和参数解析
            do_push_with_retry "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        pull)
            # 直接调用 git pull，可以增加交互或检查
            echo -e "${BLUE}正在执行 git pull $* ...${NC}"
            git pull "$@"
            LAST_COMMAND_STATUS=$?
            if [ $LAST_COMMAND_STATUS -ne 0 ]; then
                echo -e "${RED}git pull 失败。请检查错误信息。${NC}"
            fi
            ;;
        fetch)
            cmd_fetch "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        sync)
             # cmd_sync 不接受额外参数
             if [ $# -gt 0 ]; then
                echo -e "${RED}错误: 'sync' 命令不接受参数。${NC}"
                LAST_COMMAND_STATUS=1
             else
                cmd_sync
                LAST_COMMAND_STATUS=$?
             fi
             ;;
        # --- 分支相关命令 ---    
        branch)
            # 根据参数决定调用哪个分支函数或 git branch
            case "$1" in
                 # 如果没有子命令或选项，则列出分支
                 ""|-a|-r|--list|--show-current) 
                    # 调用 cmd_branches 获取增强的列表，或者直接用 git branch
                    # cmd_branches # 使用我们自定义的彩色列表
                    git branch "$@" # 或者使用原生 git branch
                    ;;
                 # 处理删除分支的 -d 和 -D 选项 (仍然保留对原生 git branch -d/-D 的支持)
                 -d|-D)
                     local branch_to_delete="$2"
                     if [ -z "$branch_to_delete" ]; then
                        echo -e "${RED}错误: 请提供要删除的分支名称。${NC}"
                        LAST_COMMAND_STATUS=1
                     else
                        # 使用原生 git branch 删除
                        echo -e "${BLUE}正在使用 'git branch $@' 删除分支...${NC}"
                        git branch "$@"
                        LAST_COMMAND_STATUS=$?
                     fi
                     ;;
                 *)
                     # 默认行为：创建新分支 (调用 cmd_new_branch)
                     if [[ "$1" =~ ^- ]]; then
                        echo -e "${RED}未知的分支选项或命令: $1${NC}"
                        echo "请使用 'gw help' 查看可用选项。"
                        LAST_COMMAND_STATUS=1
                     else
                        cmd_new_branch "$@"
                        LAST_COMMAND_STATUS=$?
                     fi
                     ;;
            esac
            # LAST_COMMAND_STATUS=$? # 退出码在 case 内部设置
            ;;
        rm) # 新增的删除命令
            cmd_rm_branch "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        checkout|switch|co)
            # 支持 checkout, switch, co 作为切换分支的别名
            cmd_checkout "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        merge)
            cmd_merge "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        # --- 历史与差异 ---    
        diff)
            cmd_diff "$@"
            LAST_COMMAND_STATUS=$? # diff 返回 1 表示有差异，不一定是错误
            ;;
        log)
            cmd_log "$@"
            LAST_COMMAND_STATUS=$? # log 通常返回 0
            ;;
        # --- 工作流命令 --- 
        new)
            # cmd_new_branch 已经存在，用于创建分支
            cmd_new_branch "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        finish)
             # cmd_finish 不接受额外参数
             if [ $# -gt 0 ]; then
                echo -e "${RED}错误: 'finish' 命令不接受参数。${NC}"
                LAST_COMMAND_STATUS=1
             else
                cmd_finish
                LAST_COMMAND_STATUS=$?
             fi
             ;;
        main|master)
            # 明确推送主分支
            echo -e "${BLUE}准备推送主分支 ($MAIN_BRANCH)...${NC}"
            # 将所有剩余参数传递给 push，允许例如 gw main -f
            do_push_with_retry "$REMOTE_NAME" "$MAIN_BRANCH" "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        # --- 兼容旧版 gp 命令 (数字模式) --- 
        1|first)
            local branch_arg="$1"
            if [ -z "$branch_arg" ]; then
                echo -e "${RED}错误: 命令 '1' 或 'first' 需要指定分支名称。${NC}"
                echo "用法: gw 1 <分支名> [...]"
                LAST_COMMAND_STATUS=1
            else
                echo -e "${BLUE}执行首次推送 (模式 1) 分支 '$branch_arg' (带 -u)...${NC}"
                shift # 移除分支名参数
                # 显式添加 -u，并将剩余参数传递
                do_push_with_retry "-u" "$REMOTE_NAME" "$branch_arg" "$@"
                LAST_COMMAND_STATUS=$?
            fi
            ;;
        2)
            echo -e "${BLUE}执行推送主分支 (模式 2)...${NC}"
            # 将所有剩余参数传递给 push，允许例如 gw 2 -f
            do_push_with_retry "$REMOTE_NAME" "$MAIN_BRANCH" "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        3|other)
            local branch_arg="$1"
            if [ -z "$branch_arg" ]; then
                echo -e "${RED}错误: 命令 '3' 或 'other' 需要指定分支名称。${NC}"
                echo "用法: gw 3 <分支名> [...]"
                LAST_COMMAND_STATUS=1
            else
                echo -e "${BLUE}执行推送指定分支 (模式 3) '$branch_arg'...${NC}"
                shift # 移除分支名参数
                # 不带 -u，并将剩余参数传递
                do_push_with_retry "$REMOTE_NAME" "$branch_arg" "$@"
                LAST_COMMAND_STATUS=$?
            fi
            ;;
        4|current)
            echo -e "${BLUE}执行推送当前分支 (模式 4)...${NC}"
            local current_branch
            current_branch=$(get_current_branch_name)
            if [ $? -ne 0 ]; then 
                LAST_COMMAND_STATUS=1
            else
                # 推送当前分支，do_push_with_retry 会处理首次推送的 -u
                # 将所有剩余参数传递给 push，允许例如 gw 4 -f
                do_push_with_retry "$REMOTE_NAME" "$current_branch" "$@"
                LAST_COMMAND_STATUS=$?
            fi
            ;;
        # --- 帮助 ---    
        help|--help|-h)
            show_help
            LAST_COMMAND_STATUS=0
            ;;
        # --- 未知命令 ---    
        *)
            echo -e "${RED}未知命令: $command${NC}"
            show_help
            LAST_COMMAND_STATUS=1
            ;;
        # --- 重置命令 --- 
        reset)
            cmd_reset "$@"
            LAST_COMMAND_STATUS=$?
            ;;
        # --- 清理命令 ---
        clean)
            cmd_clean_branch "$@"
            LAST_COMMAND_STATUS=$?
            ;;
    esac

    # 脚本最终退出码为最后执行命令的退出码
    exit $LAST_COMMAND_STATUS
}

# --- 脚本入口 ---

# 设置脚本在出错时退出 (可选，但推荐)
# set -e

# 执行主函数，并将所有参数传递给它
main "$@"