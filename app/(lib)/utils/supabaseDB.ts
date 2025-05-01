import { supabase } from '../config/supabaseConfig'

/**
 * 获取用户资料
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) throw error
  return data
}

/**
 * 更新用户最后登录时间
 */
export async function updateLastLogin(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
    
  if (error) throw error
}

/**
 * 获取用户组织
 */
export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('org_members')
    .select(`
      role,
      organizations:org_id (
        id,
        name,
        logo_url,
        settings
      )
    `)
    .eq('user_id', userId)
    
  if (error) throw error
  return data
}

/**
 * 创建新组织
 */
export async function createOrganization(name: string, logoUrl?: string) {
  // 1. 创建组织
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert([{ name, logo_url: logoUrl }])
    .select()
    .single()
    
  if (orgError) throw orgError
  
  // 2. 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')
  
  // 3. 将当前用户添加为组织所有者
  const { error: memberError } = await supabase
    .from('org_members')
    .insert([{
      org_id: org.id,
      user_id: user.id,
      role: 'owner'
    }])
    
  if (memberError) throw memberError
  
  return org
}

/**
 * 获取AI配置列表
 */
export async function getAIConfigs(orgId: string) {
  const { data, error } = await supabase
    .from('ai_configs')
    .select('*')
    .eq('org_id', orgId)
    .eq('enabled', true)
    
  if (error) throw error
  return data
}

/**
 * 创建或更新AI配置
 */
export async function upsertAIConfig(config: {
  id?: string
  org_id: string
  provider: string
  app_id?: string
  api_key: string
  api_url: string
  settings?: any
  enabled?: boolean
}) {
  const { data, error } = await supabase
    .from('ai_configs')
    .upsert([config])
    .select()
    .single()
    
  if (error) throw error
  return data
}

/**
 * 获取对话列表
 */
export async function getConversations(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)
    
  if (error) throw error
  return data
}

/**
 * 创建新对话
 */
export async function createConversation(params: {
  user_id: string
  org_id?: string
  ai_config_id?: string
  title: string
  summary?: string
  settings?: any
}) {
  const { data, error } = await supabase
    .from('conversations')
    .insert([params])
    .select()
    .single()
    
  if (error) throw error
  return data
}

/**
 * 获取对话消息
 */
export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)
    
  if (error) throw error
  return data
}

/**
 * 创建新消息
 */
export async function createMessage(params: {
  conversation_id: string
  user_id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: any
  status?: 'sent' | 'delivered' | 'error'
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert([params])
    .select()
    .single()
    
  if (error) throw error
  
  // 更新对话的更新时间
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.conversation_id)
    
  return data
}

/**
 * 记录API调用日志
 */
export async function logApiCall(params: {
  user_id?: string
  conversation_id?: string
  provider: string
  endpoint: string
  request: any
  response: any
  status_code: number
  latency_ms: number
}) {
  const { error } = await supabase
    .from('api_logs')
    .insert([params])
    
  if (error) console.error('Failed to log API call:', error)
}

/**
 * 获取/设置用户偏好
 */
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = 没有找到记录
  
  return data || { user_id: userId, theme: 'light', language: 'zh-CN' }
}

export async function updateUserPreferences(userId: string, preferences: {
  theme?: string
  language?: string
  notification_settings?: any
  ai_preferences?: any
}) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([{
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
    
  if (error) throw error
  return data
} 