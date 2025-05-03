"use client"

import React from "react"
import { Sparkles, ChevronUp } from "lucide-react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"

interface PromptButtonProps {
  className?: string
  onClick?: () => void
  expanded?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function PromptButton({ 
  className, 
  onClick, 
  expanded = false, 
  icon, 
  children = "提示模板" 
}: PromptButtonProps) {
  const { isDark } = useTheme()
  
  const defaultIcon = expanded ? (
    <ChevronUp className={cn(
      "w-4 h-4 transition-all duration-300",
      isDark ? "text-blue-400" : "text-blue-500"
    )} />
  ) : (
    <Sparkles className={cn(
      "w-4 h-4 transition-all duration-300",
      "group-hover:text-blue-500 group-hover:animate-bounce-subtle",
      isDark ? "text-blue-400" : "text-blue-500"
    )} />
  )
  
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-full",
        "border transition-all duration-300 group whitespace-nowrap",
        "shadow-sm hover:shadow-md hover:-translate-y-0.5",
        expanded ? (
          isDark 
            ? "border-blue-600 bg-blue-900/50 text-blue-300" 
            : "border-blue-300 bg-blue-50 text-blue-600"
        ) : (
          isDark
            ? "border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
        ),
        className
      )}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : "提示按钮"}
      aria-expanded={expanded}
    >
      {icon || defaultIcon}
      <span className={cn(
        "group-hover:text-blue-500 transition-colors duration-300",
        expanded && (isDark ? "text-blue-300" : "text-blue-600")
      )}>
        {children}
      </span>
    </button>
  )
} 