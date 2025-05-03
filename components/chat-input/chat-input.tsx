"use client"

import { useCallback } from "react"
import { PlusIcon, ArrowUpIcon } from "lucide-react"
import { useChatWidth, useInputHeightReset } from "@lib/hooks"
import { useChatLayoutStore } from "@lib/stores/chat-layout-store"
import { useChatInputStore } from "@lib/stores/chat-input-store"
import { ChatButton } from "./button"
import { ChatTextInput } from "./text-input"
import { ChatContainer } from "./container"
import { ChatButtonArea, ChatTextArea } from "./layout"

// 主 ChatInput 组件
interface ChatInputProps {
  className?: string
  placeholder?: string
  maxHeight?: number
  onSubmit?: (message: string) => void
}

export const ChatInput = ({
  className,
  placeholder = "输入消息...",
  maxHeight = 180,
  onSubmit,
}: ChatInputProps) => {
  const { widthClass } = useChatWidth()
  const { setInputHeight } = useChatLayoutStore()
  const {
    message, 
    setMessage, 
    clearMessage,
    isComposing, 
    setIsComposing,
    isWelcomeScreen,
    isDark
  } = useChatInputStore()
  
  // 使用高度重置钩子
  useInputHeightReset(isWelcomeScreen)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  // 回调函数，用于处理输入框高度变化
  const handleHeightChange = useCallback((height: number) => {
    setInputHeight(height)
  }, [setInputHeight])

  const handleSubmit = () => {
    if (!message.trim()) return

    if (onSubmit) {
      onSubmit(message)
    }

    clearMessage()
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