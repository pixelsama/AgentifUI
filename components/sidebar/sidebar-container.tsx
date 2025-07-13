'use client';

import { useMobile } from '@lib/hooks';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

import { useEffect, useState } from 'react';

import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';

export function SidebarContainer() {
  const {
    isExpanded,
    toggleSidebar,
    isMounted,
    getSidebarWidth,
    isAnimating,
    hideMobileNav,
  } = useSidebarStore();
  const { colors, isDark } = useThemeColors();
  const isMobile = useMobile();

  // Hover state management - for background effects only, does not trigger expansion
  const [isHovering, setIsHovering] = useState(false);

  // Disable hover events on mobile and ensure cursor state is reset correctly
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
      // Ensure any residual focus state is removed
      const activeElement = document.activeElement as HTMLElement;
      activeElement?.blur?.();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
      // Ensure any residual focus state is removed
      const activeElement = document.activeElement as HTMLElement;
      activeElement?.blur?.();
    }
  };

  // Combined click handler for the entire sidebar
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Mobile-specific logic: close sidebar on nav button click
    if (isMobile) {
      if (target.closest('[data-nav-button="true"]')) {
        hideMobileNav();
      }
      // On mobile, we don't want the desktop expand/collapse logic, so we stop here.
      return;
    }

    // Desktop-specific logic: expand sidebar on clicking non-interactive areas
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-dropdown-trigger]') ||
      target.closest('[data-more-button]')
    ) {
      return;
    }

    if (!isExpanded) {
      toggleSidebar();
    }
  };

  // Get sidebar styles based on the theme
  const getSidebarStyles = () => {
    if (isDark) {
      return {
        border: 'border-r-stone-700/50',
        text: 'text-stone-300',
        hoverBg: 'hover:bg-stone-700', // Use expanded state background color on hover
      };
    } else {
      return {
        border: 'border-r-stone-300/60',
        text: 'text-stone-700',
        hoverBg: 'hover:bg-stone-200', // Use expanded state background color on hover
      };
    }
  };

  const styles = getSidebarStyles();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 flex h-full flex-col border-r',
        // Transition effect - use transform for mobile, width for desktop, faster speed
        isMobile
          ? 'transition-transform duration-150 ease-in-out'
          : 'transition-[width,background-color] duration-150 ease-in-out',

        // Width setting - always maintain a fixed width
        isExpanded ? 'w-64' : 'w-16',

        // Mobile show/hide logic
        isMobile && !isExpanded && '-translate-x-full',
        isMobile && isExpanded && 'translate-x-0',

        // Desktop is always visible
        !isMobile && 'translate-x-0',

        // Simplified Z-index setting
        isMobile ? 'z-50' : 'z-30',

        // Theme styles - use sidebar background when expanded, main background when collapsed
        isExpanded
          ? colors.sidebarBackground.tailwind
          : colors.mainBackground.tailwind,
        'backdrop-blur-sm',
        styles.border,
        styles.text,

        // Hover background effect - only on collapsed state and non-mobile, uses expanded state color
        !isExpanded && !isMobile && styles.hoverBg,

        // Click area hint - show cursor-e-resize only in collapsed state to indicate it can be expanded
        // Prevent text selection on click
        // Maintain cursor state during animation to avoid flickering
        'select-none',
        (!isExpanded && !isMobile) || (isAnimating && !isMobile)
          ? 'cursor-e-resize'
          : ''
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
    >
      <div className="flex h-full flex-col">
        <SidebarHeader isHovering={isHovering} />
        <SidebarContent />
        <SidebarFooter />
      </div>
    </aside>
  );
}
