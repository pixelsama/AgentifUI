"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@lib/utils"

interface ChatTextInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onCompositionStart?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  onCompositionEnd?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  maxHeight?: number
  isDark?: boolean
  className?: string
}

export const ChatTextInput = ({
  value,
  onChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  placeholder = "输入消息...",
  maxHeight = 180,
  isDark = false,
  className,
}: ChatTextInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 根据内容调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 重置高度以获取正确的scrollHeight
    textarea.style.height = "48px" // 设置最小高度

    // 计算新高度，但不超过最大高度
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [value, maxHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      placeholder={placeholder}
      rows={1}
      className={cn(
        "w-full resize-none border-0 bg-transparent focus:ring-0 focus:outline-none",
        "min-h-[48px] overflow-y-auto",
        isDark ? "text-white placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-500",
        className,
      )}
      style={{ maxHeight: `${maxHeight}px` }}
    />
  )
}
