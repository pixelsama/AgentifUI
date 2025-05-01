import { NextRequest, NextResponse } from 'next/server'
import { initiateSSOLogin } from '../../../../../lib/utils/supabaseSSO'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体中的SSO提供商ID和重定向URL
    const { providerId, redirectUrl } = await request.json()
    
    if (!providerId || !redirectUrl) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 安全检查：确保redirectUrl是本站URL（防止开放重定向漏洞）
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
    
    const redirectOrigin = new URL(redirectUrl).origin
    if (!allowedOrigins.includes(redirectOrigin)) {
      return NextResponse.json(
        { error: '无效的重定向URL' },
        { status: 400 }
      )
    }
    
    // 获取SSO登录URL
    const ssoUrl = await initiateSSOLogin(providerId, redirectUrl)
    
    return NextResponse.json({ ssoUrl })
  } catch (error) {
    console.error('初始化SSO登录错误:', error)
    return NextResponse.json(
      { error: '处理SSO请求时出错' },
      { status: 500 }
    )
  }
} 