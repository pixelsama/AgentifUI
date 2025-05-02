"use client"

import * as React from "react"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useTheme } from "@lib/hooks/use-theme"
import { useMobile } from "@lib/hooks"
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
    selectItem,
    lockExpanded
  } = useSidebarStore()
  const { isDark } = useTheme()
  const isMobile = useMobile()
  const [contentVisible, setContentVisible] = React.useState(false)

  // 处理侧边栏展开/收起的内容显示动画
  React.useEffect(() => {
    if (isExpanded) {
      // 在移动端上直接显示，不使用延迟
      if (isMobile) {
        setContentVisible(true)
      } else {
        const timer = setTimeout(() => {
          setContentVisible(true)
        }, 50) // 桌面端保留延迟动画
        return () => clearTimeout(timer)
      }
    } else {
      setContentVisible(false) // Reset immediately on collapse
    }
  }, [isExpanded, isMobile])

  /**
   * 选择聊天项目的回调函数
   * @param chatId 聊天项目的ID
   */
  const handleSelectChat = React.useCallback((chatId: number | string) => {
    selectItem('chat', chatId)
    lockExpanded() // 确保在选择聊天时保持侧边栏展开状态
  }, [selectItem, lockExpanded])

  /**
   * 选择应用项目的回调函数
   * @param appId 应用项目的ID
   */
  const handleSelectApp = React.useCallback((appId: number | string) => {
    selectItem('app', appId)
    lockExpanded() // 确保在选择应用时保持侧边栏展开状态
  }, [selectItem, lockExpanded])

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
          // 在移动端上不应用动画效果，直接显示
          !isMobile && isExpanded && "transition-[opacity,transform] duration-300 ease-in-out", 
          // 控制可见性和动画状态
          isExpanded 
            ? (contentVisible 
                // 移动端上不应用动画，直接显示
                ? "opacity-100 transform-none"
                // 桌面端上保留动画效果
                : (!isMobile 
                    ? "opacity-0 scale-95 -translate-x-4 pointer-events-none" 
                    : "opacity-100 transform-none")
              ) 
            : "hidden" // 折叠时直接隐藏
        )}
      >
        {/* Chat List Section */}
        <SidebarChatList 
          isDark={isDark} 
          contentVisible={isMobile ? true : contentVisible}
          selectedId={selectedType === 'chat' ? selectedId : null}
          onSelectChat={handleSelectChat}
        />

        {/* Divider between sections */}
        {isExpanded && (
          <div className={cn(
            "h-px mx-4",
            "bg-gradient-to-r from-transparent via-accent/30 to-transparent",
            contentVisible || isMobile ? "opacity-100" : "opacity-0"
          )} />
        )}

        {/* App List Section */}
        <SidebarAppList 
          isDark={isDark} 
          contentVisible={isMobile ? true : contentVisible}
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