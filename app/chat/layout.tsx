"use client"

import { Sidebar } from "@components/sidebar"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useThemeStore } from "@lib/stores/theme-store"
import { useEffect } from "react"
import { useMobile } from "@lib/hooks"

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { isExpanded } = useSidebarStore()
  const { theme } = useThemeStore()
  const isMobile = useMobile()
  
  // 在客户端应用主题
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏使用fixed定位，确保不随内容滚动 */}
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* 主内容区域，根据侧边栏状态调整margin */}
      <main
        className={cn(
          "flex-1 overflow-auto h-screen",
          isExpanded ? "md:ml-64" : "md:ml-16",
          // 移动设备上的边距
          isMobile ? "ml-16" : "",
          // 过渡效果
          "transition-all duration-300 ease-in-out"
        )}
      >
        <div className="h-full p-0">{children}</div>
      </main>
    </div>
  )
} 