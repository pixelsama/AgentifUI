"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PlusIcon, ArrowUpIcon, Square, Loader2 } from "lucide-react"
import { useChatWidth, useInputHeightReset } from "@lib/hooks"
import { useChatLayoutStore } from "@lib/stores/chat-layout-store"
import { useChatInputStore } from "@lib/stores/chat-input-store"
import { useChatScrollStore } from "@lib/stores/chat-scroll-store"
import { useAttachmentStore } from "@lib/stores/attachment-store"
import { AttachmentPreviewBar } from "./attachment-preview-bar"
import { INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"
import { ChatButton } from "./button"
import { ChatTextInput } from "./text-input"
import { ChatContainer } from "./container"
import { ChatButtonArea, ChatTextArea } from "./layout"
import { create } from "zustand"
import { TooltipWrapper } from "@components/ui/tooltip-wrapper"
import { uploadDifyFile } from "@lib/services/dify/file-service"
import { DifyFileUploadResponse } from "@lib/services/dify/types"
import { AttachmentFile } from "@lib/stores/attachment-store"

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
  onSubmit?: (message: string, files: { type: string; transfer_method: string; upload_file_id: string; name: string; size: number; mime_type: string; }[]) => void
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
  
  // 附件状态
  const { files: attachments, addFiles, clearFiles: clearAttachments, updateFileStatus, updateFileUploadedId } = useAttachmentStore()
  // 本地状态，存储附件栏和文本框的各自高度
  const [attachmentBarHeight, setAttachmentBarHeight] = useState(0)
  const [textAreaHeight, setTextAreaHeight] = useState(INITIAL_INPUT_HEIGHT)
  // 隐藏的文件输入元素引用
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [uploadErrorOccurred, setUploadErrorOccurred] = useState(false)
  
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

  // 回调函数，用于处理文本输入框高度变化
  const handleTextHeightChange = useCallback((height: number) => {
    const newTextAreaHeight = Math.max(height, INITIAL_INPUT_HEIGHT)
    setTextAreaHeight(newTextAreaHeight) // 更新本地文本区域高度状态
    setInputHeight(newTextAreaHeight + attachmentBarHeight)
  }, [setInputHeight, attachmentBarHeight])

  // 回调函数，用于处理附件预览栏高度变化
  const handleAttachmentBarHeightChange = useCallback((height: number) => {
    setAttachmentBarHeight(height) // 更新本地附件栏高度状态
    setInputHeight(textAreaHeight + height)
  }, [setInputHeight, textAreaHeight])

  // TODO: 获取真实的 User ID 和 App ID - 占位符实现
  const currentUserId = "userlyz"; // 实际应从认证状态获取
  const currentAppId = "default"; // 实际应从应用上下文或 props 获取

  // 提交消息（只负责消息和已上传文件的组装与提交）
  const handleLocalSubmit = async () => {
    // 1. 过滤所有上传成功的文件，组装 Dify API 规范的 files 字段
    const uploadedFiles = attachments.filter(f => f.status === 'success' && f.uploadedId);
    // 组装 Dify 文件对象数组（upload_file_id 一定为 string）
    const files = uploadedFiles
      .filter(f => typeof f.uploadedId === 'string')
      .map(f => ({
        type: getDifyFileType(f),
        transfer_method: 'local_file',
        upload_file_id: f.uploadedId as string, // 明确断言为 string
        name: f.name,
        size: f.size,
        mime_type: f.type,
      }));

    // 2. 只有消息有内容时才允许提交
    if (message.trim() && onSubmit) {
      onSubmit(message, files);
      clearMessage();
      clearAttachments();
      useChatScrollStore.getState().scrollToBottom('smooth');
    } else {
      console.log("[ChatInput] 没有可提交的消息内容。");
    }
  };

  // --- 辅助函数：根据文件类型推断 Dify 文件 type 字段 ---
  function getDifyFileType(f: AttachmentFile): 'image' | 'document' | 'audio' | 'video' | 'custom' {
    const mime = f.type.toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    if (mime === 'application/pdf' || mime.includes('word') || mime.includes('excel') || mime.includes('csv') || mime.includes('text') || mime.includes('html') || mime.includes('xml') || mime.includes('epub') || mime.includes('powerpoint')) return 'document';
    return 'custom';
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      
      // --- BEGIN 中文注释 ---
      // 在回车提交前，进行与按钮禁用逻辑完全一致的检查
      const shouldBlockSubmit = 
        isWaiting || // 正在等待响应
        isProcessing || // 正在处理上一条消息
        attachments.some(f => f.status === 'uploading') || // 有文件正在上传
        attachments.some(f => f.status === 'error') || // 有文件上传失败
        !message.trim(); // 消息为空
      // --- END 中文注释 ---

      if (!shouldBlockSubmit) {
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
  
  // 处理附件按钮点击
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择变化
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFiles(Array.from(files)) // 将选中的文件添加到附件 Store

      // 遍历每个新文件，立即发起真实上传
      Array.from(files).forEach((file) => {
        const fileId = `${file.name}-${file.lastModified}-${file.size}`;
        // 1. 标记为 uploading，进度 0
        updateFileStatus(fileId, 'uploading', 0);
        // 2. 调用真实上传，传入进度回调
        uploadDifyFile(currentAppId, file, currentUserId, (progress) => {
          // 实时更新进度
          updateFileStatus(fileId, 'uploading', progress);
        })
          .then((response) => {
            // 上传成功，记录 difyFileId，状态 success
            updateFileUploadedId(fileId, response.id);
            console.log(`[ChatInput] 文件上传成功: ${fileId} -> ${response.id}`);
          })
          .catch((error) => {
            // 上传失败，状态 error，记录错误
            updateFileStatus(fileId, 'error', undefined, error.message || '上传失败');
            console.error(`[ChatInput] 文件上传失败: ${fileId}`, error);
          });
      });
    }
    // 清空文件输入元素的值，允许用户再次选择相同的文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // 计算是否有任何附件正在上传中
  const isUploading = attachments.some(f => f.status === 'uploading');

  return (
    <ChatContainer isWelcomeScreen={isWelcomeScreen} isDark={isDark} className={className} widthClass={widthClass}>
      {/* 隐藏的文件输入元素 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple // 允许选择多个文件
        // 可以添加 accept 属性限制文件类型，例如 accept="image/*,.pdf"
      />
      {/* 附件预览栏，仅当有附件时显示 */}
      <AttachmentPreviewBar
        isDark={isDark}
        onHeightChange={handleAttachmentBarHeightChange}
      />

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
          onHeightChange={handleTextHeightChange}
        />
      </ChatTextArea>

      {/* 按钮区域 */}
      <div className="px-4">
        <ChatButtonArea>
          <div className="flex-none">
            <TooltipWrapper 
              content="添加附件" 
              id="add-attachment-tooltip" 
              placement="top"
            >
              <ChatButton 
                icon={<PlusIcon className="h-4 w-4" />} 
                isDark={isDark} 
                ariaLabel="添加附件"
                onClick={handleAttachmentClick}
                disabled={isUploadingFiles || isProcessing}
              />
            </TooltipWrapper>
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
              disabled={
                // --- BEGIN 中文注释 ---
                // 1. 等待响应时禁用
                isWaiting ||
                // 2. 有文件正在上传时禁用
                attachments.some(f => f.status === 'uploading') ||
                // 3. 有文件上传失败时禁用
                attachments.some(f => f.status === 'error') ||
                // 4. 没有消息内容时禁用（去除多余判断）
                (!isProcessing && !message.trim())
                // --- END 中文注释 ---
              }
              isDark={isDark}
              ariaLabel={isProcessing ? "停止生成" : (isUploadingFiles ? "正在上传..." : (uploadErrorOccurred ? "处理附件错误" : "发送消息"))}
              forceActiveStyle={isWaiting}
            />
          </div>
        </ChatButtonArea>
      </div>
    </ChatContainer>
  )
} 