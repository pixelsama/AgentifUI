"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { cn, formatBytes } from '@lib/utils'
import { useFilePreviewStore } from '@lib/stores/ui/file-preview-store'
import { useTheme } from '@lib/hooks'
import type { MessageAttachment } from '@lib/stores/chat-store'; // 导入 MessageAttachment 类型

// 文件内容预览组件
const FileContentViewer: React.FC<{ file: MessageAttachment | null; isDark: boolean }> = ({ file, isDark }) => {
  if (!file) return null;

  // --- 基础预览实现 ---
  const filePreviewUrl = `/api/files/preview/${file.upload_file_id}`; // 假设的预览URL

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={filePreviewUrl} 
          alt={file.name} 
          className="max-w-full h-auto rounded-lg my-4 object-contain" 
        />
      );
    }
    // TODO: 添加对 PDF, 文本等其他类型的预览支持 (e.g., using iframe or specific libraries)
    // else if (file.type === 'application/pdf') { ... }
    // else if (file.type.startsWith('text/')) { ... }
    else {
      return (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          (暂不支持预览此文件类型)
        </p>
      );
    }
  }

  return (
    <div className={cn("p-4 rounded-lg mt-4", isDark ? "bg-gray-700/70" : "bg-gray-100")}>
      <h3 className="text-lg font-semibold mb-2">文件详情</h3>
      <p><strong>名称:</strong> {file.name}</p>
      <p><strong>类型:</strong> {file.type}</p>
      <p><strong>大小:</strong> {formatBytes(file.size)}</p>
      
      {/* 渲染预览内容 */}
      {renderPreview()}

      {/* 可选：添加下载按钮 */} 
      {/* <a 
        href={filePreviewUrl + '?download=true'} // 添加下载参数 
        download={file.name} 
        className="mt-4 inline-block px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
      >
        下载文件
      </a> */}
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

  // 定义与 CSS transition 匹配的动画参数
  const transitionConfig = {
    type: "tween",
    duration: 0.3, // 对应 duration-300
    ease: "easeInOut" // 尝试匹配 ease-in-out, 可选 'linear', 'easeIn', 'easeOut' 等
  };

  return (
    <AnimatePresence>
      {isPreviewOpen && (
        <motion.div
          className={cn(
            "fixed top-0 right-0 h-full w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] z-50 shadow-lg",
            isDark ? "bg-gray-800 text-gray-100 border-l border-gray-700" : "bg-white text-gray-900 border-l border-gray-200"
          )}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          // 使用 tween 动画并匹配 CSS 过渡参数
          transition={transitionConfig}
        >
          <div className="flex flex-col h-full">
            {/* 面板头部 */}
            <div className={cn(
              "flex items-center justify-between p-4 border-b",
              isDark ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className="text-xl font-semibold truncate" title={currentPreviewFile?.name}>
                {currentPreviewFile?.name || '文件预览'}
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
            {/* 面板内容区 */}
            <div className="flex-1 overflow-y-auto p-4">
              <FileContentViewer file={currentPreviewFile} isDark={isDark} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 