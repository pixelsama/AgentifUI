'use client';

import { usePathname } from 'next/navigation';

import { NavBar } from './nav-bar';

/**
 * 条件渲染NavBar组件
 * 根据当前路由决定是否显示NavBar
 * 参考ConditionalSidebar的实现，避免路由切换时重新挂载导致的闪烁问题
 *
 * 需要隐藏NavBar的路由：
 * - 根目录 "/" (首页)
 * - "/admin" 及其子路由 (管理后台有自己的header)
 * - "/login", "/register" 等认证页面
 * - "/about" 关于页面
 */
export function ConditionalNavBar() {
  const pathname = usePathname();

  // 需要隐藏NavBar的路由
  // 与ConditionalSidebar保持一致的路由判断逻辑
  const shouldHideNavBar =
    pathname === '/' || // 首页
    pathname?.startsWith('/about') || // 关于页
    pathname?.startsWith('/admin') || // 管理后台
    pathname?.startsWith('/login') || // 登录页
    pathname?.startsWith('/register') || // 注册页
    pathname?.startsWith('/forgot-password') || // 忘记密码
    pathname?.startsWith('/reset-password') || // 重置密码
    pathname?.startsWith('/phone-login') || // 手机登录
    pathname?.startsWith('/sso'); // SSO相关页面

  // 如果在需要隐藏的路由，不渲染NavBar
  if (shouldHideNavBar) {
    return null;
  }

  // 其他路由正常渲染NavBar
  return <NavBar />;
}
