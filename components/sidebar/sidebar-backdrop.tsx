'use client';

import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

export function SidebarBackdrop() {
  const { isExpanded, isMobileNavVisible, hideMobileNav } = useSidebarStore();

  return (
    <div
      className={cn(
        'fixed inset-0 z-10 bg-black/20 backdrop-blur-sm',
        'transition-opacity duration-300 ease-in-out',
        'md:hidden', // 仅在移动设备上显示
        isExpanded
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      )}
      onClick={() => hideMobileNav()}
      aria-hidden="true"
    />
  );
}
