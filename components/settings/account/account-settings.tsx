'use client';

import { useLogout } from '@lib/hooks/use-logout';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { useTheme } from '@lib/hooks/use-theme';
import { createClient } from '@lib/supabase/client';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, Key, LogOut, Mail } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

// 账号设置组件
// 包含所有账号相关逻辑：数据加载、状态管理、退出登录等
export function AccountSettings() {
  const { colors } = useSettingsColors();
  const { isDark } = useTheme();
  const { logout } = useLogout();
  const t = useTranslations('pages.settings.accountSettings');
  const tCommon = useTranslations('common.ui');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authSource, setAuthSource] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 加载用户账号数据
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

  // 处理退出登录
  const handleLogout = async () => {
    if (showConfirm) {
      try {
        setIsLoggingOut(true);
        await logout();
      } catch (error) {
        console.error('退出登录失败:', error);
      } finally {
        setIsLoggingOut(false);
      }
    } else {
      setShowConfirm(true);
    }
  };

  // 取消退出登录
  const cancelLogout = () => {
    setShowConfirm(false);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-6 font-serif text-2xl font-bold">{t('title')}</h1>

      <div className="space-y-8">
        {/* 账户信息卡片 */}
        {isLoading ? (
          <div
            className={cn(
              'rounded-lg border p-6',
              colors.borderColor.tailwind,
              colors.cardBackground.tailwind
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
        ) : (
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
              {t('accountInfo')}
            </h3>

            <div className="space-y-4">
              {userEmail && (
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      colors.buttonBackground.tailwind,
                      colors.borderColor.tailwind,
                      'border'
                    )}
                  >
                    <Mail
                      className={cn(
                        'h-5 w-5',
                        colors.secondaryTextColor.tailwind
                      )}
                    />
                  </div>
                  <div className="ml-4">
                    <p
                      className={cn(
                        'font-serif text-sm',
                        colors.secondaryTextColor.tailwind
                      )}
                    >
                      {t('loginEmail')}
                    </p>
                    <p className={cn('font-serif', colors.textColor.tailwind)}>
                      {userEmail}
                    </p>
                  </div>
                </div>
              )}

              {authSource && (
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      colors.buttonBackground.tailwind,
                      colors.borderColor.tailwind,
                      'border'
                    )}
                  >
                    <Key
                      className={cn(
                        'h-5 w-5',
                        colors.secondaryTextColor.tailwind
                      )}
                    />
                  </div>
                  <div className="ml-4">
                    <p
                      className={cn(
                        'font-serif text-sm',
                        colors.secondaryTextColor.tailwind
                      )}
                    >
                      {t('authMethod')}
                    </p>
                    <p className={cn('font-serif', colors.textColor.tailwind)}>
                      {authSource}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 安全设置卡片 - 始终显示 */}
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
            {/* 退出登录确认提示 */}
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-center rounded-lg border p-4',
                  isDark
                    ? 'border-red-800 bg-red-900/20 text-red-300'
                    : 'border-red-200 bg-red-50 text-red-700'
                )}
              >
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="font-serif">{t('confirmLogout')}</span>
              </motion.div>
            )}

            {/* 退出登录按钮 */}
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

              <div className="flex gap-3">
                {showConfirm && (
                  <button
                    onClick={cancelLogout}
                    className={cn(
                      'rounded-lg px-3 py-2',
                      'transition-all duration-200',
                      'cursor-pointer',
                      'font-serif text-sm',
                      colors.buttonBackground.tailwind,
                      colors.buttonBorder.tailwind,
                      colors.textColor.tailwind,
                      colors.buttonHover.tailwind,
                      'border'
                    )}
                  >
                    {tCommon('cancel')}
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    'rounded-lg px-3 py-2',
                    'transition-all duration-200',
                    'cursor-pointer',
                    'font-serif text-sm',
                    showConfirm
                      ? isDark
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                      : `${colors.primaryButtonBackground.tailwind} ${colors.primaryButtonHover.tailwind} ${colors.primaryButtonText.tailwind}`
                  )}
                >
                  {isLoggingOut
                    ? t('loggingOut')
                    : showConfirm
                      ? t('confirmLogoutBtn')
                      : t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
