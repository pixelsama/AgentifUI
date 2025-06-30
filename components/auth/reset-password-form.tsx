'use client';

import { Button } from '@components/ui/button';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { createClient } from '../../lib/supabase/client';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('pages.auth.resetPassword');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const { isDark } = useTheme();

  // --- 验证用户认证状态 ---
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const supabase = createClient();

        // --- 调试：显示所有URL参数 ---
        console.log('=== 重置密码调试信息 ===');
        console.log('完整URL:', window.location.href);
        console.log('URL参数:', window.location.search);

        // --- 检查URL参数 ---
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const token_hash = searchParams.get('token_hash');

        console.log('URL参数解析:');
        console.log('- access_token:', access_token);
        console.log('- refresh_token:', refresh_token);
        console.log('- type:', type);
        console.log('- token_hash:', token_hash);

        // --- 处理Supabase的重置密码重定向 ---
        if (type === 'recovery' && token_hash) {
          console.log('检测到Supabase重置密码链接，尝试验证token');

          // 使用正确的方法处理重置密码token
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: token_hash,
          });

          if (verifyError) {
            console.error('重置密码token验证失败:', verifyError);
            setError(t('errors.linkInvalid'));
            setIsTokenValid(false);
          } else {
            console.log('重置密码token验证成功:', data);
            setIsTokenValid(true);
          }
          return;
        }

        // --- 处理直接的access_token（兼容旧版本） ---
        if (access_token) {
          console.log('检测到access_token，尝试设置会话');

          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });

          if (sessionError) {
            console.error('会话设置失败:', sessionError);
            setError(t('errors.linkInvalid'));
            setIsTokenValid(false);
          } else {
            console.log('会话设置成功');
            setIsTokenValid(true);
          }
          return;
        }

        // --- 检查是否已有有效会话 ---
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('获取用户信息失败:', userError);
          setError(t('errors.verifyFailed'));
          setIsTokenValid(false);
        } else if (user) {
          console.log('用户已认证:', user.email);
          setIsTokenValid(true);
        } else {
          console.log('用户未认证，且无有效的重置token');
          setError(t('errors.linkExpired'));
          setIsTokenValid(false);
        }
      } catch (err) {
        console.error('会话验证异常:', err);
        setError(t('errors.verifyFailed'));
        setIsTokenValid(false);
      }
    };

    checkUserSession();
  }, [searchParams, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // --- 清除错误信息 ---
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.password.trim()) {
      setError(t('errors.passwordRequired'));
      return false;
    }

    if (formData.password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // --- 更新密码 ---
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        // --- 处理常见错误 ---
        if (error.message.includes('Password should be')) {
          throw new Error(t('errors.passwordWeak'));
        } else if (error.message.includes('session')) {
          throw new Error(t('errors.sessionExpired'));
        } else {
          throw error;
        }
      }

      // --- 重置成功 ---
      setIsSuccess(true);

      // --- 3秒后跳转到登录页面 ---
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errors.resetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Token验证中的加载状态 ---
  if (isTokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4 sm:px-6 lg:px-8">
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
            <h2 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
              {t('verifying')}
            </h2>
            <p
              className={cn(
                'mt-2 font-serif text-sm',
                isDark ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              {t('verifyingSubtitle')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Token无效状态 ---
  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4 sm:px-6 lg:px-8">
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
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                isDark ? 'bg-stone-800' : 'bg-stone-100'
              )}
            >
              <AlertCircle
                className={cn(
                  'h-8 w-8',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              />
            </div>
            <h2 className="py-1 font-serif text-xl leading-normal font-bold text-stone-900 sm:text-2xl">
              {t('invalidTitle')}
            </h2>
            <p
              className={cn(
                'mt-2 font-serif text-sm',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              {t('invalidSubtitle')}
            </p>
          </div>

          {error && (
            <div
              className={cn(
                'rounded-lg border-l-4 p-4 font-serif text-sm',
                isDark
                  ? 'border-red-500 bg-red-900/30 text-red-400'
                  : 'border-red-500 bg-red-50 text-red-700'
              )}
            >
              {error}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/forgot-password"
              className={cn(
                'inline-flex items-center font-serif text-sm text-stone-700 transition-colors hover:text-stone-600',
                isDark
                  ? 'text-stone-400 hover:text-stone-300'
                  : 'text-stone-700 hover:text-stone-600'
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('retryReset')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 重置成功状态 ---
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4 sm:px-6 lg:px-8">
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
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                isDark ? 'bg-stone-800' : 'bg-stone-100'
              )}
            >
              <CheckCircle
                className={cn(
                  'h-8 w-8',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              />
            </div>
            <h2 className="py-1 font-serif text-xl leading-normal font-bold text-stone-900 sm:text-2xl">
              {t('successTitle')}
            </h2>
            <p
              className={cn(
                'mt-2 font-serif text-sm',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              {t('successSubtitle')}
            </p>
          </div>

          <div
            className={cn(
              'rounded-lg border-l-4 p-4 font-serif text-sm',
              isDark
                ? 'border-stone-600 bg-stone-800/50 text-stone-300'
                : 'border-stone-400 bg-stone-50 text-stone-700'
            )}
          >
            <p>{t('successMessage')}</p>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className={cn(
                'inline-flex items-center font-serif text-sm text-stone-700 transition-colors hover:text-stone-600',
                isDark
                  ? 'text-stone-400 hover:text-stone-300'
                  : 'text-stone-700 hover:text-stone-600'
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 主要的重置密码表单 ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          'w-full max-w-md space-y-6 rounded-xl border p-6 font-serif shadow-lg transition-all sm:space-y-8 sm:p-8',
          isDark
            ? 'border-stone-800 bg-stone-900'
            : 'border-stone-200 bg-stone-50'
        )}
      >
        <div className="text-center">
          <h2 className="py-1 font-serif text-xl leading-normal font-bold text-stone-900 sm:text-2xl">
            {t('title')}
          </h2>
          <p
            className={cn(
              'mt-2 font-serif text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            {t('subtitle')}
          </p>
        </div>

        {error && (
          <div
            className={cn(
              'rounded-lg border-l-4 p-4 font-serif text-sm',
              isDark
                ? 'border-red-500 bg-red-900/30 text-red-400'
                : 'border-red-500 bg-red-50 text-red-700'
            )}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="password"
              className={cn(
                'mb-1 block font-serif text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={cn(
                  'relative block w-full appearance-none rounded-lg border px-3 py-2 pr-12 font-serif placeholder-gray-500 transition-all focus:border-transparent focus:ring-2 focus:ring-stone-500 focus:outline-none',
                  isDark
                    ? 'border-stone-700 bg-stone-800 text-white'
                    : 'border-gray-300 text-gray-900'
                )}
                placeholder={t('passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 transition-colors focus:outline-none',
                  isDark
                    ? 'text-stone-400 hover:text-stone-300'
                    : 'text-stone-500 hover:text-stone-600'
                )}
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            {formData.password && (
              <p
                className={cn(
                  'mt-1 font-serif text-xs',
                  isDark ? 'text-stone-400' : 'text-stone-500'
                )}
              >
                {t('passwordHint')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className={cn(
                'mb-1 block font-serif text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              {t('confirmPasswordLabel')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={cn(
                  'relative block w-full appearance-none rounded-lg border px-3 py-2 pr-12 font-serif placeholder-gray-500 transition-all focus:border-transparent focus:ring-2 focus:ring-stone-500 focus:outline-none',
                  isDark
                    ? 'border-stone-700 bg-stone-800 text-white'
                    : 'border-gray-300 text-gray-900'
                )}
                placeholder={t('confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={cn(
                  'absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 transition-colors focus:outline-none',
                  isDark
                    ? 'text-stone-400 hover:text-stone-300'
                    : 'text-stone-500 hover:text-stone-600'
                )}
                aria-label={
                  showConfirmPassword
                    ? t('hideConfirmPassword')
                    : t('showConfirmPassword')
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !formData.password ||
              !formData.confirmPassword ||
              !!error
            }
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-stone-700 px-4 py-2 font-serif text-sm font-medium text-white transition-all hover:bg-stone-800 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t('resettingButton') : t('resetButton')}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className={cn(
              'font-serif text-sm transition-colors',
              isDark
                ? 'text-stone-400 hover:text-stone-300'
                : 'text-stone-700 hover:text-stone-600'
            )}
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
