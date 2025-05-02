import { NextRequest, NextResponse } from 'next/server'
import { extractDomainFromEmail, getSSOProviderByDomain, getAuthSettings } from '../../../../lib/utils/supabase-SSO'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体中的邮箱
    const { email } = await request.json()
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的邮箱地址' },
        { status: 400 }
      )
    }
    
    // 提取域名
    const domain = extractDomainFromEmail(email)
    if (!domain) {
      return NextResponse.json(
        { error: '邮箱格式无效' },
        { status: 400 }
      )
    }
    
    // 获取认证设置
    const authSettings = await getAuthSettings()
    
    // 查询该域名是否配置了SSO
    const ssoProvider = await getSSOProviderByDomain(domain)
    
    if (ssoProvider) {
      // 该域名已配置SSO，返回SSO提供商信息
      return NextResponse.json({
        loginType: 'sso',
        ssoProvider: {
          id: ssoProvider.id,
          name: ssoProvider.name,
          protocol: ssoProvider.protocol
        },
        email
      })
    } else {
      // 该域名未配置SSO，检查是否允许密码登录
      if (authSettings.allow_password_login) {
        return NextResponse.json({
          loginType: 'password',
          email
        })
      } else {
        // 不允许密码登录，也没有配置SSO
        return NextResponse.json(
          { error: '该邮箱域名暂未接入系统，请联系管理员' },
          { status: 403 }
        )
      }
    }
  } catch (error) {
    console.error('身份识别错误:', error)
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    )
  }
} 