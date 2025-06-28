'use client';

import { SupportedLocale, getLanguageInfo } from '@lib/config/language-config';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import { useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 语言卡片组件
// 用于在设置页面中展示和选择不同的语言选项
// --- END COMMENT ---
interface LanguageCardProps {
  language: SupportedLocale;
  currentLanguage: SupportedLocale;
  onClick: () => void;
}

export function LanguageCard({
  language,
  currentLanguage,
  onClick,
}: LanguageCardProps) {
  const { isDark } = useTheme();
  const isActive = currentLanguage === language;
  const languageInfo = getLanguageInfo(language);

  // 渲染语言预览内容
  const renderPreview = () => {
    return (
      <div
        className={cn(
          'mb-4 flex h-24 items-center justify-center rounded-md',
          isDark
            ? 'border border-stone-700 bg-gradient-to-r from-blue-900/30 to-green-900/30'
            : 'border border-stone-200 bg-gradient-to-r from-blue-100 to-green-100'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div
              className={cn(
                'font-serif text-lg font-medium',
                isDark ? 'text-gray-100' : 'text-gray-900'
              )}
            >
              {languageInfo.nativeName}
            </div>
            <div
              className={cn(
                'font-serif text-sm',
                isDark ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              {languageInfo.name}
            </div>
          </div>
        </div>
      </div>
    );
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
        {languageInfo.nativeName}
      </p>
    </div>
  );
}
