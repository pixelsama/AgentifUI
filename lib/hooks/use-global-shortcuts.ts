"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlatformKeys } from './use-platform-keys'
import { useChatStore } from '@lib/stores/chat-store'
import { useChatInputStore } from '@lib/stores/chat-input-store'
import { useChatTransitionStore } from '@lib/stores/chat-transition-store'
import { useChatInterface } from './use-chat-interface'
import { useSidebarStore } from '@lib/stores/sidebar-store'

/**
 * 全局快捷键Hook
 * 
 * 支持的快捷键：
 * - Cmd/Ctrl + K: 新对话
 * - Cmd/Ctrl + Shift + A: 打开应用市场
 * - Cmd/Ctrl + \: 切换侧栏
 * 
 * @param options 配置选项
 */
export function useGlobalShortcuts(options: {
  /** 是否启用快捷键 */
  enabled?: boolean
  /** 是否在输入框聚焦时禁用 */
  disableWhenInputFocused?: boolean
} = {}) {
  const { 
    enabled = true, 
    disableWhenInputFocused = true 
  } = options
  
  const router = useRouter()
  const platformKeys = usePlatformKeys()
  const { clearConversationState } = useChatInterface()
  
  useEffect(() => {
    if (!enabled) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      if (disableWhenInputFocused) {
        const target = event.target as HTMLElement
        const isInputElement = target.tagName === 'INPUT' || 
                              target.tagName === 'TEXTAREA' || 
                              target.isContentEditable ||
                              target.closest('[contenteditable="true"]')
        
        if (isInputElement) return
      }
      
      // 检查修饰键
      const isModifierPressed = platformKeys.isMac ? event.metaKey : event.ctrlKey
      
      if (!isModifierPressed) return
      
      // Cmd/Ctrl + K: 新对话
      if (event.key.toLowerCase() === 'k' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        handleNewChat()
        return
      }
      
      // Cmd/Ctrl + Shift + A: 应用市场
      if (event.key.toLowerCase() === 'a' && event.shiftKey && !event.altKey) {
        event.preventDefault()
        router.push('/apps')
        return
      }
      
      // Cmd/Ctrl + \: 切换侧栏
      if (event.key === '\\' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        const { toggleSidebar } = useSidebarStore.getState()
        toggleSidebar()
        return
      }
    }
    
    // 新对话处理函数
    const handleNewChat = () => {
      const isAlreadyOnNewChat = window.location.pathname === '/chat/new'
      if (isAlreadyOnNewChat) {
        return
      }
      
      console.log('[GlobalShortcuts] Cmd+K: 开始新对话')
      
      // 立即路由到新对话页面
      router.push('/chat/new')
      
      // 延迟清理状态，确保路由完成
      setTimeout(() => {
        // 清理chatStore状态
        const { clearMessages, setCurrentConversationId } = useChatStore.getState()
        const { setIsWelcomeScreen } = useChatInputStore.getState()
        const { setIsTransitioningToWelcome } = useChatTransitionStore.getState()
        const { selectItem } = useSidebarStore.getState()
        
        clearMessages()
        setCurrentConversationId(null)
        
        // 清理use-chat-interface中的对话状态
        clearConversationState()
        
        // 清理其他UI状态
        setIsWelcomeScreen(true)
        setIsTransitioningToWelcome(true)
        useChatStore.getState().setIsWaitingForResponse(false)
        
        selectItem('chat', null, true)
        
        console.log('[GlobalShortcuts] 状态清理完成')
      }, 100)
    }
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown)
    
    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, disableWhenInputFocused, router, platformKeys.isMac, clearConversationState])
}

/**
 * 简化版快捷键Hook，只监听新对话
 */
export function useNewChatShortcut(enabled: boolean = true) {
  return useGlobalShortcuts({
    enabled,
    disableWhenInputFocused: true
  })
} 