'use client';

import {
  SUPPORTED_LANGUAGES,
  SupportedLocale,
  getLanguageInfo,
  setLanguageCookie,
} from '@lib/config/language-config';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 现代化语言切换器组件
// 支持三种变体：floating（首页）、navbar（导航栏）、settings（设置页面）
// 使用真正的 dropdown，参考 sidebar button 的悬停效果
// 所有硬编码文本已国际化
// --- END COMMENT ---

interface LanguageSwitcherProps {
  variant?: 'floating' | 'navbar' | 'settings';
}

export function LanguageSwitcher({
  variant = 'floating',
}: LanguageSwitcherProps) {
  const { isDark } = useTheme();
  const currentLocale = useLocale() as SupportedLocale;
  const t = useTranslations('pages.settings.languageSettings');
  const [isOpen, setIsOpen] = useState(false);

  // --- BEGIN COMMENT ---
  // 实际的语言切换逻辑：设置 Cookie 并刷新页面
  // --- END COMMENT ---
  const handleLanguageChange = async (locale: SupportedLocale) => {
    // 设置 Cookie
    setLanguageCookie(locale);

    // 关闭下拉菜单
    setIsOpen(false);

    // 刷新页面以应用新语言
    window.location.reload();
  };

  // --- BEGIN COMMENT ---
  // 点击外部区域关闭下拉菜单
  // --- END COMMENT ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-switcher]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // --- BEGIN COMMENT ---
  // 根据主题获取按钮样式：参考 sidebar button 的悬停效果
  // --- END COMMENT ---
  const getButtonColors = () => {
    if (isDark) {
      return 'bg-stone-800/50 hover:bg-stone-600/60 text-gray-200 border-stone-600/30';
    }
    return 'bg-stone-200/50 hover:bg-stone-300/80 text-stone-600 border-stone-400/30';
  };

  // --- BEGIN COMMENT ---
  // 获取下拉菜单的样式
  // --- END COMMENT ---
  const getDropdownColors = () => {
    if (isDark) {
      return 'bg-stone-900/95 border-stone-600/30 text-gray-200';
    }
    return 'bg-white/95 border-stone-400/30 text-stone-600';
  };

  // --- BEGIN COMMENT ---
  // 获取选中指示器的颜色 - 使用stone风格的primary色彩
  // --- END COMMENT ---
  const getIndicatorColor = () => {
    if (isDark) {
      return 'bg-stone-300';
    }
    return 'bg-stone-700';
  };

  // --- BEGIN COMMENT ---
  // 获取当前语言信息
  // --- END COMMENT ---
  const currentLanguageInfo = getLanguageInfo(currentLocale);

  // --- BEGIN COMMENT ---
  // settings变体：用于设置页面，与theme-card类似的样式
  // --- END COMMENT ---
  if (variant === 'settings') {
    return (
      <div className="relative" data-language-switcher>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md',
            isOpen
              ? 'border-primary ring-primary/20 ring-2'
              : isDark
                ? 'border-stone-700'
                : 'border-stone-200'
          )}
        >
          {/* 语言预览区域 */}
          <div className="mb-4 flex h-24 items-center justify-center rounded-md bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30">
            <div className="flex items-center gap-3">
              <span className="font-serif text-lg font-medium text-gray-900 dark:text-gray-100">
                {currentLanguageInfo.nativeName}
              </span>
            </div>
          </div>

          {/* 语言名称 */}
          <p
            className={cn(
              'text-center font-serif text-sm font-medium',
              isOpen
                ? 'text-primary'
                : isDark
                  ? 'text-stone-200'
                  : 'text-stone-900'
            )}
          >
            {t('currentLanguage')}
          </p>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border backdrop-blur-sm',
                'shadow-lg',
                getDropdownColors()
              )}
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([locale, info]) => (
                <button
                  key={locale}
                  onClick={() =>
                    handleLanguageChange(locale as SupportedLocale)
                  }
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left',
                    'hover:bg-stone-100/50 dark:hover:bg-stone-700/50',
                    'font-serif transition-colors duration-150',
                    'first:rounded-t-lg last:rounded-b-lg',
                    currentLocale === locale &&
                      'bg-stone-100/70 dark:bg-stone-700/70'
                  )}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{info.nativeName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {info.name}
                    </div>
                  </div>
                  {currentLocale === locale && (
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        getIndicatorColor()
                      )}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- BEGIN COMMENT ---
  // floating变体：用于首页，带有动画效果
  // --- END COMMENT ---
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="relative"
        data-language-switcher
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 backdrop-blur-sm',
            'h-10 cursor-pointer font-serif transition-colors duration-200',
            'shadow-sm hover:shadow-md',
            getButtonColors()
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden text-sm font-medium sm:inline">
            {currentLanguageInfo.nativeName}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute top-full right-0 z-50 mt-2 w-36 rounded-lg border backdrop-blur-sm',
                'shadow-lg',
                getDropdownColors()
              )}
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([locale, info]) => (
                <button
                  key={locale}
                  onClick={() =>
                    handleLanguageChange(locale as SupportedLocale)
                  }
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left',
                    'hover:bg-stone-100/50 dark:hover:bg-stone-700/50',
                    'font-serif transition-colors duration-150',
                    'first:rounded-t-lg last:rounded-b-lg',
                    currentLocale === locale &&
                      'bg-stone-100/70 dark:bg-stone-700/70'
                  )}
                >
                  <span className="text-sm font-medium">{info.nativeName}</span>
                  {currentLocale === locale && (
                    <div
                      className={cn(
                        'ml-auto h-2 w-2 rounded-full',
                        getIndicatorColor()
                      )}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // --- BEGIN COMMENT ---
  // navbar变体：用于导航栏，更紧凑的设计
  // --- END COMMENT ---
  return (
    <div className="relative" data-language-switcher>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-md border px-3 py-1.5',
          'h-10 cursor-pointer font-serif transition-colors duration-200',
          'shadow-sm hover:shadow-md',
          getButtonColors()
        )}
      >
        <span className="hidden text-sm font-medium md:inline">
          {currentLanguageInfo.nativeName}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full right-0 z-50 mt-2 w-32 rounded-lg border backdrop-blur-sm',
              'shadow-lg',
              getDropdownColors()
            )}
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([locale, info]) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale as SupportedLocale)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left',
                  'hover:bg-stone-100/50 dark:hover:bg-stone-700/50',
                  'font-serif transition-colors duration-150',
                  'first:rounded-t-lg last:rounded-b-lg',
                  currentLocale === locale &&
                    'bg-stone-100/70 dark:bg-stone-700/70'
                )}
              >
                <span className="text-sm font-medium">{info.nativeName}</span>
                {currentLocale === locale && (
                  <div
                    className={cn(
                      'ml-auto h-1.5 w-1.5 rounded-full',
                      getIndicatorColor()
                    )}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
