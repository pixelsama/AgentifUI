import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// --- BEGIN MODIFIED COMMENT ---
// 移除 Supabase 客户端导入
// --- END MODIFIED COMMENT ---
// import { createServerClient } from '@supabase/ssr'

// --- BEGIN COMMENT ---
// 这个中间件会拦截所有请求。
// 目前移除了基于 Supabase 的认证逻辑。
// 后续需要使用 NextAuth.js 的中间件来处理认证和路由保护。
// --- END COMMENT ---
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = new URL(request.url)
  const pathname = url.pathname

  // 优先级最高：如果用户直接访问 /chat，则重定向到 /chat/new
  // 这样确保总是从一个明确的新对话状态开始。
  if (pathname === '/chat') {
    const newChatUrl = new URL('/chat/new', request.url)
    console.log(`[Middleware] Exact /chat match. Redirecting to ${newChatUrl.toString()}`)
    return NextResponse.redirect(newChatUrl)
  }

  // --- BEGIN COMMENT ---
  // 移除 Supabase 客户端创建逻辑
  // --- END COMMENT ---
  // const supabase = createServerClient(...)

  // --- BEGIN COMMENT ---
  // 移除 Supabase 会话刷新逻辑
  // --- END COMMENT ---
  // await supabase.auth.getSession()

  // --- BEGIN COMMENT ---
  // 移除 Supabase 获取用户信息的逻辑
  // --- END COMMENT ---
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // --- BEGIN COMMENT ---
  // 移除基于 Supabase 用户状态的路由保护逻辑。
  // 目前所有路由（除了特殊处理的 /chat）在中间件层面都是公开的。
  // 需要后续使用 NextAuth.js 中间件来恢复路由保护。
  // --- END COMMENT ---
  // const isAuthRoute = pathname.startsWith('/auth')
  // const isApiRoute = pathname.startsWith('/api')
  // const isPublicRoute = pathname === '/' || 
  //                        pathname === '/login' || 
  //                        pathname === '/about' || 
  //                        pathname.startsWith('/register') ||
  //                        pathname.startsWith('/chat/'); 
  
  // if (!user && !isAuthRoute && !isApiRoute && !isPublicRoute) {
  //   console.log(`[Middleware] User not logged in, redirecting protected route ${pathname} to /login`)
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // if (user && isAuthRoute) {
  //   console.log(`[Middleware] User logged in, redirecting auth route ${pathname} to /`)
  //   return NextResponse.redirect(new URL('/', request.url))
  // }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 排除静态文件和服务器端API
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/chat', // 确保 /chat 被拦截以重定向
    '/chat/:path*', // 拦截所有 /chat/ 下的路径
  ],
} 