import { supabase } from '@lib/config/supabaseConfig'

/**
 * 注册新用户
 */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  
  if (error) throw error
  return data
}

/**
 * 用邮箱密码登录
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

/**
 * 退出登录
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

/**
 * 重置密码
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) throw error
}

/**
 * 修改密码
 */
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) throw error
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(fullName: string, avatarUrl?: string) {
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  })
  
  if (error) throw error
} 