'use client';

import { LanguageCard } from '@components/settings';
import {
  SUPPORTED_LANGUAGES,
  SupportedLocale,
  setLanguageCookie,
} from '@lib/config/language-config';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { motion } from 'framer-motion';

import { useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 语言设置页面
// 允许用户选择显示语言，使用卡片形式类似于外观设置
// --- END COMMENT ---
export default function LanguageSettingsPage() {
  const { colors } = useSettingsColors();
  const t = useTranslations('pages.settings.languageSettings');
  const currentLocale = useLocale() as SupportedLocale;
  const [isSaving, setIsSaving] = useState(false);

  // --- BEGIN COMMENT ---
  // 处理语言变更
  // 设置Cookie并刷新页面应用新语言
  // --- END COMMENT ---
  const handleLanguageChange = (newLanguage: SupportedLocale) => {
    setIsSaving(true);

    // 设置语言Cookie
    setLanguageCookie(newLanguage);

    // 模拟保存延迟
    setTimeout(() => {
      setIsSaving(false);
      // 刷新页面以应用新语言
      window.location.reload();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

      <div
        className={`w-full space-y-10 ${colors.cardBackground.tailwind} rounded-lg border ${colors.borderColor.tailwind} p-6`}
      >
        {/* 语言选择 */}
        <section>
          <h2 className="mb-4 font-serif text-lg font-medium">
            {t('language')}
          </h2>
          <p
            className={`${colors.secondaryTextColor.tailwind} mb-6 font-serif`}
          >
            {t('languageDescription')}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.keys(SUPPORTED_LANGUAGES).map(language => (
              <LanguageCard
                key={language}
                language={language as SupportedLocale}
                currentLanguage={currentLocale}
                onClick={() =>
                  handleLanguageChange(language as SupportedLocale)
                }
              />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
