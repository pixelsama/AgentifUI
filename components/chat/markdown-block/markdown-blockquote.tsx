'use client';

import { cn } from '@lib/utils';

import React from 'react';

// 使用 CSS 变量而不是 React 状态或 Tailwind 类

interface MarkdownBlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export const MarkdownBlockquote: React.FC<MarkdownBlockquoteProps> = ({
  children,
  className,
}) => {
  // 不使用任何 React 状态，完全依赖 CSS 变量

  // 现代化引用块样式：
  // - 调整 padding、margin、左边框和圆角。
  // - 使用柔和的背景色和清晰的文字颜色，确保对比度和美观。
  // - 响应式设计，确保在不同屏幕尺寸和主题下均表现良好。
  // - 暗黑模式兼容。
  return (
    <blockquote
      className={cn(
        'my-3 rounded-r-md border-l-4 py-2 pr-3 pl-4 leading-relaxed shadow-sm', // Added shadow and adjusted padding/margin
        className
      )}
      style={{
        borderLeftColor: 'var(--md-blockquote-border)',
        backgroundColor: 'var(--md-blockquote-bg)',
        color: 'var(--md-blockquote-text)',
      }}
    >
      {children}
    </blockquote>
  );
};
