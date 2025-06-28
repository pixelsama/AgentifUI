'use client';

import { cn } from '@lib/utils';

// 按钮区域组件 - 处理按钮布局
interface ChatButtonAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatButtonArea = ({
  children,
  className,
}: ChatButtonAreaProps) => {
  return (
    <div
      className={cn('flex items-center justify-between px-0 py-2', className)}
    >
      {children}
    </div>
  );
};

// 文本区域组件
interface ChatTextAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatTextArea = ({ children, className }: ChatTextAreaProps) => {
  return <div className={cn('px-4 pt-4 pb-1', className)}>{children}</div>;
};
