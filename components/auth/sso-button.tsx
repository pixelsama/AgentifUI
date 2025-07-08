'use client';

import { Button } from '@components/ui/button';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { clearCacheOnLogin } from '@lib/utils/cache-cleanup';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

// SSO登录按钮组件
// 提供统一的SSO登录入口界面
interface SSOButtonProps {
  returnUrl?: string;
  className?: string;
  variant?: 'gradient' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

export function SSOButton({
  returnUrl,
  className,
  variant = 'gradient',
  size = 'default',
  disabled = false,
  children,
}: SSOButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('pages.auth.sso');

  const handleSSOLogin = async () => {
    try {
      setIsLoading(true);

      // SSO登录前先清理前一个用户的缓存，防止数据污染
      clearCacheOnLogin();

      // 构建SSO登录URL
      const params = new URLSearchParams();
      if (returnUrl) {
        params.set('returnUrl', returnUrl);
      }

      const ssoLoginUrl = `/api/sso/bistu/login${params.toString() ? '?' + params.toString() : ''}`;

      // 重定向到SSO登录接口
      window.location.href = ssoLoginUrl;
    } catch (error) {
      console.error('[SSO登录] 启动SSO登录失败:', error);
      setIsLoading(false);

      // 显示错误提示
      alert(t('startError'));
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        'relative flex w-full items-center justify-center gap-2 font-serif',
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleSSOLogin}
    >
      {isLoading ? (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )}

      {isLoading ? t('jumpingButton') : children || t('button')}
    </Button>
  );
}

// 简化版的SSO登录按钮，用于快速集成
export function SimpleSSOButton({
  returnUrl,
  className,
}: {
  returnUrl?: string;
  className?: string;
}) {
  const t = useTranslations('pages.auth.sso');

  return (
    <SSOButton returnUrl={returnUrl} className={className} variant="gradient">
      <span className="font-serif text-sm">{t('simpleButton')}</span>
    </SSOButton>
  );
}

// 带有详细说明的SSO登录卡片
export function SSOCard({
  returnUrl,
  className,
}: {
  returnUrl?: string;
  className?: string;
}) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.auth.sso');

  return (
    <div
      className={cn(
        'rounded-lg border p-6 shadow-sm',
        'font-serif transition-shadow hover:shadow-md',
        isDark
          ? 'border-stone-700 bg-stone-800 shadow-stone-900/30'
          : 'border-gray-200 bg-white',
        className
      )}
    >
      <div className="space-y-4 text-center">
        {/* Title and description */}
        <div>
          <h3
            className={cn(
              'font-serif text-lg font-semibold',
              isDark ? 'text-stone-100' : 'text-gray-900'
            )}
          >
            {t('title')}
          </h3>
          <p
            className={cn(
              'mt-1 font-serif text-sm',
              isDark ? 'text-stone-300' : 'text-gray-600'
            )}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Login button */}
        <SSOButton returnUrl={returnUrl} className="w-full font-serif" />

        {/* Help information */}
        <div
          className={cn(
            'font-serif text-xs',
            isDark ? 'text-stone-400' : 'text-gray-500'
          )}
        >
          <p>{t('helpText')}</p>
          <p>{t('contactText')}</p>
        </div>
      </div>
    </div>
  );
}
