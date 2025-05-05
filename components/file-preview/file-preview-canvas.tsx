"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { cn, formatBytes } from '@lib/utils'
import { useFilePreviewStore } from '@lib/stores/ui/file-preview-store'
import { useTheme } from '@lib/hooks'
import type { MessageAttachment } from '@lib/stores/chat-store';
import { FilePreviewBackdrop } from './file-preview-backdrop';

// 简化版：文件内容预览组件 - 只显示基础信息
const FileContentViewer: React.FC<{ file: MessageAttachment | null; isDark: boolean }> = ({ file, isDark }) => {
  if (!file) return null;

  return (
    // 保留外层容器用于可能的样式调整
    <div> 
      <h3 className="text-lg font-semibold mb-4">文件信息</h3>
      <div className={cn("space-y-1 text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
        <p><strong>名称:</strong> {file.name}</p>
        <p><strong>类型:</strong> {file.type}</p>
        <p><strong>大小:</strong> {formatBytes(file.size)}</p>
      </div>
      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        (文件内容预览功能暂不可用)
      </p>
    </div>
  );
};

export const FilePreviewCanvas = () => {
  const { isPreviewOpen, currentPreviewFile, closePreview } = useFilePreviewStore();
  const { isDark } = useTheme();

  const panelVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  // 加快动画速度：减少 duration
  const transitionConfig = {
    type: "tween",
    duration: 0.2, // 从 0.3 减小到 0.2
    ease: "easeInOut"
  };

  return (
    <>
      <FilePreviewBackdrop />
      
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            className={cn(
              "fixed top-0 right-0 h-full z-50 shadow-lg",
              "flex flex-col",
              "w-[85%] md:w-[60%] lg:w-[50%] xl:w-[40%]",
              isDark ? "bg-gray-800 text-gray-100 border-l border-gray-700" : "bg-white text-gray-900 border-l border-gray-200"
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitionConfig}
          >
            <div className={cn(
              "flex items-center justify-between p-4 border-b flex-shrink-0",
              isDark ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className="text-xl font-semibold truncate" title={currentPreviewFile?.name || '文件信息'}>
                {currentPreviewFile?.name || '文件信息'}
              </h2>
              <button
                onClick={closePreview}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                )}
                aria-label="关闭预览"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FileContentViewer file={currentPreviewFile} isDark={isDark ?? false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 