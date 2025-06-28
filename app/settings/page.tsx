'use client';

import { getSettingsNavItems } from '@components/settings/settings-sidebar';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { Palette, Settings, User } from 'lucide-react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

// --- BEGIN COMMENT ---
// 设置页面入口
// 展示所有可用的设置选项，并提供导航链接
// --- END COMMENT ---
export default function SettingsPage() {
  const { colors } = useSettingsColors();
  const t = useTranslations('pages.settings');

  // --- BEGIN COMMENT ---
  // 设置项描述，为每个设置页面提供说明文本
  // --- END COMMENT ---
  const settingsDescriptions: Record<string, string> = {
    '/settings': t('descriptions.overview'),
    '/settings/profile': t('descriptions.profileDesc'),
    '/settings/account': t('descriptions.accountDesc'),
    '/settings/appearance': t('descriptions.appearanceDesc'),
    '/settings/language': t('descriptions.languageDesc'),
  };

  // 过滤掉当前页面（概览）
  const navItems = getSettingsNavItems(t);
  const filteredItems = navItems.filter(item => item.href !== '/settings');

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

        <p className={`${colors.secondaryTextColor.tailwind} mb-8 font-serif`}>
          {t('descriptions.overview')}
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredItems.map(item => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-start rounded-lg border p-4',
                  colors.borderColor.tailwind,
                  'transition-all duration-200',
                  'hover:-translate-y-1 hover:shadow-md',
                  colors.cardBackground.tailwind
                )}
              >
                <div className="mt-1 mr-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-serif font-medium">{item.title}</h3>
                  <p
                    className={`text-sm ${colors.secondaryTextColor.tailwind} font-serif`}
                  >
                    {settingsDescriptions[item.href] || ''}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
