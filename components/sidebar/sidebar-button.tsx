"use client"

import type * as React from "react"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useTheme } from "@lib/hooks/use-theme"

interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  text: string
  active?: boolean
}

export function SidebarButton({ icon, text, active = false, className, onClick, ...props }: SidebarButtonProps) {
  const { isExpanded, lockExpanded } = useSidebarStore()
  const { isDark } = useTheme()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    lockExpanded()
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        "relative flex items-center rounded-3xl px-3 py-2.5 text-sm font-medium",
        "transition-[width,background-color,transform,box-shadow] duration-300 ease-in-out",
        "cursor-pointer",
        
        // 通用悬停效果
        "hover:scale-[1.02]",
        
        // 亮色模式下的样式
        !isDark && [
          "hover:bg-accent/50",
          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
          active 
            ? "bg-primary/10 text-primary shadow-[0_4px_12px_rgba(0,0,0,0.25)]" 
            : "text-foreground/80 hover:text-foreground",
        ],
        
        // 暗色模式下的样式
        isDark && [
          "hover:bg-gray-800",
          "hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
          active 
            ? "bg-gray-800/90 text-blue-400 shadow-inner shadow-black/20 border border-gray-700" 
            : "text-gray-300 hover:text-white",
        ],
        
        // 响应式宽度
        isExpanded ? "w-full" : "w-10",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {/* 图标容器 - 固定在左侧 */}
      <span className={cn(
        "flex h-5 w-5 items-center justify-center",
        "transition-transform duration-200",
        
        // 亮色模式下的图标样式
        !isDark && [
          active ? "text-primary" : "text-foreground/70",
        ],
        
        // 暗色模式下的图标样式
        isDark && [
          active ? "text-blue-400" : "text-gray-400",
        ],
        
        // 图标在收缩状态下的缩放效果
        !isExpanded && "scale-110",
      )}>
        {icon}
      </span>

      {/* 文本内容 - 使用绝对定位，根据 isExpanded 瞬时显隐 */}
      <span className={cn(
        "absolute left-10 whitespace-nowrap",
        isDark && active && "text-blue-300",
        isExpanded ? "block" : "hidden"
      )}>
        {text}
      </span>
    </button>
  )
} 