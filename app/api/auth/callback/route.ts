import { validateRedirectUrl } from '@lib/utils/redirect-validation';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // 使用类型断言解决 cookies() 的类型问题
    const cookieStore = cookies() as any;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      // 使用授权码交换会话，获取用户信息
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('OAuth callback error:', error);
        // 重定向到登录页面并显示错误
        return NextResponse.redirect(
          new URL('/login?error=oauth_failed', request.url)
        );
      }

      // 检查用户是否已有profile，如果没有则创建
      // OAuth用户的profile会由数据库触发器自动创建，但我们需要更新认证来源
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, auth_source')
          .eq('id', data.user.id)
          .single();

        if (profile && !profile.auth_source) {
          // 更新认证来源为oauth
          await supabase
            .from('profiles')
            .update({
              auth_source: 'oauth',
              last_login: new Date().toISOString(),
            })
            .eq('id', data.user.id);
        }
      }
    } catch (err) {
      console.error('OAuth处理失败:', err);
      return NextResponse.redirect(
        new URL('/login?error=oauth_failed', request.url)
      );
    }
  }

  // 🔒 Security: Validate redirect URL to prevent open redirect attacks
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/chat/new';
  const validatedRedirectUrl = validateRedirectUrl(
    redirectTo,
    request.url,
    '/chat/new'
  );

  // 重定向到验证后的安全页面
  return NextResponse.redirect(new URL(validatedRedirectUrl, request.url));
}
