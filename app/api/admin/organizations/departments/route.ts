import { NextResponse } from 'next/server'
import { createClient } from '@lib/supabase/server'

// --- BEGIN COMMENT ---
// 获取部门信息列表
// --- END COMMENT ---
export async function GET() {
  try {
    const supabase = await createClient()
    
    // --- 检查用户权限 ---
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // --- 检查是否为管理员 ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // --- 调用数据库函数获取部门信息 ---
    const { data: departments, error } = await supabase
      .rpc('get_org_department_info')

    if (error) {
      console.error('获取部门信息失败:', error)
      return NextResponse.json({ error: '获取部门信息失败' }, { status: 500 })
    }

    return NextResponse.json({ 
      departments: departments || [],
      success: true 
    })

  } catch (error) {
    console.error('部门信息API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 