'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import React from 'react';

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        'flex min-h-[50vh] w-full flex-col items-center justify-center',
        className
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* 加载动画 */}
        <div className="mb-4 h-16 w-16">
          <svg
            className="text-primary h-full w-full animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* 加载文本 */}
        <div className="text-center">
          <h3
            className={cn(
              'text-lg font-medium',
              isDark ? 'text-gray-100' : 'text-gray-900'
            )}
          >
            正在加载
          </h3>
          <p
            className={cn(
              'mt-1 text-sm',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            请稍候，正在获取数据...
          </p>
        </div>
      </div>
    </div>
  );
}

// 骨架屏组件
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

// 资料页面骨架屏
export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      <Skeleton className="mb-6 h-8 w-1/3" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="mt-6 h-10 w-full" />
      </div>
    </div>
  );
}

// 聊天页面骨架屏
export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
