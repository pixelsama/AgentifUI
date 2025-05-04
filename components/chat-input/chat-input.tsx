"use client"

import { useCallback, useState, useEffect } from "react"
import { PlusIcon, ArrowUpIcon, Square, Loader2 } from "lucide-react"
import { useChatWidth, useInputHeightReset } from "@lib/hooks"
import { useChatLayoutStore } from "@lib/stores/chat-layout-store"
import { useChatInputStore } from "@lib/stores/chat-input-store"
import { ChatButton } from "./button"
import { ChatTextInput } from "./text-input"
import { ChatContainer } from "./container"
import { ChatButtonArea, ChatTextArea } from "./layout"
import { create } from "zustand"
import { Tooltip } from "@components/ui/tooltip"

// 创建一个全局焦点管理器
interface FocusManagerState {
  inputRef: React.RefObject<HTMLTextAreaElement> | null;
  registerRef: (ref: React.RefObject<HTMLTextAreaElement>) => void;
  focusInput: () => void;
}

// 使用Zustand存储输入框引用，确保跨组件共享
export const useFocusManager = create<FocusManagerState>((set, get) => ({
  inputRef: null,
  
  // 注册输入框引用
  registerRef: (ref) => {
    set({ inputRef: ref });
  },
  
  // 聚焦到输入框
  focusInput: () => {
    const { inputRef } = get();
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }
}));

// 主 ChatInput 组件
interface ChatInputProps {
  className?: string
  placeholder?: string
  maxHeight?: number
  onSubmit?: (message: string) => void
  onStop?: () => void
  isProcessing?: boolean
  isWaitingForResponse?: boolean
  isWaiting?: boolean
}

export const ChatInput = ({
  className,
  placeholder = "输入消息...",
  maxHeight = 180,
  onSubmit,
  onStop,
  isProcessing = false,
  isWaitingForResponse = false,
  isWaiting = false
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
  
  // 创建输入框引用
  const inputRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      // 将引用注册到全局焦点管理器
      const ref = { current: node } as React.RefObject<HTMLTextAreaElement>;
      useFocusManager.getState().registerRef(ref);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  // 回调函数，用于处理输入框高度变化
  const handleHeightChange = useCallback((height: number) => {
    setInputHeight(height)
  }, [setInputHeight])

  const handleLocalSubmit = () => {
    if (!message.trim()) return;
    if (onSubmit) {
      onSubmit(message);
    }
    clearMessage();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (!isProcessing) {
        handleLocalSubmit();
      }
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

  // 消息变化时自动聚焦
  useEffect(() => {
    if (message) {
      useFocusManager.getState().focusInput();
    }
  }, [message]);
  
  // 添加处理附件上传的函数
  const handleAttachmentClick = () => {
    // 这里可以实现文件上传功能，例如打开文件选择器
    console.log("添加附件按钮被点击")
    // 后续可以实现：
    // 1. 打开文件选择对话框
    // 2. 处理文件上传到服务器
    // 3. 将附件添加到消息中
  }

  return (
    <ChatContainer isWelcomeScreen={isWelcomeScreen} isDark={isDark} className={className} widthClass={widthClass}>
      {/* 文本区域 */}
      <ChatTextArea>
        <ChatTextInput
          ref={inputRef}
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
            <Tooltip 
              content="添加附件" 
              id="add-attachment-tooltip" 
              placement="bottom"
            >
              <ChatButton 
                icon={<PlusIcon className="h-4 w-4" />} 
                isDark={isDark} 
                ariaLabel="添加附件"
                onClick={handleAttachmentClick}
                disabled={isProcessing || isWaitingForResponse}
              />
            </Tooltip>
          </div>
          <div className="flex-none">
            <ChatButton
              icon={
                isWaiting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isProcessing ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5" />
                )
              }
              variant="submit"
              onClick={isWaiting ? undefined : (isProcessing ? onStop : handleLocalSubmit)}
              disabled={isWaiting}
              isDark={isDark}
              ariaLabel="发送消息"
              forceActiveStyle={isWaiting}
            />
          </div>
        </ChatButtonArea>
      </div>
    </ChatContainer>
  )
} 