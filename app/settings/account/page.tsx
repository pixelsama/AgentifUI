'use client';

import { AccountSettings } from '@components/settings/account-settings';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { useTheme } from '@lib/hooks/use-theme';
import { createClient } from '@lib/supabase/client';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { LogOut, Shield } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

// --- BEGIN COMMENT ---
// 账号设置页面
// 显示用户账号信息并提供账号相关功能
// --- END COMMENT ---
export default function AccountSettingsPage() {
  const { colors } = useSettingsColors();
  const { isDark } = useTheme();
  const t = useTranslations('pages.settings.accountSettings');
  const tCommon = useTranslations('common.ui');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authSource, setAuthSource] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // --- BEGIN COMMENT ---
  // 加载用户账号数据
  // --- END COMMENT ---
  useEffect(() => {
    async function loadUserAccount() {
      try {
        setIsLoading(true);
        setError(null);

        // 检查用户是否已登录
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 获取用户邮箱和认证来源
        setUserEmail(user.email || null);
        setAuthSource(user.app_metadata?.provider || t('emailPasswordAuth'));
      } catch (err) {
        console.error('加载用户账号信息失败:', err);
        setError(err instanceof Error ? err : new Error(t('loadAccountError')));
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAccount();
  }, [router, supabase.auth, t]);

  // 处理错误情况
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

        <div
          className={cn(
            'mb-6 rounded-lg p-6',
            isDark
              ? 'border border-red-800 bg-red-900/20 text-red-300'
              : 'border border-red-200 bg-red-50 text-red-700'
          )}
        >
          <h2
            className={cn(
              'mb-4 font-serif text-lg font-medium',
              isDark ? 'text-red-200' : 'text-red-800'
            )}
          >
            {t('loadAccountError')}
          </h2>
          <p className="mb-4 font-serif">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'rounded-md px-4 py-2 font-serif transition-colors',
              isDark
                ? 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            )}
          >
            {t('retry')}
          </button>
        </div>
      </motion.div>
    );
  }

  // 加载状态 - 使用骨架屏
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

        <div
          className={cn(
            'w-full rounded-lg',
            'border',
            colors.borderColor.tailwind,
            colors.cardBackground.tailwind,
            'mb-8 p-6'
          )}
        >
          <div
            className={cn(
              'mb-6 h-6 w-32',
              colors.skeletonBackground.tailwind,
              'animate-pulse rounded-md'
            )}
          ></div>

          <div className="space-y-6">
            {[1, 2].map(item => (
              <div key={item} className="flex items-center">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full',
                    colors.skeletonBackground.tailwind,
                    'animate-pulse'
                  )}
                ></div>
                <div className="ml-4">
                  <div
                    className={cn(
                      'h-3 w-16',
                      colors.skeletonBackground.tailwind,
                      'animate-pulse rounded-md'
                    )}
                  ></div>
                  <div
                    className={cn(
                      'mt-1 h-4 w-32',
                      colors.skeletonBackground.tailwind,
                      'animate-pulse rounded-md'
                    )}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'rounded-lg border p-6',
            colors.borderColor.tailwind,
            colors.cardBackground.tailwind
          )}
        >
          <h3
            className={cn(
              'mb-4 font-serif text-lg font-medium',
              colors.textColor.tailwind
            )}
          >
            {t('securitySettings')}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex items-center font-serif',
                  colors.textColor.tailwind
                )}
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>{t('logoutAccount')}</span>
              </div>

              <button
                disabled
                className={cn(
                  'rounded-md px-4 py-2 font-serif',
                  isDark
                    ? 'bg-stone-600 text-stone-400'
                    : 'bg-stone-300 text-stone-500'
                )}
              >
                {t('deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

      <AccountSettings
        email={userEmail || undefined}
        authSource={authSource || undefined}
      />
    </motion.div>
  );
}
