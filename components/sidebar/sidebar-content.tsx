"use client"

import * as React from "react"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useTheme } from "@lib/hooks/use-theme"
import { cn } from "@lib/utils"
import { SidebarChatList } from "./sidebar-chat-list"
import { SidebarAppList } from "./sidebar-app-list"

/**
 * 侧边栏内容组件
 * 
 * 管理侧边栏主要内容区域，包括聊天列表和应用列表
 * 提供选中状态管理，并负责将状态传递给子组件
 */
export function SidebarContent() {
  const { 
    isExpanded, 
    selectedType, 
    selectedId, 
    selectItem 
  } = useSidebarStore()
  const { isDark } = useTheme()
  const [contentVisible, setContentVisible] = React.useState(false)

  // 处理侧边栏展开/收起的内容显示动画
  React.useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setContentVisible(true)
      }, 50) // Delay for entrance animation trigger
      return () => clearTimeout(timer)
    } else {
      setContentVisible(false) // Reset immediately on collapse
    }
  }, [isExpanded])

  /**
   * 选择聊天项目的回调函数
   * @param chatId 聊天项目的ID
   */
  const handleSelectChat = React.useCallback((chatId: number | string) => {
    selectItem('chat', chatId)
    // 这里可以添加额外的处理逻辑，如导航、记录历史等
  }, [selectItem])

  /**
   * 选择应用项目的回调函数
   * @param appId 应用项目的ID
   */
  const handleSelectApp = React.useCallback((appId: number | string) => {
    selectItem('app', appId)
    // 这里可以添加额外的处理逻辑，如打开应用等
  }, [selectItem])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Top Divider - Animates opacity based on contentVisible, add invisible for robust hiding */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px z-10",
        "transition-opacity duration-150 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        contentVisible ? "opacity-100" : "opacity-0 invisible"
      )} />
      
      {/* Scrollable Content Area */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-4 pt-4",
          "scrollbar-thin scrollbar-track-transparent",
          isDark ? "scrollbar-thumb-gray-600" : "scrollbar-thumb-accent",
          // Apply transition only when expanding to animate IN
          isExpanded && "transition-[opacity,transform] duration-300 ease-in-out", 
          // Control visibility and animation state
          isExpanded 
            ? (contentVisible 
                ? "opacity-100 transform-none"          // Final state for entrance animation
                : "opacity-0 scale-95 -translate-x-4 pointer-events-none" // Initial state for entrance animation
              ) 
            : "hidden" // Instantly hide when collapsed
        )}
      >
        {/* Chat List Section */}
        <SidebarChatList 
          isDark={isDark} 
          contentVisible={contentVisible}
          selectedId={selectedType === 'chat' ? selectedId : null}
          onSelectChat={handleSelectChat}
        />

        {/* Divider between sections (visible in light mode) - Hide instantly with content */}
        {!isDark && isExpanded && (
          <div className="h-px mx-4 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        )}

        {/* App List Section */}
        <SidebarAppList 
          isDark={isDark} 
          contentVisible={contentVisible}
          selectedId={selectedType === 'app' ? selectedId : null}
          onSelectApp={handleSelectApp}
        />
      </div>

      {/* Bottom Divider - Animates opacity based on contentVisible, add invisible for robust hiding */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px z-10",
        "transition-opacity duration-150 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        contentVisible ? "opacity-100" : "opacity-0 invisible"
      )} />
    </div>
  )
} 