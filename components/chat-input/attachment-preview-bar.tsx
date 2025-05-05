"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useAttachmentStore } from "@lib/stores/attachment-store"
import { AttachmentPreviewItem } from "./attachment-preview-item"

// --- BEGIN COMMENT ---
// 附件预览栏 Props 定义
// --- END COMMENT ---
interface AttachmentPreviewBarProps {
  isDark?: boolean
  onHeightChange: (height: number) => void // 回调函数，通知父组件高度变化
  onRetryUpload: (id: string) => void // 添加重试上传的回调
}

// --- BEGIN COMMENT ---
// 附件预览栏组件
// --- END COMMENT ---
export const AttachmentPreviewBar: React.FC<AttachmentPreviewBarProps> = ({ isDark = false, onHeightChange, onRetryUpload }) => {
  const files = useAttachmentStore((state) => state.files)
  const containerRef = useRef<HTMLDivElement>(null)

  // --- BEGIN MODIFICATION ---
  // 监听文件列表变化或窗口大小变化，动态计算并通知高度，并设置样式以实现动画
  useEffect(() => {
    let calculatedHeight = 0;
    const container = containerRef.current;

    const calculateAndApplyHeight = () => {
      if (container) {
        // --- BEGIN COMMENT ---
        // 先移除临时高度，计算实际内容高度
        // --- END COMMENT ---
        container.style.height = ''; // 清除旧高度
        calculatedHeight = files.length > 0 ? container.scrollHeight : 0;

        // --- BEGIN COMMENT ---
        // 应用计算出的高度到 style，触发 CSS transition
        // --- END COMMENT ---
        container.style.height = `${calculatedHeight}px`;

        // --- BEGIN COMMENT ---
        // 通知父组件高度变化
        // --- END COMMENT ---
        onHeightChange(calculatedHeight);
      }
    };

    // --- BEGIN COMMENT ---
    // 使用 requestAnimationFrame 确保在 DOM 更新后计算高度
    // --- END COMMENT ---
    const rafId = requestAnimationFrame(calculateAndApplyHeight);

    // 使用 ResizeObserver 监听容器内容尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateAndApplyHeight);
    });
    if (container) {
      // 监听内部的 flex 容器，而不是带 overflow 的外部容器
      const innerFlexContainer = container.querySelector(':scope > div');
      if (innerFlexContainer) {
         resizeObserver.observe(innerFlexContainer);
      }
    }

    // 清理函数
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      // 清除高度样式，以便下次正确计算
      if (container) {
          container.style.height = '';
      }
    };
  }, [files.length, onHeightChange]); // 依赖文件数量变化
  // --- END MODIFICATION ---

  return (
    <div
      ref={containerRef}
      className={cn(
        isDark ? "border-gray-700" : "border-gray-200", // This class no longer has effect but kept for potential future use
        "overflow-hidden",
        "transition-[height] duration-300 ease-in-out",
      )}
      style={{ height: 0 }}
    >
      {/* --- BEGIN COMMENT ---
      // 内层容器用于 padding 和 flex 布局，ResizeObserver 监听这个元素
      // --- END COMMENT ---*/}
      <div className="px-3 pt-3 pb-2 flex flex-wrap gap-2"> {/* 调整 padding */}
        {files.map((file) => (
          <AttachmentPreviewItem 
            key={file.id} 
            attachment={file} 
            isDark={isDark} 
            onRetry={onRetryUpload} 
          />
        ))}
      </div>
    </div>
  )
} 