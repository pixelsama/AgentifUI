'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import { useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 主题卡片组件
// 用于在设置页面中展示和选择不同的主题选项
// --- END COMMENT ---
interface ThemeCardProps {
  title: string;
  theme: 'light' | 'dark' | 'system';
  currentTheme: string;
  onClick: () => void;
}

export function ThemeCard({
  title,
  theme,
  currentTheme,
  onClick,
}: ThemeCardProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.settings.appearanceSettings.preview');
  const isActive = currentTheme === theme;

  // 根据主题类型渲染不同的预览内容
  const renderPreview = () => {
    switch (theme) {
      case 'light':
        return (
          <div className="mb-4 flex h-24 items-center justify-center rounded-md border border-stone-200 bg-stone-100">
            <span className="font-serif text-stone-900">{t('light')}</span>
          </div>
        );
      case 'dark':
        return (
          <div className="mb-4 flex h-24 items-center justify-center rounded-md border border-stone-700 bg-stone-800">
            <span className="font-serif text-stone-100">{t('dark')}</span>
          </div>
        );
      case 'system':
        return (
          <div className="mb-4 flex h-24 items-center justify-center rounded-md bg-gradient-to-r from-stone-100 to-stone-800">
            <span className="rounded bg-white px-2 font-serif text-stone-900">
              {t('system')}
            </span>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md',
        isActive
          ? 'border-primary ring-primary/20 ring-2'
          : isDark
            ? 'border-stone-700'
            : 'border-stone-200'
      )}
    >
      {renderPreview()}
      <p
        className={cn(
          'text-center font-serif text-sm font-medium',
          isActive
            ? 'text-primary'
            : isDark
              ? 'text-stone-200'
              : 'text-stone-900'
        )}
      >
        {title}
      </p>
    </div>
  );
}
