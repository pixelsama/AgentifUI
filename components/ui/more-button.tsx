'use client';

import { useMobile } from '@lib/hooks/use-mobile';
import { useTheme } from '@lib/hooks/use-theme';
import { useDropdownStore } from '@lib/stores/ui/dropdown-store';
import { cn } from '@lib/utils';
import { MoreHorizontal } from 'lucide-react';

import React, { useRef } from 'react';

interface MoreButtonProps {
  id: string;
  className?: string;
  tooltipText?: string;
}

export function MoreButton({
  id,
  className,
  tooltipText = '更多选项',
}: MoreButtonProps) {
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const { toggleDropdown, isOpen, activeDropdownId } = useDropdownStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 判断当前按钮是否处于激活状态
  const isActive = isOpen && activeDropdownId === id;

  const handleClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      toggleDropdown(id, {
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'cursor-pointer rounded-full p-1.5 transition-colors duration-200',
        'focus:outline-none',
        isMobile
          ? 'flex items-center justify-center'
          : 'opacity-0 group-hover:opacity-100',
        // 激活状态时显示
        isActive && 'opacity-100',
        isDark
          ? [
              'text-gray-400 hover:bg-stone-600/60 hover:text-gray-200 active:bg-stone-600/80',
              isActive && 'bg-stone-600/60 text-gray-200',
            ]
          : [
              'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200',
              isActive && 'bg-gray-100 text-gray-700',
            ],
        className
      )}
      onClick={handleClick}
      aria-label={tooltipText}
      title={tooltipText}
      data-more-button-id={id}
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );
}
