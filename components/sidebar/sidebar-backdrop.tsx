"use client"

import { useSidebarStore } from "@lib/stores/sidebar-store"
import { cn } from "@lib/utils"

export function SidebarBackdrop() {
  const { isExpanded, isMobileNavVisible, hideMobileNav } = useSidebarStore()

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/70 backdrop-blur-md z-10",
        "transition-all duration-300 ease-in-out",
        "md:hidden", // 仅在移动设备上显示
        isExpanded 
          ? "opacity-100 pointer-events-auto" 
          : "opacity-0 pointer-events-none",
      )}
      onClick={() => hideMobileNav()}
      aria-hidden="true"
    />
  )
} 