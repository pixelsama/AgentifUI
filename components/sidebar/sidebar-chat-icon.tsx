"use client"

import { cn } from "@lib/utils"

interface SidebarChatIconProps {
  // 允许自定义类名和大小
  className?: string
  size?: 'sm' | 'md' | 'lg'
  isDark?: boolean
}

export function SidebarChatIcon({ className, size = 'md', isDark }: SidebarChatIconProps) {
  // 根据size属性确定尺寸
  const sizeClasses = {
    sm: {
      container: "w-3",
      gap: "space-y-[1.5px]",
      line1: "h-[1px] w-3",
      line2: "h-[1px] w-2",
      line3: "h-[1px] w-1",
    },
    md: {
      container: "w-3.5",
      gap: "space-y-[2px]",
      line1: "h-[1.5px] w-3.5",
      line2: "h-[1.5px] w-2.5",
      line3: "h-[1.5px] w-1.5",
    },
    lg: {
      container: "w-4",
      gap: "space-y-1",
      line1: "h-[2px] w-4",
      line2: "h-[2px] w-3",
      line3: "h-[2px] w-2",
    },
  }

  const { container, gap, line1, line2, line3 } = sizeClasses[size]

  return (
    <div 
      className={cn(
        "flex flex-col justify-center items-start transition-transform duration-150",
        gap,
        container,
        "group-hover:scale-105",
        className
      )}
    >
      <div className={cn(line1, "bg-current rounded-full transition-all duration-150 group-hover:w-full", isDark ? "opacity-80" : "opacity-70")} />
      <div className={cn(line2, "bg-current rounded-full transition-all duration-150 group-hover:w-4/5", isDark ? "opacity-80" : "opacity-70")} />
      <div className={cn(line3, "bg-current rounded-full transition-all duration-150 group-hover:w-3/5", isDark ? "opacity-80" : "opacity-70")} />
    </div>
  )
} 