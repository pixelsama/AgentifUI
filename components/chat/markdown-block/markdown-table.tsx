'use client';

import { cn } from '@lib/utils';

import React from 'react';

// Uses CSS variables instead of useThemeColors hook for better performance
// import { useThemeColors } from "@lib/hooks/use-theme-colors";

/**
 * Markdown table container component properties
 */
interface MarkdownTableProps {
  /** Table content to render */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Markdown table container component
 * @description Renders a responsive table container with proper styling for markdown content
 *
 * @features
 * - Responsive horizontal scrolling
 * - CSS variable-based theming
 * - Rounded corners with overflow handling
 * - Adaptive width sizing
 */
export const MarkdownTableContainer: React.FC<MarkdownTableProps> = ({
  children,
  className,
}) => {
  // Removed useThemeColors hook usage for better performance
  // const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        'my-4 overflow-x-auto',
        'w-fit max-w-full', // Container width adapts to content while respecting available space
        className
      )}
    >
      <table
        className={cn(
          'border-collapse',
          'overflow-hidden rounded-lg' // Rounded corners with overflow hidden
          // Background is transparent, determined by parent element
          // Internal borders handled by child elements
          // External border applied via CSS variables in style prop
        )}
        style={{
          // Table border using CSS variables for theme consistency
          border: '1px solid var(--md-table-border)',
        }}
      >
        {children}
      </table>
    </div>
  );
};
