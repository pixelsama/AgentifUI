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

  const url = new URL(request.url)
  const pathname = url.pathname

  // 优先级最高：如果用户直接访问 /chat，则重定向到 /chat/new
  // 这样确保总是从一个明确的新对话状态开始。
  if (pathname === '/chat') {
    const newChatUrl = new URL('/chat/new', request.url)
    console.log(`[Middleware] Exact /chat match. Redirecting to ${newChatUrl.toString()}`)
    return NextResponse.redirect(newChatUrl)
  }

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
  const isAuthRoute = pathname.startsWith('/auth')
  const isApiRoute = pathname.startsWith('/api')
  // TODO (恢复认证): 临时修改 - 为了方便开发和测试聊天功能，
  // 暂时将所有 /chat/ 开头的路径视为公开路由，允许未登录访问。
  // 在部署到生产环境或完成登录功能后，必须移除 `|| pathname.startsWith('/chat/')` 这部分，
  // 恢复对聊天页面的访问控制，只允许 /chat/new 匿名访问。
  const isPublicRoute = pathname === '/' || 
                         pathname === '/login' || 
                         pathname === '/about' || 
                         pathname.startsWith('/register') ||
                         pathname.startsWith('/chat/'); // 临时允许所有 /chat/ 路径
  
  // 如果用户未登录且访问的不是 认证路由、API路由 或 公开路由，重定向到登录
  if (!user && !isAuthRoute && !isApiRoute && !isPublicRoute) {
    console.log(`[Middleware] User not logged in, redirecting protected route ${pathname} to /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果用户已登录且访问认证路由（例如 /login），重定向到首页
  if (user && isAuthRoute) {
    console.log(`[Middleware] User logged in, redirecting auth route ${pathname} to /`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 排除静态文件和服务器端API
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/chat',
    '/chat/:path*',
  ],
} 