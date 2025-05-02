"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { PlusIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@lib/utils"
import { Button as UIButton } from "@components/ui/button"
import { useChatWidth } from "@lib/hooks"
import { useChatLayoutStore, INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"

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
  onCompositionStart?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  onCompositionEnd?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
  onHeightChange?: (height: number) => void
}

const ChatTextInput = ({
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
  widthClass: string
}

// 定义 ChatInput 容器的向上偏移，在这里修改垂直高度
const INPUT_VERTICAL_SHIFT = "5rem"; // 示例偏移值（根据需要调整，可能与 WelcomeScreen 偏移匹配）

const ChatContainer = ({ children, isWelcomeScreen = false, isDark = false, className, widthClass }: ChatContainerProps) => {
  // 基础定位类
  const baseClasses = cn(
    "w-full absolute left-1/2 transform", // 保持水平居中变换
    widthClass,
    "transition-[top,bottom] duration-200 ease-in-out", // 添加顶部/底部变换
    className,
  );

  // 根据欢迎页状态确定动态样式
  const dynamicStyles: React.CSSProperties = isWelcomeScreen 
    ? { 
        top: `calc(50% - ${INPUT_VERTICAL_SHIFT})`, // 应用向上偏移
        transform: 'translate(-50%, -50%)' // 保持居中变换
      }
    : { 
        bottom: '1.5rem', // 等同于 bottom-6
        transform: 'translateX(-50%)' // 只水平居中
      };

  return (
    <div
      className={baseClasses}
      style={dynamicStyles} // 应用动态样式
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
  const { widthClass } = useChatWidth()
  const [isComposing, setIsComposing] = useState(false)
  const { setInputHeight, resetInputHeight } = useChatLayoutStore()

  // Effect to reset input height when isWelcomeScreen changes
  useEffect(() => {
      resetInputHeight();
  }, [isWelcomeScreen, resetInputHeight]);

  // Effect to reset input height on unmount
  useEffect(() => {
      return () => {
          resetInputHeight();
      };
  }, [resetInputHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  // Callback for height changes from ChatTextInput
  const handleHeightChange = useCallback((height: number) => {
      setInputHeight(height);
  }, [setInputHeight]);

  const handleSubmit = () => {
    if (!message.trim()) return

    if (onSubmit) {
      onSubmit(message)
    }

    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 只有在不处于输入法组合状态时，按Enter才发送消息
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 处理输入法组合开始事件
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  // 处理输入法组合结束事件
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return (
    <ChatContainer isWelcomeScreen={isWelcomeScreen} isDark={isDark} className={className} widthClass={widthClass}>
      {/* 文本区域 */}
      <ChatTextArea>
        <ChatTextInput
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxHeight={maxHeight}
          isDark={isDark}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onHeightChange={handleHeightChange}
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
