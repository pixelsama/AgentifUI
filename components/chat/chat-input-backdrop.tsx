'use client';

import { useChatWidth } from '@lib/hooks';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { cn } from '@lib/utils';

import React from 'react';

interface ChatInputBackdropProps {
  className?: string;
}

export function ChatInputBackdrop({ className }: ChatInputBackdropProps) {
  const { colors } = useThemeColors();
  const { widthClass } = useChatWidth();

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-0 bottom-0 left-0 z-0 mx-auto h-24',
        widthClass, // 使用统一的宽度类
        colors.mainBackground.tailwind, // <-- 始终使用 mainBackground
        className
      )}
      // style={{  <-- 修改点：移除 style
      //   background: colors.mainBackground.rgb
      // }}
    />
  );
}
