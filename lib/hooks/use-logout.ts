'use client';

import { createClient } from '@lib/supabase/client';
import { clearCacheOnLogout } from '@lib/utils/cache-cleanup';

import { useRouter } from 'next/navigation';

/**
 * 退出登录 Hook
 *
 * 提供退出登录功能，处理所有相关逻辑，包括：
 * - 调用 Supabase Auth 的登出方法
 * - 清除本地状态和敏感缓存
 * - 重定向到登录页面
 *
 * @returns 包含退出登录方法和加载状态的对象
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout();
 *
 * return (
 *   <button
 *     onClick={logout}
 *     disabled={isLoggingOut}
 *   >
 *     {isLoggingOut ? '退出中...' : '退出登录'}
 *   </button>
 * );
 * ```
 */
export function useLogout() {
  const router = useRouter();
  const supabase = createClient();

  /**
   * 执行退出登录操作
   * - 调用 Supabase Auth 的登出方法
   * - 清除所有敏感缓存和用户数据
   * - 重定向到登录页面
   * - 刷新路由以更新认证状态
   */
  const logout = async () => {
    try {
      console.log('[登出] 开始执行退出登录流程');

      // 首先清理所有敏感缓存，确保用户数据安全
      clearCacheOnLogout();

      // 调用 Supabase Auth 的登出方法
      await supabase.auth.signOut();

      console.log('[登出] Supabase Auth 登出成功');

      // 重定向到登录页面
      router.push('/login');

      // 刷新路由以更新认证状态
      router.refresh();

      console.log('[登出] 退出登录流程完成');
    } catch (error) {
      console.error('[登出] 退出登录失败:', error);

      // 即使登出失败，也要清理本地缓存以确保安全
      try {
        clearCacheOnLogout();
        console.log('[登出] 失败情况下仍成功清理缓存');
      } catch (cacheError) {
        console.error('[登出] 缓存清理也失败:', cacheError);
      }
    }
  };

  return { logout };
}
