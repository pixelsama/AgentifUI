'use client';

import { useTheme } from '@lib/hooks';
import type { MessageAttachment } from '@lib/stores/chat-store';
import { useFilePreviewStore } from '@lib/stores/ui/file-preview-store';
import { cn, formatBytes } from '@lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

import React from 'react';

import { FilePreviewBackdrop } from './file-preview-backdrop';

// 简化版：文件内容预览组件 - 只显示基础信息
const FileContentViewer: React.FC<{
  file: MessageAttachment | null;
  isDark: boolean;
}> = ({ file, isDark }) => {
  if (!file) return null;

  return (
    // 保留外层容器用于可能的样式调整
    <div>
      <h3 className="mb-4 text-lg font-semibold">文件信息</h3>
      <div
        className={cn(
          'space-y-1 text-sm',
          isDark ? 'text-stone-300' : 'text-stone-700'
        )}
      >
        <p>
          <strong>名称:</strong> {file.name}
        </p>
        <p>
          <strong>类型:</strong> {file.type}
        </p>
        <p>
          <strong>大小:</strong> {formatBytes(file.size)}
        </p>
      </div>
      <p
        className={cn(
          'mt-6 text-xs',
          isDark ? 'text-stone-400' : 'text-stone-500'
        )}
      >
        (文件内容预览功能暂不可用)
      </p>
    </div>
  );
};

export const FilePreviewCanvas = () => {
  const { isPreviewOpen, currentPreviewFile, closePreview } =
    useFilePreviewStore();
  const { isDark } = useTheme();

  const panelVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  // 加快动画速度：减少 duration
  const transitionConfig = {
    type: 'tween',
    duration: 0.2, // 从 0.3 减小到 0.2
    ease: 'easeInOut',
  };

  return (
    <>
      <FilePreviewBackdrop />

      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            className={cn(
              'fixed top-0 right-0 z-50 h-full',
              'flex flex-col',
              'w-[85%] md:w-[60%] lg:w-[50%] xl:w-[40%]',
              isDark
                ? 'border-l border-stone-700 bg-stone-800 text-stone-100'
                : 'border-l border-stone-200 bg-white text-stone-900'
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitionConfig}
          >
            <div
              className={cn(
                'flex flex-shrink-0 items-center justify-between border-b p-4',
                isDark ? 'border-stone-700' : 'border-stone-200'
              )}
            >
              <h2
                className="truncate text-xl font-semibold"
                title={currentPreviewFile?.name || '文件信息'}
              >
                {currentPreviewFile?.name || '文件信息'}
              </h2>
              <button
                onClick={closePreview}
                className={cn(
                  'rounded-full p-1',
                  isDark
                    ? 'text-stone-300 hover:bg-stone-700 hover:text-stone-200'
                    : 'text-stone-600 hover:bg-stone-200 hover:text-stone-800'
                )}
                aria-label="关闭预览"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FileContentViewer
                file={currentPreviewFile}
                isDark={isDark ?? false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
