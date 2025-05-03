"use client"

import { useRef, useCallback, useEffect } from "react"
import { cn } from "@lib/utils"
import { INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"

interface ChatTextInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  maxHeight?: number
  isDark?: boolean
  className?: string
  onCompositionStart?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  onCompositionEnd?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  onHeightChange?: (height: number) => void
}

export const ChatTextInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "输入消息...",
  maxHeight = 180,
  isDark = false,
  className,
  onCompositionStart,
  onCompositionEnd,
  onHeightChange,
}: ChatTextInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Memoize the height update logic
  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height temporarily to calculate scrollHeight accurately
    textarea.style.height = "auto" // Use auto instead of fixed min-height for calculation
    const scrollHeight = textarea.scrollHeight
    
    // Calculate new height, respecting maxHeight
    const newHeight = Math.min(scrollHeight, maxHeight)
    
    // Apply the new height
    textarea.style.height = `${newHeight}px`
    
    // Notify parent component of the height change
    if (onHeightChange) {
        // Report the actual rendered height, ensuring it's at least the initial height
        onHeightChange(Math.max(newHeight, INITIAL_INPUT_HEIGHT)) 
    }
  }, [maxHeight, onHeightChange])

  // Adjust height based on value and initial mount
  useEffect(() => {
    updateHeight()
  }, [value, updateHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1} // Start with one row
      className={cn(
        "w-full resize-none border-0 bg-transparent focus:ring-0 focus:outline-none",
        "min-h-[48px] overflow-y-auto", // Keep min-height for visual consistency
        isDark ? "text-white placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-500",
        className,
      )}
      style={{ maxHeight: `${maxHeight}px` }} // Control max height via style
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
    />
  )
} 