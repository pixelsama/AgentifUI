'use client';

import { useFilePreviewStore } from '@lib/stores/ui/file-preview-store';
import { cn } from '@lib/utils';

// 文件预览面板的背景遮罩组件
// 仅在移动设备 (md 断点以下) 显示，并在预览打开时出现
// 点击遮罩会调用 closePreview 关闭面板
export function FilePreviewBackdrop() {
  const { isPreviewOpen, closePreview } = useFilePreviewStore();

  return (
    <div
      className={cn(
        // 基础样式: 固定定位, 覆盖全屏, 背景模糊, 层级低于面板
        'bg-background/70 fixed inset-0 z-40 backdrop-blur-sm',
        // 过渡效果
        'transition-opacity duration-300 ease-in-out',
        // 响应式: 仅在 md 断点以下显示
        'md:hidden',
        // 可见性: 根据 isPreviewOpen 控制透明度和交互
        isPreviewOpen
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      )}
      // 点击事件: 调用 closePreview
      onClick={closePreview}
      aria-hidden="true"
    />
  );
}
