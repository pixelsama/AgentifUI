"use client"

import type * as React from "react"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"

interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  text: string
  active?: boolean
}

export function SidebarButton({ icon, text, active = false, className, onClick, ...props }: SidebarButtonProps) {
  const { isExpanded, lockExpanded } = useSidebarStore()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    lockExpanded()
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        "hover:bg-accent/70 hover:scale-[1.02] hover:shadow-sm",
        isExpanded ? "w-full" : "w-10",
        active 
          ? "bg-primary/10 text-primary shadow-inner" 
          : "text-foreground/80 hover:text-foreground",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {/* 图标容器 */}
      <span className={cn(
        "flex h-5 w-5 items-center justify-center",
        "transition-transform duration-200",
        active ? "text-primary" : "text-foreground/70",
        !isExpanded && "scale-110"
      )}>
        {icon}
      </span>

      {/* 文本内容 */}
      <span
        className={cn(
          "absolute left-10 whitespace-nowrap",
          "transition-all duration-200 ease-in-out",
          isExpanded 
            ? "opacity-100 transform-none" 
            : "opacity-0 -translate-x-2 pointer-events-none",
        )}
      >
        {text}
      </span>
    </button>
  )
} 