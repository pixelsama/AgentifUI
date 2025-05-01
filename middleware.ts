import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 这个中间件会拦截所有请求，处理Supabase认证
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 创建Supabase服务器客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name, options) => {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 刷新会话
  await supabase.auth.getSession()

  // 获取用户信息
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 检查用户路径访问权限
  const url = new URL(request.url)
  const isAuthRoute = url.pathname.startsWith('/auth')
  const isApiRoute = url.pathname.startsWith('/api')
  const isPublicRoute = url.pathname === '/' || 
                         url.pathname === '/login' || 
                         url.pathname === '/about' || 
                         url.pathname.startsWith('/register') ||
                         // 注意：临时将chat页面设为公开路由，后续实现认证后需要移除这一行
                         url.pathname.startsWith('/chat')
  
  // 如果用户未登录且不是认证路由或公开API或公开页面，重定向到登录页
  if (!user && !isAuthRoute && !isApiRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果用户已登录且访问认证路由，重定向到首页
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 排除静态文件和服务器端API
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 