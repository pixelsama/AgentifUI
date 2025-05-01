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
        "flex h-screen flex-col border-r border-transparent",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        isExpanded ? "w-64" : "w-16",
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