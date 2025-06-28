'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import React from 'react';

// --- 中文注释: 定义 TypingDots 组件的属性接口 ---
interface TypingDotsProps {
  // --- 中文注释: 可选的 CSS 类名 ---
  className?: string;
  // --- 中文注释: 可选的尺寸，默认为 'md' ---
  size?: 'sm' | 'md' | 'lg';
}

// --- 中文注释: 定义不同尺寸对应的 Tailwind 类 ---
const sizeClasses = {
  sm: {
    container: 'space-x-0.5', // 点之间的间距
    dot: 'h-1 w-1', // 点的大小
  },
  md: {
    container: 'space-x-1',
    dot: 'h-1.5 w-1.5',
  },
  lg: {
    container: 'space-x-1.5',
    dot: 'h-2 w-2',
  },
};

/**
 * TypingDots 组件
 * 显示一个带有动画效果的加载指示器，模拟打字状态。
 * 支持 sm, md, lg 三种尺寸。
 */
export function TypingDots({ className, size = 'md' }: TypingDotsProps) {
  const { isDark } = useTheme();

  // --- 中文注释: 根据传入的 size 获取对应的样式类 ---
  const currentSizeClasses = sizeClasses[size];

  return (
    // --- 中文注释: 容器 div，应用尺寸对应的间距和传入的 className ---
    <div
      className={cn(
        'flex items-center',
        currentSizeClasses.container,
        className
      )}
    >
      {[0, 1, 2].map(i => (
        // --- 中文注释: 单个的点 ---
        <div
          key={i}
          className={cn(
            // --- 中文注释: 基础样式：圆点 ---
            'rounded-full',
            // --- 中文注释: 尺寸样式 ---
            currentSizeClasses.dot,
            // --- 中文注释: 颜色根据主题变化 ---
            isDark ? 'bg-gray-400' : 'bg-gray-700',
            // --- 中文注释: 应用 pulse 动画 ---
            'animate-pulse'
            // --- 中文注释: 应用不同的动画延迟，实现交错效果 (Tailwind 类方式) ---
            // {
            //   "animation-delay-0": i === 0,
            //   "animation-delay-200": i === 1,
            //   "animation-delay-400": i === 2,
            // }
          )}
          // --- 中文注释: 应用不同的动画延迟 (行内样式方式，更可靠) ---
          style={{
            animationDelay: `${i * 200}ms`,
          }}
        />
      ))}
    </div>
  );
}

// 添加全局CSS (需在app/globals.css中添加)
// @keyframes pulse {
//   0%, 100% {
//     opacity: 0.5;
//     transform: scale(0.8);
//   }
//   50% {
//     opacity: 1;
//     transform: scale(1);
//   }
// }
//
// .animate-pulse {
//   animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }
//
// .animation-delay-0 {
//   animation-delay: 0ms;
// }
//
// .animation-delay-200 {
//   animation-delay: 200ms;
// }
//
// .animation-delay-400 {
//   animation-delay: 400ms;
// }
