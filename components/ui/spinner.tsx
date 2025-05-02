"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const { isDark } = useTheme()
  
  const sizeClasses = {
    sm: "h-3 w-3 border-[1.5px]",
    md: "h-4 w-4 border-2",
    lg: "h-6 w-6 border-2"
  }
  
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-solid",
        sizeClasses[size],
        isDark 
          ? "border-gray-600 border-t-gray-200" 
          : "border-gray-200 border-t-gray-600",
        className
      )}
      aria-label="加载中"
    />
  )
} 