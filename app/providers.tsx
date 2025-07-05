'use client';

import { useCurrentAppStore } from '@lib/stores/current-app-store';
import { createClient } from '@lib/supabase/client';

import { useEffect, useState } from 'react';

import { ThemeProvider } from 'next-themes';

// 引入 App Store

export function Providers({ children }: { children: React.ReactNode }) {
  // 避免水合不匹配，确保在客户端渲染时才加载 ThemeProvider
  const [mounted, setMounted] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  // 使用 hook 方式获取初始化方法，遵循 React 最佳实践
  const initializeDefaultAppId = useCurrentAppStore(
    state => state.initializeDefaultAppId
  );

  useEffect(() => {
    setMounted(true);

    // 🔒 安全修复：只在用户已登录时才初始化应用存储
    // 防止未登录用户触发不必要的缓存创建
    const checkUserAndInitialize = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        setUserChecked(true);

        if (user && !error) {
          console.log('[Providers] 用户已登录，初始化应用存储');
          // 只有在用户已登录时才初始化默认 App ID
          await initializeDefaultAppId();
        } else {
          console.log('[Providers] 用户未登录，跳过应用存储初始化');
        }
      } catch (error) {
        console.warn('[Providers] 检查用户状态失败:', error);
        setUserChecked(true);
      }
    };

    checkUserAndInitialize();
  }, [initializeDefaultAppId]);

  if (!mounted) {
    // 在 ThemeProvider 准备好之前，不渲染 children，或者渲染一个最小的占位符
    // 返回 null 确保子组件不会在没有主题上下文的情况下尝试渲染
    return null;
  }

  return (
    <ThemeProvider
      attribute="class" // 使用 class 属性来切换主题 (TailwindCSS class 模式)
      defaultTheme="system" // 默认使用系统主题
      enableSystem={true} // 启用系统主题检测
      disableTransitionOnChange // 禁用切换时的过渡效果，避免闪烁
    >
      {children}
    </ThemeProvider>
  );
}
