import { useEffect } from "react"
import { useChatLayoutStore } from "@lib/stores/chat-layout-store"

/**
 * 聊天输入框高度重置钩子
 * 
 * 处理聊天输入框在不同场景（欢迎页/聊天页）下的高度重置
 * 
 * @param isWelcomeScreen 是否处于欢迎屏幕
 */
export function useInputHeightReset(isWelcomeScreen: boolean) {
  const { resetInputHeight } = useChatLayoutStore()
  
  // 屏幕状态变化时重置高度
  useEffect(() => {
    resetInputHeight()
  }, [isWelcomeScreen, resetInputHeight])
  
  // 组件卸载时重置高度
  useEffect(() => {
    return () => {
      resetInputHeight()
    }
  }, [resetInputHeight])
} 