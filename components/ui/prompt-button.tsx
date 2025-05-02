"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
import { usePromptModalStore } from "@lib/stores/ui/prompt-modal-store"

interface PromptButtonProps {
  className?: string
}

export function PromptButton({ className }: PromptButtonProps) {
  const { isDark } = useTheme()
  const { openModal } = usePromptModalStore()
  
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
        "border transition-colors duration-200",
        isDark
          ? "border-gray-700 hover:bg-gray-800 text-gray-300"
          : "border-gray-200 hover:bg-gray-50 text-gray-600",
        className
      )}
      onClick={openModal}
      aria-label="查看提示模板"
    >
      <Sparkles className="w-4 h-4" />
      <span>提示模板</span>
    </button>
  )
} 