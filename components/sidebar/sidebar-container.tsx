"use client"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarHeader } from "./sidebar-header"
import { SidebarContent } from "./sidebar-content"
import { SidebarFooter } from "./sidebar-footer"
import { useThemeColors } from "@lib/hooks/use-theme-colors"
import { useMobile } from "@lib/hooks"
import { cn } from "@lib/utils"
import { useEffect, useState } from "react"

export function SidebarContainer() {
  const { isExpanded, toggleSidebar, isMounted, getSidebarWidth, isAnimating } = useSidebarStore()
  const { colors, isDark } = useThemeColors()
  const isMobile = useMobile()

  // --- BEGIN COMMENT ---
  // 悬停状态管理 - 仅用于背景效果，不触发展开
  // --- END COMMENT ---
  const [isHovering, setIsHovering] = useState(false)

  // --- BEGIN COMMENT ---
  // 在移动端上禁用悬停事件，并确保cursor状态正确重置
  // --- END COMMENT ---
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true)
      // 确保移除任何可能残留的focus状态
      const activeElement = document.activeElement as HTMLElement
      activeElement?.blur?.()
    }
  }
  
  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false)
      // 确保移除任何可能残留的focus状态
      const activeElement = document.activeElement as HTMLElement
      activeElement?.blur?.()
    }
  }

  // --- BEGIN COMMENT ---
  // 点击sidebar区域展开/收起
  // 需要排除按钮区域的点击事件
  // --- END COMMENT ---
  const handleSidebarClick = (e: React.MouseEvent) => {
    // 检查点击的是否是按钮或其子元素
    const target = e.target as HTMLElement
    
    // 如果点击的是按钮、输入框或其他交互元素，不触发sidebar切换
    if (target.closest('button') || 
        target.closest('[role="button"]') || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('[data-dropdown-trigger]') ||
        target.closest('[data-more-button]')) {
      return
    }

    // 移动端不处理点击展开，使用专门的汉堡菜单
    if (isMobile) {
      return
    }

    // 只有在收起状态时才允许点击展开
    if (!isExpanded) {
      toggleSidebar()
    }
  }

  // 根据主题获取侧边栏样式
  const getSidebarStyles = () => {
    if (isDark) {
      return {
        shadow: "shadow-xl shadow-black/40",
        border: "border-r-stone-700/50",
        text: "text-stone-300",
        hoverBg: "hover:bg-stone-700" // 悬停时使用展开状态的背景色
      }
    } else {
      return {
        shadow: "shadow-xl shadow-stone-300/60",
        border: "border-r-stone-300/60",
        text: "text-stone-700",
        hoverBg: "hover:bg-stone-200" // 悬停时使用展开状态的背景色
      }
    }
  }

  const styles = getSidebarStyles()

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full flex flex-col border-r",
        // 过渡效果 - 移动端使用transform过渡，桌面端使用width过渡，加快速度
        isMobile 
          ? "transition-transform duration-150 ease-in-out" 
          : "transition-[width,background-color] duration-150 ease-in-out",
        
        // 宽度设置 - 始终保持固定宽度
        isExpanded ? "w-64" : "w-16",
        
        // 移动端的显示/隐藏逻辑
        isMobile && !isExpanded && "-translate-x-full",
        isMobile && isExpanded && "translate-x-0",
        
        // 桌面端始终显示
        !isMobile && "translate-x-0",
        
        // 移动端初始渲染优化（移除 isMounted 依赖，避免路由切换闪烁）
        
        // 简化Z-index设置
        isMobile ? "z-50" : "z-30",
        
        // 主题样式 - 展开时使用侧栏背景色，收起时使用主页背景色
        isExpanded ? colors.sidebarBackground.tailwind : colors.mainBackground.tailwind,
        "backdrop-blur-sm",
        styles.shadow,
        styles.border,
        styles.text,
        
        // --- BEGIN COMMENT ---
        // 悬停背景效果 - 仅在收起状态且非移动端时显示，使用展开状态的背景色
        // --- END COMMENT ---
        !isExpanded && !isMobile && styles.hoverBg,
        
        // --- BEGIN COMMENT ---
        // 点击区域提示 - 仅在收起状态时显示cursor-e-resize，表示可以向右展开
        // 防止文字选中 - 点击时不选中文字
        // 动画期间保持cursor状态，避免闪烁
        // --- END COMMENT ---
        "select-none",
        (!isExpanded && !isMobile) || (isAnimating && !isMobile) ? "cursor-e-resize" : ""
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSidebarClick}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader isHovering={isHovering} />
        <SidebarContent />
        <SidebarFooter />
      </div>
    </aside>
  )
} 