'use client';

import { SupportedLocale, getLanguageInfo } from '@lib/config/language-config';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Check, Globe2 } from 'lucide-react';

// 语言卡片组件 - 现代化设计
// 用于在设置页面中展示和选择不同的语言选项
// 采用简洁现代的设计，突出语言特色
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

  // 获取语言的特色文字示例
  const getLanguageExample = (lang: SupportedLocale) => {
    switch (lang) {
      case 'zh-CN':
        return '简体中文';
      case 'zh-TW':
        return '繁體中文';
      case 'en-US':
        return 'English';
      case 'ja-JP':
        return '日本語';
      case 'es-ES':
        return 'Español';
      default:
        return languageInfo.nativeName;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        isActive
          ? // 选中状态 - 石色风格
            isDark
            ? 'border-stone-400 bg-stone-800/50 shadow-md ring-2 ring-stone-400/30'
            : 'border-stone-600 bg-stone-50 shadow-md ring-2 ring-stone-600/20'
          : // 未选中状态
            isDark
            ? 'border-stone-700 bg-stone-900/30 hover:border-stone-600 hover:bg-stone-800/50'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
      )}
    >
      {/* 选中状态指示器 */}
      {isActive && (
        <div className="absolute top-3 right-3">
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full',
              isDark ? 'bg-stone-400 text-stone-900' : 'bg-stone-600 text-white'
            )}
          >
            <Check className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* 语言内容 */}
      <div className="flex items-start space-x-3">
        {/* 语言图标 */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isActive
              ? isDark
                ? 'bg-stone-700 text-stone-300'
                : 'bg-stone-200 text-stone-700'
              : isDark
                ? 'bg-stone-800 text-stone-400'
                : 'bg-stone-100 text-stone-600'
          )}
        >
          <Globe2 className="h-5 w-5" />
        </div>

        {/* 语言信息 */}
        <div className="min-w-0 flex-1">
          {/* 原生语言名 */}
          <h3
            className={cn(
              'font-serif text-base leading-tight font-semibold',
              isActive
                ? isDark
                  ? 'text-stone-100'
                  : 'text-stone-900'
                : isDark
                  ? 'text-stone-200'
                  : 'text-stone-800'
            )}
          >
            {getLanguageExample(language)}
          </h3>

          {/* 英文名 */}
          <p
            className={cn(
              'mt-0.5 font-serif text-sm',
              isActive
                ? isDark
                  ? 'text-stone-300'
                  : 'text-stone-600'
                : isDark
                  ? 'text-stone-400'
                  : 'text-stone-500'
            )}
          >
            {languageInfo.name}
          </p>
        </div>
      </div>
    </div>
  );
}
