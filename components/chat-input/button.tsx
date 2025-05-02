"use client"

import type React from "react"
import { cn } from "@lib/utils"
import { Button as UIButton } from "@components/ui/button"

interface ChatButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: "left" | "right"
  isDark?: boolean
  ariaLabel: string
}

export const ChatButton = ({
  icon,
  onClick,
  disabled = false,
  className,
  variant = "left",
  isDark = false,
  ariaLabel,
}: ChatButtonProps) => {
  // 左侧按钮 - 带有渐变感觉的浅灰色边框
  if (variant === "left") {
    return (
      <UIButton
        type="button"
        size="sm"
        variant="ghost"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "rounded-full h-8 w-8 flex items-center justify-center",
          isDark
            ? "border border-gray-700 text-gray-300 hover:bg-gray-800"
            : "border border-gray-200 text-gray-600 hover:bg-gray-50",
          "bg-transparent",
          className,
        )}
        aria-label={ariaLabel}
      >
        {icon}
      </UIButton>
    )
  }

  // 右侧提交按钮 - 空状态为深灰色
  return (
    <UIButton
      type="button"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full h-8 w-8 flex items-center justify-center",
        disabled
          ? isDark
            ? "bg-gray-700 text-gray-500"
            : "bg-gray-200 text-gray-400"
          : isDark
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-black text-white hover:bg-gray-800",
        "cursor-pointer shadow-sm",
        className,
      )}
      aria-label={ariaLabel}
    >
      {icon}
    </UIButton>
  )
}
