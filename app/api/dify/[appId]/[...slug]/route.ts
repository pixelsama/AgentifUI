// app/api/dify/[appId]/[...slug]/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { getDifyAppConfig } from '@/(lib)/config/difyConfig';

// 定义路由参数的接口
interface DifyApiParams {
  appId: string;
  slug: string[];
}

// --- 核心辅助函数：执行到 Dify 的代理请求 ---
async function proxyToDify(
  req: NextRequest, // 原始 Next.js 请求对象
  context: { params: DifyApiParams } // 解构出路由参数
) {
  // 等待 params 解析完成后再访问其属性
  const params = await context.params;
  const appId = params.appId;
  const slug = params.slug;

  // 1. 获取特定 Dify 应用的配置
  console.log(`[App: ${appId}] [${req.method}] Attempting to get configuration...`);
  const difyConfig = await getDifyAppConfig(appId);

  // 2. 验证配置
  if (!difyConfig) {
    console.error(`[App: ${appId}] [${req.method}] Configuration not found.`);
    // 返回 400 Bad Request，表明客户端提供的 appId 无效或未配置
    return NextResponse.json(
      { error: `Configuration for Dify app '${appId}' not found.` },
      { status: 400 }
    );
  }

  const { apiKey: difyApiKey, apiUrl: difyApiUrl } = difyConfig;

  // 再次检查获取到的 key 和 url 是否有效
  if (!difyApiKey || !difyApiUrl) {
     console.error(`[App: ${appId}] [${req.method}] Invalid configuration loaded (missing key or URL).`);
     // 返回 500 Internal Server Error，表明服务器端配置问题
     return NextResponse.json({ error: `Server configuration error for app '${appId}'.` }, { status: 500 });
  }
  console.log(`[App: ${appId}] [${req.method}] Configuration loaded successfully.`);

  try {
    // 3. 构造目标 Dify URL
    const slugPath = slug.join('/');
    const targetUrl = `${difyApiUrl}/${slugPath}${req.nextUrl.search}`;
    console.log(`[App: ${appId}] [${req.method}] Proxying request to target URL: ${targetUrl}`);

    // 4. 准备转发请求头
    const headers = new Headers();
    // 只复制必要的请求头
    if (req.headers.get('Content-Type')) {
      headers.set('Content-Type', req.headers.get('Content-Type')!);
    }
    if (req.headers.get('Accept')) {
      headers.set('Accept', req.headers.get('Accept')!);
    }
    // 添加 Dify 认证头
    headers.set('Authorization', `Bearer ${difyApiKey}`);
    // 可以根据需要添加其他固定请求头

    // 5. 执行 fetch 请求转发
    // 准备 fetch 选项
    const fetchOptions: RequestInit & { duplex: 'half' } = {
        method: req.method,
        headers: headers,
        // GET/HEAD 请求 body 为 null
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
        redirect: 'manual',
        cache: 'no-store',
        // 【重要】添加 duplex 选项并使用类型断言解决 TS(2769)
        duplex: 'half'
    };

    const response = await fetch(targetUrl, fetchOptions as any); // 使用 as any 简化，或者用上面的交叉类型
    console.log(`[App: ${appId}] [${req.method}] Dify response status: ${response.status}`);

    // 6. 处理并转发 Dify 的响应
    const responseHeaders = new Headers(response.headers);
    // 设置 CORS 头 (生产环境应更严格)
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理流式响应
    if (response.ok && response.body && response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log(`[App: ${appId}] [${req.method}] Streaming response detected.`);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } else {
      // 处理非流式响应
      const responseData = await response.text();
      try {
        const jsonData = JSON.parse(responseData);
        return NextResponse.json(jsonData, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (parseError) {
         // 非 JSON，返回文本
         const textResponseHeaders = new Headers(response.headers);
         textResponseHeaders.set('Access-Control-Allow-Origin', '*');
         if (!textResponseHeaders.has('Content-Type')) {
            textResponseHeaders.set('Content-Type', 'text/plain');
         }
         return new Response(responseData, {
             status: response.status,
             statusText: response.statusText,
             headers: textResponseHeaders,
         });
      }
    }
  } catch (error: any) {
    // 捕获 fetch 或响应处理中的错误
    console.error(`[App: ${appId}] [${req.method}] Dify proxy fetch/processing error:`, error);
    return NextResponse.json(
      { error: `Failed to connect or process response from Dify service for app '${appId}' during ${req.method}.`, details: error.message },
      { status: 502 } // 502 Bad Gateway
    );
  }
}

// --- 导出对应 HTTP 方法的处理函数 ---
// 直接将 proxyToDify 赋给需要支持的方法

export {
    proxyToDify as GET,
    proxyToDify as POST,
    proxyToDify as PUT,
    proxyToDify as DELETE,
    proxyToDify as PATCH
    // OPTIONS 通常由 Next.js 或 Vercel 自动处理 CORS 预检，但如果需要自定义可以添加
};