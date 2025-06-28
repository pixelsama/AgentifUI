'use client';

import { ResetPasswordForm } from '@components/auth/reset-password-form';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';

import { Suspense, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  const { isDark } = useTheme();
  const t = useTranslations('loading');
  const [mounted, setMounted] = useState(false);

  // --- 确保客户端渲染一致性 ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- 根据主题获取颜色 ---
  const getColors = () => {
    if (isDark) {
      return {
        bgColor: 'bg-stone-800',
      };
    } else {
      return {
        bgColor: 'bg-stone-100',
      };
    }
  };

  const colors = mounted
    ? getColors()
    : {
        bgColor: '',
      };

  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4 py-12 sm:px-6 lg:px-8 ${colors.bgColor} font-serif`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Suspense
          fallback={
            <div
              className={cn(
                'w-full max-w-md space-y-6 rounded-xl border p-6 font-serif shadow-lg transition-all sm:space-y-8 sm:p-8',
                isDark
                  ? 'border-stone-800 bg-stone-900'
                  : 'border-stone-200 bg-stone-50'
              )}
            >
              <div className="text-center">
                <div
                  className={cn(
                    'mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full',
                    isDark ? 'bg-stone-800' : 'bg-stone-100'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full',
                      isDark ? 'bg-stone-600' : 'bg-stone-300'
                    )}
                  ></div>
                </div>
                <h2 className="bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text font-serif text-3xl font-bold text-transparent">
                  {t('default')}
                </h2>
              </div>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </motion.div>
    </main>
  );
}
