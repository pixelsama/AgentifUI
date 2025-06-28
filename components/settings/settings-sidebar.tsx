'use client';

import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { cn } from '@lib/utils';
import { Globe, KeyRound, Palette, Shield, Sliders, User } from 'lucide-react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- BEGIN COMMENT ---
// 定义设置选项，包括图标、标题和路径
// 标题将通过翻译动态获取
// --- END COMMENT ---
export const getSettingsNavItems = (t: any) => [
  {
    title: t('navigation.overview'),
    href: '/settings',
    icon: Sliders,
  },
  {
    title: t('navigation.profileNav'),
    href: '/settings/profile',
    icon: User,
  },
  {
    title: t('navigation.accountNav'),
    href: '/settings/account',
    icon: KeyRound,
  },
  {
    title: t('navigation.appearanceNav'),
    href: '/settings/appearance',
    icon: Palette,
  },
  {
    title: t('navigation.languageNav'),
    href: '/settings/language',
    icon: Globe,
  },
];

// --- BEGIN COMMENT ---
// 静态导出已移除，统一使用 getSettingsNavItems(t) 获取国际化导航项
// 如需在其他文件中使用，请导入翻译hooks并调用 getSettingsNavItems(t)
// --- END COMMENT ---

export function SettingsSidebar() {
  const pathname = usePathname();
  const { colors } = useSettingsColors();
  const t = useTranslations('pages.settings');

  return (
    <div className="h-full">
      <div className="py-6">
        <div className="mb-6 px-4">
          <h2 className="font-serif text-xl font-semibold">{t('title')}</h2>
        </div>
        <nav className="space-y-1 px-2">
          {getSettingsNavItems(t).map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'mx-2 flex items-center rounded-lg px-3 py-2.5',
                  'transition-colors duration-200',
                  isActive
                    ? `${colors.sidebarItemActive.tailwind} font-medium`
                    : colors.sidebarItemHover.tailwind
                )}
              >
                <span className="mr-3 flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-serif text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
