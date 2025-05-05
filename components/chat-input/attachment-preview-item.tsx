"use client"

import React from "react"
import { cn, formatBytes } from "@lib/utils"
import { AttachmentFile, useAttachmentStore } from "@lib/stores/attachment-store"
import { XIcon, FileTextIcon, AlertCircleIcon, CheckCircle2Icon, UploadCloudIcon } from "lucide-react"

// --- BEGIN COMMENT ---
// 单个附件预览项的 Props 定义
// --- END COMMENT ---
interface AttachmentPreviewItemProps {
  attachment: AttachmentFile
  isDark?: boolean
}

// --- BEGIN COMMENT ---
// 圆形进度条组件 (无文字)
// --- END COMMENT ---
const CircularProgress: React.FC<{ progress: number; size?: number; strokeWidth?: number; isDark?: boolean }> = ({ progress, size = 20, strokeWidth = 2, isDark = false }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  // --- BEGIN COMMENT ---
  // 确保进度在 0-100 之间，防止 offset 计算错误
  // --- END COMMENT ---
  const safeProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (safeProgress / 100) * circumference

  return (
    <svg width={size} height={size} className="absolute inset-0 m-auto transform -rotate-90">
      {/* 背景圆环 */}
      <circle
        className={cn(
          isDark ? "text-gray-600" : "text-gray-300" // 更中性的背景环颜色
        )}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* 进度圆环 */}
      <circle
        className={cn(
          "transition-all duration-300 ease-linear",
          isDark ? "text-gray-300" : "text-gray-700" // 更中性的进度环颜色
        )}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* --- REMOVED TEXT ELEMENT --- */}
    </svg>
  )
}

// --- BEGIN COMMENT ---
// 单个附件预览项组件 (简约风格 v2)
// --- END COMMENT ---
export const AttachmentPreviewItem: React.FC<AttachmentPreviewItemProps> = ({ attachment, isDark = false }) => {
  const removeFile = useAttachmentStore((state) => state.removeFile)

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeFile(attachment.id)
  }

  const StatusIcon = () => {
    switch (attachment.status) {
      case 'uploading':
        return <CircularProgress progress={attachment.progress} size={18} strokeWidth={2} isDark={isDark} />
      case 'success':
        return <CheckCircle2Icon className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-500")} />
      case 'error':
        return <AlertCircleIcon className={cn("w-4 h-4", isDark ? "text-red-400" : "text-red-500")} />
      case 'pending':
      default:
        return <FileTextIcon className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-500")} />
    }
  }

  return (
    <div
      className={cn(
        "relative pl-2 pr-1 py-1 rounded-md flex items-center gap-2",
        "flex-shrink basis-[calc((100%-1.5rem)/3)] sm:basis-[calc((100%-1rem)/2)]",
        "max-w-[180px] sm:max-w-[200px]",
        isDark ? "bg-gray-700/80 border border-gray-600/60" : "bg-gray-100 border border-gray-200",
      )}
      title={attachment.error ? `错误: ${attachment.error}` : attachment.name}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center relative">
        <StatusIcon />
      </div>

      <div className="flex-grow min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isDark ? "text-gray-100" : "text-gray-900",
          )}
        >
          {attachment.name}
        </p>
        <p
          className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {formatBytes(attachment.size)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          "ml-auto flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
          "bg-gray-300/50 hover:bg-gray-400/70 dark:bg-gray-600/50 dark:hover:bg-gray-500/70",
          isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-black",
        )}
        aria-label="移除附件"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  )
} 