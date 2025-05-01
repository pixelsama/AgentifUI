"use client"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarHeader } from "./sidebar-header"
import { SidebarContent } from "./sidebar-content"
import { SidebarFooter } from "./sidebar-footer"
import { cn } from "@lib/utils"

export function SidebarContainer() {
  const { isExpanded, setHovering } = useSidebarStore()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-background",
        "shadow-lg shadow-primary/5",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        isExpanded ? "w-64" : "w-16",
        // 响应式布局
        "z-20 fixed md:relative",
        // 添加微妙渐变背景
        "bg-gradient-to-b from-background to-background/95",
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