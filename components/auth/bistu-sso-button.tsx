// --- BEGIN COMMENT ---
// 北京信息科技大学SSO登录按钮组件
// 提供统一的SSO登录入口界面
// --- END COMMENT ---

'use client';

import { useState } from 'react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { useTheme } from '@lib/hooks/use-theme';
import { clearCacheOnLogin } from '@lib/utils/cache-cleanup';

interface BistuSSOButtonProps {
  returnUrl?: string;
  className?: string;
  variant?: 'gradient' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

export function BistuSSOButton({
  returnUrl,
  className,
  variant = 'gradient',
  size = 'default',
  disabled = false,
  children,
}: BistuSSOButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log('[SSO登录] 开始北信科SSO登录流程');
      
      // --- BEGIN COMMENT ---
      // SSO登录前先清理前一个用户的缓存，防止数据污染
      // --- END COMMENT ---
      clearCacheOnLogin();

      // --- BEGIN COMMENT ---
      // 构建SSO登录URL
      // --- END COMMENT ---
      const params = new URLSearchParams();
      if (returnUrl) {
        params.set('returnUrl', returnUrl);
      }

      const ssoLoginUrl = `/api/sso/bistu/login${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('[SSO登录] 跳转到SSO认证页面');
      
      // --- BEGIN COMMENT ---
      // 重定向到SSO登录接口
      // --- END COMMENT ---
      window.location.href = ssoLoginUrl;
    } catch (error) {
      console.error('[SSO登录] 启动SSO登录失败:', error);
      setIsLoading(false);
      
      // --- BEGIN COMMENT ---
      // 显示错误提示
      // --- END COMMENT ---
      alert('启动SSO登录失败，请稍后重试');
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        // --- BEGIN COMMENT ---
        // 使用与登录按钮一致的样式
        // --- END COMMENT ---
        "relative w-full flex items-center justify-center gap-2 font-serif",
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleSSOLogin}
    >
      {/* --- BEGIN COMMENT --- */}
      {/* 根据loading状态显示不同图标 */}
      {/* --- END COMMENT --- */}
      {isLoading ? (
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
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
          className="w-5 h-5" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )}
      
      {/* --- BEGIN COMMENT --- */}
      {/* 按钮文本内容 */}
      {/* --- END COMMENT --- */}
      {isLoading ? '正在跳转...' : (children || '使用北信科统一认证登录')}
    </Button>
  );
}

// --- BEGIN COMMENT ---
// 简化版的SSO登录按钮，用于快速集成
// --- END COMMENT ---
export function SimpleBistuSSOButton({ 
  returnUrl, 
  className 
}: { 
  returnUrl?: string; 
  className?: string; 
}) {
  return (
    <BistuSSOButton
      returnUrl={returnUrl}
      className={className}
      variant="gradient"
    >
      <span className="text-sm font-serif">
        🏛️ 北信科统一认证
      </span>
    </BistuSSOButton>
  );
}

// --- BEGIN COMMENT ---
// 带有详细说明的SSO登录卡片
// --- END COMMENT ---
export function BistuSSOCard({ 
  returnUrl, 
  className 
}: { 
  returnUrl?: string; 
  className?: string; 
}) {
  const { isDark } = useTheme();
  
  return (
    <div className={cn(
      "p-6 border rounded-lg shadow-sm",
      "hover:shadow-md transition-shadow font-serif",
      isDark 
        ? "border-stone-700 bg-stone-800 shadow-stone-900/30" 
        : "border-gray-200 bg-white",
      className
    )}>
      <div className="text-center space-y-4">
        {/* --- BEGIN COMMENT --- */}
        {/* 标题和说明 */}
        {/* --- END COMMENT --- */}
        <div>
          <h3 className={cn(
            "text-lg font-semibold font-serif",
            isDark ? "text-stone-100" : "text-gray-900"
          )}>
            北京信息科技大学统一认证
          </h3>
          <p className={cn(
            "text-sm mt-1 font-serif",
            isDark ? "text-stone-300" : "text-gray-600"
          )}>
            使用您的学工号和密码登录
          </p>
        </div>

        {/* --- BEGIN COMMENT --- */}
        {/* 登录按钮 */}
        {/* --- END COMMENT --- */}
        <BistuSSOButton
          returnUrl={returnUrl}
          className="w-full font-serif"
        />

        {/* --- BEGIN COMMENT --- */}
        {/* 帮助信息 */}
        {/* --- END COMMENT --- */}
        <div className={cn(
          "text-xs font-serif",
          isDark ? "text-stone-400" : "text-gray-500"
        )}>
          <p>首次登录将自动创建账户</p>
          <p>如有问题请联系系统管理员</p>
        </div>
      </div>
    </div>
  );
} 