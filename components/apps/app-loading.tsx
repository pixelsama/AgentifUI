'use client';

import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { cn } from '@lib/utils';

import { useTranslations } from 'next-intl';

export function AppLoading() {
  const { colors, isDark } = useThemeColors();
  const t = useTranslations('loading');

  return (
    <div className={cn('min-h-screen', colors.mainBackground.tailwind)}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-stone-600"></div>
          <span
            className={cn(
              'ml-3 font-serif',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            {t('appList')}
          </span>
        </div>
      </div>
    </div>
  );
}
