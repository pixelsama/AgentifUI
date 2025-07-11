// SSO登录API
// 为已验证的SSO用户建立Supabase会话
// 添加请求去重逻辑和改善的错误处理
import { createAdminClient } from '@lib/supabase/server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// 简单的内存缓存，用于防止短时间内的重复请求
// 在生产环境中，建议使用Redis等持久化缓存
const processingRequests = new Map<string, Promise<NextResponse>>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestData;

  try {
    requestData = await request.json();
    const { userEmail, ssoUserData } = requestData;

    // 🔒 Security: Read sensitive data from httpOnly cookie
    const cookieStore = await cookies();
    const secureCookie = cookieStore.get('sso_user_data_secure');

    if (!secureCookie) {
      return NextResponse.json(
        { message: 'SSO安全数据不存在或已过期' },
        { status: 401 }
      );
    }

    let sensitiveData;
    try {
      sensitiveData = JSON.parse(secureCookie.value);
    } catch (error) {
      return NextResponse.json(
        { message: 'SSO安全数据格式错误' },
        { status: 401 }
      );
    }

    // Check if SSO data has expired
    if (sensitiveData.expiresAt < Date.now()) {
      return NextResponse.json(
        { message: 'SSO登录数据已过期，请重新登录' },
        { status: 401 }
      );
    }

    // Reconstruct complete SSO user data from secure cookie and request
    const completeSsoUserData = {
      ...sensitiveData,
      ...ssoUserData,
    };

    const userId = sensitiveData.userId;

    if (!userId || !userEmail || !completeSsoUserData) {
      return NextResponse.json(
        { message: 'SSO登录数据不完整' },
        { status: 400 }
      );
    }

    // 创建请求唯一标识，防止重复处理同一用户的并发请求
    const requestKey = `sso-signin-${userId}-${sensitiveData.loginTime}`;

    // 检查是否有相同的请求正在处理中
    if (processingRequests.has(requestKey)) {
      console.log(
        `Duplicate SSO signin request detected for user: ${userId}, waiting for existing request...`
      );

      try {
        // 等待现有请求完成
        const existingResponse = await processingRequests.get(requestKey);
        console.log(
          `Returning result from existing request for user: ${userId}`
        );
        return existingResponse;
      } catch (error) {
        console.log(
          `Existing request failed for user: ${userId}, proceeding with new request`
        );
        // 如果现有请求失败，清理缓存并继续处理新请求
        processingRequests.delete(requestKey);
      }
    }

    // 创建处理函数并添加到缓存中
    const processRequest = async (): Promise<NextResponse> => {
      try {
        // 验证SSO数据是否过期
        if (Date.now() > completeSsoUserData.expiresAt) {
          return NextResponse.json(
            { message: 'SSO会话已过期' },
            { status: 401 }
          );
        }

        // 使用Admin客户端为SSO用户生成会话
        const adminSupabase = await createAdminClient();

        // 验证用户是否存在于Supabase并获取实际邮箱
        const { data: user, error: userError } =
          await adminSupabase.auth.admin.getUserById(userId);

        if (userError || !user) {
          console.error('SSO user not found in Supabase:', userError);
          return NextResponse.json({ message: '用户不存在' }, { status: 404 });
        }

        // 使用数据库中实际存储的邮箱地址，而不是URL参数传递的邮箱
        // 这解决了邮箱不匹配导致的认证失败问题
        const actualUserEmail = user.user.email || userEmail;
        if (!actualUserEmail) {
          console.error('No email found for user:', userId);
          return NextResponse.json(
            { message: '用户邮箱信息缺失' },
            { status: 400 }
          );
        }
        console.log(
          `Creating session for SSO user: ${userId}, URL email: ${userEmail}, actual email: ${actualUserEmail}`
        );

        // 使用优化的临时密码方法创建会话
        // 这是最可靠和简单的方法
        try {
          console.log('Creating session using temporary password method...');

          // 生成更强的临时密码
          const tempPassword = `SSO_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

          // 更新用户密码（临时）
          const { error: updateError } =
            await adminSupabase.auth.admin.updateUserById(userId, {
              password: tempPassword,
            });

          if (updateError) {
            console.error('Failed to set temporary password:', updateError);
            return NextResponse.json(
              { message: '临时密码设置失败' },
              { status: 500 }
            );
          }

          // 等待一小段时间确保密码更新生效
          await new Promise(resolve => setTimeout(resolve, 100));

          // 使用临时密码和实际邮箱进行登录获取会话
          const { data: signInData, error: signInError } =
            await adminSupabase.auth.signInWithPassword({
              email: actualUserEmail,
              password: tempPassword,
            });

          if (signInError || !signInData.session) {
            console.error(
              'Failed to sign in with temporary password:',
              signInError
            );
            return NextResponse.json(
              { message: '会话创建失败' },
              { status: 500 }
            );
          }

          // 立即清理临时密码
          try {
            await adminSupabase.auth.admin.updateUserById(userId, {
              password: undefined,
            });
          } catch (cleanupError) {
            console.warn('Failed to cleanup temporary password:', cleanupError);
          }

          const processingTime = Date.now() - startTime;
          console.log(
            `[SSO认证] SSO signin successful for user: ${userId} (processing time: ${processingTime}ms)`
          );

          // SSO登录成功，返回结果
          // 注意：前端缓存清理已在SSO按钮组件中处理
          return NextResponse.json({
            success: true,
            session: signInData.session,
            message: 'SSO登录成功',
          });
        } catch (authError) {
          console.error('Authentication error:', authError);
          return NextResponse.json(
            {
              message: `认证失败: ${authError instanceof Error ? authError.message : '未知错误'}`,
            },
            { status: 500 }
          );
        }
      } finally {
        // 处理完成后清理缓存（延迟清理防止竞争条件）
        setTimeout(() => {
          processingRequests.delete(requestKey);
        }, 1000);
      }
    };

    // 将处理函数添加到缓存并执行
    const requestPromise = processRequest();
    processingRequests.set(requestKey, requestPromise);

    return await requestPromise;
  } catch (error) {
    console.error('SSO signin failed:', error);

    // 在发生错误时清理可能的缓存条目
    // Note: Error handling may not have access to sensitiveData, so we try to construct the key from cookie
    try {
      const cookieStore = await cookies();
      const secureCookie = cookieStore.get('sso_user_data_secure');
      if (secureCookie) {
        const sensitiveData = JSON.parse(secureCookie.value);
        const requestKey = `sso-signin-${sensitiveData.userId}-${sensitiveData.loginTime}`;
        processingRequests.delete(requestKey);
      }
    } catch (cleanupError) {
      console.warn(
        'Failed to cleanup processing cache on error:',
        cleanupError
      );
    }

    return NextResponse.json(
      {
        message: `登录失败: ${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
