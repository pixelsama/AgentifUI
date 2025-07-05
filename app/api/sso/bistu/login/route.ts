// 北京信息科技大学SSO登录入口
// 处理用户发起的SSO登录请求，重定向到CAS服务器
import { createBistuCASService } from '@lib/services/admin/sso/bistu-cas-service';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || '/chat';

    console.log(`SSO login initiated, return URL: ${returnUrl}`);

    // 验证returnUrl的安全性，防止开放重定向攻击
    const allowedReturnUrls = [
      '/chat',
      '/dashboard',
      '/settings',
      '/apps',
      '/', // 首页
    ];

    // 检查returnUrl是否为相对路径且在允许列表中
    const isValidReturnUrl =
      returnUrl.startsWith('/') &&
      (allowedReturnUrls.includes(returnUrl) || returnUrl.startsWith('/chat/'));

    const safeReturnUrl = isValidReturnUrl ? returnUrl : '/chat';

    if (returnUrl !== safeReturnUrl) {
      console.warn(
        `Invalid return URL rejected: ${returnUrl}, using default: ${safeReturnUrl}`
      );
    }

    // 创建CAS服务实例
    const casService = createBistuCASService();

    // 生成登录URL并重定向
    const loginUrl = casService.generateLoginURL(safeReturnUrl);

    console.log(
      `Redirecting to CAS login: ${loginUrl.replace(/service=[^&]+/, 'service=***')}`
    );

    // 添加详细调试信息
    console.log(`Full login URL (for debugging): ${loginUrl}`);
    console.log(`User Agent: ${request.headers.get('user-agent')}`);
    console.log(`Referer: ${request.headers.get('referer')}`);

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('SSO login redirect failed:', error);

    // 登录失败，重定向到登录页面并显示错误
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'sso_redirect_failed');
    errorUrl.searchParams.set('message', '启动SSO登录失败，请重试');

    return NextResponse.redirect(errorUrl);
  }
}
