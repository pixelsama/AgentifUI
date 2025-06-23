import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useChatInputStore } from '@lib/stores/chat-input-store'

// --- BEGIN COMMENT ---
// 路由同步Hook
// 自动将当前路由同步到ChatInputStore，确保输入框内容按路由隔离
// --- END COMMENT ---
export function useChatInputRouteSync() {
  const pathname = usePathname()
  const setCurrentRoute = useChatInputStore(state => state.setCurrentRoute)
  
  useEffect(() => {
    // 当路由变化时，更新store中的当前路由
    setCurrentRoute(pathname)
  }, [pathname, setCurrentRoute])
} 