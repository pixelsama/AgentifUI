import { supabase } from '../config/supabaseConfig'

/**
 * 根据域名获取SSO提供商
 */
export async function getSSOProviderByDomain(domain: string) {
  const { data, error } = await supabase
    .from('domain_sso_mappings')
    .select(`
      domain,
      enabled,
      sso_providers:sso_provider_id (
        id, 
        name, 
        protocol, 
        settings,
        client_id,
        metadata_url,
        enabled
      )
    `)
    .eq('domain', domain)
    .eq('enabled', true)
    .single()

  if (error) return null
  
  // 检查SSO提供商是否启用
  if (!data.enabled || !data.sso_providers.enabled) return null
  
  return data.sso_providers
}

/**
 * 从邮箱中提取域名
 */
export function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([^@]+)$/)
  if (!match) return null
  return match[1].toLowerCase()
}

/**
 * 获取身份认证设置
 */
export async function getAuthSettings() {
  const { data, error } = await supabase
    .from('auth_settings')
    .select('*')
    .single()
  
  if (error) {
    console.error('获取认证设置出错:', error)
    // 返回默认设置
    return {
      allow_email_registration: false,
      allow_phone_registration: false,
      allow_password_login: true,
      require_email_verification: true,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: false
      }
    }
  }
  
  return data
}

/**
 * 初始化SSO登录流程
 */
export async function initiateSSOLogin(
  providerId: string,
  redirectUrl: string
) {
  const { data, error } = await supabase
    .from('sso_providers')
    .select('*')
    .eq('id', providerId)
    .eq('enabled', true)
    .single()
  
  if (error || !data) {
    throw new Error('SSO提供商配置不存在或已禁用')
  }
  
  // 根据不同的协议类型，生成不同的SSO登录URL
  // 注意：实际的实现会更复杂，需要根据不同的SSO提供商类型生成正确的URL和参数
  switch (data.protocol) {
    case 'OAuth2':
      // 构建OAuth2授权URL
      const params = new URLSearchParams({
        client_id: data.client_id,
        redirect_uri: redirectUrl,
        response_type: 'code',
        scope: 'openid email profile'
      })
      
      // 这里假设settings中包含了authorization_endpoint
      const authorizationEndpoint = data.settings.authorization_endpoint
      return `${authorizationEndpoint}?${params.toString()}`
      
    case 'SAML':
      // SAML会有不同的处理方式，通常需要后端生成SAML请求
      // 这里只是示例接口
      return `/api/auth/saml/login?provider_id=${providerId}&redirect_url=${encodeURIComponent(redirectUrl)}`
      
    case 'OIDC':
      // OpenID Connect流程，类似OAuth2但有一些标准化的端点
      const oidcParams = new URLSearchParams({
        client_id: data.client_id,
        redirect_uri: redirectUrl,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'login'
      })
      
      return `${data.metadata_url}?${oidcParams.toString()}`
      
    default:
      throw new Error(`不支持的SSO协议: ${data.protocol}`)
  }
}

/**
 * 更新用户SSO信息
 */
export async function updateUserSSOInfo(
  userId: string,
  ssoProviderId: string,
  authSource: string = 'sso'
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      sso_provider_id: ssoProviderId,
      auth_source: authSource,
      last_login: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (error) throw error
} 