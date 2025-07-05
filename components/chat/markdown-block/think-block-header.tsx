'use client';

import { Spinner } from '@components/ui/spinner';
// 移除 useTheme 和 useThemeColors 的导入，使用 CSS 变量替代
import { useMobile } from '@lib/hooks/use-mobile';
// Removed react-i18next import
// import { useTranslation } from 'react-i18next';
import { cn } from '@lib/utils';

import React from 'react';

/** Think block status types */
export type ThinkBlockStatus = 'thinking' | 'completed' | 'stopped';

/**
 * ThinkBlock header component properties
 */
interface ThinkBlockHeaderProps {
  /** Current thinking status */
  status: ThinkBlockStatus;
  /** Whether content area is expanded */
  isOpen: boolean;
  /** Callback function triggered on click */
  onToggle: () => void;
  //
  // statusText: { ... };
}

/**
 * ThinkBlock horizontal button-style header component
 * @description Displays expand/collapse icon, status text and loading spinner
 */
export const ThinkBlockHeader: React.FC<ThinkBlockHeaderProps> = ({
  //
  status,
  isOpen,
  onToggle,
}) => {
  //
  // const { t } = useTranslation();
  // 移除 useTheme 和 useThemeColors，使用 CSS 变量替代
  const isMobile = useMobile();

  /** Check if currently thinking */
  const isThinking = status === 'thinking';

  /** Get status text based on current status */
  const getStatusText = () => {
    switch (status) {
      case 'thinking':
        return '正在深度思考';
      case 'stopped':
        return '思考已停止';
      case 'completed':
      default:
        return '已深度思考';
    }
  };

  return (
    <button
      className={cn(
        // Base layout: flex, center vertically, space between
        'flex items-center justify-between',
        // Size and style: full width on mobile, 22% on desktop
        isMobile ? 'w-full' : 'w-[22%]',
        'mb-1 cursor-pointer rounded-md border px-3 py-1.5 text-sm',
        // Focus style and transition effects
        'focus:outline-none'
      )}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="think-block-content"
      style={{
        backgroundColor: isThinking
          ? 'var(--md-think-thinking-bg)'
          : 'var(--md-think-header-bg)',
        borderColor: isThinking
          ? 'var(--md-think-thinking-border)'
          : 'var(--md-think-header-border)',
        color: isThinking
          ? 'var(--md-think-thinking-text)'
          : 'var(--md-think-header-text)',
      }}
    >
      {/* Left area: icon and status text */}
      <div className="flex items-center">
        {/* Expand/collapse icon */}
        <svg
          className={cn('mr-2 h-4 w-4', isOpen ? 'rotate-90' : 'rotate-0')}
          style={{
            color: isThinking
              ? 'var(--md-think-thinking-icon)'
              : 'var(--md-think-header-icon)',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {/* Status text */}
        <span
          className={cn('font-medium whitespace-nowrap')}
          style={{
            color: isThinking
              ? 'var(--md-think-thinking-text)'
              : 'var(--md-think-header-text)',
          }}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Right area: Spinner (only shown when thinking) */}
      <div className="h-4 w-4 flex-shrink-0">
        {isThinking && <Spinner size="md" className="text-current" />}
      </div>
    </button>
  );
};
