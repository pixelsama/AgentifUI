"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth } from "@lib/hooks"

interface ChatInputBackdropProps {
  className?: string
}

export function ChatInputBackdrop({ className }: ChatInputBackdropProps) {
  const { isDark } = useTheme()
  const { widthClass } = useChatWidth()
  
  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-0 mx-auto",
        widthClass, // 使用统一的宽度类
        className
      )}
      style={{ 
        background: isDark ? 'rgb(17, 24, 39)' : 'rgb(249, 250, 251)',
      }}
    />
  )
} 