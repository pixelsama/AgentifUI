"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { PlusIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@lib/utils"
import { Button as UIButton } from "@components/ui/button"

// 通用按钮组件 - 完全没有布局限制
interface ChatButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  isDark?: boolean
  ariaLabel: string
  variant?: "function" | "submit"
}

const ChatButton = ({
  icon,
  onClick,
  disabled = false,
  className,
  isDark = false,
  ariaLabel,
  variant = "function",
}: ChatButtonProps) => {
  return (
    <UIButton
      type="button"
      size="sm"
      variant={variant === "function" ? "ghost" : "default"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full h-8 w-8 flex items-center justify-center",
        variant === "function"
          ? isDark
            ? "border border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
          : disabled
            ? isDark
              ? "bg-gray-700 text-gray-500"
              : "bg-gray-200 text-gray-400"
            : isDark
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-black text-white hover:bg-gray-800",
        "shadow-sm",
        className,
      )}
      aria-label={ariaLabel}
    >
      {icon}
    </UIButton>
  )
}

// 文本输入组件
interface ChatTextInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  maxHeight?: number
  isDark?: boolean
  className?: string
}

const ChatTextInput = ({
  value,
  onChange,
  onKeyDown,
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

// 按钮区域组件 - 处理按钮布局
interface ChatButtonAreaProps {
  children: React.ReactNode
  className?: string
}

const ChatButtonArea = ({ children, className }: ChatButtonAreaProps) => {
  return <div className={cn("flex items-center justify-between px-0 py-2", className)}>{children}</div>
}

// 文本区域组件
interface ChatTextAreaProps {
  children: React.ReactNode
  className?: string
}

const ChatTextArea = ({ children, className }: ChatTextAreaProps) => {
  return <div className={cn("px-4 pt-4 pb-1", className)}>{children}</div>
}

// 容器组件
interface ChatContainerProps {
  children: React.ReactNode
  isWelcomeScreen?: boolean
  isDark?: boolean
  className?: string
}

const ChatContainer = ({ children, isWelcomeScreen = false, isDark = false, className }: ChatContainerProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-2xl absolute left-1/2 transform -translate-x-1/2",
        // 修改定位方式，确保只有纵向变化，没有横向变化
        isWelcomeScreen ? "top-1/2 -translate-y-1/2" : "bottom-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col rounded-2xl",
          isDark ? "bg-gray-800" : "bg-white",
          "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
        )}
      >
        {children}
      </div>
    </div>
  )
}

// 主 ChatInput 组件
interface ChatInputProps {
  className?: string
  placeholder?: string
  maxHeight?: number
  isWelcomeScreen?: boolean
  onSubmit?: (message: string) => void
  isDark?: boolean
}

export const ChatInput = ({
  className,
  placeholder = "输入消息...",
  maxHeight = 180,
  isWelcomeScreen = false,
  onSubmit,
  isDark = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleSubmit = () => {
    if (!message.trim()) return

    if (onSubmit) {
      onSubmit(message)
    }

    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <ChatContainer isWelcomeScreen={isWelcomeScreen} isDark={isDark} className={className}>
      {/* 文本区域 */}
      <ChatTextArea>
        <ChatTextInput
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxHeight={maxHeight}
          isDark={isDark}
        />
      </ChatTextArea>

      {/* 按钮区域 - 调整布局确保按钮贴边 */}
      <div className="px-4">
        <ChatButtonArea>
          <div className="flex-none">
            <ChatButton icon={<PlusIcon className="h-4 w-4" />} isDark={isDark} ariaLabel="添加附件" />
          </div>
          <div className="flex-none">
            <ChatButton
              icon={<ArrowUpIcon className="h-4 w-4" />}
              variant="submit"
              onClick={handleSubmit}
              disabled={!message.trim()}
              isDark={isDark}
              ariaLabel="发送消息"
            />
          </div>
        </ChatButtonArea>
      </div>
    </ChatContainer>
  )
}

// 导出所有子组件，方便单独使用
export { ChatButton, ChatTextInput, ChatButtonArea, ChatTextArea, ChatContainer }
