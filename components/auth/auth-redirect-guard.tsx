'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@lib/supabase/hooks';
import { Spinner } from '@components/ui/spinner';
import { motion } from 'framer-motion';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

interface AuthRedirectGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  redirectMessage?: string;
  checkSSO?: boolean;
}

/**
 * 认证重定向守卫组件
 * 检查用户是否已登录，如果已登录则显示重定向提示并跳转
 */
export function AuthRedirectGuard({ 
  children, 
  redirectTo = '/chat',
  redirectMessage = '您已登录，正在为您跳转...',
  checkSSO = false
}: AuthRedirectGuardProps) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const isSSOOnly = process.env.NEXT_PUBLIC_SSO_ONLY_MODE === 'true';

  useEffect(() => {
    // SSO模式检查
    if (checkSSO && isSSOOnly) {
      router.push('/login');
      return;
    }

    // 用户已登录检查
    if (!loading && user) {
      setIsRedirecting(true);
      
      // 启动倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectTo);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [user, loading, router, redirectTo, checkSSO, isSSOOnly]);

  // 显示加载状态
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-stone-900" : "bg-stone-100"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Spinner className="w-8 h-8" />
          <p className={cn(
            "text-sm animate-pulse",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            检查登录状态...
          </p>
        </motion.div>
      </div>
    );
  }

  // SSO重定向
  if (checkSSO && isSSOOnly) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-stone-900" : "bg-stone-100"
      )}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Spinner className="w-6 h-6 mx-auto mb-2" />
          <p className={cn(
            isDark ? "text-stone-400" : "text-stone-600"
          )}>重定向中...</p>
        </motion.div>
      </div>
    );
  }

  // 显示重定向提示
  if (user && isRedirecting) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-stone-900" : "bg-stone-100"
      )}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <Spinner className="w-8 h-8 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className={cn(
              "font-medium",
              isDark ? "text-stone-200" : "text-stone-800"
            )}>
              {redirectMessage}
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-stone-400" : "text-stone-600"
            )}>
              {countdown} 秒后自动跳转
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 渲染原内容
  return <>{children}</>;
} 