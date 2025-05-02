"use client"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarHeader } from "./sidebar-header"
import { SidebarContent } from "./sidebar-content"
import { SidebarFooter } from "./sidebar-footer"
import { useTheme } from "@lib/hooks/use-theme"
import { useMobile } from "@lib/hooks"
import { cn } from "@lib/utils"
import { useEffect, useState } from "react"

export function SidebarContainer() {
  const { isExpanded, setHovering, isMounted } = useSidebarStore()
  const { isDark } = useTheme()
  const isMobile = useMobile()

  // 在移动端上禁用悬停事件
  const handleMouseEnter = () => {
    if (!isMobile) {
      setHovering(true)
    }
  }
  
  const handleMouseLeave = () => {
    if (!isMobile) {
      setHovering(false)
    }
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-transparent",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        
        // 使用媒体查询控制初始宽度:
        // 桌面设备(md及以上)：直接应用宽度
        isExpanded ? "md:w-64" : "md:w-16",
        
        // 移动设备(md以下)：
        // - 初始宽度为0，避免闪烁
        // - 仅当挂载完成且展开时才显示
        "w-0",
        isMobile && isMounted && isExpanded ? "w-64" : "w-0",
        
        "z-20 fixed md:relative",
        
        // 亮色模式下的样式
        !isDark && [
          "bg-white/95",
          "shadow-lg shadow-primary/5",
          "bg-gradient-to-b from-background to-background/95",
          "border-r-gray-100/30",
        ],
        
        // 暗色模式下的样式
        isDark && [
          "bg-gray-900/90",
          "shadow-[0_0_20px_rgba(0,0,0,0.4)]",
          "bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900/90",
          "border-r-gray-800/50",
          "text-gray-200",
        ],
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter />
      </div>
    </aside>
  )
} 