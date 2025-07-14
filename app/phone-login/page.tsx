'use client';

import PhoneAuth from '@components/auth/phone-auth';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PhoneLoginPage() {
  const { isDark } = useTheme();
  const t = useTranslations('pages.auth.phoneLoginPage');

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center p-4',
        isDark
          ? 'bg-gradient-to-br from-stone-900 via-gray-900 to-stone-900'
          : 'bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50'
      )}
    >
      <div className="w-full max-w-md space-y-6">
        {/* --- header title --- */}
        <div className="space-y-2 text-center">
          <h1
            className={cn(
              'font-serif text-3xl font-bold tracking-tight',
              isDark ? 'text-gray-100' : 'text-gray-900'
            )}
          >
            {t('title')}
          </h1>
          <p
            className={cn(
              'font-serif text-sm',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* --- phone number authentication component --- */}
        <PhoneAuth />

        {/* --- other login methods --- */}
        <div
          className={cn(
            'rounded-xl border p-6 font-serif shadow-lg transition-all',
            isDark
              ? 'border-stone-800 bg-stone-900'
              : 'border-stone-200 bg-stone-50'
          )}
        >
          <div className="space-y-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span
                  className={cn(
                    'w-full border-t',
                    isDark ? 'border-stone-700' : 'border-stone-300'
                  )}
                />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className={cn(
                    'px-2 font-serif',
                    isDark
                      ? 'bg-stone-900 text-gray-400'
                      : 'bg-stone-50 text-gray-500'
                  )}
                >
                  {t('orSeparator')}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Link
                href="/login"
                className={cn(
                  'font-serif text-sm hover:underline',
                  isDark
                    ? 'text-stone-400 hover:text-stone-300'
                    : 'text-stone-600 hover:text-stone-700'
                )}
              >
                {t('emailLoginLink')}
              </Link>
              <Link
                href="/register"
                className={cn(
                  'font-serif text-sm hover:underline',
                  isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
                )}
              >
                {t('registerLink')}
              </Link>
            </div>
          </div>
        </div>

        {/* --- bottom description --- */}
        <p
          className={cn(
            'text-center font-serif text-xs',
            isDark ? 'text-gray-500' : 'text-gray-500'
          )}
        >
          {t('termsText')}{' '}
          <Link
            href="/terms"
            className={cn(
              'underline',
              isDark ? 'hover:text-gray-400' : 'hover:text-gray-700'
            )}
          >
            {t('termsLink')}
          </Link>{' '}
          {t('andText')}{' '}
          <Link
            href="/privacy"
            className={cn(
              'underline',
              isDark ? 'hover:text-gray-400' : 'hover:text-gray-700'
            )}
          >
            {t('privacyLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
