'use client';

import { ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { NotificationPage } from '../../components/notification-center/notification-page';
import { Button } from '../../components/ui/button';

/**
 * Full notifications page using the existing NotificationPage component
 */
export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <NotificationPage />
      </div>
    </div>
  );
}
