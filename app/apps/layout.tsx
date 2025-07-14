'use client';

import { MobileNavButton } from '@components/mobile';
import { useMobile } from '@lib/hooks';
import { useTheme } from '@lib/hooks/use-theme';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

interface AppsLayoutProps {
  children: React.ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  const { isExpanded, isMounted } = useSidebarStore();
  const isMobile = useMobile();
  const { isDark } = useTheme();

  // remove duplicate setMounted calls, now managed by global ClientLayout
  // calculate the left margin of the main content area
  // set the margin based on the sidebar expansion state, push the main content
  const getMainMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return isExpanded ? 'ml-64' : 'ml-16';
  };

  return (
    <div
      className={cn(
        'flex h-full min-h-screen',
        isDark ? 'bg-stone-800' : 'bg-stone-100'
      )}
    >
      {/* mobile navigation button - only display after client mount */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        {isMounted && <MobileNavButton />}
      </div>

      {/* main content area - app market page */}
      <main
        className={cn(
          'h-screen w-full overflow-auto', // use w-full instead of flex-1
          getMainMarginLeft(),
          // transition effect
          'transition-[margin-left] duration-150 ease-in-out'
        )}
      >
        <div className="h-full p-0">{children}</div>
      </main>
    </div>
  );
}
