import { createClient } from '@supabase/supabase-js'

// 这些值应该来自环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端客户端（使用service_role密钥的客户端，具有更高权限）
// 注意：仅在服务器端API路由中使用此客户端
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(supabaseUrl, serviceRoleKey)
} 