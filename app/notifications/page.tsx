'use client';

import { ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { NotificationPage } from '../../components/notification-center/notification-page';
import { Button } from '../../components/ui/button';
import { useMobile } from '../../lib/hooks';
import { useSidebarStore } from '../../lib/stores/sidebar-store';
import { cn } from '../../lib/utils';

/**
 * Full notifications page using the existing NotificationPage component
 * Adapts to sidebar expand/collapse state like chat pages
 */
export default function NotificationsRoute() {
  const router = useRouter();
  const { isExpanded } = useSidebarStore();
  const isMobile = useMobile();

  // Determine sidebar state class for layout adaptation
  const sidebarStateClass = !isMobile
    ? isExpanded
      ? 'sidebar-expanded'
      : 'sidebar-collapsed'
    : '';

  return (
    <div
      className={cn(
        'bg-background min-h-screen',
        'sidebar-aware-layout',
        sidebarStateClass
      )}
    >
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="flex h-20 items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4 h-10 w-10 rounded-full p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 py-8">
        <NotificationPage />
      </div>
    </div>
  );
}
