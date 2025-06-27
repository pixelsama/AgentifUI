'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { cn } from '@lib/utils';
import { useTheme } from '@lib/hooks/use-theme';
import { SocialAuthButtons } from './social-auth-buttons';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const { isDark } = useTheme();
  const t = useTranslations('pages.auth.register');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    
    if (!formData.email.trim()) {
      setError(t('errors.emailRequired'));
      return;
    }
    
    if (formData.password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }
    
    // 验证用户名格式（如果提供）
    if (formData.username.trim() && !/^[a-zA-Z0-9_-]{2,20}$/.test(formData.username.trim())) {
      setError(t('errors.usernameInvalid'));
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // 使用 Supabase Auth 进行注册
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(), // 去除首尾空格
            username: formData.username.trim() || undefined, // 去除空格，如果为空则不传递
          },
        },
      });
      
      if (signUpError) {
        // 处理常见的注册错误
        if (signUpError.message.includes('already registered')) {
          throw new Error(t('errors.emailExists'));
        } else if (signUpError.message.includes('Password should be')) {
          throw new Error(t('errors.passwordWeak'));
        } else if (signUpError.message.includes('Invalid email')) {
          throw new Error(t('errors.emailInvalid'));
        } else {
          throw signUpError;
        }
      }
      
      // 检查是否需要邮箱验证
      if (data.user && !data.user.email_confirmed_at) {
        // 需要邮箱验证
        router.push('/login?registered=true&verify=true');
      } else {
        // 直接注册成功（如果禁用了邮箱验证）
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.message || t('errors.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 rounded-xl shadow-lg border transition-all font-serif",
      isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
    )}>
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text text-transparent font-serif">{t('title')}</h2>
        <p className={cn(
          "mt-2 text-sm font-serif",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          {t('subtitle')}
        </p>
      </div>

        {error && (
          <div className={cn(
            "p-4 rounded-lg text-sm border-l-4 font-serif",
            isDark ? "bg-red-900/30 text-red-400 border-red-500" : "bg-red-50 text-red-700 border-red-500"
          )}>
            {error}
          </div>
        )}

        {/* --- BEGIN COMMENT --- */}
        {/* 社交登录区域 */}
        {/* --- END COMMENT --- */}
        <SocialAuthButtons type="register" redirectTo="/chat" />

        {/* --- BEGIN COMMENT --- */}
        {/* 分割线 */}
        {/* --- END COMMENT --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={cn(
              "w-full border-t",
              isDark ? "border-stone-700" : "border-stone-300"
            )} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={cn(
              "px-2 font-serif",
              isDark ? "bg-stone-900 text-gray-400" : "bg-stone-50 text-gray-500"
            )}>
              {t('orSeparator')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {t('nameLabel')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                  isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                )}
                placeholder={t('namePlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="username" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {t('usernameLabel')} <span className="text-gray-500 text-xs font-serif">{t('usernameOptional')}</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                  isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                )}
                placeholder={t('usernamePlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="email" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {t('emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                  isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                )}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={cn(
                    "block w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                    isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                  )}
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 focus:outline-none transition-colors",
                    isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-500 hover:text-stone-600"
                  )}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {t('confirmPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={cn(
                    "block w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                    isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                  )}
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={cn(
                    "absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 focus:outline-none transition-colors",
                    isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-500 hover:text-stone-600"
                  )}
                  aria-label={showConfirmPassword ? t('hideConfirmPassword') : t('showConfirmPassword')}
                >
                  {showConfirmPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="w-full h-12 text-base font-serif"
              variant="gradient"
            >
              {t('createAccountButton')}
            </Button>
          </div>
        </form>

      <div className="text-center space-y-3">
        {/* --- BEGIN COMMENT --- */}
        {/* 手机号登录链接 */}
        {/* --- END COMMENT --- */}
        <div>
          <Link href="/phone-login" className={cn(
            "text-sm font-medium font-serif hover:underline",
            isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-600 hover:text-stone-700"
          )}>
            {t('phoneLoginLink')}
          </Link>
        </div>
        
        <p className={cn(
          "text-sm font-serif",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          {t('hasAccountText')}{' '}
          <Link href="/login" className={cn(
            "font-medium font-serif",
            isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-700 hover:text-stone-600"
          )}>
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
} 