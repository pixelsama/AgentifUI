"use client"

import * as React from "react"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useTheme } from "@lib/hooks/use-theme"
import { cn } from "@lib/utils"
import { SidebarChatList } from "./sidebar-chat-list"
import { SidebarAppList } from "./sidebar-app-list"

export function SidebarContent() {
  const { isExpanded } = useSidebarStore()
  const { isDark } = useTheme()
  const [contentVisible, setContentVisible] = React.useState(false)

  React.useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setContentVisible(true)
      }, 50) // Slightly delay content visibility for smoother transition
      return () => clearTimeout(timer)
    } else {
      setContentVisible(false)
    }
  }, [isExpanded])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Top Divider */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px z-10",
        "transition-all duration-150 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        contentVisible ? "opacity-100 transform-none" : "opacity-0 scale-90"
      )} />
      
      {/* Scrollable Content Area */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-4 pt-4",
          "scrollbar-thin scrollbar-track-transparent",
          isDark 
            ? "scrollbar-thumb-gray-600" 
            : "scrollbar-thumb-accent",
          "transition-all duration-300 ease-in-out",
          contentVisible
            ? "opacity-100 transform-none" 
            : "opacity-0 scale-95 -translate-x-4 pointer-events-none"
        )}
      >
        {/* Chat List Section */}
        <SidebarChatList isDark={isDark} contentVisible={contentVisible} />

        {/* Divider between sections (visible in light mode) */}
        {!isDark && (
          <div className="h-px mx-4 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        )}

        {/* App List Section */}
        <SidebarAppList isDark={isDark} contentVisible={contentVisible} />
      </div>

      {/* Bottom Divider */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px z-10",
        "transition-all duration-150 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        contentVisible ? "opacity-100 transform-none" : "opacity-0 scale-90"
      )} />

      {/* Overlay when collapsed (optional, for visual effect) */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-0 translate-x-2 pointer-events-none" : "opacity-100 transform-none",
          // Add background or styles if needed for collapsed state visual
        )}
      />
    </div>
  )
} 