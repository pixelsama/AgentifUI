'use client';

import { useMobile, useTheme } from '@lib/hooks';
import { cn } from '@lib/utils';

import React from 'react';

interface MessageActionsContainerProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  isAssistantMessage?: boolean;
}

export const MessageActionsContainer: React.FC<
  MessageActionsContainerProps
> = ({ children, className, align = 'left', isAssistantMessage = false }) => {
  const { isDark } = useTheme();
  const isMobile = useMobile();

  return (
    <div
      className={cn(
        'mt-1 flex flex-wrap gap-1 transition-opacity',
        'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
        isMobile ? 'opacity-100' : '', // 移动设备上始终可见
        {
          'justify-start': align === 'left',
          'justify-end': align === 'right',
          'justify-center': align === 'center',
        },
        // 助手消息和用户消息的不同样式（仅添加底部内边距，不添加左侧内边距，确保与消息左侧对齐）
        isAssistantMessage ? 'py-1 pr-2 pl-0' : '',
        className
      )}
    >
      {children}
    </div>
  );
};
