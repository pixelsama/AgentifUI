"use client"

import { MobileNavButton } from "@components/mobile"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useMobile } from "@lib/hooks"
import { useTheme } from "@lib/hooks/use-theme"

interface AppsLayoutProps {
  children: React.ReactNode
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  const { isExpanded, isMounted } = useSidebarStore()
  const isMobile = useMobile()
  const { isDark } = useTheme()
  
  // --- BEGIN COMMENT ---
  // 🎯 移除重复的 setMounted 调用，现在由全局 ClientLayout 统一管理
  // --- END COMMENT ---

  // --- BEGIN COMMENT ---
  // 计算主内容区域的左边距
  // 根据sidebar展开状态设置边距，推动主内容
  // --- END COMMENT ---
  const getMainMarginLeft = () => {
    if (isMobile) return "ml-0"
    return isExpanded ? "ml-64" : "ml-16"
  }

  return (
    <div className={cn(
      "flex min-h-screen h-full",
      isDark ? "bg-stone-800" : "bg-stone-100"
    )}>
      {/* 🎯 Sidebar 已移至根布局，无需重复渲染 */}
      
      {/* 
        移动端导航按钮 - 仅在客户端挂载后显示 
      */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        {isMounted && <MobileNavButton />}
      </div>
      
      {/* 主内容区域 - 应用市场页面 */}
      <main
        className={cn(
          "w-full h-screen overflow-auto", // 使用 w-full 而不是 flex-1
          getMainMarginLeft(),
          // 过渡效果
          "transition-[margin-left] duration-150 ease-in-out"
        )}
      >
        <div className="h-full p-0">{children}</div>
      </main>
    </div>
  )
} 