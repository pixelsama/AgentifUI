"use client"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarHeader } from "./sidebar-header"
import { SidebarContent } from "./sidebar-content"
import { SidebarFooter } from "./sidebar-footer"
import { useTheme } from "@lib/hooks/use-theme"
import { cn } from "@lib/utils"

export function SidebarContainer() {
  const { isExpanded, setHovering } = useSidebarStore()
  const { isDark } = useTheme()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col",
        // 背景和阴影效果
        isDark 
          ? "bg-background/95 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          : "bg-background shadow-lg shadow-primary/5",
        // 过渡动画
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        isExpanded ? "w-64" : "w-16",
        // 响应式布局
        "z-20 fixed md:relative",
        // 渐变背景
        isDark
          ? "bg-gradient-to-b from-background via-background/98 to-background/95"
          : "bg-gradient-to-b from-background to-background/95",
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter />
      </div>
    </aside>
  )
} 