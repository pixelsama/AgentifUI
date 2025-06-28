'use client';

import { usePathname } from 'next/navigation';

import { Sidebar } from './index';

/**
 * 条件渲染Sidebar组件
 * 根据当前路由决定是否显示Sidebar
 *
 * 需要隔离的路由：
 * - 根目录 "/" (首页)
 * - "/admin" 及其子路由 (管理后台有自己的侧边栏)
 * - "/login", "/register" 等认证页面
 */
export function ConditionalSidebar() {
  const pathname = usePathname();

  // --- BEGIN COMMENT ---
  // 需要隔离Sidebar的路由
  // --- END COMMENT ---
  const shouldHideSidebar =
    pathname === '/' || // 首页
    pathname?.startsWith('/about') || // 关于页
    pathname?.startsWith('/admin') || // 管理后台
    pathname?.startsWith('/login') || // 登录页
    pathname?.startsWith('/register') || // 注册页
    pathname?.startsWith('/forgot-password') || // 忘记密码
    pathname?.startsWith('/reset-password') || // 重置密码
    pathname?.startsWith('/phone-login') || // 手机登录
    pathname?.startsWith('/sso'); // SSO相关页面

  // --- BEGIN COMMENT ---
  // 如果在需要隔离的路由，不渲染Sidebar
  // --- END COMMENT ---
  if (shouldHideSidebar) {
    return null;
  }

  // --- BEGIN COMMENT ---
  // 其他路由正常渲染Sidebar
  // --- END COMMENT ---
  return <Sidebar />;
}
