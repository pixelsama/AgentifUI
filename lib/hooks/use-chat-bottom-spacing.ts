import { useMemo } from "react"
import { useChatLayoutStore, INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"

// 输入框底部外边距常量 (1.5rem = 24px)
const INPUT_BOTTOM_MARGIN = 24
// 额外安全间距 (增加约1厘米 = 38px)
const SAFETY_MARGIN = 92
// 底部容器高度 (px-4 pt-4 pb-1 = 36px)
const CONTAINER_PADDING = 36

/**
 * 提供聊天消息底部间距的钩子
 * 根据当前输入框高度动态计算底部间距
 * 确保消息与输入框之间保持一致的视觉间距
 */
export function useChatBottomSpacing() {
  const { inputHeight } = useChatLayoutStore()
  
  // 计算底部间距，基础间距 + 额外输入框高度
  const bottomSpacing = useMemo(() => {
    // 基础间距 = 输入框初始高度 + 输入框底部外边距 + 容器内边距 + 额外安全间距
    const BASE_SPACING = INITIAL_INPUT_HEIGHT + INPUT_BOTTOM_MARGIN + CONTAINER_PADDING + SAFETY_MARGIN
    
    // 额外高度 = 当前高度 - 初始高度 (输入框扩展产生的额外高度)
    const extraHeight = Math.max(0, inputHeight - INITIAL_INPUT_HEIGHT)
    
    // 总间距 = 基础间距 + 额外高度
    return BASE_SPACING + extraHeight
  }, [inputHeight])
  
  return {
    bottomSpacing,
    // 由于Tailwind的JIT编译限制，我们需要以这种方式创建动态类名
    paddingBottomStyle: { paddingBottom: `${bottomSpacing}px` }
  }
} 