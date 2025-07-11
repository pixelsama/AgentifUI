/**
 * 重定向URL验证工具
 * 基于项目现有的CORS配置模式，确保重定向URL的安全性
 */

/**
 * 验证重定向URL是否安全
 * 使用与CORS配置相同的域名验证逻辑
 * @param redirectUrl - 要验证的重定向URL
 * @param baseUrl - 基础URL（用于相对路径解析）
 * @returns 验证后的安全URL，如果无效则返回默认URL
 */
export function validateRedirectUrl(
  redirectUrl: string,
  baseUrl: string,
  defaultUrl: string = '/chat/new'
): string {
  // 如果没有重定向URL，返回默认URL
  if (!redirectUrl || redirectUrl.trim() === '') {
    return defaultUrl;
  }

  try {
    // 获取允许的域名列表
    const allowedOrigins = getAllowedOrigins();

    // 尝试解析URL
    const parsedUrl = new URL(redirectUrl, baseUrl);

    // 检查是否是相对路径（同域）
    if (parsedUrl.origin === new URL(baseUrl).origin) {
      return redirectUrl;
    }

    // 检查是否在允许的域名列表中
    if (isOriginAllowed(parsedUrl.origin, allowedOrigins)) {
      return redirectUrl;
    }

    // 不在允许列表中，返回默认URL
    console.warn(
      `[Redirect Validation] Blocked redirect to unauthorized domain: ${parsedUrl.origin}`
    );
    return defaultUrl;
  } catch (error) {
    // URL解析失败，返回默认URL
    console.warn(
      `[Redirect Validation] Invalid redirect URL: ${redirectUrl}`,
      error
    );
    return defaultUrl;
  }
}

/**
 * 获取允许的域名列表
 * 复用项目现有的域名配置逻辑
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // 添加应用主域名
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // 添加额外允许的域名
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...additionalOrigins);
  }

  // 开发环境额外域名
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEV_ALLOWED_ORIGINS
  ) {
    const devOrigins = process.env.DEV_ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...devOrigins);
  }

  // 去重并过滤空值
  return [...new Set(origins)].filter(Boolean);
}

/**
 * 检查域名是否被允许
 * 复用项目现有的域名验证逻辑
 */
function isOriginAllowed(
  requestOrigin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!requestOrigin) {
    return false;
  }

  // 精确匹配
  if (allowedOrigins.includes(requestOrigin)) {
    return true;
  }

  // 通配符匹配 (*.example.com)
  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2);
      if (requestOrigin.endsWith(`.${domain}`) || requestOrigin === domain) {
        return true;
      }
    }
  }

  return false;
}
