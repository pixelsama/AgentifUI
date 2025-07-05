// 统一的CORS配置系统
// 整个项目只有一个CORS配置，通过环境变量控制允许的域名
export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

// 默认的CORS配置
const DEFAULT_CORS_CONFIG: Omit<CorsConfig, 'allowedOrigins'> = {
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  credentials: true,
  maxAge: 86400, // 24小时
};

// 获取允许的域名列表
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

  // 去重并过滤空值
  return [...new Set(origins)].filter(Boolean);
}

// 获取开发环境默认域名
// 完全基于环境变量，无硬编码
function getDevOrigins(): string[] {
  const origins: string[] = [];

  // 开发环境允许的域名可以通过环境变量配置
  if (process.env.DEV_ALLOWED_ORIGINS) {
    const devOrigins = process.env.DEV_ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...devOrigins);
  }

  // 如果有NEXT_PUBLIC_APP_URL，也添加到允许列表
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // 去重
  return [...new Set(origins)];
}

// 检查域名是否被允许
function isOriginAllowed(
  requestOrigin: string | null,
  allowedOrigins: string[]
): string | null {
  if (!requestOrigin) {
    return null;
  }

  // 精确匹配
  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // 通配符匹配 (*.example.com)
  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2);
      if (requestOrigin.endsWith(`.${domain}`) || requestOrigin === domain) {
        return requestOrigin;
      }
    }
  }

  return null;
}

// 获取CORS配置
export function getCorsConfig(): CorsConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  let allowedOrigins = getAllowedOrigins();

  // 开发环境：如果没有配置域名，使用默认的本地域名
  if (isDevelopment && allowedOrigins.length === 0) {
    allowedOrigins = getDevOrigins();
  }

  // 生产环境：如果没有配置域名，记录警告
  if (!isDevelopment && allowedOrigins.length === 0) {
    console.warn('[CORS] ⚠️ 生产环境未配置允许的域名，将拒绝所有跨域请求');
  }

  return {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins,
  };
}

// 创建CORS响应头
export function createCorsHeaders(requestOrigin: string | null): Headers {
  const config = getCorsConfig();
  const headers = new Headers();

  // 检查请求来源是否被允许
  const allowedOrigin = isOriginAllowed(requestOrigin, config.allowedOrigins);

  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);

    if (config.credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));

  if (config.exposedHeaders.length > 0) {
    headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', ')
    );
  }

  headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return headers;
}

// 处理CORS预检请求
export function handleCorsPreflightRequest(request: Request): Response {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 为API响应添加CORS头的统一函数
export function withCorsHeaders(
  response: Response,
  request: Request
): Response {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin);

  // 复制现有响应头并添加CORS头
  const newHeaders = new Headers(response.headers);
  corsHeaders.forEach((value, key) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
