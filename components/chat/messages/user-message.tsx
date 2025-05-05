"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme, useMobile } from "@lib/hooks"
import { MessageAttachment } from '@lib/stores/chat-store'
import { FileAttachmentDisplay } from './file-attachment-display'

interface UserMessageProps {
  content: string
  attachments?: MessageAttachment[]
  className?: string
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, attachments = [], className }) => {
  const { isDark } = useTheme()
  const isMobile = useMobile()
  const hasAttachments = attachments && attachments.length > 0
  
  return (
    <div className="flex flex-col items-end mb-8 gap-2">
      {/* 附件显示区域 - 直接右对齐 */}
      {hasAttachments && (
        <FileAttachmentDisplay 
          attachments={attachments.map(att => ({
            id: att.id,
            name: att.name,
            size: att.size,
            type: att.type,
            uploadedId: att.upload_file_id
          }))}
          isDark={isDark}
          className={cn(
            "w-full max-w-[80%] md:max-w-[60%]",
          )}
        />
      )}
      {/* 消息气泡 */}
      <div
        className={cn(
          "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2",
          isDark 
            ? "bg-blue-600 text-white" 
            : "bg-blue-500 text-white",
          className
        )}
      >
        {content}
      </div>
    </div>
  )
} 